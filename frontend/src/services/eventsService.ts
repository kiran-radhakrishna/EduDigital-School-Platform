import type { User } from '../types'
import {
  AUTHORITY_EVENT_ANALYTICS,
  DEFAULT_EVENT_FILTERS,
  EVENTS_CALENDAR_ITEMS,
  EVENTS_DATA,
  EVENT_CERTIFICATES,
  EVENT_FEEDBACK,
  EVENT_NOTIFICATIONS,
  EVENT_ORGANIZERS,
  EVENT_PHOTOS,
  EVENT_REGISTRATIONS,
  PARENT_APPROVAL_REQUESTS,
  STUDENT_PROFILE_SUMMARY,
  STUDENT_INTEREST_PROFILES,
  STUDENT_PORTFOLIO_ENTRIES,
  TEACHER_CLASS_EVENT_VIEW,
  WELLBEING_CLASS_SUMMARY,
} from '../data/eventsData'
import type {
  ApprovalDecision,
  EventCertificate,
  EventFilterState,
  EventItem,
  EventNotification,
  EventOrganizer,
  EventRecommendation,
  EventRegistration,
  RegistrationStatus,
  EventStatus,
  ParentApprovalRequest,
  StudentInterestProfile,
  StudentPortfolioEntry,
  TeacherClassEventView,
  WellbeingClassSummary,
  AuthorityEventAnalytics,
} from '../types/events'

type MutableEventState = {
  registrations: EventRegistration[]
  events: EventItem[]
  approvalRequests: ParentApprovalRequest[]
}

export interface EventDashboardSnapshot {
  events: EventItem[]
  organizers: EventOrganizer[]
  registrations: EventRegistration[]
  certificates: EventCertificate[]
  photos: typeof EVENT_PHOTOS
  feedback: typeof EVENT_FEEDBACK
  notifications: EventNotification[]
  teacherClassViews: TeacherClassEventView[]
  parentApprovals: ParentApprovalRequest[]
  studentPortfolio: StudentPortfolioEntry[]
  studentProfileSummary: typeof STUDENT_PROFILE_SUMMARY
  classWellbeing: WellbeingClassSummary[]
  authorityAnalytics: AuthorityEventAnalytics[]
  calendarItems: typeof EVENTS_CALENDAR_ITEMS
}

export function createInitialEventState(): MutableEventState {
  return {
    registrations: [...EVENT_REGISTRATIONS],
    events: [...EVENTS_DATA],
    approvalRequests: [...PARENT_APPROVAL_REQUESTS],
  }
}

export function getEventDashboardSnapshot(
  user: User | null,
  state: MutableEventState,
): EventDashboardSnapshot {
  const role = user?.role ?? 'student'
  const notifications = EVENT_NOTIFICATIONS.filter((entry) => entry.role === role)

  return {
    events: state.events,
    organizers: EVENT_ORGANIZERS,
    registrations: state.registrations,
    certificates: EVENT_CERTIFICATES,
    photos: EVENT_PHOTOS,
    feedback: EVENT_FEEDBACK,
    notifications,
    teacherClassViews: TEACHER_CLASS_EVENT_VIEW,
    parentApprovals: state.approvalRequests,
    studentPortfolio: STUDENT_PORTFOLIO_ENTRIES,
    studentProfileSummary: STUDENT_PROFILE_SUMMARY,
    classWellbeing: WELLBEING_CLASS_SUMMARY,
    authorityAnalytics: AUTHORITY_EVENT_ANALYTICS,
    calendarItems: EVENTS_CALENDAR_ITEMS,
  }
}

export function getStudentInterestProfile(studentId: string): StudentInterestProfile | null {
  return STUDENT_INTEREST_PROFILES.find((profile) => profile.studentId === studentId) ?? null
}

