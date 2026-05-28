import { isTurkishCityName } from '@/lib/cities'
import type { TaskCreateInput, TaskFormValues } from '@/types/task'

export const emptyTaskForm: TaskFormValues = {
  title: '',
  description: '',
  category_id: '',
  city: '',
  budget_min: '',
  budget_max: '',
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>

function parseBudget(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) return null
  return num
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {}

  const title = values.title.trim()
  if (!title) {
    errors.title = 'Görev başlığı gerekli.'
  } else if (title.length < 5) {
    errors.title = 'Başlık en az 5 karakter olmalı.'
  }

  const description = values.description.trim()
  if (!description) {
    errors.description = 'Açıklama gerekli.'
  } else if (description.length < 20) {
    errors.description = 'Açıklama en az 20 karakter olmalı.'
  }

  if (!values.category_id) {
    errors.category_id = 'Kategori seçin.'
  }

  if (!values.city.trim()) {
    errors.city = 'Şehir seçin.'
  } else if (!isTurkishCityName(values.city)) {
    errors.city = 'Listeden geçerli bir il seçin.'
  }

  const budgetMin = parseBudget(values.budget_min)
  const budgetMax = parseBudget(values.budget_max)

  if (budgetMin === null) {
    errors.budget_min = 'Geçerli bir minimum bütçe girin.'
  }

  if (budgetMax === null) {
    errors.budget_max = 'Geçerli bir maksimum bütçe girin.'
  }

  if (budgetMin !== null && budgetMax !== null && budgetMax < budgetMin) {
    errors.budget_max = 'Maksimum bütçe, minimumdan küçük olamaz.'
  }

  return errors
}

export function taskFormToCreateInput(
  values: TaskFormValues,
): TaskCreateInput | null {
  const errors = validateTaskForm(values)
  if (Object.keys(errors).length > 0) return null

  const budgetMin = Number(values.budget_min.trim().replace(',', '.'))
  const budgetMax = Number(values.budget_max.trim().replace(',', '.'))

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category_id: values.category_id,
    city: values.city.trim(),
    budget_min: budgetMin,
    budget_max: budgetMax,
  }
}
