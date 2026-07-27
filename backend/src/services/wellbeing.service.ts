import type { WellbeingEmotion as PrismaWellbeingEmotion, WellbeingRiskLevel } from '@prisma/client'
import { prisma } from '../config/prisma'

function toDateOnly(date: Date = new Date()): Date {
  return new Date(`${date.toISOString().split('T')[0]}T00:00:00.000Z`)
}

const STRESS_BASELINE: Record<PrismaWellbeingEmotion, number> = {
  HAPPY: 12,
  FOCUSED: 18,
  CALM: 10,
  NEUTRAL: 35,
  TIRED: 55,
  SAD: 65,
  STRESSED: 80,
  ANXIOUS: 85,
}

const RECOMMENDATION_BY_EMOTION: Record<PrismaWellbeingEmotion, string> = {
  HAPPY: 'Keep up the momentum — channel this energy into a challenging task today.',
  FOCUSED: 'Great focus. Tackle your most demanding assignment while concentration is high.',
  CALM: 'A balanced state is ideal for steady, consistent progress.',
  NEUTRAL: 'A quick warm-up activity can help build momentum for the day.',
  TIRED: 'Consider a short break before continuing — rest supports better learning.',
  SAD: 'Be gentle with yourself today. Small wins still count as progress.',
  STRESSED: 'Try a short breathing exercise before your next task to reset.',
  ANXIOUS: 'Support resources are available whenever you need them — you are not alone.',
}

const RESPONSE_BY_EMOTION: Record<PrismaWellbeingEmotion, string> = {
  HAPPY: "You're feeling positive today — that's great to see!",
  FOCUSED: "You're locked in and ready to learn.",
  CALM: "You're feeling calm and steady.",
  NEUTRAL: 'A steady, neutral start to the day.',
  TIRED: "You're feeling a bit tired — take it at your own pace.",
  SAD: "It looks like today's a harder day. That's okay.",
  STRESSED: "You're feeling some pressure right now.",
  ANXIOUS: "You're feeling anxious — support is always available.",
}

export interface WellbeingInsights {
  stressLevel: number
  riskLevel: WellbeingRiskLevel
  aiResponse: string
  recommendation: string
}

/** Deterministic, rule-based wellbeing analysis derived from the reported emotion + confidence. */
export function computeInsights(emotion: PrismaWellbeingEmotion, confidence: number): WellbeingInsights {
  const baseline = STRESS_BASELINE[emotion]
  const weight = confidence / 100
  const stressLevel = Math.round(baseline * (0.6 + 0.4 * weight))

  const riskLevel: WellbeingRiskLevel = stressLevel >= 70 ? 'HIGH' : stressLevel >= 45 ? 'MEDIUM' : 'LOW'

  return {
    stressLevel,
    riskLevel,
    aiResponse: RESPONSE_BY_EMOTION[emotion],
    recommendation: RECOMMENDATION_BY_EMOTION[emotion],
  }
}

export interface CreateCheckInInput {
  userId: string
  emotion: PrismaWellbeingEmotion
  confidence: number
  source?: string
}

export async function createCheckIn(input: CreateCheckInInput) {
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence)))
  const today = toDateOnly()
  const insights = computeInsights(input.emotion, confidence)

  // A fresh check-in supersedes any "skipped today" marker for this user.
  await prisma.wellbeingSkip.deleteMany({ where: { userId: input.userId, date: today } })

  return prisma.wellbeingCheckIn.create({
    data: {
      userId: input.userId,
      emotion: input.emotion,
      confidence,
      source: input.source ?? 'manual',
      ...insights,
    },
  })
}

export async function getLatestCheckIn(userId: string) {
  return prisma.wellbeingCheckIn.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function getCheckInHistory(userId: string, limit = 30) {
  return prisma.wellbeingCheckIn.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit })
}

export async function isSkippedToday(userId: string): Promise<boolean> {
  const today = toDateOnly()
  const skip = await prisma.wellbeingSkip.findUnique({ where: { userId_date: { userId, date: today } } })
  return skip !== null
}

export async function skipToday(userId: string): Promise<void> {
  const today = toDateOnly()
  await prisma.wellbeingSkip.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  })
}

export interface WellbeingStatus {
  latest: Awaited<ReturnType<typeof getLatestCheckIn>>
  completedToday: boolean
  skippedToday: boolean
}

export async function getStatus(userId: string): Promise<WellbeingStatus> {
  const [latest, skipped] = await Promise.all([getLatestCheckIn(userId), isSkippedToday(userId)])
  const todayKey = toDateOnly().toISOString().split('T')[0]
  const completedToday = latest !== null && latest.createdAt.toISOString().split('T')[0] === todayKey
  return { latest, completedToday, skippedToday: skipped }
}

const SUPPORT_EMOTIONS: PrismaWellbeingEmotion[] = ['SAD', 'STRESSED', 'ANXIOUS']

