import { AlertCircle } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import type { ChildWellbeing } from '../../types/parent'

interface ChildWellbeingTabProps {
  wellbeing: ChildWellbeing
  childName: string
}

export function ChildWellbeingTab({ wellbeing, childName }: ChildWellbeingTabProps) {
  const moodDistribution = [
    {
      name: 'Happy',
      value: wellbeing.moodHistory.filter((m) => m.mood === 'happy').length,
      color: '#10b981',
    },
    {
      name: 'Focused',
      value: wellbeing.moodHistory.filter((m) => m.mood === 'focused').length,
      color: '#3b82f6',
    },
    {
      name: 'Neutral',
      value: wellbeing.moodHistory.filter((m) => m.mood === 'neutral').length,
      color: '#f59e0b',
    },
    {
      name: 'Stressed',
      value: wellbeing.moodHistory.filter((m) => m.mood === 'stressed').length,
      color: '#ef4444',
    },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Parent-Authorized Information Only</p>
          <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
            This wellbeing data is based on {childName}'s check-ins and is shared only with parents. Camera images are never shown.
          </p>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Weekly Wellbeing Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wellbeing.weeklyTrend}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mood" stroke="#3b82f6" name="Mood" />
            <Line type="monotone" dataKey="energy" stroke="#10b981" name="Energy" />
            <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Stress" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Distribution */}
      {moodDistribution.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={moodDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Energy and Stress Trends */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Energy Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wellbeing.energyTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Stress Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wellbeing.stressTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ef4444" name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      {wellbeing.aiRecommendations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">AI Family Recommendations</h3>
          <ul className="space-y-2">
            {wellbeing.aiRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
