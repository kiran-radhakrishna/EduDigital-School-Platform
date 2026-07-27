import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { cn, formatDate } from '../../utils/helpers'
import { attendanceApi, type AttendanceStatus as ApiAttendanceStatus } from '../../services/attendanceApi'
import { classApi, type TeacherClassSummary, type ClassRosterStudent } from '../../services/classApi'
import { parentApi, type ParentChild } from '../../services/parentApi'

type LogStatus = 'present' | 'absent' | 'late' | 'excused'

interface AttendanceLogRecord {
  id: string
  date: string
  status: LogStatus
  subject: string
}

const DEMO_RECORDS: AttendanceLogRecord[] = [
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
  excused: 'info',
} as const

const statusCellClasses = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  absent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  excused: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
} as const

function toLogStatus(status: ApiAttendanceStatus): LogStatus {
  return status.toLowerCase() as LogStatus
}

function monthRange(reference: Date): { from: string; to: string; label: string; year: number; month: number } {
  const year = reference.getFullYear()
  const month = reference.getMonth()
  const from = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  const to = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10)
  const label = reference.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return { from, to, label, year, month }
}

/** Shared calendar + stat cards + log table, driven entirely by props. Identical layout for demo, student, and parent views. */
function AttendanceLogView({ records, heading }: { records: AttendanceLogRecord[]; heading: string }) {
  const presentCount = records.filter((item) => item.status === 'present').length
  const absentCount = records.filter((item) => item.status === 'absent').length
  const lateCount = records.filter((item) => item.status === 'late').length
  const overallAttendance = records.length > 0 ? Math.round(((presentCount + lateCount) / records.length) * 100) : 0

  const { from, label } = monthRange(new Date())
  const monthStart = new Date(`${from}T00:00:00.000Z`)
  const firstDayOffset = monthStart.getUTCDay()
  const totalDays = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate()

  const recordByDay = new Map(records.map((record) => [new Date(record.date).getUTCDate(), record] as const))
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1
    return day > 0 && day <= totalDays ? { day, record: recordByDay.get(day) } : null
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{heading}</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label} Attendance</h2>
        </div>

        <div className="p-6">
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel) => (
              <div key={dayLabel}>{dayLabel}</div>
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
                {['Date', 'Subject', 'Status'].map((heading2) => (
                  <th
                    key={heading2}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {heading2}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-950/60">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.subject}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[record.status]}>{record.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StudentAttendanceView({ studentUserId }: { studentUserId: string }) {
  const [records, setRecords] = useState<AttendanceLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const { from, to } = monthRange(new Date())

    attendanceApi
      .getForStudent(studentUserId, { from, to })
      .then((apiRecords) => {
        if (cancelled) return
        setRecords(
          apiRecords.map((record) => ({
            id: record.id,
            date: record.date,
            status: toLogStatus(record.status),
            subject: record.class.name,
          })),
        )
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load attendance.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [studentUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading attendance…</p>
      </Card>
    )
  }

  return <AttendanceLogView records={records} heading="Attendance" />
}

function ParentAttendanceView({ parentUserId }: { parentUserId: string }) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)

  useEffect(() => {
    let cancelled = false
    parentApi
      .getChildren(parentUserId)
      .then((list) => {
        if (cancelled) return
        setChildren(list)
        if (list.length > 0) setSelectedChildId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load children.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChildren(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUserId])

  if (isLoadingChildren) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </Card>
    )
  }

  if (children.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">No children linked to your account yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing attendance for</label>
        <select
          value={selectedChildId}
          onChange={(event) => setSelectedChildId(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </Card>

      {selectedChildId && <StudentAttendanceView studentUserId={selectedChildId} />}
    </div>
  )
}

function TeacherAttendanceEntry({ teacherUserId }: { teacherUserId: string }) {
  const [classes, setClasses] = useState<TeacherClassSummary[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [roster, setRoster] = useState<ClassRosterStudent[]>([])
  const [statuses, setStatuses] = useState<Record<string, ApiAttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRoster, setIsLoadingRoster] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    classApi
      .getMyClasses(teacherUserId)
      .then((list) => {
        if (cancelled) return
        setClasses(list)
        if (list.length > 0) setSelectedClassId(list[0].classId)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load your classes.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [teacherUserId])

  useEffect(() => {
    if (!selectedClassId) return
    let cancelled = false

    Promise.all([classApi.getClassRoster(selectedClassId), attendanceApi.getForClass(selectedClassId, date)])
      .then(([rosterList, existingRecords]) => {
        if (cancelled) return
        setRoster(rosterList)
        const nextStatuses: Record<string, ApiAttendanceStatus> = {}
        for (const record of existingRecords) {
          nextStatuses[record.student.user.id] = record.status
        }
        setStatuses(nextStatuses)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load class roster.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoster(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedClassId, date])

  const markedCount = Object.keys(statuses).length

  const handleSave = async () => {
    if (!selectedClassId) return
    const entries = roster
      .filter((student) => statuses[student.userId])
      .map((student) => ({ studentUserId: student.userId, status: statuses[student.userId] }))

    if (entries.length === 0) {
      toast.error('Mark at least one student before saving.')
      return
    }

    setIsSaving(true)
    try {
      await attendanceApi.recordForClass(selectedClassId, date, entries)
      toast.success('Attendance saved.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save attendance.')
    } finally {
      setIsSaving(false)
    }
  }

  const statusButtons: Array<{ status: ApiAttendanceStatus; label: string; icon: typeof CheckCircle2 }> = [
    { status: 'PRESENT', label: 'Present', icon: CheckCircle2 },
    { status: 'ABSENT', label: 'Absent', icon: XCircle },
    { status: 'LATE', label: 'Late', icon: Clock },
    { status: 'EXCUSED', label: 'Excused', icon: CalendarDays },
  ]

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your classes…</p>
      </Card>
    )
  }

  if (classes.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">You are not assigned to any classes yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
            <select
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {classes.map((classSummary) => (
                <option key={classSummary.classId} value={classSummary.classId}>
                  {classSummary.className} — {classSummary.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {isLoadingRoster ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading roster…</p>
        </Card>
      ) : (
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mark Attendance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Marked: <span className="font-semibold text-gray-900 dark:text-white">{markedCount}/{roster.length}</span>
            </p>
          </div>

          <div className="space-y-2">
            {roster.map((student) => (
              <div
                key={student.userId}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {student.name} <span className="text-xs text-gray-400">#{student.rollNumber}</span>
                </p>
                <div className="flex gap-1">
                  {statusButtons.map(({ status, label, icon: Icon }) => (
                    <button
                      key={status}
                      type="button"
                      title={label}
                      onClick={() => setStatuses((current) => ({ ...current, [student.userId]: status }))}
                      className={cn(
                        'rounded-lg p-2 transition-colors',
                        statuses[student.userId] === status
                          ? statusCellClasses[toLogStatus(status)]
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-4" fullWidth onClick={handleSave} isLoading={isSaving}>
            Save Attendance
          </Button>
        </Card>
      )}
    </div>
  )
}

export default function Attendance() {
  const { t } = useLanguage()
  const { user, isDemoMode } = useAuth()

  const demoView = useMemo(() => <AttendanceLogView records={DEMO_RECORDS} heading={t.dashboard.attendance} />, [t])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user
        ? demoView
        : user.role === 'teacher'
          ? <TeacherAttendanceEntry teacherUserId={user.id} />
          : user.role === 'parent'
            ? <ParentAttendanceView parentUserId={user.id} />
            : <StudentAttendanceView studentUserId={user.id} />}
    </motion.div>
  )
}
