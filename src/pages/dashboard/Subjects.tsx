import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookText, ChevronDown, Clock, MapPin, User } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { useLanguage } from '../../hooks/useLanguage'
import { cn } from '../../utils/helpers'
import type { Subject } from '../../types'

const subjects: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', teacher: 'Ms. Johnson', room: 'A-201', schedule: 'Mon, Wed, Fri · 09:00-09:45', color: '#6366f1', progress: 92 },
  { id: 'sub-2', name: 'Physics', teacher: 'Dr. Patel', room: 'Lab-2', schedule: 'Tue, Thu · 10:00-10:45', color: '#8b5cf6', progress: 81 },
  { id: 'sub-3', name: 'English Literature', teacher: 'Mr. Clark', room: 'B-104', schedule: 'Mon, Wed · 11:00-11:45', color: '#3b82f6', progress: 87 },
  { id: 'sub-4', name: 'History', teacher: 'Mrs. Davis', room: 'C-302', schedule: 'Tue, Fri · 12:00-12:45', color: '#f59e0b', progress: 74 },
  { id: 'sub-5', name: 'Biology', teacher: 'Ms. Walker', room: 'B-205', schedule: 'Mon, Thu · 13:00-13:45', color: '#10b981', progress: 84 },
  { id: 'sub-6', name: 'Chemistry', teacher: 'Dr. Lee', room: 'Lab-1', schedule: 'Wed, Fri · 09:50-10:35', color: '#ec4899', progress: 79 },
  { id: 'sub-7', name: 'Computer Science', teacher: 'Mr. Nguyen', room: 'Tech-1', schedule: 'Tue, Thu · 14:00-14:45', color: '#06b6d4', progress: 95 },
  { id: 'sub-8', name: 'Art & Design', teacher: 'Ms. Rivera', room: 'Studio', schedule: 'Fri · 15:00-15:45', color: '#f43f5e', progress: 89 },
]

export default function Subjects() {
  const { t } = useLanguage()
  const [expandedId, setExpandedId] = useState<string | null>(subjects[0]?.id ?? null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <BookText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.subjects}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Explore your current courses and track progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const isExpanded = expandedId === subject.id

          return (
            <Card
              key={subject.id}
              className="cursor-pointer overflow-hidden border border-gray-200/70 bg-white/90 transition-transform duration-200 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900/80"
              onClick={() => setExpandedId(isExpanded ? null : subject.id)}
            >
              <div className="-mx-6 -mt-6 h-1.5" style={{ backgroundColor: subject.color }} />
              <div className="mt-1 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current progress: {subject.progress ?? 0}%</p>
                  </div>
                </div>

                <ChevronDown
                  className={cn(
                    'mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform',
                    isExpanded && 'rotate-180',
                  )}
                />
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" style={{ color: subject.color }} />
                  <span>{subject.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: subject.color }} />
                  <span>{subject.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: subject.color }} />
                  <span>{subject.schedule}</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${subject.progress ?? 0}%`, backgroundColor: subject.color }}
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 border-t border-gray-100 pt-4 text-sm leading-6 text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      This course combines theory and practical activities to strengthen subject mastery, prepare for assessments,
                      and support collaborative projects throughout the semester.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}
