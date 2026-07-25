import { useContext } from 'react'
import { WellbeingContext } from '../context/wellbeing-context'

export function useWellbeing() {
  const wellbeingContext = useContext(WellbeingContext)
  if (!wellbeingContext) {
    throw new Error('useWellbeing must be used within a WellbeingProvider')
  }
  return wellbeingContext
}
