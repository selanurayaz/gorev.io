import { formatTaskCreatedAt } from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/message'

type MessageBubbleProps = {
  message: ChatMessage
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[min(88%,18rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[70%] sm:px-4',
          isOwn
            ? 'rounded-br-md bg-gorev-yellow-400/15 text-gorev-snow ring-1 ring-gorev-yellow-400/25'
            : 'rounded-bl-md border border-gorev-navy-700 bg-gorev-navy-900/80 text-gorev-snow',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <time
          className={cn(
            'mt-1.5 block text-[10px]',
            isOwn ? 'text-gorev-yellow-300/70' : 'text-gorev-muted',
          )}
          dateTime={message.created_at}
        >
          {formatTaskCreatedAt(message.created_at)}
        </time>
      </div>
    </div>
  )
}
