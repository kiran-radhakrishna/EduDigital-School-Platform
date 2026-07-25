import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { EventCard } from '../../components/events/EventCard'
import { EventCalendarStrip } from '../../components/events/EventCalendarStrip'
import { EventFilters } from '../../components/events/EventFilters'
import { EventSection } from '../../components/events/EventSection'
import { useAuth } from '../../hooks/useAuth'
import { useEvents } from '../../hooks/useEvents'
import { getCurrentUserIdentity } from '../../utils/helpers'

function getOrganizerNameById(organizerId: string, organizers: { id: string; name: string }[]): string {
  return organizers.find((organizer) => organizer.id === organizerId)?.name ?? 'Organizer'
}

export default function StudentEvents() {
  const { user } = useAuth()
  const {
    snapshot,
    filters,
    filteredPublishedEvents,
    studentRecommendations,
    myRegistrations,
    setFilters,
    resetFilters,
    registerForEvent,
  } = useEvents()

  const currentUser = getCurrentUserIdentity(user, 'student')
  const recommendedMap = new Map(studentRecommendations.map((entry) => [entry.eventId, entry]))
  const recommendedEvents = filteredPublishedEvents.filter((event) => recommendedMap.has(event.id))
  const upcomingEvents = filteredPublishedEvents.filter((event) => !recommendedMap.has(event.id))
  const pastEvents = myRegistrations
    .filter((registration) => registration.status === 'completed')
    .map((registration) => snapshot.events.find((event) => event.id === registration.eventId))
    .filter((event): event is NonNullable<typeof event> => !!event)

  const certificates = snapshot.certificates.filter(
    (certificate) => certificate.studentName === currentUser.fullName,
  )
  const eventHistory = snapshot.studentPortfolio.filter(
    (entry) => entry.studentId === 'student-krn',
  )

  const onRegister = (eventId: string) => {
    registerForEvent(eventId)
    toast.success('Registration submitted. Waiting for parent approval if required.')
  }

  const onSave = (eventId: string) => {
    toast.success(`Saved event ${eventId} to your list.`)
  }

  const onShare = (eventId: string) => {
    const event = snapshot.events.find((entry) => entry.id === eventId)
    if (!event) return
    navigator.clipboard
      .writeText(`${event.title} — ${event.date}`)
      .then(() => toast.success('Event copied for sharing.'))
      .catch(() => toast.error('Unable to copy share text.'))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Events &amp; Community</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Discover curated events for learning, sports, arts, wellbeing, and community growth.
        </p>
      </div>

      <EventFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      <EventSection title="Recommended For You" subtitle="Personalized by grade, interests, wellbeing, and learning profile">
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizerName={getOrganizerNameById(event.organizerId, snapshot.organizers)}
              recommendationReason={recommendedMap.get(event.id)?.reason}
              onRegister={onRegister}
              onSave={onSave}
              onShare={onShare}
            />
          ))}
        </div>
      </EventSection>

      <EventSection title="Upcoming Events" subtitle="School, city, national, and online opportunities">
        <div className="grid gap-4 lg:grid-cols-2">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizerName={getOrganizerNameById(event.organizerId, snapshot.organizers)}
              onRegister={onRegister}
              onSave={onSave}
              onShare={onShare}
            />
          ))}
        </div>
      </EventSection>

      <EventSection title="My Registered Events">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myRegistrations.map((registration) => {
            const event = snapshot.events.find((entry) => entry.id === registration.eventId)
            if (!event) return null
            return (
              <div key={registration.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Status: {registration.status.replaceAll('_', ' ')}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Parent approval: {registration.parentApprovalStatus}
                </p>
                {registration.qrTicketCode ? (
                  <p className="mt-2 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    QR Ticket: {registration.qrTicketCode}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </EventSection>

      <EventSection title="Past Events">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pastEvents.map((event) => (
            <div key={event.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Completed on {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </EventSection>

      <EventSection title="Certificates">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => {
            const event = snapshot.events.find((entry) => entry.id === certificate.eventId)
            return (
              <div key={certificate.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{event?.title}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Badge: {certificate.badge}
                </p>
                <a
                  href={certificate.downloadUrl}
                  className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  Download certificate
                </a>
              </div>
            )
          })}
        </div>
      </EventSection>

      <EventSection title="Event History">
        <div className="grid gap-4 md:grid-cols-2">
          {eventHistory.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.eventName}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Organizer: {entry.organizer}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Feedback: {entry.teacherFeedback ?? 'No feedback yet'}
              </p>
            </div>
          ))}
        </div>
      </EventSection>

      <EventSection title="Calendar" subtitle="School events, registered events, exams, assignments, and holidays">
        <EventCalendarStrip items={snapshot.calendarItems} />
      </EventSection>
    </motion.div>
  )
}
