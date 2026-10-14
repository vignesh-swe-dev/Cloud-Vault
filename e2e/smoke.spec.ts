import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

for (const vp of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`${vp.name}: signup → note → upload → download → delete`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    const email = `e2e_${Date.now()}_${vp.name}@test.com`

    // signup
    await page.goto(`${BASE}/register`)
    await page.getByPlaceholder('Jane Smith').fill('E2E User')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('At least 8 characters').fill('Test@12345')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/dashboard/)

    // mobile: sidebar opens from the hamburger and the page does not scroll sideways
    if (vp.name === 'mobile') {
      await page.getByLabel('Open menu').click()
      await page.getByRole('link', { name: 'All Files' }).click()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      expect(overflow).toBeFalsy()
    } else {
      await page.getByRole('link', { name: 'All Files' }).click()
    }
    await expect(page).toHaveURL(/\/files/)

    // create a note, type, wait for autosave, reload, content persists
    await page.getByRole('button', { name: /New Note|^$/ }).first().click().catch(() => {})
    await page.locator('button:has(svg.lucide-sticky-note)').click()
    await expect(page).toHaveURL(/\/editor\//)
    const editor = page.locator('.monaco-editor').first()
    await editor.click()
    await page.keyboard.type('hello e2e note')
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.reload()
    await expect(page.locator('.monaco-editor')).toContainText('hello e2e note')

    // upload a small file
    await page.goto(`${BASE}/files`)
    await page.locator('button:has(svg.lucide-upload)').first().click()
    await page.locator('input[type="file"]').setInputFiles({
      name: 'e2e.txt', mimeType: 'text/plain', buffer: Buffer.from('upload test'),
    })
    await expect(page.getByText('e2e.txt').first()).toBeVisible({ timeout: 15000 })

    // download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has(svg.lucide-download)').first().click({ force: true }),
    ])
    expect(download.suggestedFilename()).toContain('e2e')

    // delete → appears in trash
    await page.locator('button:has(svg.lucide-trash-2)').last().click({ force: true })
    await page.goto(`${BASE}/trash`)
    await expect(page.getByText('e2e.txt').first()).toBeVisible()
  })
}
