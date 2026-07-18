interface PortfolioStatCardProps {
  label: string
  value: string | number
}

export function PortfolioStatCard({ label, value }: PortfolioStatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}
