import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import * as inventoryService from '../services/inventory.service'

export async function listCategories(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const categories = await inventoryService.listCategories(schoolId)
  res.status(200).json({ categories })
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(z.object({ schoolId: z.string().min(1), name: z.string().min(1) }), req.body)
  const category = await inventoryService.createCategory(input.schoolId, input.name)
  res.status(201).json({ category })
}

export async function listAssets(req: Request, res: Response): Promise<void> {
  const { schoolId, categoryId } = parseOrThrow(
    z.object({ schoolId: z.string().min(1), categoryId: z.string().optional() }),
    req.query,
  )
  const assets = await inventoryService.listAssets(schoolId, categoryId)
  res.status(200).json({ assets })
}

export async function getAssetById(req: Request, res: Response): Promise<void> {
  const asset = await inventoryService.getAssetById(req.params.id)
  res.status(200).json({ asset })
}

const createAssetSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().optional(),
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().min(0).optional(),
})

export async function createAsset(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createAssetSchema, req.body)
  const asset = await inventoryService.createAsset(input)
  res.status(201).json({ asset })
}

const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']).optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().min(0).optional(),
})

export async function updateAsset(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateAssetSchema, req.body)
  const asset = await inventoryService.updateAsset(req.params.id, input)
  res.status(200).json({ asset })
}

export async function deleteAsset(req: Request, res: Response): Promise<void> {
  await inventoryService.deleteAsset(req.params.id)
  res.status(204).send()
}

const assignAssetSchema = z.object({
  assetId: z.string().min(1),
  assignedToUserId: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
  condition: z.string().optional(),
})

export async function assignAsset(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(assignAssetSchema, req.body)
  const assignment = await inventoryService.assignAsset(input)
  res.status(201).json({ assignment })
}

export async function returnAsset(req: Request, res: Response): Promise<void> {
  const assignment = await inventoryService.returnAsset(req.params.id)
  res.status(200).json({ assignment })
}

export async function listAssignments(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const assignments = await inventoryService.listAssignments(schoolId)
  res.status(200).json({ assignments })
}

const createMaintenanceSchema = z.object({
  assetId: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().min(0).optional(),
  startDate: z.string().optional(),
})

export async function createMaintenance(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createMaintenanceSchema, req.body)
  const record = await inventoryService.createMaintenance(input)
  res.status(201).json({ maintenance: record })
}

const updateMaintenanceSchema = z.object({ status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']) })

export async function updateMaintenanceStatus(req: Request, res: Response): Promise<void> {
  const { status } = parseOrThrow(updateMaintenanceSchema, req.body)
  const record = await inventoryService.updateMaintenanceStatus(req.params.id, status)
  res.status(200).json({ maintenance: record })
}

export async function getAssetHistory(req: Request, res: Response): Promise<void> {
  const history = await inventoryService.getAssetHistory(req.params.id)
  res.status(200).json(history)
}

export async function listLowStock(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const assets = await inventoryService.listLowStock(schoolId)
  res.status(200).json({ assets })
}
