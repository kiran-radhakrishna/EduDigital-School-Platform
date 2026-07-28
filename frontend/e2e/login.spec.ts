import { expect, test } from '@playwright/test'
import { loginAsDemo } from './helpers'

test('logs in as a demo student and lands on the student dashboard', async ({ page }) => {
  await loginAsDemo(page, 'Student')
  await expect(page).toHaveURL(/\/student\/dashboard/)
})

test('logs in as a demo teacher and lands on the teacher dashboard', async ({ page }) => {
  await loginAsDemo(page, 'Teacher')
  await expect(page).toHaveURL(/\/teacher\/dashboard/)
})

test('logs in as a demo parent and lands on the parent dashboard', async ({ page }) => {
  await loginAsDemo(page, 'Parent')
  await expect(page).toHaveURL(/\/parent\/dashboard/)
})

test('logs in as a demo administrator and lands on the admin dashboard', async ({ page }) => {
  await loginAsDemo(page, 'Administrator')
  await expect(page).toHaveURL(/\/admin\/dashboard/)
})
