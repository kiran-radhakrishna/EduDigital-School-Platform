import { Router } from 'express'
import {
  forgotPassword,
  getAuditLog,
  getMyAuditLog,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerification,
  resetPasswordHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { authRateLimit } from '../middleware/rateLimits'
import { asyncHandler } from '../utils/asyncHandler'

export const authRouter = Router()

authRouter.post('/login', authRateLimit, asyncHandler(login))
authRouter.post('/register', authRateLimit, asyncHandler(register))
authRouter.post('/refresh', asyncHandler(refresh))
authRouter.post('/logout', asyncHandler(logout))
authRouter.get('/me', authenticate, asyncHandler(me))
authRouter.post('/forgot-password', authRateLimit, asyncHandler(forgotPassword))
authRouter.post('/reset-password', authRateLimit, asyncHandler(resetPasswordHandler))
authRouter.post('/resend-verification', authenticate, authRateLimit, asyncHandler(resendVerification))
authRouter.post('/verify-email', authRateLimit, asyncHandler(verifyEmailHandler))
authRouter.get('/audit-log/me', authenticate, asyncHandler(getMyAuditLog))
authRouter.get('/audit-log', authenticate, authorize('ADMINISTRATOR', 'AUTHORITY'), asyncHandler(getAuditLog))
