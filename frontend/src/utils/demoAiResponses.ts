/** Client-side canned responses for Demo Mode — never calls the backend or any external AI provider. */

const DEMO_INTROS: Record<string, string> = {
  homework: "Here's a hint to get you started — try breaking the problem into smaller steps before jumping to an answer.",
  career: 'Based on typical interests and strengths at your level, here are a few directions worth exploring.',
  teacher: "Here's a draft you can adapt for your class.",
  parent: "Here's a quick summary based on recent activity.",
  admin: "Here's a summary of recent school-wide trends.",
}

export function getGenericDemoResponse(feature: string, userMessage: string): string {
  const intro = DEMO_INTROS[feature] ?? "Here's a suggestion to help you move forward."
  const topic = userMessage.trim().slice(0, 80)
  return `${intro}\n\nRegarding "${topic}": this is a simulated Demo Mode response — no external AI provider was called. Sign in with a real account to use the live AI assistant.`
}

export function getDemoStudyPlan(): string {
  return [
    'Weekly Study Plan (Demo Mode — no external AI provider was called)',
    '',
    'Mon — Mathematics: 30 min, multiplication & fractions practice',
    'Tue — English: 25 min, reading + vocabulary review',
    'Wed — German: 25 min, Artikel grammar practice',
    'Thu — Science: 30 min, plant cell diagram + lab notes',
    'Fri — Revision: 40 min, review all subjects covered this week',
    'Sat — Light review: 20 min, flashcards for weak topics',
    'Sun — Rest day',
    '',
    'Sign in with a real account to generate a plan based on your actual attendance, grades, assignments, and timetable.',
  ].join('\n')
}
