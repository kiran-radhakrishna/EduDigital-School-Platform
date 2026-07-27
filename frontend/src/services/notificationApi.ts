import { apiClient } from './apiClient'
import type { Notification as AppNotification, NotificationType } from '../types'

interface BackendNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

function toAppNotification(notification: BackendNotification): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type.toLowerCase() as NotificationType,
    read: notification.isRead,
    createdAt: notification.createdAt,
  }
}

export interface NotificationPreferences {
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  digestFrequency: 'daily' | 'weekly' | 'never'
}

interface PreferencesResponse {
  preferences: NotificationPreferences
}

export const notificationApi = {
  async list(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<{ notifications: BackendNotification[] }>('/notifications')
    return data.notifications.map(toAppNotification)
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count')
    return data.count
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all')
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get<PreferencesResponse>('/notifications/preferences')
    return data.preferences
  },

  async updatePreferences(input: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data } = await apiClient.put<PreferencesResponse>('/notifications/preferences', input)
    return data.preferences
  },
}
