// ─── Emma Johnson · Deggendorf International School ────────────────────────

export const STUDENT_INFO = {
  name: 'Emma Johnson',
  firstName: 'Emma',
  lastName: 'Johnson',
  grade: '4A',
  age: 9,
  rollNumber: 12,
  house: 'Blue House',
  houseColor: '#3b82f6',
  classTeacher: 'Sarah Miller',
  email: 'emma.johnson@dis.edu',
  school: 'Deggendorf International School',
  schoolShort: 'DIS',
  location: 'Deggendorf, Germany',
  level: 12,
  xp: 2450,
  xpNext: 3000,
  coins: 380,
  attendancePct: 96,
  homeworkDue: 3,
  upcomingExam: 'Math Quiz',
  upcomingExamDate: '2026-07-08',
  gpa: 3.8,
  studyStreak: 7,
} as const

// ─── Timetable ──────────────────────────────────────────────────────────────

export interface TimetableSlot {
  period: number
  subject: string
  teacher: string
  room: string
  startTime: string
  endTime: string
  color: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
}

export const TODAY_TIMETABLE: TimetableSlot[] = [
  { period: 1, subject: 'Mathematics', teacher: 'Mr. Weber', room: 'A-201', startTime: '08:00', endTime: '08:45', color: '#9333ea', day: 'Fri' },
  { period: 2, subject: 'English', teacher: 'Ms. Smith', room: 'B-103', startTime: '08:55', endTime: '09:40', color: '#ec4899', day: 'Fri' },
  { period: 3, subject: 'German', teacher: 'Mrs. Müller', room: 'B-104', startTime: '09:50', endTime: '10:35', color: '#f59e0b', day: 'Fri' },
  { period: 4, subject: 'Science', teacher: 'Dr. Fischer', room: 'Lab-1', startTime: '10:55', endTime: '11:40', color: '#14b8a6', day: 'Fri' },
  { period: 5, subject: 'Art', teacher: 'Ms. Braun', room: 'Studio-2', startTime: '11:50', endTime: '12:35', color: '#f97316', day: 'Fri' },
  { period: 6, subject: 'PE', teacher: 'Mr. König', room: 'Gym', startTime: '13:30', endTime: '14:15', color: '#22c55e', day: 'Fri' },
]

// ─── Homework ────────────────────────────────────────────────────────────────

export type HomeworkPriority = 'high' | 'medium' | 'low'

export interface HomeworkItem {
  id: string
  subject: string
  title: string
  deadline: string
  priority: HomeworkPriority
  completion: number
  color: string
}

export const HOMEWORK: HomeworkItem[] = [
  { id: 'hw-1', subject: 'Mathematics', title: 'Multiplication Tables Practice', deadline: '2026-07-05', priority: 'high', completion: 60, color: '#9333ea' },
  { id: 'hw-2', subject: 'English', title: "Read Chapter 5 – Charlotte's Web", deadline: '2026-07-06', priority: 'medium', completion: 40, color: '#ec4899' },
  { id: 'hw-3', subject: 'German', title: 'Write 10 sentences using Artikel', deadline: '2026-07-07', priority: 'high', completion: 20, color: '#f59e0b' },
  { id: 'hw-4', subject: 'Science', title: 'Draw and label plant cell', deadline: '2026-07-08', priority: 'low', completion: 80, color: '#14b8a6' },
  { id: 'hw-5', subject: 'Art', title: 'Colour mixing exercise', deadline: '2026-07-09', priority: 'low', completion: 100, color: '#f97316' },
]

// ─── Grades ──────────────────────────────────────────────────────────────────

export interface SubjectGrade {
  subject: string
  score: number
  maxScore: number
  grade: string
  color: string
  teacher: string
}

export const GRADES: SubjectGrade[] = [
  { subject: 'Mathematics', score: 92, maxScore: 100, grade: 'A', color: '#9333ea', teacher: 'Mr. Weber' },
  { subject: 'English', score: 88, maxScore: 100, grade: 'B+', color: '#ec4899', teacher: 'Ms. Smith' },
  { subject: 'German', score: 85, maxScore: 100, grade: 'B', color: '#f59e0b', teacher: 'Mrs. Müller' },
  { subject: 'Science', score: 94, maxScore: 100, grade: 'A', color: '#14b8a6', teacher: 'Dr. Fischer' },
  { subject: 'Computer Science', score: 96, maxScore: 100, grade: 'A+', color: '#6366f1', teacher: 'Mr. Neumann' },
  { subject: 'Art', score: 90, maxScore: 100, grade: 'A-', color: '#f97316', teacher: 'Ms. Braun' },
  { subject: 'Music', score: 87, maxScore: 100, grade: 'B+', color: '#8b5cf6', teacher: 'Ms. Keller' },
  { subject: 'PE', score: 95, maxScore: 100, grade: 'A', color: '#22c55e', teacher: 'Mr. König' },
]

