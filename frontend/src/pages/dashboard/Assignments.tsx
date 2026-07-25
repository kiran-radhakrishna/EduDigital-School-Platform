import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useLanguage } from '../../hooks/useLanguage'
import { cn, formatDate } from '../../utils/helpers'
import type { Assignment } from '../../types'

const initialAssignments: Assignment[] = [
  { id: 'as-1', subject: 'Mathematics', title: 'Quadratic Equations Worksheet', dueDate: '2026-09-08T08:00:00.000Z', status: 'pending', description: 'Solve the 20 practice problems in Chapter 4.' },
  { id: 'as-2', subject: 'English', title: 'Book Reflection Essay', dueDate: '2026-09-10T08:00:00.000Z', status: 'submitted', description: 'Write a 500-word reflection on the assigned novel.' },
  { id: 'as-3', subject: 'Biology', title: 'Cell Structure Quiz Prep', dueDate: '2026-09-12T08:00:00.000Z', status: 'graded', grade: 18, maxGrade: 20 },
  { id: 'as-4', subject: 'History', title: 'Industrial Revolution Timeline', dueDate: '2026-09-13T08:00:00.000Z', status: 'pending' },
  { id: 'as-5', subject: 'Chemistry', title: 'Lab Report: Acids and Bases', dueDate: '2026-09-15T08:00:00.000Z', status: 'submitted' },
  { id: 'as-6', subject: 'Computer Science', title: 'Build a Sorting Visualizer', dueDate: '2026-09-18T08:00:00.000Z', status: 'graded', grade: 92, maxGrade: 100 },
  { id: 'as-7', subject: 'Physics', title: 'Newton’s Laws Problem Set', dueDate: '2026-09-19T08:00:00.000Z', status: 'pending' },
  { id: 'as-8', subject: 'Art', title: 'Perspective Drawing Portfolio', dueDate: '2026-09-21T08:00:00.000Z', status: 'submitted' },
  { id: 'as-9', subject: 'Physical Education', title: 'Weekly Fitness Journal', dueDate: '2026-09-22T08:00:00.000Z', status: 'graded', grade: 15, maxGrade: 15 },
  { id: 'as-10', subject: 'Mathematics', title: 'Statistics Mini Project', dueDate: '2026-09-24T08:00:00.000Z', status: 'pending' },
]

const statusBadgeVariant = {
  pending: 'warning',
  submitted: 'info',
  graded: 'success',
} as const

export default function Assignments() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesFilter = filter === 'all' ? true : assignment.status === filter
      const matchesQuery =
        assignment.title.toLowerCase().includes(query.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(query.toLowerCase())

      return matchesFilter && matchesQuery
    })
  }, [assignments, filter, query])

  const submitAssignment = (id: string) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id ? { ...assignment, status: 'submitted' } : assignment,
      ),
    )
    toast.success('Assignment submitted!')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.assignments}</h1>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ['all', t.common.all],
                ['pending', 'Pending'],
                ['submitted', 'Submitted'],
                ['graded', 'Graded'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    filter === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="w-full lg:max-w-sm">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${t.common.search} assignments...`}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-gray-500 dark:text-gray-400">{t.common.noData}</div>
        ) : (
          <>
            <div className="space-y-4 p-6 md:hidden">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{assignment.subject}</p>
                      <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                    </div>
                    <Badge variant={statusBadgeVariant[assignment.status]}>{assignment.status}</Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium text-gray-900 dark:text-white">Due:</span> {formatDate(assignment.dueDate)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900 dark:text-white">Grade:</span>{' '}
                      {assignment.status === 'graded' && assignment.grade !== undefined && assignment.maxGrade !== undefined
                        ? `${assignment.grade}/${assignment.maxGrade}`
                        : '—'}
                    </p>
                  </div>

                  {assignment.status === 'pending' && (
                    <div className="mt-4">
                      <Button size="sm" onClick={() => submitAssignment(assignment.id)}>
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-950/70">
                  <tr>
                    {['Subject', 'Title', 'Due Date', 'Status', 'Grade', 'Action'].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-950/60">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">{assignment.subject}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                          {assignment.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{assignment.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(assignment.dueDate)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadgeVariant[assignment.status]}>{assignment.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {assignment.status === 'graded' && assignment.grade !== undefined && assignment.maxGrade !== undefined
                          ? `${assignment.grade}/${assignment.maxGrade}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {assignment.status === 'pending' ? (
                          <Button size="sm" onClick={() => submitAssignment(assignment.id)}>
                            Submit
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  )
}
