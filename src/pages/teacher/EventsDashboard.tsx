import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useEvents } from '../../hooks/useEvents'
import { EventSection } from '../../components/events/EventSection'

export default function TeacherEventsDashboard() {
  const { snapshot, markTeacherAttendance } = useEvents()

  const classViews = snapshot.teacherClassViews
  const registrations = snapshot.registrations
  const teacherFeedback = snapshot.feedback.filter((entry) => entry.authorRole === 'teacher')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Events Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage class participation, attendance, certificates, photos, and recommendations.
        </p>
      </div>

      <EventSection title="Events for My Classes">
        <div className="grid gap-4 md:grid-cols-2">
          {classViews.map((classView) => (
            <div key={classView.classId} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Class {classView.className}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upcoming Events: {classView.upcomingEventIds.length}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Students Registered: {classView.registeredStudentCount}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Certificates Earned: {classView.certificatesIssuedCount}
              </p>
            </div>
          ))}
        </div>
      </EventSection>

      <EventSection title="Students Registered">
        <div className="space-y-3">
          {registrations.map((registration) => {
            const event = snapshot.events.find((entry) => entry.id === registration.eventId)
            return (
              <div key={registration.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{registration.studentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Event: {event?.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {registration.status.replaceAll('_', ' ')}
                </p>
              </div>
            )
          })}
        </div>
      </EventSection>

      <EventSection title="Attendance">
        <div className="space-y-3">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{registration.studentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Attendance: {registration.attendanceMarked ? 'Marked' : 'Pending'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markTeacherAttendance(registration.id, true)
                  toast.success('Attendance marked.')
                }}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Mark Attended
              </button>
            </div>
          ))}
        </div>
      </EventSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <EventSection title="Certificates">
          <div className="space-y-3">
            {snapshot.certificates.map((certificate) => (
              <div key={certificate.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{certificate.studentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Badge: {certificate.badge}</p>
              </div>
            ))}
          </div>
        </EventSection>

        <EventSection title="Photos">
          <div className="grid grid-cols-2 gap-3">
            {snapshot.photos.map((photo) => (
              <figure key={photo.id} className="space-y-1">
                <img src={photo.imageUrl} alt={photo.caption} className="h-24 w-full rounded-lg object-cover" />
                <figcaption className="text-[11px] text-gray-500 dark:text-gray-400">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </EventSection>
      </div>

      <EventSection title="Feedback">
        <div className="space-y-3">
          {teacherFeedback.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.authorName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{entry.comment}</p>
            </div>
          ))}
        </div>
      </EventSection>

      <EventSection title="Teacher Recommendations">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
          Recommend events to students by class and learning goals. Suggested next event: Deggendorf STEM Festival for Class 7A.
        </div>
      </EventSection>
    </motion.div>
  )
}
