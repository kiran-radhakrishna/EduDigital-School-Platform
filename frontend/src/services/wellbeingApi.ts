import { apiClient } from './apiClient'
import type { WellbeingAssessment, WellbeingEmotion } from '../types/wellbeing'

interface BackendCheckIn {
  id: string
  emotion: string
  confidence: number
  createdAt: string
}

interface StatusResponse {
  status: {
    latest: BackendCheckIn | null
    completedToday: boolean
    skippedToday: boolean
  }
}

function toAssessment(checkIn: BackendCheckIn): WellbeingAssessment {
  return {
    emotion: checkIn.emotion.toLowerCase() as WellbeingEmotion,
    confidence: checkIn.confidence,
    timestamp: checkIn.createdAt,
  }
}

export interface WellbeingStatus {
  latestAssessment: WellbeingAssessment | null
  completedToday: boolean
  skippedToday: boolean
}

function toStatus(response: StatusResponse): WellbeingStatus {
  return {
    latestAssessment: response.status.latest ? toAssessment(response.status.latest) : null,
    completedToday: response.status.completedToday,
    skippedToday: response.status.skippedToday,
  }
}

export interface ClassWellbeingSummary {
  classId: string
  moodDistribution: { happy: number; focused: number; neutral: number; needsSupport: number }
  weeklyTrend: Array<{ label: string; happy: number; focused: number; neutral: number; needsSupport: number }>
  studentsRequestingSupport: Array<{
    studentId: string
    studentName: string
    emotion: string
    timestamp: string
    stress: number
  }>
}

export interface StudentWellbeingRecord {
  id: string
  emotion: string
  confidence: number
  stressLevel: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  aiResponse: string
  recommendation: string
  createdAt: string
}

export interface StudentWellbeingDetail {
  latest: StudentWellbeingRecord | null
  history: StudentWellbeingRecord[]
}

export const wellbeingApi = {
  async getStatus(): Promise<WellbeingStatus> {
    const { data } = await apiClient.get<StatusResponse>('/wellbeing/me')
    return toStatus(data)
  },

  async getClassWellbeing(classId: string): Promise<ClassWellbeingSummary> {
    const { data } = await apiClient.get<{ summary: ClassWellbeingSummary }>(`/wellbeing/classes/${classId}`)
    return data.summary
  },

  async getStudentWellbeing(studentUserId: string): Promise<StudentWellbeingDetail> {
    const { data } = await apiClient.get<StudentWellbeingDetail>(`/wellbeing/students/${studentUserId}`)
    return data
  },

  async createCheckIn(
    emotion: WellbeingEmotion,
    confidence: number,
    source: 'camera' | 'manual',
  ): Promise<WellbeingStatus> {
    await apiClient.post('/wellbeing/check-ins', { emotion: emotion.toUpperCase(), confidence, source })
    return wellbeingApi.getStatus()
  },

  async skipToday(): Promise<WellbeingStatus> {
    const { data } = await apiClient.post<StatusResponse>('/wellbeing/skip')
    return toStatus(data)
  },
}
