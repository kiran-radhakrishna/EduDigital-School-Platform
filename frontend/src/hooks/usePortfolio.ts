import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useEvents } from './useEvents'
import { getCurrentUserIdentity } from '../utils/helpers'
import { buildStudentPortfolio, getAvailableStudents } from '../services/portfolioService'

export function usePortfolio(studentId?: string) {
  const { user } = useAuth()
  const { snapshot } = useEvents()

  const currentUser = getCurrentUserIdentity(user, 'student')
  const resolvedStudentId = studentId ?? 'student-krn'
  const resolvedStudentName = studentId ? getAvailableStudents(snapshot).find((entry) => entry.studentId === studentId)?.name ?? currentUser.fullName : currentUser.fullName

  const portfolio = useMemo(
    () => buildStudentPortfolio(resolvedStudentId, resolvedStudentName, snapshot),
    [resolvedStudentId, resolvedStudentName, snapshot],
  )

  const students = useMemo(() => getAvailableStudents(snapshot), [snapshot])

  return {
    portfolio,
    students,
  }
}
