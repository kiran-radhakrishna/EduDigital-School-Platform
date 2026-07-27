import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { formatDate, gradeLetter, percentage } from '../../utils/helpers'
import type { Grade as DemoGrade } from '../../types'
import { gradeApi } from '../../services/gradeApi'
import { classApi, type TeacherClassSummary } from '../../services/classApi'
import { parentApi, type ParentChild } from '../../services/parentApi'
import { GradesPanel } from '../../components/teacher/GradesPanel'

const DEMO_GRADES: DemoGrade[] = [
  { id: 'gr-1', subject: 'Mathematics', score: 94, maxScore: 100, date: '2026-09-02T08:00:00.000Z', teacher: 'Ms. Johnson' },
  { id: 'gr-2', subject: 'English', score: 83, maxScore: 100, date: '2026-09-04T08:00:00.000Z', teacher: 'Mr. Clark' },
  { id: 'gr-3', subject: 'Physics', score: 76, maxScore: 100, date: '2026-09-05T08:00:00.000Z', teacher: 'Dr. Patel' },
  { id: 'gr-4', subject: 'Biology', score: 88, maxScore: 100, date: '2026-09-08T08:00:00.000Z', teacher: 'Ms. Walker' },
  { id: 'gr-5', subject: 'History', score: 69, maxScore: 100, date: '2026-09-10T08:00:00.000Z', teacher: 'Mrs. Davis' },
  { id: 'gr-6', subject: 'Chemistry', score: 91, maxScore: 100, date: '2026-09-12T08:00:00.000Z', teacher: 'Dr. Lee' },
  { id: 'gr-7', subject: 'Computer Science', score: 97, maxScore: 100, date: '2026-09-14T08:00:00.000Z', teacher: 'Mr. Nguyen' },
  { id: 'gr-8', subject: 'Art', score: 85, maxScore: 100, date: '2026-09-16T08:00:00.000Z', teacher: 'Ms. Rivera' },
]

const getPerformanceVariant = (value: number) => {
  if (value >= 80) return 'success' as const
  if (value >= 60) return 'warning' as const
  return 'danger' as const
}

/** Shared subject-average cards + GPA banner + detailed table + chart. Same layout for demo and real student/parent views. */
function GradesReportView({ grades, heading }: { grades: DemoGrade[]; heading: string }) {
  const subjectAverages = useMemo(() => {
    const grouped = grades.reduce<Record<string, number[]>>((accumulator, grade) => {
      const score = percentage(grade.score, grade.maxScore)
      accumulator[grade.subject] = [...(accumulator[grade.subject] ?? []), score]
      return accumulator
    }, {})

    return Object.entries(grouped).map(([subject, values]) => {
      const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      return { subject, average, letter: gradeLetter(average, 100) }
    })
  }, [grades])

  const overallAverage =
    grades.length > 0
      ? Math.round(grades.reduce((sum, grade) => sum + percentage(grade.score, grade.maxScore), 0) / grades.length)
      : 0
  const overallGpa = ((overallAverage / 100) * 4).toFixed(2)
  const overallLetter = gradeLetter(overallAverage, 100)

  return (
    <div className="space-y-6">
      {subjectAverages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {subjectAverages.map((item) => (
            <Card
              key={item.subject}
              className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80"
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.subject}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.average}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                </div>
                <Badge variant={getPerformanceVariant(item.average)} className="px-3 py-1 text-base">
                  {item.letter}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card
        className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-indigo-900 dark:from-indigo-950/60 dark:to-purple-950/30"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{heading}</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overall GPA</p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallGpa}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{overallAverage}% overall average</p>
            </div>
            <Badge variant={getPerformanceVariant(overallAverage)} className="px-3 py-1 text-base">
              {overallLetter}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2 border-b border-gray-100 p-6 dark:border-gray-800">
          <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Results</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950/70">
              <tr>
                {['Subject', 'Score', 'Date', 'Teacher', 'Letter Grade'].map((heading2) => (
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
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No grades recorded yet.
                  </td>
                </tr>
              ) : (
                grades.map((grade) => {
                  const scorePercentage = percentage(grade.score, grade.maxScore)
                  return (
                    <tr key={grade.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-950/60">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{grade.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {grade.score}/{grade.maxScore} ({scorePercentage}%)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(grade.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{grade.teacher}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getPerformanceVariant(scorePercentage)}>
                          {gradeLetter(grade.score, grade.maxScore)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {subjectAverages.length > 0 && (
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <h2 className="px-6 pt-6 text-lg font-semibold text-gray-900 dark:text-white">Performance by Subject</h2>
          <div className="h-[280px] p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b81f" />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="average" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}

function StudentGradesView({ studentUserId }: { studentUserId: string }) {
  const [grades, setGrades] = useState<DemoGrade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    gradeApi
      .listForStudent(studentUserId)
      .then((apiGrades) => {
        if (cancelled) return
        setGrades(
          apiGrades.map((grade) => ({
            id: grade.id,
            subject: grade.subject.name,
            score: grade.score,
            maxScore: grade.maxScore,
            date: grade.date,
            teacher: '',
          })),
        )
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load grades.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading grades…</p>
      </Card>
    )
  }

  return <GradesReportView grades={grades} heading="Grades" />
}

function ParentGradesView({ parentUserId }: { parentUserId: string }) {
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
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing grades for</label>
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

      {selectedChildId && <StudentGradesView studentUserId={selectedChildId} />}
    </div>
  )
}

function TeacherGradesView({ teacherUserId }: { teacherUserId: string }) {
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
          <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Grades</h1>
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

      {selectedClassId && <GradesPanel classId={selectedClassId} />}
    </div>
  )
}

export default function Grades() {
  const { t } = useLanguage()
  const { user, isDemoMode } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user ? (
        <GradesReportView grades={DEMO_GRADES} heading={t.dashboard.grades} />
      ) : user.role === 'teacher' ? (
        <TeacherGradesView teacherUserId={user.id} />
      ) : user.role === 'parent' ? (
        <ParentGradesView parentUserId={user.id} />
      ) : (
        <StudentGradesView studentUserId={user.id} />
      )}
    </motion.div>
  )
}
