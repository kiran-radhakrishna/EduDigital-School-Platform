import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Bell, GraduationCap, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { useTheme } from '../../hooks/useTheme'
import type { Lang } from '../../context/LanguageContext'
import { STUDENT_INFO } from '../../data/studentData'

export interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const hasUnread = true
  const resolvedTitle = title ?? t.dashboard.overview
  const basePath = `/${user.role}`
  const isStudent = user.role === 'student'

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const toggleLang = () => setLang((lang === 'en' ? 'de' : 'en') as Lang)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 lg:px-6">
      {/* Left: hamburger + school brand */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* School logo — shown on lg+ */}
        <Link
          to={`${basePath}/dashboard`}
          className="hidden items-center gap-2 lg:flex"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {isStudent ? STUDENT_INFO.schoolShort : 'EduDigital'}
            </p>
            <p className="text-[10px] text-gray-400">
              {isStudent ? 'Student Portal' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </Link>

        <div className="hidden h-5 w-px bg-gray-200 dark:bg-gray-700 lg:block" />
        <h1 className="text-base font-semibold text-gray-800 dark:text-white">{resolvedTitle}</h1>
      </div>

      {/* Centre: search */}
      <div className="hidden w-full max-w-xs md:flex lg:max-w-sm">
        <label className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-9 w-full rounded-lg border border-transparent bg-gray-100 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-400/30 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
            placeholder={t.common.search + '...'}
            type="search"
          />
        </label>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Language switcher */}
        <button
          aria-label="Toggle language"
          className="hidden items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-purple-400 hover:text-purple-600 dark:border-gray-700 dark:text-gray-400 dark:hover:text-purple-400 sm:flex"
          onClick={toggleLang}
          type="button"
        >
          <span>{lang.toUpperCase()}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-400">{lang === 'en' ? 'DE' : 'EN'}</span>
        </button>

        {/* Dark mode */}
        <button
          aria-label={isDark ? 'Light mode' : 'Dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={toggleTheme}
          type="button"
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={() => navigate(`${basePath}/notifications`)}
          type="button"
        >
          <Bell className="h-4.5 w-4.5" />
          {hasUnread && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900" />
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          {menuOpen && (
            <button className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} type="button" />
          )}
          <button
            aria-expanded={menuOpen}
            className={clsx(
              'rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              menuOpen && 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900',
            )}
            onClick={() => setMenuOpen((p) => !p)}
            type="button"
          >
            <Avatar name={user.name} size="sm" src={user.avatar} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-gray-100 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 pb-3 pt-2 dark:border-gray-700">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                {isStudent && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                      Grade {STUDENT_INFO.grade}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      {STUDENT_INFO.house}
                    </span>
                  </div>
                )}
              </div>

              <div className="py-1">
                <Link
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/60"
                  onClick={() => setMenuOpen(false)}
                  to={`${basePath}/profile`}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/60"
                  onClick={() => setMenuOpen(false)}
                  to={`${basePath}/settings`}
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </div>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              <button
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" /> {t.dashboard.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
