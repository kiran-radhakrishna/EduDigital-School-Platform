import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Heart, Smile } from 'lucide-react'
import clsx from 'clsx'
import { MOTIVATIONAL_QUOTES } from '../../data/studentData'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

type Mood = 'happy' | 'okay' | 'stressed' | 'excited' | 'tired'

const MOODS: Array<{ key: Mood; emoji: string; label: string; color: string; bg: string; message: string }> = [
  { key: 'happy',   emoji: '😊', label: 'Happy',   color: '#22c55e', bg: 'bg-green-50 dark:bg-green-500/10',   message: "That's wonderful! Keep up the great energy and spread some positivity! 🌟" },
  { key: 'excited', emoji: '🤩', label: 'Excited',  color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10',  message: "Love the excitement! Channel that energy into your studies today! ⚡" },
  { key: 'okay',    emoji: '😐', label: 'Okay',    color: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-500/10', message: "That's perfectly fine! Take it one step at a time. You've got this! 💪" },
  { key: 'tired',   emoji: '😴', label: 'Tired',   color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-500/10', message: "Rest is important! Try the breathing exercise below and take short breaks while studying. 🌙" },
  { key: 'stressed',emoji: '😟', label: 'Stressed', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10',      message: "It's okay to feel stressed sometimes. Try the breathing exercise and remember — you can do this! 🫂" },
]

const BREATHING_STEPS = [
  { label: 'Breathe In',  duration: 4, color: '#6366f1' },
  { label: 'Hold',        duration: 4, color: '#9333ea' },
  { label: 'Breathe Out', duration: 4, color: '#ec4899' },
  { label: 'Rest',        duration: 2, color: '#14b8a6' },
]

const TIPS = [
  { emoji: '📚', tip: 'Break study sessions into 25-minute Pomodoro chunks with 5-min breaks.' },
  { emoji: '🌿', tip: 'Take a short walk outside to refresh your mind between subjects.' },
  { emoji: '💧', tip: 'Stay hydrated — drink water throughout the day to stay focused.' },
  { emoji: '🎵', tip: 'Listen to calm music while studying to improve concentration.' },
  { emoji: '😴', tip: 'Get 9–11 hours of sleep every night for the best memory retention.' },
  { emoji: '🤸', tip: 'Stretch for 5 minutes between study sessions to reduce tension.' },
]

export default function MentalHealth() {
  const [mood, setMood] = useState<Mood | null>(null)
  const [breathing, setBreathing] = useState(false)
  const [breathStep, setBreathStep] = useState(0)

  const selectedMood = MOODS.find((m) => m.key === mood)
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Date.now() / 1000) % MOTIVATIONAL_QUOTES.length]

  const startBreathing = () => {
    setBreathing(true)
    setBreathStep(0)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mental Health</h1>
          <p className="text-sm text-gray-500">Take care of your wellbeing, Emma 💖</p>
        </div>
      </motion.div>

      {/* Mood check */}
      <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">How are you feeling today?</h2>
        <div className="flex flex-wrap gap-3">
          {MOODS.map(({ key, emoji, label, color, bg }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMood(key)}
              className={clsx(
                'flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all ring-2',
                mood === key
                  ? `ring-offset-2 ${bg}`
                  : 'bg-gray-50 ring-transparent hover:bg-gray-100 dark:bg-gray-800',
              )}
              style={{ ringColor: mood === key ? color : undefined }}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx('mt-4 rounded-xl p-4', selectedMood.bg)}
          >
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedMood.message}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Breathing exercise */}
      <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Smile className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Breathing Exercise</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Take a moment to breathe deeply. This simple exercise reduces stress and helps you focus.
        </p>

        {!breathing ? (
          <button
            type="button"
            onClick={startBreathing}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Start Breathing Exercise 🫁
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Animated circle */}
            <div className="relative flex h-40 w-40 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-500/20"
                animate={{
                  scale: [1, 1.25, 1.25, 1, 1],
                  opacity: [0.6, 1, 1, 0.6, 0.6],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative text-center">
                <p className="text-4xl">🫁</p>
                <motion.p
                  className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {BREATHING_STEPS[breathStep % BREATHING_STEPS.length].label}
                </motion.p>
              </div>
            </div>

            <div className="flex gap-2">
              {BREATHING_STEPS.map((s, i) => (
                <div key={s.label} className={clsx('flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-center', i === breathStep % BREATHING_STEPS.length ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-gray-50 dark:bg-gray-800')}>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</p>
                  <p className="text-[10px] text-gray-400">{s.duration}s</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBreathing(false)}
              className="rounded-xl border border-gray-200 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
            >
              Stop Exercise
            </button>
          </div>
        )}
      </motion.div>

      {/* Motivational quote */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-3xl mb-4">✨</p>
        <p className="text-lg font-bold italic leading-relaxed">"{quote.quote}"</p>
        <p className="mt-3 text-pink-200 font-semibold">— {quote.author}</p>
      </motion.div>

      {/* Wellness tips */}
      <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Wellness Tips for Students</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map(({ emoji, tip }) => (
            <div key={tip} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <span className="text-xl">{emoji}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
