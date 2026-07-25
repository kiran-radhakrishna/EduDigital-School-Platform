import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Brain, Briefcase, CalendarCheck, CheckCircle2, Clock,
  Coins, Flame, Heart, Smile, Star, Trophy, Zap,
} from 'lucide-react'
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts'
import clsx from 'clsx'
import { useAuth } from '../../hooks/useAuth'
import { useWellbeing } from '../../hooks/useWellbeing'
import { ProgressBar } from '../../components/common/ProgressBar'
import { getCurrentUserIdentity } from '../../utils/helpers'
import type { WellbeingEmotion } from '../../types/wellbeing'
import {
  ACHIEVEMENTS, AI_TUTOR_QUESTIONS, ASSIGNMENT_STATS, ATTENDANCE_STATS,
  CALENDAR_EVENTS, CAREER_SUGGESTIONS, GRADES, HOMEWORK, LEADERBOARD,
  MOTIVATIONAL_QUOTES, NOTIFICATIONS, STUDENT_INFO, STUDY_PLAN, TODAY_TIMETABLE,
} from '../../data/studentData'

// ─── Animation helpers ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const cardHover = { scale: 1.015, transition: { duration: 0.2 } }
const MENTAL_HEALTH_QUOTE =
  MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]

// ─── Shared card wrapper ─────────────────────────────────────────────────────

function DashCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={item}
      whileHover={cardHover}
      className={clsx(
        'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h2>
  )
}

// ─── Welcome Hero Card ───────────────────────────────────────────────────────

