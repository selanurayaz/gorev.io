import { useMemo } from 'react'

import { getTurkishCityOptions } from '@/lib/cities'

import {
  ComboboxField,
  type ComboboxFieldProps,
} from '@/components/ui/ComboboxField'

export type CitySelectFieldProps = Omit<
  ComboboxFieldProps,
  'options' | 'searchable'
> & {
  /** Filtrelerde “tüm şehirler” için boş seçim anlamına gelir (placeholder). */
  allowEmpty?: boolean
}

export function CitySelectField({
  label = 'Şehir',
  placeholder = 'İl seçin…',
  searchPlaceholder = 'İl ara…',
  emptyMessage = 'Bu aramayla eşleşen il bulunamadı.',
  allowEmpty = false,
  required,
  ...props
}: CitySelectFieldProps) {
  const options = useMemo(() => getTurkishCityOptions(), [])

  return (
    <ComboboxField
      label={label}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      searchable
      required={allowEmpty ? false : required}
      hint={
        props.hint ??
        (allowEmpty
          ? undefined
          : 'Listeden il seçin; veriler tutarlı kalır.')
      }
      {...props}
    />
  )
}
