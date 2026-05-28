import type { User } from '@supabase/supabase-js'

/** `profiles` tablosu — Supabase şemasıyla uyumlu. */
export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  city: string | null
  role: string | null
  bio: string | null
  created_at?: string
  updated_at?: string
}

export type ProfileRow = Profile

export type ProfileFormValues = {
  full_name: string
  city: string
  role: string
  bio: string
}

export type ProfileUpdateInput = {
  full_name: string
  city: string
  role: string
  bio: string
}

export type UseProfileResult = {
  profile: Profile | null
  user: User | null
  displayName: string
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
