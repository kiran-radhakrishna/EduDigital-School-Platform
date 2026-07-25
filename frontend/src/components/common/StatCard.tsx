import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '../../utils/helpers'

export interface StatCardProps {
  icon: ReactNode
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  iconColor?: string
  className?: string
}

export function StatCard({
  icon,
  title,
  value,
  change,
  trend,
  iconColor = 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  className,
}: StatCardProps) {
  const effectiveTrend = trend ?? (typeof change === 'number' && change < 0 ? 'down' : 'up')
  const TrendIcon = effectiveTrend === 'up' ? TrendingUp : TrendingDown
  const trendClasses =
    effectiveTrend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconColor)}>{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>

      {typeof change === 'number' ? (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={cn('inline-flex items-center gap-1 font-medium', trendClasses)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {Math.abs(change)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      ) : null}
    </motion.div>
  )
}
