import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, isTeacherAssignedToClass } from '../services/resolvers'
import * as wellbeingService from '../services/wellbeing.service'

const EMOTION_VALUES = ['HAPPY', 'FOCUSED', 'CALM', 'NEUTRAL', 'TIRED', 'SAD', 'STRESSED', 'ANXIOUS'] as const

function requireUserId(req: Request): string {
  if (!req.userId) throw new ForbiddenError()
  return req.userId
}

const checkInSchema = z.object({
  emotion: z.enum(EMOTION_VALUES),
  confidence: z.number().min(0).max(100),
  source: z.enum(['camera', 'manual']).optional(),
})

export async function createCheckIn(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(checkInSchema, req.body)
  const checkIn = await wellbeingService.createCheckIn({ ...input, userId: requireUserId(req) })
  res.status(201).json({ checkIn })
}

export async function getStatus(req: Request, res: Response): Promise<void> {
  const status = await wellbeingService.getStatus(requireUserId(req))
  res.status(200).json({ status })
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const history = await wellbeingService.getCheckInHistory(requireUserId(req))
  res.status(200).json({ history })
}

export async function skipToday(req: Request, res: Response): Promise<void> {
  await wellbeingService.skipToday(requireUserId(req))
  const status = await wellbeingService.getStatus(requireUserId(req))
  res.status(200).json({ status })
}

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

export async function getClassWellbeing(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req)
  const classId = req.params.classId
  const isOwner = req.userRole === 'TEACHER' && (await isTeacherAssignedToClass(userId, classId))
  if (!isOwner && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this class.')
  }

  const summary = await wellbeingService.getClassWellbeing(classId)
  res.status(200).json({ summary })
}

export async function getStudentWellbeing(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req)
  const studentUserId = req.params.id
  const isSelf = userId === studentUserId
  const isParent = req.userRole === 'PARENT' && (await isParentOfStudent(userId, studentUserId))
  if (!isSelf && !isParent && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this wellbeing data.')
  }

  const [latest, history] = await Promise.all([
    wellbeingService.getLatestCheckIn(studentUserId),
    wellbeingService.getCheckInHistory(studentUserId),
  ])
  res.status(200).json({ latest, history })
}
