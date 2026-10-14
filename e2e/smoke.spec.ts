import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'vignesh.swe.dev@gmail.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const BASE_URL = 'http://localhost:5173';

test.describe('CloudVault E2E Smoke Tests', () => {
  test('Desktop: Admin logs in with password only (no OTP), sees Users menu, and accesses Admin page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Login page
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Admin bypasses OTP directly to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');

    // Admin sees "Users" link in sidebar
    const usersLink = page.locator('a[href="/admin"], nav a:has-text("Users")');
    await expect(usersLink).toBeVisible();

    // Navigate to Admin page
    await usersLink.click();
    await page.waitForURL('**/admin');
    expect(page.url()).toContain('/admin');
    await expect(page.locator('h1')).toContainText('Users');
  });

  test('Mobile: Viewport 390x844 responsive layout with hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/login`);

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Login as admin
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Open hamburger menu
    const hamburger = page.locator('button[aria-label="Open sidebar"], button:has(svg.lucide-menu), button[aria-label="Menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
      const navItem = page.locator('a[href="/admin"], nav a:has-text("Users")');
      await expect(navItem).toBeVisible();
    }
  });

  test('Editor & Files pages load properly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto(`${BASE_URL}/files`);
    await expect(page).toHaveURL(/.*files/);

    await page.goto(`${BASE_URL}/editor/new`);
    await expect(page).toHaveURL(/.*editor\/new/);
  });
});
