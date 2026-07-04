import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'

const floatingShapes = [
  'top-20 left-[10%] h-72 w-72 bg-indigo-400',
  'bottom-24 right-[12%] h-80 w-80 bg-purple-400',
  'top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-fuchsia-300',
]

export default function Hero() {
  const { t } = useLanguage()

  const stats = [
    { value: '12K+', label: t.hero.stats.students },
    { value: '800+', label: t.hero.stats.teachers },
    { value: '500+', label: t.hero.stats.schools },
  ]

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />

      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={shape}
            className={`absolute rounded-full blur-3xl opacity-30 ${shape}`}
            animate={{ y: [0, 20, 0], x: [0, index % 2 === 0 ? 12 : -12, 0] }}
            transition={{
              duration: 8 + index * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.hero.badge}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 text-5xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white md:text-7xl"
        >
          <span>{t.hero.title}</span>
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
          >
            {t.hero.ctaStudent}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-8 py-3.5 font-semibold text-gray-800 transition hover:border-indigo-600 dark:border-gray-700 dark:text-gray-100 dark:hover:border-indigo-500"
          >
            {t.hero.ctaTeacher}
          </Link>
        </motion.div>

        <div className="grid max-w-lg grid-cols-3 gap-6 mx-auto mt-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 + index * 0.1 }}
              className="rounded-xl border border-gray-100 bg-white/60 p-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/60"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
