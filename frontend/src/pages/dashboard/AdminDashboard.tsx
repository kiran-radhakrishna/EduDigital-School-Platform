import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CalendarCheck, GraduationCap, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Avatar } from '../../components/common/Avatar'
import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { StatCard } from '../../components/common/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { analyticsApi } from '../../services/analyticsApi'
import { getCurrentUserIdentity } from '../../utils/helpers'

interface EnrollmentPoint {
  grade: string
  students: number
}

interface AttendancePoint {
  month: string
  attendance: number
}

interface WellbeingPoint {
  grade: string
  happy: number
  neutral: number
  support: number
}

interface RegistrationRow {
  id: string
  name: string
  role: string
  joinedAt: string
}

interface DashboardTotals {
  students: number
  teachers: number
  classes: number
  attendance: number
}

const DEMO_ENROLLMENT: EnrollmentPoint[] = [
  { grade: 'Grade 1', students: 92 },
  { grade: 'Grade 2', students: 98 },
  { grade: 'Grade 3', students: 101 },
  { grade: 'Grade 4', students: 103 },
  { grade: 'Grade 5', students: 107 },
  { grade: 'Grade 6', students: 99 },
  { grade: 'Grade 7', students: 106 },
  { grade: 'Grade 8', students: 110 },
  { grade: 'Grade 9', students: 108 },
  { grade: 'Grade 10', students: 112 },
  { grade: 'Grade 11', students: 105 },
  { grade: 'Grade 12', students: 107 },
]

const DEMO_ATTENDANCE_TREND: AttendancePoint[] = [
  { month: 'Feb', attendance: 91.5 },
  { month: 'Mar', attendance: 92.1 },
  { month: 'Apr', attendance: 92.8 },
  { month: 'May', attendance: 93.2 },
  { month: 'Jun', attendance: 92.9 },
  { month: 'Jul', attendance: 93.6 },
]

const DEMO_WELLBEING: WellbeingPoint[] = [
  { grade: 'Grade 4', happy: 74, neutral: 16, support: 10 },
  { grade: 'Grade 5', happy: 61, neutral: 23, support: 16 },
  { grade: 'Grade 6', happy: 69, neutral: 19, support: 12 },
]

const DEMO_REGISTRATIONS: RegistrationRow[] = [
  { id: 'registration-1', name: 'Liam Turner', role: 'Student', joinedAt: '2026-07-02' },
  { id: 'registration-2', name: 'Ava Collins', role: 'Teacher', joinedAt: '2026-07-01' },
  { id: 'registration-3', name: 'Noah Rivera', role: 'Student', joinedAt: '2026-06-30' },
  { id: 'registration-4', name: 'Mia Sullivan', role: 'Student', joinedAt: '2026-06-29' },
  { id: 'registration-5', name: 'Ethan Brooks', role: 'Teacher', joinedAt: '2026-06-28' },
]

const DEMO_TOTALS: DashboardTotals = { students: 1248, teachers: 84, classes: 42, attendance: 93 }

const systemNotices = [
  {
    id: 'notice-1',
    title: 'Quarterly attendance review completed',
    message: 'Attendance data for all grades has been verified and published.',
    variant: 'success' as const,
  },
  {
    id: 'notice-2',
    title: 'Parent portal maintenance scheduled',
    message: 'A brief maintenance window is planned for July 6 at 8:00 PM.',
    variant: 'warning' as const,
  },
  {
    id: 'notice-3',
    title: 'New teacher onboarding documents available',
    message: 'HR has uploaded the latest induction pack for new faculty members.',
    variant: 'info' as const,
  },
]

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

