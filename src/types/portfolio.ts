import type { WellbeingEmotion } from './wellbeing'

export type CertificateGroup =
  | 'Academic'
  | 'Sports'
  | 'Arts'
  | 'Music'
  | 'Community'
  | 'Technology'

export type TeacherNoteCategory = 'Academic' | 'Behaviour' | 'Participation' | 'Leadership'

export interface PortfolioPersonalInfo {
  studentId: string
  photoUrl?: string
  name: string
  grade: string
  className: string
  rollNumber: string
  house: string
  school: string
  academicYear: string
}

export interface PortfolioAcademicPerformance {
  attendancePercent: number
  subjectsCount: number
  averageGrade: string
  homeworkCompletionPercent: number
  assignmentCompletionPercent: number
  aiTutorProgress: string
  studyPlannerProgress: number
  overallGpa: number
}

export interface PortfolioEventActivityItem {
  id: string
  title: string
  posterUrl: string
  organizer: string
  date: string
  status: string
  certificateUrl?: string
  teacherFeedback?: string
  categories: string[]
}

export interface PortfolioCertificateItem {
  id: string
  title: string
  group: CertificateGroup
  issuedAt: string
  downloadUrl: string
}

export interface PortfolioAchievementBadge {
  id: string
  title: string
  description: string
  emoji: string
}

export interface PortfolioSkillItem {
  name: string
  proficiency: number
}

export interface PortfolioAiLearningInsights {
  strongSubjects: string[]
  improvingSubjects: string[]
  learningStyle: string
  personalitySummary: string
  recommendedLearningPath: string
  careerSuggestions: string[]
}

export interface PortfolioWellbeingPoint {
  label: string
  wellbeingScore: number
  stress: number
  energy: number
  mood: WellbeingEmotion
}

export interface PortfolioTimelineItem {
  id: string
  date: string
  title: string
  description: string
}

export interface PortfolioTeacherNote {
  id: string
  date: string
  teacher: string
  comment: string
  category: TeacherNoteCategory
}

export interface PortfolioParentNote {
  id: string
  date: string
  note: string
}

export interface PortfolioGoal {
  id: string
  title: string
  status: 'current' | 'completed' | 'ai_suggested'
}

export interface PortfolioStatistics {
  attendance: number
  eventsAttended: number
  certificates: number
  achievements: number
  volunteerHours: number
  sportsEvents: number
  artsEvents: number
  communityEvents: number
  aiTutorHours: number
}

export interface StudentPortfolioModel {
  personal: PortfolioPersonalInfo
  academic: PortfolioAcademicPerformance
  eventActivities: PortfolioEventActivityItem[]
  certificates: PortfolioCertificateItem[]
  achievements: PortfolioAchievementBadge[]
  skills: PortfolioSkillItem[]
  aiInsights: PortfolioAiLearningInsights
  wellbeingWeekly: PortfolioWellbeingPoint[]
  wellbeingMonthly: PortfolioWellbeingPoint[]
  timeline: PortfolioTimelineItem[]
  teacherNotes: PortfolioTeacherNote[]
  parentNotes: PortfolioParentNote[]
  goals: PortfolioGoal[]
  stats: PortfolioStatistics
}
