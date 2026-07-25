import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EventSection } from '../../components/events/EventSection'
import { useEvents } from '../../hooks/useEvents'
import { EVENT_CATEGORIES } from '../../types/events'

export default function AuthorityEventsManagement() {
  const { snapshot, updateAuthorityEventStatus } = useEvents()

  const pendingEvents = snapshot.events.filter((event) => event.status === 'pending_review')
  const approvedEvents = snapshot.events.filter((event) => event.status === 'approved')
  const rejectedEvents = snapshot.events.filter((event) => event.status === 'rejected')
  const schoolEvents = snapshot.events.filter((event) => event.scope === 'school')
  const externalEvents = snapshot.events.filter((event) => event.scope !== 'school')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review organizer submissions, publish events, and monitor participation analytics.
        </p>
      </div>

      <EventSection title="Pending Events">
        <div className="space-y-3">
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Organizer: {snapshot.organizers.find((organizer) => organizer.id === event.organizerId)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateAuthorityEventStatus(event.id, 'approved')
                    toast.success('Event approved.')
                  }}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateAuthorityEventStatus(event.id, 'rejected')
                    toast.success('Event rejected.')
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateAuthorityEventStatus(event.id, 'published')
                    toast.success('Event published.')
                  }}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      </EventSection>

      <div className="grid gap-6 lg:grid-cols-3">
        <EventSection title="Approved Events">
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-300">
            {approvedEvents.length} approved events in queue.
          </p>
        </EventSection>
        <EventSection title="Rejected Events">
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {rejectedEvents.length} rejected events.
          </p>
        </EventSection>
        <EventSection title="Categories">
          <p className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {EVENT_CATEGORIES.length} active event categories managed centrally.
          </p>
        </EventSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EventSection title="School Events">
          <div className="space-y-2">
            {schoolEvents.map((event) => (
              <p key={event.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                {event.title}
              </p>
            ))}
          </div>
        </EventSection>
        <EventSection title="External Events">
          <div className="space-y-2">
            {externalEvents.map((event) => (
              <p key={event.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                {event.title}
              </p>
            ))}
          </div>
        </EventSection>
      </div>

      <EventSection title="Analytics">
        <div className="h-[280px] rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshot.authorityAnalytics}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="grade" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="attendanceRate" fill="#22c55e" />
              <Bar dataKey="completionRate" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </EventSection>
    </motion.div>
  )
}
