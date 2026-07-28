import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  allowedRole: UserRole
  children: ReactNode
}

/** Gates a role's route tree so a signed-in user of a different role can't render it. */
export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (user && user.role !== allowedRole) {
    return <Navigate replace to={`/${user.role}/dashboard`} />
  }

  return <>{children}</>
}
