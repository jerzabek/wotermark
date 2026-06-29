import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home page has the right title and visible h1', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Wotermark/)
  await expect(
    page.getByRole('heading', { level: 1, name: /watermark your images in bulk/i }),
  ).toBeVisible()
})

test('home page has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('navbar links reach the About and Contact pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'About' }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: /about wotermark/i })).toBeVisible()

  await page.getByRole('link', { name: 'Contact' }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: /^contact$/i })).toBeVisible()
})
