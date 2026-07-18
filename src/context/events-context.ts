import { createContext } from 'react'
import type { EventFilterState, EventItem, EventRecommendation, EventRegistration } from '../types/events'
import type { EventDashboardSnapshot } from '../services/eventsService'

export interface EventsContextValue {
  snapshot: EventDashboardSnapshot
  filters: EventFilterState
  filteredPublishedEvents: EventItem[]
  studentRecommendations: EventRecommendation[]
  myRegistrations: EventRegistration[]
  setFilters: (next: Partial<EventFilterState>) => void
  resetFilters: () => void
  registerForEvent: (eventId: string) => void
  approveParentRequest: (approvalRequestId: string) => void
  rejectParentRequest: (approvalRequestId: string) => void
  updateAuthorityEventStatus: (eventId: string, status: EventItem['status']) => void
  markTeacherAttendance: (registrationId: string, attended: boolean) => void
}

export const EventsContext = createContext<EventsContextValue | undefined>(undefined)
