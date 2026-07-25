export interface ParentProfile {
  id: string
  name: string
  email: string
  phone: string
  childrenIds: string[]
  profileImage?: string
  createdAt: string
}

export interface ChildProfile {
  id: string
  name: string
  grade: string
  class: string
  parentId: string
  profileImage?: string
  subjects: string[]
  currentGPA: number
  attendancePercentage: number
}

export interface ChildProgress {
  childId: string
  attendance: {
    percentage: number
    presentDays: number
    absentDays: number
    lateDays: number
    excusedDays: number
    daily: DailyAttendance[]
  }
  currentGPA: number
  homework: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  assignments: {
    total: number
    submitted: number
    pending: number
    graded: number
  }
  upcomingEvents: number
  teacherNotes: TeacherNote[]
  weeklyProgress: WeeklyProgress[]
}

export interface DailyAttendance {
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  reason?: string
}

export interface TeacherNote {
  id: string
  teacher: string
  date: string
  subject: string
  note: string
  type: 'feedback' | 'concern' | 'achievement'
}

export interface WeeklyProgress {
  week: string
  academicScore: number
  attendanceScore: number
  behaviorScore: number
  engagementScore: number
}

export interface ChildHomework {
  id: string
  childId: string
  title: string
  subject: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  submittedDate?: string
  teacher: string
  teacherFeedback?: string
  grade?: number
  attachments: string[]
}

export interface ChildAssignment {
  id: string
  childId: string
  title: string
  subject: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  submittedDate?: string
  teacher: string
  score?: number
  maxScore?: number
  feedback?: string
  attachments: string[]
}

export interface ChildGrade {
  id: string
  childId: string
  subject: string
  date: string
  score: number
  maxScore: number
  teacher: string
  type: 'assignment' | 'exam' | 'project' | 'participation'
}

export interface ChildEvent {
  id: string
  childId: string
  eventId: string
  title: string
  date: string
  location: string
  registrationStatus: 'pending' | 'registered' | 'completed'
  parentApprovalStatus: 'pending' | 'approved' | 'rejected'
  certificate?: {
    id: string
    title: string
    awardedDate: string
  }
  feedback?: string
}

export interface ChildCertificate {
  id: string
  childId: string
  title: string
  issuer: string
  issuedDate: string
  category: 'academic' | 'event' | 'achievement' | 'skill'
  description: string
  image?: string
}

export interface ChildWellbeing {
  childId: string
  weeklyTrend: WellbeingTrendPoint[]
  monthlyTrend: WellbeingTrendPoint[]
  moodHistory: MoodEntry[]
  energyTrend: TrendData[]
  stressTrend: TrendData[]
  aiRecommendations: string[]
}

export interface WellbeingTrendPoint {
  date: string
  mood: number
  energy: number
  stress: number
}

export interface MoodEntry {
  date: string
  mood: 'happy' | 'focused' | 'neutral' | 'stressed'
  notes?: string
}

export interface TrendData {
  date: string
  value: number
}

export interface TeacherMessage {
  id: string
  childId: string
  teacherId: string
  teacher: string
  subject: string
  date: string
  message: string
  isRead: boolean
  attachments?: string[]
}

export interface ClassAnnouncement {
  id: string
  childId: string
  title: string
  content: string
  date: string
  teacher: string
  priority: 'low' | 'normal' | 'high'
}

export interface EventApprovalRequest {
  id: string
  childId: string
  eventId: string
  eventTitle: string
  eventDate: string
  reason: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  parentResponse?: string
  parentResponseDate?: string
}

export interface FamilyNotification {
  id: string
  childId: string
  type: 'homework_due' | 'assignment_graded' | 'attendance_alert' | 'teacher_message' | 'event_reminder' | 'announcement' | 'certificate' | 'event_request'
  title: string
  message: string
  date: string
  isRead: boolean
  actionUrl?: string
}

export interface AISummary {
  weekSummary: string
  academicProgress: string
  wellbeingSummary: string
  upcomingPriorities: string[]
  suggestedActivities: string[]
  recommendedEvents: string[]
  suggestedStudySchedule: string
}

export interface FamilyAchievement {
  id: string
  title: string
  category: 'academic' | 'volunteer' | 'sports' | 'music' | 'arts' | 'stem' | 'community'
  children: string[]
  date: string
  description: string
  image?: string
}

export interface ParentSearchResult {
  type: 'homework' | 'assignment' | 'message' | 'event' | 'certificate'
  id: string
  title: string
  childId: string
  childName: string
  date: string
  preview: string
}
