import { AcceptedWorkCard } from '@/components/my-tasks/AcceptedWorkCard'
import type { AcceptedWorkItem } from '@/types/offer'

type AcceptedWorkListProps = {
  items: AcceptedWorkItem[]
}

export function AcceptedWorkList({ items }: AcceptedWorkListProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <AcceptedWorkCard item={item} />
        </li>
      ))}
    </ul>
  )
}
