export const WELLBEING_EMOTIONS = [
  'happy',
  'focused',
  'calm',
  'neutral',
  'tired',
  'sad',
  'stressed',
  'anxious',
] as const

export type WellbeingEmotion = (typeof WELLBEING_EMOTIONS)[number]

export interface WellbeingAssessment {
  emotion: WellbeingEmotion
  confidence: number
  timestamp: string
}

export const WELLBEING_EMOTION_META: Record<WellbeingEmotion, { label: string; emoji: string }> = {
  happy: { label: 'Happy', emoji: '😊' },
  focused: { label: 'Focused', emoji: '🎯' },
  calm: { label: 'Calm', emoji: '😌' },
  neutral: { label: 'Neutral', emoji: '🙂' },
  tired: { label: 'Tired', emoji: '😴' },
  sad: { label: 'Sad', emoji: '😔' },
  stressed: { label: 'Stressed', emoji: '😟' },
  anxious: { label: 'Anxious', emoji: '😰' },
}

export function isWellbeingEmotion(value: string): value is WellbeingEmotion {
  return WELLBEING_EMOTIONS.includes(value as WellbeingEmotion)
}

export function getWellbeingMetrics(assessment: WellbeingAssessment): { energy: number; stress: number } {
  const emotionBaselines: Record<WellbeingEmotion, { energy: number; stress: number }> = {
    happy: { energy: 89, stress: 11 },
    focused: { energy: 84, stress: 16 },
    calm: { energy: 74, stress: 18 },
    neutral: { energy: 64, stress: 26 },
    tired: { energy: 42, stress: 29 },
    sad: { energy: 38, stress: 54 },
    stressed: { energy: 48, stress: 78 },
    anxious: { energy: 44, stress: 82 },
  }

  const baseline = emotionBaselines[assessment.emotion]
  const confidenceAdjustment = Math.round((assessment.confidence - 75) * 0.25)

  const energy = Math.max(10, Math.min(98, baseline.energy + confidenceAdjustment))
  const stress = Math.max(5, Math.min(95, baseline.stress - Math.round(confidenceAdjustment * 0.5)))

  return { energy, stress }
}

export function getWellbeingFeedback(emotion: WellbeingEmotion): string {
  const feedback: Record<WellbeingEmotion, string> = {
    happy: "Great to see you're feeling positive today!",
    focused: 'You look focused and ready to learn. Let’s keep that momentum!',
    calm: 'You seem calm and balanced. A great foundation for a strong day.',
    neutral: "You're in a steady state today. A quick warm-up task can boost momentum.",
    tired: 'You seem a little tired. A short break can help you recharge before class.',
    sad: 'You might be feeling low today. A gentle start and support can make a big difference.',
    stressed: 'You seem a little stressed today. Would you like a 2-minute breathing exercise before class?',
    anxious: 'You may be feeling anxious right now. Support resources are available whenever you need them.',
  }

  return feedback[emotion]
}
