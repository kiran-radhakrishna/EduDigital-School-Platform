import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useLanguage } from '../../hooks/useLanguage'
import { formatDate, gradeLetter, percentage } from '../../utils/helpers'
import type { Grade } from '../../types'

const grades: Grade[] = [
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

export default function Grades() {
  const { t } = useLanguage()

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
  }, [])

  const overallAverage = Math.round(
    grades.reduce((sum, grade) => sum + percentage(grade.score, grade.maxScore), 0) / grades.length,
  )
  const overallGpa = ((overallAverage / 100) * 4).toFixed(2)
  const overallLetter = gradeLetter(overallAverage, 100)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
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

      <Card
        className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-indigo-900 dark:from-indigo-950/60 dark:to-purple-950/30"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.grades}</h1>
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
                {['Subject', 'Score', 'Date', 'Teacher', 'Letter Grade'].map((heading) => (
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
              {grades.map((grade) => {
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
              })}
            </tbody>
          </table>
        </div>
      </Card>

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
    </motion.div>
  )
}
