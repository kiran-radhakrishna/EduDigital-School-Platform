import { expect, test } from '@playwright/test'
import { loginAsDemo } from './helpers'

test.describe('Student academic pages (Demo Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'Student')
  })

  test('Attendance page loads with a heading', async ({ page }) => {
    await page.goto('/student/attendance')
    await expect(page.getByRole('main').getByRole('heading', { name: /attendance/i }).first()).toBeVisible()
  })

  test('Assignments page loads with a heading', async ({ page }) => {
    await page.goto('/student/assignments')
    await expect(page.getByRole('main').getByRole('heading', { name: /assignment/i }).first()).toBeVisible()
  })

  test('Grades page loads with a heading', async ({ page }) => {
    await page.goto('/student/grades')
    await expect(page.getByRole('main').getByRole('heading', { name: /grade/i }).first()).toBeVisible()
  })

  test('Fees page loads with a heading', async ({ page }) => {
    await page.goto('/student/fees')
    await expect(page.getByRole('main').getByRole('heading', { name: /fee/i }).first()).toBeVisible()
  })
})
