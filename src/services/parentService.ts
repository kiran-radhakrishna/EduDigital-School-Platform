import {
  PARENT_PROFILE,
  CHILD_PROFILES,
  CHILD_PROGRESS,
  CHILD_HOMEWORK,
  CHILD_ASSIGNMENTS,
  CHILD_GRADES,
  CHILD_EVENTS,
  CHILD_CERTIFICATES,
  CHILD_WELLBEING,
  TEACHER_MESSAGES,
  CLASS_ANNOUNCEMENTS,
  EVENT_APPROVAL_REQUESTS,
  FAMILY_NOTIFICATIONS,
  FAMILY_ACHIEVEMENTS,
} from '../data/parentData'
import type {
  ParentProfile,
  ChildProfile,
  ChildProgress,
  ChildHomework,
  ChildAssignment,
  ChildGrade,
  ChildEvent,
  ChildCertificate,
  ChildWellbeing,
  TeacherMessage,
  ClassAnnouncement,
  EventApprovalRequest,
  FamilyNotification,
  FamilyAchievement,
} from '../types/parent'

interface ParentSearchResult {
  type: 'homework' | 'assignment' | 'message' | 'event' | 'certificate'
  id: string
  title: string
  childId: string
  childName: string
  date: string
  preview: string
}

export const parentService = {
  getParentProfile(): ParentProfile {
    return PARENT_PROFILE
  },

  getParentChildren(): ChildProfile[] {
    return CHILD_PROFILES.filter((child) => child.parentId === PARENT_PROFILE.id)
  },

  getChildById(childId: string): ChildProfile | undefined {
    return CHILD_PROFILES.find((child) => child.id === childId && child.parentId === PARENT_PROFILE.id)
  },

  getChildProgress(childId: string): ChildProgress | undefined {
    const child = this.getChildById(childId)
    if (!child) return undefined
    return CHILD_PROGRESS[childId]
  },

  getChildHomework(childId: string): ChildHomework[] {
    return CHILD_HOMEWORK[childId] || []
  },

  getChildAssignments(childId: string): ChildAssignment[] {
    return CHILD_ASSIGNMENTS[childId] || []
  },

  getChildGrades(childId: string): ChildGrade[] {
    return CHILD_GRADES[childId] || []
  },

  getChildEvents(childId: string): ChildEvent[] {
    return CHILD_EVENTS[childId] || []
  },

  getChildCertificates(childId: string): ChildCertificate[] {
    return CHILD_CERTIFICATES[childId] || []
  },

  getChildWellbeing(childId: string): ChildWellbeing | undefined {
    return CHILD_WELLBEING[childId]
  },

  getTeacherMessages(childId: string): TeacherMessage[] {
    return TEACHER_MESSAGES[childId] || []
  },

  getClassAnnouncements(childId: string): ClassAnnouncement[] {
    return CLASS_ANNOUNCEMENTS[childId] || []
  },

  getEventApprovalRequests(childId?: string): EventApprovalRequest[] {
    if (childId) {
      return EVENT_APPROVAL_REQUESTS.filter((req) => req.childId === childId)
    }
    return EVENT_APPROVAL_REQUESTS
  },

  getPendingApprovals(): EventApprovalRequest[] {
    return EVENT_APPROVAL_REQUESTS.filter((req) => req.status === 'pending')
  },

  approveEventRequest(requestId: string): void {
    const request = EVENT_APPROVAL_REQUESTS.find((req) => req.id === requestId)
    if (request) {
      request.status = 'approved'
      request.parentResponseDate = new Date().toISOString().split('T')[0]
    }
  },

  rejectEventRequest(requestId: string, reason?: string): void {
    const request = EVENT_APPROVAL_REQUESTS.find((req) => req.id === requestId)
    if (request) {
      request.status = 'rejected'
      request.parentResponse = reason
      request.parentResponseDate = new Date().toISOString().split('T')[0]
    }
  },

  getFamilyNotifications(): FamilyNotification[] {
    return FAMILY_NOTIFICATIONS
  },

  getUnreadNotificationCount(): number {
    return FAMILY_NOTIFICATIONS.filter((n) => !n.isRead).length
  },

  getFamilyAchievements(): FamilyAchievement[] {
    return FAMILY_ACHIEVEMENTS
  },

  searchParentContent(query: string): ParentSearchResult[] {
    const results: ParentSearchResult[] = []
    const lowerQuery = query.toLowerCase()

    this.getParentChildren().forEach((child) => {
      const homework = this.getChildHomework(child.id)
      homework.forEach((hw) => {
        if (hw.title.toLowerCase().includes(lowerQuery) || hw.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'homework',
            id: hw.id,
            title: hw.title,
            childId: child.id,
            childName: child.name,
            date: hw.dueDate,
            preview: hw.description,
          })
        }
      })

      const assignments = this.getChildAssignments(child.id)
      assignments.forEach((assign) => {
        if (assign.title.toLowerCase().includes(lowerQuery) || assign.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'assignment',
            id: assign.id,
            title: assign.title,
            childId: child.id,
            childName: child.name,
            date: assign.dueDate,
            preview: assign.description,
          })
        }
      })

      const messages = this.getTeacherMessages(child.id)
      messages.forEach((msg) => {
        if (msg.subject.toLowerCase().includes(lowerQuery) || msg.message.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'message',
            id: msg.id,
            title: msg.subject,
            childId: child.id,
            childName: child.name,
            date: msg.date,
            preview: msg.message.substring(0, 100),
          })
        }
      })

      const events = this.getChildEvents(child.id)
      events.forEach((event) => {
        if (event.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'event',
            id: event.id,
            title: event.title,
            childId: child.id,
            childName: child.name,
            date: event.date,
            preview: event.location,
          })
        }
      })

      const certificates = this.getChildCertificates(child.id)
      certificates.forEach((cert) => {
        if (cert.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'certificate',
            id: cert.id,
            title: cert.title,
            childId: child.id,
            childName: child.name,
            date: cert.issuedDate,
            preview: cert.category,
          })
        }
      })
    })

    return results
  },

  getTodayNotifications(): FamilyNotification[] {
    const today = new Date().toISOString().split('T')[0]
    return FAMILY_NOTIFICATIONS.filter((n) => n.date === today)
  },

  getFamilyOverview() {
    const children = this.getParentChildren()
    const totalHomework = children.reduce((sum, child) => sum + this.getChildHomework(child.id).length, 0)
    const totalAssignments = children.reduce((sum, child) => sum + this.getChildAssignments(child.id).length, 0)
    const totalEvents = children.reduce((sum, child) => sum + this.getChildEvents(child.id).length, 0)
    const totalCertificates = children.reduce((sum, child) => sum + this.getChildCertificates(child.id).length, 0)

    const averageAttendance =
      children.reduce((sum, child) => {
        const progress = this.getChildProgress(child.id)
        return sum + (progress?.attendance.percentage || 0)
      }, 0) / children.length

    const pendingApprovals = this.getPendingApprovals()
    const unreadMessages = this.getTeacherMessages(children[0]?.id || '').filter((m) => !m.isRead).length

    return {
      childCount: children.length,
      totalHomework,
      totalAssignments,
      totalEvents,
      totalCertificates,
      averageAttendance,
      pendingApprovals: pendingApprovals.length,
      unreadMessages,
      unreadNotifications: this.getUnreadNotificationCount(),
    }
  },

  markNotificationAsRead(notificationId: string): void {
    const notification = FAMILY_NOTIFICATIONS.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  },

  markAllNotificationsAsRead(): void {
    FAMILY_NOTIFICATIONS.forEach((n) => {
      n.isRead = true
    })
  },
}
