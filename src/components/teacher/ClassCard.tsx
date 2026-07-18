import { useMemo } from 'react'
import { BookOpen, AlertCircle, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import type { TeacherClass } from '../../types/teacher'

interface ClassCardProps {
  classData: TeacherClass
  onOpen: () => void
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

export function ClassCard({ classData, onOpen }: ClassCardProps) {
  const cardData = useMemo(() => {
    const hash = hashString(classData.id)
    return {
      unreadMessages: (hash % 3),
      homeworkCount: ((hash >> 8) % 20) + 5,
    }
  }, [classData.id])

  const avgGrade = 'A-'
  const homeworkPending = classData.students.reduce((sum, s) => sum + s.assignmentsDue, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 dark:border-gray-700 dark:from-indigo-900/30 dark:to-blue-900/30">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{classData.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{classData.subject}</p>
          </div>
          <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {classData.students.length} Students
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <StatItem
            icon={<AlertCircle className="h-4 w-4" />}
            label="Attendance Pending"
            value={`${classData.students.filter((s) => s.attendancePercent < 95).length} students`}
          />
          <StatItem
            icon={<BookOpen className="h-4 w-4" />}
            label="Assignments Pending"
            value={`${homeworkPending} due`}
          />
          <StatItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="Average Grade"
            value={avgGrade}
          />
          <StatItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="Homework Submitted"
            value={`${cardData.homeworkCount}/${classData.students.length}`}
          />
        </div>

        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            Next Lesson
          </div>
          {classData.nextLesson ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {classData.nextLesson.day} {classData.nextLesson.startTime} - {classData.nextLesson.endTime} in{' '}
              {classData.nextLesson.room}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">No upcoming lesson</p>
          )}
        </div>

        {cardData.unreadMessages > 0 && (
          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {cardData.unreadMessages} unread parent message{cardData.unreadMessages !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="w-full border-t border-gray-200 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:border-gray-700 dark:hover:bg-indigo-700"
      >
        Open Workspace
      </button>
    </div>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">{icon}</div>
      <p className="text-xs font-medium text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}
