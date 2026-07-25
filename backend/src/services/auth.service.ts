import type { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { comparePassword, hashPassword } from '../utils/password'

export type FrontendRole = 'student' | 'teacher' | 'parent' | 'admin'

export interface SafeUser {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  role: FrontendRole
  avatar: string
  class?: string
  subject?: string
  phone?: string
  joinedAt: string
}

export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 401) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
  }
}

const profileInclude = {
  student: true,
  teacher: true,
  parent: true,
  authority: true,
  administrator: true,
} as const

type UserWithProfiles = PrismaUser & {
  student: { grade: string } | null
  teacher: { subject: string } | null
  parent: { phone: string | null } | null
  authority: { title: string } | null
  administrator: { title: string } | null
}

function mapRole(role: PrismaUserRole): FrontendRole {
  switch (role) {
    case 'STUDENT':
      return 'student'
    case 'TEACHER':
      return 'teacher'
    case 'PARENT':
      return 'parent'
    case 'AUTHORITY':
    case 'ADMINISTRATOR':
      return 'admin'
  }
}

function toSafeUser(user: UserWithProfiles): SafeUser {
  const avatar = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'U'

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.firstName,
    email: user.email,
    role: mapRole(user.role),
    avatar,
    class: user.student?.grade,
    subject: user.teacher?.subject,
    phone: user.parent?.phone ?? undefined,
    joinedAt: user.createdAt.toISOString(),
  }
}

export interface AuthResult {
  user: SafeUser
  /** Raw DB role (distinguishes AUTHORITY/ADMINISTRATOR), used for the JWT + authorize middleware. */
  role: PrismaUserRole
}

export async function authenticateWithPassword(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: profileInclude,
  })

  if (!user) {
    throw new AuthError('Invalid email or password.')
  }

  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw new AuthError('Invalid email or password.')
  }

  return { user: toSafeUser(user), role: user.role }
}

export async function getAuthResultById(userId: string): Promise<AuthResult | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: profileInclude,
  })

  return user ? { user: toSafeUser(user), role: user.role } : null
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: FrontendRole
}

type RegistrableRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMINISTRATOR'

function frontendRoleToPrismaRole(role: FrontendRole): RegistrableRole {
  switch (role) {
    case 'student':
      return 'STUDENT'
    case 'teacher':
      return 'TEACHER'
    case 'parent':
      return 'PARENT'
    case 'admin':
      return 'ADMINISTRATOR'
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new AuthError('An account with this email already exists.', 409)
  }

  const nameParts = input.name.trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] ?? 'User'
  const lastName = nameParts.slice(1).join(' ')

  const passwordHash = await hashPassword(input.password)
  const role = frontendRoleToPrismaRole(input.role)

  const createdUserId = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, firstName, lastName, role, passwordHash },
    })

    if (role === 'STUDENT') {
      await tx.student.create({
        data: { userId: created.id, grade: 'Unassigned', rollNumber: 0, dateOfBirth: new Date() },
      })
    } else if (role === 'TEACHER') {
      await tx.teacher.create({ data: { userId: created.id, subject: 'Unassigned' } })
    } else if (role === 'PARENT') {
      await tx.parent.create({ data: { userId: created.id } })
    } else if (role === 'ADMINISTRATOR') {
      await tx.administrator.create({ data: { userId: created.id, title: 'Administrator' } })
    }

    return created.id
  })

  const result = await getAuthResultById(createdUserId)
  if (!result) {
    throw new AuthError('Failed to create account.', 500)
  }

  return result
}
