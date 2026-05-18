import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { ProfileContext } from '@/contexts/profile-context'
import { useAuth } from '@/hooks/useAuth'
import { getProfileDisplayName } from '@/lib/profile-display'
import { fetchProfileByUserId } from '@/services/profiles'
import type { Profile, UseProfileResult } from '@/types/profile'

type ProfileProviderProps = {
  children: ReactNode
}

function useProfileState(): UseProfileResult {
  const { user, isLoading: authLoading } = useAuth()
  const userId = user?.id

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async (id: string) => {
    setIsFetching(true)
    setError(null)

    const { profile: row, error: fetchError } = await fetchProfileByUserId(id)

    setProfile(row)
    setError(fetchError)
    setIsFetching(false)
  }, [])

  const refetch = useCallback(async () => {
    if (!userId) return
    await loadProfile(userId)
  }, [userId, loadProfile])

  useEffect(() => {
    if (authLoading || !userId) return

    let cancelled = false

    void (async () => {
      setIsFetching(true)
      setError(null)
      const { profile: row, error: fetchError } = await fetchProfileByUserId(userId)
      if (cancelled) return
      setProfile(row)
      setError(fetchError)
      setIsFetching(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId, authLoading])

  const activeProfile = userId ? profile : null
  const activeError = userId ? error : null

  return {
    profile: activeProfile,
    user,
    displayName: getProfileDisplayName(activeProfile, user),
    isLoading: authLoading || (!!userId && isFetching),
    error: activeError,
    refetch,
  }
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const value = useProfileState()
  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}
