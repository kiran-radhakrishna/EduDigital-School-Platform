import type { CalendarEventItem } from '../../types/events'

const EVENT_TYPE_COLORS: Record<CalendarEventItem['type'], string> = {
  school_event: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  registered_event: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  exam: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  assignment_deadline: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  holiday: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
}

interface EventCalendarStripProps {
  items: CalendarEventItem[]
}

export function EventCalendarStrip({ items }: EventCalendarStripProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-gray-100 p-3 dark:border-gray-700"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(item.date).toLocaleDateString()}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${EVENT_TYPE_COLORS[item.type]}`}>
              {item.type.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
