import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useLanguage } from '../../hooks/useLanguage'
import { cn, formatDate, percentage } from '../../utils/helpers'
import type { Attendance } from '../../types'

const attendanceRecords: Attendance[] = [
  { id: 'at-1', date: '2026-07-01T08:00:00.000Z', status: 'present', subject: 'Mathematics' },
  { id: 'at-2', date: '2026-07-02T08:00:00.000Z', status: 'present', subject: 'English' },
  { id: 'at-3', date: '2026-07-03T08:00:00.000Z', status: 'late', subject: 'Physics' },
  { id: 'at-4', date: '2026-07-04T08:00:00.000Z', status: 'present', subject: 'Biology' },
  { id: 'at-5', date: '2026-07-05T08:00:00.000Z', status: 'present', subject: 'History' },
  { id: 'at-6', date: '2026-07-06T08:00:00.000Z', status: 'present', subject: 'Chemistry' },
  { id: 'at-7', date: '2026-07-07T08:00:00.000Z', status: 'absent', subject: 'Computer Science' },
  { id: 'at-8', date: '2026-07-08T08:00:00.000Z', status: 'present', subject: 'Mathematics' },
  { id: 'at-9', date: '2026-07-09T08:00:00.000Z', status: 'present', subject: 'English' },
  { id: 'at-10', date: '2026-07-10T08:00:00.000Z', status: 'present', subject: 'Physics' },
  { id: 'at-11', date: '2026-07-11T08:00:00.000Z', status: 'late', subject: 'Biology' },
  { id: 'at-12', date: '2026-07-12T08:00:00.000Z', status: 'present', subject: 'History' },
  { id: 'at-13', date: '2026-07-13T08:00:00.000Z', status: 'present', subject: 'Chemistry' },
  { id: 'at-14', date: '2026-07-14T08:00:00.000Z', status: 'present', subject: 'Computer Science' },
  { id: 'at-15', date: '2026-07-15T08:00:00.000Z', status: 'present', subject: 'Mathematics' },
  { id: 'at-16', date: '2026-07-16T08:00:00.000Z', status: 'absent', subject: 'English' },
  { id: 'at-17', date: '2026-07-17T08:00:00.000Z', status: 'present', subject: 'Physics' },
  { id: 'at-18', date: '2026-07-18T08:00:00.000Z', status: 'present', subject: 'Biology' },
  { id: 'at-19', date: '2026-07-19T08:00:00.000Z', status: 'present', subject: 'History' },
  { id: 'at-20', date: '2026-07-20T08:00:00.000Z', status: 'present', subject: 'Chemistry' },
  { id: 'at-21', date: '2026-07-21T08:00:00.000Z', status: 'late', subject: 'Computer Science' },
  { id: 'at-22', date: '2026-07-22T08:00:00.000Z', status: 'present', subject: 'Mathematics' },
  { id: 'at-23', date: '2026-07-23T08:00:00.000Z', status: 'present', subject: 'English' },
  { id: 'at-24', date: '2026-07-24T08:00:00.000Z', status: 'present', subject: 'Physics' },
  { id: 'at-25', date: '2026-07-25T08:00:00.000Z', status: 'present', subject: 'Biology' },
  { id: 'at-26', date: '2026-07-26T08:00:00.000Z', status: 'present', subject: 'History' },
  { id: 'at-27', date: '2026-07-27T08:00:00.000Z', status: 'present', subject: 'Chemistry' },
  { id: 'at-28', date: '2026-07-28T08:00:00.000Z', status: 'absent', subject: 'Computer Science' },
]

const statusVariant = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
} as const

const statusCellClasses = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  absent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
} as const

export default function Attendance() {
  const { t } = useLanguage()

  const presentCount = attendanceRecords.filter((item) => item.status === 'present').length
  const absentCount = attendanceRecords.filter((item) => item.status === 'absent').length
  const lateCount = attendanceRecords.filter((item) => item.status === 'late').length
  const overallAttendance = percentage(presentCount, attendanceRecords.length)

  const firstDayOffset = new Date(2026, 6, 1).getDay()
  const totalDays = 31
  const recordByDay = new Map(
    attendanceRecords.map((record) => [new Date(record.date).getUTCDate(), record] as const),
  )
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1
    return day > 0 && day <= totalDays ? { day, record: recordByDay.get(day) } : null
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.attendance}</h1>
          </div>
          <p className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">{overallAttendance}%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Overall attendance this month</p>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Present days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Absent days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Late days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lateCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">July 2026 Attendance</h2>
        </div>

        <div className="p-6">
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, index) => (
              <div
                key={`calendar-${index}`}
                className={cn(
                  'flex aspect-square min-h-14 items-start justify-between rounded-2xl border p-2 text-xs md:min-h-20',
                  !cell && 'border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40',
                  cell?.record
                    ? `border-transparent ${statusCellClasses[cell.record.status]}`
                    : cell
                      ? 'border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-400'
                      : '',
                )}
              >
                {cell && (
                  <>
                    <span className="font-semibold">{cell.day}</span>
                    {cell.record && <span className="opacity-70">{cell.record.subject.slice(0, 3)}</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Attendance Log</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950/70">
              <tr>
                {['Date', 'Subject', 'Status'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-950/60">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.subject}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[record.status]}>{record.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
