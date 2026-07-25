import { motion } from 'framer-motion'
import { Award, Calendar, CalendarCheck, ClipboardList, Download, MessageSquare, ShieldCheck } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'

import { Badge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { StatCard } from '../../components/common/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import type { Assignment, Grade } from '../../types'

const teacherEmail = 'sarah.johnson@digitalschool.edu'

const recentGrades: Grade[] = [
  { id: 'grade-1', subject: 'Mathematics', score: 94, maxScore: 100, date: '2026-07-01', teacher: 'Mr. Daniel Foster' },
  { id: 'grade-2', subject: 'English', score: 88, maxScore: 100, date: '2026-06-29', teacher: 'Ms. Olivia Reed' },
  { id: 'grade-3', subject: 'Biology', score: 91, maxScore: 100, date: '2026-06-27', teacher: 'Dr. Sophia Lane' },
  { id: 'grade-4', subject: 'History', score: 86, maxScore: 100, date: '2026-06-25', teacher: 'Mr. James Carter' },
  { id: 'grade-5', subject: 'Computer Science', score: 97, maxScore: 100, date: '2026-06-23', teacher: 'Mrs. Nina Brooks' },
]

const upcomingAssignments: Assignment[] = [
  { id: 'upcoming-1', title: 'Science Fair Presentation Slides', subject: 'Biology', dueDate: '2026-07-06', status: 'pending' },
  { id: 'upcoming-2', title: 'Essay on Civic Responsibility', subject: 'History', dueDate: '2026-07-08', status: 'pending' },
  { id: 'upcoming-3', title: 'Reading Journal Chapter 12', subject: 'English', dueDate: '2026-07-09', status: 'pending' },
  { id: 'upcoming-4', title: 'Scratch Game Enhancement', subject: 'Computer Science', dueDate: '2026-07-10', status: 'pending' },
]

const weeklyWellbeingTrend = [
  { day: 'Mon', score: 82 },
  { day: 'Tue', score: 78 },
  { day: 'Wed', score: 75 },
  { day: 'Thu', score: 80 },
  { day: 'Fri', score: 84 },
  { day: 'Sat', score: 88 },
  { day: 'Sun', score: 85 },
]

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'parent')
  const childName = currentUser.fullName

  const parentFirstName = currentUser.firstName

  const handleContactTeacher = () => {
    window.location.href = `mailto:${teacherEmail}?subject=${encodeURIComponent(`Update about ${childName}`)}`
  }

  const handleDownloadReport = () => {
    const report = [
      'Student Progress Report',
      `Student: ${childName}`,
      `Generated: ${formatDate('2026-07-03')}`,
      '',
      'Highlights:',
      '- Attendance: 96%',
      '- Average Grade: A',
      '- Pending Assignments: 3',
      '- Behavior Score: Excellent',
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${childName.toLowerCase().replace(/\s+/g, '-')}-progress-report.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {parentFirstName}! Here&apos;s how {childName} is doing.
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Stay updated on recent grades, assignments, and school progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CalendarCheck size={20} />} title="Child's Attendance" value="96%" />
        <StatCard icon={<Award size={20} />} title="Average Grade" value="A" />
        <StatCard icon={<ClipboardList size={20} />} title="Pending Assignments" value={3} />
        <StatCard icon={<ShieldCheck size={20} />} title="Behavior Score" value="Excellent" />
      </div>

      <Card title="Recent Grades">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="py-3 pr-4 font-medium">Subject</th>
                <th className="py-3 pr-4 font-medium">Score</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 font-medium">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentGrades.map((grade) => (
                <tr key={grade.id} className="text-sm text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{grade.subject}</td>
                  <td className="py-3 pr-4">
                    {grade.score}/{grade.maxScore}
                  </td>
                  <td className="py-3 pr-4">{formatDate(grade.date)}</td>
                  <td className="py-3">{grade.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Upcoming Assignments">
        <div className="space-y-3">
          {upcomingAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due {formatDate(assignment.dueDate)}</p>
              </div>
              <Badge variant="secondary" className="self-start sm:self-center">
                {assignment.subject}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Weekly Wellbeing Trend" subtitle="Only your child&apos;s wellbeing data">
        <div className="space-y-4">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyWellbeingTrend}>
                <XAxis dataKey="day" />
                <YAxis domain={[40, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
              Mostly Happy
            </p>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Sometimes Stressed
            </p>
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Needs Attention
            </p>
          </div>
        </div>
      </Card>

      <Card title="Quick Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleContactTeacher}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-indigo-500/10"
          >
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <MessageSquare size={20} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Contact Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/parent/timetable')}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-indigo-500/10"
          >
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Calendar size={20} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">View Timetable</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-indigo-500/10"
          >
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Download size={20} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Download Report</span>
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
