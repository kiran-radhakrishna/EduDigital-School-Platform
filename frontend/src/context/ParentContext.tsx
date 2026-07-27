import React, { useCallback, useEffect, useState } from 'react'
import { parentService } from '../services/parentService'
import { dashboardApi } from '../services/dashboardApi'
import { attendanceApi } from '../services/attendanceApi'
import { assignmentApi } from '../services/assignmentApi'
import { notificationApi } from '../services/notificationApi'
import { useAuth } from '../hooks/useAuth'
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
  const { user, isDemoMode } = useAuth()
  const isReal = !isDemoMode && !!user

  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null)
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [childProgress, setChildProgress] = useState<Record<string, ChildProgress | undefined>>({})
  const [pendingApprovals, setPendingApprovals] = useState<EventApprovalRequest[]>([])
  const [notifications, setNotifications] = useState<FamilyNotification[]>([])
  const [realUnreadCount, setRealUnreadCount] = useState(0)

  const refreshDataDemo = useCallback(() => {
    const profile = parentService.getParentProfile()
    setParentProfile(profile)

    const children = parentService.getParentChildren()
    setChildrenList(children)

    setSelectedChildId((current) => current ?? children[0]?.id ?? null)

    const progressMap: Record<string, ChildProgress | undefined> = {}
    children.forEach((child) => {
      progressMap[child.id] = parentService.getChildProgress(child.id)
    })
    setChildProgress(progressMap)

    setPendingApprovals(parentService.getPendingApprovals())
    setNotifications(parentService.getFamilyNotifications())
  }, [])

  const refreshDataReal = useCallback(async () => {
    if (!user) return

    const dashboard = await dashboardApi.getParentDashboard(user.id)

    setParentProfile({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      childrenIds: dashboard.children.map((child) => child.id),
      createdAt: user.joinedAt ?? new Date().toISOString(),
    })

    const childList: ChildProfile[] = dashboard.children.map((child) => ({
      id: child.id,
      name: child.name,
      grade: child.grade,
      class: child.className ?? '',
      parentId: user.id,
      subjects: child.subjects,
      currentGPA: child.currentGPA,
      attendancePercentage: child.attendancePercentage,
    }))
    setChildrenList(childList)
    setSelectedChildId((current) => current ?? childList[0]?.id ?? null)

    const progressEntries = await Promise.all(
      childList.map(async (child): Promise<[string, ChildProgress]> => {
        const [summary, submissions] = await Promise.all([
          attendanceApi.getSummaryForStudent(child.id),
          assignmentApi.listForStudent(child.id),
        ])
        const submitted = submissions.filter((s) => s.status === 'SUBMITTED').length
        const graded = submissions.filter((s) => s.status === 'GRADED').length
        const pending = submissions.filter((s) => s.status === 'PENDING').length

        return [
          child.id,
          {
            childId: child.id,
            attendance: {
              percentage: summary.percentage,
              presentDays: summary.present,
              absentDays: summary.absent,
              lateDays: summary.late,
              excusedDays: summary.excused,
              daily: [],
            },
            currentGPA: child.currentGPA,
            homework: { total: submissions.length, completed: submitted + graded, pending, overdue: 0 },
            assignments: { total: submissions.length, submitted, pending, graded },
            upcomingEvents: 0,
            teacherNotes: [],
            weeklyProgress: [],
          },
        ]
      }),
    )
    setChildProgress(Object.fromEntries(progressEntries))
    setPendingApprovals([])
    setNotifications([])
    setRealUnreadCount(await notificationApi.unreadCount())
  }, [user])

  const refreshData = useCallback(() => {
    if (isReal) {
      void refreshDataReal()
    } else {
      refreshDataDemo()
    }
  }, [isReal, refreshDataDemo, refreshDataReal])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    refreshData()
  }, [refreshData])

  const approveEvent = useCallback((requestId: string) => {
    if (isReal) return
    parentService.approveEventRequest(requestId)
    refreshDataDemo()
  }, [isReal, refreshDataDemo])

  const rejectEvent = useCallback((requestId: string, reason?: string) => {
    if (isReal) return
    parentService.rejectEventRequest(requestId, reason)
    refreshDataDemo()
  }, [isReal, refreshDataDemo])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (isReal) {
      void notificationApi.markAsRead(notificationId).then(() => notificationApi.unreadCount()).then(setRealUnreadCount)
      return
    }
    parentService.markNotificationAsRead(notificationId)
    setNotifications((current) => current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }, [isReal])

  const markAllNotificationsAsRead = useCallback(() => {
    if (isReal) {
      void notificationApi.markAllAsRead().then(() => setRealUnreadCount(0))
      return
    }
    parentService.markAllNotificationsAsRead()
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })))
  }, [isReal])

  const unreadNotificationCount = isReal ? realUnreadCount : notifications.filter((n) => !n.isRead).length

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
