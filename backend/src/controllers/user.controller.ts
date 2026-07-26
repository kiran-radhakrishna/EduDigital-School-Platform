import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import * as userService from '../services/user.service'

const ROLE_VALUES = ['STUDENT', 'TEACHER', 'PARENT', 'AUTHORITY', 'ADMINISTRATOR'] as const

const listQuerySchema = z.object({
  role: z.enum(ROLE_VALUES).optional(),
  schoolId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export async function list(req: Request, res: Response): Promise<void> {
  const query = parseOrThrow(listQuerySchema, req.query)
  const result = await userService.listUsers(query)
  res.status(200).json(result)
}

export async function getById(req: Request, res: Response): Promise<void> {
  const isSelf = req.userId === req.params.id
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  if (!isSelf && !isPrivileged) {
    throw new ForbiddenError()
  }

  const user = await userService.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ error: 'User not found.' })
    return
  }
  res.status(200).json({ user })
}

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLE_VALUES),
  schoolId: z.string().optional(),
  grade: z.string().optional(),
  rollNumber: z.number().int().nonnegative().optional(),
  dateOfBirth: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
})

export async function create(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSchema, req.body)
  const user = await userService.createUser(input)
  res.status(201).json({ user })
}

const selfUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
})

const adminUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  schoolId: z.string().nullable().optional(),
  grade: z.string().optional(),
  rollNumber: z.number().int().nonnegative().optional(),
  dateOfBirth: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
})

export async function update(req: Request, res: Response): Promise<void> {
  const isSelf = req.userId === req.params.id
  const isAdmin = req.userRole === 'ADMINISTRATOR'
  if (!isSelf && !isAdmin) {
    throw new ForbiddenError()
  }

  const input = isAdmin ? parseOrThrow(adminUpdateSchema, req.body) : parseOrThrow(selfUpdateSchema, req.body)
  const user = await userService.updateUser(req.params.id, input)
  res.status(200).json({ user })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await userService.deleteUser(req.params.id)
  res.status(204).send()
}
