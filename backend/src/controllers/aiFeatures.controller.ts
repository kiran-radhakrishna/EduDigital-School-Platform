import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import * as aiService from '../services/ai.service'
import * as aiFeaturesService from '../services/aiFeatures.service'

function requireUserId(req: Request): string {
  if (!req.userId) throw new ForbiddenError()
  return req.userId
}

function requireUserRole(req: Request): NonNullable<Request['userRole']> {
  if (!req.userRole) throw new ForbiddenError()
  return req.userRole
}

const chatSchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).max(4000),
})

async function currentSchoolId(req: Request): Promise<string | null> {
  return aiService.getSchoolIdForAnyUser(requireUserId(req))
}

export async function tutorChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(chatSchema, req.body)
  const result = await aiFeaturesService.tutorChat({
    userId: requireUserId(req),
    schoolId: await currentSchoolId(req),
    ...input,
  })
  res.status(201).json(result)
}

const homeworkChatSchema = chatSchema.extend({ mode: z.enum(['student', 'teacher']).optional() })

export async function homeworkChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(homeworkChatSchema, req.body)
  const userId = requireUserId(req)
  const result = await aiFeaturesService.homeworkChat({
    userId,
    schoolId: await currentSchoolId(req),
    requesterRole: requireUserRole(req),
    ...input,
  })
  res.status(201).json(result)
}

export async function careerChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(chatSchema, req.body)
  const result = await aiFeaturesService.careerChat({
    userId: requireUserId(req),
    schoolId: await currentSchoolId(req),
    ...input,
  })
  res.status(201).json(result)
}

export async function teacherChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(chatSchema, req.body)
  const result = await aiFeaturesService.teacherChat({
    userId: requireUserId(req),
    schoolId: await currentSchoolId(req),
    ...input,
  })
  res.status(201).json(result)
}

const parentChatSchema = chatSchema.extend({ studentUserId: z.string().min(1) })

export async function parentChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(parentChatSchema, req.body)
  const result = await aiFeaturesService.parentChat({
    userId: requireUserId(req),
    schoolId: await currentSchoolId(req),
    ...input,
  })
  res.status(201).json(result)
}

export async function adminChat(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(chatSchema, req.body)
  const userId = requireUserId(req)
  const role = requireUserRole(req)
  if (role !== 'ADMINISTRATOR' && role !== 'AUTHORITY') {
    throw new ForbiddenError()
  }
  const result = await aiFeaturesService.adminChat({
    userId,
    schoolId: await currentSchoolId(req),
    requesterRole: role,
    ...input,
  })
  res.status(201).json(result)
}

export async function generateStudyPlan(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req)
  const result = await aiFeaturesService.generateStudyPlan(userId, await currentSchoolId(req))
  res.status(201).json(result)
}

export async function listStudyPlans(req: Request, res: Response): Promise<void> {
  const plans = await aiFeaturesService.listStudyPlans(requireUserId(req))
  res.status(200).json({ plans })
}
