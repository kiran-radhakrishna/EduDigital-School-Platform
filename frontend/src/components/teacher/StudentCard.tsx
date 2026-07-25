import { AlertCircle, User } from 'lucide-react'
import type { ClassStudent } from '../../types/teacher'

interface StudentCardProps {
  student: ClassStudent
  onOpenPortfolio: (studentId: string) => void
}

export function StudentCard({ student, onOpenPortfolio }: StudentCardProps) {
  const wellbeingColors = {
    happy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    focused: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    needs_support: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const wellbeingLabel = {
    happy: '😊 Happy',
    focused: '🎯 Focused',
    neutral: '😐 Neutral',
    needs_support: '⚠️ Needs Support',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-start gap-3">
        <img
          src={student.photo}
          alt={student.name}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${wellbeingColors[student.wellbeingStatus]}`}
            >
              {wellbeingLabel[student.wellbeingStatus]}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {student.attendancePercent}%
          </p>
        </div>
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {student.averageGrade}
          </p>
        </div>
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {student.assignmentsDue}
          </p>
        </div>
      </div>

      {student.attendancePercent < 90 && (
        <div className="mb-3 rounded bg-red-50 p-2 dark:bg-red-900/20">
          <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Low attendance
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpenPortfolio(student.id)}
        className="w-full rounded-lg border border-indigo-600 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
      >
        <div className="flex items-center justify-center gap-1">
          <User className="h-4 w-4" />
          View Portfolio
        </div>
      </button>
    </div>
  )
}
