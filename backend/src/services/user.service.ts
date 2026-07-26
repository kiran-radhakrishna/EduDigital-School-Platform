import type { Prisma, UserRole as PrismaUserRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'
import { AppError, ConflictError, NotFoundError } from '../utils/errors'
import { profileInclude, toSafeUser, type SafeUser } from './userMapper'

export interface ListUsersParams {
  role?: PrismaUserRole
  schoolId?: string
  search?: string
  page?: number
  limit?: number
}

export interface ListUsersResult {
  items: SafeUser[]
  total: number
  page: number
  limit: number
}

export async function listUsers(params: ListUsersParams): Promise<ListUsersResult> {
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20

  const where: Prisma.UserWhereInput = {
    role: params.role,
    schoolId: params.schoolId,
    ...(params.search
      ? {
          OR: [
            { email: { contains: params.search, mode: 'insensitive' } },
            { firstName: { contains: params.search, mode: 'insensitive' } },
            { lastName: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: profileInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return { items: users.map(toSafeUser), total, page, limit }
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { id }, include: profileInclude })
  return user ? toSafeUser(user) : null
}

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  role: PrismaUserRole
  schoolId?: string
  grade?: string
  rollNumber?: number
  dateOfBirth?: string
  subject?: string
  phone?: string
  title?: string
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const email = input.email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('An account with this email already exists.')
  }

  const passwordHash = await hashPassword(input.password)

  const createdId = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: input.role,
        passwordHash,
        schoolId: input.schoolId,
      },
    })

    switch (input.role) {
      case 'STUDENT': {
        if (!input.grade || input.rollNumber === undefined || !input.dateOfBirth) {
          throw new AppError('Students require grade, rollNumber, and dateOfBirth.')
        }
        await tx.student.create({
          data: {
            userId: created.id,
            schoolId: input.schoolId,
            grade: input.grade,
            rollNumber: input.rollNumber,
            dateOfBirth: new Date(input.dateOfBirth),
          },
        })
        break
      }
      case 'TEACHER': {
        await tx.teacher.create({
          data: { userId: created.id, schoolId: input.schoolId, subject: input.subject ?? 'Unassigned' },
        })
        break
      }
      case 'PARENT': {
        await tx.parent.create({
          data: { userId: created.id, schoolId: input.schoolId, phone: input.phone },
        })
        break
      }
      case 'AUTHORITY': {
        await tx.authority.create({
          data: { userId: created.id, schoolId: input.schoolId, title: input.title ?? 'Authority' },
        })
        break
      }
      case 'ADMINISTRATOR': {
        await tx.administrator.create({
          data: { userId: created.id, schoolId: input.schoolId, title: input.title ?? 'Administrator' },
        })
        break
      }
    }

    return created.id
  })

  const safeUser = await getUserById(createdId)
  if (!safeUser) {
    throw new AppError('Failed to create user.', 500)
  }
  return safeUser
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  schoolId?: string | null
  grade?: string
  rollNumber?: number
  dateOfBirth?: string
  subject?: string
  phone?: string
  title?: string
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    throw new NotFoundError('User not found.')
  }

  await prisma.$transaction(async (tx) => {
    if (input.firstName !== undefined || input.lastName !== undefined || input.schoolId !== undefined) {
      await tx.user.update({
        where: { id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          schoolId: input.schoolId,
        },
      })
    }

    if (
      existing.role === 'STUDENT' &&
      (input.grade !== undefined || input.rollNumber !== undefined || input.dateOfBirth !== undefined)
    ) {
      await tx.student.update({
        where: { userId: id },
        data: {
          grade: input.grade,
          rollNumber: input.rollNumber,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        },
      })
    } else if (existing.role === 'TEACHER' && input.subject !== undefined) {
      await tx.teacher.update({ where: { userId: id }, data: { subject: input.subject } })
    } else if (existing.role === 'PARENT' && input.phone !== undefined) {
      await tx.parent.update({ where: { userId: id }, data: { phone: input.phone } })
    } else if (existing.role === 'AUTHORITY' && input.title !== undefined) {
      await tx.authority.update({ where: { userId: id }, data: { title: input.title } })
    } else if (existing.role === 'ADMINISTRATOR' && input.title !== undefined) {
      await tx.administrator.update({ where: { userId: id }, data: { title: input.title } })
    }
  })

  const updated = await getUserById(id)
  if (!updated) {
    throw new AppError('Failed to update user.', 500)
  }
  return updated
}

export async function deleteUser(id: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    throw new NotFoundError('User not found.')
  }
  await prisma.user.delete({ where: { id } })
}
