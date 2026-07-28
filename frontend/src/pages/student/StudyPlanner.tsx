import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { BookMarked, CheckCircle2, Circle, Flame, Plus, RefreshCw, Sparkles, Target } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { ProgressBar } from '../../components/common/ProgressBar'
import { STUDY_PLAN } from '../../data/studentData'
import { useAuth } from '../../hooks/useAuth'
import { aiApi, type StudyPlan as AIStudyPlan } from '../../services/aiApi'
import { getDemoStudyPlan } from '../../utils/demoAiResponses'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface Task {
  id: string
  text: string
  subject: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
}

const INIT_TASKS: Task[] = [
  { id: 't1', text: 'Complete Math multiplication table worksheet', subject: 'Mathematics', done: true,  priority: 'high' },
  { id: 't2', text: 'Read Chapter 5 of Charlotte\'s Web',           subject: 'English',     done: false, priority: 'medium' },
  { id: 't3', text: 'Review German Artikel notes',                  subject: 'German',      done: false, priority: 'high' },
  { id: 't4', text: 'Label plant cell diagram',                     subject: 'Science',     done: false, priority: 'low' },
  { id: 't5', text: 'Practise times tables 6–12',                   subject: 'Mathematics', done: true,  priority: 'medium' },
]

const WEEKLY_PLAN = [
  { day: 'Mon', subject: 'Mathematics', task: 'Chapter 7 exercises', done: true },
  { day: 'Tue', subject: 'English',     task: 'Reading + vocabulary',  done: true },
  { day: 'Wed', subject: 'German',      task: 'Grammar practice',      done: true },
  { day: 'Thu', subject: 'Science',     task: 'Lab report notes',      done: false },
  { day: 'Fri', subject: 'Revision',    task: 'All subjects review',   done: false },
]

const priorityColor: Record<string, string> = {
  high:   'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
  medium: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
  low:    'text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400',
}

export default function StudyPlanner() {
  const { isDemoMode } = useAuth()
  const [tasks, setTasks] = useState(INIT_TASKS)
  const [aiPlan, setAiPlan] = useState<AIStudyPlan | null>(null)
  const [demoPlanText, setDemoPlanText] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    aiApi
      .listStudyPlans()
      .then((plans) => {
        if (!cancelled && plans.length > 0) setAiPlan(plans[0])
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your saved study plan.')
      })
    return () => {
      cancelled = true
    }
  }, [isDemoMode])

  const generatePlan = async () => {
    setGenerating(true)
    try {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 900))
        setDemoPlanText(getDemoStudyPlan())
      } else {
        const result = await aiApi.generateStudyPlan()
        setAiPlan(result.plan)
      }
    } catch {
      toast.error('Could not generate a study plan right now. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const planText = isDemoMode ? demoPlanText : aiPlan?.content ?? null

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const completed = tasks.filter((t) => t.done).length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
          <BookMarked className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          <p className="text-sm text-gray-500">Plan your study sessions and track daily goals</p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 dark:bg-orange-500/20">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            {STUDY_PLAN.studyStreak} day streak
          </span>
        </div>
      </motion.div>

      {/* AI-generated plan */}
      <motion.div
        variants={item}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">AI-Generated Plan</h2>
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={generatePlan}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', generating && 'animate-spin')} />
            {planText ? 'Regenerate' : 'Generate with AI'}
          </button>
        </div>
        {planText ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">{planText}</p>
        ) : (
          <p className="text-sm text-gray-500">
            Generate a personalized plan based on your attendance, grades, assignments, and timetable.
          </p>
        )}
      </motion.div>

      {/* Progress cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Today's Progress",  value: STUDY_PLAN.todayProgress,  color: '#f97316', desc: STUDY_PLAN.todayGoal },
          { label: "Weekly Progress",   value: STUDY_PLAN.weeklyProgress,  color: '#9333ea', desc: STUDY_PLAN.weeklyGoal },
          { label: "Tasks Completed",   value: Math.round((completed / tasks.length) * 100), color: '#22c55e', desc: `${completed} of ${tasks.length} tasks done` },
        ].map(({ label, value, color, desc }) => (
          <motion.div
            key={label}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
              <span className="text-lg font-bold" style={{ color }}>{value}%</span>
            </div>
            <ProgressBar value={value} color={color} />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's tasks */}
      <motion.div
        variants={item}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{completed}/{tasks.length} done</span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <motion.button
              key={task.id}
              type="button"
              whileHover={{ x: 2 }}
              onClick={() => toggle(task.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                task.done ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              )}
            >
              {task.done
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                : <Circle className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
              }
              <div className="min-w-0 flex-1">
                <p className={clsx('text-sm font-medium', task.done ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white')}>
                  {task.text}
                </p>
                <p className="text-xs text-gray-500">{task.subject}</p>
              </div>
              <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', priorityColor[task.priority])}>
                {task.priority}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Weekly plan */}
      <motion.div
        variants={item}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">This Week's Plan</h2>
        </div>
        <div className="space-y-3">
          {WEEKLY_PLAN.map((day) => (
            <div key={day.day} className="flex items-center gap-4">
              <div className={clsx(
                'flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold',
                day.done ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800',
              )}>
                {day.day}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{day.subject}</p>
                <p className="text-xs text-gray-500">{day.task}</p>
              </div>
              {day.done
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                : <Circle className="h-5 w-5 shrink-0 text-gray-300" />
              }
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
