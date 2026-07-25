import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { StudentPortfolioView } from '../../components/portfolio/StudentPortfolioView'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
const parentStudentId = 'student-krn'

export default function ProfilePage() {
  const { user } = useAuth()
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    user?.role === 'teacher' || user?.role === 'admin'
      ? 'student-krn'
      : user?.role === 'parent'
        ? parentStudentId
        : user?.id ?? 'student-krn',
  )
  const [parentNoteDraft, setParentNoteDraft] = useState('')
  const [parentNotes, setParentNotes] = useState<Array<{ id: string; date: string; note: string }>>([])

  const activeStudentId = useMemo(() => {
    if (!user) return selectedStudentId
    if (user.role === 'student') return user.id
    if (user.role === 'parent') return parentStudentId
    return selectedStudentId
  }, [selectedStudentId, user])

  const { portfolio, students } = usePortfolio(activeStudentId)

  if (!portfolio) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio data is unavailable for this student.</p>
      </div>
    )
  }

  const isTeacher = user?.role === 'teacher'
  const isParent = user?.role === 'parent'
  const isAuthority = user?.role === 'admin'
  const includeTeacherNotes = !isParent
  const includeParentNotes = !isTeacher && !isAuthority

  const mergedPortfolio = includeParentNotes
    ? {
        ...portfolio,
        parentNotes: [...portfolio.parentNotes, ...parentNotes],
      }
    : portfolio

  const addParentNote = () => {
    const note = parentNoteDraft.trim()
    if (!note) return
    setParentNotes((current) => [
      {
        id: `parent-note-${current.length + 1}`,
        date: new Date().toISOString(),
        note,
      },
      ...current,
    ])
    setParentNoteDraft('')
  }

  const exportPortfolio = () => {
    const payload = JSON.stringify(mergedPortfolio, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${mergedPortfolio.personal.name.replace(/\s+/g, '-').toLowerCase()}-portfolio.json`
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Student Portfolio</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A complete journey of academics, activities, achievements, wellbeing, and growth milestones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(isTeacher || isAuthority) && (
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              >
                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
            {(isAuthority || isTeacher) && (
              <button
                type="button"
                onClick={exportPortfolio}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {isParent && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Add Parent Note</h2>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <textarea
              value={parentNoteDraft}
              onChange={(event) => setParentNoteDraft(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              placeholder="Add a personal note for your child's growth journey."
            />
            <button
              type="button"
              onClick={addParentNote}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      <StudentPortfolioView
        portfolio={mergedPortfolio}
        includeTeacherNotes={includeTeacherNotes}
        includeParentNotes={includeParentNotes}
      />
    </div>
  )
}
