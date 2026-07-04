import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ProgressBarProps {
  value: number
  color?: string
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  className?: string
  delay?: number
}

export function ProgressBar({
  value,
  color = '#9333ea',
  size = 'sm',
  showLabel = false,
  className,
  delay = 0.2,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  const heights: Record<NonNullable<ProgressBarProps['size']>, string> = {
    xs: 'h-1.5',
    sm: 'h-2.5',
    md: 'h-4',
  }

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-end">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{clamped}%</span>
        </div>
      )}
      <div className={clsx('w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800', heights[size])}>
        <motion.div
          className={clsx('rounded-full', heights[size])}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}
