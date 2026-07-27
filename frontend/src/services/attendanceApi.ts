import { apiClient } from './apiClient'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export interface AttendanceRange {
  from?: string
  to?: string
}

export interface AttendanceEntryInput {
  studentUserId: string
  status: AttendanceStatus
  reason?: string
}

export interface AttendanceStudentRecord {
  id: string
  date: string
  status: AttendanceStatus
  reason?: string | null
  class: { id: string; name: string }
}

export interface AttendanceClassRecord {
  id: string
  date: string
  status: AttendanceStatus
  reason?: string | null
  student: {
    id: string
    rollNumber: number
    user: { id: string; firstName: string; lastName: string }
  }
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

export const attendanceApi = {
  async recordForClass(
    classId: string,
    date: string,
    entries: AttendanceEntryInput[],
  ): Promise<AttendanceClassRecord[]> {
    const { data } = await apiClient.post<{ records: AttendanceClassRecord[] }>('/attendance', {
      classId,
      date,
      entries,
    })
    return data.records
  },

  async getForClass(classId: string, date: string): Promise<AttendanceClassRecord[]> {
    const { data } = await apiClient.get<{ records: AttendanceClassRecord[] }>('/attendance', {
      params: { classId, date },
    })
    return data.records
  },

  async getForStudent(studentUserId: string, range: AttendanceRange = {}): Promise<AttendanceStudentRecord[]> {
    const { data } = await apiClient.get<{ records: AttendanceStudentRecord[] }>(
      `/attendance/students/${studentUserId}`,
      { params: range },
    )
    return data.records
  },

  async getSummaryForStudent(studentUserId: string, range: AttendanceRange = {}): Promise<AttendanceSummary> {
    const { data } = await apiClient.get<{ summary: AttendanceSummary }>(
      `/attendance/students/${studentUserId}/summary`,
      { params: range },
    )
    return data.summary
  },
}
