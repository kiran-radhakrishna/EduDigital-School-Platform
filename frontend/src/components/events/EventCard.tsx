import { CalendarPlus, MapPin, Save, Share2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EventItem } from '../../types/events'

interface EventCardProps {
  event: EventItem
  organizerName: string
  recommendationReason?: string
  onRegister?: (eventId: string) => void
  onSave?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

export function EventCard({
  event,
  organizerName,
  recommendationReason,
  onRegister,
  onSave,
  onShare,
}: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <img src={event.posterUrl} alt={`${event.title} poster`} className="h-40 w-full object-cover" />

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {event.categories[0]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {event.feeType === 'free' ? 'Free' : `Paid €${event.feeAmount ?? 0}`}
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Organizer: {organizerName}</p>
        </div>

        {recommendationReason ? (
          <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {recommendationReason}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
          <p>Time: {event.time}</p>
          <p className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </p>
          <p className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Seats: {event.seatsRemaining}
          </p>
          <p>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>
          <p>
            Grade: {event.recommendedGrades[0]} -{' '}
            {event.recommendedGrades[event.recommendedGrades.length - 1]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRegister?.(event.id)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => onSave?.(event.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button
            type="button"
            onClick={() => onShare?.(event.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Add to Calendar
          </button>
          <Link
            to={`/events/${event.id}`}
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
