import { useContext } from 'react'
import { TeacherContext } from '../context/TeacherContext'

export function useTeacher() {
  const context = useContext(TeacherContext)
  if (context === undefined) {
    throw new Error('useTeacher must be used within a TeacherProvider')
  }
  return context
}
