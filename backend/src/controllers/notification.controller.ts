import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import * as notificationService from '../services/notification.service'

function requireUserId(req: Request): string {
  if (!req.userId) throw new ForbiddenError()
  return req.userId
}

export async function list(req: Request, res: Response): Promise<void> {
  const notifications = await notificationService.listNotifications(requireUserId(req))
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
  const notification = await notificationService.createNotification(input)
  res.status(201).json({ notification })
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const notification = await notificationService.markAsRead(requireUserId(req), req.params.id)
  res.status(200).json({ notification })
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const notifications = await notificationService.markAllAsRead(requireUserId(req))
  res.status(200).json({ notifications })
}
