import type { UserRole as PrismaUserRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ForbiddenError, NotFoundError } from '../utils/errors'
import * as aiService from './ai.service'
import { getStudentAttendanceSummary } from './attendance.service'
import { getProgressReport } from './grade.service'
import { getAssignmentsForStudent } from './assignment.service'
import { getTimetableForStudent } from './timetable.service'
import { getStatus as getWellbeingStatus } from './wellbeing.service'
import { getSchoolAnalytics, getFinanceAnalytics } from './analytics.service'
import { isParentOfStudent } from './resolvers'
import * as prompts from '../ai/prompts'

async function requireUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { student: true, teacher: true, school: true } })
  if (!user) {
    throw new NotFoundError('User not found.')
  }
  return user
}

export interface FeatureChatInput {
  userId: string
  schoolId: string | null
  conversationId?: string
  message: string
}

export async function tutorChat(input: FeatureChatInput) {
  const user = await requireUser(input.userId)
  const systemContext = prompts.tutorPrompt(user.firstName, user.student?.grade ?? 'unknown')
  return aiService.sendMessage({ ...input, feature: 'tutor', systemContext })
}

export interface HomeworkChatInput extends FeatureChatInput {
  requesterRole: PrismaUserRole
  mode?: 'student' | 'teacher'
}

export async function homeworkChat(input: HomeworkChatInput) {
  const mode = input.mode === 'teacher' ? 'teacher' : 'student'
  if (mode === 'teacher' && input.requesterRole !== 'TEACHER') {
    throw new ForbiddenError('Teacher Mode is only available to teachers.')
  }
  const systemContext = prompts.homeworkPrompt(mode)
  return aiService.sendMessage({ ...input, feature: mode === 'teacher' ? 'homework-teacher' : 'homework', systemContext })
}

function formatAttendance(summary: Awaited<ReturnType<typeof getStudentAttendanceSummary>>): string {
  return `Attendance: ${summary.percentage}% present (${summary.present} present, ${summary.absent} absent, ${summary.late} late, ${summary.excused} excused, out of ${summary.total} records).`
}

function formatProgress(report: Awaited<ReturnType<typeof getProgressReport>>): string {
  if (report.gradeCount === 0) return 'Grades: no grades recorded yet.'
  const bySubject = report.bySubject.map((s) => `${s.subjectName}: ${s.averagePercentage}%`).join(', ')
  return `Grades: GPA ${report.gpa}/4.0, overall ${report.overallPercentage}%. By subject — ${bySubject}.`
}

async function buildStudentAcademicContext(studentUserId: string): Promise<string> {
  const [attendance, progress, assignments, timetable, wellbeing] = await Promise.all([
    getStudentAttendanceSummary(studentUserId),
    getProgressReport(studentUserId),
    getAssignmentsForStudent(studentUserId),
    getTimetableForStudent(studentUserId),
    getWellbeingStatus(studentUserId),
  ])

  const pendingAssignments = assignments
    .filter((submission) => submission.status === 'PENDING')
    .map((submission) => `${submission.assignment.subject.name}: "${submission.assignment.title}" due ${submission.assignment.dueDate.toISOString().slice(0, 10)}`)

  const timetableLine = timetable
    .map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime} ${slot.subject.name}`)
    .join('; ')

  const wellbeingLine = wellbeing.latest
    ? `Wellbeing: recent mood ${wellbeing.latest.emotion}, risk level ${wellbeing.latest.riskLevel}.`
    : 'Wellbeing: no recent check-ins.'

  return [
    formatAttendance(attendance),
    formatProgress(progress),
    `Pending assignments: ${pendingAssignments.length > 0 ? pendingAssignments.join('; ') : 'none'}.`,
    `Timetable: ${timetableLine || 'not available'}.`,
    wellbeingLine,
  ].join('\n')
}

export async function careerChat(input: FeatureChatInput) {
  const context = await buildStudentAcademicContext(input.userId)
  const systemContext = prompts.careerPrompt(context)
  return aiService.sendMessage({ ...input, feature: 'career', systemContext })
}

export async function generateStudyPlan(userId: string, schoolId: string | null) {
  const context = await buildStudentAcademicContext(userId)
  const systemContext = prompts.studyPlanPrompt(context)
  const result = await aiService.sendMessage({
    userId,
    schoolId,
    message: 'Generate my personalized weekly study plan.',
    feature: 'study-planner',
    systemContext,
  })

  const plan = await prisma.studyPlan.create({
    data: { studentUserId: userId, conversationId: result.conversation.id, content: result.message.content },
  })

  return { plan, conversation: result.conversation, message: result.message }
}

export async function listStudyPlans(studentUserId: string) {
  return prisma.studyPlan.findMany({ where: { studentUserId }, orderBy: { createdAt: 'desc' } })
}

export async function teacherChat(input: FeatureChatInput) {
  const user = await requireUser(input.userId)
  if (!user.teacher) {
    throw new ForbiddenError('This feature is only available to teachers.')
  }
  const systemContext = prompts.teacherPrompt(user.firstName, user.teacher.subject)
  return aiService.sendMessage({ ...input, feature: 'teacher', systemContext })
}

export interface ParentChatInput extends FeatureChatInput {
  studentUserId: string
}

export async function parentChat(input: ParentChatInput) {
  const isChild = await isParentOfStudent(input.userId, input.studentUserId)
  if (!isChild) {
    throw new ForbiddenError('You do not have permission to view this child.')
  }
  const child = await requireUser(input.studentUserId)
  const context = await buildStudentAcademicContext(input.studentUserId)
  const systemContext = prompts.parentPrompt(child.firstName, context)
  return aiService.sendMessage({
    userId: input.userId,
    schoolId: input.schoolId,
    conversationId: input.conversationId,
    message: input.message,
    feature: 'parent',
    systemContext,
  })
}

export interface AdminChatInput extends FeatureChatInput {
  requesterRole: 'ADMINISTRATOR' | 'AUTHORITY'
}

export async function adminChat(input: AdminChatInput) {
  if (!input.schoolId) {
    throw new NotFoundError('No school is associated with this account.')
  }
  const [school, analytics, finance] = await Promise.all([
    prisma.school.findUnique({ where: { id: input.schoolId } }),
    getSchoolAnalytics(input.schoolId),
    getFinanceAnalytics(input.schoolId),
  ])

  const context = [
    `Enrollment by grade: ${analytics.enrollmentByGrade.map((g) => `${g.grade}: ${g.students}`).join(', ') || 'none'}.`,
    `Attendance trend (recent months): ${analytics.attendanceTrend.map((t) => `${t.month}: ${t.attendancePercentage}%`).join(', ') || 'none'}.`,
    `Wellbeing by grade: ${analytics.wellbeingByGrade.map((w) => `${w.grade} (happy ${w.happy}, neutral ${w.neutral}, needs support ${w.needsSupport})`).join(', ') || 'none'}.`,
    `Totals: ${analytics.totals.students} students, ${analytics.totals.teachers} teachers, ${analytics.totals.classes} classes.`,
    `Finance: total revenue ${finance.totalRevenue}, pending fees ${finance.pendingFees}, paid fees ${finance.paidFees}.`,
  ].join('\n')

  const systemContext = prompts.adminPrompt(input.requesterRole, school?.name ?? 'the school', context)
  return aiService.sendMessage({ ...input, feature: 'admin', systemContext })
}
