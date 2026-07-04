import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useLanguage } from '../../hooks/useLanguage'
import { cn, formatDate } from '../../utils/helpers'
import type { Notification as AppNotification } from '../../types'

const initialNotifications: AppNotification[] = [
  { id: 'nt-1', title: 'Assignment graded', message: 'Your Computer Science project has been graded with 92/100.', type: 'success', read: false, createdAt: '2026-09-15T12:00:00.000Z' },
  { id: 'nt-2', title: 'Attendance reminder', message: 'You have been marked late twice this week. Please arrive before first period.', type: 'warning', read: false, createdAt: '2026-09-14T08:30:00.000Z' },
  { id: 'nt-3', title: 'New school announcement', message: 'The science fair schedule has been posted in the announcements board.', type: 'info', read: true, createdAt: '2026-09-13T10:15:00.000Z' },
  { id: 'nt-4', title: 'Fee reminder', message: 'Your semester activity fee is due by September 25.', type: 'error', read: false, createdAt: '2026-09-12T09:00:00.000Z' },
  { id: 'nt-5', title: 'Parent-teacher meeting', message: 'Booking slots for next week are now open in the portal.', type: 'info', read: true, createdAt: '2026-09-11T15:45:00.000Z' },
  { id: 'nt-6', title: 'Lab safety update', message: 'Please review the updated chemistry lab safety checklist before Thursday.', type: 'warning', read: true, createdAt: '2026-09-10T11:10:00.000Z' },
  { id: 'nt-7', title: 'Perfect attendance streak', message: 'Great job! You maintained full attendance for the last two weeks.', type: 'success', read: false, createdAt: '2026-09-09T14:20:00.000Z' },
  { id: 'nt-8', title: 'System maintenance', message: 'The student dashboard will be unavailable for 30 minutes tonight at 11 PM.', type: 'error', read: true, createdAt: '2026-09-08T18:00:00.000Z' },
]

const notificationStyles = {
  info: {
    icon: Info,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300',
  },
  success: {
    icon: CheckCircle,
    color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    color: 'text-rose-500 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300',
  },
} as const

export default function Notifications() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState(initialNotifications)

  const filteredNotifications = useMemo(
    () => notifications.filter((item) => (filter === 'all' ? true : !item.read)),
    [filter, notifications],
  )

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    toast.success('All notifications marked as read')
  }

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id && !item.read ? { ...item, read: true } : item)),
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.notifications}</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Stay up to date with important school activity.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {([
                ['all', t.common.all],
                ['unread', 'Unread'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    filter === value
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {filteredNotifications.map((notification) => {
            const config = notificationStyles[notification.type]
            const Icon = config.icon

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                  notification.read
                    ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/50'
                    : 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/70 dark:bg-indigo-950/20',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{notification.title}</h3>
                        {!notification.read && <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{formatDate(notification.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                  </div>
                </div>
              </button>
            )
          })}

          {filteredNotifications.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t.common.noData}</div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
