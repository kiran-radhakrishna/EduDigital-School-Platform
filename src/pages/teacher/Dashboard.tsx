import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, Clock, BookOpen, Users, TrendingUp } from 'lucide-react'
import { ClassCard } from '../../components/teacher/ClassCard'
import { getTeacherClasses, getUnreadNotificationCount } from '../../services/teacherService'
import { useAuth } from '../../hooks/useAuth'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const classes = getTeacherClasses()
  const unreadNotifications = getUnreadNotificationCount()

  const handleOpenClass = (classId: string) => {
    navigate(`/teacher/class/${classId}`)
  }

  const todayClasses = classes.length

  const stats = [
    { label: "Today's Classes", value: todayClasses, icon: Clock, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    { label: 'Assignments Pending', value: '12', icon: BookOpen, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' },
    { label: 'Attendance Pending', value: '3', icon: Calendar, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
    { label: 'Unread Messages', value: '5', icon: Users, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
    { label: 'Events This Week', value: '2', icon: TrendingUp, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30' },
    { label: 'Wellbeing Alerts', value: unreadNotifications, icon: Bell, color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back, {user?.firstName}! 👋
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          You have {unreadNotifications} notifications and {todayClasses} classes today.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div key={stat.label} className={`rounded-xl ${stat.color} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-75">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <IconComponent className="h-8 w-8 opacity-50" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your assigned classes and student progress.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onOpen={() => handleOpenClass(classData.id)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            className="rounded-lg border border-indigo-600 px-4 py-3 text-center font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            ✓ Mark Attendance
          </button>
          <button
            type="button"
            className="rounded-lg border border-indigo-600 px-4 py-3 text-center font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            📝 Create Homework
          </button>
          <button
            type="button"
            className="rounded-lg border border-indigo-600 px-4 py-3 text-center font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            📋 Create Assignment
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Community</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Connect with other teachers, share resources, and collaborate.
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Browse Community
        </button>
      </div>
    </div>
  )
}
