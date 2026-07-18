import { motion, type Variants } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import clsx from 'clsx'
import { CAREER_SUGGESTIONS, GRADES } from '../../data/studentData'
import { ProgressBar } from '../../components/common/ProgressBar'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

const avgGrade = Math.round(GRADES.reduce((s, g) => s + g.score, 0) / GRADES.length)
const topSubject = GRADES.reduce((top, g) => (g.score > top.score ? g : top), GRADES[0])

export default function CareerSuggestions() {
  const { user } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'student')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Career Suggestions</h1>
          <p className="text-sm text-gray-500">Personalised for {currentUser.fullName}</p>
        </div>
      </motion.div>

      {/* Analysis Banner */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wide">AI Analysis</p>
        <p className="mt-2 text-lg font-bold">Based on your interests and academic performance…</p>
        <p className="mt-2 text-indigo-200 text-sm">
          Your average grade is <span className="font-bold text-white">{avgGrade}%</span> and your strongest subject is{' '}
          <span className="font-bold text-white">{topSubject.subject} ({topSubject.score}%)</span>.
          Here are the careers that best match your profile:
        </p>

        <div className="mt-4 flex gap-4">
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-xl font-black">{avgGrade}%</p>
            <p className="text-xs text-indigo-200">Average Grade</p>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-xl font-black">{topSubject.grade}</p>
            <p className="text-xs text-indigo-200">Best Grade</p>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-xl font-black">{GRADES.length}</p>
            <p className="text-xs text-indigo-200">Subjects</p>
          </div>
        </div>
      </motion.div>

      {/* Career cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {CAREER_SUGGESTIONS.map((career, i) => (
          <motion.div
            key={career.career}
            variants={item}
            whileHover={{ scale: 1.02, y: -2 }}
            className={clsx('rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800', career.bgColor)}
          >
            {/* Top row */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{career.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{career.career}</h3>
                  <span className="text-sm font-semibold" style={{ color: career.color }}>
                    {career.match}% match
                  </span>
                </div>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold"
                style={{ backgroundColor: career.color }}
              >
                #{i + 1}
              </div>
            </div>

            {/* Match bar */}
            <div className="mb-3">
              <ProgressBar value={career.match} color={career.color} size="sm" delay={0.2 + i * 0.1} />
            </div>

            {/* Why */}
            <div className="rounded-xl bg-white/70 p-3 dark:bg-gray-800/70">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Why {currentUser.firstName}?
              </p>
              <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">{career.reason}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top subjects that support careers */}
      <motion.div variants={item} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Your Subject Performance</h2>
        <div className="space-y-3">
          {GRADES.sort((a, b) => b.score - a.score).map((g, i) => (
            <div key={g.subject} className="flex items-center gap-3">
              <span className="w-4 text-xs font-bold text-gray-400">#{i + 1}</span>
              <span className="w-28 text-sm text-gray-700 dark:text-gray-300">{g.subject}</span>
              <div className="flex-1">
                <ProgressBar value={g.score} color={g.color} size="xs" delay={0.05 * i} />
              </div>
              <span className="w-8 text-right text-xs font-semibold" style={{ color: g.color }}>{g.grade}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
