import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { cn } from '../../utils/helpers'
import type { TimetableEntry } from '../../types'
import { timetableApi } from '../../services/timetableApi'
import { parentApi, type ParentChild } from '../../services/parentApi'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
const timeSlots = [
  { startTime: '08:00', endTime: '08:45' },
  { startTime: '08:45', endTime: '09:30' },
  { startTime: '09:45', endTime: '10:30' },
  { startTime: '10:35', endTime: '11:20' },
  { startTime: '11:25', endTime: '12:10' },
  { startTime: '13:00', endTime: '13:45' },
  { startTime: '13:50', endTime: '14:35' },
] as const

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  Physics: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  English: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  History: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Biology: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Chemistry: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  'Physical Education': 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  Art: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'Computer Science': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
}
const FALLBACK_COLOR = 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'

function colorForSubject(subject: string): string {
  return subjectColors[subject] ?? FALLBACK_COLOR
}

const DEMO_ENTRIES: TimetableEntry[] = [
  { id: 'tt-1', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'A-201', day: 'Mon', startTime: '08:00', endTime: '08:45', color: subjectColors.Mathematics },
  { id: 'tt-2', subject: 'English', teacher: 'Mr. Clark', room: 'B-104', day: 'Mon', startTime: '08:45', endTime: '09:30', color: subjectColors.English },
  { id: 'tt-3', subject: 'Physics', teacher: 'Dr. Patel', room: 'Lab-2', day: 'Mon', startTime: '09:45', endTime: '10:30', color: subjectColors.Physics },
  { id: 'tt-4', subject: 'History', teacher: 'Mrs. Davis', room: 'C-302', day: 'Mon', startTime: '11:25', endTime: '12:10', color: subjectColors.History },
  { id: 'tt-5', subject: 'Computer Science', teacher: 'Mr. Nguyen', room: 'Tech-1', day: 'Tue', startTime: '08:00', endTime: '08:45', color: subjectColors['Computer Science'] },
  { id: 'tt-6', subject: 'Chemistry', teacher: 'Dr. Lee', room: 'Lab-1', day: 'Tue', startTime: '08:45', endTime: '09:30', color: subjectColors.Chemistry },
  { id: 'tt-7', subject: 'Biology', teacher: 'Ms. Walker', room: 'B-205', day: 'Tue', startTime: '10:35', endTime: '11:20', color: subjectColors.Biology },
  { id: 'tt-8', subject: 'Art', teacher: 'Ms. Rivera', room: 'Studio', day: 'Tue', startTime: '13:00', endTime: '13:45', color: subjectColors.Art },
  { id: 'tt-9', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'A-201', day: 'Wed', startTime: '08:00', endTime: '08:45', color: subjectColors.Mathematics },
  { id: 'tt-10', subject: 'Physical Education', teacher: 'Coach Adams', room: 'Gym', day: 'Wed', startTime: '09:45', endTime: '10:30', color: subjectColors['Physical Education'] },
  { id: 'tt-11', subject: 'English', teacher: 'Mr. Clark', room: 'B-104', day: 'Wed', startTime: '10:35', endTime: '11:20', color: subjectColors.English },
  { id: 'tt-12', subject: 'Chemistry', teacher: 'Dr. Lee', room: 'Lab-1', day: 'Wed', startTime: '13:50', endTime: '14:35', color: subjectColors.Chemistry },
  { id: 'tt-13', subject: 'History', teacher: 'Mrs. Davis', room: 'C-302', day: 'Thu', startTime: '08:45', endTime: '09:30', color: subjectColors.History },
  { id: 'tt-14', subject: 'Physics', teacher: 'Dr. Patel', room: 'Lab-2', day: 'Thu', startTime: '09:45', endTime: '10:30', color: subjectColors.Physics },
  { id: 'tt-15', subject: 'Biology', teacher: 'Ms. Walker', room: 'B-205', day: 'Thu', startTime: '11:25', endTime: '12:10', color: subjectColors.Biology },
  { id: 'tt-16', subject: 'Computer Science', teacher: 'Mr. Nguyen', room: 'Tech-1', day: 'Fri', startTime: '08:00', endTime: '08:45', color: subjectColors['Computer Science'] },
  { id: 'tt-17', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'A-201', day: 'Fri', startTime: '10:35', endTime: '11:20', color: subjectColors.Mathematics },
  { id: 'tt-18', subject: 'Art', teacher: 'Ms. Rivera', room: 'Studio', day: 'Fri', startTime: '13:00', endTime: '13:45', color: subjectColors.Art },
]

