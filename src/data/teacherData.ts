import type {
  ClassAttendanceRecord,
  ClassGrade,
  ClassMessage,
  TeacherAssignment,
  TeacherClass,
  TeacherHomework,
  TeacherNotification,
  TeacherProfile,
  WellbeingAnonymousData,
} from '../types/teacher'

// ─── Teacher Profile ────────────────────────────────────────────────────────

export const TEACHER_PROFILE: TeacherProfile = {
  teacherId: 'teacher-kathrin',
  name: 'Kathrin Mueller',
  firstName: 'Kathrin',
  lastName: 'Mueller',
  email: 'kathrin@dis.edu',
  subjects: ['Mathematics', 'Science'],
  assignedClasses: [],
  profilePhoto:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=80',
  bio: 'Passionate educator with 8 years of experience in Mathematics and Science.',
  experience: '8 years',
}

// ─── Classes ────────────────────────────────────────────────────────────────

export const TEACHER_CLASSES: TeacherClass[] = [
  {
    id: 'class-grade-4a',
    name: 'Grade 4A',
    grade: '4',
    subject: 'Mathematics',
    studentCount: 24,
    students: [
      {
        id: 'student-krn',
        name: 'Kiran Patel',
        photo:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 96,
        averageGrade: 'A-',
        wellbeingStatus: 'focused',
        assignmentsDue: 1,
      },
      {
        id: 'student-ava',
        name: 'Ava Collins',
        photo:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 92,
        averageGrade: 'B+',
        wellbeingStatus: 'happy',
        assignmentsDue: 2,
      },
      {
        id: 'student-noah',
        name: 'Noah Rivera',
        photo:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 88,
        averageGrade: 'B',
        wellbeingStatus: 'neutral',
        assignmentsDue: 0,
      },
    ],
    schedule: [
      {
        id: 'slot-1',
        subject: 'Mathematics',
        day: 'Mon',
        startTime: '09:00',
        endTime: '10:00',
        room: 'A-201',
        color: '#9333ea',
      },
      {
        id: 'slot-2',
        subject: 'Mathematics',
        day: 'Wed',
        startTime: '09:00',
        endTime: '10:00',
        room: 'A-201',
        color: '#9333ea',
      },
      {
        id: 'slot-3',
        subject: 'Mathematics',
        day: 'Fri',
        startTime: '09:00',
        endTime: '10:00',
        room: 'A-201',
        color: '#9333ea',
      },
    ],
    upcomingExam: {
      id: 'exam-1',
      subject: 'Mathematics',
      date: '2026-07-15',
      topic: 'Fractions and Decimals',
    },
    nextLesson: {
      id: 'slot-1',
      subject: 'Mathematics',
      day: 'Fri',
      startTime: '09:00',
      endTime: '10:00',
      room: 'A-201',
      color: '#9333ea',
    },
  },
  {
    id: 'class-grade-5a',
    name: 'Grade 5A',
    grade: '5',
    subject: 'Science',
    studentCount: 22,
    students: [
      {
        id: 'student-emma',
        name: 'Emma Thompson',
        photo:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 98,
        averageGrade: 'A',
        wellbeingStatus: 'focused',
        assignmentsDue: 0,
      },
      {
        id: 'student-liam',
        name: 'Liam Mueller',
        photo:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 94,
        averageGrade: 'A-',
        wellbeingStatus: 'happy',
        assignmentsDue: 1,
      },
    ],
    schedule: [
      {
        id: 'slot-4',
        subject: 'Science',
        day: 'Tue',
        startTime: '10:30',
        endTime: '11:30',
        room: 'Lab-1',
        color: '#14b8a6',
      },
      {
        id: 'slot-5',
        subject: 'Science',
        day: 'Thu',
        startTime: '10:30',
        endTime: '11:30',
        room: 'Lab-1',
        color: '#14b8a6',
      },
    ],
    upcomingExam: {
      id: 'exam-2',
      subject: 'Science',
      date: '2026-07-20',
      topic: 'Photosynthesis & Cell Division',
    },
    nextLesson: {
      id: 'slot-4',
      subject: 'Science',
      day: 'Tue',
      startTime: '10:30',
      endTime: '11:30',
      room: 'Lab-1',
      color: '#14b8a6',
    },
  },
  {
    id: 'class-grade-6a',
    name: 'Grade 6A',
    grade: '6',
    subject: 'Mathematics',
    studentCount: 20,
    students: [
      {
        id: 'student-sophie',
        name: 'Sophie Wagner',
        photo:
          'https://images.unsplash.com/photo-1517046220202-51e82f21e6b9?auto=format&fit=crop&w=480&q=80',
        attendancePercent: 100,
        averageGrade: 'A+',
        wellbeingStatus: 'focused',
        assignmentsDue: 0,
      },
    ],
    schedule: [
      {
        id: 'slot-6',
        subject: 'Mathematics',
        day: 'Mon',
        startTime: '14:00',
        endTime: '15:00',
        room: 'A-302',
        color: '#9333ea',
      },
      {
        id: 'slot-7',
        subject: 'Mathematics',
        day: 'Wed',
        startTime: '14:00',
        endTime: '15:00',
        room: 'A-302',
        color: '#9333ea',
      },
    ],
    upcomingExam: {
      id: 'exam-3',
      subject: 'Mathematics',
      date: '2026-07-25',
      topic: 'Algebra & Linear Equations',
    },
  },
]

