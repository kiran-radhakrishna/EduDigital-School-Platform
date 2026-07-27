import axios from 'axios'
import { apiClient } from './apiClient'

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'

export interface TimetableSlot {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  day: Weekday
  startTime: string
  endTime: string
  room?: string | null
  subject: { id: string; name: string }
  teacher: { id: string; user: { id: string; firstName: string; lastName: string } }
}

export interface TeacherTimetableSlot {
  id: string
  classId: string
  subjectId: string
  day: Weekday
  startTime: string
  endTime: string
  room?: string | null
  subject: { id: string; name: string }
  class: { id: string; name: string; grade: string; section: string }
}

export interface CreateSlotInput {
  classId: string
  subjectId: string
  teacherUserId: string
  day: Weekday
  startTime: string
  endTime: string
  room?: string
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const timetableApi = {
  async createSlot(input: CreateSlotInput): Promise<TimetableSlot> {
    try {
      const { data } = await apiClient.post<{ slot: TimetableSlot }>('/timetable', input)
      return data.slot
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create timetable slot.'), { cause: error })
    }
  },

  async getForClass(classId: string): Promise<TimetableSlot[]> {
    const { data } = await apiClient.get<{ slots: TimetableSlot[] }>('/timetable', { params: { classId } })
    return data.slots
  },

  async getForStudent(studentUserId: string): Promise<TimetableSlot[]> {
    const { data } = await apiClient.get<{ slots: TimetableSlot[] }>(`/timetable/students/${studentUserId}`)
    return data.slots
  },

  async getForTeacher(teacherUserId: string): Promise<TeacherTimetableSlot[]> {
    const { data } = await apiClient.get<{ slots: TeacherTimetableSlot[] }>(`/timetable/teachers/${teacherUserId}`)
    return data.slots
  },
}
