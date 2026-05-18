import { createClient } from '@supabase/supabase-js'

import { getSupabaseConfig } from '@/lib/supabase/env'

const { url, anonKey } = getSupabaseConfig()

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
