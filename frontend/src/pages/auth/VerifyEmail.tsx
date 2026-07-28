import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, GraduationCap, Loader2, XCircle } from 'lucide-react'
import { authApi } from '../../services/authApi'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no token in the URL means there's nothing to verify
      setStatus('error')
      return
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              EduDigital
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-2xl shadow-indigo-100/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/20"
          >
            {status === 'loading' && (
              <div className="space-y-6">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-indigo-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying your email…</h1>
              </div>
            )}
            {status === 'success' && (
              <div className="space-y-6">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email verified</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your email address has been confirmed.</p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-6">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification failed</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This link is invalid or has expired. You can request a new one from your account settings.
                  </p>
                </div>
              </div>
            )}

            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-medium text-indigo-600 transition hover:underline dark:text-indigo-400"
            >
              Back to login
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