// ─── Achievements ────────────────────────────────────────────────────────────

export interface AchievementItem {
  id: string
  title: string
  description: string
  emoji: string
  earned: boolean
  earnedDate?: string
  color: string
  bgColor: string
}

export const ACHIEVEMENTS: AchievementItem[] = [
  { id: 'ach-1', title: 'Gold Star', description: 'Scored 100% in a test', emoji: '⭐', earned: true, earnedDate: '2026-06-15', color: '#f59e0b', bgColor: 'bg-amber-50 dark:bg-amber-500/10' },
  { id: 'ach-2', title: 'Perfect Attendance', description: '30 days without absence', emoji: '🏆', earned: true, earnedDate: '2026-06-01', color: '#22c55e', bgColor: 'bg-green-50 dark:bg-green-500/10' },
  { id: 'ach-3', title: 'Fast Learner', description: 'Completed 5 chapters ahead', emoji: '🚀', earned: true, earnedDate: '2026-05-20', color: '#6366f1', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'ach-4', title: 'Quiz Champion', description: 'Won class quiz competition', emoji: '🥇', earned: true, earnedDate: '2026-06-28', color: '#9333ea', bgColor: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'ach-5', title: 'Reading Streak', description: '14 days reading streak', emoji: '📚', earned: true, earnedDate: '2026-07-01', color: '#ec4899', bgColor: 'bg-pink-50 dark:bg-pink-500/10' },
  { id: 'ach-6', title: 'Math Wizard', description: 'Solve 100 math problems', emoji: '🧮', earned: false, color: '#64748b', bgColor: 'bg-gray-50 dark:bg-gray-800' },
  { id: 'ach-7', title: 'Science Star', description: 'Complete all science labs', emoji: '🔬', earned: false, color: '#64748b', bgColor: 'bg-gray-50 dark:bg-gray-800' },
  { id: 'ach-8', title: 'Art Master', description: 'Submit 10 art projects', emoji: '🎨', earned: false, color: '#64748b', bgColor: 'bg-gray-50 dark:bg-gray-800' },
]

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  name: string
  grade: string
  house: string
  xp: number
  level: number
  avatar: string
  isCurrentUser?: boolean
  houseColor: string
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Liam Müller',    grade: '4A', house: 'Red House',    xp: 3200, level: 15, avatar: 'L', houseColor: '#ef4444' },
  { rank: 2, name: 'Sophie Wagner',  grade: '4B', house: 'Green House',  xp: 2800, level: 13, avatar: 'S', houseColor: '#22c55e' },
  { rank: 3, name: 'Emma Johnson',   grade: '4A', house: 'Blue House',   xp: 2450, level: 12, avatar: 'E', houseColor: '#3b82f6', isCurrentUser: true },
  { rank: 4, name: 'Noah Fischer',   grade: '4A', house: 'Yellow House', xp: 2300, level: 11, avatar: 'N', houseColor: '#f59e0b' },
  { rank: 5, name: 'Mia Schneider',  grade: '4C', house: 'Red House',    xp: 2100, level: 11, avatar: 'M', houseColor: '#ef4444' },
  { rank: 6, name: 'Felix Bauer',    grade: '4B', house: 'Green House',  xp: 1980, level: 10, avatar: 'F', houseColor: '#22c55e' },
  { rank: 7, name: 'Lea Weber',      grade: '4A', house: 'Blue House',   xp: 1850, level: 9,  avatar: 'L', houseColor: '#3b82f6' },
  { rank: 8, name: 'Jonas Klein',    grade: '4C', house: 'Yellow House', xp: 1720, level: 9,  avatar: 'J', houseColor: '#f59e0b' },
  { rank: 9, name: 'Hannah Braun',   grade: '4B', house: 'Red House',    xp: 1600, level: 8,  avatar: 'H', houseColor: '#ef4444' },
  { rank: 10, name: 'Tim Hoffmann',  grade: '4A', house: 'Green House',  xp: 1500, level: 8,  avatar: 'T', houseColor: '#22c55e' },
]

// ─── Calendar Events ─────────────────────────────────────────────────────────

