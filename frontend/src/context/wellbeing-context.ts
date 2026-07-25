import { createContext } from 'react'
import type { WellbeingAssessment, WellbeingEmotion } from '../types/wellbeing'

export interface WellbeingContextValue {
  latestAssessment: WellbeingAssessment | null
  completedToday: boolean
  skippedToday: boolean
  shouldShowWellbeingCheck: boolean
  saveCameraAssessment: (emotion: WellbeingEmotion, confidence: number) => void
  saveManualAssessment: (emotion: WellbeingEmotion) => void
  skipToday: () => void
}

export const WellbeingContext = createContext<WellbeingContextValue | undefined>(undefined)
