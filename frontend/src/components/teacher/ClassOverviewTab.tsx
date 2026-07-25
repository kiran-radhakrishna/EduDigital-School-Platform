import { useMemo } from 'react'
import { TrendingUp, Users, BookOpen, Clock } from 'lucide-react'
import type { TeacherClass } from '../../types/teacher'

interface ClassOverviewTabProps {
  classData: TeacherClass
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function ClassOverviewTab({ classData }: ClassOverviewTabProps) {
  const overviewData = useMemo(() => {
    const hash = hashString(classData.id)
    return {
      todayAttendance: ((hash % 85) + 10),
      homeworkCompletion: (((hash >> 8) % 40) + 50),
      assignmentCompletion: (((hash >> 16) % 35) + 45),
    }
  }, [classData.id])

  const avgGrade = 82

  const stats = [
    {
      label: 'Students',
      value: classData.studentCount.toString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: "Today's Attendance",
      value: `${overviewData.todayAttendance}%`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      label: 'Homework Completion',
      value: `${overviewData.homeworkCompletion}%`,
      icon: BookOpen,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Assignment Completion',
      value: `${overviewData.assignmentCompletion}%`,
      icon: Clock,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <div className={`rounded-lg ${stat.color} p-2`}>
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Average Grade Trend
          </h3>
          <p className="text-3xl font-bold text-indigo-600">{avgGrade}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">+2 points from last week</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Exam
          </h3>
          {classData.upcomingExam ? (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">
                {classData.upcomingExam.topic}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(classData.upcomingExam.date).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming exam</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Notifications
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ 3 assignments graded</p>
          <p>✓ 2 parent messages replied</p>
          <p>→ 5 attendance records pending</p>
        </div>
      </div>
    </div>
  )
}
