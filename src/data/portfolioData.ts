import type {
  PortfolioAiLearningInsights,
  PortfolioGoal,
  PortfolioParentNote,
  PortfolioSkillItem,
  PortfolioTeacherNote,
  PortfolioTimelineItem,
  PortfolioWellbeingPoint,
} from '../types/portfolio'

export interface PortfolioSeedStudent {
  studentId: string
  className: string
  rollNumber: string
  academicYear: string
  volunteerHours: number
}

export const PORTFOLIO_SEED_STUDENTS: PortfolioSeedStudent[] = [
  {
    studentId: 'student-krn',
    className: '7A',
    rollNumber: '12',
    academicYear: '2026-2027',
    volunteerHours: 18,
  },
  {
    studentId: 'student-ava',
    className: '6B',
    rollNumber: '8',
    academicYear: '2026-2027',
    volunteerHours: 12,
  },
  {
    studentId: 'student-noah',
    className: '8A',
    rollNumber: '4',
    academicYear: '2026-2027',
    volunteerHours: 21,
  },
]

export const PORTFOLIO_SKILLS: Record<string, PortfolioSkillItem[]> = {
  'student-krn': [
    { name: 'Leadership', proficiency: 82 },
    { name: 'Problem Solving', proficiency: 91 },
    { name: 'Teamwork', proficiency: 86 },
    { name: 'Communication', proficiency: 78 },
    { name: 'Critical Thinking', proficiency: 89 },
    { name: 'Creativity', proficiency: 80 },
    { name: 'Coding', proficiency: 92 },
    { name: 'Public Speaking', proficiency: 74 },
    { name: 'Digital Literacy', proficiency: 94 },
  ],
  'student-ava': [
    { name: 'Leadership', proficiency: 71 },
    { name: 'Problem Solving', proficiency: 84 },
    { name: 'Teamwork', proficiency: 89 },
    { name: 'Communication', proficiency: 81 },
    { name: 'Critical Thinking', proficiency: 79 },
    { name: 'Creativity', proficiency: 92 },
    { name: 'Coding', proficiency: 72 },
    { name: 'Public Speaking', proficiency: 88 },
    { name: 'Digital Literacy', proficiency: 83 },
  ],
  'student-noah': [
    { name: 'Leadership', proficiency: 88 },
    { name: 'Problem Solving', proficiency: 86 },
    { name: 'Teamwork', proficiency: 83 },
    { name: 'Communication', proficiency: 76 },
    { name: 'Critical Thinking', proficiency: 87 },
    { name: 'Creativity', proficiency: 79 },
    { name: 'Coding', proficiency: 85 },
    { name: 'Public Speaking', proficiency: 73 },
    { name: 'Digital Literacy', proficiency: 90 },
  ],
}

export const PORTFOLIO_AI_INSIGHTS: Record<string, PortfolioAiLearningInsights> = {
  'student-krn': {
    strongSubjects: ['Mathematics', 'Computer Science', 'Science'],
    improvingSubjects: ['German', 'History'],
    learningStyle: 'Analytical + Visual',
    personalitySummary: 'Curious, systematic, and collaborative learner with strong logic skills.',
    recommendedLearningPath:
      'Advanced STEM track + interdisciplinary project-based modules with peer mentoring.',
    careerSuggestions: ['Robotics Engineer', 'Data Scientist', 'Product Designer'],
  },
  'student-ava': {
    strongSubjects: ['Language', 'Arts', 'Music'],
    improvingSubjects: ['Mathematics'],
    learningStyle: 'Creative + Social',
    personalitySummary: 'Expressive learner with high collaboration and communication strengths.',
    recommendedLearningPath:
      'Creative communication track with project showcases and collaborative studios.',
    careerSuggestions: ['Journalist', 'UX Writer', 'Media Producer'],
  },
  'student-noah': {
    strongSubjects: ['Science', 'Sports', 'Technology'],
    improvingSubjects: ['Literature'],
    learningStyle: 'Kinesthetic + Practical',
    personalitySummary: 'Hands-on learner who thrives in experimentation and team activities.',
    recommendedLearningPath:
      'Applied science track with lab-based projects and leadership opportunities.',
    careerSuggestions: ['Sports Scientist', 'Mechanical Engineer', 'Physiotherapist'],
  },
}

