import type { ReactNode } from 'react'

interface EventSectionProps {
  title: string
  subtitle?: string
  rightAction?: ReactNode
  children: ReactNode
}

export function EventSection({ title, subtitle, rightAction, children }: EventSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
        </div>
        {rightAction}
      </div>
      {children}
    </section>
  )
}
