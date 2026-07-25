import { ProgressBar } from '../common/ProgressBar'
import {
  WELLBEING_EMOTION_META,
  getWellbeingFeedback,
  getWellbeingMetrics,
  type WellbeingAssessment,
} from '../../types/wellbeing'

interface WellbeingResultCardProps {
  assessment: WellbeingAssessment
}

export function WellbeingResultCard({ assessment }: WellbeingResultCardProps) {
  const meta = WELLBEING_EMOTION_META[assessment.emotion]
  const metrics = getWellbeingMetrics(assessment)

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-100/40 dark:border-indigo-500/20 dark:bg-gray-900 dark:shadow-black/20">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Wellbeing</h2>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-4xl">{meta.emoji}</span>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{meta.label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(assessment.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Confidence</span>
            <span>{assessment.confidence}%</span>
          </div>
          <ProgressBar value={assessment.confidence} color="#6366f1" size="sm" />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Energy</span>
            <span>{metrics.energy}%</span>
          </div>
          <ProgressBar value={metrics.energy} color="#14b8a6" size="sm" />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Stress</span>
            <span>{metrics.stress}%</span>
          </div>
          <ProgressBar value={metrics.stress} color="#f97316" size="sm" />
        </div>
      </div>

      <p className="mt-5 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
        {getWellbeingFeedback(assessment.emotion)}
      </p>
    </div>
  )
}
