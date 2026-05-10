import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query — useful for mobile-first behavior
 * without duplicating breakpoint logic in JS.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
