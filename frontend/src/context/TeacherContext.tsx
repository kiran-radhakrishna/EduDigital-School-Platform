import { createContext } from 'react'
import type { TeacherClass } from '../types/teacher'

interface TeacherContextType {
  classes: TeacherClass[]
  selectedClassId: string | null
  setSelectedClassId: (classId: string | null) => void
}

export const TeacherContext = createContext<TeacherContextType | undefined>(undefined)
