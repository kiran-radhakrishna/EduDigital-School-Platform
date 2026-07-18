import { motion } from 'framer-motion'
import { CalendarPlus, MapPin, Share2, Ticket } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEvents } from '../../hooks/useEvents'
import { EventSection } from '../../components/events/EventSection'

export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { snapshot, registerForEvent } = useEvents()
  const event = snapshot.events.find((entry) => entry.id === eventId)
  const organizer = snapshot.organizers.find((entry) => entry.id === event?.organizerId)

  if (!event) return <Navigate replace to="/student/events" />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <img src={event.bannerUrl} alt={`${event.title} banner`} className="h-64 w-full object-cover" />
        <div className="space-y-3 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
          <div className="grid gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
            <p>Organizer: {organizer?.name}</p>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            <p>Time: {event.time}</p>
            <p>Capacity: {event.capacity}</p>
            <p>Remaining seats: {event.seatsRemaining}</p>
            <p>Recommended Age: {event.recommendedAges[0]}-{event.recommendedAges[1]}</p>
            <p>Recommended Grade: {event.recommendedGrades.join(', ')}</p>
            <p>Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                registerForEvent(event.id)
                toast.success('Event registration submitted.')
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Ticket className="h-4 w-4" />
              Register
            </button>
            <button
              type="button"
              onClick={() => toast.success('Calendar file exported (mock).')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <CalendarPlus className="h-4 w-4" />
              Calendar Export
            </button>
            <button
              type="button"
              onClick={() => toast.success('Share link copied (mock).')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EventSection title="Organizer Profile">
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">{organizer?.name}</p>
            <p className="mt-1">{organizer?.bio}</p>
            <p className="mt-2">Contact: {event.contactEmail}</p>
            <p>Website: {event.website ?? organizer?.website ?? 'N/A'}</p>
          </div>
        </EventSection>

        <EventSection title="Location & Map">
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <p className="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <MapPin className="h-4 w-4" />
              {event.location}
            </p>
            <p className="mt-2">{event.mapHint}</p>
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800">
              Map placeholder — backend map integration point.
            </p>
          </div>
        </EventSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EventSection title="Schedule">
          <div className="space-y-2">
            {event.schedule.map((item) => (
              <div key={item.time} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{item.time}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </EventSection>
        <EventSection title="Requirements & Speakers">
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Requirements</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-gray-500 dark:text-gray-400">
                {event.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Speakers</p>
              <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {event.speakers.map((speaker) => (
                  <li key={speaker.name}>
                    {speaker.name} — {speaker.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </EventSection>
      </div>
    </motion.div>
  )
}
