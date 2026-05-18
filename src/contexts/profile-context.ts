import { createContext } from 'react'

import type { UseProfileResult } from '@/types/profile'

export const ProfileContext = createContext<UseProfileResult | null>(null)
