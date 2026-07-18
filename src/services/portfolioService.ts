import { ACHIEVEMENTS, ASSIGNMENT_STATS, GRADES, HOMEWORK, STUDENT_INFO, STUDY_PLAN } from '../data/studentData'
import {
  PORTFOLIO_AI_INSIGHTS,
  PORTFOLIO_GOALS,
  PORTFOLIO_MONTHLY_WELLBEING,
  PORTFOLIO_PARENT_NOTES,
  PORTFOLIO_SEED_STUDENTS,
  PORTFOLIO_SKILLS,
  PORTFOLIO_TEACHER_NOTES,
  PORTFOLIO_TIMELINES,
  PORTFOLIO_WEEKLY_WELLBEING,
} from '../data/portfolioData'
import type { EventDashboardSnapshot } from './eventsService'
import type {
  CertificateGroup,
  PortfolioAchievementBadge,
  PortfolioCertificateItem,
  PortfolioPersonalInfo,
  PortfolioStatistics,
  StudentPortfolioModel,
} from '../types/portfolio'

function getSeed(studentId: string) {
  return (
    PORTFOLIO_SEED_STUDENTS.find((entry) => entry.studentId === studentId) ??
    PORTFOLIO_SEED_STUDENTS[0]
  )
}

function certificateGroupFromBadge(badge: string): CertificateGroup {
  const normalized = badge.toLowerCase()
  if (normalized.includes('sport')) return 'Sports'
  if (normalized.includes('music')) return 'Music'
  if (normalized.includes('art')) return 'Arts'
  if (normalized.includes('community') || normalized.includes('volunteer')) return 'Community'
  if (normalized.includes('coding') || normalized.includes('tech')) return 'Technology'
  return 'Academic'
}

function getPersonalInfo(studentId: string, name: string): PortfolioPersonalInfo {
  const seed = getSeed(studentId)
  const [firstName, ...last] = name.split(' ')

  return {
    studentId,
    name: `${firstName} ${last.join(' ')}`.trim(),
    grade: STUDENT_INFO.grade,
    className: seed.className,
    rollNumber: seed.rollNumber,
    house: STUDENT_INFO.house,
    school: STUDENT_INFO.school,
    academicYear: seed.academicYear,
    photoUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=480&q=80',
  }
}

function getAchievementBadges(): PortfolioAchievementBadge[] {
  const base = ACHIEVEMENTS.filter((entry) => entry.earned).map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    emoji: entry.emoji,
  }))

  const requiredExamples: PortfolioAchievementBadge[] = [
    { id: 'badge-reading-star', title: 'Reading Star', description: 'Reading mastery milestone.', emoji: '📚' },
    { id: 'badge-math-champion', title: 'Math Champion', description: 'Outstanding mathematics performance.', emoji: '🧮' },
    { id: 'badge-young-scientist', title: 'Young Scientist', description: 'Science excellence recognition.', emoji: '🔬' },
    { id: 'badge-coding-explorer', title: 'Coding Explorer', description: 'Coding progression milestone.', emoji: '💻' },
    { id: 'badge-music-talent', title: 'Music Talent', description: 'Music participation and growth.', emoji: '🎵' },
    { id: 'badge-sports-star', title: 'Sports Star', description: 'Athletic consistency and teamwork.', emoji: '🏅' },
    { id: 'badge-community-hero', title: 'Community Hero', description: 'Community engagement impact.', emoji: '🤝' },
    { id: 'badge-volunteer', title: 'Volunteer', description: 'Volunteer activity completion.', emoji: '🌱' },
    { id: 'badge-leadership-award', title: 'Leadership Award', description: 'Demonstrated student leadership.', emoji: '👑' },
  ]

  const existingTitles = new Set(base.map((entry) => entry.title.toLowerCase()))
  const merged = [...base]
  requiredExamples.forEach((entry) => {
    if (!existingTitles.has(entry.title.toLowerCase())) merged.push(entry)
  })
  return merged
}