function WelcomeCard({ firstName }: { firstName: string }) {
  const xpPct = Math.round((STUDENT_INFO.xp / STUDENT_INFO.xpNext) * 100)

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800 p-6 text-white shadow-lg shadow-purple-500/20 lg:p-8"
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: greeting */}
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            {STUDENT_INFO.school}
          </div>
          <h1 className="mt-3 text-2xl font-bold lg:text-3xl">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-purple-200">
            Grade {STUDENT_INFO.grade} · Roll No. {STUDENT_INFO.rollNumber} · {STUDENT_INFO.house}
          </p>
          <p className="mt-0.5 text-xs text-purple-300">
            Class Teacher: {STUDENT_INFO.classTeacher}
          </p>

          {/* XP bar */}
          <div className="mt-4 max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-purple-200">
              <span>Level {STUDENT_INFO.level}</span>
              <span>{STUDENT_INFO.xp} / {STUDENT_INFO.xpNext} XP</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Right: stats pills */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {[
            { icon: Zap,           label: 'XP',           value: STUDENT_INFO.xp.toLocaleString(), color: 'bg-yellow-400/20' },
            { icon: Coins,         label: 'Coins',         value: STUDENT_INFO.coins,             color: 'bg-amber-400/20' },
            { icon: CalendarCheck, label: 'Attendance',    value: `${STUDENT_INFO.attendancePct}%`, color: 'bg-green-400/20' },
            { icon: Clock,         label: 'Homework Due',  value: STUDENT_INFO.homeworkDue,        color: 'bg-red-400/20' },
            { icon: Brain,         label: 'Upcoming Exam', value: STUDENT_INFO.upcomingExam,       color: 'bg-blue-400/20' },
            { icon: Star,          label: 'GPA',           value: STUDENT_INFO.gpa,               color: 'bg-pink-400/20' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={clsx('flex items-center gap-2 rounded-xl px-3 py-2', color)}>
              <Icon className="h-4 w-4 shrink-0 text-white/80" />
              <div className="min-w-0">
                <p className="truncate text-[10px] text-purple-200">{label}</p>
                <p className="truncate text-sm font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

function QuickActionsCard() {
  const navigate = useNavigate()

  const actions = [
    { label: 'Join Quiz',       emoji: '🎯', path: '/student/subject-assessment', color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400' },
    { label: 'AI Tutor',        emoji: '🤖', path: '/student/ai-tutor',          color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',       text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Homework',        emoji: '📝', path: '/student/homework',           color: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',   text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Timetable',       emoji: '📅', path: '/student/timetable',         color: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20',       text: 'text-teal-700 dark:text-teal-400' },
  ]

  return (
    <DashCard>
      <SectionTitle>Quick Actions</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ label, emoji, path, color, text }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className={clsx('flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all duration-150', color)}
          >
            <span className="text-2xl">{emoji}</span>
            <span className={clsx('text-xs font-semibold', text)}>{label}</span>
          </button>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Today's Timetable ───────────────────────────────────────────────────────

function TimetableCard() {
  return (
    <DashCard>
      <SectionTitle>Today's Timetable</SectionTitle>
      <div className="space-y-2">
        {TODAY_TIMETABLE.map((entry) => (
          <div
            key={entry.period}
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: entry.color }}
            >
              P{entry.period}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{entry.subject}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{entry.teacher} · {entry.room}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{entry.startTime}</p>
              <p className="text-[10px] text-gray-400">– {entry.endTime}</p>
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Homework ────────────────────────────────────────────────────────────────

function HomeworkCard() {
  const priorityStyles: Record<string, string> = {
    high:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    low:    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  }

  return (
    <DashCard>
      <SectionTitle>Homework</SectionTitle>
      <div className="space-y-3">
        {HOMEWORK.map((hw, i) => (
          <div key={hw.id}>
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{hw.title}</p>
                <p className="text-xs text-gray-500">{hw.subject} · Due {new Date(hw.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
              </div>
              <span className={clsx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', priorityStyles[hw.priority])}>
                {hw.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ProgressBar value={hw.completion} color={hw.color} size="xs" delay={0.1 * i} />
              <span className="shrink-0 text-xs text-gray-500">{hw.completion}%</span>
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Assignments Status ───────────────────────────────────────────────────────

function AssignmentsCard() {
  const stats = [
    { label: 'Pending',   value: ASSIGNMENT_STATS.pending,   color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Submitted', value: ASSIGNMENT_STATS.submitted,  color: 'bg-blue-500',  text: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Late',      value: ASSIGNMENT_STATS.late,        color: 'bg-red-500',   text: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Completed', value: ASSIGNMENT_STATS.completed,   color: 'bg-green-500', text: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-500/10' },
  ]

  return (
    <DashCard>
      <SectionTitle>Assignments</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, text, bg }) => (
          <div key={label} className={clsx('flex flex-col items-center rounded-xl py-4', bg)}>
            <span className={clsx('text-2xl font-bold', text)}>{value}</span>
            <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Attendance Pie Chart ─────────────────────────────────────────────────────

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b']

function AttendanceCard() {
  const data = [
    { name: 'Present', value: ATTENDANCE_STATS.present },
    { name: 'Absent',  value: ATTENDANCE_STATS.absent },
    { name: 'Late',    value: ATTENDANCE_STATS.late },
  ]

  const pct = Math.round((ATTENDANCE_STATS.present / ATTENDANCE_STATS.total) * 100)

  return (
    <DashCard>
      <SectionTitle>Attendance · {pct}%</SectionTitle>
      <div className="flex items-center gap-4">
        <div className="h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} days`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map(({ name, value }, i) => (
            <div key={name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{name}</span>
              <span className="ml-auto text-xs font-semibold text-gray-900 dark:text-white">{value}d</span>
            </div>
          ))}
          <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
            <p className="text-[10px] text-gray-400">Total: {ATTENDANCE_STATS.total} school days</p>
          </div>
        </div>
      </div>
    </DashCard>
  )
}

// ─── Grades ───────────────────────────────────────────────────────────────────

function GradesCard() {
  return (
    <DashCard>
      <SectionTitle>Grades</SectionTitle>
      <div className="space-y-3">
        {GRADES.map((g, i) => (
          <div key={g.subject}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{g.subject}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: g.color }}>{g.grade}</span>
                <span className="text-xs text-gray-400">{g.score}%</span>
              </div>
            </div>
            <ProgressBar value={g.score} color={g.color} size="sm" delay={0.05 * i} />
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementsCard() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned)
  const locked = ACHIEVEMENTS.filter((a) => !a.earned)

  return (
    <DashCard>
      <SectionTitle>Achievements · {earned.length}/{ACHIEVEMENTS.length}</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {earned.map((a) => (
          <div
            key={a.id}
            title={`${a.title}: ${a.description}`}
            className={clsx('flex items-center gap-2 rounded-xl px-3 py-2', a.bgColor)}
          >
            <span className="text-xl">{a.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{a.title}</p>
              <p className="text-[10px] text-gray-500">{a.description}</p>
            </div>
          </div>
        ))}
        {locked.map((a) => (
          <div
            key={a.id}
            title={a.description}
            className="flex items-center gap-2 rounded-xl px-3 py-2 opacity-40 grayscale"
          >
            <span className="text-xl">{a.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-gray-500">{a.title}</p>
              <p className="text-[10px] text-gray-400">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

function LeaderboardCard({ fullName, avatar }: { fullName: string; avatar: string }) {
  const medalEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <DashCard>
      <SectionTitle>Leaderboard · Top 10</SectionTitle>
      <div className="space-y-2">
        {LEADERBOARD.map((entry) => {
          const displayName = entry.isCurrentUser ? fullName : entry.name
          const displayAvatar = entry.isCurrentUser ? avatar : entry.avatar

          return (
            <div
              key={entry.rank}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                entry.isCurrentUser
                  ? 'bg-purple-50 ring-1 ring-purple-200 dark:bg-purple-500/10 dark:ring-purple-500/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              )}
            >
              <div className="w-5 shrink-0 text-center">
                {medalEmoji(entry.rank) ?? (
                  <span className="text-xs font-bold text-gray-400">{entry.rank}</span>
                )}
              </div>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: entry.houseColor }}
              >
                {displayAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className={clsx('truncate text-sm font-medium', entry.isCurrentUser ? 'font-semibold text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white')}>
                  {displayName} {entry.isCurrentUser && '(You)'}
                </p>
                <p className="text-[10px] text-gray-400">{entry.house} · Lv.{entry.level}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{entry.xp.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">XP</p>
              </div>
            </div>
          )
        })}
      </div>
    </DashCard>
  )
}

// ─── Calendar ────────────────────────────────────────────────────────────────

function CalendarCard() {
  const typeColors: Record<string, string> = {
    exam:     'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    event:    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    meeting:  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    holiday:  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <DashCard>
      <SectionTitle>Upcoming Events</SectionTitle>
      <div className="space-y-2.5">
        {CALENDAR_EVENTS.map((ev) => (
          <div key={ev.id} className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: ev.color }}
            >
              <span className="text-base leading-none">{ev.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{ev.title}</p>
              <p className="text-xs text-gray-500">{fmt(ev.date)}</p>
            </div>
            <span className={clsx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', typeColors[ev.type])}>
              {ev.type}
            </span>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsCard() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS)

  const markRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const unread = notifs.filter((n) => !n.read).length

  return (
    <DashCard>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle>Notifications {unread > 0 && `(${unread})`}</SectionTitle>
        <button
          type="button"
          className="text-xs text-purple-600 hover:underline dark:text-purple-400"
          onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
        >
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifs.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n.id)}
            className={clsx(
              'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors',
              n.read ? 'opacity-60' : 'bg-purple-50/60 dark:bg-purple-500/5',
              'hover:bg-gray-50 dark:hover:bg-gray-800/50',
            )}
          >
            <span className="mt-0.5 text-xl">{n.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </DashCard>
  )
}

// ─── AI Tutor ────────────────────────────────────────────────────────────────

function AITutorCard() {
  const navigate = useNavigate()

  return (
    <DashCard className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-0">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-lg">AI Tutor</p>
            <p className="text-blue-200 text-sm">Ask me anything! 🎓</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {AI_TUTOR_QUESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => navigate('/student/ai-tutor')}
              className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-left text-sm text-blue-100 transition hover:bg-white/20"
            >
              <span>💡</span>
              <span className="truncate">{q}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/student/ai-tutor')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
        >
          <Bot className="h-4 w-4" /> Ask AI Tutor
        </button>
      </div>
    </DashCard>
  )
}

// ─── Study Planner ────────────────────────────────────────────────────────────

function StudyPlannerCard() {
  return (
    <DashCard>
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <SectionTitle>Study Planner</SectionTitle>
        <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
          🔥 {STUDY_PLAN.studyStreak} day streak
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Today's Goal</span>
            <span className="font-semibold text-orange-600">{STUDY_PLAN.todayProgress}%</span>
          </div>
          <ProgressBar value={STUDY_PLAN.todayProgress} color="#f97316" size="sm" />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{STUDY_PLAN.todayGoal}</p>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Weekly Goal</span>
            <span className="font-semibold text-purple-600">{STUDY_PLAN.weeklyProgress}%</span>
          </div>
          <ProgressBar value={STUDY_PLAN.weeklyProgress} color="#9333ea" size="sm" delay={0.3} />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{STUDY_PLAN.weeklyGoal}</p>
        </div>

        <div className="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{STUDY_PLAN.studyStreak}</p>
            <p className="text-[10px] text-gray-400">Day Streak</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{STUDY_PLAN.totalStudyHours}h</p>
            <p className="text-[10px] text-gray-400">Total Hours</p>
          </div>
        </div>
      </div>
    </DashCard>
  )
}

// ─── Career Suggestions ───────────────────────────────────────────────────────

function CareerCard({ firstName }: { firstName: string }) {
  return (
    <DashCard className="lg:col-span-2">
      <div className="mb-3 flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-gray-400" />
        <SectionTitle>Career Suggestions</SectionTitle>
      </div>
      <p className="mb-4 text-xs text-gray-500 italic dark:text-gray-400">
        Based on your interests and performance, {firstName} might thrive as a…
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CAREER_SUGGESTIONS.map((c) => (
          <div key={c.career} className={clsx('rounded-xl p-4', c.bgColor)}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.emoji}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{c.career}</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ color: c.color }}>
                {c.match}% match
              </span>
            </div>
            <ProgressBar value={c.match} color={c.color} size="xs" delay={0.2} />
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{c.reason}</p>
          </div>
        ))}
      </div>
    </DashCard>
  )
}

// ─── Mental Health ────────────────────────────────────────────────────────────

type Mood = 'happy' | 'okay' | 'stressed' | null

function MentalHealthCard() {
  const [mood, setMood] = useState<Mood>(null)
  const [breathing, setBreathing] = useState(false)

  const quote = MENTAL_HEALTH_QUOTE

  const moods: Array<{ key: Mood; emoji: string; label: string; color: string }> = [
    { key: 'happy',   emoji: '😊', label: 'Happy',   color: 'bg-green-100 ring-green-400 dark:bg-green-500/20' },
    { key: 'okay',    emoji: '😐', label: 'Okay',    color: 'bg-blue-100 ring-blue-400 dark:bg-blue-500/20' },
    { key: 'stressed',emoji: '😟', label: 'Stressed',color: 'bg-red-100 ring-red-400 dark:bg-red-500/20' },
  ]

  return (
    <DashCard>
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 text-pink-500" />
        <SectionTitle>Mental Health</SectionTitle>
      </div>

      {/* Mood check */}
      <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">How are you feeling today?</p>
      <div className="flex gap-2">
        {moods.map(({ key, emoji, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMood(key)}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-center transition-all ring-2',
              mood === key ? color + ' ring-offset-1' : 'bg-gray-50 ring-transparent dark:bg-gray-800/50',
            )}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
          </button>
        ))}
      </div>

      {/* Breathing exercise */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setBreathing((p) => !p)}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
        >
          <Smile className="h-4 w-4" />
          {breathing ? 'Stop Breathing Exercise' : 'Breathing Exercise 🫁'}
        </button>
        {breathing && (
          <motion.div
            className="flex h-16 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl">🫁</span>
            <p className="ml-2 text-sm text-blue-600 dark:text-blue-400">Breathe in... hold... out...</p>
          </motion.div>
        )}
      </div>

      {/* Motivational quote */}
      <div className="mt-4 rounded-xl bg-purple-50 p-3 dark:bg-purple-500/10">
        <p className="text-xs italic text-gray-700 dark:text-gray-300">"{quote.quote}"</p>
        <p className="mt-1 text-[10px] font-semibold text-gray-500">— {quote.author}</p>
      </div>
    </DashCard>
  )
}

// ─── Assessment Cards ──────────────────────────────────────────────────────────

function AssessmentCard({
  title, emoji, description, buttonLabel, path, color,
}: {
  title: string; emoji: string; description: string; buttonLabel: string; path: string; color: string;
}) {
  const navigate = useNavigate()

  return (
    <DashCard>
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: color + '20' }}
        >
          {emoji}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <button
        type="button"
        onClick={() => navigate(path)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        {buttonLabel}
      </button>
    </DashCard>
  )
}

function WellbeingRecommendationCard({ emotion }: { emotion: WellbeingEmotion }) {
  const navigate = useNavigate()

  const recommendationByEmotion: Record<WellbeingEmotion, { title: string; description: string; cta: string; path: string }> = {
    happy: {
      title: 'You are in a great state today',
      description: 'Amazing energy! Keep your momentum with high-impact learning goals.',
      cta: 'View Achievements',
      path: '/student/achievements',
    },
    focused: {
      title: 'Focus mode detected',
      description: 'Perfect moment to tackle pending assignments while concentration is high.',
      cta: 'Open Assignments',
      path: '/student/assignments',
    },
    calm: {
      title: 'Calm and steady',
      description: 'A balanced state is ideal for consistent progress. Keep going at your pace.',
      cta: 'Open Study Planner',
      path: '/student/study-planner',
    },
    neutral: {
      title: 'Steady start',
      description: 'A quick warm-up activity can help you build momentum for today.',
      cta: 'Open AI Tutor',
      path: '/student/ai-tutor',
    },
    tired: {
      title: 'Recharge recommendation',
      description: 'Take a short break and then return with renewed focus.',
      cta: 'Start Breathing Exercise',
      path: '/student/mental-health',
    },
    sad: {
      title: 'Supportive day plan',
      description: 'Keep things gentle. Small wins today are still meaningful progress.',
      cta: 'Open Wellbeing Tools',
      path: '/student/mental-health',
    },
    stressed: {
      title: 'Stress support available',
      description: 'Try a 2-minute breathing exercise before jumping into tasks.',
      cta: 'Open Breathing Exercise',
      path: '/student/mental-health',
    },
    anxious: {
      title: 'Counselor resources available',
      description: 'You are not alone. Support resources are available when needed.',
      cta: 'View Support Resources',
      path: '/student/mental-health',
    },
  }

  const recommendation = recommendationByEmotion[emotion]

  return (
    <DashCard className="border border-indigo-100 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{recommendation.description}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(recommendation.path)}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          {recommendation.cta}
        </button>
      </div>
    </DashCard>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth()
  const { latestAssessment } = useWellbeing()
  const currentUser = getCurrentUserIdentity(user, 'student')
  const currentEmotion = latestAssessment?.emotion
  const showAchievementsFirst = currentEmotion === 'happy'
  const showAssignmentsFirst = currentEmotion === 'focused'
  const showRecommendation =
    currentEmotion === 'happy' ||
    currentEmotion === 'focused' ||
    currentEmotion === 'tired' ||
    currentEmotion === 'stressed' ||
    currentEmotion === 'anxious'

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-8"
    >
      {/* Welcome Hero */}
      <WelcomeCard firstName={currentUser.firstName} />

      {showRecommendation && currentEmotion && <WellbeingRecommendationCard emotion={currentEmotion} />}

      {showAchievementsFirst && <AchievementsCard />}

      {/* Row 1: Timetable | Homework | Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TimetableCard />
        <HomeworkCard />
        <div className="space-y-4">
          {showAssignmentsFirst ? (
            <>
              <AssignmentsCard />
              <QuickActionsCard />
            </>
          ) : (
            <>
              <QuickActionsCard />
              <AssignmentsCard />
            </>
          )}
        </div>
      </div>

      {/* Row 2: Attendance | Grades */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AttendanceCard />
        <div className="lg:col-span-2">
          <GradesCard />
        </div>
      </div>

      {/* Row 3: Achievements */}
      {!showAchievementsFirst && <AchievementsCard />}

      {/* Row 4: Leaderboard | Calendar | Notifications */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LeaderboardCard fullName={currentUser.fullName} avatar={currentUser.avatar} />
        <CalendarCard />
        <NotificationsCard />
      </div>

      {/* Row 5: AI Tutor | Study Planner */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AITutorCard />
        <StudyPlannerCard />
      </div>

      {/* Row 6: Career Suggestions | Mental Health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CareerCard firstName={currentUser.firstName} />
        <MentalHealthCard />
      </div>

      {/* Row 7: Assessments */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AssessmentCard
          title="Personality Assessment"
          emoji="🧠"
          description="Discover your learning style, strengths, and personality traits through a fun interactive test."
          buttonLabel="Start Assessment"
          path="/student/personality-assessment"
          color="#9333ea"
        />
        <AssessmentCard
          title="Subject Assessment"
          emoji="🔬"
          description="Test your knowledge in any subject and get instant feedback to improve your understanding."
          buttonLabel="Start Assessment"
          path="/student/subject-assessment"
          color="#14b8a6"
        />
      </div>

      {/* Study streak footer banner */}
      <motion.div
        variants={item}
        className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-white shadow-lg shadow-orange-500/20"
      >
        <Flame className="h-5 w-5" />
        <span className="font-semibold">
          You're on a {STUDENT_INFO.studyStreak}-day study streak, {currentUser.firstName}! Keep it up! 🚀
        </span>
        <Trophy className="h-5 w-5" />
        <CheckCircle2 className="h-5 w-5" />
      </motion.div>
    </motion.div>
  )
}
