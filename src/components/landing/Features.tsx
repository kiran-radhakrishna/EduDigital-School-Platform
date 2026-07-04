import { motion } from 'framer-motion'
import {
  BarChart3,
  CalendarCheck,
  Clock,
  GraduationCap,
  Laptop,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

const icons: LucideIcon[] = [Laptop, CalendarCheck, GraduationCap, Users, Clock, BarChart3]

const iconColors = [
  'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t.features.title}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {t.features.items.map((item, index) => {
            const Icon = icons[index] ?? GraduationCap
            const iconColor = iconColors[index] ?? iconColors[0]

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
