import { apiClient } from './apiClient'

export interface StudentDashboard {
  class: { id: string; name: string; grade: string; section: string } | null
  subjects: string[]
  attendance: { total: number; present: number; absent: number; late: number; excused: number; percentage: number }
  gpa: number
  overallPercentage: number
  subjectGrades: Array<{ subjectId: string; subjectName: string; averagePercentage: number; gradeCount: number }>
  pendingAssignmentCount: number
}

export interface TeacherDashboard {
  totalClasses: number
  totalStudents: number
  subjects: string[]
  pendingGradingCount: number
  pendingAttendanceCount: number
  classes: Array<{ classId: string; className: string; subjectName: string }>
}

export interface ParentDashboardChild {
  id: string
  name: string
  avatar: string
  grade: string
  className: string | null
  subjects: string[]
  currentGPA: number
  attendancePercentage: number
}

export interface ParentDashboard {
  children: ParentDashboardChild[]
}

export const dashboardApi = {
  /** `studentUserId` — the student's own User.id, or a parent viewing their child. */
  async getStudentDashboard(studentUserId: string): Promise<StudentDashboard> {
    const { data } = await apiClient.get<{ dashboard: StudentDashboard }>(`/dashboard/students/${studentUserId}`)
    return data.dashboard
  },

  /** `teacherUserId` — the teacher's own User.id. */
  async getTeacherDashboard(teacherUserId: string): Promise<TeacherDashboard> {
    const { data } = await apiClient.get<{ dashboard: TeacherDashboard }>(`/dashboard/teachers/${teacherUserId}`)
    return data.dashboard
  },

  /** `parentUserId` — the parent's own User.id. One summary per linked child. */
  async getParentDashboard(parentUserId: string): Promise<ParentDashboard> {
    const { data } = await apiClient.get<{ dashboard: ParentDashboard }>(`/dashboard/parents/${parentUserId}`)
    return data.dashboard
  },
}
