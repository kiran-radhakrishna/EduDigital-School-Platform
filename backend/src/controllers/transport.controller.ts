import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { getUserSchoolId, isParentOfStudent, resolveStudentId } from '../services/resolvers'
import * as transportService from '../services/transport.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

async function assertCanAccessSchool(req: Request, schoolId: string): Promise<void> {
  if (isPrivileged(req)) return

  const userSchoolId = req.userId ? await getUserSchoolId(req.userId) : null
  if (userSchoolId !== schoolId) {
    throw new ForbiddenError("You do not have permission to access this school's data.")
  }
}

async function assertCanViewStudentTransport(req: Request, studentUserId: string): Promise<void> {
  const isSelf = req.userId === studentUserId
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))
  if (!isSelf && !isParent && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this transport assignment.')
  }
}

// ─── Buses ───────────────────────────────────────────────────────────────

export async function listBuses(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const buses = await transportService.listBuses(schoolId)
  res.status(200).json({ buses })
}

const createBusSchema = z.object({
  schoolId: z.string().min(1),
  plateNumber: z.string().min(1),
  capacity: z.number().int().positive(),
  model: z.string().optional(),
  driverId: z.string().optional(),
})

export async function createBus(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createBusSchema, req.body)
  const bus = await transportService.createBus(input)
  res.status(201).json({ bus })
}

const updateBusSchema = z.object({
  plateNumber: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  model: z.string().optional(),
  driverId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
})

export async function updateBus(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateBusSchema, req.body)
  const bus = await transportService.updateBus(req.params.id, input)
  res.status(200).json({ bus })
}

export async function deleteBus(req: Request, res: Response): Promise<void> {
  await transportService.deleteBus(req.params.id)
  res.status(204).send()
}

// ─── Drivers ─────────────────────────────────────────────────────────────

export async function listDrivers(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const drivers = await transportService.listDrivers(schoolId)
  res.status(200).json({ drivers })
}

const createDriverSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
})

export async function createDriver(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createDriverSchema, req.body)
  const driver = await transportService.createDriver(input)
  res.status(201).json({ driver })
}

const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
})

export async function updateDriver(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateDriverSchema, req.body)
  const driver = await transportService.updateDriver(req.params.id, input)
  res.status(200).json({ driver })
}

export async function deleteDriver(req: Request, res: Response): Promise<void> {
  await transportService.deleteDriver(req.params.id)
  res.status(204).send()
}

// ─── Routes & Stops ──────────────────────────────────────────────────────

export async function listRoutes(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const routes = await transportService.listRoutes(schoolId)
  res.status(200).json({ routes })
}

export async function getRouteById(req: Request, res: Response): Promise<void> {
  const route = await transportService.getRouteById(req.params.id)
  await assertCanAccessSchool(req, route.schoolId)
  res.status(200).json({ route })
}

const createRouteSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  busId: z.string().optional(),
  description: z.string().optional(),
})

export async function createRoute(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createRouteSchema, req.body)
  const route = await transportService.createRoute(input)
  res.status(201).json({ route })
}

const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
  busId: z.string().nullable().optional(),
  description: z.string().optional(),
})

export async function updateRoute(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateRouteSchema, req.body)
  const route = await transportService.updateRoute(req.params.id, input)
  res.status(200).json({ route })
}

export async function deleteRoute(req: Request, res: Response): Promise<void> {
  await transportService.deleteRoute(req.params.id)
  res.status(204).send()
}

const createStopSchema = z.object({
  name: z.string().min(1),
  sequenceOrder: z.number().int().min(0),
  pickupTime: z.string().optional(),
})

export async function createStop(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createStopSchema, req.body)
  const stop = await transportService.createStop({ ...input, routeId: req.params.id })
  res.status(201).json({ stop })
}

const updateStopSchema = z.object({
  name: z.string().min(1).optional(),
  sequenceOrder: z.number().int().min(0).optional(),
  pickupTime: z.string().optional(),
})

export async function updateStop(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateStopSchema, req.body)
  const stop = await transportService.updateStop(req.params.id, input)
  res.status(200).json({ stop })
}

export async function deleteStop(req: Request, res: Response): Promise<void> {
  await transportService.deleteStop(req.params.id)
  res.status(204).send()
}

export async function listRouteStudents(req: Request, res: Response): Promise<void> {
  const students = await transportService.listRouteStudents(req.params.id)
  res.status(200).json({ students })
}

// ─── Student assignment ──────────────────────────────────────────────────

const assignStudentSchema = z.object({
  studentUserId: z.string().min(1),
  routeId: z.string().min(1),
  stopId: z.string().min(1),
})

export async function assignStudent(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(assignStudentSchema, req.body)
  const studentId = await resolveStudentId(input.studentUserId)
  const assignment = await transportService.assignStudent({
    studentId,
    routeId: input.routeId,
    stopId: input.stopId,
  })
  res.status(200).json({ assignment })
}

export async function removeStudentAssignment(req: Request, res: Response): Promise<void> {
  const studentId = await resolveStudentId(req.params.id)
  await transportService.removeStudentAssignment(studentId)
  res.status(204).send()
}

export async function getStudentTransport(req: Request, res: Response): Promise<void> {
  await assertCanViewStudentTransport(req, req.params.id)
  const studentId = await resolveStudentId(req.params.id)
  const assignment = await transportService.getStudentTransport(studentId)
  res.status(200).json({ assignment })
}
