import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { WellbeingProvider } from './context/WellbeingContext'
import { EventsProvider } from './context/EventsContext'
import { ParentProvider } from './context/ParentContext'
import PageLoader from './components/common/PageLoader'

// Landing & auth routes are kept eager so the first paint never waits on a lazy chunk
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'

// Everything reached only after landing/auth is lazy-loaded into its own chunk
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))

// Dashboard home pages (role-specific)
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'))
const ClassWorkspace = lazy(() => import('./pages/teacher/ClassWorkspace'))
const TeacherAI = lazy(() => import('./pages/teacher/TeacherAI'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const AdminSchools = lazy(() => import('./pages/admin/Schools'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminLibrary = lazy(() => import('./pages/admin/Library'))
const AdminInventory = lazy(() => import('./pages/admin/Inventory'))
const AdminStaff = lazy(() => import('./pages/admin/Staff'))
const AdminFees = lazy(() => import('./pages/admin/Fees'))
const AdminTransport = lazy(() => import('./pages/admin/Transport'))
const AdminAIInsights = lazy(() => import('./pages/admin/AIInsights'))
const ParentDashboard = lazy(() => import('./pages/parent/Dashboard'))
const ChildDashboard = lazy(() => import('./pages/parent/ChildDashboard'))
const ParentAI = lazy(() => import('./pages/parent/ParentAI'))

// Shared dashboard pages
const Profile = lazy(() => import('./pages/dashboard/Profile'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const Notifications = lazy(() => import('./pages/dashboard/Notifications'))
const Timetable = lazy(() => import('./pages/dashboard/Timetable'))
const Attendance = lazy(() => import('./pages/dashboard/Attendance'))
const Assignments = lazy(() => import('./pages/dashboard/Assignments'))
const Subjects = lazy(() => import('./pages/dashboard/Subjects'))
const Grades = lazy(() => import('./pages/dashboard/Grades'))
const Fees = lazy(() => import('./pages/dashboard/Fees'))
const Transport = lazy(() => import('./pages/dashboard/Transport'))

// Student-specific pages
const StudyPlanner = lazy(() => import('./pages/student/StudyPlanner'))
const Homework = lazy(() => import('./pages/student/Homework'))
const Achievements = lazy(() => import('./pages/student/Achievements'))
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'))
const AITutor = lazy(() => import('./pages/student/AITutor'))
const PersonalityAssessment = lazy(() => import('./pages/student/PersonalityAssessment'))
const SubjectAssessment = lazy(() => import('./pages/student/SubjectAssessment'))
const CareerSuggestions = lazy(() => import('./pages/student/CareerSuggestions'))
const MentalHealth = lazy(() => import('./pages/student/MentalHealth'))
const AIWellbeingCheck = lazy(() => import('./pages/wellbeing/AIWellbeingCheck'))
const StudentEvents = lazy(() => import('./pages/student/Events'))
const TeacherEventsDashboard = lazy(() => import('./pages/teacher/EventsDashboard'))
const ParentChildEvents = lazy(() => import('./pages/parent/ChildEvents'))
const AuthorityEventsManagement = lazy(() => import('./pages/dashboard/AuthorityEventsManagement'))
const OrganizerPortal = lazy(() => import('./pages/organizer/OrganizerPortal'))
const EventDetailsPage = lazy(() => import('./pages/events/EventDetails'))

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
                <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/wellbeing-check" element={<AIWellbeingCheck />} />
                <Route path="/organizer/portal" element={<OrganizerPortal />} />

              {/* Student routes */}
              <Route path="/student" element={<ProtectedRoute allowedRole="student"><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard"              element={<StudentDashboard />} />
                <Route path="study-planner"          element={<StudyPlanner />} />
                <Route path="subjects"               element={<Subjects />} />
                <Route path="assignments"            element={<Assignments />} />
                <Route path="homework"               element={<Homework />} />
                <Route path="attendance"             element={<Attendance />} />
                <Route path="timetable"              element={<Timetable />} />
                <Route path="grades"                 element={<Grades />} />
                <Route path="fees"                   element={<Fees />} />
                <Route path="transport"              element={<Transport />} />
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
              <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard"     element={<TeacherDashboard />} />
                <Route path="class/:classId" element={<ClassWorkspace />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="assignments"   element={<Assignments />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="events"        element={<TeacherEventsDashboard />} />
                <Route path="ai-assistant"  element={<TeacherAI />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Parent routes */}
              <Route path="/parent" element={<ProtectedRoute allowedRole="parent"><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard"     element={<ParentDashboard />} />
                <Route path="child/:childId" element={<ChildDashboard />} />
                <Route path="grades"        element={<Grades />} />
                <Route path="attendance"    element={<Attendance />} />
                <Route path="timetable"     element={<Timetable />} />
                <Route path="fees"          element={<Fees />} />
                <Route path="transport"     element={<Transport />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="events"        element={<ParentChildEvents />} />
                <Route path="ai-assistant"  element={<ParentAI />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard"     element={<AdminDashboard />} />
                <Route path="schools"       element={<AdminSchools />} />
                <Route path="users"         element={<AdminUsers />} />
                <Route path="library"       element={<AdminLibrary />} />
                <Route path="inventory"     element={<AdminInventory />} />
                <Route path="staff"         element={<AdminStaff />} />
                <Route path="fees"          element={<AdminFees />} />
                <Route path="transport"     element={<AdminTransport />} />
                <Route path="subjects"      element={<Subjects />} />
                <Route path="events"        element={<AuthorityEventsManagement />} />
                <Route path="ai-insights"   element={<AdminAIInsights />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
                <Route index element={<Navigate replace to="dashboard" />} />
              </Route>

                <Route path="/events/:eventId" element={<EventDetailsPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
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
