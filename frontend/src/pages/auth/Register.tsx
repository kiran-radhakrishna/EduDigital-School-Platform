import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import type { UserRole } from '../../types'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
  fullWidth?: boolean
}

const roleOptions: Array<{
  value: UserRole
  labelKey: 'student' | 'teacher' | 'parent' | 'admin'
  icon: typeof GraduationCap
}> = [
  { value: 'student', labelKey: 'student', icon: GraduationCap },
  { value: 'teacher', labelKey: 'teacher', icon: BookOpen },
  { value: 'parent', labelKey: 'parent', icon: Users },
  { value: 'admin', labelKey: 'admin', icon: ShieldCheck },
]

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, leftIcon, rightIcon, className = '', id, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
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
          } ${rightIcon ? 'pr-12' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950' : ''} ${className}`}
          {...props}
        />
        {rightIcon ? (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">{rightIcon}</span>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
})

function PrimaryButton({
  children,
  className = '',
  disabled,
  fullWidth,
  isLoading,
  type = 'button',
  ...props
}: PrimaryButtonProps) {
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

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const { t } = useLanguage()
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password, selectedRole)
      toast.success('Account created successfully!')
      navigate('/login')
    } catch {
      toast.error('Registration failed. Please try again.')
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
            <div className="mb-6 space-y-2">
              <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                {t.auth.createAccount}
              </h1>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t.auth.registerSubtitle}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2">
              {roleOptions.map(({ value, labelKey, icon: Icon }) => {
                const isActive = selectedRole === value

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-xs font-medium transition ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.auth[labelKey]}</span>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <TextField
                type="text"
                autoComplete="name"
                label={t.auth.name}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <TextField
                type="email"
                autoComplete="email"
                label={t.auth.email}
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <TextField
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                label={t.auth.password}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-md p-1 text-gray-400 transition hover:text-indigo-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <TextField
                type="password"
                autoComplete="new-password"
                label={t.auth.confirmPassword}
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <PrimaryButton type="submit" fullWidth isLoading={isSubmitting}>
                {t.auth.createAccount}
              </PrimaryButton>
            </form>
          </motion.div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            {t.auth.haveAccount}{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 transition hover:underline dark:text-indigo-400"
            >
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
