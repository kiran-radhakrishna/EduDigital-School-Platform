import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import * as parentService from '../services/parent.service'

function assertSelfOrPrivileged(req: Request): void {
  const isSelf = req.userId === req.params.id
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  if (!isSelf && !isPrivileged) {
    throw new ForbiddenError('You do not have permission to view this family.')
  }
}

export async function getChildren(req: Request, res: Response): Promise<void> {
  assertSelfOrPrivileged(req)
  const children = await parentService.getChildren(req.params.id)
  res.status(200).json({ children })
}

const linkChildSchema = z.object({ studentUserId: z.string().min(1) })

export async function addChild(req: Request, res: Response): Promise<void> {
  const { studentUserId } = parseOrThrow(linkChildSchema, req.body)
  const children = await parentService.addChild(req.params.id, studentUserId)
  res.status(201).json({ children })
}

export async function removeChild(req: Request, res: Response): Promise<void> {
  const children = await parentService.removeChild(req.params.id, req.params.studentUserId)
  res.status(200).json({ children })
}
