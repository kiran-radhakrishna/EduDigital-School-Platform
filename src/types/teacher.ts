export type AttendanceStatusType = 'present' | 'absent' | 'late' | 'excused'

export interface ClassAttendanceRecord {
  id: string
  studentId: string
  studentName: string
  date: string
  status: AttendanceStatusType
  subject: string
}

export interface TeacherHomework {
  id: string
  classId: string
  title: string
  subject: string
  description: string
  dueDate: string
  createdAt: string
  submissions: HomeworkSubmission[]
  totalStudents: number
}

export interface HomeworkSubmission {
  id: string
  studentId: string
  studentName: string
  submittedAt?: string
  status: 'pending' | 'submitted' | 'late'
  feedback?: string
}

export interface TeacherAssignment {
  id: string
  classId: string
  title: string
  subject: string
  description: string
  dueDate: string
  createdAt: string
  maxScore: number
  submissions: AssignmentSubmission[]
  totalStudents: number
}

export interface AssignmentSubmission {
  id: string
  studentId: string
  studentName: string
  submittedAt?: string
  status: 'pending' | 'submitted' | 'graded'
  score?: number
  feedback?: string
  attachmentUrl?: string
}

export interface ClassGrade {
  studentId: string
  studentName: string
  subject: string
  score: number
  maxScore: number
  grade: string
  date: string
}

export interface TeacherClass {
  id: string
  name: string
  grade: string
  subject: string
  studentCount: number
  students: ClassStudent[]
  schedule: TimetableSlot[]
  upcomingExam?: ClassExam
  nextLesson?: TimetableSlot
}

export interface ClassStudent {
  id: string
  name: string
  photo?: string
  attendancePercent: number
  averageGrade: string
  wellbeingStatus: 'happy' | 'focused' | 'neutral' | 'needs_support'
  assignmentsDue: number
}

export interface TimetableSlot {
  id: string
  subject: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
  startTime: string
  endTime: string
  room: string
  color?: string
}

export interface ClassExam {
  id: string
  subject: string
  date: string
  topic: string
}

export interface ClassMessage {
  id: string
  classId: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'parent' | 'student'
  message: string
  attachmentUrl?: string
  timestamp: string
  isRead: boolean
}

export interface ClassAnalytics {
  attendanceTrend: TrendDataPoint[]
  homeworkCompletion: TrendDataPoint[]
  assignmentCompletion: TrendDataPoint[]
  averageGradeTrend: TrendDataPoint[]
  eventParticipation: TrendDataPoint[]
  aiTutorUsage: TrendDataPoint[]
  wellbeingTrend: TrendDataPoint[]
}

export interface TrendDataPoint {
  label: string
  value: number
}

export interface WellbeingAnonymousData {
  classId: string
  moodDistribution: {
    happy: number
    focused: number
    neutral: number
    needsSupport: number
  }
  weeklyTrend: WellbeingTrendPoint[]
  studentsRequestingSupport: StudentWellbeingRequest[]
}

export interface StudentWellbeingRequest {
  studentId: string
  studentName: string
  emotion: string
  timestamp: string
  stress: number
}

export interface WellbeingTrendPoint {
  label: string
  happy: number
  focused: number
  neutral: number
  needsSupport: number
}

export interface TeacherNotification {
  id: string
  title: string
  message: string
  type: 'assignment' | 'attendance' | 'homework' | 'message' | 'event' | 'meeting' | 'announcement'
  classId?: string
  studentId?: string
  read: boolean
  timestamp: string
}

export interface TeacherCommunityPost {
  id: string
  authorId: string
  authorName: string
  category: 'announcement' | 'discussion' | 'resource' | 'lesson-plan' | 'worksheet' | 'training' | 'meeting' | 'recognition'
  title: string
  content: string
  attachments?: string[]
  likes: number
  comments: CommunityComment[]
  createdAt: string
}

export interface CommunityComment {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface TeacherProfile {
  teacherId: string
  name: string
  firstName: string
  lastName: string
  email: string
  subjects: string[]
  assignedClasses: TeacherClass[]
  profilePhoto?: string
  bio?: string
  experience?: string
}