export const PORTFOLIO_WEEKLY_WELLBEING: Record<string, PortfolioWellbeingPoint[]> = {
  'student-krn': [
    { label: 'Mon', wellbeingScore: 78, stress: 28, energy: 71, mood: 'focused' },
    { label: 'Tue', wellbeingScore: 82, stress: 24, energy: 76, mood: 'happy' },
    { label: 'Wed', wellbeingScore: 75, stress: 33, energy: 69, mood: 'neutral' },
    { label: 'Thu', wellbeingScore: 84, stress: 21, energy: 81, mood: 'happy' },
    { label: 'Fri', wellbeingScore: 79, stress: 27, energy: 73, mood: 'focused' },
  ],
  'student-ava': [
    { label: 'Mon', wellbeingScore: 73, stress: 32, energy: 68, mood: 'calm' },
    { label: 'Tue', wellbeingScore: 77, stress: 28, energy: 72, mood: 'happy' },
    { label: 'Wed', wellbeingScore: 70, stress: 35, energy: 63, mood: 'tired' },
    { label: 'Thu', wellbeingScore: 76, stress: 29, energy: 70, mood: 'calm' },
    { label: 'Fri', wellbeingScore: 74, stress: 31, energy: 69, mood: 'focused' },
  ],
  'student-noah': [
    { label: 'Mon', wellbeingScore: 81, stress: 22, energy: 83, mood: 'happy' },
    { label: 'Tue', wellbeingScore: 79, stress: 24, energy: 79, mood: 'focused' },
    { label: 'Wed', wellbeingScore: 76, stress: 29, energy: 75, mood: 'neutral' },
    { label: 'Thu', wellbeingScore: 82, stress: 21, energy: 84, mood: 'happy' },
    { label: 'Fri', wellbeingScore: 80, stress: 23, energy: 82, mood: 'calm' },
  ],
}

export const PORTFOLIO_MONTHLY_WELLBEING: Record<string, PortfolioWellbeingPoint[]> = {
  'student-krn': [
    { label: 'Week 1', wellbeingScore: 77, stress: 30, energy: 70, mood: 'focused' },
    { label: 'Week 2', wellbeingScore: 80, stress: 27, energy: 73, mood: 'happy' },
    { label: 'Week 3', wellbeingScore: 82, stress: 23, energy: 78, mood: 'happy' },
    { label: 'Week 4', wellbeingScore: 79, stress: 26, energy: 75, mood: 'focused' },
  ],
  'student-ava': [
    { label: 'Week 1', wellbeingScore: 71, stress: 34, energy: 66, mood: 'neutral' },
    { label: 'Week 2', wellbeingScore: 74, stress: 30, energy: 69, mood: 'calm' },
    { label: 'Week 3', wellbeingScore: 76, stress: 29, energy: 71, mood: 'focused' },
    { label: 'Week 4', wellbeingScore: 75, stress: 30, energy: 70, mood: 'happy' },
  ],
  'student-noah': [
    { label: 'Week 1', wellbeingScore: 79, stress: 25, energy: 80, mood: 'focused' },
    { label: 'Week 2', wellbeingScore: 81, stress: 23, energy: 82, mood: 'happy' },
    { label: 'Week 3', wellbeingScore: 80, stress: 24, energy: 81, mood: 'happy' },
    { label: 'Week 4', wellbeingScore: 82, stress: 22, energy: 84, mood: 'calm' },
  ],
}

