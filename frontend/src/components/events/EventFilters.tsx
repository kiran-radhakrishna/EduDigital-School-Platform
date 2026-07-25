import type { EventCategory, EventFilterState } from '../../types/events'
import { EVENT_CATEGORIES } from '../../types/events'

interface EventFiltersProps {
  filters: EventFilterState
  onChange: (next: Partial<EventFilterState>) => void
  onReset: () => void
}

const gradeOptions = ['all', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export function EventFilters({ filters, onChange, onReset }: EventFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search by title, organizer, category, location..."
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <select
          value={filters.datePreset}
          onChange={(event) => onChange({ datePreset: event.target.value as EventFilterState['datePreset'] })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Any date</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this_week">This Week</option>
          <option value="weekend">Weekend</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={filters.grade}
          onChange={(event) => onChange({ grade: event.target.value as EventFilterState['grade'] })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value as EventCategory | 'all' })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Categories</option>
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.feeType}
          onChange={(event) => onChange({ feeType: event.target.value as EventFilterState['feeType'] })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Free/Paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={filters.mode}
          onChange={(event) => onChange({ mode: event.target.value as EventFilterState['mode'] })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Online/Offline</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <select
          value={filters.scope}
          onChange={(event) => onChange({ scope: event.target.value as EventFilterState['scope'] })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Location Scope</option>
          <option value="school">School</option>
          <option value="city">City</option>
          <option value="district">District / County</option>
          <option value="state">State</option>
          <option value="national">National</option>
          <option value="international">International</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
