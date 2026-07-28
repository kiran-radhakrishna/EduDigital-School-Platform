import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Users, Clock, BookOpen, FileText, Award, MessageSquare, TrendingUp, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { ClassOverviewTab } from '../../components/teacher/ClassOverviewTab'
import { ClassStudentsTab } from '../../components/teacher/ClassStudentsTab'
import { ClassAttendanceTab } from '../../components/teacher/ClassAttendanceTab'
import { ClassWellbeingTab } from '../../components/teacher/ClassWellbeingTab'
import { AssignmentsPanel } from '../../components/teacher/AssignmentsPanel'
import { GradesPanel } from '../../components/teacher/GradesPanel'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { getClassById, getClassWellbeing as getClassWellbeingMock } from '../../services/teacherService'
import { classApi } from '../../services/classApi'
import { wellbeingApi } from '../../services/wellbeingApi'
import { aiApi } from '../../services/aiApi'
import { getGenericDemoResponse } from '../../utils/demoAiResponses'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import type { TeacherClass, WellbeingAnonymousData } from '../../types/teacher'

export default function ClassWorkspace() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const { user, isDemoMode } = useAuth()
  const isReal = !isDemoMode && !!user
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'attendance' | 'homework' | 'assignments' | 'grades' | 'events' | 'messages' | 'analytics' | 'wellbeing'>('overview')

  const [classData, setClassData] = useState<TeacherClass | undefined>(() =>
    isReal || !classId ? undefined : getClassById(classId),
  )
  const [isLoading, setIsLoading] = useState(isReal)
  const [wellbeingData, setWellbeingData] = useState<WellbeingAnonymousData | undefined>(() =>
    isReal || !classId ? undefined : getClassWellbeingMock(classId),
  )

  useEffect(() => {
    if (!isReal || !classId) return
    let cancelled = false
    wellbeingApi
      .getClassWellbeing(classId)
      .then((summary) => {
        if (!cancelled) setWellbeingData(summary)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isReal, classId])

  useEffect(() => {
    if (!isReal || !classId || !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- demo mode never enters the async fetch below
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)

    Promise.all([classApi.getMyClasses(user.id), classApi.getClassRoster(classId)])
      .then(([summaries, roster]) => {
        if (cancelled) return
        const summary = summaries.find((item) => item.classId === classId)
        if (!summary) {
          setClassData(undefined)
          return
        }
        setClassData({
          id: classId,
          name: summary.className,
          grade: summary.grade,
          subject: summary.subjectName,
          studentCount: roster.length,
          students: roster.map((student) => ({
            id: student.userId,
            name: student.name,
            attendancePercent: 100,
            averageGrade: '—',
            wellbeingStatus: 'neutral',
            assignmentsDue: 0,
          })),
          schedule: [],
        })
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load class.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isReal, classId, user])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading class…</p>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Class not found</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'students' as const, label: 'Students', icon: Users },
    { id: 'attendance' as const, label: 'Attendance', icon: Clock },
    { id: 'homework' as const, label: 'Homework', icon: BookOpen },
    { id: 'assignments' as const, label: 'Assignments', icon: FileText },
    { id: 'grades' as const, label: 'Grades', icon: Award },
    { id: 'events' as const, label: 'Events', icon: TrendingUp },
    { id: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { id: 'wellbeing' as const, label: 'Wellbeing', icon: Heart },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/teacher')}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classData.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{classData.subject} · {classData.studentCount} students</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-1 border-b border-gray-200 p-1 dark:border-gray-700">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <ClassOverviewTab classData={classData} />}
          {activeTab === 'students' && (
            <ClassStudentsTab
              students={classData.students}
              onOpenPortfolio={(studentId) => {
                navigate(`/profile?studentId=${studentId}`)
              }}
            />
          )}
          {activeTab === 'attendance' && (
            <ClassAttendanceTab
              students={classData.students}
            />
          )}
          {activeTab === 'homework' && (
            <AIChatPanel
              heightClassName="h-[65vh]"
              title="Homework Assistant · Teacher Mode"
              subtitle={`${classData.subject} · full worked solutions`}
              welcomeMessage={`Hi ${getCurrentUserIdentity(user, 'teacher').firstName}! Paste a homework question from ${classData.name} and I'll generate a full worked solution you can use for review or feedback.`}
              placeholder="Paste a homework question…"
              userAvatarLabel={getCurrentUserIdentity(user, 'teacher').avatar}
              onSend={async (text, conversationId) => {
                if (isDemoMode) {
                  await new Promise((resolve) => setTimeout(resolve, 700))
                  return { content: getGenericDemoResponse('homework', text) }
                }
                const result = await aiApi.homeworkChat(text, conversationId, 'teacher')
                return { content: result.message.content, conversationId: result.conversation.id }
              }}
            />
          )}
          {activeTab === 'assignments' && classId && <AssignmentsPanel classId={classId} />}
          {activeTab === 'grades' && classId && <GradesPanel classId={classId} />}
          {activeTab === 'events' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Events management coming soon
            </div>
          )}
          {activeTab === 'messages' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Messaging coming soon
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Analytics coming soon
            </div>
          )}
          {activeTab === 'wellbeing' && (
            <ClassWellbeingTab wellbeingData={wellbeingData} />
          )}
        </div>
      </div>
    </div>
  )
}
