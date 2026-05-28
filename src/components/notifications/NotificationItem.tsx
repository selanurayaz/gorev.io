import { Link } from 'react-router-dom'

import {
  getNotificationTypeLabel,
  getNotificationTypeTone,
  notificationTypeBadgeStyles,
} from '@/lib/notification-display'
import { getNotificationHref } from '@/lib/notification-links'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types/notification'

type NotificationItemProps = {
  notification: AppNotification
  onRead: (id: string) => void
  compact?: boolean
}

export function NotificationItem({
  notification,
  onRead,
  compact = false,
}: NotificationItemProps) {
  const tone = getNotificationTypeTone(notification.type)
  const href = getNotificationHref(notification)

  function handleClick() {
    if (!notification.is_read) {
      void onRead(notification.id)
    }
  }

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={cn(
        'block border-b border-gorev-navy-800 px-4 py-3 transition last:border-b-0',
        notification.is_read
          ? 'hover:bg-gorev-navy-900/50'
          : 'bg-gorev-navy-900/40 hover:bg-gorev-navy-800/60',
        compact ? 'py-2.5' : 'py-3',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                notificationTypeBadgeStyles[tone],
              )}
            >
              {getNotificationTypeLabel(notification.type)}
            </span>
            {!notification.is_read ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-gorev-yellow-400" />
            ) : null}
          </div>
          <p className="text-sm font-medium text-gorev-snow">
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-gorev-muted">
            {notification.message}
          </p>
        </div>
        <time
          className="shrink-0 text-[11px] text-gorev-muted"
          dateTime={notification.created_at}
        >
          {formatTaskCreatedAt(notification.created_at)}
        </time>
      </div>
    </Link>
  )
}
