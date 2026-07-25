import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Brain, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface Question {
  id: string
  question: string
  options: string[]
  answer: number
}

const QUESTIONS: Question[] = [
  { id: 'q1', question: 'When you learn best, you prefer to:', options: ['Read books and notes', 'Listen to explanations', 'Draw diagrams and pictures', 'Do hands-on activities'], answer: 0 },
  { id: 'q2', question: 'In a group project, you usually:', options: ['Take charge and organise', 'Support and encourage others', 'Come up with creative ideas', 'Research and analyse data'], answer: 1 },
  { id: 'q3', question: 'Your favourite free-time activity is:', options: ['Reading', 'Playing music or art', 'Sports or building things', 'Playing games or puzzles'], answer: 0 },
  { id: 'q4', question: 'When solving a problem, you:', options: ['Follow a step-by-step plan', 'Trust your instincts first', 'Try multiple approaches', 'Ask for help from others'], answer: 2 },
  { id: 'q5', question: 'You feel most proud when:', options: ['You understand a hard concept', 'You help a friend succeed', 'You create something new', 'You win a competition'], answer: 0 },
]

const PERSONALITY_RESULTS: Record<string, { type: string; emoji: string; desc: string; traits: string[]; color: string }> = {
  visual: {
    type: 'Visual Thinker',
    emoji: '👁️',
    desc: 'You learn best through images, diagrams, and visual representations. You have a great ability to see patterns and spatial relationships.',
    traits: ['Creative', 'Detail-oriented', 'Good at art & design', 'Thinks in pictures'],
    color: '#9333ea',
  },
  logical: {
    type: 'Logical Learner',
    emoji: '🧠',
    desc: 'You excel at reasoning and problem-solving. You love maths, science, and finding patterns in data.',
    traits: ['Analytical', 'Systematic', 'Great at Maths & Science', 'Strategic thinker'],
    color: '#6366f1',
  },
  social: {
    type: 'Social Learner',
    emoji: '🤝',
    desc: 'You learn best in groups and through collaboration. You are empathetic and a natural communicator.',
    traits: ['Empathetic', 'Good communicator', 'Team player', 'Leadership skills'],
    color: '#ec4899',
  },
  kinesthetic: {
    type: 'Hands-on Learner',
    emoji: '🛠️',
    desc: 'You learn best by doing. You are energetic, practical, and love experiments and real-world applications.',
    traits: ['Practical', 'Energetic', 'Loves experiments', 'Problem solver'],
    color: '#f97316',
  },
}

export default function PersonalityAssessment() {
  const { user } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'student')
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<string | null>(null)

  const selectAnswer = (idx: number) => {
    const newAnswers = [...answers, idx]
    if (current + 1 < QUESTIONS.length) {
      setAnswers(newAnswers)
      setCurrent((c) => c + 1)
    } else {
      // Determine personality based on answers
      const counts: Record<string, number> = { visual: 0, logical: 0, social: 0, kinesthetic: 0 }
      newAnswers.forEach((a) => {
        if (a === 2) counts.visual++
        else if (a === 0) counts.logical++
        else if (a === 1) counts.social++
        else counts.kinesthetic++
      })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      setResult(top)
    }
  }

  if (result) {
    const r = PERSONALITY_RESULTS[result]
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
        <motion.div variants={item} className="text-center">
          <span className="text-6xl">{r.emoji}</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">You're a {r.type}!</h1>
          <p className="mt-2 text-gray-500">
            Great work completing the assessment, {currentUser.firstName}!
          </p>
        </motion.div>
        <motion.div
          variants={item}
          className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}bb)` }}
        >
          <h2 className="text-lg font-bold">{r.type}</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-90">{r.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.traits.map((t) => (
              <span key={t} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{t}</span>
            ))}
          </div>
        </motion.div>
        <motion.div variants={item} className="flex justify-center">
          <button
            type="button"
            onClick={() => { setStarted(false); setCurrent(0); setAnswers([]); setResult(null) }}
            className="rounded-xl bg-purple-600 px-6 py-2.5 font-semibold text-white transition hover:bg-purple-700"
          >
            Retake Assessment
          </button>
        </motion.div>
      </motion.div>
    )
  }

  if (!started) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
        <motion.div variants={item} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personality Assessment</h1>
            <p className="text-sm text-gray-500">Discover your learning style</p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-8 text-white shadow-lg"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <span className="text-5xl">🧠</span>
          <h2 className="mt-4 text-2xl font-bold">Know Yourself Better</h2>
          <p className="mt-2 text-purple-200">
            Answer {QUESTIONS.length} quick questions to discover your unique learning style and personality traits. It takes less than 2 minutes!
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {['Discover your learning style', 'Understand your strengths', 'Get personalised study tips'].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" /> {b}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-6 rounded-xl bg-white px-6 py-2.5 font-bold text-purple-700 transition hover:bg-purple-50"
          >
            Start Assessment →
          </button>
        </motion.div>
      </motion.div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personality Assessment</h1>
        <span className="text-sm text-gray-500">Question {current + 1} of {QUESTIONS.length}</span>
      </motion.div>

      {/* Progress */}
      <motion.div variants={item} className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="h-full rounded-full bg-purple-600"
          animate={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <p className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectAnswer(i)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-medium transition-all',
                'border-gray-100 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700',
                'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-purple-500/10',
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
