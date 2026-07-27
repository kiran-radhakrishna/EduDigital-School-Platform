import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { cn, formatDate } from '../../utils/helpers'
import type { Assignment as DemoAssignment } from '../../types'
import { assignmentApi } from '../../services/assignmentApi'
import { classApi, type TeacherClassSummary } from '../../services/classApi'
import { parentApi, type ParentChild } from '../../services/parentApi'
import { AssignmentsPanel } from '../../components/teacher/AssignmentsPanel'

const DEMO_ASSIGNMENTS: DemoAssignment[] = [
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

/** Shared list/search/filter table, driven by props. Same layout for demo view and the real student/parent views. */
function AssignmentsListView({
  assignments,
  heading,
  onSubmit,
}: {
  assignments: DemoAssignment[]
  heading: string
  onSubmit?: (id: string) => void
}) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesFilter = filter === 'all' ? true : assignment.status === filter
      const matchesQuery =
        assignment.title.toLowerCase().includes(query.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(query.toLowerCase())

      return matchesFilter && matchesQuery
    })
  }, [assignments, filter, query])

  return (
    <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{heading}</h1>
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

                {assignment.status === 'pending' && onSubmit && (
                  <div className="mt-4">
                    <Button size="sm" onClick={() => onSubmit(assignment.id)}>
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
                  {['Subject', 'Title', 'Due Date', 'Status', 'Grade', 'Action'].map((heading2) => (
                    <th
                      key={heading2}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {heading2}
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
                      {assignment.status === 'pending' && onSubmit ? (
                        <Button size="sm" onClick={() => onSubmit(assignment.id)}>
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
  )
}

function DemoAssignmentsPage() {
  const { t } = useLanguage()
  const [assignments, setAssignments] = useState<DemoAssignment[]>(DEMO_ASSIGNMENTS)

  const submitAssignment = (id: string) => {
    setAssignments((current) =>
      current.map((assignment) => (assignment.id === id ? { ...assignment, status: 'submitted' } : assignment)),
    )
    toast.success('Assignment submitted!')
  }

  return <AssignmentsListView assignments={assignments} heading={t.dashboard.assignments} onSubmit={submitAssignment} />
}

function StudentAssignmentsView({ studentUserId }: { studentUserId: string }) {
  const [assignments, setAssignments] = useState<DemoAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAssignments = () =>
    assignmentApi.listForStudent(studentUserId).then((submissions) =>
      submissions.map((submission) => ({
        id: submission.assignment.id,
        subject: submission.assignment.subject.name,
        title: submission.assignment.title,
        description: submission.assignment.description ?? undefined,
        dueDate: submission.assignment.dueDate,
        status: submission.status.toLowerCase() as DemoAssignment['status'],
        grade: submission.score ?? undefined,
        maxGrade: submission.status === 'GRADED' ? submission.assignment.maxScore : undefined,
      })),
    )

  useEffect(() => {
    let cancelled = false
    fetchAssignments()
      .then((mapped) => {
        if (!cancelled) setAssignments(mapped)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load assignments.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentUserId])

  const handleSubmit = async (assignmentId: string) => {
    try {
      await assignmentApi.submit(assignmentId)
      toast.success('Assignment submitted!')
      const mapped = await fetchAssignments()
      setAssignments(mapped)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit assignment.')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading assignments…</p>
      </Card>
    )
  }

  return <AssignmentsListView assignments={assignments} heading="Assignments" onSubmit={handleSubmit} />
}

function ParentAssignmentsView({ parentUserId }: { parentUserId: string }) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    parentApi
      .getChildren(parentUserId)
      .then((list) => {
        if (cancelled) return
        setChildren(list)
        if (list.length > 0) setSelectedChildId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load children.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </Card>
    )
  }

  if (children.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">No children linked to your account yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing assignments for</label>
        <select
          value={selectedChildId}
          onChange={(event) => setSelectedChildId(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </Card>

      {selectedChildId && <StudentAssignmentsView studentUserId={selectedChildId} />}
    </div>
  )
}

function TeacherAssignmentsView({ teacherUserId }: { teacherUserId: string }) {
  const [classes, setClasses] = useState<TeacherClassSummary[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    classApi
      .getMyClasses(teacherUserId)
      .then((list) => {
        if (cancelled) return
        setClasses(list)
        if (list.length > 0) setSelectedClassId(list[0].classId)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load your classes.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [teacherUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your classes…</p>
      </Card>
    )
  }

  if (classes.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">You are not assigned to any classes yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Assignments</h1>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
          <select
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {classes.map((classSummary) => (
              <option key={classSummary.classId} value={classSummary.classId}>
                {classSummary.className} — {classSummary.subjectName}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedClassId && <AssignmentsPanel classId={selectedClassId} />}
    </div>
  )
}

export default function Assignments() {
  const { user, isDemoMode } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user ? (
        <DemoAssignmentsPage />
      ) : user.role === 'teacher' ? (
        <TeacherAssignmentsView teacherUserId={user.id} />
      ) : user.role === 'parent' ? (
        <ParentAssignmentsView parentUserId={user.id} />
      ) : (
        <StudentAssignmentsView studentUserId={user.id} />
      )}
    </motion.div>
  )
}
