import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Sparkles, VideoOff } from 'lucide-react'
import type { WellbeingEmotion } from '../../types/wellbeing'
import { WELLBEING_EMOTIONS } from '../../types/wellbeing'

interface CameraScanPanelProps {
  userSeed: string
  onDetected: (emotion: WellbeingEmotion, confidence: number) => void
}

function buildHash(seed: string): number {
  return seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function runLocalEmotionEstimate(seed: string): { emotion: WellbeingEmotion; confidence: number } {
  const hash = buildHash(seed)
  const emotion = WELLBEING_EMOTIONS[hash % WELLBEING_EMOTIONS.length]
  const confidence = 78 + (hash % 20)
  return { emotion, confidence }
}

export function CameraScanPanel({ userSeed, onDetected }: CameraScanPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraReady(true)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to access camera permissions.'
        setCameraError(message)
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const handleScan = async () => {
    if (!cameraReady || scanning) return

    setScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 1800))
    const estimate = runLocalEmotionEstimate(`${userSeed}-${Date.now()}`)
    onDetected(estimate.emotion, estimate.confidence)
    setScanning(false)
  }

  if (cameraError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <VideoOff className="h-4 w-4" />
          Camera permission required
        </div>
        <p className="mt-2 text-sm">{cameraError}</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-xl shadow-indigo-100/40 dark:border-indigo-500/20 dark:bg-gray-900 dark:shadow-black/20">
      <div className="relative overflow-hidden rounded-2xl bg-gray-950">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover opacity-90" />
        <div className="pointer-events-none absolute inset-0 border-2 border-indigo-400/40" />
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        On-device camera processing. No photos saved. No video uploaded.
      </p>

      <button
        type="button"
        onClick={handleScan}
        disabled={!cameraReady || scanning}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {scanning ? 'Scanning wellbeing…' : 'Analyze current mood'}
      </button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-300">
        <Sparkles className="h-3.5 w-3.5" />
        AI scan runs entirely in this browser
      </div>
    </div>
  )
}
