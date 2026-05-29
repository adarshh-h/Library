import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoader } from '../components/ui'

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user)   return <Navigate to={`/${role}/login`} replace />
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}
