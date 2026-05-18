import { createContext } from 'react'

import type { Session, User } from '@supabase/supabase-js'

import type {
  AuthActionResult,
  SignUpParams,
  SignUpResult,
} from '@/types/auth'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (params: SignUpParams) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthActionResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
