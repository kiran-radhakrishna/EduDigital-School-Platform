import { Router } from 'express'
import { login, logout, me, register } from '../controllers/auth.controller'
import { authenticate } from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

export const authRouter = Router()

authRouter.post('/login', asyncHandler(login))
authRouter.post('/register', asyncHandler(register))
authRouter.post('/logout', logout)
authRouter.get('/me', authenticate, asyncHandler(me))
