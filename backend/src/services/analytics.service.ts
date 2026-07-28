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
  totals: {
    students: number
    teachers: number
    parents: number
    classes: number
    users: number
    schools: number
    activeStudents: number
  }
}

export interface MonthlyCollectionPoint {
  month: string
  amount: number
}

export interface RevenueByClassPoint {
  className: string
  amount: number
}

export interface FinanceAnalytics {
  totalRevenue: number
  pendingFees: number
  paidFees: number
  monthlyCollections: MonthlyCollectionPoint[]
  revenueByClass: RevenueByClassPoint[]
  revenueBySchool: { schoolId: string; total: number }
}

export async function getFinanceAnalytics(schoolId: string): Promise<FinanceAnalytics> {
  const invoices = await prisma.feeInvoice.findMany({
    where: { student: { schoolId } },
    include: {
      payments: true,
      student: {
        include: { enrollments: { include: { class: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
  })

  let totalRevenue = 0
  let pendingFees = 0
  const monthlyMap = new Map<string, number>()
  const classMap = new Map<string, number>()

  for (const invoice of invoices) {
    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    totalRevenue += paid
    pendingFees += Math.max(0, invoice.amount + invoice.lateFine - paid)

    const className = invoice.student.enrollments[0]?.class.name ?? 'Unassigned'
    classMap.set(className, (classMap.get(className) ?? 0) + paid)

    for (const payment of invoice.payments) {
      const monthKey = payment.paymentDate.toISOString().slice(0, 7)
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + payment.amount)
    }
  }

  const monthlyCollections = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))

  const revenueByClass = Array.from(classMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([className, amount]) => ({ className, amount: Math.round(amount * 100) / 100 }))

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingFees: Math.round(pendingFees * 100) / 100,
    paidFees: Math.round(totalRevenue * 100) / 100,
    monthlyCollections,
    revenueByClass,
    revenueBySchool: { schoolId, total: Math.round(totalRevenue * 100) / 100 },
  }
}

export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    enrollmentByGrade,
    attendanceTrend,
    wellbeingByGrade,
    recentRegistrations,
    students,
    teachers,
    parents,
    classes,
    users,
    activeStudentRecords,
  ] = await Promise.all([
    getEnrollmentByGrade(schoolId),
    getAttendanceTrend(schoolId),
    getSchoolWellbeingByGrade(schoolId),
    getRecentRegistrations(schoolId),
    prisma.student.count({ where: { schoolId } }),
    prisma.teacher.count({ where: { schoolId } }),
    prisma.parent.count({ where: { schoolId } }),
    prisma.schoolClass.count({ where: { schoolId } }),
    prisma.user.count({ where: { schoolId } }),
    prisma.attendanceRecord.findMany({
      where: { student: { schoolId }, date: { gte: thirtyDaysAgo } },
      select: { studentId: true },
      distinct: ['studentId'],
    }),
  ])

  return {
    enrollmentByGrade,
    attendanceTrend,
    wellbeingByGrade,
    recentRegistrations,
    totals: { students, teachers, parents, classes, users, schools: 1, activeStudents: activeStudentRecords.length },
  }
}
