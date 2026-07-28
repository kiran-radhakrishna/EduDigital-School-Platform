import { Router } from 'express'
import * as aiController from '../controllers/ai.controller'
import * as aiFeaturesController from '../controllers/aiFeatures.controller'
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

// Phase 7B — AI features. Each endpoint assembles feature-specific context, then calls the same
// aiService.sendMessage() used by /chat above — no provider logic is duplicated here.
aiRouter.post('/tutor/chat', authorize('STUDENT'), asyncHandler(aiFeaturesController.tutorChat))
aiRouter.post('/homework/chat', authorize('STUDENT', 'TEACHER'), asyncHandler(aiFeaturesController.homeworkChat))
aiRouter.post('/career/chat', authorize('STUDENT'), asyncHandler(aiFeaturesController.careerChat))
aiRouter.post('/study-plan/generate', authorize('STUDENT'), asyncHandler(aiFeaturesController.generateStudyPlan))
aiRouter.get('/study-plan', authorize('STUDENT'), asyncHandler(aiFeaturesController.listStudyPlans))
aiRouter.post('/teacher/chat', authorize('TEACHER'), asyncHandler(aiFeaturesController.teacherChat))
aiRouter.post('/parent/chat', authorize('PARENT'), asyncHandler(aiFeaturesController.parentChat))
aiRouter.post('/admin/chat', authorize('ADMINISTRATOR', 'AUTHORITY'), asyncHandler(aiFeaturesController.adminChat))
