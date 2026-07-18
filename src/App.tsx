import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { WellbeingProvider } from './context/WellbeingContext'
import { EventsProvider } from './context/EventsContext'
import { ParentProvider } from './context/ParentContext'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import DashboardLayout from './layouts/DashboardLayout'

// Dashboard home pages
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import ClassWorkspace from './pages/teacher/ClassWorkspace'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ParentDashboard from './pages/parent/Dashboard'
import ChildDashboard from './pages/parent/ChildDashboard'

// Shared dashboard pages
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import Notifications from './pages/dashboard/Notifications'
import Timetable from './pages/dashboard/Timetable'
import Attendance from './pages/dashboard/Attendance'
import Assignments from './pages/dashboard/Assignments'
import Subjects from './pages/dashboard/Subjects'
import Grades from './pages/dashboard/Grades'

// Student-specific pages
import StudyPlanner from './pages/student/StudyPlanner'
import Homework from './pages/student/Homework'
import Achievements from './pages/student/Achievements'
import Leaderboard from './pages/student/Leaderboard'
import AITutor from './pages/student/AITutor'
import PersonalityAssessment from './pages/student/PersonalityAssessment'
import SubjectAssessment from './pages/student/SubjectAssessment'
import CareerSuggestions from './pages/student/CareerSuggestions'
import MentalHealth from './pages/student/MentalHealth'
import AIWellbeingCheck from './pages/wellbeing/AIWellbeingCheck'
import StudentEvents from './pages/student/Events'
import TeacherEventsDashboard from './pages/teacher/EventsDashboard'
import ParentChildEvents from './pages/parent/ChildEvents'
import AuthorityEventsManagement from './pages/dashboard/AuthorityEventsManagement'
import OrganizerPortal from './pages/organizer/OrganizerPortal'
import EventDetailsPage from './pages/events/EventDetails'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <WellbeingProvider>
            <EventsProvider>
              <ParentProvider>
                <BrowserRouter>
                  <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/wellbeing-check" element={<AIWellbeingCheck />} />
                <Route path="/organizer/portal" element={<OrganizerPortal />} />

              {/* Student routes */}
              <Route path="/student" element={<DashboardLayout />}>
                <Route path="dashboard"              element={<StudentDashboard />} />
                <Route path="study-planner"          element={<StudyPlanner />} />
                <Route path="subjects"               element={<Subjects />} />
                <Route path="assignments"            element={<Assignments />} />
                <Route path="homework"               element={<Homework />} />
                <Route path="attendance"             element={<Attendance />} />
                <Route path="timetable"              element={<Timetable />} />
                <Route path="grades"                 element={<Grades />} />
                <Route path="achievements"           element={<Achievements />} />
                <Route path="leaderboard"            element={<Leaderboard />} />
                <Route path="ai-tutor"               element={<AITutor />} />
                <Route path="personality-assessment" element={<PersonalityAssessment />} />
                <Route path="subject-assessment"     element={<SubjectAssessment />} />
                <Route path="career-suggestions"     element={<CareerSuggestions />} />
                <Route path="mental-health"          element={<MentalHealth />} />
                <Route path="events"                 element={<StudentEvents />} />
                <Route path="notifications"          element={<Notifications />} />
                <Route path="profile"                element={<Profile />} />
                <Route path="settings"               element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Teacher routes */}
              <Route path="/teacher" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<TeacherDashboard />} />
                <Route path="class/:classId" element={<ClassWorkspace />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="assignments"   element={<Assignments />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="events"        element={<TeacherEventsDashboard />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Parent routes */}
              <Route path="/parent" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<ParentDashboard />} />
                <Route path="child/:childId" element={<ChildDashboard />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="events"        element={<ParentChildEvents />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<AdminDashboard />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="events"        element={<AuthorityEventsManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/events/:eventId" element={<EventDetailsPage />} />
              </Routes>
               </BrowserRouter>
             </ParentProvider>
           </EventsProvider>
          </WellbeingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
 
export default App
