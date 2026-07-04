export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function gradeLetter(score: number, maxScore: number): string {
  const pct = percentage(score, maxScore)
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 10)
}
