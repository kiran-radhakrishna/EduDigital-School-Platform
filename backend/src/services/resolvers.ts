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

// Never `include: { user: true }` on a nested relation — that pulls passwordHash
// along with it. Always select only the safe, public user fields.
export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const
