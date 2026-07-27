import { prisma } from '../config/prisma'
import { resolveStudentId, resolveTeacherId } from './resolvers'
import { getStudentEnrollment, getAssignedStudents, getTeacherAssignments } from './academic.service'
import { getStudentAttendanceSummary } from './attendance.service'
import { getProgressReport } from './grade.service'
import { getChildren } from './parent.service'

/** `studentUserId` — the student's User.id. Composes enrollment, attendance, and grades into one dashboard payload. */
export async function getStudentDashboard(studentUserId: string) {
  const studentId = await resolveStudentId(studentUserId)

  const [enrollment, attendanceSummary, progressReport, pendingAssignmentCount] = await Promise.all([
    getStudentEnrollment(studentUserId),
    getStudentAttendanceSummary(studentUserId),
    getProgressReport(studentUserId),
    prisma.assignmentSubmission.count({ where: { studentId, status: 'PENDING' } }),
  ])

  return {
    class: enrollment?.class
      ? { id: enrollment.class.id, name: enrollment.class.name, grade: enrollment.class.grade, section: enrollment.class.section }
      : null,
    subjects: enrollment?.class.classAssignments.map((assignment) => assignment.subject.name) ?? [],
    attendance: attendanceSummary,
    gpa: progressReport.gpa,
    overallPercentage: progressReport.overallPercentage,
    subjectGrades: progressReport.bySubject,
    pendingAssignmentCount,
  }
}

/** `teacherUserId` — the teacher's User.id. Composes assigned classes, roster size, and grading workload. */
export async function getTeacherDashboard(teacherUserId: string) {
  const teacherId = await resolveTeacherId(teacherUserId)

  const [assignments, assignedStudents, pendingGradingCount] = await Promise.all([
    getTeacherAssignments(teacherUserId),
    getAssignedStudents(teacherUserId),
    prisma.assignmentSubmission.count({
      where: { assignment: { teacherId }, status: 'SUBMITTED' },
    }),
  ])

  const classIds = new Set(assignments.map((assignment) => assignment.classId))
  const subjectNames = new Set(assignments.map((assignment) => assignment.subject.name))

  return {
    totalClasses: classIds.size,
    totalStudents: assignedStudents.length,
    subjects: Array.from(subjectNames),
    pendingGradingCount,
    classes: assignments.map((assignment) => ({
      classId: assignment.classId,
      className: assignment.class.name,
      subjectName: assignment.subject.name,
    })),
  }
}

/** `parentUserId` — the parent's User.id. One dashboard-ready summary per linked child. */
export async function getParentDashboard(parentUserId: string) {
  const children = await getChildren(parentUserId)

  const childSummaries = await Promise.all(
    children.map(async (child) => {
      const [enrollment, attendanceSummary, progressReport] = await Promise.all([
        getStudentEnrollment(child.id),
        getStudentAttendanceSummary(child.id),
        getProgressReport(child.id),
      ])

      return {
        id: child.id,
        name: child.name,
        avatar: child.avatar,
        grade: child.class ?? enrollment?.class.grade ?? 'Unassigned',
        className: enrollment?.class.name ?? null,
        subjects: enrollment?.class.classAssignments.map((assignment) => assignment.subject.name) ?? [],
        currentGPA: progressReport.gpa,
        attendancePercentage: attendanceSummary.percentage,
      }
    }),
  )

  return { children: childSummaries }
}
