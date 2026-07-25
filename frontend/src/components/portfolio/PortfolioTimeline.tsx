import type { PortfolioTimelineItem } from '../../types/portfolio'

interface PortfolioTimelineProps {
  items: PortfolioTimelineItem[]
}

export function PortfolioTimeline({ items }: PortfolioTimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="relative pl-6">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <span className="absolute left-[4px] top-4 h-full w-px bg-indigo-200 dark:bg-indigo-500/30" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(item.date).toLocaleDateString()}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
