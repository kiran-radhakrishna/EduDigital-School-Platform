import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, BookOpen, Calendar, FileText, MessageSquare, Shield, TrendingUp, User, Zap } from 'lucide-react'
import { useParent } from '../../hooks/useParent'
import { useAuth } from '../../hooks/useAuth'
import { parentService } from '../../services/parentService'
import { gradeApi } from '../../services/gradeApi'
import { assignmentApi } from '../../services/assignmentApi'
import { ChildOverviewTab } from '../../components/parent/ChildOverviewTab'
import { ChildWellbeingTab } from '../../components/parent/ChildWellbeingTab'
import { ChildMessagesTab } from '../../components/parent/ChildMessagesTab'
import type { ChildGrade, ChildHomework } from '../../types/parent'

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'academic', label: 'Academic Progress', icon: BookOpen },
  { id: 'homework', label: 'Homework', icon: FileText },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'events', label: 'Events', icon: Zap },
  { id: 'portfolio', label: 'Digital Portfolio', icon: User },
  { id: 'wellbeing', label: 'Wellbeing', icon: Shield },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'achievements', label: 'Family Achievements', icon: BarChart3 },
]

export default function ChildDashboard() {
  const navigate = useNavigate()
  const { childId } = useParams<{ childId: string }>()
  const { children, childProgress } = useParent()
  const { isDemoMode } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [grades, setGrades] = useState<ChildGrade[]>([])
  const [homework, setHomework] = useState<ChildHomework[]>([])

  useEffect(() => {
    if (!childId) return

    if (isDemoMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- demo mode hydration is synchronous, not an async fetch
      setGrades(parentService.getChildGrades(childId))
      setHomework(parentService.getChildHomework(childId))
      return
    }

    let cancelled = false
    gradeApi
      .listForStudent(childId)
      .then((apiGrades) => {
        if (cancelled) return
        setGrades(
          apiGrades.map((grade) => ({
            id: grade.id,
            childId,
            subject: grade.subject.name,
            date: grade.date,
            score: grade.score,
            maxScore: grade.maxScore,
            teacher: '',
            type: grade.type.toLowerCase() as ChildGrade['type'],
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setGrades([])
      })

    assignmentApi
      .listForStudent(childId)
      .then((submissions) => {
        if (cancelled) return
        setHomework(
          submissions.map((submission) => ({
            id: submission.id,
            childId,
            title: submission.assignment.title,
            subject: submission.assignment.subject.name,
            description: submission.assignment.description ?? '',
            dueDate: submission.assignment.dueDate,
            status: submission.status.toLowerCase() as ChildHomework['status'],
            submittedDate: submission.submittedAt ?? undefined,
            teacher: `${submission.assignment.teacher.user.firstName} ${submission.assignment.teacher.user.lastName}`,
            teacherFeedback: submission.feedback ?? undefined,
            grade: submission.score ?? undefined,
            attachments: [],
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setHomework([])
      })

    return () => {
      cancelled = true
    }
  }, [childId, isDemoMode])

  if (!childId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Child not found</p>
      </div>
    )
  }

  const child = children.find((c) => c.id === childId)
  const progress = childProgress[childId]

  if (!child || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const events = parentService.getChildEvents(childId)
  const certificates = parentService.getChildCertificates(childId)
  const wellbeing = parentService.getChildWellbeing(childId)
  const messages = parentService.getTeacherMessages(childId)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ChildOverviewTab childProgress={progress} childName={child.name} />

      case 'academic':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grades by Subject</h3>
            <div className="space-y-3">
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-dark-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{grade.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{grade.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {grade.score}/{grade.maxScore}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{grade.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No grades recorded yet</p>
              )}
            </div>
          </div>
        )

      case 'homework':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Homework Assignments</h3>
            <div className="space-y-3">
              {homework.length > 0 ? (
                homework.map((hw) => (
                  <div key={hw.id} className="p-3 bg-gray-50 rounded-lg dark:bg-dark-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{hw.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{hw.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Due: {hw.dueDate}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${hw.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                        {hw.status}
                      </span>
                    </div>
                    {hw.teacherFeedback && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Feedback: {hw.teacherFeedback}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No homework assigned</p>
              )}
            </div>
          </div>
        )

      case 'attendance':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Record</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.attendance.presentDays}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{progress.attendance.absentDays}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progress.attendance.lateDays}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Excused</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress.attendance.excusedDays}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'events':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Registered Events</h3>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg dark:bg-dark-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.date} • {event.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${event.parentApprovalStatus === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {event.parentApprovalStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No registered events</p>
              )}
            </div>
          </div>
        )

      case 'portfolio':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Digital Portfolio</h3>
            <button
              onClick={() => navigate(`/student/portfolio?childId=${childId}`)}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              View Full Portfolio
            </button>
          </div>
        )

      case 'wellbeing':
        return wellbeing ? <ChildWellbeingTab wellbeing={wellbeing} childName={child.name} /> : <p>Loading wellbeing data...</p>

      case 'messages':
        return <ChildMessagesTab messages={messages} />

      case 'calendar':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">School Calendar</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Calendar view coming soon</p>
          </div>
        )

      case 'achievements':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Certificates & Achievements</h3>
            <div className="space-y-3">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id} className="p-3 bg-gray-50 rounded-lg dark:bg-dark-700">
                    <p className="font-medium text-gray-900 dark:text-white">{cert.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer} • {cert.issuedDate}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No certificates earned yet</p>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-800 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={child.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
                alt={child.name}
                className="h-10 w-10 rounded-full border-2 border-primary-400"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{child.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{child.grade} • {child.class}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 whitespace-nowrap pb-2">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderTabContent()}
      </div>
    </div>
  )
}
