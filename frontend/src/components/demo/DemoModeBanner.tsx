import { useNavigate } from 'react-router-dom'
import { LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { DEMO_PERSONAS, type DemoPersonaKey } from '../../data/demoUsers'

export default function DemoModeBanner() {
  const { isDemoMode, demoPersonaKey, loginDemo, logout } = useAuth()
  const navigate = useNavigate()

  if (!isDemoMode) return null

  const currentPersona = DEMO_PERSONAS.find((persona) => persona.key === demoPersonaKey)

  const handleSwitch = (key: DemoPersonaKey) => {
    if (key === demoPersonaKey) return
    const persona = DEMO_PERSONAS.find((candidate) => candidate.key === key)
    if (!persona) return
    loginDemo(key)
    navigate(persona.initialPath)
  }

  const handleExit = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>
          Demo Mode — viewing sample data as{' '}
          <span className="font-semibold">{currentPersona?.label ?? 'Guest'}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="demo-role-switcher">
          Switch demo role
        </label>
        <select
          id="demo-role-switcher"
          value={demoPersonaKey ?? ''}
          onChange={(event) => handleSwitch(event.target.value as DemoPersonaKey)}
          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-900 outline-none transition focus:ring-2 focus:ring-amber-400 dark:border-amber-500/40 dark:bg-gray-900 dark:text-amber-300"
        >
          {DEMO_PERSONAS.map((persona) => (
            <option key={persona.key} value={persona.key}>
              {persona.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Exit Demo
        </button>
      </div>
    </div>
  )
}
