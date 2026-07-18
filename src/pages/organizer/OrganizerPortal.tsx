import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { EventSection } from '../../components/events/EventSection'
import { useEvents } from '../../hooks/useEvents'
import { EVENT_CATEGORIES } from '../../types/events'

export default function OrganizerPortal() {
  const { snapshot } = useEvents()
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: EVENT_CATEGORIES[0],
    targetGrades: '6,7,8',
    targetAge: '11-15',
    location: '',
    capacity: '100',
    registrationDeadline: '',
    contactInformation: '',
    website: '',
  })

  const organizers = snapshot.organizers.filter((organizer) => organizer.role === 'external_organizer')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">External Organizer Portal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Submit events for authority review. Approved events are published to students, teachers, and parents.
        </p>
      </div>

      <EventSection title="Organizer Profiles">
        <div className="grid gap-4 md:grid-cols-2">
          {organizers.map((organizer) => (
            <div key={organizer.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{organizer.name}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{organizer.bio}</p>
              <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                Status: {organizer.approved ? 'Approved' : 'Pending approval'}
              </p>
            </div>
          ))}
        </div>
      </EventSection>

      <EventSection title="Submit Event">
        <form
          className="grid gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            toast.success('Event submitted for authority review.')
            setEventForm({
              title: '',
              description: '',
              category: EVENT_CATEGORIES[0],
              targetGrades: '6,7,8',
              targetAge: '11-15',
              location: '',
              capacity: '100',
              registrationDeadline: '',
              contactInformation: '',
              website: '',
            })
          }}
        >
          <input
            value={eventForm.title}
            onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Event title"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            required
          />
          <select
            value={eventForm.category}
            onChange={(event) => setEventForm((prev) => ({ ...prev, category: event.target.value as typeof prev.category }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <textarea
            value={eventForm.description}
            onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
            rows={4}
            required
          />
          <input
            value={eventForm.targetGrades}
            onChange={(event) => setEventForm((prev) => ({ ...prev, targetGrades: event.target.value }))}
            placeholder="Target grades (e.g. 6,7,8)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            value={eventForm.targetAge}
            onChange={(event) => setEventForm((prev) => ({ ...prev, targetAge: event.target.value }))}
            placeholder="Target age range"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            value={eventForm.location}
            onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="Location"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            required
          />
          <input
            value={eventForm.capacity}
            onChange={(event) => setEventForm((prev) => ({ ...prev, capacity: event.target.value }))}
            placeholder="Capacity"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            required
          />
          <input
            type="date"
            value={eventForm.registrationDeadline}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, registrationDeadline: event.target.value }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            required
          />
          <input
            value={eventForm.contactInformation}
            onChange={(event) => setEventForm((prev) => ({ ...prev, contactInformation: event.target.value }))}
            placeholder="Contact information"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            required
          />
          <input
            value={eventForm.website}
            onChange={(event) => setEventForm((prev) => ({ ...prev, website: event.target.value }))}
            placeholder="Website"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 md:col-span-2"
          >
            Submit Event for Review
          </button>
        </form>
      </EventSection>
    </motion.div>
  )
}
