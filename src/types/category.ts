/** `categories` tablosu — Supabase şemasıyla uyumlu. */
export type ServiceCategory = {
  id: string
  name: string
  slug: string | null
  sort_order?: number | null
}
