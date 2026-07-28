import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bus as BusIcon, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { useAuth } from '../../hooks/useAuth'
import { transportApi, type StudentTransportAssignment } from '../../services/transportApi'
import { parentApi, type ParentChild } from '../../services/parentApi'

function TransportCard({ assignment }: { assignment: StudentTransportAssignment | null }) {
  if (!assignment) {
    return (
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mb-4 flex items-center gap-2">
          <BusIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transport</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No transport assignment yet.</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mb-4 flex items-center gap-2">
        <BusIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transport — {assignment.route.name}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
          <MapPin className="h-5 w-5 text-indigo-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pickup Stop</p>
            <p className="font-medium text-gray-900 dark:text-white">{assignment.stop.name}</p>
            {assignment.stop.pickupTime && <p className="text-xs text-gray-400">{assignment.stop.pickupTime}</p>}
          </div>
        </div>
        {assignment.route.bus && (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <BusIcon className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bus</p>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.route.bus.plateNumber}</p>
              </div>
            </div>
            {assignment.route.bus.driver && (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <User className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
                  <p className="font-medium text-gray-900 dark:text-white">{assignment.route.bus.driver.name}</p>
                  {assignment.route.bus.driver.phone && <p className="text-xs text-gray-400">{assignment.route.bus.driver.phone}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

function StudentTransportView({ studentUserId }: { studentUserId: string }) {
  const [assignment, setAssignment] = useState<StudentTransportAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    transportApi
      .getStudentTransport(studentUserId)
      .then((result) => {
        if (!cancelled) setAssignment(result)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load transport.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading transport…</p>
      </Card>
    )
  }

  return <TransportCard assignment={assignment} />
}

function ParentTransportView({ parentUserId }: { parentUserId: string }) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)

  useEffect(() => {
    let cancelled = false
    parentApi
      .getChildren(parentUserId)
      .then((list) => {
        if (cancelled) return
        setChildren(list)
        if (list.length > 0) setSelectedChildId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load children.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChildren(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUserId])

  if (isLoadingChildren) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </Card>
    )
  }

  if (children.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">No children linked to your account yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {children.length > 1 && (
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing transport for</label>
          <select
            value={selectedChildId}
            onChange={(event) => setSelectedChildId(event.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </Card>
      )}
      {selectedChildId && <StudentTransportView studentUserId={selectedChildId} />}
    </div>
  )
}

const DEMO_ASSIGNMENT: StudentTransportAssignment = {
  id: 'demo-assignment',
  studentId: 'demo-student',
  routeId: 'demo-route',
  route: {
    id: 'demo-route',
    schoolId: 'demo-school',
    name: 'Route A — North Campus',
    description: null,
    busId: 'demo-bus',
    bus: {
      id: 'demo-bus',
      schoolId: 'demo-school',
      plateNumber: 'SCH-042',
      capacity: 40,
      model: 'Mercedes Sprinter',
      status: 'ACTIVE',
      driverId: 'demo-driver',
      driver: { id: 'demo-driver', schoolId: 'demo-school', name: 'Hans Weber', phone: '+49 151 000000' },
    },
    stops: [],
  },
  stopId: 'demo-stop',
  stop: { id: 'demo-stop', routeId: 'demo-route', name: 'Maple Street', sequenceOrder: 1, pickupTime: '07:30' },
}

export default function Transport() {
  const { user, isDemoMode } = useAuth()

  const demoView = useMemo(() => <TransportCard assignment={DEMO_ASSIGNMENT} />, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user
        ? demoView
        : user.role === 'parent'
          ? <ParentTransportView parentUserId={user.id} />
          : <StudentTransportView studentUserId={user.id} />}
    </motion.div>
  )
}
