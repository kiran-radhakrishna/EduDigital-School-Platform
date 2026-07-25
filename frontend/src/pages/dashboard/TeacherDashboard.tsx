import { motion } from 'framer-motion'
import { Calendar, CalendarCheck, CheckCircle2, ClipboardList, FilePlus, TrendingUp, Users } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'

import { Card } from '../../components/common/Card'
import { StatCard } from '../../components/common/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { getCurrentUserIdentity } from '../../utils/helpers'

const performanceTrend = [
  { month: 'Feb', average: 78 },
  { month: 'Mar', average: 80 },
  { month: 'Apr', average: 82 },
  { month: 'May', average: 81 },
  { month: 'Jun', average: 84 },
  { month: 'Jul', average: 86 },
]

const recentActivity = [
  { id: 'activity-1', title: 'Graded Math homework for Class 10-A', time: '2 hours ago' },
  { id: 'activity-2', title: 'Uploaded Physics lab rubric for Grade 11', time: '4 hours ago' },
  { id: 'activity-3', title: 'Marked attendance for Class 9-C', time: 'Today, 8:10 AM' },
  { id: 'activity-4', title: 'Reviewed project proposals for Computer Science', time: 'Yesterday' },
  { id: 'activity-5', title: 'Shared revision notes with Class 12-B', time: '2 days ago' },
]

const quickActions = [
  {
    id: 'attendance',
    label: 'Take Attendance',
    icon: CalendarCheck,
    onClickPath: '/teacher/attendance',
  },
  {
    id: 'assignment',
    label: 'Create Assignment',
    icon: FilePlus,
    onClickPath: '/teacher/assignments',
  },
  {
    id: 'timetable',
    label: 'View Timetable',
    icon: Calendar,
    onClickPath: '/teacher/timetable',
  },
]

const classWellbeing = [
  { grade: '4A', happy: 72, neutral: 18, support: 10 },
  { grade: '5B', happy: 66, neutral: 22, support: 12 },
  { grade: '6A', happy: 69, neutral: 20, support: 11 },
]

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const currentUser = getCurrentUserIdentity(user, 'teacher')

  const firstName = currentUser.firstName

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.dashboard.welcome}, {firstName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here&apos;s a snapshot of your classes, grading, and activity today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={20} />} title="Total Students" value={156} change={4.2} trend="up" />
        <StatCard icon={<Calendar size={20} />} title="Classes Today" value={5} />
        <StatCard icon={<ClipboardList size={20} />} title="Assignments to Grade" value={23} change={-8} trend="down" />
        <StatCard icon={<TrendingUp size={20} />} title="Average Class Grade" value="B+" />
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.onClickPath)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-indigo-500/10"
              >
                <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Icon size={20} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card title="Student Performance">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Today&apos;s Class Wellbeing" subtitle="Anonymous wellbeing insights only">
        <div className="space-y-3">
          {classWellbeing.map((entry) => (
            <div
              key={entry.grade}
              className="rounded-xl border border-gray-100 p-4 dark:border-gray-700"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Grade {entry.grade}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <p className="rounded-lg bg-green-50 px-2 py-1 text-center font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
                  Happy {entry.happy}%
                </p>
                <p className="rounded-lg bg-blue-50 px-2 py-1 text-center font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  Neutral {entry.neutral}%
                </p>
                <p className="rounded-lg bg-amber-50 px-2 py-1 text-center font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  Needs Support {entry.support}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent Activity">
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
