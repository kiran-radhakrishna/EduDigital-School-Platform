import clsx from 'clsx'
import type { WellbeingEmotion } from '../../types/wellbeing'
import { WELLBEING_EMOTION_META, WELLBEING_EMOTIONS } from '../../types/wellbeing'

interface ManualEmotionCardsProps {
  selectedEmotion: WellbeingEmotion | null
  onSelect: (emotion: WellbeingEmotion) => void
}

export function ManualEmotionCards({ selectedEmotion, onSelect }: ManualEmotionCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {WELLBEING_EMOTIONS.map((emotion) => {
        const meta = WELLBEING_EMOTION_META[emotion]
        const selected = selectedEmotion === emotion

        return (
          <button
            key={emotion}
            type="button"
            onClick={() => onSelect(emotion)}
            className={clsx(
              'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
              selected
                ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5',
            )}
          >
            <span className="text-3xl">{meta.emoji}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
