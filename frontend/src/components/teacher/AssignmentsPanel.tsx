import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { Input } from '../common/Input'
import { Modal } from '../common/Modal'
import { formatDate } from '../../utils/helpers'
import { assignmentApi, type Assignment } from '../../services/assignmentApi'
import { classApi, type ClassSubjectOption } from '../../services/classApi'

interface AssignmentFormState {
  subjectId: string
  title: string
  description: string
  dueDate: string
  maxScore: string
}

const EMPTY_FORM: AssignmentFormState = { subjectId: '', title: '', description: '', dueDate: '', maxScore: '100' }

const submissionStatusVariant = {
  PENDING: 'warning',
  SUBMITTED: 'info',
  GRADED: 'success',
} as const

export function AssignmentsPanel({ classId }: { classId: string }) {
  const [subjects, setSubjects] = useState<ClassSubjectOption[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [form, setForm] = useState<AssignmentFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { score: string; feedback: string }>>({})
  const [gradingKey, setGradingKey] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const [subjectList, assignmentList] = await Promise.all([
        classApi.getClassSubjects(classId),
        assignmentApi.listForClass(classId),
      ])
      setSubjects(subjectList)
      setAssignments(assignmentList)
    } catch {
      toast.error('Failed to load assignments.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([classApi.getClassSubjects(classId), assignmentApi.listForClass(classId)])
      .then(([subjectList, assignmentList]) => {
        if (cancelled) return
        setSubjects(subjectList)
        setAssignments(assignmentList)
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
  }, [classId])

  const openCreateModal = () => {
    setEditingAssignment(null)
    setForm({ ...EMPTY_FORM, subjectId: subjects[0]?.subjectId ?? '' })
    setIsModalOpen(true)
  }

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setForm({
      subjectId: assignment.subjectId,
      title: assignment.title,
      description: assignment.description ?? '',
      dueDate: assignment.dueDate.slice(0, 10),
      maxScore: String(assignment.maxScore),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.subjectId || !form.dueDate) {
      toast.error('Subject, title, and due date are required.')
      return
    }

    setIsSaving(true)
    try {
      if (editingAssignment) {
        await assignmentApi.update(editingAssignment.id, {
          subjectId: form.subjectId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          dueDate: form.dueDate,
          maxScore: Number(form.maxScore) || undefined,
        })
        toast.success('Assignment updated.')
      } else {
        await assignmentApi.create({
          classId,
          subjectId: form.subjectId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          dueDate: form.dueDate,
          maxScore: Number(form.maxScore) || undefined,
        })
        toast.success('Assignment created.')
      }
      setIsModalOpen(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await assignmentApi.remove(deleteTarget.id)
      toast.success('Assignment deleted.')
      setDeleteTarget(null)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete assignment.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGrade = async (assignmentId: string, studentUserId: string) => {
    const key = `${assignmentId}:${studentUserId}`
    const draft = gradeDrafts[key]
    if (!draft || draft.score.trim() === '') {
      toast.error('Enter a score first.')
      return
    }

    setGradingKey(key)
    try {
      await assignmentApi.grade(assignmentId, studentUserId, Number(draft.score), draft.feedback.trim() || undefined)
      toast.success('Submission graded.')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to grade submission.')
    } finally {
      setGradingKey(null)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading assignments…</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          New Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No assignments for this class yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const isExpanded = expandedId === assignment.id
            const gradedCount = assignment.submissions.filter((s) => s.status === 'GRADED').length

            return (
              <Card key={assignment.id} className="border border-gray-200/70 dark:border-gray-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{assignment.subject.name}</p>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due {formatDate(assignment.dueDate)} · Max {assignment.maxScore} pts · {gradedCount}/
                      {assignment.submissions.length} graded
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Submissions {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(assignment)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(assignment)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                    {assignment.submissions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No students enrolled.</p>
                    ) : (
                      assignment.submissions.map((submission) => {
                        const key = `${assignment.id}:${submission.student.user.id}`
                        const draft = gradeDrafts[key] ?? { score: '', feedback: '' }

                        return (
                          <div
                            key={submission.id}
                            className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {submission.student.user.firstName} {submission.student.user.lastName}
                              </p>
                              <Badge variant={submissionStatusVariant[submission.status]} size="sm">
                                {submission.status}
                                {submission.status === 'GRADED' && submission.score !== null
                                  ? ` · ${submission.score}/${assignment.maxScore}`
                                  : ''}
                              </Badge>
                            </div>

                            {submission.status === 'SUBMITTED' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder="Score"
                                  value={draft.score}
                                  onChange={(event) =>
                                    setGradeDrafts((current) => ({
                                      ...current,
                                      [key]: { ...draft, score: event.target.value },
                                    }))
                                  }
                                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                <Button
                                  size="sm"
                                  isLoading={gradingKey === key}
                                  onClick={() => handleGrade(assignment.id, submission.student.user.id)}
                                >
                                  Grade
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
        size="md"
      >
        <div className="space-y-4">
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
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
            <Input
              label="Max Score"
              type="number"
              value={form.maxScore}
              onChange={(event) => setForm((current) => ({ ...current, maxScore: event.target.value }))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            {editingAssignment ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Assignment"
        message={`Delete "${deleteTarget?.title}"? Student submissions will be removed too.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
