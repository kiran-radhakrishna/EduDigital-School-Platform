import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ChildProfile, ChildProgress } from '../../types/parent'

interface ChildCardProps {
  child: ChildProfile
  progress?: ChildProgress
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

export function ChildCard({ child, progress, onOpen }: ChildCardProps) {
  const wellbeingStatus = useMemo(() => {
    const hash = hashString(child.id)
    const statuses = ['happy', 'focused', 'neutral', 'stressed']
    return statuses[hash % statuses.length]
  }, [child.id])

  const wellbeingColor = {
    happy: 'text-green-500 bg-green-50 dark:bg-green-950',
    focused: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    neutral: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    stressed: 'text-red-500 bg-red-50 dark:bg-red-950',
  }[wellbeingStatus]

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary-400 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={child.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
            alt={child.name}
            className="h-12 w-12 rounded-full border-2 border-primary-400"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{child.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{child.grade} • {child.class}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* Attendance */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Attendance</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{progress?.attendance.percentage}%</p>
        </div>

        {/* GPA */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Current GPA</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{child.currentGPA.toFixed(1)}</p>
        </div>

        {/* Homework */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Homework</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {progress?.homework.completed}/{progress?.homework.total}
          </p>
        </div>

        {/* Wellbeing */}
        <div className={`rounded-lg p-3 ${wellbeingColor}`}>
          <p className="text-xs font-medium capitalize">{wellbeingStatus}</p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onOpen}
        className="w-full rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-all hover:bg-primary-600 flex items-center justify-center gap-2 group"
      >
        <span>Open Dashboard</span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}
