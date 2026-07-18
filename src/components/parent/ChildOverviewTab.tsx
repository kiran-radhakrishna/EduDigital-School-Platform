import { TrendingUp, Users, BookOpen, Calendar } from 'lucide-react'
import type { ChildProgress } from '../../types/parent'

interface ChildOverviewTabProps {
  childProgress: ChildProgress
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

export function ChildOverviewTab({ childProgress }: ChildOverviewTabProps) {

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.8) return 'text-green-600 dark:text-green-400'
    if (gpa >= 3.5) return 'text-blue-600 dark:text-blue-400'
    if (gpa >= 3.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
              <p className={`text-2xl font-bold ${childProgress.attendance.percentage >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {childProgress.attendance.percentage}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 p-3 dark:bg-dark-700">
              <Users className="h-full w-full text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current GPA</p>
              <p className={`text-2xl font-bold ${getGradeColor(childProgress.currentGPA)}`}>
                {childProgress.currentGPA.toFixed(1)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 p-3 dark:bg-dark-700">
              <TrendingUp className="h-full w-full text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Homework</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {childProgress.homework.completed}/{childProgress.homework.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {childProgress.homework.pending} pending
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-50 p-3 dark:bg-dark-700">
              <BookOpen className="h-full w-full text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assignments</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {childProgress.assignments.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                pending
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-50 p-3 dark:bg-dark-700">
              <Calendar className="h-full w-full text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
        <div className="space-y-3">
          {childProgress.weeklyProgress.map((week) => (
            <div key={week.week} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{week.week}</span>
                <span className="font-medium text-gray-900 dark:text-white">{week.academicScore}%</span>
              </div>
              <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700">
                <div
                  className="bg-blue-500"
                  style={{ width: `${week.academicScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Notes */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Teacher Notes</h3>
        <div className="space-y-3">
          {childProgress.teacherNotes.length > 0 ? (
            childProgress.teacherNotes.map((note) => (
              <div key={note.id} className="border-l-4 border-primary-500 bg-blue-50 p-3 dark:bg-dark-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{note.teacher}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{note.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{note.date}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{note.note}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No teacher notes yet</p>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Upcoming Events
        </h3>
        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
          {childProgress.upcomingEvents} events
        </p>
      </div>
    </div>
  )
}
