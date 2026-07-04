import type { ReactNode } from 'react'

import { cn } from '../../utils/helpers'

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  secondary: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  variant = 'primary',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

