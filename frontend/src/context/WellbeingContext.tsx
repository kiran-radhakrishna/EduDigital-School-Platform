import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { WellbeingContext, type WellbeingContextValue } from './wellbeing-context'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'
import { wellbeingApi } from '../services/wellbeingApi'
import { isWellbeingEmotion, type WellbeingAssessment, type WellbeingEmotion } from '../types/wellbeing'

const WELLBEING_RECORDS_STORAGE_KEY = 'wellbeing_records'
const WELLBEING_SKIPS_STORAGE_KEY = 'wellbeing_skips'
const ROLES_REQUIRING_WELLBEING = new Set<UserRole>(['student', 'teacher', 'parent'])

type WellbeingRecordMap = Record<string, WellbeingAssessment[]>
type WellbeingSkipMap = Record<string, string[]>

function getDateKey(value: Date): string {
  return value.toISOString().split('T')[0]
}

function isValidAssessment(value: unknown): value is WellbeingAssessment {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<WellbeingAssessment>

  return (
    typeof candidate.emotion === 'string' &&
    isWellbeingEmotion(candidate.emotion) &&
    typeof candidate.confidence === 'number' &&
    Number.isFinite(candidate.confidence) &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 100 &&
    typeof candidate.timestamp === 'string'
  )
}

function parseStoredMap<T>(key: string): T {
  const raw = localStorage.getItem(key)
  if (!raw) return {} as T

  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') return parsed as T
    localStorage.removeItem(key)
    return {} as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Failed to parse ${key} from localStorage.`, error)
      localStorage.removeItem(key)
      return {} as T
    }
    throw error
  }
}

function getLatestValidAssessment(records: WellbeingAssessment[]): WellbeingAssessment | null {
  const valid = records.filter((entry) => isValidAssessment(entry))
  if (valid.length === 0) return null

  return valid.reduce((latest, current) =>
    new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest,
  )
}

/**
 * Demo Mode's wellbeing state — pure client-side localStorage, exactly as before.
 * Demo Mode must never touch the backend, so this provider makes zero API calls.
 */
function DemoWellbeingProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [recordsByUser, setRecordsByUser] = useState<WellbeingRecordMap>(() =>
    parseStoredMap<WellbeingRecordMap>(WELLBEING_RECORDS_STORAGE_KEY),
  )
  const [skipsByUser, setSkipsByUser] = useState<WellbeingSkipMap>(() =>
    parseStoredMap<WellbeingSkipMap>(WELLBEING_SKIPS_STORAGE_KEY),
  )

  const todayKey = getDateKey(new Date())
  const userRecords = recordsByUser[userId] ?? []
  const latestAssessment = getLatestValidAssessment(userRecords)

  const completedToday =
    latestAssessment !== null && getDateKey(new Date(latestAssessment.timestamp)) === todayKey

  const skippedToday = (skipsByUser[userId] ?? []).includes(todayKey)
  // Demo Mode always bypasses the wellbeing check, matching the existing behavior.
  const shouldShowWellbeingCheck = false

  const persistRecords = useCallback((nextRecordsByUser: WellbeingRecordMap) => {
    setRecordsByUser(nextRecordsByUser)
    localStorage.setItem(WELLBEING_RECORDS_STORAGE_KEY, JSON.stringify(nextRecordsByUser))
  }, [])

  const persistSkips = useCallback((nextSkipsByUser: WellbeingSkipMap) => {
    setSkipsByUser(nextSkipsByUser)
    localStorage.setItem(WELLBEING_SKIPS_STORAGE_KEY, JSON.stringify(nextSkipsByUser))
  }, [])

  const removeTodaySkip = useCallback(() => {
    const skips = skipsByUser[userId] ?? []
    const nextSkips = skips.filter((entry) => entry !== todayKey)
    persistSkips({ ...skipsByUser, [userId]: nextSkips })
  }, [persistSkips, skipsByUser, todayKey, userId])

  const saveCameraAssessment = useCallback(
    (emotion: WellbeingEmotion, confidence: number) => {
      const safeConfidence = Math.min(100, Math.max(0, Math.round(confidence)))
      const assessment: WellbeingAssessment = {
        emotion,
        confidence: safeConfidence,
        timestamp: new Date().toISOString(),
      }

      const currentRecords = recordsByUser[userId] ?? []
      persistRecords({ ...recordsByUser, [userId]: [...currentRecords, assessment] })
      removeTodaySkip()
    },
    [persistRecords, recordsByUser, removeTodaySkip, userId],
  )

  const saveManualAssessment = useCallback(
    (emotion: WellbeingEmotion) => {
      const manualConfidence: Record<WellbeingEmotion, number> = {
        happy: 92,
        focused: 91,
        calm: 90,
        neutral: 88,
        tired: 87,
        sad: 86,
        stressed: 89,
        anxious: 89,
      }

      saveCameraAssessment(emotion, manualConfidence[emotion])
    },
    [saveCameraAssessment],
  )

  const skipToday = useCallback(() => {
    const current = skipsByUser[userId] ?? []
    if (current.includes(todayKey)) return
    persistSkips({ ...skipsByUser, [userId]: [...current, todayKey] })
  }, [persistSkips, skipsByUser, todayKey, userId])

  const value = useMemo<WellbeingContextValue>(
    () => ({
      latestAssessment,
      completedToday,
      skippedToday,
      shouldShowWellbeingCheck,
      saveCameraAssessment,
      saveManualAssessment,
      skipToday,
    }),
    [completedToday, latestAssessment, saveCameraAssessment, saveManualAssessment, shouldShowWellbeingCheck, skipToday, skippedToday],
  )

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>
}

/** Real users' wellbeing state — backed by PostgreSQL via /wellbeing/*. */
function RealWellbeingProvider({ role, children }: { role: UserRole; children: ReactNode }) {
  const [latestAssessment, setLatestAssessment] = useState<WellbeingAssessment | null>(null)
  const [completedToday, setCompletedToday] = useState(false)
  const [skippedToday, setSkippedToday] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    wellbeingApi
      .getStatus()
      .then((status) => {
        if (cancelled) return
        setLatestAssessment(status.latestAssessment)
        setCompletedToday(status.completedToday)
        setSkippedToday(status.skippedToday)
      })
      .catch(() => {
        // Leave defaults (not completed, not skipped) so the check still surfaces.
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const requiresWellbeing = ROLES_REQUIRING_WELLBEING.has(role)
  const shouldShowWellbeingCheck = isLoaded && requiresWellbeing && !completedToday && !skippedToday

  const saveCameraAssessment = useCallback((emotion: WellbeingEmotion, confidence: number) => {
    void wellbeingApi
      .createCheckIn(emotion, confidence, 'camera')
      .then((status) => {
        setLatestAssessment(status.latestAssessment)
        setCompletedToday(status.completedToday)
        setSkippedToday(status.skippedToday)
      })
      .catch(() => {})
  }, [])

  const saveManualAssessment = useCallback((emotion: WellbeingEmotion) => {
    const manualConfidence: Record<WellbeingEmotion, number> = {
      happy: 92,
      focused: 91,
      calm: 90,
      neutral: 88,
      tired: 87,
      sad: 86,
      stressed: 89,
      anxious: 89,
    }

    void wellbeingApi
      .createCheckIn(emotion, manualConfidence[emotion], 'manual')
      .then((status) => {
        setLatestAssessment(status.latestAssessment)
        setCompletedToday(status.completedToday)
        setSkippedToday(status.skippedToday)
      })
      .catch(() => {})
  }, [])

  const skipToday = useCallback(() => {
    void wellbeingApi
      .skipToday()
      .then((status) => {
        setSkippedToday(status.skippedToday)
      })
      .catch(() => {})
  }, [])

  const value = useMemo<WellbeingContextValue>(
    () => ({
      latestAssessment,
      completedToday,
      skippedToday,
      shouldShowWellbeingCheck,
      saveCameraAssessment,
      saveManualAssessment,
      skipToday,
    }),
    [completedToday, latestAssessment, saveCameraAssessment, saveManualAssessment, shouldShowWellbeingCheck, skipToday, skippedToday],
  )

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>
}

const INACTIVE_VALUE: WellbeingContextValue = {
  latestAssessment: null,
  completedToday: false,
  skippedToday: false,
  shouldShowWellbeingCheck: false,
  saveCameraAssessment: () => {},
  saveManualAssessment: () => {},
  skipToday: () => {},
}

export function WellbeingProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth()

  if (!user) {
    return <WellbeingContext.Provider value={INACTIVE_VALUE}>{children}</WellbeingContext.Provider>
  }

  if (isDemoMode) {
    return <DemoWellbeingProvider userId={user.id}>{children}</DemoWellbeingProvider>
  }

  return <RealWellbeingProvider role={user.role}>{children}</RealWellbeingProvider>
}
