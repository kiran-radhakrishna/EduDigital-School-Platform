import { apiClient } from './apiClient'

export interface TeacherClassSummary {
  classId: string
  className: string
  grade: string
  section: string
  subjectId: string
  subjectName: string
}

export interface ClassRosterStudent {
  studentId: string
  userId: string
  name: string
  rollNumber: number
}

export interface ClassSubjectOption {
  subjectId: string
  subjectName: string
}

interface ClassAssignmentResponse {
  classId: string
  subjectId: string
  class: { name: string; grade: string; section: string }
  subject: { name: string }
}

interface ClassDetailResponse {
  enrollments: Array<{
    student: {
      id: string
      rollNumber: number
      user: { id: string; firstName: string; lastName: string }
    }
  }>
  classAssignments: Array<{ subjectId: string; subject: { name: string } }>
}

export const classApi = {
  /** `teacherUserId` — the teacher's User.id. Distinct classes they're assigned to teach. */
  async getMyClasses(teacherUserId: string): Promise<TeacherClassSummary[]> {
    const { data } = await apiClient.get<{ assignments: ClassAssignmentResponse[] }>(
      `/teachers/${teacherUserId}/assignments`,
    )

    const byClassId = new Map<string, TeacherClassSummary>()
    for (const assignment of data.assignments) {
      if (byClassId.has(assignment.classId)) continue
      byClassId.set(assignment.classId, {
        classId: assignment.classId,
        className: assignment.class.name,
        grade: assignment.class.grade,
        section: assignment.class.section,
        subjectId: assignment.subjectId,
        subjectName: assignment.subject.name,
      })
    }
    return [...byClassId.values()]
  },

  async getClassRoster(classId: string): Promise<ClassRosterStudent[]> {
    const { data } = await apiClient.get<{ class: ClassDetailResponse }>(`/classes/${classId}`)
    return data.class.enrollments.map((enrollment) => ({
      studentId: enrollment.student.id,
      userId: enrollment.student.user.id,
      name: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`,
      rollNumber: enrollment.student.rollNumber,
    }))
  },

  async getClassSubjects(classId: string): Promise<ClassSubjectOption[]> {
    const { data } = await apiClient.get<{ class: ClassDetailResponse }>(`/classes/${classId}`)
    return data.class.classAssignments.map((assignment) => ({
      subjectId: assignment.subjectId,
      subjectName: assignment.subject.name,
    }))
  },
}
