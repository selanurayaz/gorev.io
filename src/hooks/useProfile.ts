import { useContext } from 'react'

import { ProfileContext } from '@/contexts/profile-context'
import type { UseProfileResult } from '@/types/profile'

export type { UseProfileResult }

export function useProfile(): UseProfileResult {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error(
      'useProfile yalnızca ProfileProvider içinde kullanılabilir.',
    )
  }
  return context
}