export const PORTFOLIO_TIMELINES: Record<string, PortfolioTimelineItem[]> = {
  'student-krn': [
    { id: 't1', date: '2026-04-03', title: 'Joined School', description: 'Started academic year in Class 7A.' },
    { id: 't2', date: '2026-04-18', title: 'Completed Personality Assessment', description: 'Learning style profile generated.' },
    { id: 't3', date: '2026-05-03', title: 'Reading Badge Earned', description: 'Completed reading streak challenge.' },
    { id: 't4', date: '2026-05-20', title: 'Football Tournament', description: 'Participated in city sports event.' },
    { id: 't5', date: '2026-06-05', title: 'Science Fair', description: 'Presented ecosystem prototype project.' },
    { id: 't6', date: '2026-06-20', title: 'Robotics Workshop', description: 'Built autonomous line follower robot.' },
    { id: 't7', date: '2026-06-28', title: 'Math Olympiad', description: 'Qualified for district round.' },
    { id: 't8', date: '2026-07-01', title: 'Volunteer Day', description: 'Completed community service drive.' },
    { id: 't9', date: '2026-07-02', title: 'Certificate Earned', description: 'Music performance certificate issued.' },
    { id: 't10', date: '2026-07-03', title: 'AI Tutor Milestone', description: 'Completed 12 AI tutor sessions.' },
    { id: 't11', date: '2026-07-08', title: 'End of Year Award', description: 'Recognized for STEM excellence.' },
  ],
  'student-ava': [
    { id: 'a1', date: '2026-04-05', title: 'Joined School', description: 'Started in Class 6B.' },
    { id: 'a2', date: '2026-05-12', title: 'Music Talent Badge', description: 'Top performance in school ensemble.' },
  ],
  'student-noah': [
    { id: 'n1', date: '2026-04-02', title: 'Joined School', description: 'Started in Class 8A.' },
    { id: 'n2', date: '2026-06-10', title: 'Sports Star Badge', description: 'Recognized for athletic performance.' },
  ],
}

export const PORTFOLIO_TEACHER_NOTES: Record<string, PortfolioTeacherNote[]> = {
  'student-krn': [
    {
      id: 'tn-1',
      date: '2026-07-01',
      teacher: 'Ms. Clara Winter',
      comment: 'Demonstrated excellent participation during event rehearsals.',
      category: 'Participation',
    },
    {
      id: 'tn-2',
      date: '2026-06-27',
      teacher: 'Mr. Weber',
      comment: 'Strong mathematical reasoning and peer support in class.',
      category: 'Academic',
    },
    {
      id: 'tn-3',
      date: '2026-06-15',
      teacher: 'Dr. Fischer',
      comment: 'Emerging leadership in science project teams.',
      category: 'Leadership',
    },
  ],
  'student-ava': [
    {
      id: 'tn-a1',
      date: '2026-07-02',
      teacher: 'Ms. Keller',
      comment: 'Excellent creativity and confidence in performances.',
      category: 'Participation',
    },
  ],
  'student-noah': [
    {
      id: 'tn-n1',
      date: '2026-07-02',
      teacher: 'Mr. König',
      comment: 'Great sportsmanship and punctuality.',
      category: 'Behaviour',
    },
  ],
}

export const PORTFOLIO_PARENT_NOTES: Record<string, PortfolioParentNote[]> = {
  'student-krn': [
    {
      id: 'pn-1',
      date: '2026-07-02',
      note: 'Kiran is highly motivated when learning involves hands-on projects.',
    },
  ],
  'student-ava': [
    {
      id: 'pn-a1',
      date: '2026-07-01',
      note: 'Ava enjoys music workshops and public presentations.',
    },
  ],
  'student-noah': [
    {
      id: 'pn-n1',
      date: '2026-07-01',
      note: 'Noah responds well to structured goals and sports routines.',
    },
  ],
}

export const PORTFOLIO_GOALS: Record<string, PortfolioGoal[]> = {
  'student-krn': [
    { id: 'g-1', title: 'Complete Math Olympiad training plan', status: 'current' },
    { id: 'g-2', title: 'Lead one team project showcase', status: 'current' },
    { id: 'g-3', title: 'Earn Coding Explorer badge', status: 'completed' },
    { id: 'g-4', title: 'Practice mindfulness 3x weekly', status: 'ai_suggested' },
  ],
  'student-ava': [
    { id: 'g-a1', title: 'Prepare for district music audition', status: 'current' },
    { id: 'g-a2', title: 'Publish school newsletter feature', status: 'ai_suggested' },
  ],
  'student-noah': [
    { id: 'g-n1', title: 'Improve presentation confidence', status: 'current' },
    { id: 'g-n2', title: 'Join robotics trial workshop', status: 'ai_suggested' },
  ],
}
