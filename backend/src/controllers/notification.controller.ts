import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError, NotFoundError } from '../utils/errors'
import { getUserRoleAndSchool, getUserSchoolId, isStudentInTeachersClass } from '../services/resolvers'
import * as notificationService from '../services/notification.service'

function requireUserId(req: Request): string {
  if (!req.userId) throw new ForbiddenError()
  return req.userId
}

const listQuerySchema = z.object({ limit: z.coerce.number().int().positive().optional() })

export async function list(req: Request, res: Response): Promise<void> {
  const { limit } = parseOrThrow(listQuerySchema, req.query)
  const notifications = await notificationService.listNotifications(requireUserId(req), limit)
  res.status(200).json({ notifications })
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  const count = await notificationService.getUnreadCount(requireUserId(req))
  res.status(200).json({ count })
}

const createSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).optional(),
  title: z.string().min(1),
  message: z.string().min(1),
})

export async function create(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSchema, req.body)

  if (req.userRole === 'TEACHER') {
    await assertTeacherCanNotify(requireUserId(req), input.userId)
  }

  const notification = await notificationService.createNotification(input)
  res.status(201).json({ notification })
}

/** Teachers may only notify students in their own classes, or any user in their own school. */
async function assertTeacherCanNotify(teacherUserId: string, targetUserId: string): Promise<void> {
  const target = await getUserRoleAndSchool(targetUserId)
  if (!target) {
    throw new NotFoundError('Target user not found.')
  }

  if (target.role === 'STUDENT') {
    if (await isStudentInTeachersClass(teacherUserId, targetUserId)) return
    throw new ForbiddenError('You may only notify students in your own classes.')
  }

  const teacherSchoolId = await getUserSchoolId(teacherUserId)
  if (!teacherSchoolId || target.schoolId !== teacherSchoolId) {
    throw new ForbiddenError('You may only notify users in your own school.')
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const notification = await notificationService.markAsRead(requireUserId(req), req.params.id)
  res.status(200).json({ notification })
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const notifications = await notificationService.markAllAsRead(requireUserId(req))
  res.status(200).json({ notifications })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await notificationService.deleteNotification(requireUserId(req), req.params.id)
  res.status(204).send()
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const preferences = await notificationService.getPreferences(requireUserId(req))
  res.status(200).json({ preferences })
}

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'never']).optional(),
})

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updatePreferencesSchema, req.body)
  const preferences = await notificationService.updatePreferences(requireUserId(req), input)
  res.status(200).json({ preferences })
}
