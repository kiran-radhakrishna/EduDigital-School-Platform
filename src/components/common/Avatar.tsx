import { cn } from '../../utils/helpers'

export interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away'
  className?: string
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

const statusDotClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
}

const statusColorClasses: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-400',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizeClasses[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white',
            sizeClasses[size],
          )}
        >
          {initials}
        </div>
      )}

      {status ? (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900',
            statusDotClasses[size],
            statusColorClasses[status],
          )}
        />
      ) : null}
    </div>
  )
}

