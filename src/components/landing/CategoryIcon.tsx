import type { ReactNode } from 'react'

import type { CategoryIconName } from '@/data/landing-content'

const icons: Record<CategoryIconName, ReactNode> = {
  sparkles: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
    />
  ),
  truck: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6.75m-9 0H3.375A1.125 1.125 0 0 1 2.25 15.75v-3.9A1.125 1.125 0 0 1 3.375 10.5h.75m0 0H9m-5.25 0V9.75c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v.75M8.25 18.75h4.5m-4.5 0a1.5 1.5 0 0 1-3 0m7.5 0a1.5 1.5 0 0 1-3 0M18 10.5h-2.25A2.25 2.25 0 0 0 13.5 8.25v-1.5m0 0V6A2.25 2.25 0 0 1 15.75 3.75h1.5A2.25 2.25 0 0 1 19.5 6v1.5m-6 0h6"
    />
  ),
  wrench: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 1 3.07-3.07l5.653 4.655M11.42 15.17l-1.49-1.49M3.75 3.75l1.5 1.5"
    />
  ),
  palette: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.53 16.13a6 6 0 1 0-8.47-8.47l4.12 4.12a1 1 0 0 0 1.41 0l1.47-1.47a1 1 0 0 0 0-1.41L4.3 4.3a6 6 0 0 0 8.24 8.24l.13-.13a1 1 0 0 0 .47-.83V14"
    />
  ),
  book: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 0 0 6.75 7.5v9.75a8.967 8.967 0 0 0 3 1.042 8.967 8.967 0 0 0 6 0 8.967 8.967 0 0 0 3-1.042V7.5a8.967 8.967 0 0 0-6-1.458Z"
    />
  ),
  leaf: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21c-4.97 0-9-4.03-9-9 0-6 9-12 9-12s9 6 9 12c0 4.97-4.03 9-9 9Zm0 0c2.34 0 4.24-2.01 4.24-4.5S14.34 12 12 12s-4.24 2.01-4.24 4.5S9.66 21 12 21Z"
    />
  ),
}

export function CategoryIcon({ name }: { name: CategoryIconName }) {
  return (
    <svg
      className="h-7 w-7 shrink-0 text-gorev-yellow-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      {icons[name]}
    </svg>
  )
}
