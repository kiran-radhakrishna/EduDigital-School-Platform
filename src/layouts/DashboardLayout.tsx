import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import DemoModeBanner from '../components/demo/DemoModeBanner'
import { useAuth } from '../hooks/useAuth'
import { useWellbeing } from '../hooks/useWellbeing'

const TITLE_MAP: Record<string, string> = {
  dashboard:              'Dashboard',
  'study-planner':        'Study Planner',
  subjects:               'Subjects',
  assignments:            'Assignments',
  homework:               'Homework',
  attendance:             'Attendance',
  timetable:              'Timetable',
  grades:                 'Grades',
  achievements:           'Achievements',
  leaderboard:            'Leaderboard',
  'ai-tutor':             'AI Tutor',
  'personality-assessment': 'Personality Assessment',
  'subject-assessment':   'Subject Assessment',
  'career-suggestions':   'Career Suggestions',
  'mental-health':        'Mental Health',
  events:                 'Events',
  notifications:          'Notifications',
  profile:                'Profile',
  settings:               'Settings',
}

function getDashboardTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).at(-1) ?? ''
  return TITLE_MAP[segment] ?? 'Dashboard'
}

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth()
  const { shouldShowWellbeingCheck } = useWellbeing()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (shouldShowWellbeingCheck) {
    return <Navigate replace to="/wellbeing-check" />
  }

  const title = getDashboardTitle(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoModeBanner />
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
