import { expect, test } from '@playwright/test'
import { loginAsDemo } from './helpers'

// Library and Inventory are real-database-only features (Phase 6) — in Demo Mode they must
// render without ever calling the backend, and say so, rather than showing live data.
test.describe('Library and Inventory stay isolated from the real database in Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'Administrator')
  })

  test('Library page loads and does not silently pretend to show real data', async ({ page }) => {
    const apiRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('localhost:5000')) apiRequests.push(req.url())
    })

    await page.goto('/admin/library')
    await expect(page.getByRole('main').getByRole('heading', { name: /library/i }).first()).toBeVisible()

    expect(apiRequests).toHaveLength(0)
  })

  test('Inventory page loads and does not silently pretend to show real data', async ({ page }) => {
    const apiRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('localhost:5000')) apiRequests.push(req.url())
    })

    await page.goto('/admin/inventory')
    await expect(page.getByRole('main').getByRole('heading', { name: /inventory/i }).first()).toBeVisible()

    expect(apiRequests).toHaveLength(0)
  })
})
