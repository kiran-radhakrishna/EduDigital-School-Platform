import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import DashboardLayout from './layouts/DashboardLayout'

// Dashboard home pages
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import ParentDashboard from './pages/dashboard/ParentDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

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

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

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
                <Route path="notifications"          element={<Notifications />} />
                <Route path="profile"                element={<Profile />} />
                <Route path="settings"               element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Teacher routes */}
              <Route path="/teacher" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<TeacherDashboard />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="assignments"   element={<Assignments />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Parent routes */}
              <Route path="/parent" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<ParentDashboard />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<DashboardLayout />}>
                <Route path="dashboard"     element={<AdminDashboard />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
