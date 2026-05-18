import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type SignUpParams = {
  email: string
  password: string
  fullName: string
}

export type AuthActionResult = {
  error: string | null
}

export type SignUpResult = AuthActionResult & {
  needsEmailConfirmation: boolean
}
