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

function mapCategories(rows: Record<string, unknown>[]): ServiceCategory[] {
  return rows
    .map((row) => normalizeCategoryRow(row))
    .filter((row): row is ServiceCategory => row !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

/** Aktif kategorileri Supabase `categories` tablosundan getirir. */
export async function fetchCategories(): Promise<FetchCategoriesResult> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (!error) {
    return { categories: mapCategories(toRows(data)), error: null }
  }

  if (!isPostgrestSchemaError(error)) {
    logSupabaseError('fetchCategories', error)
    return {
      categories: [],
      error: formatCategoryFetchError(error),
    }
  }

  const fallback = await supabase.from('categories').select('*')

  if (!fallback.error) {
    return { categories: mapCategories(toRows(fallback.data)), error: null }
  }

  logSupabaseError('fetchCategories.fallback', fallback.error)
  return {
    categories: [],
    error: formatCategoryFetchError(fallback.error),
  }
}
