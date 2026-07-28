import { apiClient } from './apiClient'

export interface Driver {
  id: string
  schoolId: string
  name: string
  phone?: string | null
  licenseNumber?: string | null
}

export interface Bus {
  id: string
  schoolId: string
  plateNumber: string
  capacity: number
  model?: string | null
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  driverId?: string | null
  driver?: Driver | null
}

export interface Stop {
  id: string
  routeId: string
  name: string
  sequenceOrder: number
  pickupTime?: string | null
}

export interface TransportRoute {
  id: string
  schoolId: string
  name: string
  description?: string | null
  busId?: string | null
  bus?: Bus | null
  stops: Stop[]
}

export interface StudentTransportAssignment {
  id: string
  studentId: string
  routeId: string
  route: TransportRoute
  stopId: string
  stop: Stop
}

export const transportApi = {
  async listBuses(schoolId: string): Promise<Bus[]> {
    const { data } = await apiClient.get<{ buses: Bus[] }>('/transport/buses', { params: { schoolId } })
    return data.buses
  },
  async createBus(schoolId: string, plateNumber: string, capacity: number, model?: string, driverId?: string): Promise<Bus> {
    const { data } = await apiClient.post<{ bus: Bus }>('/transport/buses', { schoolId, plateNumber, capacity, model, driverId })
    return data.bus
  },
  async updateBus(id: string, input: Partial<Pick<Bus, 'plateNumber' | 'capacity' | 'model' | 'driverId' | 'status'>>): Promise<Bus> {
    const { data } = await apiClient.patch<{ bus: Bus }>(`/transport/buses/${id}`, input)
    return data.bus
  },
  async deleteBus(id: string): Promise<void> {
    await apiClient.delete(`/transport/buses/${id}`)
  },
  async listDrivers(schoolId: string): Promise<Driver[]> {
    const { data } = await apiClient.get<{ drivers: Driver[] }>('/transport/drivers', { params: { schoolId } })
    return data.drivers
  },
  async createDriver(schoolId: string, name: string, phone?: string, licenseNumber?: string): Promise<Driver> {
    const { data } = await apiClient.post<{ driver: Driver }>('/transport/drivers', { schoolId, name, phone, licenseNumber })
    return data.driver
  },
  async listRoutes(schoolId: string): Promise<TransportRoute[]> {
    const { data } = await apiClient.get<{ routes: TransportRoute[] }>('/transport/routes', { params: { schoolId } })
    return data.routes
  },
  async createRoute(schoolId: string, name: string, busId?: string, description?: string): Promise<TransportRoute> {
    const { data } = await apiClient.post<{ route: TransportRoute }>('/transport/routes', { schoolId, name, busId, description })
    return data.route
  },
  async deleteRoute(id: string): Promise<void> {
    await apiClient.delete(`/transport/routes/${id}`)
  },
  async createStop(routeId: string, name: string, sequenceOrder: number, pickupTime?: string): Promise<Stop> {
    const { data } = await apiClient.post<{ stop: Stop }>(`/transport/routes/${routeId}/stops`, {
      name,
      sequenceOrder,
      pickupTime,
    })
    return data.stop
  },
  async listRouteStudents(routeId: string) {
    const { data } = await apiClient.get<{ students: unknown[] }>(`/transport/routes/${routeId}/students`)
    return data.students
  },
  async assignStudent(studentUserId: string, routeId: string, stopId: string): Promise<StudentTransportAssignment> {
    const { data } = await apiClient.post<{ assignment: StudentTransportAssignment }>('/transport/assignments', {
      studentUserId,
      routeId,
      stopId,
    })
    return data.assignment
  },
  async removeStudentAssignment(studentUserId: string): Promise<void> {
    await apiClient.delete(`/transport/students/${studentUserId}/assignment`)
  },
  async getStudentTransport(studentUserId: string): Promise<StudentTransportAssignment | null> {
    const { data } = await apiClient.get<{ assignment: StudentTransportAssignment | null }>(
      `/transport/students/${studentUserId}`,
    )
    return data.assignment
  },
}
