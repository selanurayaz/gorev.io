import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeCategoryRow } from '@/lib/category-mapper'
import {
  formatCategoryFetchError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'
import type { ServiceCategory } from '@/types/category'

export type FetchCategoriesResult = {
  categories: ServiceCategory[]
  error: string | null
}

type OrderColumn = 'sort_order' | 'name' | 'title'

async function queryCategories(
  orderBy: OrderColumn,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order(orderBy, { ascending: true })

  if (error) {
    return { rows: [], error }
  }

  if (!Array.isArray(data)) {
    return { rows: [], error: null }
  }

  return {
    rows: data.filter(
      (row): row is Record<string, unknown> =>
        row !== null && typeof row === 'object',
    ),
    error: null,
  }
}

/** Aktif kategorileri Supabase `categories` tablosundan getirir. */
export async function fetchCategories(): Promise<FetchCategoriesResult> {
  const orderCandidates: OrderColumn[] = ['sort_order', 'name', 'title']
  let lastError: PostgrestError | null = null

  for (const orderBy of orderCandidates) {
    const { rows, error } = await queryCategories(orderBy)

    if (!error) {
      const categories = rows
        .map((row) => normalizeCategoryRow(row))
        .filter((row): row is ServiceCategory => row !== null)

      if (import.meta.env.DEV) {
        console.info('[categories] loaded', { count: categories.length, orderBy })
      }

      return { categories, error: null }
    }

    lastError = error
    logSupabaseError('fetchCategories', error, { orderBy })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    const { data, error } = await supabase.from('categories').select('*')

    if (!error && Array.isArray(data)) {
      const categories = data
        .filter(
          (row): row is Record<string, unknown> =>
            row !== null && typeof row === 'object',
        )
        .map((row) => normalizeCategoryRow(row))
        .filter((row): row is ServiceCategory => row !== null)
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'))

      return { categories, error: null }
    }

    return {
      categories: [],
      error: formatCategoryFetchError(lastError),
    }
  }

  return { categories: [], error: null }
}
