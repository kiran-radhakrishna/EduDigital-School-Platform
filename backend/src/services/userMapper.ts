import type { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client'

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

export const profileInclude = {
  student: true,
  teacher: true,
  parent: true,
  authority: true,
  administrator: true,
} as const

export type UserWithProfiles = PrismaUser & {
  student: { grade: string } | null
  teacher: { subject: string } | null
  parent: { phone: string | null } | null
  authority: { title: string } | null
  administrator: { title: string } | null
}

export function mapRole(role: PrismaUserRole): FrontendRole {
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

export function toSafeUser(user: UserWithProfiles): SafeUser {
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
