import { prisma } from '../config/prisma'
import { NotFoundError, ConflictError } from '../utils/errors'

export async function listBuses(schoolId: string) {
  return prisma.bus.findMany({ where: { schoolId }, include: { driver: true }, orderBy: { plateNumber: 'asc' } })
}

export interface CreateBusInput {
  schoolId: string
  plateNumber: string
  capacity: number
  model?: string
  driverId?: string
}

export async function createBus(input: CreateBusInput) {
  return prisma.bus.create({
    data: {
      schoolId: input.schoolId,
      plateNumber: input.plateNumber.trim(),
      capacity: input.capacity,
      model: input.model,
      driverId: input.driverId,
    },
    include: { driver: true },
  })
}

export interface UpdateBusInput {
  plateNumber?: string
  capacity?: number
  model?: string
  driverId?: string | null
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
}

export async function updateBus(id: string, input: UpdateBusInput) {
  const existing = await prisma.bus.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Bus not found.')
  return prisma.bus.update({ where: { id }, data: input, include: { driver: true } })
}

export async function deleteBus(id: string) {
  await prisma.bus.delete({ where: { id } })
}

export async function listDrivers(schoolId: string) {
  return prisma.driver.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export interface CreateDriverInput {
  schoolId: string
  name: string
  phone?: string
  licenseNumber?: string
}

export async function createDriver(input: CreateDriverInput) {
  return prisma.driver.create({
    data: { schoolId: input.schoolId, name: input.name.trim(), phone: input.phone, licenseNumber: input.licenseNumber },
  })
}

export async function updateDriver(id: string, input: Partial<CreateDriverInput>) {
  const existing = await prisma.driver.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Driver not found.')
  return prisma.driver.update({ where: { id }, data: input })
}

export async function deleteDriver(id: string) {
  await prisma.driver.delete({ where: { id } })
}

const routeInclude = {
  bus: { include: { driver: true } },
  stops: { orderBy: { sequenceOrder: 'asc' as const } },
} as const

export async function listRoutes(schoolId: string) {
  return prisma.route.findMany({ where: { schoolId }, include: routeInclude, orderBy: { name: 'asc' } })
}

export async function getRouteById(id: string) {
  const route = await prisma.route.findUnique({ where: { id }, include: routeInclude })
  if (!route) throw new NotFoundError('Route not found.')
  return route
}

export interface CreateRouteInput {
  schoolId: string
  name: string
  busId?: string
  description?: string
}

export async function createRoute(input: CreateRouteInput) {
  return prisma.route.create({
    data: { schoolId: input.schoolId, name: input.name.trim(), busId: input.busId, description: input.description },
    include: routeInclude,
  })
}

export async function updateRoute(id: string, input: { name?: string; busId?: string | null; description?: string }) {
  await getRouteById(id)
  return prisma.route.update({ where: { id }, data: input, include: routeInclude })
}

export async function deleteRoute(id: string) {
  await prisma.route.delete({ where: { id } })
}

export interface CreateStopInput {
  routeId: string
  name: string
  sequenceOrder: number
  pickupTime?: string
}

export async function createStop(input: CreateStopInput) {
  await getRouteById(input.routeId)
  return prisma.stop.create({
    data: {
      routeId: input.routeId,
      name: input.name.trim(),
      sequenceOrder: input.sequenceOrder,
      pickupTime: input.pickupTime,
    },
  })
}

export async function updateStop(id: string, input: { name?: string; sequenceOrder?: number; pickupTime?: string }) {
  const existing = await prisma.stop.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Stop not found.')
  return prisma.stop.update({ where: { id }, data: input })
}

export async function deleteStop(id: string) {
  await prisma.stop.delete({ where: { id } })
}

const studentTransportInclude = {
  route: { include: { bus: { include: { driver: true } } } },
  stop: true,
} as const

export interface AssignStudentInput {
  studentId: string
  routeId: string
  stopId: string
}

export async function assignStudent(input: AssignStudentInput) {
  const stop = await prisma.stop.findUnique({ where: { id: input.stopId } })
  if (!stop || stop.routeId !== input.routeId) {
    throw new ConflictError('The selected stop does not belong to the selected route.')
  }

  return prisma.studentTransport.upsert({
    where: { studentId: input.studentId },
    update: { routeId: input.routeId, stopId: input.stopId },
    create: input,
    include: studentTransportInclude,
  })
}

export async function removeStudentAssignment(studentId: string) {
  await prisma.studentTransport.delete({ where: { studentId } }).catch(() => {})
}

export async function getStudentTransport(studentId: string) {
  return prisma.studentTransport.findUnique({ where: { studentId }, include: studentTransportInclude })
}

export async function listRouteStudents(routeId: string) {
  return prisma.studentTransport.findMany({
    where: { routeId },
    include: {
      stop: true,
      student: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
  })
}
