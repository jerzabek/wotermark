import { expect, test } from '@playwright/test'

test('submitting the contact form shows a success message', async ({ page }) => {
  await page.route('**/api/contact', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success' }) }),
  )

  await page.goto('/contact')
  await page.getByLabel('Name').fill('Ada Lovelace')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Hello from an end-to-end test.')
  await page.getByRole('button', { name: /send message/i }).click()

  await expect(page.getByText(/your message has been sent/i)).toBeVisible()
})

test('a failed submission surfaces an error', async ({ page }) => {
  await page.route('**/api/contact', route =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Contact form is not configured' }),
    }),
  )

  await page.goto('/contact')
  await page.getByLabel('Name').fill('Ada')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Hi')
  await page.getByRole('button', { name: /send message/i }).click()

  await expect(page.getByText(/not configured/i)).toBeVisible()
})
