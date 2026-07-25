import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { WellbeingContext } from './wellbeing-context'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'
import { isDemoUserId } from '../data/demoUsers'
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

export function WellbeingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [recordsByUser, setRecordsByUser] = useState<WellbeingRecordMap>(() =>
    parseStoredMap<WellbeingRecordMap>(WELLBEING_RECORDS_STORAGE_KEY),
  )
  const [skipsByUser, setSkipsByUser] = useState<WellbeingSkipMap>(() =>
    parseStoredMap<WellbeingSkipMap>(WELLBEING_SKIPS_STORAGE_KEY),
  )

  const userId = user?.id ?? null
  const todayKey = getDateKey(new Date())
  const userRecords = userId ? recordsByUser[userId] ?? [] : []
  const latestAssessment = getLatestValidAssessment(userRecords)

  const completedToday =
    latestAssessment !== null && getDateKey(new Date(latestAssessment.timestamp)) === todayKey

  const skippedToday = userId ? (skipsByUser[userId] ?? []).includes(todayKey) : false
  const requiresWellbeing = user ? ROLES_REQUIRING_WELLBEING.has(user.role) : false
  const isDemoUser = userId !== null && isDemoUserId(userId)
  const shouldShowWellbeingCheck =
    !!user && requiresWellbeing && !completedToday && !skippedToday && !isDemoUser

  const persistRecords = useCallback((nextRecordsByUser: WellbeingRecordMap) => {
    setRecordsByUser(nextRecordsByUser)
    localStorage.setItem(WELLBEING_RECORDS_STORAGE_KEY, JSON.stringify(nextRecordsByUser))
  }, [])

  const persistSkips = useCallback((nextSkipsByUser: WellbeingSkipMap) => {
    setSkipsByUser(nextSkipsByUser)
    localStorage.setItem(WELLBEING_SKIPS_STORAGE_KEY, JSON.stringify(nextSkipsByUser))
  }, [])

  const removeTodaySkip = useCallback(() => {
    if (!userId) return

    const skips = skipsByUser[userId] ?? []
    const nextSkips = skips.filter((entry) => entry !== todayKey)

    persistSkips({
      ...skipsByUser,
      [userId]: nextSkips,
    })
  }, [persistSkips, skipsByUser, todayKey, userId])

  const saveCameraAssessment = useCallback(
    (emotion: WellbeingEmotion, confidence: number) => {
      if (!userId) return

      const safeConfidence = Math.min(100, Math.max(0, Math.round(confidence)))
      const assessment: WellbeingAssessment = {
        emotion,
        confidence: safeConfidence,
        timestamp: new Date().toISOString(),
      }

      const currentRecords = recordsByUser[userId] ?? []
      persistRecords({
        ...recordsByUser,
        [userId]: [...currentRecords, assessment],
      })
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
    if (!userId) return

    const current = skipsByUser[userId] ?? []
    if (current.includes(todayKey)) return

    persistSkips({
      ...skipsByUser,
      [userId]: [...current, todayKey],
    })
  }, [persistSkips, skipsByUser, todayKey, userId])

  const value = useMemo(
    () => ({
      latestAssessment,
      completedToday,
      skippedToday,
      shouldShowWellbeingCheck,
      saveCameraAssessment,
      saveManualAssessment,
      skipToday,
    }),
    [
      completedToday,
      latestAssessment,
      saveCameraAssessment,
      saveManualAssessment,
      shouldShowWellbeingCheck,
      skipToday,
      skippedToday,
    ],
  )

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>
}
