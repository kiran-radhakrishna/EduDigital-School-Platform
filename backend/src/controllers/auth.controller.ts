import type { Request, Response } from 'express'
import { z } from 'zod'
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME, signAuthToken } from '../utils/jwt'
import { env } from '../config/env'
import { AuthError, authenticateWithPassword, getAuthResultById, registerUser } from '../services/auth.service'

// In production the frontend and backend are on different origins (separate Vercel
// projects), so the cookie must be SameSite=None + Secure to survive cross-site fetches.
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: (env.nodeEnv === 'production' ? 'none' : 'lax') as 'none' | 'lax',
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

    const token = signAuthToken({ userId: user.id, role })
    res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: AUTH_COOKIE_MAX_AGE_MS })
    res.status(200).json({ user })
  } catch (error) {
    if (error instanceof AuthError) {
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

    const token = signAuthToken({ userId: user.id, role })
    res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: AUTH_COOKIE_MAX_AGE_MS })
    res.status(201).json({ user })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    throw error
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions)
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