/** Shared week/day grid, driven entirely by props. Same layout for demo, student, teacher, and parent views. */
function TimetableGridView({ entries, heading }: { entries: TimetableEntry[]; heading: string }) {
  const { t } = useLanguage()
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDay, setSelectedDay] = useState<(typeof days)[number]>('Mon')

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [entries, selectedDay],
  )

  const getEntry = (day: (typeof days)[number], startTime: string) =>
    entries.find((entry) => entry.day === day && entry.startTime === startTime)

  return (
    <Card className="overflow-hidden border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.timetable}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{heading}</p>
        </div>

        <div className="inline-flex w-fit rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {(['week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                view === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
              )}
            >
              {mode === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('hidden md:block p-6', view === 'day' && 'md:hidden')}>
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-[110px_repeat(5,minmax(0,1fr))] rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="border-b border-r border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-400">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="border-b border-r border-gray-200 bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700 last:border-r-0 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-200"
              >
                {day}
              </div>
            ))}

            {timeSlots.map((slot, index) => (
              <div key={slot.startTime} className="contents">
                <div
                  className={cn(
                    'border-r border-gray-200 p-4 text-sm dark:border-gray-800',
                    index !== timeSlots.length - 1 && 'border-b',
                  )}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{slot.startTime}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{slot.endTime}</p>
                </div>

                {days.map((day) => {
                  const entry = getEntry(day, slot.startTime)

                  return (
                    <div
                      key={`${day}-${slot.startTime}`}
                      className={cn(
                        'min-h-28 border-r border-gray-200 p-3 last:border-r-0 dark:border-gray-800',
                        index !== timeSlots.length - 1 && 'border-b',
                      )}
                    >
                      {entry ? (
                        <div className={cn('h-full rounded-2xl p-3', entry.color)}>
                          <p className="font-semibold">{entry.subject}</p>
                          <p className="mt-1 text-xs opacity-80">{entry.room}</p>
                          <p className="mt-0.5 text-xs opacity-80">{entry.teacher}</p>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-300 dark:border-gray-800 dark:text-gray-700">
                          —
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn('space-y-5 p-6 md:hidden', view === 'day' && 'md:block')}>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedDay === day
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {dayEntries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No lessons scheduled.</p>
          ) : (
            dayEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        {entry.startTime} - {entry.endTime}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{entry.subject}</h3>
                  </div>

                  <Badge className={entry.color}>{selectedDay}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>{entry.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>{entry.room}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}

function StudentTimetableView({ studentUserId }: { studentUserId: string }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    timetableApi
      .getForStudent(studentUserId)
      .then((slots) => {
        if (cancelled) return
        setEntries(
          slots.map((slot) => ({
            id: slot.id,
            subject: slot.subject.name,
            teacher: `${slot.teacher.user.firstName} ${slot.teacher.user.lastName}`,
            room: slot.room ?? '—',
            day: slot.day.charAt(0) + slot.day.slice(1).toLowerCase() as TimetableEntry['day'],
            startTime: slot.startTime,
            endTime: slot.endTime,
            color: colorForSubject(slot.subject.name),
          })),
        )
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load timetable.')
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading timetable…</p>
      </Card>
    )
  }

  return <TimetableGridView entries={entries} heading="Weekly Timetable" />
}

function TeacherTimetableView({ teacherUserId }: { teacherUserId: string }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    timetableApi
      .getForTeacher(teacherUserId)
      .then((slots) => {
        if (cancelled) return
        setEntries(
          slots.map((slot) => ({
            id: slot.id,
            subject: slot.subject.name,
            teacher: `${slot.class.name} (Grade ${slot.class.grade}${slot.class.section})`,
            room: slot.room ?? '—',
            day: slot.day.charAt(0) + slot.day.slice(1).toLowerCase() as TimetableEntry['day'],
            startTime: slot.startTime,
            endTime: slot.endTime,
            color: colorForSubject(slot.subject.name),
          })),
        )
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load timetable.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [teacherUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading timetable…</p>
      </Card>
    )
  }

  return <TimetableGridView entries={entries} heading="Your Weekly Teaching Schedule" />
}

function ParentTimetableView({ parentUserId }: { parentUserId: string }) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUserId])

  if (isLoading) {
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
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing timetable for</label>
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

      {selectedChildId && <StudentTimetableView studentUserId={selectedChildId} />}
    </div>
  )
}

export default function Timetable() {
  const { user, isDemoMode } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user ? (
        <TimetableGridView entries={DEMO_ENTRIES} heading="Weekly Timetable" />
      ) : user.role === 'teacher' ? (
        <TeacherTimetableView teacherUserId={user.id} />
      ) : user.role === 'parent' ? (
        <ParentTimetableView parentUserId={user.id} />
      ) : (
        <StudentTimetableView studentUserId={user.id} />
      )}
    </motion.div>
  )
}
