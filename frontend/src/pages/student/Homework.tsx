import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CheckCircle2, FileText, Filter, Search, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { ProgressBar } from '../../components/common/ProgressBar'
import { Modal } from '../../components/common/Modal'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { HOMEWORK, type HomeworkPriority } from '../../data/studentData'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import { getGenericDemoResponse } from '../../utils/demoAiResponses'
import { aiApi } from '../../services/aiApi'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const priorityStyles: Record<HomeworkPriority, string> = {
  high:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  low:    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
}

type FilterType = 'all' | HomeworkPriority

export default function Homework() {
  const { user, isDemoMode } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'student')
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [helpFor, setHelpFor] = useState<{ id: string; title: string; subject: string } | null>(null)

  const filtered = HOMEWORK.filter((hw) => {
    const matchesPriority = filter === 'all' || hw.priority === filter
    const matchesSearch = hw.subject.toLowerCase().includes(search.toLowerCase()) || hw.title.toLowerCase().includes(search.toLowerCase())
    return matchesPriority && matchesSearch
  })

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Homework</h1>
          <p className="text-sm text-gray-500">{HOMEWORK.filter((h) => h.completion < 100).length} items pending</p>
        </div>
      </motion.div>

      {/* Search + filter */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Search homework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {(['all', 'high', 'medium', 'low'] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hw, i) => (
          <motion.div
            key={hw.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold"
                style={{ backgroundColor: hw.color }}
              >
                {hw.subject.slice(0, 2).toUpperCase()}
              </div>
              <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', priorityStyles[hw.priority])}>
                {hw.priority}
              </span>
            </div>

            <p className="font-semibold text-gray-900 dark:text-white">{hw.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{hw.subject}</p>
            <p className="mt-1 text-xs text-gray-400">Due: {fmt(hw.deadline)}</p>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Completion</span>
                <span className="font-semibold">{hw.completion}%</span>
              </div>
              <ProgressBar value={hw.completion} color={hw.color} size="sm" delay={0.1 * i} />
            </div>

            {hw.completion === 100 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Completed!
              </div>
            )}

            <button
              type="button"
              onClick={() => setHelpFor({ id: hw.id, title: hw.title, subject: hw.subject })}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI for Help
            </button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div variants={item} className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🎉</span>
          <p className="font-semibold text-gray-700 dark:text-gray-300">No homework found</p>
          <p className="text-sm text-gray-500">Try changing your filter or search term</p>
        </motion.div>
      )}

      <Modal isOpen={helpFor !== null} onClose={() => setHelpFor(null)} title={helpFor ? `Homework Help — ${helpFor.title}` : undefined} size="lg">
        {helpFor && (
          <AIChatPanel
            heightClassName="h-[60vh]"
            title="Homework Assistant"
            subtitle={`${helpFor.subject} · paste your question or ask for a hint`}
            welcomeMessage={`Hi ${currentUser.firstName}! Paste your homework question for "${helpFor.title}" and I'll help you work through it — I'll give hints and explanations, not the final answer, unless you ask for it directly.`}
            placeholder="Paste your question or ask for a hint…"
            userAvatarLabel={currentUser.avatar}
            onSend={async (text, conversationId) => {
              if (isDemoMode) {
                await new Promise((resolve) => setTimeout(resolve, 700))
                return { content: getGenericDemoResponse('homework', text) }
              }
              const result = await aiApi.homeworkChat(text, conversationId, 'student')
              return { content: result.message.content, conversationId: result.conversation.id }
            }}
          />
        )}
      </Modal>
    </motion.div>
  )
}
