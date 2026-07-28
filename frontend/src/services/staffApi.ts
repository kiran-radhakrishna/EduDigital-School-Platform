import { apiClient } from './apiClient'

export interface Department {
  id: string
  schoolId: string
  name: string
}

export interface Designation {
  id: string
  schoolId: string
  title: string
}

export interface StaffMember {
  id: string
  userId: string
  schoolId: string
  departmentId?: string | null
  department?: Department | null
  designationId?: string | null
  designation?: Designation | null
  employeeCode?: string | null
  hireDate: string
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED'
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  user: { id: string; firstName: string; lastName: string; email: string; role: string }
}

export interface LeaveRequest {
  id: string
  staffId: string
  staff?: StaffMember
  leaveType: string
  startDate: string
  endDate: string
  reason?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedByUserId?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export interface LeaveBalance {
  id: string
  staffId: string
  leaveType: string
  year: number
  totalDays: number
  usedDays: number
}

export interface CreateStaffInput {
  userId: string
  schoolId: string
  departmentId?: string
  designationId?: string
  employeeCode?: string
  hireDate: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface UpdateStaffInput {
  departmentId?: string | null
  designationId?: string | null
  employeeCode?: string
  status?: StaffMember['status']
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export const staffApi = {
  async listDepartments(schoolId: string): Promise<Department[]> {
    const { data } = await apiClient.get<{ departments: Department[] }>('/staff/departments', { params: { schoolId } })
    return data.departments
  },
  async createDepartment(schoolId: string, name: string): Promise<Department> {
    const { data } = await apiClient.post<{ department: Department }>('/staff/departments', { schoolId, name })
    return data.department
  },
  async listDesignations(schoolId: string): Promise<Designation[]> {
    const { data } = await apiClient.get<{ designations: Designation[] }>('/staff/designations', { params: { schoolId } })
    return data.designations
  },
  async createDesignation(schoolId: string, title: string): Promise<Designation> {
    const { data } = await apiClient.post<{ designation: Designation }>('/staff/designations', { schoolId, title })
    return data.designation
  },
  async listStaff(schoolId: string, departmentId?: string): Promise<StaffMember[]> {
    const { data } = await apiClient.get<{ staff: StaffMember[] }>('/staff', { params: { schoolId, departmentId } })
    return data.staff
  },
  async getMyStaffProfile(): Promise<StaffMember | null> {
    try {
      const { data } = await apiClient.get<{ staff: StaffMember }>('/staff/me')
      return data.staff
    } catch {
      return null
    }
  },
  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    const { data } = await apiClient.post<{ staff: StaffMember }>('/staff', input)
    return data.staff
  },
  async updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const { data } = await apiClient.patch<{ staff: StaffMember }>(`/staff/${id}`, input)
    return data.staff
  },
  async deleteStaff(id: string): Promise<void> {
    await apiClient.delete(`/staff/${id}`)
  },
  async createLeaveRequest(staffId: string, leaveType: string, startDate: string, endDate: string, reason?: string): Promise<LeaveRequest> {
    const { data } = await apiClient.post<{ request: LeaveRequest }>('/staff/leave-requests', {
      staffId,
      leaveType,
      startDate,
      endDate,
      reason,
    })
    return data.request
  },
  async listLeaveRequests(schoolId: string, status?: LeaveRequest['status']): Promise<LeaveRequest[]> {
    const { data } = await apiClient.get<{ requests: LeaveRequest[] }>('/staff/leave-requests', { params: { schoolId, status } })
    return data.requests
  },
  async listMyLeaveRequests(): Promise<LeaveRequest[]> {
    const { data } = await apiClient.get<{ requests: LeaveRequest[] }>('/staff/leave-requests/me')
    return data.requests
  },
  async reviewLeaveRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<LeaveRequest> {
    const { data } = await apiClient.patch<{ request: LeaveRequest }>(`/staff/leave-requests/${id}`, { status })
    return data.request
  },
  async getLeaveBalances(staffId: string, year: number): Promise<LeaveBalance[]> {
    const { data } = await apiClient.get<{ balances: LeaveBalance[] }>(`/staff/${staffId}/leave-balances`, { params: { year } })
    return data.balances
  },
  async setLeaveBalance(staffId: string, leaveType: string, year: number, totalDays: number): Promise<LeaveBalance> {
    const { data } = await apiClient.post<{ balance: LeaveBalance }>('/staff/leave-balances', {
      staffId,
      leaveType,
      year,
      totalDays,
    })
    return data.balance
  },
}
