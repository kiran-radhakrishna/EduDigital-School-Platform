import { useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Bot, Send, Sparkles, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
}

export interface AIChatPanelProps {
  icon?: LucideIcon
  title: string
  subtitle: string
  welcomeMessage: string
  placeholder?: string
  suggestedPrompts?: readonly string[]
  userAvatarLabel: string
  /** Resolve one turn: given the user's text and the current conversation id (if any), return the assistant's reply and the conversation id to continue with next time. */
  onSend: (text: string, conversationId: string | undefined) => Promise<{ content: string; conversationId?: string }>
  /** Overrides the panel's outer height — the default assumes a full dashboard page; pass e.g. "h-[60vh]" inside a Modal. */
  heightClassName?: string
}

/** Generalized version of the AI Tutor's original chat UI, reused across every Phase 7B AI feature. */
export default function AIChatPanel({
  icon: Icon = Bot,
  title,
  subtitle,
  welcomeMessage,
  placeholder = 'Ask me anything…',
  suggestedPrompts = [] as readonly string[],
  userAvatarLabel,
  onSend,
  heightClassName = 'h-[calc(100vh-10rem)]',
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'ai', text: welcomeMessage }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageIdRef = useRef(0)

  const nextMessageId = () => {
    messageIdRef.current += 1
    return `msg-${messageIdRef.current}`
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages((prev) => [...prev, { id: nextMessageId(), role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const result = await onSend(text, conversationIdRef.current)
      conversationIdRef.current = result.conversationId ?? conversationIdRef.current
      setMessages((prev) => [...prev, { id: nextMessageId(), role: 'ai', text: result.content }])
    } catch {
      toast.error('The AI assistant is unavailable right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={clsx('flex flex-col gap-4 pb-4', heightClassName)}>
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Online
        </div>
      </motion.div>

      {suggestedPrompts.length > 0 && (
        <motion.div variants={item} className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => send(prompt)}
              className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
            >
              <Sparkles className="h-3 w-3" />
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        variants={item}
        className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                  msg.role === 'ai' ? 'bg-blue-600' : 'bg-purple-600',
                )}
              >
                {msg.role === 'ai' ? <Icon className="h-4 w-4" /> : userAvatarLabel}
              </div>
              <div
                className={clsx(
                  'max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'ai' ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'bg-purple-600 text-white',
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <Icon className="h-4 w-4 text-white" />
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

      <motion.div variants={item} className="flex gap-3">
        <input
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder={placeholder}
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
