import type { ReactNode } from 'react'

interface PortfolioSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function PortfolioSection({ title, subtitle, children }: PortfolioSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <header>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}
