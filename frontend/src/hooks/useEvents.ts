import { useContext } from 'react'
import { EventsContext } from '../context/events-context'

export function useEvents() {
  const eventsContext = useContext(EventsContext)
  if (!eventsContext) {
    throw new Error('useEvents must be used within an EventsProvider')
  }
  return eventsContext
}
