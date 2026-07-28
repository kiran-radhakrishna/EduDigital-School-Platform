import { Router } from 'express'
import * as aiController from '../controllers/ai.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { aiRateLimit } from '../middleware/aiRateLimit'
import { asyncHandler } from '../utils/asyncHandler'

export const aiRouter = Router()

aiRouter.use(authenticate)
aiRouter.use(aiRateLimit)

aiRouter.post('/chat', asyncHandler(aiController.sendChatMessage))
aiRouter.get('/conversations', asyncHandler(aiController.listConversations))
aiRouter.get('/conversations/:id', asyncHandler(aiController.getConversation))
aiRouter.get('/usage/me', asyncHandler(aiController.getMyUsage))
aiRouter.get('/usage', authorize('ADMINISTRATOR', 'AUTHORITY'), asyncHandler(aiController.getSchoolUsage))
