import { prisma } from '../config/prisma'
import { NotFoundError } from '../utils/errors'

// The public API is keyed by User.id everywhere (it's the only id the frontend
// has post-auth). These resolve a User.id to the internal role-profile row id.

export async function resolveStudentId(studentUserId: string): Promise<string> {
  const student = await prisma.student.findUnique({ where: { userId: studentUserId } })
  if (!student) {
    throw new NotFoundError('Student not found.')
  }
  return student.id
}

export async function resolveTeacherId(teacherUserId: string): Promise<string> {
  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } })
  if (!teacher) {
    throw new NotFoundError('Teacher not found.')
  }
  return teacher.id
}

export async function resolveParentId(parentUserId: string): Promise<string> {
  const parent = await prisma.parent.findUnique({ where: { userId: parentUserId } })
  if (!parent) {
    throw new NotFoundError('Parent not found.')
  }
  return parent.id
}

/** True if `parentUserId` (a parent's User.id) has `studentUserId` linked as a child. */
export async function isParentOfStudent(parentUserId: string, studentUserId: string): Promise<boolean> {
  const link = await prisma.parentStudent.findFirst({
    where: { parent: { userId: parentUserId }, student: { userId: studentUserId } },
  })
  return link !== null
}

/** The school a user belongs to (every role's User row carries schoolId directly). */
export async function getUserSchoolId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { schoolId: true } })
  return user?.schoolId ?? null
}

/** True if `teacherUserId` (a teacher's User.id) teaches or is homeroom teacher for `classId`. */
export async function isTeacherAssignedToClass(teacherUserId: string, classId: string): Promise<boolean> {
  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } })
  if (!teacher) return false

  const [assignment, homeroom] = await Promise.all([
    prisma.classAssignment.findFirst({ where: { teacherId: teacher.id, classId } }),
    prisma.schoolClass.findFirst({ where: { id: classId, homeroomTeacherId: teacher.id } }),
  ])
  return assignment !== null || homeroom !== null
}

/** True if `studentUserId` is enrolled in a class `teacherUserId` teaches or is homeroom teacher for. */
export async function isStudentInTeachersClass(teacherUserId: string, studentUserId: string): Promise<boolean> {
  const [teacher, student] = await Promise.all([
    prisma.teacher.findUnique({ where: { userId: teacherUserId } }),
    prisma.student.findUnique({ where: { userId: studentUserId } }),
  ])
  if (!teacher || !student) return false

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    select: { classId: true },
  })
  if (enrollments.length === 0) return false

  const classIds = enrollments.map((enrollment) => enrollment.classId)
  const [assignment, homeroom] = await Promise.all([
    prisma.classAssignment.findFirst({ where: { teacherId: teacher.id, classId: { in: classIds } } }),
    prisma.schoolClass.findFirst({ where: { id: { in: classIds }, homeroomTeacherId: teacher.id } }),
  ])
  return assignment !== null || homeroom !== null
}

/** The role and school of an arbitrary target user, or null if the user doesn't exist. */
export async function getUserRoleAndSchool(
  userId: string,
): Promise<{ role: string; schoolId: string | null } | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, schoolId: true } })
  return user ? { role: user.role, schoolId: user.schoolId } : null
}

// Never `include: { user: true }` on a nested relation — that pulls passwordHash
// along with it. Always select only the safe, public user fields.
export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const
