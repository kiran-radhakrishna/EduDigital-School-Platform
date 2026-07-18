export declare enum Role {
  Student = 'student',
  Teacher = 'teacher',
  Parent = 'parent',
  Admin = 'admin',
}

export type UserRole = `${Role}`

export interface User {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  class?: string
  subject?: string
  phone?: string
  bio?: string
  joinedAt?: string
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded'

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  status: AssignmentStatus
  grade?: number
  maxGrade?: number
  description?: string
}

export interface Grade {
  id: string
  subject: string
  score: number
  maxScore: number
  date: string
  teacher: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface Attendance {
  id: string
  date: string
  status: AttendanceStatus
  subject: string
}

export interface TimetableEntry {
  id: string
  subject: string
  teacher: string
  room: string
  startTime: string
  endTime: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
  color?: string
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export interface NavItem {
  label: string
  labelDe: string
  path: string
  icon: string
}

export interface Subject {
  id: string
  name: string
  teacher: string
  room: string
  schedule: string
  color: string
  progress?: number
}
