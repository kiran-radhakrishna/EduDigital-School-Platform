import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Medal,
  Settings,
  Trophy,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { User as AppUser } from '../../types'
import { Avatar } from '../common/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'

export interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
}

interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

const STUDENT_NAV: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard',    path: '/student/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academic',
    items: [
      { label: 'Study Planner',  path: '/student/study-planner', icon: BookMarked },
      { label: 'Subjects',        path: '/student/subjects',      icon: BookOpen },
      { label: 'Assignments',     path: '/student/assignments',   icon: ClipboardList },
      { label: 'Homework',        path: '/student/homework',      icon: FileText },
      { label: 'Attendance',      path: '/student/attendance',    icon: CalendarCheck },
      { label: 'Timetable',       path: '/student/timetable',     icon: Calendar },
      { label: 'Grades',          path: '/student/grades',        icon: BarChart3 },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Achievements', path: '/student/achievements', icon: Trophy },
      { label: 'Leaderboard',  path: '/student/leaderboard',  icon: Medal },
    ],
  },
  {
    title: 'AI Features',
    items: [
      { label: 'AI Tutor',               path: '/student/ai-tutor',               icon: Bot },
      { label: 'Personality Assessment', path: '/student/personality-assessment', icon: Brain },
      { label: 'Subject Assessment',     path: '/student/subject-assessment',     icon: FlaskConical },
      { label: 'Career Suggestions',     path: '/student/career-suggestions',     icon: Briefcase },
    ],
  },
  {
    title: 'Wellbeing',
    items: [
      { label: 'Mental Health', path: '/student/mental-health', icon: Heart },
    ],
  },
  {
    title: 'General',
    items: [
      { label: 'Notifications', path: '/student/notifications', icon: Bell },
      { label: 'Settings',      path: '/student/settings',      icon: Settings },
    ],
  },
]

function getGenericNav(basePath: string, t: ReturnType<typeof useLanguage>['t']): SidebarSection[] {
  return [
    {
      items: [
        { label: t.dashboard.overview,       path: `${basePath}/dashboard`,     icon: LayoutDashboard },
        { label: t.dashboard.timetable,      path: `${basePath}/timetable`,     icon: Calendar },
        { label: t.dashboard.assignments,    path: `${basePath}/assignments`,   icon: ClipboardList },
        { label: t.dashboard.grades,         path: `${basePath}/grades`,        icon: BarChart3 },
        { label: t.dashboard.attendance,     path: `${basePath}/attendance`,    icon: CalendarCheck },
        { label: t.dashboard.subjects,       path: `${basePath}/subjects`,      icon: BookOpen },
        { label: t.dashboard.notifications,  path: `${basePath}/notifications`, icon: Bell },
        { label: t.dashboard.profile,        path: `${basePath}/profile`,       icon: User },
        { label: t.dashboard.settings,       path: `${basePath}/settings`,      icon: Settings },
      ],
    },
  ]
}

function getParentNav(t: ReturnType<typeof useLanguage>['t']): SidebarSection[] {
  return [
    {
      items: [
        { label: t.dashboard.overview,      path: '/parent/dashboard',     icon: LayoutDashboard },
        { label: t.dashboard.grades,        path: '/parent/grades',        icon: BarChart3 },
        { label: t.dashboard.attendance,    path: '/parent/attendance',    icon: CalendarCheck },
        { label: t.dashboard.timetable,     path: '/parent/timetable',     icon: Calendar },
        { label: t.dashboard.notifications, path: '/parent/notifications', icon: Bell },
        { label: t.dashboard.profile,       path: '/parent/profile',       icon: User },
        { label: t.dashboard.settings,      path: '/parent/settings',      icon: Settings },
      ],
    },
  ]
}

function getAdminNav(t: ReturnType<typeof useLanguage>['t']): SidebarSection[] {
  return [
    {
      items: [
        { label: t.dashboard.overview,      path: '/admin/dashboard',     icon: LayoutDashboard },
        { label: t.dashboard.subjects,      path: '/admin/subjects',      icon: BookOpen },
        { label: t.dashboard.notifications, path: '/admin/notifications', icon: Bell },
        { label: t.dashboard.profile,       path: '/admin/profile',       icon: User },
        { label: t.dashboard.settings,      path: '/admin/settings',      icon: Settings },
      ],
    },
  ]
}

function getRoleLabel(role: AppUser['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (!user) return null

  const sections: SidebarSection[] =
    user.role === 'student' ? STUDENT_NAV
    : user.role === 'parent' ? getParentNav(t)
    : user.role === 'admin'  ? getAdminNav(t)
    : getGenericNav(`/${user.role}`, t)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          type="button"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:z-auto',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
          <div className={clsx('flex min-w-0 items-center gap-2', collapsed && 'justify-center')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">DIS</p>
                <p className="truncate text-[10px] text-gray-400">Deggendorf Int'l School</p>
              </div>
            )}
          </div>
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:flex"
            onClick={onToggle}
            type="button"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {sections.map((section, si) => (
            <div key={si} className="mb-1">
              {section.title && !collapsed && (
                <p className="mx-4 mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  {section.title}
                </p>
              )}
              {section.items.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    clsx(
                      'mx-2 my-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-800">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={user.name} size="sm" src={user.avatar} />
              <button
                aria-label="Logout"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="sm" src={user.avatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="truncate text-xs capitalize text-gray-400">{getRoleLabel(user.role)}</p>
              </div>
              <button
                aria-label="Logout"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
