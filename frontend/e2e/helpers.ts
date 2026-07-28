import type { Page } from '@playwright/test'

export type DemoRole = 'Student' | 'Teacher' | 'Parent' | 'Authority' | 'Administrator'

/** Logs in via a Demo Mode persona — never touches the backend, so no server needs to be running. */
export async function loginAsDemo(page: Page, role: DemoRole): Promise<void> {
  await page.goto('/login')
  await page.getByRole('button', { name: role, exact: false }).click()
  await page.getByRole('button', { name: /try demo/i }).click()
}
