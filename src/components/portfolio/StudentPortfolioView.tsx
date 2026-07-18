import { Download } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PortfolioSection } from './PortfolioSection'
import { PortfolioStatCard } from './PortfolioStatCard'
import { PortfolioTimeline } from './PortfolioTimeline'
import type { StudentPortfolioModel } from '../../types/portfolio'

interface StudentPortfolioViewProps {
  portfolio: StudentPortfolioModel
  includeTeacherNotes: boolean
  includeParentNotes: boolean
}

export function StudentPortfolioView({
  portfolio,
  includeTeacherNotes,
  includeParentNotes,
}: StudentPortfolioViewProps) {
  const groupedCertificates = portfolio.certificates.reduce<Record<string, typeof portfolio.certificates>>(
    (accumulator, certificate) => {
      const key = certificate.group
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(certificate)
      return accumulator
    },
    {},
  )

  return (
    <div className="space-y-6">
      <PortfolioSection title="1. Personal Information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <img
              src={
                portfolio.personal.photoUrl ??
                'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=480&q=80'
              }
              alt={portfolio.personal.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{portfolio.personal.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Grade {portfolio.personal.grade} · Class {portfolio.personal.className}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Roll Number: {portfolio.personal.rollNumber}</p>
            <p>House: {portfolio.personal.house}</p>
            <p>School: {portfolio.personal.school}</p>
            <p>Academic Year: {portfolio.personal.academicYear}</p>
          </div>
        </div>
      </PortfolioSection>

      <PortfolioSection title="2. Academic Performance">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PortfolioStatCard label="Attendance" value={`${portfolio.academic.attendancePercent}%`} />
          <PortfolioStatCard label="Subjects" value={portfolio.academic.subjectsCount} />
          <PortfolioStatCard label="Overall GPA" value={portfolio.academic.overallGpa.toFixed(1)} />
          <PortfolioStatCard label="Average Grade" value={portfolio.academic.averageGrade} />
          <PortfolioStatCard label="Homework Completion" value={`${portfolio.academic.homeworkCompletionPercent}%`} />
          <PortfolioStatCard label="Assignment Completion" value={`${portfolio.academic.assignmentCompletionPercent}%`} />
          <PortfolioStatCard label="AI Tutor Progress" value={portfolio.academic.aiTutorProgress} />
          <PortfolioStatCard label="Study Planner" value={`${portfolio.academic.studyPlannerProgress}%`} />
        </div>
      </PortfolioSection>

      <PortfolioSection title="3. Events & Activities">
        <div className="grid gap-3 md:grid-cols-2">
          {portfolio.eventActivities.map((activity) => (
            <div key={activity.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <img src={activity.posterUrl} alt={activity.title} className="h-28 w-full rounded-lg object-cover" />
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.organizer} · {new Date(activity.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status: {activity.status}</p>
              {activity.teacherFeedback ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Teacher Feedback: {activity.teacherFeedback}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection title="4. Certificates">
        <div className="space-y-4">
          {Object.entries(groupedCertificates).map(([group, certificates]) => (
            <div key={group}>
              <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{group}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {certificates.map((certificate) => (
                  <a
                    key={certificate.id}
                    href={certificate.downloadUrl}
                    className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    {certificate.title}
                    <Download className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection title="5. Achievements">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.achievements.map((badge) => (
            <div key={badge.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-lg">{badge.emoji}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
            </div>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection title="6. Skills">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.skills.map((skill) => (
            <div key={skill.name} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{skill.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Proficiency {skill.proficiency}%</p>
            </div>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection title="7. AI Learning Insights">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold text-gray-900 dark:text-white">Strong Subjects:</span> {portfolio.aiInsights.strongSubjects.join(', ')}</p>
            <p><span className="font-semibold text-gray-900 dark:text-white">Needs Improvement:</span> {portfolio.aiInsights.improvingSubjects.join(', ')}</p>
            <p><span className="font-semibold text-gray-900 dark:text-white">Learning Style:</span> {portfolio.aiInsights.learningStyle}</p>
            <p><span className="font-semibold text-gray-900 dark:text-white">Personality:</span> {portfolio.aiInsights.personalitySummary}</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold text-gray-900 dark:text-white">Learning Path:</span> {portfolio.aiInsights.recommendedLearningPath}</p>
            <p><span className="font-semibold text-gray-900 dark:text-white">Career Suggestions:</span> {portfolio.aiInsights.careerSuggestions.join(', ')}</p>
          </div>
        </div>
      </PortfolioSection>

      <PortfolioSection title="8. Wellbeing">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Weekly Trend</p>
            <ResponsiveContainer width="100%" height="92%">
              <LineChart data={portfolio.wellbeingWeekly}>
                <XAxis dataKey="label" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line dataKey="wellbeingScore" stroke="#6366f1" strokeWidth={2} />
                <Line dataKey="stress" stroke="#ef4444" strokeWidth={1.5} />
                <Line dataKey="energy" stroke="#22c55e" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Monthly Trend</p>
            <ResponsiveContainer width="100%" height="92%">
              <LineChart data={portfolio.wellbeingMonthly}>
                <XAxis dataKey="label" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line dataKey="wellbeingScore" stroke="#8b5cf6" strokeWidth={2} />
                <Line dataKey="stress" stroke="#f97316" strokeWidth={1.5} />
                <Line dataKey="energy" stroke="#14b8a6" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PortfolioSection>

      <PortfolioSection title="9. Timeline">
        <PortfolioTimeline items={portfolio.timeline} />
      </PortfolioSection>

      {includeTeacherNotes ? (
        <PortfolioSection title="10. Teacher Notes">
          <div className="space-y-2">
            {portfolio.teacherNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(note.date).toLocaleDateString()} · {note.teacher} · {note.category}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{note.comment}</p>
              </div>
            ))}
          </div>
        </PortfolioSection>
      ) : null}

      {includeParentNotes ? (
        <PortfolioSection title="11. Parent Notes">
          <div className="space-y-2">
            {portfolio.parentNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{note.note}</p>
              </div>
            ))}
          </div>
        </PortfolioSection>
      ) : null}

      <PortfolioSection title="12. Goals">
        <div className="grid gap-2 md:grid-cols-3">
          {portfolio.goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {goal.status.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection title="13. Portfolio Statistics">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PortfolioStatCard label="Attendance %" value={`${portfolio.stats.attendance}%`} />
          <PortfolioStatCard label="Events Attended" value={portfolio.stats.eventsAttended} />
          <PortfolioStatCard label="Certificates" value={portfolio.stats.certificates} />
          <PortfolioStatCard label="Achievements" value={portfolio.stats.achievements} />
          <PortfolioStatCard label="Volunteer Hours" value={portfolio.stats.volunteerHours} />
          <PortfolioStatCard label="Sports Events" value={portfolio.stats.sportsEvents} />
          <PortfolioStatCard label="Arts Events" value={portfolio.stats.artsEvents} />
          <PortfolioStatCard label="Community Events" value={portfolio.stats.communityEvents} />
          <PortfolioStatCard label="AI Tutor Hours" value={portfolio.stats.aiTutorHours} />
        </div>
      </PortfolioSection>
    </div>
  )
}