function toWellbeingPercentages(entry: {
  grade: string
  happy: number
  neutral: number
  needsSupport: number
}): WellbeingPoint {
  const total = entry.happy + entry.neutral + entry.needsSupport
  if (total === 0) return { grade: entry.grade, happy: 0, neutral: 0, support: 0 }

  return {
    grade: entry.grade,
    happy: Math.round((entry.happy / total) * 100),
    neutral: Math.round((entry.neutral / total) * 100),
    support: Math.round((entry.needsSupport / total) * 100),
  }
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

export default function AdminDashboard() {
  const { user, isDemoMode } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'admin')

  const [enrollmentByGrade, setEnrollmentByGrade] = useState<EnrollmentPoint[]>(
    isDemoMode ? DEMO_ENROLLMENT : [],
  )
  const [attendanceTrend, setAttendanceTrend] = useState<AttendancePoint[]>(
    isDemoMode ? DEMO_ATTENDANCE_TREND : [],
  )
  const [wellbeingByGrade, setWellbeingByGrade] = useState<WellbeingPoint[]>(
    isDemoMode ? DEMO_WELLBEING : [],
  )
  const [recentRegistrations, setRecentRegistrations] = useState<RegistrationRow[]>(
    isDemoMode ? DEMO_REGISTRATIONS : [],
  )
  const [totals, setTotals] = useState<DashboardTotals>(isDemoMode ? DEMO_TOTALS : { students: 0, teachers: 0, classes: 0, attendance: 0 })

  useEffect(() => {
    // Demo Mode never touches the backend — it keeps its own static sample data.
    if (isDemoMode) return

    let cancelled = false
    analyticsApi
      .getMySchoolAnalytics()
      .then((analytics) => {
        if (cancelled) return

        setEnrollmentByGrade(analytics.enrollmentByGrade)
        setAttendanceTrend(
          analytics.attendanceTrend.map((point) => ({ month: point.month, attendance: point.attendancePercentage })),
        )
        setWellbeingByGrade(analytics.wellbeingByGrade.map(toWellbeingPercentages))
        setRecentRegistrations(
          analytics.recentRegistrations.map((registration) => ({
            ...registration,
            role: formatRole(registration.role),
          })),
        )

        const latestAttendance = analytics.attendanceTrend.at(-1)?.attendancePercentage ?? 0
        setTotals({
          students: analytics.totals.students,
          teachers: analytics.totals.teachers,
          classes: analytics.totals.classes,
          attendance: latestAttendance,
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [isDemoMode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {currentUser.firstName}! School Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor school-wide performance, enrollment, attendance, and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={20} />} title="Total Students" value={totals.students.toLocaleString()} />
        <StatCard icon={<GraduationCap size={20} />} title="Total Teachers" value={totals.teachers} />
        <StatCard icon={<BookOpen size={20} />} title="Total Classes" value={totals.classes} />
        <StatCard icon={<CalendarCheck size={20} />} title="School Attendance" value={`${totals.attendance}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Enrollment by Grade">
          <div className="overflow-x-auto">
            <div className="h-[260px] min-w-[720px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentByGrade}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card title="Attendance Trend">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Anonymous Wellbeing Analytics" subtitle="No student names. Aggregated by grade.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellbeingByGrade}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="grade" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="happy" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {wellbeingByGrade.map((entry) => (
              <div key={entry.grade} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.grade}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <p className="rounded-lg bg-green-50 px-2 py-1 text-center font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
                    Happy {entry.happy}%
                  </p>
                  <p className="rounded-lg bg-blue-50 px-2 py-1 text-center font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    Neutral {entry.neutral}%
                  </p>
                  <p className="rounded-lg bg-amber-50 px-2 py-1 text-center font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Support {entry.support}%
                  </p>
                </div>
              </div>
            ))}
            {wellbeingByGrade.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No wellbeing check-ins recorded yet.</p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Recent Registrations">
        <div className="space-y-4">
          {recentRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={registration.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{registration.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Joined {formatDate(registration.joinedAt)}</p>
                </div>
              </div>
              <Badge variant={registration.role === 'Teacher' ? 'info' : 'primary'} className="self-start sm:self-center">
                {registration.role}
              </Badge>
            </div>
          ))}
          {recentRegistrations.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent registrations.</p>
          )}
        </div>
      </Card>

      <Card title="System Notices">
        <div className="space-y-4">
          {systemNotices.map((notice) => (
            <div key={notice.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{notice.title}</h3>
                <Badge variant={notice.variant}>{notice.variant}</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{notice.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
