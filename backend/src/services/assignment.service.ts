import { prisma } from '../config/prisma'
import { AppError, ConflictError, NotFoundError } from '../utils/errors'
import { resolveStudentId, resolveTeacherId, safeUserSelect } from './resolvers'

const assignmentInclude = {
  subject: true,
  teacher: { include: { user: { select: safeUserSelect } } },
  submissions: { include: { student: { include: { user: { select: safeUserSelect } } } } },
} as const

export interface CreateAssignmentInput {
  classId: string
  subjectId: string
  /** The assigning teacher's User.id. */
  teacherUserId: string
  title: string
  description?: string
  dueDate: string
  maxScore?: number
}

export async function createAssignment(input: CreateAssignmentInput) {
  const teacherId = await resolveTeacherId(input.teacherUserId)

  const enrolledStudents = await prisma.enrollment.findMany({
    where: { classId: input.classId },
    select: { studentId: true },
  })

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.create({
      data: {
        classId: input.classId,
        subjectId: input.subjectId,
        teacherId,
        title: input.title.trim(),
        description: input.description,
        dueDate: new Date(input.dueDate),
        maxScore: input.maxScore ?? 100,
      },
    })

    if (enrolledStudents.length > 0) {
      await tx.assignmentSubmission.createMany({
        data: enrolledStudents.map((enrollment) => ({
          assignmentId: assignment.id,
          studentId: enrollment.studentId,
        })),
      })
    }

    return tx.assignment.findUniqueOrThrow({ where: { id: assignment.id }, include: assignmentInclude })
  })
}

export async function listAssignmentsForClass(classId: string) {
  return prisma.assignment.findMany({
    where: { classId },
    include: assignmentInclude,
    orderBy: { dueDate: 'asc' },
  })
}

export async function getAssignmentById(id: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id }, include: assignmentInclude })
  if (!assignment) {
    throw new NotFoundError('Assignment not found.')
  }
  return assignment
}

/** `studentUserId` — the submitting student's User.id. */
export async function submitAssignment(assignmentId: string, studentUserId: string, content?: string) {
  const studentId = await resolveStudentId(studentUserId)

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
  })
  if (!submission) {
    throw new NotFoundError('You are not enrolled in the class this assignment belongs to.')
  }
  if (submission.status === 'GRADED') {
    throw new ConflictError('This assignment has already been graded and cannot be resubmitted.')
  }

  await prisma.assignmentSubmission.update({
    where: { id: submission.id },
    data: { status: 'SUBMITTED', submittedAt: new Date(), content },
  })

  return getAssignmentById(assignmentId)
}

export interface GradeSubmissionInput {
  score: number
  feedback?: string
}

/** `teacherUserId` — the grading teacher's User.id (used only for an authorization anchor upstream). */
export async function gradeSubmission(
  assignmentId: string,
  studentUserId: string,
  input: GradeSubmissionInput,
) {
  const studentId = await resolveStudentId(studentUserId)
  const assignment = await getAssignmentById(assignmentId)

  if (input.score < 0 || input.score > assignment.maxScore) {
    throw new AppError(`Score must be between 0 and ${assignment.maxScore}.`)
  }

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
  })
  if (!submission) {
    throw new NotFoundError('Submission not found.')
  }

  await prisma.assignmentSubmission.update({
    where: { id: submission.id },
    data: { status: 'GRADED', score: input.score, feedback: input.feedback, gradedAt: new Date() },
  })

  return getAssignmentById(assignmentId)
}

export interface UpdateAssignmentInput {
  subjectId?: string
  title?: string
  description?: string
  dueDate?: string
  maxScore?: number
}

export async function updateAssignment(id: string, input: UpdateAssignmentInput) {
  await getAssignmentById(id)

  return prisma.assignment.update({
    where: { id },
    data: {
      subjectId: input.subjectId,
      title: input.title?.trim(),
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      maxScore: input.maxScore,
    },
    include: assignmentInclude,
  })
}

export async function deleteAssignment(id: string): Promise<void> {
  await getAssignmentById(id)
  await prisma.assignment.delete({ where: { id } })
}

/** `studentUserId` — the student's User.id. Lists every assignment across their enrolled classes. */
export async function getAssignmentsForStudent(studentUserId: string) {
  const studentId = await resolveStudentId(studentUserId)

  return prisma.assignmentSubmission.findMany({
    where: { studentId },
    include: {
      assignment: { include: { subject: true, teacher: { include: { user: { select: safeUserSelect } } } } },
    },
    orderBy: { assignment: { dueDate: 'asc' } },
  })
}
