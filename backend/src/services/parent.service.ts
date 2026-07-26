import { prisma } from '../config/prisma'
import { ConflictError, NotFoundError } from '../utils/errors'
import { profileInclude, toSafeUser, type SafeUser } from './userMapper'

async function resolveParentId(parentUserId: string): Promise<string> {
  const parent = await prisma.parent.findUnique({ where: { userId: parentUserId } })
  if (!parent) {
    throw new NotFoundError('Parent not found.')
  }
  return parent.id
}

async function resolveStudentId(studentUserId: string): Promise<string> {
  const student = await prisma.student.findUnique({ where: { userId: studentUserId } })
  if (!student) {
    throw new NotFoundError('Student not found.')
  }
  return student.id
}

/** `parentUserId` — the parent's User.id. Returns the linked children as SafeUser objects. */
export async function getChildren(parentUserId: string): Promise<SafeUser[]> {
  const parentId = await resolveParentId(parentUserId)

  const links = await prisma.parentStudent.findMany({
    where: { parentId },
    include: { student: { include: { user: { include: profileInclude } } } },
  })

  return links.map((link) => toSafeUser(link.student.user))
}

/** Links a student to a parent. Both ids are User.id. Admin-only operation. */
export async function addChild(parentUserId: string, studentUserId: string): Promise<SafeUser[]> {
  const parentId = await resolveParentId(parentUserId)
  const studentId = await resolveStudentId(studentUserId)

  const existing = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId, studentId } },
  })
  if (existing) {
    throw new ConflictError('This student is already linked to this parent.')
  }

  await prisma.parentStudent.create({ data: { parentId, studentId } })
  return getChildren(parentUserId)
}

export async function removeChild(parentUserId: string, studentUserId: string): Promise<SafeUser[]> {
  const parentId = await resolveParentId(parentUserId)
  const studentId = await resolveStudentId(studentUserId)

  await prisma.parentStudent.deleteMany({ where: { parentId, studentId } })
  return getChildren(parentUserId)
}
