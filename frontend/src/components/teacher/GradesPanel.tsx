import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Modal } from '../common/Modal'
import { formatDate, percentage } from '../../utils/helpers'
import { gradeApi, type Grade, type GradeType } from '../../services/gradeApi'
import { classApi, type ClassRosterStudent, type ClassSubjectOption } from '../../services/classApi'

const GRADE_TYPES: GradeType[] = ['ASSIGNMENT', 'EXAM', 'PROJECT', 'PARTICIPATION']

interface GradeFormState {
  studentUserId: string
  subjectId: string
  type: GradeType
  title: string
  score: string
  maxScore: string
  date: string
}

function emptyForm(roster: ClassRosterStudent[], subjects: ClassSubjectOption[]): GradeFormState {
  return {
    studentUserId: roster[0]?.userId ?? '',
    subjectId: subjects[0]?.subjectId ?? '',
    type: 'ASSIGNMENT',
    title: '',
    score: '',
    maxScore: '100',
    date: new Date().toISOString().slice(0, 10),
  }
}

export function GradesPanel({ classId }: { classId: string }) {
  const [roster, setRoster] = useState<ClassRosterStudent[]>([])
  const [subjects, setSubjects] = useState<ClassSubjectOption[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<GradeFormState>(emptyForm([], []))
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const [rosterList, subjectList, gradeList] = await Promise.all([
        classApi.getClassRoster(classId),
        classApi.getClassSubjects(classId),
        gradeApi.listForClass(classId),
      ])
      setRoster(rosterList)
      setSubjects(subjectList)
      setGrades(gradeList)
    } catch {
      toast.error('Failed to load grades.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([classApi.getClassRoster(classId), classApi.getClassSubjects(classId), gradeApi.listForClass(classId)])
      .then(([rosterList, subjectList, gradeList]) => {
        if (cancelled) return
        setRoster(rosterList)
        setSubjects(subjectList)
        setGrades(gradeList)
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
  }, [classId])

  const studentNameByStudentId = useMemo(() => new Map(roster.map((s) => [s.studentId, s.name])), [roster])

  const openModal = () => {
    setForm(emptyForm(roster, subjects))
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.studentUserId || !form.subjectId || !form.title.trim() || !form.score || !form.maxScore) {
      toast.error('All fields are required.')
      return
    }

    setIsSaving(true)
    try {
      await gradeApi.record({
        studentUserId: form.studentUserId,
        classId,
        subjectId: form.subjectId,
        type: form.type,
        title: form.title.trim(),
        score: Number(form.score),
        maxScore: Number(form.maxScore),
        date: form.date,
      })
      toast.success('Grade recorded.')
      setIsModalOpen(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record grade.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading grades…</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openModal} disabled={roster.length === 0}>
          Record Grade
        </Button>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No grades recorded for this class yet.</p>
      ) : (
        <Card className="overflow-x-auto border border-gray-200/70 dark:border-gray-700">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                <th className="py-2 pr-4 font-medium">Student</th>
                <th className="py-2 pr-4 font-medium">Subject</th>
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 pr-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">
                    {studentNameByStudentId.get(grade.studentId) ?? 'Unknown student'}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{grade.subject.name}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{grade.title}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                    {grade.score}/{grade.maxScore} ({percentage(grade.score, grade.maxScore)}%)
                  </td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title="Record Grade" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
            <select
              value={form.studentUserId}
              onChange={(event) => setForm((current) => ({ ...current, studentUserId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {roster.map((student) => (
                <option key={student.userId} value={student.userId}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <select
                value={form.subjectId}
                onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as GradeType }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {GRADE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Midterm Exam"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Score"
              type="number"
              value={form.score}
              onChange={(event) => setForm((current) => ({ ...current, score: event.target.value }))}
            />
            <Input
              label="Max Score"
              type="number"
              value={form.maxScore}
              onChange={(event) => setForm((current) => ({ ...current, maxScore: event.target.value }))}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            Save Grade
          </Button>
        </div>
      </Modal>
    </div>
  )
}
