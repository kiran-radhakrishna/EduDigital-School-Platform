export const EVENT_CATEGORIES = [
  'School',
  'City',
  'District / County',
  'State',
  'National',
  'International',
  'Sports',
  'Arts',
  'Music',
  'Technology',
  'Coding',
  'Robotics',
  'Science',
  'Mathematics',
  'Language',
  'Environment',
  'Community Service',
  'Mental Wellness',
  'Career',
  'University',
  'Workshop',
  'Competition',
  'Festival',
  'Seminar',
  'Volunteer',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]

export type EventScope = 'school' | 'city' | 'district' | 'state' | 'national' | 'international'
export type EventMode = 'online' | 'offline'
export type EventFeeType = 'free' | 'paid'
export type EventStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived'
export type RegistrationStatus =
  | 'waiting_parent_approval'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'rejected'
export type ApprovalDecision = 'pending' | 'approved' | 'rejected'

export interface EventOrganizer {
  id: string
  name: string
  role: 'school' | 'teacher' | 'external_organizer'
  contactEmail: string
  contactPhone: string
  website?: string
  approved: boolean
  bio: string
}

export interface EventSpeaker {
  name: string
  title: string
}

export interface EventScheduleItem {
  time: string
  title: string
  description: string
}

export interface EventItem {
  id: string
  title: string
  posterUrl: string
  bannerUrl: string
  galleryUrls: string[]
  description: string
  categories: EventCategory[]
  scope: EventScope
  mode: EventMode
  feeType: EventFeeType
  feeAmount?: number
  organizerId: string
  location: string
  mapHint: string
  date: string
  time: string
  registrationDeadline: string
  capacity: number
  seatsRemaining: number
  recommendedAges: [number, number]
  recommendedGrades: string[]
  targetClassIds: string[]
  requirements: string[]
  contactEmail: string
  contactPhone: string
  website?: string
  speakers: EventSpeaker[]
  schedule: EventScheduleItem[]
  status: EventStatus
}

export interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  studentName: string
  grade: string
  parentApprovalRequired: boolean
  parentApprovalStatus: ApprovalDecision
  status: RegistrationStatus
  registeredAt: string
  qrTicketCode?: string
  attendanceMarked: boolean
  certificateIssued: boolean
  teacherFeedback?: string
}

export interface EventCertificate {
  id: string
  eventId: string
  studentId: string
  studentName: string
  issuedAt: string
  downloadUrl: string
  badge: string
}

export interface EventPhoto {
  id: string
  eventId: string
  uploadedBy: string
  imageUrl: string
  caption: string
  uploadedAt: string
}

export interface EventFeedback {
  id: string
  eventId: string
  authorRole: 'teacher' | 'student' | 'parent'
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

export interface StudentInterestProfile {
  studentId: string
  age: number
  grade: string
  interests: EventCategory[]
  favoriteSubjects: string[]
  personality: string
  wellbeingFocus: 'high_energy' | 'balanced' | 'needs_support'
  academicStrength: string[]
  eventHistoryIds: string[]
}

export interface StudentPortfolioEntry {
  id: string
  studentId: string
  eventId: string
  eventName: string
  organizer: string
  date: string
  certificateUrl?: string
  badge?: string
  teacherFeedback?: string
}

export interface TeacherClassEventView {
  classId: string
  className: string
  upcomingEventIds: string[]
  registeredStudentCount: number
  attendanceCompletedCount: number
  certificatesIssuedCount: number
}

export interface ParentApprovalRequest {
  id: string
  registrationId: string
  childName: string
  eventId: string
  status: ApprovalDecision
}

export interface WellbeingClassSummary {
  grade: string
  happy: number
  neutral: number
  needsSupport: number
}

export interface AuthorityEventAnalytics {
  grade: string
  registrations: number
  attendanceRate: number
  completionRate: number
}

export interface CalendarEventItem {
  id: string
  title: string
  date: string
  type: 'school_event' | 'registered_event' | 'exam' | 'assignment_deadline' | 'holiday'
}

export interface EventNotification {
  id: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  title: string
  message: string
  createdAt: string
  read: boolean
}

export interface EventFilterState {
  search: string
  datePreset: 'all' | 'today' | 'tomorrow' | 'this_week' | 'weekend' | 'month'
  grade: string | 'all'
  category: EventCategory | 'all'
  feeType: EventFeeType | 'all'
  mode: EventMode | 'all'
  scope: EventScope | 'all'
}

export interface EventRecommendation {
  eventId: string
  score: number
  reason: string
}
