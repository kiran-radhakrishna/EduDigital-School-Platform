import { prisma } from '../config/prisma'
import { NotFoundError } from '../utils/errors'
import { getSchoolWellbeingByGrade, type GradeWellbeingSummary } from './wellbeing.service'

/** Resolves the school an admin/authority User.id is associated with. */
export async function getSchoolIdForUser(userId: string): Promise<string> {
  const [administrator, authority] = await Promise.all([
    prisma.administrator.findUnique({ where: { userId } }),
    prisma.authority.findUnique({ where: { userId } }),
  ])

  const schoolId = administrator?.schoolId ?? authority?.schoolId
  if (!schoolId) {
    throw new NotFoundError('No school is associated with this account.')
  }
  return schoolId
}

export interface EnrollmentByGrade {
  grade: string
  students: number
}

export async function getEnrollmentByGrade(schoolId: string): Promise<EnrollmentByGrade[]> {
  const grouped = await prisma.student.groupBy({
    by: ['grade'],
    where: { schoolId },
    _count: { _all: true },
  })

  return grouped
    .map((group) => ({ grade: group.grade, students: group._count._all }))
    .sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true }))
}

export interface AttendanceTrendPoint {
  month: string
  attendancePercentage: number
}

export async function getAttendanceTrend(schoolId: string, months = 6): Promise<AttendanceTrendPoint[]> {
  const classes = await prisma.schoolClass.findMany({ where: { schoolId }, select: { id: true } })
  const classIds = classes.map((schoolClass) => schoolClass.id)
  if (classIds.length === 0) return []

  const since = new Date()
  since.setMonth(since.getMonth() - (months - 1))
  since.setDate(1)

  const records = await prisma.attendanceRecord.findMany({
    where: { classId: { in: classIds }, date: { gte: since } },
    select: { date: true, status: true },
  })

  const byMonth = new Map<string, { present: number; total: number }>()
  for (const record of records) {
    const monthKey = record.date.toISOString().slice(0, 7)
    const bucket = byMonth.get(monthKey) ?? { present: 0, total: 0 }
    bucket.total += 1
    if (record.status === 'PRESENT' || record.status === 'LATE') bucket.present += 1
    byMonth.set(monthKey, bucket)
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => ({
      month,
      attendancePercentage: counts.total > 0 ? Math.round((counts.present / counts.total) * 1000) / 10 : 0,
    }))
}

export interface RecentRegistration {
  id: string
  name: string
  role: string
  joinedAt: string
}

export async function getRecentRegistrations(schoolId: string, limit = 5): Promise<RecentRegistration[]> {
  const users = await prisma.user.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, firstName: true, lastName: true, role: true, createdAt: true },
  })

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    joinedAt: user.createdAt.toISOString(),
  }))
}

export interface SchoolAnalytics {
  enrollmentByGrade: EnrollmentByGrade[]
  attendanceTrend: AttendanceTrendPoint[]
  wellbeingByGrade: GradeWellbeingSummary[]
  recentRegistrations: RecentRegistration[]
  totals: { students: number; teachers: number; parents: number; classes: number }
}

export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics> {
  const [
    enrollmentByGrade,
    attendanceTrend,
    wellbeingByGrade,
    recentRegistrations,
    students,
    teachers,
    parents,
    classes,
  ] = await Promise.all([
    getEnrollmentByGrade(schoolId),
    getAttendanceTrend(schoolId),
    getSchoolWellbeingByGrade(schoolId),
    getRecentRegistrations(schoolId),
    prisma.student.count({ where: { schoolId } }),
    prisma.teacher.count({ where: { schoolId } }),
    prisma.parent.count({ where: { schoolId } }),
    prisma.schoolClass.count({ where: { schoolId } }),
  ])

  return {
    enrollmentByGrade,
    attendanceTrend,
    wellbeingByGrade,
    recentRegistrations,
    totals: { students, teachers, parents, classes },
  }
}
