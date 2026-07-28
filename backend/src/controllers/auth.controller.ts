import { randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
} from '../utils/jwt'
import { env } from '../config/env'
import {
  AuthError,
  authenticateWithPassword,
  getAuthResultById,
  registerUser,
  requestEmailVerification,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/auth.service'
import { issueSession, revokeRefreshToken, rotateSession } from '../services/session.service'
import { listAuditLog, logAudit } from '../services/audit.service'

// In production the frontend and backend are on different origins (separate Vercel
// projects), so cookies must be SameSite=None + Secure to survive cross-site fetches.
const isProd = env.nodeEnv === 'production'
const baseCookieOptions = { httpOnly: true, secure: isProd, sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' }
const accessCookieOptions = { ...baseCookieOptions, maxAge: AUTH_COOKIE_MAX_AGE_MS }
const refreshCookieOptions = { ...baseCookieOptions, maxAge: REFRESH_COOKIE_MAX_AGE_MS, path: '/auth' }
const csrfCookieOptions = { ...baseCookieOptions, httpOnly: false, maxAge: REFRESH_COOKIE_MAX_AGE_MS }

function setSessionCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(AUTH_COOKIE_NAME, accessToken, accessCookieOptions)
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions)
  res.cookie(CSRF_COOKIE_NAME, randomBytes(24).toString('base64url'), csrfCookieOptions)
}

function clearSessionCookies(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions)
  res.clearCookie(REFRESH_COOKIE_NAME, { ...baseCookieOptions, path: '/auth' })
  res.clearCookie(CSRF_COOKIE_NAME, baseCookieOptions)
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'teacher', 'parent', 'admin']),
})

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'A valid email and password are required.' })
    return
  }

  try {
    const { user, role } = await authenticateWithPassword(parsed.data.email, parsed.data.password)
    const { accessToken, refreshToken } = await issueSession(user.id, role)
    setSessionCookies(res, accessToken, refreshToken)
    await logAudit({ userId: user.id, action: 'auth.login.success', req })
    res.status(200).json({ user })
  } catch (error) {
    if (error instanceof AuthError) {
      await logAudit({ action: 'auth.login.failure', metadata: { email: parsed.data.email }, req })
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'A valid name, email, password (6+ characters), and role are required.' })
    return
  }

  try {
    const { user, role } = await registerUser(parsed.data)
    const { accessToken, refreshToken } = await issueSession(user.id, role)
    setSessionCookies(res, accessToken, refreshToken)
    await logAudit({ userId: user.id, action: 'auth.register', req })
    res.status(201).json({ user })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawRefreshToken: unknown = req.cookies?.[REFRESH_COOKIE_NAME]
  if (typeof rawRefreshToken !== 'string' || !rawRefreshToken) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  try {
    const { accessToken, refreshToken } = await rotateSession(rawRefreshToken)
    setSessionCookies(res, accessToken, refreshToken)
    await logAudit({ action: 'auth.refresh', req })
    res.status(200).json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      clearSessionCookies(res)
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawRefreshToken: unknown = req.cookies?.[REFRESH_COOKIE_NAME]
  if (typeof rawRefreshToken === 'string' && rawRefreshToken) {
    await revokeRefreshToken(rawRefreshToken)
  }
  await logAudit({ userId: req.userId, action: 'auth.logout', req })
  clearSessionCookies(res)
  res.status(200).json({ success: true })
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  const result = await getAuthResultById(userId)
  if (!result) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  res.status(200).json({ user: result.user })
}

const forgotPasswordSchema = z.object({ email: z.string().email() })

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'A valid email is required.' })
    return
  }

  await requestPasswordReset(parsed.data.email)
  await logAudit({ action: 'auth.password_reset.requested', metadata: { email: parsed.data.email }, req })
  // Same response whether or not the account exists, to avoid leaking which emails are registered.
  res.status(200).json({ success: true })
}

const resetPasswordSchema = z.object({ token: z.string().min(1), password: z.string().min(6) })

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'A reset token and a password (6+ characters) are required.' })
    return
  }

  try {
    const userId = await resetPassword(parsed.data.token, parsed.data.password)
    await logAudit({ userId, action: 'auth.password_reset.completed', req })
    res.status(200).json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export async function resendVerification(req: Request, res: Response): Promise<void> {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  await requestEmailVerification(userId)
  await logAudit({ userId, action: 'auth.email_verification.requested', req })
  res.status(200).json({ success: true })
}

const verifyEmailSchema = z.object({ token: z.string().min(1) })

export async function verifyEmailHandler(req: Request, res: Response): Promise<void> {
  const parsed = verifyEmailSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'A verification token is required.' })
    return
  }

  try {
    const userId = await verifyEmail(parsed.data.token)
    await logAudit({ userId, action: 'auth.email_verification.completed', req })
    res.status(200).json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export async function getMyAuditLog(req: Request, res: Response): Promise<void> {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  const entries = await listAuditLog({ userId })
  res.status(200).json({ entries })
}

const auditLogQuerySchema = z.object({ userId: z.string().min(1).optional(), action: z.string().min(1).optional() })

export async function getAuditLog(req: Request, res: Response): Promise<void> {
  const parsed = auditLogQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters.' })
    return
  }

  const entries = await listAuditLog(parsed.data)
  res.status(200).json({ entries })
}