export type EventType = 'exam' | 'event' | 'meeting' | 'holiday'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: EventType
  color: string
  emoji: string
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ev-1', title: 'Math Quiz',       date: '2026-07-08', type: 'exam',    color: '#9333ea', emoji: '📝' },
  { id: 'ev-2', title: 'Sports Day',      date: '2026-07-10', type: 'event',   color: '#22c55e', emoji: '🏃' },
  { id: 'ev-3', title: 'Science Fair',    date: '2026-07-15', type: 'event',   color: '#14b8a6', emoji: '🔬' },
  { id: 'ev-4', title: 'Parent Meeting',  date: '2026-07-18', type: 'meeting', color: '#f59e0b', emoji: '👨‍👩‍👧' },
  { id: 'ev-5', title: 'Art Exhibition',  date: '2026-07-22', type: 'event',   color: '#f97316', emoji: '🎨' },
]

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotifType = 'reminder' | 'message' | 'announcement' | 'exam'

export interface StudentNotification {
  id: string
  title: string
  message: string
  type: NotifType
  read: boolean
  time: string
  emoji: string
}

export const NOTIFICATIONS: StudentNotification[] = [
  { id: 'n-1', title: 'Homework Reminder',    message: 'Math multiplication tables due tomorrow!', type: 'reminder',     read: false, time: '2 hrs ago',  emoji: '📝' },
  { id: 'n-2', title: 'Teacher Message',      message: 'Ms. Smith: Great work on your essay, Emma!', type: 'message',  read: false, time: '4 hrs ago',  emoji: '💬' },
  { id: 'n-3', title: 'School Announcement',  message: 'Sports Day this Friday – bring your PE kit!', type: 'announcement', read: true, time: '1 day ago', emoji: '📣' },
  { id: 'n-4', title: 'Exam Reminder',        message: 'Math Quiz next Tuesday. Study chapters 7–9.', type: 'exam',     read: false, time: '2 days ago', emoji: '⚠️' },
]

// ─── Career Suggestions ──────────────────────────────────────────────────────

export interface CareerSuggestion {
  career: string
  emoji: string
  reason: string
  color: string
  bgColor: string
  match: number
}

export const CAREER_SUGGESTIONS: CareerSuggestion[] = [
  {
    career: 'Scientist',
    emoji: '🔬',
    reason: 'Your top grades in Science (94%) and natural curiosity make you a perfect fit for scientific research and discovery.',
    color: '#14b8a6',
    bgColor: 'bg-teal-50 dark:bg-teal-500/10',
    match: 95,
  },
  {
    career: 'Engineer',
    emoji: '⚙️',
    reason: 'Excellent performance in Maths (92%) and Computer Science (96%) shows strong analytical and problem-solving skills.',
    color: '#6366f1',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    match: 90,
  },
  {
    career: 'Doctor',
    emoji: '🩺',
    reason: 'Your empathy, high science grades, and dedication to learning are key traits for a successful medical career.',
    color: '#ec4899',
    bgColor: 'bg-pink-50 dark:bg-pink-500/10',
    match: 85,
  },
  {
    career: 'Teacher',
    emoji: '👩‍🏫',
    reason: 'You have a helping nature and explain concepts clearly to peers. Your balanced performance across all subjects is ideal.',
    color: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    match: 82,
  },
]

// ─── Study Plan ──────────────────────────────────────────────────────────────

export const STUDY_PLAN = {
  todayGoal: 'Complete Math homework & review English notes',
  weeklyGoal: 'Finish Science chapter 8 and prepare for Math Quiz',
  todayProgress: 65,
  weeklyProgress: 45,
  studyStreak: 7,
  totalStudyHours: 28,
} as const

// ─── AI Tutor ────────────────────────────────────────────────────────────────

export const AI_TUTOR_QUESTIONS = [
  'Explain fractions with fun examples 🍕',
  'What is photosynthesis? 🌿',
  'Help me practice German Artikel 🇩🇪',
  'Quiz me on multiplication tables 🔢',
  'Tell me about the solar system 🪐',
] as const

// ─── Attendance ──────────────────────────────────────────────────────────────

export const ATTENDANCE_STATS = {
  present: 22,
  absent: 1,
  late: 1,
  total: 24,
} as const

// ─── Assignments ─────────────────────────────────────────────────────────────

export const ASSIGNMENT_STATS = {
  pending: 2,
  submitted: 5,
  late: 1,
  completed: 12,
} as const

// ─── Motivational Quotes ─────────────────────────────────────────────────────

export const MOTIVATIONAL_QUOTES = [
  { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { quote: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
] as const
