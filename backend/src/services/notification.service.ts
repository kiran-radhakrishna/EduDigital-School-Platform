import type { NotificationType as PrismaNotificationType } from '@prisma/client'
import { prisma } from '../config/prisma'
import { NotFoundError } from '../utils/errors'

export async function listNotifications(userId: string, limit = 100) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } })
}

export interface CreateNotificationInput {
  userId: string
  type?: PrismaNotificationType
  title: string
  message: string
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? 'INFO',
      title: input.title.trim(),
      message: input.message.trim(),
    },
  })
}

export async function markAsRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    throw new NotFoundError('Notification not found.')
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  return listNotifications(userId)
}

export async function deleteNotification(userId: string, id: string): Promise<void> {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    throw new NotFoundError('Notification not found.')
  }
  await prisma.notification.delete({ where: { id } })
}

const DEFAULT_PREFERENCES = {
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  digestFrequency: 'daily',
}

export async function getPreferences(userId: string) {
  const preference = await prisma.notificationPreference.findUnique({ where: { userId } })
  return preference ?? { userId, ...DEFAULT_PREFERENCES }
}

export interface UpdatePreferencesInput {
  emailEnabled?: boolean
  pushEnabled?: boolean
  smsEnabled?: boolean
  digestFrequency?: string
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: input,
    create: { userId, ...DEFAULT_PREFERENCES, ...input },
  })
}
