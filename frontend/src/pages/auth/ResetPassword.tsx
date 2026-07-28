import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, GraduationCap, Lock, XCircle } from 'lucide-react'
import { z } from 'zod'
import { authApi } from '../../services/authApi'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  leftIcon?: ReactNode
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
  fullWidth?: boolean
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, leftIcon, className = '', id, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={fieldId}
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-950 ${
            leftIcon ? 'pl-10' : ''
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
})

function PrimaryButton({ children, className = '', disabled, fullWidth, isLoading, type = 'button', ...props }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-indigo-950 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setStatus('error')
      setErrorMessage('This reset link is missing its token.')
      return
    }
    try {
      await authApi.resetPassword(token, data.password)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not reset your password.')
    }
  }

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
            className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl shadow-indigo-100/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/20"
          >
            {status === 'success' ? (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password reset</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your password has been updated. Please log in with your new password.
                  </p>
                </div>
                <PrimaryButton type="button" fullWidth onClick={() => navigate('/login')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </PrimaryButton>
              </div>
            ) : status === 'error' && !token ? (
              <div className="space-y-6 text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid link</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Request a new link
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-2">
                  <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Set a new password</h1>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Choose a new password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <TextField
                    type="password"
                    autoComplete="new-password"
                    label="New password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <TextField
                    type="password"
                    autoComplete="new-password"
                    label="Confirm password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}

                  <PrimaryButton type="submit" fullWidth isLoading={isSubmitting}>
                    Reset password
                  </PrimaryButton>
                </form>

                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:underline dark:text-indigo-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
