import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, Building2, Globe, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

function Counter({ target, suffix }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let frameId = 0
    let startTime: number | null = null
    const duration = 1500

    const updateCount = (timestamp: number) => {
      if (startTime === null) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.round(progress * target))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(updateCount)
      }
    }

    frameId = window.requestAnimationFrame(updateCount)

    return () => window.cancelAnimationFrame(frameId)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

interface StatItem {
  label: string
  target: number
  suffix?: string
  icon: LucideIcon
}

export default function Statistics() {
  const { t } = useLanguage()

  const stats: StatItem[] = [
    { label: t.stats.students, target: 12000, suffix: '+', icon: Users },
    { label: t.stats.teachers, target: 850, suffix: '+', icon: Award },
    { label: t.stats.schools, target: 500, suffix: '+', icon: Building2 },
    { label: t.stats.countries, target: 24, icon: Globe },
  ]

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 py-20 dark:from-indigo-900 dark:to-purple-950"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_45%)]" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6 text-center relative z-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
            >
              <Icon className="mx-auto mb-3 h-8 w-8 text-white/80" />
              <div className="mb-2 text-4xl font-extrabold text-white md:text-5xl">
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium text-indigo-100 dark:text-indigo-200">
                {stat.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
