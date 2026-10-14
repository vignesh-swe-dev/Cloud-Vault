import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const ADMIN_EMAIL = 'vignesh.swe.dev@gmail.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const BASE_URL = 'http://localhost:5173';

async function run() {
  console.log('Launching browser for e2e tests & screenshot capture...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1280x800)
  console.log('\n--- Running Desktop Tests & Screenshots (1280x800) ---');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await desktopCtx.newPage();

  // Visit Login Page
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_login_dark.png') });
  console.log('Captured desktop_login_dark.png');

  // Toggle Theme: Switch to Light mode
  const themeToggle = page.locator('button[aria-label="Toggle theme"], button[title*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop_login_light.png') });
    console.log('Captured desktop_login_light.png');
    // switch back to dark mode
    await themeToggle.click();
    await page.waitForTimeout(400);
  }

  // Visit Register Page and show OTP modal/state
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_register.png') });
  console.log('Captured desktop_register.png');

  // Admin Login (should bypass OTP!)
  console.log('Logging in as admin without OTP...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Should navigate directly to /dashboard without OTP prompt
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('Successfully logged in as admin directly to dashboard!');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_dashboard_dark.png') });
  console.log('Captured desktop_dashboard_dark.png');

  // Capture light mode dashboard
  const dashThemeToggle = page.locator('button[aria-label="Toggle theme"], button[title*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
  if (await dashThemeToggle.isVisible()) {
    await dashThemeToggle.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop_dashboard_light.png') });
    console.log('Captured desktop_dashboard_light.png');
    await dashThemeToggle.click();
    await page.waitForTimeout(400);
  }

  // Verify Admin sidebar link
  const usersNav = page.locator('a[href="/admin"], nav a:has-text("Users")');
  const hasUsersNav = await usersNav.isVisible();
  console.log('Admin "Users" nav link visible in sidebar:', hasUsersNav);
  if (!hasUsersNav) throw new Error('Admin "Users" link not visible for admin user!');

  // Navigate to Admin Page
  await usersNav.click();
  await page.waitForURL('**/admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_admin_page.png') });
  console.log('Captured desktop_admin_page.png');

  // Navigate to Files Page
  await page.click('a[href="/files"]');
  await page.waitForURL('**/files');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_files_page.png') });
  console.log('Captured desktop_files_page.png');

  // Test Note/Editor Page
  await page.goto(`${BASE_URL}/editor/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_editor_page.png') });
  console.log('Captured desktop_editor_page.png');

  // Test Media Page
  await page.goto(`${BASE_URL}/media`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_media_page.png') });
  console.log('Captured desktop_media_page.png');

  // Test Settings Page
  await page.goto(`${BASE_URL}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_settings_page.png') });
  console.log('Captured desktop_settings_page.png');

  // Storage Page
  await page.goto(`${BASE_URL}/storage`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop_storage_page.png') });
  console.log('Captured desktop_storage_page.png');

  await desktopCtx.close();

  // 2. Mobile Test (390x844 - iPhone 14)
  console.log('\n--- Running Mobile Tests & Screenshots (390x844) ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobPage = await mobileCtx.newPage();

  await mobPage.goto(`${BASE_URL}/login`);
  await mobPage.waitForLoadState('networkidle');
  await mobPage.screenshot({ path: path.join(screenshotsDir, 'mobile_login.png') });
  console.log('Captured mobile_login.png');

  // Verify responsive width without horizontal overflow
  const scrollWidth = await mobPage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await mobPage.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile viewport clientWidth=${clientWidth}, scrollWidth=${scrollWidth}`);
  if (scrollWidth > clientWidth) {
    console.warn(`WARNING: Horizontal overflow detected on mobile login! (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
  }

  // Admin login on mobile
  await mobPage.fill('input[type="email"]', ADMIN_EMAIL);
  await mobPage.fill('input[type="password"]', ADMIN_PASSWORD);
  await mobPage.click('button[type="submit"]');
  await mobPage.waitForURL('**/dashboard', { timeout: 10000 });
  await mobPage.waitForLoadState('networkidle');
  await mobPage.waitForTimeout(600);
  await mobPage.screenshot({ path: path.join(screenshotsDir, 'mobile_dashboard.png') });
  console.log('Captured mobile_dashboard.png');

  // Test mobile menu/hamburger if present
  const hamburger = mobPage.locator('button[aria-label="Open sidebar"], button:has(svg.lucide-menu), button[aria-label="Menu"]').first();
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({ path: path.join(screenshotsDir, 'mobile_menu_open.png') });
    console.log('Captured mobile_menu_open.png');
  }

  // Mobile Admin Page
  await mobPage.goto(`${BASE_URL}/admin`);
  await mobPage.waitForLoadState('networkidle');
  await mobPage.waitForTimeout(600);
  await mobPage.screenshot({ path: path.join(screenshotsDir, 'mobile_admin_page.png') });
  console.log('Captured mobile_admin_page.png');

  await mobileCtx.close();
  await browser.close();

  console.log('\nAll tests passed and screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
