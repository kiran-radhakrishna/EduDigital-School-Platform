import { apiClient } from './apiClient'

export interface AssetCategory {
  id: string
  schoolId: string
  name: string
}

export interface Asset {
  id: string
  schoolId: string
  name: string
  categoryId?: string | null
  category?: AssetCategory | null
  serialNumber?: string | null
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED'
  quantity: number
  availableQuantity: number
  lowStockThreshold: number
  purchaseDate?: string | null
  purchaseCost?: number | null
}

export interface AssetAssignment {
  id: string
  assetId: string
  asset: Asset
  assignedToUserId: string
  assignedTo: { id: string; firstName: string; lastName: string; role: string }
  quantity: number
  assignedDate: string
  returnDate?: string | null
  condition?: string | null
  status: 'ASSIGNED' | 'RETURNED'
}

export interface AssetMaintenance {
  id: string
  assetId: string
  description: string
  cost?: number | null
  startDate: string
  endDate?: string | null
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
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

export interface UpdateAssetInput {
  name?: string
  categoryId?: string | null
  serialNumber?: string
  quantity?: number
  lowStockThreshold?: number
  status?: Asset['status']
  purchaseDate?: string
  purchaseCost?: number
}

export const inventoryApi = {
  async listCategories(schoolId: string): Promise<AssetCategory[]> {
    const { data } = await apiClient.get<{ categories: AssetCategory[] }>('/inventory/categories', { params: { schoolId } })
    return data.categories
  },
  async createCategory(schoolId: string, name: string): Promise<AssetCategory> {
    const { data } = await apiClient.post<{ category: AssetCategory }>('/inventory/categories', { schoolId, name })
    return data.category
  },
  async listAssets(schoolId: string, categoryId?: string): Promise<Asset[]> {
    const { data } = await apiClient.get<{ assets: Asset[] }>('/inventory/assets', { params: { schoolId, categoryId } })
    return data.assets
  },
  async createAsset(input: CreateAssetInput): Promise<Asset> {
    const { data } = await apiClient.post<{ asset: Asset }>('/inventory/assets', input)
    return data.asset
  },
  async updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
    const { data } = await apiClient.patch<{ asset: Asset }>(`/inventory/assets/${id}`, input)
    return data.asset
  },
  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/inventory/assets/${id}`)
  },
  async listLowStock(schoolId: string): Promise<Asset[]> {
    const { data } = await apiClient.get<{ assets: Asset[] }>('/inventory/assets/low-stock', { params: { schoolId } })
    return data.assets
  },
  async getAssetHistory(id: string): Promise<{ assignments: AssetAssignment[]; maintenance: AssetMaintenance[] }> {
    const { data } = await apiClient.get<{ assignments: AssetAssignment[]; maintenance: AssetMaintenance[] }>(
      `/inventory/assets/${id}/history`,
    )
    return data
  },
  async listAssignments(schoolId: string): Promise<AssetAssignment[]> {
    const { data } = await apiClient.get<{ assignments: AssetAssignment[] }>('/inventory/assignments', { params: { schoolId } })
    return data.assignments
  },
  async assignAsset(assetId: string, assignedToUserId: string, quantity?: number, condition?: string): Promise<AssetAssignment> {
    const { data } = await apiClient.post<{ assignment: AssetAssignment }>('/inventory/assignments', {
      assetId,
      assignedToUserId,
      quantity,
      condition,
    })
    return data.assignment
  },
  async returnAsset(assignmentId: string): Promise<AssetAssignment> {
    const { data } = await apiClient.post<{ assignment: AssetAssignment }>(`/inventory/assignments/${assignmentId}/return`)
    return data.assignment
  },
  async createMaintenance(assetId: string, description: string, cost?: number): Promise<AssetMaintenance> {
    const { data } = await apiClient.post<{ maintenance: AssetMaintenance }>('/inventory/maintenance', {
      assetId,
      description,
      cost,
    })
    return data.maintenance
  },
  async updateMaintenanceStatus(id: string, status: AssetMaintenance['status']): Promise<AssetMaintenance> {
    const { data } = await apiClient.patch<{ maintenance: AssetMaintenance }>(`/inventory/maintenance/${id}`, { status })
    return data.maintenance
  },
}
