import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import * as schoolService from '../services/school.service'
import * as analyticsService from '../services/analytics.service'

export async function list(_req: Request, res: Response): Promise<void> {
  const schools = await schoolService.listSchools()
  res.status(200).json({ schools })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const school = await schoolService.getSchoolById(req.params.id)
  res.status(200).json({ school })
}

const createSchema = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
  country: z.string().optional(),
})

export async function create(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSchema, req.body)
  const school = await schoolService.createSchool(input)
  res.status(201).json({ school })
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

export async function update(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateSchema, req.body)
  const school = await schoolService.updateSchool(req.params.id, input)
  res.status(200).json({ school })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await schoolService.deleteSchool(req.params.id)
  res.status(204).send()
}

export async function listAcademicYears(req: Request, res: Response): Promise<void> {
  const academicYears = await schoolService.listAcademicYears(req.params.id)
  res.status(200).json({ academicYears })
}

const createAcademicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().optional(),
})

export async function createAcademicYear(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createAcademicYearSchema, req.body)
  const academicYear = await schoolService.createAcademicYear(req.params.id, input)
  res.status(201).json({ academicYear })
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const analytics = await analyticsService.getSchoolAnalytics(req.params.id)
  res.status(200).json({ analytics })
}
