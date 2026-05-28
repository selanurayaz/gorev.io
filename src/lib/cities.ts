import { TURKISH_CITIES, type TurkishCity, type TurkishCityName } from '@/data/turkish-cities'
import type { ComboboxOption } from '@/components/ui/ComboboxField'

const cityByNormalizedName = new Map<string, TurkishCity>()
const cityBySlug = new Map<string, TurkishCity>()

for (const city of TURKISH_CITIES) {
  cityByNormalizedName.set(normalizeCityKey(city.name), city)
  cityBySlug.set(city.slug, city)
}

/** Karşılaştırma ve arama için normalize edilmiş anahtar. */
export function normalizeCityKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
}

/** Serbest metni kanonik il adına çevirir (eşleşmezse `null`). */
export function resolveTurkishCityName(
  input: string | null | undefined,
): string | null {
  if (!input?.trim()) return null

  const key = normalizeCityKey(input)
  const direct = cityByNormalizedName.get(key)
  if (direct) return direct.name

  const slugMatch = cityBySlug.get(key.replace(/\s+/g, '-'))
  if (slugMatch) return slugMatch.name

  return null
}

export function isTurkishCityName(value: string): value is TurkishCityName {
  return resolveTurkishCityName(value) !== null
}

export function getTurkishCityOptions(): ComboboxOption[] {
  return TURKISH_CITIES.map((city) => ({
    value: city.name,
    label: city.name,
  }))
}

export function formatCityLabel(
  value: string | null | undefined,
): string {
  if (!value?.trim()) return 'Şehir belirtilmedi'
  return resolveTurkishCityName(value) ?? value.trim()
}
