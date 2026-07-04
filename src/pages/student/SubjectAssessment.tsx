import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import clsx from 'clsx'
import { GRADES } from '../../data/studentData'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface QuizQuestion { q: string; options: string[]; correct: number }

const QUIZZES: Record<string, QuizQuestion[]> = {
  Mathematics: [
    { q: 'What is 7 × 8?',              options: ['54', '56', '48', '63'],               correct: 1 },
    { q: 'What is 1/2 + 1/4?',          options: ['1/6', '3/4', '2/6', '1/3'],           correct: 1 },
    { q: 'What is the area of a square with side 5?', options: ['10', '20', '25', '15'], correct: 2 },
  ],
  English: [
    { q: 'Which is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Tired', 'Angry'],        correct: 1 },
    { q: 'Which sentence is correct?',      options: ['She goed to school.', 'She went to school.', 'She go to school.', 'She goes to school yesterday.'], correct: 1 },
    { q: '"Huge" is an antonym of:',         options: ['Big', 'Large', 'Tiny', 'Great'],           correct: 2 },
  ],
  Science: [
    { q: 'What do plants need for photosynthesis?', options: ['Water only', 'Sunlight & CO₂ & Water', 'Soil only', 'Oxygen'], correct: 1 },
    { q: 'How many bones does an adult human have?', options: ['196', '206', '216', '226'],        correct: 1 },
    { q: 'What planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'],     correct: 2 },
  ],
  German: [
    { q: 'What is "der Hund" in English?',   options: ['The cat', 'The dog', 'The bird', 'The fish'], correct: 1 },
    { q: 'Which is correct: "Ich ___ müde."', options: ['bin', 'bist', 'ist', 'sind'],              correct: 0 },
    { q: '"Das Buch" means:',               options: ['The table', 'The chair', 'The book', 'The window'], correct: 2 },
  ],
}

type Phase = 'select' | 'quiz' | 'result'

export default function SubjectAssessment() {
  const [phase, setPhase] = useState<Phase>('select')
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [current, setCurrent] = useState(0)

  const startQuiz = (subject: string) => {
    setSelected(subject)
    setAnswers([])
    setCurrent(0)
    setPhase('quiz')
  }

  const answer = (idx: number) => {
    const newAnswers = [...answers, idx]
    const questions = QUIZZES[selected!]
    if (current + 1 < questions.length) {
      setAnswers(newAnswers)
      setCurrent((c) => c + 1)
    } else {
      setAnswers(newAnswers)
      setPhase('result')
    }
  }

  const restart = () => { setPhase('select'); setSelected(null); setAnswers([]); setCurrent(0) }

  if (phase === 'result' && selected) {
    const questions = QUIZZES[selected]
    const score = answers.filter((a, i) => a === questions[i].correct).length
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : 'D'

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
        <motion.div variants={item} className="text-center">
          <span className="text-6xl">{emoji}</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Quiz Complete!</h1>
          <p className="mt-1 text-gray-500">{selected} Assessment</p>
        </motion.div>

        <motion.div variants={item} className="rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-6 text-center text-white">
          <p className="text-5xl font-black">{score}/{questions.length}</p>
          <p className="mt-1 text-purple-200">{pct}% · Grade {grade}</p>
          <div className="mx-auto mt-4 h-3 w-48 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Answer Review</h2>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className={clsx('rounded-xl p-3', answers[i] === q.correct ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10')}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{i + 1}. {q.q}</p>
                <p className={clsx('mt-1 text-xs', answers[i] === q.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>
                  {answers[i] === q.correct ? '✓ Correct' : `✗ Your answer: ${q.options[answers[i] as number]} · Correct: ${q.options[q.correct]}`}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="flex justify-center gap-3">
          <button type="button" onClick={() => startQuiz(selected)} className="rounded-xl border border-purple-200 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-400">
            Retry Quiz
          </button>
          <button type="button" onClick={restart} className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
            Choose Subject
          </button>
        </motion.div>
      </motion.div>
    )
  }

  if (phase === 'quiz' && selected) {
    const questions = QUIZZES[selected]
    const q = questions[current]
    const grade = GRADES.find((g) => g.subject === selected)

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selected} Quiz</h1>
          <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
        </motion.div>

        <motion.div variants={item} className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: grade?.color ?? '#9333ea', width: `${(current / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </motion.div>

        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <p className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{q.q}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => answer(i)}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-left text-sm font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subject Assessment</h1>
          <p className="text-sm text-gray-500">Test your knowledge in any subject</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white shadow-lg">
        <FlaskConical className="h-8 w-8 opacity-80" />
        <h2 className="mt-3 text-xl font-bold">Choose a Subject</h2>
        <p className="mt-1 text-teal-100 text-sm">Select a subject below to start a 3-question quiz and test your knowledge!</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.keys(QUIZZES).map((subject) => {
          const grade = GRADES.find((g) => g.subject === subject)
          return (
            <motion.button
              key={subject}
              variants={item}
              whileHover={{ scale: 1.02 }}
              type="button"
              onClick={() => startQuiz(subject)}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold" style={{ backgroundColor: grade?.color ?? '#9333ea' }}>
                {subject.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{subject}</p>
                <p className="text-xs text-gray-500">3 questions · ~2 min</p>
                {grade && <p className="mt-0.5 text-xs font-semibold" style={{ color: grade.color }}>Current grade: {grade.grade} ({grade.score}%)</p>}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
