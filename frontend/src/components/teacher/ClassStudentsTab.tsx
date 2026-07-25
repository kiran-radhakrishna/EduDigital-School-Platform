import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { StudentCard } from './StudentCard'
import type { ClassStudent } from '../../types/teacher'

interface ClassStudentsTabProps {
  students: ClassStudent[]
  onOpenPortfolio: (studentId: string) => void
}

export function ClassStudentsTab({ students, onOpenPortfolio }: ClassStudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'grade'>('name')
  const [filterWellbeing, setFilterWellbeing] = useState<string | null>(null)

  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((student) => !filterWellbeing || student.wellbeingStatus === filterWellbeing)
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'attendance') {
        return b.attendancePercent - a.attendancePercent
      }
      if (sortBy === 'grade') {
        const gradeOrder = { 'A+': 10, A: 9, 'A-': 8, 'B+': 7, B: 6, 'B-': 5, 'C+': 4, C: 3, 'C-': 2, D: 1 }
        const gradeA = gradeOrder[a.averageGrade as keyof typeof gradeOrder] || 0
        const gradeB = gradeOrder[b.averageGrade as keyof typeof gradeOrder] || 0
        return gradeB - gradeA
      }
      return 0
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'attendance' | 'grade')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="attendance">Sort by Attendance</option>
            <option value="grade">Sort by Grade</option>
          </select>

          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <select
              value={filterWellbeing || ''}
              onChange={(e) => setFilterWellbeing(e.target.value || null)}
              className="rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Wellbeing</option>
              <option value="happy">😊 Happy</option>
              <option value="focused">🎯 Focused</option>
              <option value="neutral">😐 Neutral</option>
              <option value="needs_support">⚠️ Needs Support</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onOpenPortfolio={onOpenPortfolio}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">No students found</p>
        </div>
      )}
    </div>
  )
}
