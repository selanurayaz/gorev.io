import { logSupabaseError } from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'

export type AuthSessionContext = {
  userId: string
  email: string | null
}

export async function getAuthSessionContext(): Promise<
  | { session: AuthSessionContext; error: null }
  | { session: null; error: string }
> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    logSupabaseError('getSession', sessionError)
    return {
      session: null,
      error: 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.',
    }
  }

  if (!session?.user) {
    return {
      session: null,
      error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
    }
  }

  return {
    session: {
      userId: session.user.id,
      email: session.user.email ?? null,
    },
    error: null,
  }
}
