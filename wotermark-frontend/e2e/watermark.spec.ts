import { expect, test } from '@playwright/test'

// 1x1 transparent PNG returned by the mocked backend for each processed image.
const TINY_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

test('uploading a watermark and images yields downloadable results', async ({ page }) => {
  await page.route('**/api/process-images', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ images: [TINY_PNG], errors: [null] }),
    }),
  )

  await page.goto('/')

  await page.getByLabel('Upload a watermark image').setInputFiles('e2e/fixtures/watermark.png')
  await page.getByLabel('Upload images to watermark').setInputFiles('e2e/fixtures/photo.png')

  await page.getByRole('button', { name: /process images/i }).click()

  await expect(page.getByRole('button', { name: /download all/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /download watermarked photo\.png/i })).toBeVisible()
})

test('a mix of succeeded and failed images offers downloads only for the successes', async ({ page }) => {
  await page.route('**/api/process-images', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ images: [TINY_PNG, null], errors: [null, 'Failed to decode image'] }),
    }),
  )

  await page.goto('/')
  await page.getByLabel('Upload a watermark image').setInputFiles('e2e/fixtures/watermark.png')
  await page.getByLabel('Upload images to watermark').setInputFiles([
    'e2e/fixtures/photo.png',
    'e2e/fixtures/photo2.png',
  ])
  await page.getByRole('button', { name: /process images/i }).click()

  // Success: per-image download + the batch download stays available.
  await expect(page.getByRole('button', { name: /download all/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /download watermarked photo\.png/i })).toBeVisible()
  // Failure: error shown, no download offered.
  await expect(page.getByText('Failed to decode image')).toBeVisible()
  await expect(page.getByRole('button', { name: /download watermarked photo2\.png/i })).toHaveCount(0)
})

test('when every image fails, no downloads are offered and each error is shown', async ({ page }) => {
  await page.route('**/api/process-images', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ images: [null, null], errors: ['First image failed', 'Second image failed'] }),
    }),
  )

  await page.goto('/')
  await page.getByLabel('Upload a watermark image').setInputFiles('e2e/fixtures/watermark.png')
  await page.getByLabel('Upload images to watermark').setInputFiles([
    'e2e/fixtures/photo.png',
    'e2e/fixtures/photo2.png',
  ])
  await page.getByRole('button', { name: /process images/i }).click()

  await expect(page.getByText('First image failed')).toBeVisible()
  await expect(page.getByText('Second image failed')).toBeVisible()
  await expect(page.getByRole('button', { name: /download all/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /download watermarked/i })).toHaveCount(0)
})
