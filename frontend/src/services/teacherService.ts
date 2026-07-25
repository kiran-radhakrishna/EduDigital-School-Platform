import {
  CLASS_ASSIGNMENTS,
  CLASS_ATTENDANCE_RECORDS,
  CLASS_GRADES,
  CLASS_HOMEWORK,
  CLASS_MESSAGES,
  TEACHER_CLASSES,
  TEACHER_NOTIFICATIONS,
  CLASS_WELLBEING,
} from '../data/teacherData'
import type {
  ClassAnalytics,
  ClassAttendanceRecord,
  ClassMessage,
  TeacherAssignment,
  TeacherClass,
  TeacherHomework,
  TeacherNotification,
  TrendDataPoint,
  WellbeingAnonymousData,
} from '../types/teacher'

export function getTeacherClasses(): TeacherClass[] {
  return TEACHER_CLASSES
}

export function getClassById(classId: string): TeacherClass | undefined {
  return TEACHER_CLASSES.find((cls) => cls.id === classId)
}

export function getClassAttendance(): ClassAttendanceRecord[] {
  return CLASS_ATTENDANCE_RECORDS.filter((record) => record.studentId)
}

export function markAttendance(
  studentId: string,
  status: 'present' | 'absent' | 'late' | 'excused',
): ClassAttendanceRecord {
  const newRecord: ClassAttendanceRecord = {
    id: `att-${Date.now()}`,
    studentId,
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    status,
    subject: 'Mathematics',
  }
  CLASS_ATTENDANCE_RECORDS.push(newRecord)
  return newRecord
}

export function getClassHomework(classId: string): TeacherHomework[] {
  return CLASS_HOMEWORK.filter((hw) => hw.classId === classId)
}

export function createHomework(
  classId: string,
  title: string,
  subject: string,
  description: string,
  dueDate: string,
): TeacherHomework {
  const newHomework: TeacherHomework = {
    id: `hw-${Date.now()}`,
    classId,
    title,
    subject,
    description,
    dueDate,
    createdAt: new Date().toISOString(),
    submissions: [],
    totalStudents: TEACHER_CLASSES.find((cls) => cls.id === classId)?.studentCount ?? 0,
  }
  CLASS_HOMEWORK.push(newHomework)
  return newHomework
}

export function getClassAssignments(classId: string): TeacherAssignment[] {
  return CLASS_ASSIGNMENTS.filter((assign) => assign.classId === classId)
}

export function createAssignment(
  classId: string,
  title: string,
  subject: string,
  description: string,
  dueDate: string,
  maxScore: number,
): TeacherAssignment {
  const newAssignment: TeacherAssignment = {
    id: `assign-${Date.now()}`,
    classId,
    title,
    subject,
    description,
    dueDate,
    createdAt: new Date().toISOString(),
    maxScore,
    submissions: [],
    totalStudents: TEACHER_CLASSES.find((cls) => cls.id === classId)?.studentCount ?? 0,
  }
  CLASS_ASSIGNMENTS.push(newAssignment)
  return newAssignment
}

export function getClassGrades(): typeof CLASS_GRADES {
  return CLASS_GRADES
}

export function getClassMessages(classId: string): ClassMessage[] {
  return CLASS_MESSAGES.filter((msg) => msg.classId === classId)
}

export function sendMessage(
  message: string,
  attachmentUrl?: string,
): ClassMessage {
  const newMessage: ClassMessage = {
    id: `msg-${Date.now()}`,
    classId: 'class-grade-4a',
    senderId: 'teacher-kathrin',
    senderName: 'Ms. Mueller',
    senderRole: 'teacher',
    message,
    attachmentUrl,
    timestamp: new Date().toISOString(),
    isRead: true,
  }
  CLASS_MESSAGES.push(newMessage)
  return newMessage
}

export function getTeacherNotifications(): TeacherNotification[] {
  return TEACHER_NOTIFICATIONS
}

export function markNotificationAsRead(notificationId: string): void {
  const notification = TEACHER_NOTIFICATIONS.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

export function getClassWellbeing(classId: string): WellbeingAnonymousData | undefined {
  return CLASS_WELLBEING[classId]
}

export function getClassAnalytics(): ClassAnalytics {
  const trendData: TrendDataPoint[] = [
    { label: 'Week 1', value: 94 },
    { label: 'Week 2', value: 95 },
    { label: 'Week 3', value: 93 },
    { label: 'Week 4', value: 96 },
  ]

  return {
    attendanceTrend: trendData,
    homeworkCompletion: [
      { label: 'Week 1', value: 85 },
      { label: 'Week 2', value: 88 },
      { label: 'Week 3', value: 92 },
      { label: 'Week 4', value: 89 },
    ],
    assignmentCompletion: [
      { label: 'Week 1', value: 78 },
      { label: 'Week 2', value: 81 },
      { label: 'Week 3', value: 86 },
      { label: 'Week 4', value: 84 },
    ],
    averageGradeTrend: [
      { label: 'Week 1', value: 82 },
      { label: 'Week 2', value: 83 },
      { label: 'Week 3', value: 85 },
      { label: 'Week 4', value: 84 },
    ],
    eventParticipation: [
      { label: 'Week 1', value: 65 },
      { label: 'Week 2', value: 70 },
      { label: 'Week 3', value: 72 },
      { label: 'Week 4', value: 68 },
    ],
    aiTutorUsage: [
      { label: 'Week 1', value: 45 },
      { label: 'Week 2', value: 52 },
      { label: 'Week 3', value: 58 },
      { label: 'Week 4', value: 55 },
    ],
    wellbeingTrend: [
      { label: 'Week 1', value: 72 },
      { label: 'Week 2', value: 75 },
      { label: 'Week 3', value: 78 },
      { label: 'Week 4', value: 76 },
    ],
  }
}

export function searchStudents(classId: string, query: string) {
  const classData = TEACHER_CLASSES.find((cls) => cls.id === classId)
  if (!classData) return []
  return classData.students.filter((student) =>
    student.name.toLowerCase().includes(query.toLowerCase()),
  )
}

export function searchMessages(classId: string, query: string) {
  return CLASS_MESSAGES.filter(
    (msg) =>
      msg.classId === classId &&
      (msg.senderName.toLowerCase().includes(query.toLowerCase()) ||
        msg.message.toLowerCase().includes(query.toLowerCase())),
  )
}

export function getUnreadMessageCount(classId: string): number {
  return CLASS_MESSAGES.filter((msg) => msg.classId === classId && !msg.isRead).length
}

export function getUnreadNotificationCount(): number {
  return TEACHER_NOTIFICATIONS.filter((n) => !n.read).length
}
