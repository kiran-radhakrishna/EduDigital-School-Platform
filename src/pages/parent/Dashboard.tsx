import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, AlertCircle, MessageSquare, Award, TrendingUp, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useParent } from '../../context/ParentContext'
import { ChildCard } from '../../components/parent/ChildCard'
import { StatCard } from '../../components/common/StatCard'
import { getCurrentUserIdentity } from '../../utils/helpers'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { parentProfile, children, childProgress, unreadNotificationCount } = useParent()
  const currentUser = getCurrentUserIdentity(user, 'parent')

  const handleChildOpen = (childId: string) => {
    navigate(`/parent/child/${childId}`)
  }

  if (!parentProfile || children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading family information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pb-12">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back, {currentUser?.firstName || parentProfile.name}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Family Overview</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-700">
                  <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Total Homework"
            value={children.reduce((sum, child) => sum + (childProgress[child.id]?.homework.total || 0), 0).toString()}
            iconColor="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            title="Pending Approvals"
            value="1"
            iconColor="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
          />
          <StatCard
            icon={<Award className="h-6 w-6" />}
            title="Certificates"
            value={children.reduce((sum, child) => sum + (childProgress[child.id] ? 2 : 0), 0).toString()}
            iconColor="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Average Attendance"
            value={Math.round(
              children.reduce((sum, child) => sum + (childProgress[child.id]?.attendance.percentage || 0), 0) / children.length
            ) + '%'}
            iconColor="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
          />
        </motion.div>

        {/* Children Cards Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Children</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage each child's educational journey</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                progress={childProgress[child.id]}
                onOpen={() => handleChildOpen(child.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
              <MessageSquare className="h-4 w-4" />
              Message Teacher
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors dark:bg-dark-700 dark:text-white dark:hover:bg-dark-600">
              <Award className="h-4 w-4" />
              Download Certificate
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors dark:bg-dark-700 dark:text-white dark:hover:bg-dark-600">
              <AlertCircle className="h-4 w-4" />
              Approve Events
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors dark:bg-dark-700 dark:text-white dark:hover:bg-dark-600">
              <Calendar className="h-4 w-4" />
              View Calendar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