// ─── Attendance ─────────────────────────────────────────────────────────────

export const CLASS_ATTENDANCE_RECORDS: ClassAttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'student-krn',
    studentName: 'Kiran Patel',
    date: '2026-07-04',
    status: 'present',
    subject: 'Mathematics',
  },
  {
    id: 'att-2',
    studentId: 'student-ava',
    studentName: 'Ava Collins',
    date: '2026-07-04',
    status: 'present',
    subject: 'Mathematics',
  },
  {
    id: 'att-3',
    studentId: 'student-noah',
    studentName: 'Noah Rivera',
    date: '2026-07-04',
    status: 'absent',
    subject: 'Mathematics',
  },
]

// ─── Homework ───────────────────────────────────────────────────────────────

export const CLASS_HOMEWORK: TeacherHomework[] = [
  {
    id: 'hw-1',
    classId: 'class-grade-4a',
    title: 'Fractions Worksheet',
    subject: 'Mathematics',
    description: 'Complete exercises 1-15 from the textbook on fractions.',
    dueDate: '2026-07-07',
    createdAt: '2026-07-04',
    submissions: [
      { id: 'sub-1', studentId: 'student-krn', studentName: 'Kiran Patel', status: 'submitted', submittedAt: '2026-07-05' },
      { id: 'sub-2', studentId: 'student-ava', studentName: 'Ava Collins', status: 'submitted', submittedAt: '2026-07-06' },
      { id: 'sub-3', studentId: 'student-noah', studentName: 'Noah Rivera', status: 'pending' },
    ],
    totalStudents: 24,
  },
  {
    id: 'hw-2',
    classId: 'class-grade-4a',
    title: 'Decimals Practice',
    subject: 'Mathematics',
    description: 'Practice decimal operations and conversions.',
    dueDate: '2026-07-09',
    createdAt: '2026-07-04',
    submissions: [
      { id: 'sub-4', studentId: 'student-krn', studentName: 'Kiran Patel', status: 'pending' },
      { id: 'sub-5', studentId: 'student-ava', studentName: 'Ava Collins', status: 'pending' },
      { id: 'sub-6', studentId: 'student-noah', studentName: 'Noah Rivera', status: 'pending' },
    ],
    totalStudents: 24,
  },
]

// ─── Assignments ────────────────────────────────────────────────────────────

export const CLASS_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 'assign-1',
    classId: 'class-grade-4a',
    title: 'Fractions Test',
    subject: 'Mathematics',
    description: 'Comprehensive test on fractions and their operations.',
    dueDate: '2026-07-10',
    createdAt: '2026-07-01',
    maxScore: 100,
    submissions: [
      {
        id: 'assign-sub-1',
        studentId: 'student-krn',
        studentName: 'Kiran Patel',
        status: 'graded',
        score: 92,
        submittedAt: '2026-07-08',
      },
      {
        id: 'assign-sub-2',
        studentId: 'student-ava',
        studentName: 'Ava Collins',
        status: 'graded',
        score: 85,
        submittedAt: '2026-07-08',
      },
      {
        id: 'assign-sub-3',
        studentId: 'student-noah',
        studentName: 'Noah Rivera',
        status: 'pending',
      },
    ],
    totalStudents: 24,
  },
]

// ─── Grades ─────────────────────────────────────────────────────────────────

export const CLASS_GRADES: ClassGrade[] = [
  {
    studentId: 'student-krn',
    studentName: 'Kiran Patel',
    subject: 'Mathematics',
    score: 92,
    maxScore: 100,
    grade: 'A',
    date: '2026-07-04',
  },
  {
    studentId: 'student-ava',
    studentName: 'Ava Collins',
    subject: 'Mathematics',
    score: 88,
    maxScore: 100,
    grade: 'B+',
    date: '2026-07-04',
  },
  {
    studentId: 'student-noah',
    studentName: 'Noah Rivera',
    subject: 'Mathematics',
    score: 76,
    maxScore: 100,
    grade: 'C+',
    date: '2026-07-04',
  },
]

// ─── Messages ────────────────────────────────────────────────────────────────

