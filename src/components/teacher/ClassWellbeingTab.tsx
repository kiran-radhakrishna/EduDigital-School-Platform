import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { AlertCircle } from 'lucide-react'
import type { WellbeingAnonymousData } from '../../types/teacher'

interface ClassWellbeingTabProps {
  wellbeingData: WellbeingAnonymousData | undefined
}

export function ClassWellbeingTab({ wellbeingData }: ClassWellbeingTabProps) {
  if (!wellbeingData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">No wellbeing data available</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Happy', value: wellbeingData.moodDistribution.happy, fill: '#10b981' },
    { name: 'Focused', value: wellbeingData.moodDistribution.focused, fill: '#3b82f6' },
    { name: 'Neutral', value: wellbeingData.moodDistribution.neutral, fill: '#6b7280' },
    {
      name: 'Needs Support',
      value: wellbeingData.moodDistribution.needsSupport,
      fill: '#ef4444',
    },
  ]

  const total = Object.values(wellbeingData.moodDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This displays <strong>anonymous class wellbeing data only</strong>. Individual student identities
            and camera data are never shown.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Today's Mood Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) =>
                  `${entry.name} (${entry.value})`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Mood Summary
            </h3>
            {chartData.map((item) => (
              <div key={item.name} className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Trend (Anonymous)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wellbeingData.weeklyTrend}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="happy"
              stroke="#10b981"
              name="Happy"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="focused"
              stroke="#3b82f6"
              name="Focused"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#6b7280"
              name="Neutral"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="needsSupport"
              stroke="#ef4444"
              name="Needs Support"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {wellbeingData.studentsRequestingSupport.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <h3 className="mb-3 text-lg font-semibold text-red-900 dark:text-red-400">
            Students Requesting Support
          </h3>
          <p className="mb-3 text-sm text-red-800 dark:text-red-300">
            {wellbeingData.studentsRequestingSupport.length} student{' '}
            {wellbeingData.studentsRequestingSupport.length !== 1 ? 's' : ''} have
            indicated they might need support.
          </p>
          <div className="space-y-2 text-sm text-red-700 dark:text-red-400">
            {wellbeingData.studentsRequestingSupport.map((request) => (
              <div key={request.studentId} className="flex justify-between">
                <span>{request.studentName}</span>
                <span>Stress: {request.stress}%</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Contact Wellbeing Support
          </button>
        </div>
      )}
    </div>
  )
}
