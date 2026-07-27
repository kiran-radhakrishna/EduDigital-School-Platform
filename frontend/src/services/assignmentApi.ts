import axios from 'axios'
import { apiClient } from './apiClient'

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'GRADED'

export interface AssignmentSubmission {
  id: string
  studentId: string
  status: SubmissionStatus
  submittedAt?: string | null
  content?: string | null
  score?: number | null
  feedback?: string | null
  gradedAt?: string | null
  student: { id: string; user: { id: string; firstName: string; lastName: string } }
}

export interface Assignment {
  id: string
  classId: string
  subjectId: string
  title: string
  description?: string | null
  dueDate: string
  maxScore: number
  createdAt: string
  subject: { id: string; name: string }
  teacher: { id: string; user: { id: string; firstName: string; lastName: string } }
  submissions: AssignmentSubmission[]
}

export interface StudentAssignmentSubmission {
  id: string
  status: SubmissionStatus
  submittedAt?: string | null
  content?: string | null
  score?: number | null
  feedback?: string | null
  assignment: {
    id: string
    classId: string
    title: string
    description?: string | null
    dueDate: string
    maxScore: number
    subject: { id: string; name: string }
    teacher: { id: string; user: { id: string; firstName: string; lastName: string } }
  }
}

export interface CreateAssignmentInput {
  classId: string
  subjectId: string
  title: string
  description?: string
  dueDate: string
  maxScore?: number
}

export interface UpdateAssignmentInput {
  subjectId?: string
  title?: string
  description?: string
  dueDate?: string
  maxScore?: number
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const assignmentApi = {
  async listForClass(classId: string): Promise<Assignment[]> {
    const { data } = await apiClient.get<{ assignments: Assignment[] }>('/assignments', { params: { classId } })
    return data.assignments
  },

  async getById(id: string): Promise<Assignment> {
    const { data } = await apiClient.get<{ assignment: Assignment }>(`/assignments/${id}`)
    return data.assignment
  },

  async create(input: CreateAssignmentInput): Promise<Assignment> {
    try {
      const { data } = await apiClient.post<{ assignment: Assignment }>('/assignments', input)
      return data.assignment
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create assignment.'), { cause: error })
    }
  },

  async update(id: string, input: UpdateAssignmentInput): Promise<Assignment> {
    try {
      const { data } = await apiClient.patch<{ assignment: Assignment }>(`/assignments/${id}`, input)
      return data.assignment
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update assignment.'), { cause: error })
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/assignments/${id}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete assignment.'), { cause: error })
    }
  },

  async submit(id: string, content?: string): Promise<Assignment> {
    try {
      const { data } = await apiClient.post<{ assignment: Assignment }>(`/assignments/${id}/submit`, { content })
      return data.assignment
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to submit assignment.'), { cause: error })
    }
  },

  async grade(id: string, studentUserId: string, score: number, feedback?: string): Promise<Assignment> {
    try {
      const { data } = await apiClient.post<{ assignment: Assignment }>(`/assignments/${id}/grade`, {
        studentUserId,
        score,
        feedback,
      })
      return data.assignment
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to grade submission.'), { cause: error })
    }
  },

  async listForStudent(studentUserId: string): Promise<StudentAssignmentSubmission[]> {
    const { data } = await apiClient.get<{ submissions: StudentAssignmentSubmission[] }>(
      `/assignments/students/${studentUserId}`,
    )
    return data.submissions
  },
}
