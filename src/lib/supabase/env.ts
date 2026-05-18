const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function getSupabaseConfig() {
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    throw new Error(
      'Supabase yapılandırması eksik. .env dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlayın.',
    )
  }

  return {
    url: supabaseUrl.trim(),
    anonKey: supabaseAnonKey.trim(),
  }
}
