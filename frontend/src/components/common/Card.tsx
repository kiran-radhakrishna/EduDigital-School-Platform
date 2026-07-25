import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../utils/helpers'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  title?: string
  subtitle?: string
  footer?: ReactNode
  hover?: boolean
  children: ReactNode
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
  elevated: 'bg-white shadow-lg dark:bg-gray-800',
  outlined: 'border-2 border-gray-200 bg-transparent dark:border-gray-700',
}

export function Card({
  variant = 'default',
  title,
  subtitle,
  footer,
  hover = false,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        variantClasses[variant],
        hover && 'transform transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {title || subtitle ? (
        <div className="mb-4">
          {title ? <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3> : null}
          {subtitle ? (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {children}

      {footer ? (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">{footer}</div>
      ) : null}
    </div>
  )
}

