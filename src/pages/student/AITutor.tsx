import { useState, useRef, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Bot, Send, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { AI_TUTOR_QUESTIONS, STUDENT_INFO } from '../../data/studentData'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
}

const QUICK_RESPONSES: Record<string, string> = {
  default: "That's a great question! Let me help you with that. In your studies at DIS, it's important to understand the fundamentals. Would you like me to explain this step by step?",
  'fractions': "Fractions are easy when you think of pizza! 🍕 If you have 1/2 of a pizza, that means one piece out of two equal pieces. Let's practise: what is 1/2 + 1/4? Remember to find a common denominator!",
  'photosynthesis': "Photosynthesis is how plants make their own food! 🌿 Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. The formula is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Cool, right?",
  'german': "Guten Tag, Emma! 🇩🇪 Let's practise German Artikel. In German, every noun has a gender: der (masculine), die (feminine), das (neuter). For example: der Hund (the dog), die Katze (the cat), das Buch (the book). Try one!",
  'multiplication': "Let's quiz you! 🔢 What is 7 × 8? Take your time... The answer is 56! A trick: 7 × 8 = 56, remember '5, 6, 7, 8' – five-six-seven-eight! Ready for another one?",
  'solar system': "Our solar system has 8 planets! 🪐 In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Remember this with: 'My Very Educated Mother Just Served Us Noodles'!",
}

function getAIResponse(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('fraction')) return QUICK_RESPONSES.fractions
  if (lower.includes('photo')) return QUICK_RESPONSES.photosynthesis
  if (lower.includes('german') || lower.includes('artikel')) return QUICK_RESPONSES.german
  if (lower.includes('multipl') || lower.includes('times table')) return QUICK_RESPONSES.multiplication
  if (lower.includes('solar') || lower.includes('planet')) return QUICK_RESPONSES['solar system']
  return QUICK_RESPONSES.default
}

export default function AITutor() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', text: `Hello ${STUDENT_INFO.firstName}! 👋 I'm your AI Tutor. I'm here to help you with any subject – Maths, English, German, Science, and more. What would you like to learn today?` },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: getAIResponse(text) }
    setMessages((prev) => [...prev, aiMsg])
    setLoading(false)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex h-[calc(100vh-10rem)] flex-col gap-4 pb-4">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Tutor</h1>
          <p className="text-sm text-gray-500">Powered by EduDigital AI · Always here to help</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Online
        </div>
      </motion.div>

      {/* Suggested questions */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {AI_TUTOR_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
          >
            <Sparkles className="h-3 w-3" />
            {q}
          </button>
        ))}
      </motion.div>

      {/* Chat window */}
      <motion.div
        variants={item}
        className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                  msg.role === 'ai' ? 'bg-blue-600' : 'bg-purple-600',
                )}
              >
                {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : 'E'}
              </div>
              <div
                className={clsx(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'ai'
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'bg-purple-600 text-white',
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </motion.div>

      {/* Input */}
      <motion.div variants={item} className="flex gap-3">
        <input
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
        />
        <button
          type="button"
          disabled={!input.trim() || loading}
          onClick={() => send(input)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </motion.div>
    </motion.div>
  )
}
