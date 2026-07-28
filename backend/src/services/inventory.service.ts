import { prisma } from '../config/prisma'
import { ConflictError, NotFoundError, AppError } from '../utils/errors'

export async function listCategories(schoolId: string) {
  return prisma.assetCategory.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export async function createCategory(schoolId: string, name: string) {
  const existing = await prisma.assetCategory.findFirst({ where: { schoolId, name } })
  if (existing) throw new ConflictError('An asset category with this name already exists.')
  return prisma.assetCategory.create({ data: { schoolId, name: name.trim() } })
}

const assetInclude = { category: true } as const

export async function listAssets(schoolId: string, categoryId?: string) {
  return prisma.asset.findMany({
    where: { schoolId, categoryId },
    include: assetInclude,
    orderBy: { name: 'asc' },
  })
}

export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({ where: { id }, include: assetInclude })
  if (!asset) throw new NotFoundError('Asset not found.')
  return asset
}

export interface CreateAssetInput {
  schoolId: string
  name: string
  categoryId?: string
  serialNumber?: string
  quantity?: number
  lowStockThreshold?: number
  purchaseDate?: string
  purchaseCost?: number
}

export async function createAsset(input: CreateAssetInput) {
  const quantity = input.quantity ?? 1
  return prisma.asset.create({
    data: {
      schoolId: input.schoolId,
      name: input.name.trim(),
      categoryId: input.categoryId,
      serialNumber: input.serialNumber,
      quantity,
      availableQuantity: quantity,
      lowStockThreshold: input.lowStockThreshold ?? 0,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
      purchaseCost: input.purchaseCost,
    },
    include: assetInclude,
  })
}

export interface UpdateAssetInput {
  name?: string
  categoryId?: string | null
  serialNumber?: string
  quantity?: number
  lowStockThreshold?: number
  status?: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED'
  purchaseDate?: string
  purchaseCost?: number
}

export async function updateAsset(id: string, input: UpdateAssetInput) {
  const existing = await getAssetById(id)

  let availableQuantity = existing.availableQuantity
  if (input.quantity !== undefined) {
    const inUse = existing.quantity - existing.availableQuantity
    if (input.quantity < inUse) {
      throw new AppError(`Cannot set quantity below the ${inUse} unit(s) currently assigned or in maintenance.`)
    }
    availableQuantity = input.quantity - inUse
  }

  return prisma.asset.update({
    where: { id },
    data: {
      ...input,
      availableQuantity,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
    },
    include: assetInclude,
  })
}

export async function deleteAsset(id: string) {
  const activeAssignment = await prisma.assetAssignment.findFirst({ where: { assetId: id, status: 'ASSIGNED' } })
  if (activeAssignment) throw new ConflictError('Cannot delete an asset with active assignments.')
  await prisma.asset.delete({ where: { id } })
}

async function syncAssetStatus(assetId: string) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!asset || asset.status === 'MAINTENANCE' || asset.status === 'RETIRED') return
  await prisma.asset.update({
    where: { id: assetId },
    data: { status: asset.availableQuantity <= 0 ? 'ASSIGNED' : 'AVAILABLE' },
  })
}

const assignmentInclude = {
  asset: true,
  assignedTo: { select: { id: true, firstName: true, lastName: true, role: true } },
} as const

export interface AssignAssetInput {
  assetId: string
  assignedToUserId: string
  quantity?: number
  condition?: string
}

export async function assignAsset(input: AssignAssetInput) {
  const quantity = input.quantity ?? 1
  const asset = await getAssetById(input.assetId)
  if (asset.availableQuantity < quantity) {
    throw new ConflictError('Not enough units available to assign.')
  }

  const assignment = await prisma.$transaction(async (tx) => {
    await tx.asset.update({ where: { id: input.assetId }, data: { availableQuantity: { decrement: quantity } } })
    return tx.assetAssignment.create({
      data: {
        assetId: input.assetId,
        assignedToUserId: input.assignedToUserId,
        quantity,
        condition: input.condition,
      },
      include: assignmentInclude,
    })
  })

  await syncAssetStatus(input.assetId)
  return assignment
}

export async function returnAsset(assignmentId: string) {
  const assignment = await prisma.assetAssignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) throw new NotFoundError('Asset assignment not found.')
  if (assignment.status === 'RETURNED') throw new ConflictError('This asset has already been returned.')

  const updated = await prisma.$transaction(async (tx) => {
    await tx.asset.update({
      where: { id: assignment.assetId },
      data: { availableQuantity: { increment: assignment.quantity } },
    })
    return tx.assetAssignment.update({
      where: { id: assignmentId },
      data: { status: 'RETURNED', returnDate: new Date() },
      include: assignmentInclude,
    })
  })

  await syncAssetStatus(assignment.assetId)
  return updated
}

export async function listAssignments(schoolId: string) {
  return prisma.assetAssignment.findMany({
    where: { asset: { schoolId }, status: 'ASSIGNED' },
    include: assignmentInclude,
    orderBy: { assignedDate: 'desc' },
  })
}

export interface CreateMaintenanceInput {
  assetId: string
  description: string
  cost?: number
  startDate?: string
}

export async function createMaintenance(input: CreateMaintenanceInput) {
  await getAssetById(input.assetId)
  const record = await prisma.assetMaintenance.create({
    data: {
      assetId: input.assetId,
      description: input.description.trim(),
      cost: input.cost,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
    },
  })
  await prisma.asset.update({ where: { id: input.assetId }, data: { status: 'MAINTENANCE' } })
  return record
}

export async function updateMaintenanceStatus(id: string, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED') {
  const record = await prisma.assetMaintenance.findUnique({ where: { id } })
  if (!record) throw new NotFoundError('Maintenance record not found.')

  const updated = await prisma.assetMaintenance.update({
    where: { id },
    data: { status, endDate: status === 'COMPLETED' ? new Date() : undefined },
  })

  if (status === 'COMPLETED') {
    await syncAssetStatus(record.assetId)
  }
  return updated
}

export async function getAssetHistory(assetId: string) {
  const [assignments, maintenance] = await Promise.all([
    prisma.assetAssignment.findMany({
      where: { assetId },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { assignedDate: 'desc' },
    }),
    prisma.assetMaintenance.findMany({ where: { assetId }, orderBy: { startDate: 'desc' } }),
  ])
  return { assignments, maintenance }
}

export async function listLowStock(schoolId: string) {
  const assets = await prisma.asset.findMany({ where: { schoolId }, include: assetInclude })
  return assets.filter((asset) => asset.availableQuantity <= asset.lowStockThreshold)
}
