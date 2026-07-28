import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './Input'
import { userApi, type AdminRole, type AdminUser } from '../../services/userApi'

interface UserPickerProps {
  schoolId: string
  roles?: AdminRole[]
  selected: AdminUser | null
  onSelect: (user: AdminUser) => void
  placeholder?: string
}

/** Debounced search-and-select picker for choosing a User across admin screens (library borrowers, asset assignees, transport students, etc.). */
export function UserPicker({ schoolId, roles, selected, onSelect, placeholder }: UserPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminUser[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!schoolId || query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the query becomes too short to search
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      void userApi
        .list({ schoolId, search: query.trim(), limit: 8 })
        .then((result) => setResults(result.items.filter((item) => !roles || roles.includes(item.role.toUpperCase() as AdminRole))))
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(handle)
  }, [query, schoolId, roles])

  return (
    <div className="relative">
      <Input
        leftIcon={<Search className="h-4 w-4" />}
        placeholder={placeholder ?? 'Search by name or email…'}
        value={selected ? selected.name : query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(user)
                setQuery('')
                setIsOpen(false)
              }}
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.email} · {user.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
