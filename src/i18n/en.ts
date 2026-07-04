const en = {
  nav: {
    home: 'Home',
    features: 'Features',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
  },
  hero: {
    badge: 'Trusted by 500+ Schools Worldwide',
    title: 'The Future of',
    titleHighlight: 'School Management',
    subtitle:
      'EduDigital brings students, teachers, parents, and administrators together on one powerful, intuitive platform. Manage attendance, grades, timetables, and communication effortlessly.',
    ctaStudent: 'Student Login',
    ctaTeacher: 'Teacher Login',
    stats: {
      students: 'Students',
      teachers: 'Teachers',
      schools: 'Schools',
    },
  },
  features: {
    title: 'Everything Your School Needs',
    subtitle:
      'A complete digital ecosystem designed to simplify school administration and enhance learning outcomes.',
    items: [
      {
        title: 'Digital Classroom',
        description:
          'Deliver lessons, share resources, and engage students in a fully digital, interactive classroom environment.',
      },
      {
        title: 'Smart Attendance',
        description:
          'Automated attendance tracking with real-time notifications to parents and detailed analytics for teachers.',
      },
      {
        title: 'Grade Management',
        description:
          'Effortlessly record, calculate, and share grades with students and parents through a transparent grading system.',
      },
      {
        title: 'Parent Portal',
        description:
          "Keep parents informed with real-time access to their child's grades, attendance, and school announcements.",
      },
      {
        title: 'Schedule Management',
        description:
          'Create and manage complex timetables for classes, teachers, and rooms with intelligent conflict detection.',
      },
      {
        title: 'Analytics & Insights',
        description:
          'Data-driven insights into student performance, attendance trends, and institutional growth over time.',
      },
    ],
  },
  stats: {
    students: 'Active Students',
    teachers: 'Expert Teachers',
    schools: 'Partner Schools',
    countries: 'Countries',
  },
  testimonials: {
    title: 'Loved by Educators Everywhere',
    subtitle: 'See what our community has to say about EduDigital.',
    items: [
      {
        name: 'Sarah Johnson',
        role: 'Principal, Lincoln High School',
        text: 'EduDigital transformed how we manage our school. Attendance tracking alone saved us hundreds of hours every semester.',
        initial: 'S',
      },
      {
        name: 'Michael Chen',
        role: 'Mathematics Teacher',
        text: 'Grading and communicating with parents has never been easier. My students are more engaged than ever before.',
        initial: 'M',
      },
      {
        name: 'Amara Okafor',
        role: 'Parent of two students',
        text: "I love being able to check my children's progress in real time. The parent portal is intuitive and reassuring.",
        initial: 'A',
      },
    ],
  },
  auth: {
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    role: 'I am a',
    rememberMe: 'Remember me',
    submit: 'Submit',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUp: 'Sign up',
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    resetInstructions: "Enter your email and we'll send you instructions to reset your password.",
    checkEmail: 'Check Your Email',
    checkEmailText: "We've sent password reset instructions to your email address.",
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Sign in to continue to your dashboard',
    registerSubtitle: 'Create an account to get started',
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
    admin: 'Admin',
  },
  dashboard: {
    overview: 'Overview',
    assignments: 'Assignments',
    grades: 'Grades',
    attendance: 'Attendance',
    timetable: 'Timetable',
    subjects: 'Subjects',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    welcome: 'Welcome back',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    noData: 'No data available',
    viewAll: 'View All',
    all: 'All',
  },
}

export default en
export type Translations = typeof en
