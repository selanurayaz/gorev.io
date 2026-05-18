import type { User } from '@supabase/supabase-js'

/** `profiles` tablosu — Supabase şemasıyla uyumlu. */
export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  created_at?: string
  updated_at?: string
}

export type ProfileRow = Profile

export type UseProfileResult = {
  profile: Profile | null
  user: User | null
  displayName: string
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