function isWithinDatePreset(date: string, preset: EventFilterState['datePreset']): boolean {
  if (preset === 'all') return true

  const eventDate = new Date(date)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (preset === 'today') {
    return eventDate.toDateString() === todayStart.toDateString()
  }

  if (preset === 'tomorrow') {
    const tomorrow = new Date(todayStart)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return eventDate.toDateString() === tomorrow.toDateString()
  }

  if (preset === 'this_week') {
    const weekEnd = new Date(todayStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return eventDate >= todayStart && eventDate <= weekEnd
  }

  if (preset === 'weekend') {
    const day = eventDate.getDay()
    return day === 0 || day === 6
  }

  if (preset === 'month') {
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
  }

  return true
}

export function filterEvents(events: EventItem[], filters: EventFilterState): EventItem[] {
  return events.filter((event) => {
    const search = filters.search.trim().toLowerCase()
    const searchMatches =
      search.length === 0 ||
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.categories.some((category) => category.toLowerCase().includes(search))

    const gradeMatches =
      filters.grade === 'all' || event.recommendedGrades.includes(filters.grade)

    const categoryMatches =
      filters.category === 'all' || event.categories.includes(filters.category)

    const feeMatches = filters.feeType === 'all' || event.feeType === filters.feeType
    const modeMatches = filters.mode === 'all' || event.mode === filters.mode
    const scopeMatches = filters.scope === 'all' || event.scope === filters.scope
    const dateMatches = isWithinDatePreset(event.date, filters.datePreset)

    return (
      searchMatches &&
      gradeMatches &&
      categoryMatches &&
      feeMatches &&
      modeMatches &&
      scopeMatches &&
      dateMatches
    )
  })
}

export function getRecommendedEvents(
  studentProfile: StudentInterestProfile | null,
  events: EventItem[],
): EventRecommendation[] {
  if (!studentProfile) return []

  const now = new Date()
  const publishedUpcoming = events.filter(
    (event) => event.status === 'published' && new Date(event.date).getTime() >= now.getTime(),
  )

  return publishedUpcoming
    .map((event) => {
      const interestMatch = event.categories.filter((category) =>
        studentProfile.interests.includes(category),
      ).length
      const subjectMatch = studentProfile.favoriteSubjects.filter((subject) =>
        event.categories.some((category) =>
          category.toLowerCase().includes(subject.toLowerCase().split(' ')[0]),
        ),
      ).length
      const gradeMatch = event.recommendedGrades.includes(studentProfile.grade) ? 2 : 0
      const historyPenalty = studentProfile.eventHistoryIds.includes(event.id) ? -2 : 0
      const score = interestMatch * 3 + subjectMatch * 2 + gradeMatch + historyPenalty

      const primaryReasons: string[] = []
      if (interestMatch > 0) {
        const matchedInterest = event.categories.find((category) =>
          studentProfile.interests.includes(category),
        )
        if (matchedInterest) primaryReasons.push(matchedInterest)
      }
      if (subjectMatch > 0 && studentProfile.favoriteSubjects.length > 0) {
        primaryReasons.push(studentProfile.favoriteSubjects[0])
      }

      const reason =
        primaryReasons.length >= 2
          ? `Recommended because you enjoy ${primaryReasons[0]} and ${primaryReasons[1]}.`
          : primaryReasons.length === 1
            ? `Recommended because it aligns with your interest in ${primaryReasons[0]}.`
            : 'Recommended to broaden your extracurricular portfolio.'

      return {
        eventId: event.id,
        score,
        reason,
      }
    })
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => b.score - a.score)
}

export function createRegistration(
  state: MutableEventState,
  eventId: string,
  student: { id: string; name: string; grade: string; parentApprovalRequired: boolean },
): MutableEventState {
  const registrationExists = state.registrations.some(
    (entry) => entry.eventId === eventId && entry.studentId === student.id,
  )
  if (registrationExists) return state

  const status = student.parentApprovalRequired ? 'waiting_parent_approval' : 'confirmed'
  const parentStatus: ApprovalDecision = student.parentApprovalRequired ? 'pending' : 'approved'
  const registrationStatus: RegistrationStatus = status

  const registration: EventRegistration = {
    id: `reg-${eventId}-${student.id}`,
    eventId,
    studentId: student.id,
    studentName: student.name,
    grade: student.grade,
    parentApprovalRequired: student.parentApprovalRequired,
    parentApprovalStatus: parentStatus,
    status: registrationStatus,
    registeredAt: new Date().toISOString(),
    qrTicketCode: status === 'confirmed' ? `QR-${eventId}-${student.id}`.toUpperCase() : undefined,
    attendanceMarked: false,
    certificateIssued: false,
  }

  const events = state.events.map((event) =>
    event.id === eventId
      ? { ...event, seatsRemaining: Math.max(0, event.seatsRemaining - 1) }
      : event,
  )

  const approvalRequests =
    parentStatus === 'pending'
      ? [
          ...state.approvalRequests,
          {
            id: `approval-${registration.id}`,
            registrationId: registration.id,
            childName: student.name,
            eventId,
            status: 'pending' as ApprovalDecision,
          } satisfies ParentApprovalRequest,
        ]
      : state.approvalRequests

  return {
    events,
    registrations: [...state.registrations, registration],
    approvalRequests,
  }
}

export function updateParentApproval(
  state: MutableEventState,
  approvalRequestId: string,
  decision: Extract<ApprovalDecision, 'approved' | 'rejected'>,
): MutableEventState {
  const request = state.approvalRequests.find((entry) => entry.id === approvalRequestId)
  if (!request) return state

  const approvalRequests = state.approvalRequests.map((entry) =>
    entry.id === approvalRequestId ? { ...entry, status: decision } : entry,
  )

  const registrations: EventRegistration[] = state.registrations.map((registration) => {
    if (registration.id !== request.registrationId) return registration

    const status: RegistrationStatus = decision === 'approved' ? 'confirmed' : 'rejected'

    return {
      ...registration,
      parentApprovalStatus: decision,
      status,
      qrTicketCode:
        decision === 'approved'
          ? registration.qrTicketCode ?? `QR-${registration.eventId}-${registration.studentId}`.toUpperCase()
          : undefined,
    }
  })

  return { ...state, registrations, approvalRequests }
}

export function updateEventStatus(
  state: MutableEventState,
  eventId: string,
  status: EventStatus,
): MutableEventState {
  const events = state.events.map((event) => (event.id === eventId ? { ...event, status } : event))
  return { ...state, events }
}

export function markAttendance(
  state: MutableEventState,
  registrationId: string,
  attended: boolean,
): MutableEventState {
  const registrations = state.registrations.map((registration) => {
    if (registration.id !== registrationId) return registration

    return {
      ...registration,
      attendanceMarked: attended,
      status: attended ? 'completed' : registration.status,
      certificateIssued: attended ? registration.certificateIssued : false,
    }
  })
  return { ...state, registrations }
}

export function getDefaultFilters(): EventFilterState {
  return { ...DEFAULT_EVENT_FILTERS }
}
