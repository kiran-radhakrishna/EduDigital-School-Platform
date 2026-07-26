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

export const wellbeingApi = {
  async getStatus(): Promise<WellbeingStatus> {
    const { data } = await apiClient.get<StatusResponse>('/wellbeing/me')
    return toStatus(data)
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