function bucketOf(emotion: PrismaWellbeingEmotion): 'happy' | 'focused' | 'neutral' | 'needsSupport' {
  if (emotion === 'HAPPY') return 'happy'
  if (emotion === 'FOCUSED') return 'focused'
  if (SUPPORT_EMOTIONS.includes(emotion)) return 'needsSupport'
  return 'neutral'
}

export interface ClassWellbeingSummary {
  classId: string
  moodDistribution: { happy: number; focused: number; neutral: number; needsSupport: number }
  weeklyTrend: Array<{ label: string; happy: number; focused: number; neutral: number; needsSupport: number }>
  studentsRequestingSupport: Array<{
    studentId: string
    studentName: string
    emotion: string
    timestamp: string
    stress: number
  }>
}

/** Anonymized, class-scoped wellbeing summary for a teacher's own class roster. */
export async function getClassWellbeing(classId: string): Promise<ClassWellbeingSummary> {
  const empty: ClassWellbeingSummary = {
    classId,
    moodDistribution: { happy: 0, focused: 0, neutral: 0, needsSupport: 0 },
    weeklyTrend: [],
    studentsRequestingSupport: [],
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
  })
  const userIds = enrollments.map((enrollment) => enrollment.student.userId)
  if (userIds.length === 0) return empty

  const nameByUserId = new Map(
    enrollments.map((enrollment) => [
      enrollment.student.userId,
      `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`,
    ]),
  )

  const latestCheckIns = await prisma.wellbeingCheckIn.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
  })

  const moodDistribution = { happy: 0, focused: 0, neutral: 0, needsSupport: 0 }
  for (const checkIn of latestCheckIns) {
    moodDistribution[bucketOf(checkIn.emotion)] += 1
  }

  const studentsRequestingSupport = latestCheckIns
    .filter((checkIn) => checkIn.riskLevel === 'HIGH')
    .map((checkIn) => ({
      studentId: checkIn.userId,
      studentName: nameByUserId.get(checkIn.userId) ?? 'Student',
      emotion: checkIn.emotion,
      timestamp: checkIn.createdAt.toISOString(),
      stress: checkIn.stressLevel,
    }))

  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - 6)

  const weekCheckIns = await prisma.wellbeingCheckIn.findMany({
    where: { userId: { in: userIds }, createdAt: { gte: since } },
    select: { emotion: true, createdAt: true },
  })

  const byDay = new Map<string, { happy: number; focused: number; neutral: number; needsSupport: number }>()
  for (const checkIn of weekCheckIns) {
    const dayKey = checkIn.createdAt.toISOString().slice(0, 10)
    const bucket = byDay.get(dayKey) ?? { happy: 0, focused: 0, neutral: 0, needsSupport: 0 }
    bucket[bucketOf(checkIn.emotion)] += 1
    byDay.set(dayKey, bucket)
  }

  const weeklyTrend = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(since)
    day.setDate(since.getDate() + offset)
    const key = day.toISOString().slice(0, 10)
    const counts = byDay.get(key) ?? { happy: 0, focused: 0, neutral: 0, needsSupport: 0 }
    return { label: key.slice(5), ...counts }
  })

  return { classId, moodDistribution, weeklyTrend, studentsRequestingSupport }
}

export interface GradeWellbeingSummary {
  grade: string
  happy: number
  neutral: number
  needsSupport: number
}

const POSITIVE_EMOTIONS: PrismaWellbeingEmotion[] = ['HAPPY', 'FOCUSED', 'CALM']
const NEEDS_SUPPORT_EMOTIONS: PrismaWellbeingEmotion[] = ['SAD', 'STRESSED', 'ANXIOUS']

/** Buckets each student's most recent check-in into happy/neutral/needs-support, grouped by grade. */
export async function getSchoolWellbeingByGrade(schoolId: string): Promise<GradeWellbeingSummary[]> {
  const students = await prisma.student.findMany({ where: { schoolId }, select: { grade: true, userId: true } })
  if (students.length === 0) return []

  const latestCheckIns = await prisma.wellbeingCheckIn.findMany({
    where: { userId: { in: students.map((student) => student.userId) } },
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
  })
  const emotionByUserId = new Map(latestCheckIns.map((checkIn) => [checkIn.userId, checkIn.emotion]))

  const buckets = new Map<string, { happy: number; neutral: number; needsSupport: number }>()
  for (const student of students) {
    const emotion = emotionByUserId.get(student.userId)
    if (!emotion) continue

    const bucket = buckets.get(student.grade) ?? { happy: 0, neutral: 0, needsSupport: 0 }
    if (POSITIVE_EMOTIONS.includes(emotion)) bucket.happy += 1
    else if (NEEDS_SUPPORT_EMOTIONS.includes(emotion)) bucket.needsSupport += 1
    else bucket.neutral += 1
    buckets.set(student.grade, bucket)
  }

  return Array.from(buckets.entries()).map(([grade, counts]) => ({ grade, ...counts }))
}
