import type { WellbeingEmotion as PrismaWellbeingEmotion } from '@prisma/client'
import { prisma } from '../config/prisma'

function toDateOnly(date: Date = new Date()): Date {
  return new Date(`${date.toISOString().split('T')[0]}T00:00:00.000Z`)
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

  // A fresh check-in supersedes any "skipped today" marker for this user.
  await prisma.wellbeingSkip.deleteMany({ where: { userId: input.userId, date: today } })

  return prisma.wellbeingCheckIn.create({
    data: { userId: input.userId, emotion: input.emotion, confidence, source: input.source ?? 'manual' },
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
