import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import * as aiService from '../services/ai.service'

function requireUserId(req: Request): string {
  if (!req.userId) throw new ForbiddenError()
  return req.userId
}

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

const chatSchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).max(4000),
})

export async function sendChatMessage(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req)
  const input = parseOrThrow(chatSchema, req.body)
  const schoolId = await aiService.getSchoolIdForAnyUser(userId)
  const result = await aiService.sendMessage({ userId, schoolId, ...input })
  res.status(201).json(result)
}

const listConversationsQuerySchema = z.object({ feature: z.string().min(1).optional() })

export async function listConversations(req: Request, res: Response): Promise<void> {
  const { feature } = parseOrThrow(listConversationsQuerySchema, req.query)
  const conversations = await aiService.listConversations(requireUserId(req), feature)
  res.status(200).json({ conversations })
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const conversation = await aiService.getConversation(req.params.id, requireUserId(req), isPrivileged(req))
  res.status(200).json({ conversation })
}

export async function getMyUsage(req: Request, res: Response): Promise<void> {
  const usage = await aiService.getUsageForUser(requireUserId(req))
  res.status(200).json({ usage })
}

const schoolUsageSchema = z.object({ schoolId: z.string().min(1) })

export async function getSchoolUsage(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(schoolUsageSchema, req.query)
  const usage = await aiService.getUsageForSchool(schoolId)
  res.status(200).json({ usage })
}
