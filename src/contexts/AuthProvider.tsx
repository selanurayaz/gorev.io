import type { Session, User } from '@supabase/supabase-js'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { mapAuthError } from '@/lib/auth-errors'
import { supabase } from '@/lib/supabase/client'
import type { AuthActionResult, SignUpParams, SignUpResult } from '@/types/auth'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        console.error('[auth] getSession', error.message)
      }
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      return { error: error ? mapAuthError(error) : null }
    },
    [],
  )

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
    }: SignUpParams): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (error) {
        return { error: mapAuthError(error), needsEmailConfirmation: false }
      }

      const needsEmailConfirmation = !data.session
      return { error: null, needsEmailConfirmation }
    },
    [],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[auth] signOut', error.message)
    }
  }, [])

  const resetPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const redirectTo = `${window.location.origin}/sifremi-unuttum`
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      )
      return { error: error ? mapAuthError(error) : null }
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [session, user, isLoading, signIn, signUp, signOut, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
