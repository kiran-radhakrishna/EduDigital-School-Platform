import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { EventCalendarStrip } from '../../components/events/EventCalendarStrip'
import { EventSection } from '../../components/events/EventSection'
import { useEvents } from '../../hooks/useEvents'

export default function ParentChildEvents() {
  const { snapshot, approveParentRequest, rejectParentRequest } = useEvents()

  const approvalRequests = snapshot.parentApprovals
  const childRegistrations = snapshot.registrations
  const childCertificates = snapshot.certificates

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Child Events</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Approve participation, track registrations, and manage certificates and reminders.
        </p>
      </div>

      <EventSection title="Approval Requests">
        <div className="space-y-3">
          {approvalRequests.map((request) => {
            const event = snapshot.events.find((entry) => entry.id === request.eventId)
            return (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.childName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event?.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status: {request.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveParentRequest(request.id)
                      toast.success('Participation approved.')
                    }}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      rejectParentRequest(request.id)
                      toast.success('Participation rejected.')
                    }}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </EventSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <EventSection title="Upcoming / Registered">
          <div className="space-y-3">
            {childRegistrations.map((registration) => {
              const event = snapshot.events.find((entry) => entry.id === registration.eventId)
              return (
                <div key={registration.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event?.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event?.date ?? '').toLocaleDateString()} · {registration.status.replaceAll('_', ' ')}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Transport info: School bus point A at 08:10
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Emergency contact: +49 991 555 900
                  </p>
                </div>
              )
            })}
          </div>
        </EventSection>

        <EventSection title="Certificates">
          <div className="space-y-3">
            {childCertificates.map((certificate) => {
              const event = snapshot.events.find((entry) => entry.id === certificate.eventId)
              return (
                <div key={certificate.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event?.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Badge: {certificate.badge}</p>
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
      </div>

      <EventSection title="Calendar">
        <EventCalendarStrip items={snapshot.calendarItems} />
      </EventSection>
    </motion.div>
  )
}