export const CLASS_MESSAGES: ClassMessage[] = [
  {
    id: 'msg-1',
    classId: 'class-grade-4a',
    senderId: 'parent-001',
    senderName: 'Mrs. Patel',
    senderRole: 'parent',
    message: 'Hi Ms. Mueller, How is Kiran progressing in Mathematics?',
    timestamp: '2026-07-03T15:30:00',
    isRead: true,
  },
  {
    id: 'msg-2',
    classId: 'class-grade-4a',
    senderId: 'teacher-kathrin',
    senderName: 'Ms. Mueller',
    senderRole: 'teacher',
    message:
      'Kiran is doing excellently! Very consistent performance and excellent participation.',
    timestamp: '2026-07-03T16:45:00',
    isRead: true,
  },
  {
    id: 'msg-3',
    classId: 'class-grade-4a',
    senderId: 'parent-002',
    senderName: 'Mr. Collins',
    senderRole: 'parent',
    message:
      'Ava mentioned she finds the recent assignments challenging. Can we discuss support options?',
    timestamp: '2026-07-04T08:15:00',
    isRead: false,
  },
]

// ─── Notifications ──────────────────────────────────────────────────────────

export const TEACHER_NOTIFICATIONS: TeacherNotification[] = [
  {
    id: 'notif-1',
    title: 'Attendance Pending',
    message: 'Mark attendance for Grade 4A Mathematics class today.',
    type: 'attendance',
    classId: 'class-grade-4a',
    read: false,
    timestamp: '2026-07-04T09:00:00',
  },
  {
    id: 'notif-2',
    title: 'Assignment Submitted',
    message: 'Kiran Patel submitted "Fractions Test" assignment.',
    type: 'assignment',
    classId: 'class-grade-4a',
    studentId: 'student-krn',
    read: false,
    timestamp: '2026-07-04T10:30:00',
  },
  {
    id: 'notif-3',
    title: 'Parent Message',
    message: 'New message from Mr. Collins about Ava Collins.',
    type: 'message',
    classId: 'class-grade-4a',
    read: false,
    timestamp: '2026-07-04T08:20:00',
  },
  {
    id: 'notif-4',
    title: 'School Announcement',
    message: 'Staff meeting scheduled for Friday at 3:00 PM.',
    type: 'announcement',
    read: true,
    timestamp: '2026-07-03T14:00:00',
  },
]

// ─── Wellbeing Anonymous Data ───────────────────────────────────────────────

export const CLASS_WELLBEING: Record<string, WellbeingAnonymousData> = {
  'class-grade-4a': {
    classId: 'class-grade-4a',
    moodDistribution: {
      happy: 8,
      focused: 10,
      neutral: 4,
      needsSupport: 2,
    },
    weeklyTrend: [
      { label: 'Mon', happy: 7, focused: 9, neutral: 5, needsSupport: 3 },
      { label: 'Tue', happy: 8, focused: 10, neutral: 4, needsSupport: 2 },
      { label: 'Wed', happy: 9, focused: 8, neutral: 5, needsSupport: 2 },
      { label: 'Thu', happy: 8, focused: 11, neutral: 3, needsSupport: 2 },
      { label: 'Fri', happy: 10, focused: 9, neutral: 3, needsSupport: 2 },
    ],
    studentsRequestingSupport: [
      {
        studentId: 'student-006',
        studentName: 'Anonymous Student 1',
        emotion: 'anxious',
        timestamp: '2026-07-03T14:20:00',
        stress: 75,
      },
      {
        studentId: 'student-007',
        studentName: 'Anonymous Student 2',
        emotion: 'overwhelmed',
        timestamp: '2026-07-02T11:45:00',
        stress: 82,
      },
    ],
  },
  'class-grade-5a': {
    classId: 'class-grade-5a',
    moodDistribution: {
      happy: 9,
      focused: 11,
      neutral: 2,
      needsSupport: 0,
    },
    weeklyTrend: [
      { label: 'Mon', happy: 8, focused: 10, neutral: 3, needsSupport: 1 },
      { label: 'Tue', happy: 9, focused: 11, neutral: 2, needsSupport: 0 },
      { label: 'Wed', happy: 9, focused: 12, neutral: 1, needsSupport: 0 },
      { label: 'Thu', happy: 10, focused: 10, neutral: 2, needsSupport: 0 },
      { label: 'Fri', happy: 9, focused: 11, neutral: 2, needsSupport: 0 },
    ],
    studentsRequestingSupport: [],
  },
  'class-grade-6a': {
    classId: 'class-grade-6a',
    moodDistribution: {
      happy: 7,
      focused: 9,
      neutral: 3,
      needsSupport: 1,
    },
    weeklyTrend: [
      { label: 'Mon', happy: 6, focused: 8, neutral: 4, needsSupport: 2 },
      { label: 'Tue', happy: 7, focused: 9, neutral: 3, needsSupport: 1 },
      { label: 'Wed', happy: 7, focused: 10, neutral: 2, needsSupport: 1 },
      { label: 'Thu', happy: 8, focused: 9, neutral: 3, needsSupport: 0 },
      { label: 'Fri', happy: 7, focused: 9, neutral: 3, needsSupport: 1 },
    ],
    studentsRequestingSupport: [
      {
        studentId: 'student-010',
        studentName: 'Anonymous Student 3',
        emotion: 'stressed',
        timestamp: '2026-07-04T09:30:00',
        stress: 68,
      },
    ],
  },
}
