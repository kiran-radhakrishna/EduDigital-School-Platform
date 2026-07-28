import type { UserRole as PrismaUserRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { AuthError } from '../utils/errors'
import { comparePassword, hashPassword } from '../utils/password'
import { generateOpaqueToken, hashToken } from '../utils/tokens'
import { sendEmail } from '../utils/email'
import { profileInclude, toSafeUser, type FrontendRole, type SafeUser } from './userMapper'
import { revokeAllSessions } from './session.service'

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000 // 1 hour
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type { FrontendRole, SafeUser }
export { AuthError }

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

  await requestEmailVerification(createdUserId).catch(() => {})

  return result
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  // Always resolve the same way whether or not the account exists, so this endpoint can't be
  // used to enumerate registered emails.
  if (!user) return

  const token = generateOpaqueToken()
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  })

  const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'Reset your EduDigital password',
    body: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
  })
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<string> {
  const tokenHash = hashToken(rawToken)
  const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw new AuthError('This reset link is invalid or has expired.', 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
  ])

  await revokeAllSessions(stored.userId)

  return stored.userId
}

export async function requestEmailVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.emailVerified) return

  const token = generateOpaqueToken()
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS) },
  })

  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'Verify your EduDigital email',
    body: `Verify your email by visiting: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  })
}

export async function verifyEmail(rawToken: string): Promise<string> {
  const tokenHash = hashToken(rawToken)
  const stored = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } })

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw new AuthError('This verification link is invalid or has expired.', 400)
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
  ])

  return stored.userId
}
