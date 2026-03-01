import { test, expect } from '@playwright/test'

test('home page loads and CTA navigates to workspace', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Master AWS Architecture Through Practice' })
  ).toBeVisible()

  await expect(page.getByRole('button', { name: 'Register Free →' })).toBeVisible()

  await page.getByRole('button', { name: 'Start architecting →' }).click()

  await expect(page).toHaveURL(/\/workspace/)
  await expect(page.getByRole('heading', { name: 'Scenarios' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Grade Solution' })).toBeDisabled()
})
