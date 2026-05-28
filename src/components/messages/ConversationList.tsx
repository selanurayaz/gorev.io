import { cn } from '@/lib/utils'
import { formatTaskCreatedAt } from '@/lib/task-display'
import type { Conversation } from '@/types/message'

type ConversationListProps = {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <ul className="divide-y divide-gorev-navy-800">
      {conversations.map((conversation) => {
        const isActive = selectedId === conversation.id
        const preview = conversation.last_message ?? 'Henüz mesaj yok — yazın'

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation)}
              className={cn(
                'flex w-full flex-col gap-1 px-4 py-3.5 text-left transition',
                isActive
                  ? 'bg-gorev-navy-800/80'
                  : 'hover:bg-gorev-navy-900/60',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-gorev-snow">
                  {conversation.other_user_name ?? 'Kullanıcı'}
                </span>
                {conversation.last_message_at ? (
                  <time
                    className="shrink-0 text-[11px] text-gorev-muted"
                    dateTime={conversation.last_message_at}
                  >
                    {formatTaskCreatedAt(conversation.last_message_at)}
                  </time>
                ) : null}
              </div>
              <span className="text-xs text-gorev-green-400/90">
                {conversation.task_title}
              </span>
              <span className="line-clamp-2 text-sm text-gorev-muted">
                {preview}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
