import { apiClient } from './apiClient'

export interface EnrollmentByGrade {
  grade: string
  students: number
}

export interface AttendanceTrendPoint {
  month: string
  attendancePercentage: number
}

export interface GradeWellbeingSummary {
  grade: string
  happy: number
  neutral: number
  needsSupport: number
}

export interface RecentRegistration {
  id: string
  name: string
  role: string
  joinedAt: string
}

export interface SchoolAnalytics {
  enrollmentByGrade: EnrollmentByGrade[]
  attendanceTrend: AttendanceTrendPoint[]
  wellbeingByGrade: GradeWellbeingSummary[]
  recentRegistrations: RecentRegistration[]
  totals: { students: number; teachers: number; parents: number; classes: number }
}

export const analyticsApi = {
  async getMySchoolAnalytics(): Promise<SchoolAnalytics> {
    const { data } = await apiClient.get<{ analytics: SchoolAnalytics }>('/analytics/school')
    return data.analytics
  },
}
