import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatRelativeTime } from '@/lib/activityCenter'
import { cn } from '@/lib/utils'

export function NotificationsMenu() {
  const token = useAuthStore((s) => s.token)
  const notifications = useWorkspaceStore((s) => s.notifications)
  const readNotification = useWorkspaceStore((s) => s.readNotification)
  const readAllNotifications = useWorkspaceStore((s) => s.readAllNotifications)
  const [open, setOpen] = useState(false)

  if (!token) return null

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <p className="text-sm font-medium">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => void readAllNotifications()}
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No notifications yet
                </li>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'border-b border-border/40 px-3 py-2.5 text-sm last:border-0',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        void readNotification(n.id)
                        setOpen(false)
                      }}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </button>
                    {n.href && (
                      <Link
                        to={n.href}
                        className="mt-1 inline-block text-xs text-primary hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        View
                      </Link>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
