import { useContext } from 'react'
import { ParentContext } from '../context/parent-context'

export function useParent() {
  const context = useContext(ParentContext)
  if (context === undefined) {
    throw new Error('useParent must be used within a ParentProvider')
  }
  return context
}
