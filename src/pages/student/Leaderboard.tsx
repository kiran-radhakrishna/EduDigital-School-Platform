import { motion, type Variants } from 'framer-motion'
import { Medal } from 'lucide-react'
import clsx from 'clsx'
import { LEADERBOARD, STUDENT_INFO } from '../../data/studentData'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item: Variants = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }

const medalFor = (rank: number) =>
  rank === 1 ? { emoji: '🥇', bg: 'from-yellow-400 to-amber-500' }
  : rank === 2 ? { emoji: '🥈', bg: 'from-gray-300 to-gray-400' }
  : rank === 3 ? { emoji: '🥉', bg: 'from-orange-400 to-orange-500' }
  : null

export default function Leaderboard() {
  const emma = LEADERBOARD.find((e) => e.isCurrentUser)!

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500">
          <Medal className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
          <p className="text-sm text-gray-500">Top students of Grade 4 · This month</p>
        </div>
      </motion.div>

      {/* Emma's position highlight */}
      <motion.div
        variants={item}
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-5 text-white shadow-lg shadow-purple-500/20"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black">
          #{emma.rank}
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg">Emma's Position</p>
          <p className="text-purple-200 text-sm">{emma.house} · Level {emma.level}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{emma.xp.toLocaleString()}</p>
          <p className="text-purple-200 text-sm">XP</p>
        </div>
      </motion.div>

      {/* Top 3 podium */}
      <motion.div variants={item} className="flex items-end justify-center gap-4 py-4">
        {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, idx) => {
          const heights = ['h-24', 'h-32', 'h-20']
          const gradients = ['bg-gradient-to-b from-gray-200 to-gray-300', 'bg-gradient-to-b from-yellow-400 to-amber-500', 'bg-gradient-to-b from-orange-300 to-orange-400']
          return (
            <div key={entry.rank} className="flex flex-col items-center gap-2">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: entry.houseColor }}
              >
                {entry.avatar}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center max-w-[80px] truncate">{entry.name}</p>
              <div className={clsx('flex w-20 flex-col items-center justify-end rounded-t-xl py-2', heights[idx], gradients[idx])}>
                <span className="text-2xl">{medalFor(entry.rank)?.emoji}</span>
                <span className="text-white font-bold text-sm">#{entry.rank}</span>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Full list */}
      <motion.div
        variants={item}
        className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        {LEADERBOARD.map((entry) => (
          <div
            key={entry.rank}
            className={clsx(
              'flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-0 dark:border-gray-800',
              entry.isCurrentUser ? 'bg-purple-50 dark:bg-purple-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40',
            )}
          >
            <div className="w-8 text-center">
              {medalFor(entry.rank)
                ? <span className="text-xl">{medalFor(entry.rank)?.emoji}</span>
                : <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
              }
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: entry.houseColor }}
            >
              {entry.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className={clsx('text-sm font-semibold', entry.isCurrentUser ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white')}>
                {entry.name} {entry.isCurrentUser && '(You)'}
              </p>
              <p className="text-xs text-gray-500">{entry.house} · Grade {entry.grade} · Level {entry.level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.xp.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">XP</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
