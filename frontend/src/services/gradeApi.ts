import axios from 'axios'
import { apiClient } from './apiClient'

export type GradeType = 'ASSIGNMENT' | 'EXAM' | 'PROJECT' | 'PARTICIPATION'

export interface Grade {
  id: string
  studentId: string
  classId: string
  subjectId: string
  teacherId: string
  type: GradeType
  title: string
  score: number
  maxScore: number
  date: string
  createdAt: string
  subject: { id: string; name: string }
}

export interface RecordGradeInput {
  studentUserId: string
  classId: string
  subjectId: string
  type: GradeType
  title: string
  score: number
  maxScore: number
  date: string
}

export interface SubjectAverage {
  subjectId: string
  subjectName: string
  averagePercentage: number
  gradeCount: number
}

export interface ProgressReport {
  gpa: number
  overallPercentage: number
  gradeCount: number
  bySubject: SubjectAverage[]
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const gradeApi = {
  async record(input: RecordGradeInput): Promise<Grade> {
    try {
      const { data } = await apiClient.post<{ grade: Grade }>('/grades', input)
      return data.grade
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to record grade.'), { cause: error })
    }
  },

  async listForClass(classId: string, subjectId?: string): Promise<Grade[]> {
    const { data } = await apiClient.get<{ grades: Grade[] }>('/grades', { params: { classId, subjectId } })
    return data.grades
  },

  async listForStudent(studentUserId: string, subjectId?: string): Promise<Grade[]> {
    const { data } = await apiClient.get<{ grades: Grade[] }>(`/grades/students/${studentUserId}`, {
      params: { subjectId },
    })
    return data.grades
  },

  async getProgressReport(studentUserId: string): Promise<ProgressReport> {
    const { data } = await apiClient.get<{ report: ProgressReport }>(
      `/grades/students/${studentUserId}/progress-report`,
    )
    return data.report
  },
}
