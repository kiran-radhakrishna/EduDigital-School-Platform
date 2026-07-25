import React, { useCallback, useEffect, useState } from 'react'
import { parentService } from '../services/parentService'
import { ParentContext, type ParentContextType } from './parent-context'
import type {
  ParentProfile,
  ChildProfile,
  ChildProgress,
  EventApprovalRequest,
  FamilyNotification,
} from '../types/parent'

interface ParentProviderProps {
  children: React.ReactNode
}

export function ParentProvider({ children }: ParentProviderProps) {
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null)
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [childProgress, setChildProgress] = useState<Record<string, ChildProgress | undefined>>({})
  const [pendingApprovals, setPendingApprovals] = useState<EventApprovalRequest[]>([])
  const [notifications, setNotifications] = useState<FamilyNotification[]>([])

  const refreshData = useCallback(() => {
    const profile = parentService.getParentProfile()
    setParentProfile(profile)

    const children = parentService.getParentChildren()
    setChildrenList(children)

    if (selectedChildId === null && children.length > 0) {
      setSelectedChildId(children[0].id)
    }

    const progressMap: Record<string, ChildProgress | undefined> = {}
    children.forEach((child) => {
      progressMap[child.id] = parentService.getChildProgress(child.id)
    })
    setChildProgress(progressMap)

    setPendingApprovals(parentService.getPendingApprovals())
    setNotifications(parentService.getFamilyNotifications())
  }, [selectedChildId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration from parentService on mount
    refreshData()
  }, [refreshData])

  const approveEvent = useCallback((requestId: string) => {
    parentService.approveEventRequest(requestId)
    refreshData()
  }, [refreshData])

  const rejectEvent = useCallback((requestId: string, reason?: string) => {
    parentService.rejectEventRequest(requestId, reason)
    refreshData()
  }, [refreshData])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    parentService.markNotificationAsRead(notificationId)
    setNotifications([...notifications])
  }, [notifications])

  const markAllNotificationsAsRead = useCallback(() => {
    parentService.markAllNotificationsAsRead()
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }, [notifications])

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length

  const value: ParentContextType = {
    parentProfile,
    children: childrenList,
    selectedChildId,
    setSelectedChildId,
    childProgress,
    pendingApprovals,
    notifications,
    unreadNotificationCount,
    approveEvent,
    rejectEvent,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshData,
  }

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>
}
