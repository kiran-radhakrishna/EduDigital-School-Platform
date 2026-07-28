import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bus as BusIcon, Plus, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { Badge } from '../../components/common/Badge'
import { UserPicker } from '../../components/common/UserPicker'
import { useAuth } from '../../hooks/useAuth'
import { transportApi, type Bus, type Driver, type TransportRoute } from '../../services/transportApi'
import type { AdminUser } from '../../services/userApi'

type Tab = 'buses' | 'routes'

export default function AdminTransport() {
  const { user, isDemoMode } = useAuth()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<Tab>('buses')

  const [buses, setBuses] = useState<Bus[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isBusModalOpen, setIsBusModalOpen] = useState(false)
  const [busForm, setBusForm] = useState({ plateNumber: '', capacity: '40', model: '', driverId: '' })
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' })
  const [isSaving, setIsSaving] = useState(false)

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [routeForm, setRouteForm] = useState({ name: '', busId: '', description: '' })

  const [stopTarget, setStopTarget] = useState<TransportRoute | null>(null)
  const [stopForm, setStopForm] = useState({ name: '', pickupTime: '' })

  const [assignTarget, setAssignTarget] = useState<TransportRoute | null>(null)
  const [assignStudent, setAssignStudent] = useState<AdminUser | null>(null)
  const [assignStopId, setAssignStopId] = useState('')

  const loadAll = () => {
    if (!schoolId) return
    setIsLoading(true)
    Promise.all([transportApi.listBuses(schoolId), transportApi.listDrivers(schoolId), transportApi.listRoutes(schoolId)])
      .then(([busList, driverList, routeList]) => {
        setBuses(busList)
        setDrivers(driverList)
        setRoutes(routeList)
      })
      .catch(() => toast.error('Failed to load transport data.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (isDemoMode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, schoolId])

  const handleAddDriver = async () => {
    if (!newDriver.name.trim()) return
    try {
      const driver = await transportApi.createDriver(schoolId, newDriver.name.trim(), newDriver.phone.trim() || undefined)
      setDrivers((current) => [...current, driver])
      setBusForm((current) => ({ ...current, driverId: driver.id }))
      setNewDriver({ name: '', phone: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add driver.')
    }
  }

  const handleSaveBus = async () => {
    if (!busForm.plateNumber.trim() || !busForm.capacity) {
      toast.error('Plate number and capacity are required.')
      return
    }
    setIsSaving(true)
    try {
      const bus = await transportApi.createBus(
        schoolId,
        busForm.plateNumber.trim(),
        Number(busForm.capacity),
        busForm.model.trim() || undefined,
        busForm.driverId || undefined,
      )
      setBuses((current) => [...current, bus])
      toast.success('Bus added.')
      setIsBusModalOpen(false)
      setBusForm({ plateNumber: '', capacity: '40', model: '', driverId: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add bus.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBus = async (bus: Bus) => {
    try {
      await transportApi.deleteBus(bus.id)
      setBuses((current) => current.filter((item) => item.id !== bus.id))
      toast.success('Bus removed.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove bus.')
    }
  }

  const handleSaveRoute = async () => {
    if (!routeForm.name.trim()) {
      toast.error('Route name is required.')
      return
    }
    setIsSaving(true)
    try {
      const route = await transportApi.createRoute(schoolId, routeForm.name.trim(), routeForm.busId || undefined, routeForm.description.trim() || undefined)
      setRoutes((current) => [...current, route])
      toast.success('Route created.')
      setIsRouteModalOpen(false)
      setRouteForm({ name: '', busId: '', description: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create route.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRoute = async (route: TransportRoute) => {
    try {
      await transportApi.deleteRoute(route.id)
      setRoutes((current) => current.filter((item) => item.id !== route.id))
      toast.success('Route removed.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove route.')
    }
  }

  const handleAddStop = async () => {
    if (!stopTarget || !stopForm.name.trim()) {
      toast.error('Stop name is required.')
      return
    }
    setIsSaving(true)
    try {
      const stop = await transportApi.createStop(
        stopTarget.id,
        stopForm.name.trim(),
        stopTarget.stops.length,
        stopForm.pickupTime.trim() || undefined,
      )
      setRoutes((current) =>
        current.map((route) => (route.id === stopTarget.id ? { ...route, stops: [...route.stops, stop] } : route)),
      )
      setStopForm({ name: '', pickupTime: '' })
      toast.success('Stop added.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add stop.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssignStudent = async () => {
    if (!assignTarget || !assignStudent || !assignStopId) {
      toast.error('Select a student and stop.')
      return
    }
    setIsSaving(true)
    try {
      await transportApi.assignStudent(assignStudent.id, assignTarget.id, assignStopId)
      toast.success(`${assignStudent.name} assigned to ${assignTarget.name}.`)
      setAssignTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign student.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage buses, drivers, routes, stops, and student assignments.</p>
        </div>
        {!isDemoMode && (
          <div className="flex gap-2">
            {tab === 'buses' && (
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsBusModalOpen(true)}>
                Add Bus
              </Button>
            )}
            {tab === 'routes' && (
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsRouteModalOpen(true)}>
                Add Route
              </Button>
            )}
          </div>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — transport management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            {(['buses', 'routes'] as Tab[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {value === 'buses' ? 'Buses & Drivers' : 'Routes & Stops'}
              </button>
            ))}
          </div>

          {tab === 'buses' && (
            <Card className="overflow-x-auto">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading buses…</p>
              ) : buses.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No buses yet.</p>
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Plate</th>
                      <th className="py-2 pr-4 font-medium">Capacity</th>
                      <th className="py-2 pr-4 font-medium">Driver</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((bus) => (
                      <tr key={bus.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{bus.plateNumber}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.capacity}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.driver?.name ?? '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={bus.status === 'ACTIVE' ? 'success' : 'secondary'}>{bus.status}</Badge>
                        </td>
                        <td className="py-3 pr-0 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBus(bus)}
                            aria-label={`Remove bus ${bus.plateNumber}`}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'routes' && (
            <div className="space-y-4">
              {routes.length === 0 ? (
                <Card>
                  <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No routes yet.</p>
                </Card>
              ) : (
                routes.map((route) => (
                  <Card key={route.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BusIcon className="h-4 w-4 text-indigo-500" />
                        <p className="font-semibold text-gray-900 dark:text-white">{route.name}</p>
                        {route.bus && <Badge variant="secondary">{route.bus.plateNumber}</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignTarget(route)
                            setAssignStudent(null)
                            setAssignStopId(route.stops[0]?.id ?? '')
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                        >
                          Assign Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setStopTarget(route)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Add Stop
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoute(route)}
                          aria-label={`Remove route ${route.name}`}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {route.stops.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {route.stops.map((stop) => (
                          <span key={stop.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {stop.name}{stop.pickupTime ? ` · ${stop.pickupTime}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      <Modal isOpen={isBusModalOpen} onClose={() => !isSaving && setIsBusModalOpen(false)} title="Add Bus" size="sm">
        <div className="space-y-4">
          <Input label="Plate Number" value={busForm.plateNumber} onChange={(event) => setBusForm((current) => ({ ...current, plateNumber: event.target.value }))} />
          <Input label="Capacity" type="number" value={busForm.capacity} onChange={(event) => setBusForm((current) => ({ ...current, capacity: event.target.value }))} />
          <Input label="Model" value={busForm.model} onChange={(event) => setBusForm((current) => ({ ...current, model: event.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Driver</label>
            <select
              value={busForm.driverId}
              onChange={(event) => setBusForm((current) => ({ ...current, driverId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <Input placeholder="New driver name" value={newDriver.name} onChange={(event) => setNewDriver((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Phone" value={newDriver.phone} onChange={(event) => setNewDriver((current) => ({ ...current, phone: event.target.value }))} />
              <Button variant="outline" size="sm" onClick={handleAddDriver}>Add</Button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsBusModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveBus} isLoading={isSaving}>
            Add Bus
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isRouteModalOpen} onClose={() => !isSaving && setIsRouteModalOpen(false)} title="Add Route" size="sm">
        <div className="space-y-4">
          <Input label="Route Name" value={routeForm.name} onChange={(event) => setRouteForm((current) => ({ ...current, name: event.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Bus</label>
            <select
              value={routeForm.busId}
              onChange={(event) => setRouteForm((current) => ({ ...current, busId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>{bus.plateNumber}</option>
              ))}
            </select>
          </div>
          <Input label="Description" value={routeForm.description} onChange={(event) => setRouteForm((current) => ({ ...current, description: event.target.value }))} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsRouteModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveRoute} isLoading={isSaving}>
            Add Route
          </Button>
        </div>
      </Modal>

      <Modal isOpen={stopTarget !== null} onClose={() => !isSaving && setStopTarget(null)} title={`Add Stop — ${stopTarget?.name}`} size="sm">
        <div className="space-y-4">
          <Input label="Stop Name" value={stopForm.name} onChange={(event) => setStopForm((current) => ({ ...current, name: event.target.value }))} />
          <Input label="Pickup Time" placeholder="e.g. 07:30" value={stopForm.pickupTime} onChange={(event) => setStopForm((current) => ({ ...current, pickupTime: event.target.value }))} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setStopTarget(null)} disabled={isSaving}>
            Done
          </Button>
          <Button size="sm" onClick={handleAddStop} isLoading={isSaving}>
            Add Stop
          </Button>
        </div>
      </Modal>

      <Modal isOpen={assignTarget !== null} onClose={() => !isSaving && setAssignTarget(null)} title={`Assign Student — ${assignTarget?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
            <UserPicker schoolId={schoolId} roles={['STUDENT']} selected={assignStudent} onSelect={setAssignStudent} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Stop</label>
            <select
              value={assignStopId}
              onChange={(event) => setAssignStopId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select…</option>
              {assignTarget?.stops.map((stop) => (
                <option key={stop.id} value={stop.id}>{stop.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setAssignTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAssignStudent} isLoading={isSaving}>
            Assign
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
