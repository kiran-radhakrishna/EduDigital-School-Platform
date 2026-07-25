import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { EventsContext } from './events-context'
import { useAuth } from '../hooks/useAuth'
import { getCurrentUserIdentity } from '../utils/helpers'
import { type EventFilterState, type EventStatus } from '../types/events'
import {
  createInitialEventState,
  createRegistration,
  filterEvents,
  getDefaultFilters,
  getEventDashboardSnapshot,
  getRecommendedEvents,
  getStudentInterestProfile,
  markAttendance,
  updateEventStatus,
  updateParentApproval,
} from '../services/eventsService'

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState(createInitialEventState)
  const [filters, setFiltersState] = useState<EventFilterState>(getDefaultFilters)

  const snapshot = useMemo(() => getEventDashboardSnapshot(user, state), [state, user])

  const filteredPublishedEvents = useMemo(
    () => filterEvents(snapshot.events.filter((event) => event.status === 'published'), filters),
    [filters, snapshot.events],
  )

  const studentProfile = getStudentInterestProfile('student-krn')

  const studentRecommendations = useMemo(
    () => getRecommendedEvents(studentProfile, snapshot.events),
    [snapshot.events, studentProfile],
  )

  const currentUser = getCurrentUserIdentity(user, 'student')
  const myRegistrations = useMemo(
    () => snapshot.registrations.filter((entry) => entry.studentName === currentUser.fullName),
    [currentUser.fullName, snapshot.registrations],
  )

  const setFilters = useCallback((next: Partial<EventFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...next }))
  }, [])

  const resetFilters = useCallback(() => setFiltersState(getDefaultFilters()), [])

  const registerForEvent = useCallback((eventId: string) => {
    setState((previous) =>
      createRegistration(previous, eventId, {
        id: 'student-krn',
        name: currentUser.fullName,
        grade: studentProfile?.grade ?? '7',
        parentApprovalRequired: true,
      }),
    )
  }, [currentUser.fullName, studentProfile?.grade])

  const approveParentRequest = useCallback((approvalRequestId: string) => {
    setState((previous) => updateParentApproval(previous, approvalRequestId, 'approved'))
  }, [])

  const rejectParentRequest = useCallback((approvalRequestId: string) => {
    setState((previous) => updateParentApproval(previous, approvalRequestId, 'rejected'))
  }, [])

  const updateAuthorityEventStatus = useCallback((eventId: string, status: EventStatus) => {
    setState((previous) => updateEventStatus(previous, eventId, status))
  }, [])

  const markTeacherAttendance = useCallback((registrationId: string, attended: boolean) => {
    setState((previous) => markAttendance(previous, registrationId, attended))
  }, [])

  const value = useMemo(
    () => ({
      snapshot,
      filters,
      filteredPublishedEvents,
      studentRecommendations,
      myRegistrations,
      setFilters,
      resetFilters,
      registerForEvent,
      approveParentRequest,
      rejectParentRequest,
      updateAuthorityEventStatus,
      markTeacherAttendance,
    }),
    [
      approveParentRequest,
      filteredPublishedEvents,
      filters,
      markTeacherAttendance,
      myRegistrations,
      registerForEvent,
      rejectParentRequest,
      resetFilters,
      setFilters,
      snapshot,
      studentRecommendations,
      updateAuthorityEventStatus,
    ],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}
