import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Landmark, ShieldCheck, Sparkles, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { DEMO_PERSONAS, type DemoPersonaKey } from '../../data/demoUsers'

const PERSONA_ICONS: Record<DemoPersonaKey, LucideIcon> = {
  student: GraduationCap,
  teacher: BookOpen,
  parent: Users,
  authority: Landmark,
  administrator: ShieldCheck,
}

export default function TryDemoSection() {
  const navigate = useNavigate()
  const { loginDemo } = useAuth()

  const handleTryDemo = (key: DemoPersonaKey) => {
    const persona = DEMO_PERSONAS.find((candidate) => candidate.key === key)
    if (!persona) return
    loginDemo(key)
    navigate(persona.initialPath)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="mt-6 rounded-3xl border border-dashed border-indigo-200 bg-white/70 p-6 backdrop-blur dark:border-indigo-500/30 dark:bg-gray-900/70"
    >
      <div className="mb-1 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Try Demo Mode</h2>
      </div>
      <p className="mb-4 text-center text-xs text-gray-500 dark:text-gray-400">
        No account needed — instantly explore EduDigital with realistic sample data.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DEMO_PERSONAS.map((persona) => {
          const Icon = PERSONA_ICONS[persona.key]

          return (
            <button
              key={persona.key}
              type="button"
              onClick={() => handleTryDemo(persona.key)}
              title={persona.description}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-medium text-gray-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            >
              <Icon className="h-5 w-5" />
              <span>{persona.label}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
