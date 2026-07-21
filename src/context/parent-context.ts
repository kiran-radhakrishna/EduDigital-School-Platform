import { createContext } from 'react'
import type {
  ParentProfile,
  ChildProfile,
  ChildProgress,
  EventApprovalRequest,
  FamilyNotification,
} from '../types/parent'

export interface ParentContextType {
  parentProfile: ParentProfile | null
  children: ChildProfile[]
  selectedChildId: string | null
  setSelectedChildId: (childId: string) => void
  childProgress: Record<string, ChildProgress | undefined>
  pendingApprovals: EventApprovalRequest[]
  notifications: FamilyNotification[]
  unreadNotificationCount: number
  approveEvent: (requestId: string) => void
  rejectEvent: (requestId: string, reason?: string) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  refreshData: () => void
}

export const ParentContext = createContext<ParentContextType | undefined>(undefined)
