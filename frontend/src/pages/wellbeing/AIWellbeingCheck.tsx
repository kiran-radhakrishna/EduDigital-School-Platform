import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, ChevronRight, HeartPulse, Sparkles } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CameraScanPanel } from '../../components/wellbeing/CameraScanPanel'
import { ManualEmotionCards } from '../../components/wellbeing/ManualEmotionCards'
import { WellbeingPrivacyNotice } from '../../components/wellbeing/WellbeingPrivacyNotice'
import { WellbeingResultCard } from '../../components/wellbeing/WellbeingResultCard'
import { useAuth } from '../../hooks/useAuth'
import { useWellbeing } from '../../hooks/useWellbeing'
import { getCurrentUserIdentity } from '../../utils/helpers'
import type { WellbeingEmotion } from '../../types/wellbeing'

type WellbeingStep = 'welcome' | 'camera' | 'manual' | 'result'

export default function AIWellbeingCheck() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { latestAssessment, completedToday, saveCameraAssessment, saveManualAssessment, skipToday } =
    useWellbeing()

  const currentUser = getCurrentUserIdentity(user, 'student')
  const [step, setStep] = useState<WellbeingStep>(completedToday ? 'result' : 'welcome')
  const [selectedManualEmotion, setSelectedManualEmotion] = useState<WellbeingEmotion | null>(null)

  const role = user?.role ?? null

  const dashboardPath = useMemo(() => {
    if (!role) return '/login'
    return `/${role}/dashboard`
  }, [role])

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (role === 'admin') {
    return <Navigate replace to={dashboardPath} />
  }

  const handleDetected = (emotion: WellbeingEmotion, confidence: number) => {
    saveCameraAssessment(emotion, confidence)
    setStep('result')
  }

  const handleManualConfirm = () => {
    if (!selectedManualEmotion) return
    saveManualAssessment(selectedManualEmotion)
    setStep('result')
  }

  const handleSkip = () => {
    skipToday()
    navigate(dashboardPath, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-2xl shadow-indigo-100/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/20 md:p-8"
        >
          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                  Welcome back, {currentUser.firstName}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">How are you feeling today?</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A quick wellbeing check helps personalize your learning experience.
                </p>
              </div>

              <div className="relative mx-auto flex h-64 max-w-xl items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-pink-100 dark:from-indigo-900/30 dark:via-violet-900/20 dark:to-pink-900/20">
                <motion.div
                  className="absolute h-48 w-48 rounded-full bg-indigo-300/40 dark:bg-indigo-500/20"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute h-32 w-32 rounded-full bg-violet-300/40 dark:bg-violet-500/20"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative flex flex-col items-center gap-3">
                  <HeartPulse className="h-14 w-14 text-indigo-700 dark:text-indigo-300" />
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">AI Wellbeing Check</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setStep('camera')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700"
                >
                  <Camera className="h-5 w-5" />
                  Start AI Wellbeing Scan
                </button>
                <button
                  type="button"
                  onClick={() => setStep('manual')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                >
                  😊 Choose Manually
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="mx-auto block text-xs font-medium text-gray-500 underline-offset-2 transition hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Skip for Today
                </button>
              </div>

              <WellbeingPrivacyNotice />
            </div>
          )}

          {step === 'camera' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Wellbeing Scan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Front camera only. Everything stays on-device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="text-xs font-medium text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Back
                </button>
              </div>
              <CameraScanPanel userSeed={currentUser.fullName} onDetected={handleDetected} />
              <WellbeingPrivacyNotice />
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Wellbeing</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose the emotion that best reflects your current state.
                </p>
              </div>
              <ManualEmotionCards selectedEmotion={selectedManualEmotion} onSelect={setSelectedManualEmotion} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleManualConfirm}
                  disabled={!selectedManualEmotion}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Wellbeing
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Back
                </button>
              </div>
              <WellbeingPrivacyNotice />
            </div>
          )}

          {step === 'result' && latestAssessment && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                <Sparkles className="h-4 w-4" />
                Wellbeing Insights
              </div>
              <WellbeingResultCard assessment={latestAssessment} />
              <button
                type="button"
                onClick={() => navigate(dashboardPath, { replace: true })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Continue to Dashboard
                <ChevronRight className="h-4 w-4" />
              </button>
              <WellbeingPrivacyNotice />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
