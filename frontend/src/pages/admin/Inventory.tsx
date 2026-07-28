import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Plus, Sparkles, Trash2, Undo2, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Badge } from '../../components/common/Badge'
import { UserPicker } from '../../components/common/UserPicker'
import { useAuth } from '../../hooks/useAuth'
import { inventoryApi, type Asset, type AssetAssignment, type AssetCategory } from '../../services/inventoryApi'
import type { AdminUser } from '../../services/userApi'

const EMPTY_ASSET_FORM = { name: '', categoryId: '', serialNumber: '', quantity: '1', lowStockThreshold: '0' }

const STATUS_VARIANT: Record<Asset['status'], 'success' | 'info' | 'warning' | 'secondary'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  MAINTENANCE: 'warning',
  RETIRED: 'secondary',
}

export default function AdminInventory() {
  const { user, isDemoMode } = useAuth()
  const schoolId = user?.schoolId ?? ''

  const [assets, setAssets] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<AssetAssignment[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [lowStock, setLowStock] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET_FORM)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)

  const [assignTarget, setAssignTarget] = useState<Asset | null>(null)
  const [assignee, setAssignee] = useState<AdminUser | null>(null)
  const [assignQuantity, setAssignQuantity] = useState('1')

  const [maintenanceTarget, setMaintenanceTarget] = useState<Asset | null>(null)
  const [maintenanceDescription, setMaintenanceDescription] = useState('')

  const loadAll = () => {
    if (!schoolId) return
    setIsLoading(true)
    Promise.all([
      inventoryApi.listAssets(schoolId),
      inventoryApi.listAssignments(schoolId),
      inventoryApi.listCategories(schoolId),
      inventoryApi.listLowStock(schoolId),
    ])
      .then(([assetList, assignmentList, categoryList, lowStockList]) => {
        setAssets(assetList)
        setAssignments(assignmentList)
        setCategories(categoryList)
        setLowStock(lowStockList)
      })
      .catch(() => toast.error('Failed to load inventory.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (isDemoMode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, schoolId])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const category = await inventoryApi.createCategory(schoolId, newCategoryName.trim())
      setCategories((current) => [...current, category])
      setAssetForm((current) => ({ ...current, categoryId: category.id }))
      setNewCategoryName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add category.')
    }
  }

  const handleSaveAsset = async () => {
    if (!assetForm.name.trim()) {
      toast.error('Asset name is required.')
      return
    }
    setIsSaving(true)
    try {
      const asset = await inventoryApi.createAsset({
        schoolId,
        name: assetForm.name.trim(),
        categoryId: assetForm.categoryId || undefined,
        serialNumber: assetForm.serialNumber.trim() || undefined,
        quantity: Number(assetForm.quantity) || 1,
        lowStockThreshold: Number(assetForm.lowStockThreshold) || 0,
      })
      setAssets((current) => [...current, asset].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Asset added.')
      setIsAssetModalOpen(false)
      setAssetForm(EMPTY_ASSET_FORM)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add asset.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAsset = async () => {
    if (!deleteTarget) return
    try {
      await inventoryApi.deleteAsset(deleteTarget.id)
      setAssets((current) => current.filter((asset) => asset.id !== deleteTarget.id))
      toast.success('Asset deleted.')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete asset.')
    }
  }

  const handleAssign = async () => {
    if (!assignTarget || !assignee) {
      toast.error('Select who to assign this to.')
      return
    }
    setIsSaving(true)
    try {
      await inventoryApi.assignAsset(assignTarget.id, assignee.id, Number(assignQuantity) || 1)
      toast.success(`Assigned to ${assignee.name}.`)
      setAssignTarget(null)
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign asset.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReturn = async (assignment: AssetAssignment) => {
    try {
      await inventoryApi.returnAsset(assignment.id)
      toast.success('Asset returned.')
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to return asset.')
    }
  }

  const handleLogMaintenance = async () => {
    if (!maintenanceTarget || !maintenanceDescription.trim()) {
      toast.error('Describe the maintenance work.')
      return
    }
    setIsSaving(true)
    try {
      await inventoryApi.createMaintenance(maintenanceTarget.id, maintenanceDescription.trim())
      toast.success('Maintenance logged.')
      setMaintenanceTarget(null)
      setMaintenanceDescription('')
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log maintenance.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track school assets, assignments, and maintenance.</p>
        </div>
        {!isDemoMode && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsAssetModalOpen(true)}>
            Add Asset
          </Button>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — inventory management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          {lowStock.length > 0 && (
            <Card className="flex items-center gap-3 border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Low stock: {lowStock.map((asset) => asset.name).join(', ')}
              </p>
            </Card>
          )}

          <Card className="overflow-x-auto">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading assets…</p>
            ) : assets.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No assets yet. Add the first one.</p>
            ) : (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                    <th className="py-2 pr-4 font-medium">Asset</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Available</th>
                    <th className="py-2 pr-0 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                        {asset.serialNumber && <p className="text-xs text-gray-400">SN {asset.serialNumber}</p>}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{asset.category?.name ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[asset.status]}>{asset.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                        {asset.availableQuantity} / {asset.quantity}
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            disabled={asset.availableQuantity < 1}
                            onClick={() => {
                              setAssignTarget(asset)
                              setAssignee(null)
                              setAssignQuantity('1')
                            }}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaintenanceTarget(asset)}
                            aria-label={`Log maintenance for ${asset.name}`}
                            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(asset)}
                            aria-label={`Delete ${asset.name}`}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="Active Assignments" className="overflow-x-auto">
            {assignments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No active assignments.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                    <th className="py-2 pr-4 font-medium">Asset</th>
                    <th className="py-2 pr-4 font-medium">Assigned To</th>
                    <th className="py-2 pr-4 font-medium">Qty</th>
                    <th className="py-2 pr-0 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{assignment.asset.name}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                        {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{assignment.quantity}</td>
                      <td className="py-3 pr-0 text-right">
                        <button
                          type="button"
                          onClick={() => handleReturn(assignment)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        >
                          <Undo2 className="h-3.5 w-3.5" /> Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      <Modal isOpen={isAssetModalOpen} onClose={() => !isSaving && setIsAssetModalOpen(false)} title="Add Asset" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            value={assetForm.name}
            onChange={(event) => setAssetForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Projector"
          />
          <Input
            label="Serial Number"
            value={assetForm.serialNumber}
            onChange={(event) => setAssetForm((current) => ({ ...current, serialNumber: event.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={assetForm.categoryId}
              onChange={(event) => setAssetForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleAddCategory}>Add</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Quantity"
              type="number"
              min={1}
              value={assetForm.quantity}
              onChange={(event) => setAssetForm((current) => ({ ...current, quantity: event.target.value }))}
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              min={0}
              value={assetForm.lowStockThreshold}
              onChange={(event) => setAssetForm((current) => ({ ...current, lowStockThreshold: event.target.value }))}
              helperText="Alert when available quantity drops to this level."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsAssetModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveAsset} isLoading={isSaving}>
            Add Asset
          </Button>
        </div>
      </Modal>

      <Modal isOpen={assignTarget !== null} onClose={() => !isSaving && setAssignTarget(null)} title={`Assign "${assignTarget?.name}"`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
            <UserPicker schoolId={schoolId} selected={assignee} onSelect={setAssignee} />
          </div>
          <Input
            label="Quantity"
            type="number"
            min={1}
            max={assignTarget?.availableQuantity}
            value={assignQuantity}
            onChange={(event) => setAssignQuantity(event.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setAssignTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAssign} isLoading={isSaving}>
            Assign
          </Button>
        </div>
      </Modal>

      <Modal isOpen={maintenanceTarget !== null} onClose={() => !isSaving && setMaintenanceTarget(null)} title={`Log Maintenance — "${maintenanceTarget?.name}"`} size="sm">
        <Input
          label="Description"
          value={maintenanceDescription}
          onChange={(event) => setMaintenanceDescription(event.target.value)}
          placeholder="e.g. Bulb replacement"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setMaintenanceTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleLogMaintenance} isLoading={isSaving}>
            Log Maintenance
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Asset"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteAsset}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