export function buildStudentPortfolio(
  studentId: string,
  studentName: string,
  snapshot: EventDashboardSnapshot,
): StudentPortfolioModel {
  const personal = getPersonalInfo(studentId, studentName)
  const assignmentsTotal =
    ASSIGNMENT_STATS.pending +
    ASSIGNMENT_STATS.submitted +
    ASSIGNMENT_STATS.late +
    ASSIGNMENT_STATS.completed
  const assignmentCompletionPercent = Math.round((ASSIGNMENT_STATS.completed / assignmentsTotal) * 100)
  const homeworkCompletionPercent = Math.round(
    HOMEWORK.reduce((sum, item) => sum + item.completion, 0) / HOMEWORK.length,
  )

  const studentRegistrations = snapshot.registrations.filter((entry) => entry.studentId === studentId)
  const eventActivities = studentRegistrations
    .map((registration) => {
      const event = snapshot.events.find((entry) => entry.id === registration.eventId)
      if (!event) return null
      const organizer = snapshot.organizers.find((entry) => entry.id === event.organizerId)
      const certificate = snapshot.certificates.find(
        (entry) => entry.eventId === event.id && entry.studentId === studentId,
      )

      return {
        id: event.id,
        title: event.title,
        posterUrl: event.posterUrl,
        organizer: organizer?.name ?? 'Organizer',
        date: event.date,
        status: registration.status.replaceAll('_', ' '),
        certificateUrl: certificate?.downloadUrl,
        teacherFeedback: registration.teacherFeedback,
        categories: event.categories,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => !!entry)

  const certificates: PortfolioCertificateItem[] = snapshot.certificates
    .filter((entry) => entry.studentId === studentId)
    .map((entry) => {
      const event = snapshot.events.find((eventEntry) => eventEntry.id === entry.eventId)
      return {
        id: entry.id,
        title: event?.title ?? 'Certificate',
        group: certificateGroupFromBadge(entry.badge),
        issuedAt: entry.issuedAt,
        downloadUrl: entry.downloadUrl,
      }
    })

  const achievements = getAchievementBadges()
  const sportsEvents = eventActivities.filter((entry) => entry.categories.includes('Sports')).length
  const artsEvents = eventActivities.filter(
    (entry) => entry.categories.includes('Arts') || entry.categories.includes('Music'),
  ).length
  const communityEvents = eventActivities.filter(
    (entry) =>
      entry.categories.includes('Community Service') ||
      entry.categories.includes('Volunteer') ||
      entry.categories.includes('Environment'),
  ).length

  const stats: PortfolioStatistics = {
    attendance: STUDENT_INFO.attendancePct,
    eventsAttended: eventActivities.filter((entry) => entry.status === 'completed').length,
    certificates: certificates.length,
    achievements: achievements.length,
    volunteerHours: getSeed(studentId).volunteerHours,
    sportsEvents,
    artsEvents,
    communityEvents,
    aiTutorHours: 12,
  }

  return {
    personal,
    academic: {
      attendancePercent: STUDENT_INFO.attendancePct,
      subjectsCount: GRADES.length,
      averageGrade: 'A-',
      homeworkCompletionPercent,
      assignmentCompletionPercent,
      aiTutorProgress: '12 completed sessions',
      studyPlannerProgress: STUDY_PLAN.weeklyProgress,
      overallGpa: STUDENT_INFO.gpa,
    },
    eventActivities,
    certificates,
    achievements,
    skills: PORTFOLIO_SKILLS[studentId] ?? PORTFOLIO_SKILLS['student-krn'],
    aiInsights: PORTFOLIO_AI_INSIGHTS[studentId] ?? PORTFOLIO_AI_INSIGHTS['student-krn'],
    wellbeingWeekly:
      PORTFOLIO_WEEKLY_WELLBEING[studentId] ?? PORTFOLIO_WEEKLY_WELLBEING['student-krn'],
    wellbeingMonthly:
      PORTFOLIO_MONTHLY_WELLBEING[studentId] ?? PORTFOLIO_MONTHLY_WELLBEING['student-krn'],
    timeline: PORTFOLIO_TIMELINES[studentId] ?? PORTFOLIO_TIMELINES['student-krn'],
    teacherNotes: PORTFOLIO_TEACHER_NOTES[studentId] ?? PORTFOLIO_TEACHER_NOTES['student-krn'],
    parentNotes: PORTFOLIO_PARENT_NOTES[studentId] ?? PORTFOLIO_PARENT_NOTES['student-krn'],
    goals: PORTFOLIO_GOALS[studentId] ?? PORTFOLIO_GOALS['student-krn'],
    stats,
  }
}

export function getAvailableStudents(snapshot: EventDashboardSnapshot) {
  return PORTFOLIO_SEED_STUDENTS.map((seed) => {
    const registration = snapshot.registrations.find((entry) => entry.studentId === seed.studentId)
    return {
      studentId: seed.studentId,
      name: registration?.studentName ?? (seed.studentId === 'student-krn' ? 'Kiran Patel' : seed.studentId === 'student-ava' ? 'Ava Collins' : 'Noah Rivera'),
    }
  })
}
