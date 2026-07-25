import { motion, type Variants } from 'framer-motion'
import { Trophy } from 'lucide-react'
import clsx from 'clsx'
import { ACHIEVEMENTS } from '../../data/studentData'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } }

export default function Achievements() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned)
  const locked = ACHIEVEMENTS.filter((a) => !a.earned)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h1>
          <p className="text-sm text-gray-500">{earned.length} earned · {locked.length} locked</p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <p className="text-lg font-bold">You've earned {earned.length} badges! 🎉</p>
        <p className="mt-1 text-amber-100 text-sm">Complete {locked.length} more to unlock all achievements.</p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((earned.length / ACHIEVEMENTS.length) * 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1 text-xs text-amber-200">{Math.round((earned.length / ACHIEVEMENTS.length) * 100)}% complete</p>
      </motion.div>

      {/* Earned */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Earned Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {earned.map((a) => (
            <motion.div
              key={a.id}
              variants={item}
              whileHover={{ scale: 1.04, y: -2 }}
              className={clsx('flex items-center gap-4 rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800', a.bgColor)}
            >
              <span className="text-4xl">{a.emoji}</span>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{a.description}</p>
                {a.earnedDate && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    Earned {new Date(a.earnedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Locked Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((a) => (
            <motion.div
              key={a.id}
              variants={item}
              className="flex cursor-not-allowed items-center gap-4 rounded-2xl bg-gray-50 p-5 opacity-50 ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <span className="text-4xl grayscale">{a.emoji}</span>
              <div>
                <p className="font-bold text-gray-600 dark:text-gray-400">{a.title}</p>
                <p className="text-sm text-gray-500">{a.description}</p>
                <p className="mt-1 text-[10px] text-gray-400">🔒 Not yet earned</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
