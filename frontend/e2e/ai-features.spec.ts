import { expect, test } from '@playwright/test'
import { loginAsDemo } from './helpers'

test.describe('AI features (Demo Mode — no external AI provider is ever called)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'Student')
  })

  test('AI Tutor: sending a message renders a simulated reply without calling the backend', async ({ page }) => {
    // Only POSTs to the backend count as real AI calls — Vite serves source modules (GET) from
    // paths like /src/components/ai/AIChatPanel.tsx, which would otherwise false-positive here.
    const aiRequests: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/ai/')) aiRequests.push(req.url())
    })

    await page.goto('/student/ai-tutor')
    await page.getByRole('button', { name: /multiplication tables/i }).click()

    await expect(page.getByText(/56/)).toBeVisible({ timeout: 5000 })
    expect(aiRequests).toHaveLength(0)
  })

  test('Study Planner: generating a plan renders simulated content without calling the backend', async ({ page }) => {
    // Only POSTs to the backend count as real AI calls — Vite serves source modules (GET) from
    // paths like /src/components/ai/AIChatPanel.tsx, which would otherwise false-positive here.
    const aiRequests: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/ai/')) aiRequests.push(req.url())
    })

    await page.goto('/student/study-planner')
    await page.getByRole('button', { name: /generate with ai/i }).click()

    await expect(page.getByText(/demo mode/i)).toBeVisible({ timeout: 5000 })
    expect(aiRequests).toHaveLength(0)
  })
})
