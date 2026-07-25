import { useEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { GraduationCap, Menu, Moon, Sun, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme } from '../../hooks/useTheme'
import { useLanguage } from '../../hooks/useLanguage'

const mobileMenuVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/80 shadow-sm backdrop-blur-lg dark:bg-gray-950/80'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="inline-flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            EduDigital
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {t.nav.home}
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {t.nav.features}
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {t.nav.about}
          </a>
          <a
            href="#footer"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {t.nav.contact}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-full transition',
                lang === 'en'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300',
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('de')}
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-full transition',
                lang === 'de'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300',
              )}
            >
              DE
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {t.nav.login}
          </Link>

          <Link
            to="/register"
            className="hidden sm:inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            {t.nav.register}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div className="md:hidden">
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden border-t border-gray-200/60 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {t.nav.home}
                </Link>
                <a
                  href="#features"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {t.nav.features}
                </a>
                <a
                  href="#testimonials"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {t.nav.about}
                </a>
                <a
                  href="#footer"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {t.nav.contact}
                </a>

                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
