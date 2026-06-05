const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'docs', 'screenshots');

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  
  const page = await context.newPage();
  
  const BASE_URL = 'http://localhost:5173';

  try {
    console.log('Capturing auth-login.png...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(2000); // let animations settle
    await page.screenshot({ path: path.join(OUT_DIR, 'auth-login.png') });

    console.log('Logging in...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@school.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard...');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    await page.waitForTimeout(2000); // let charts/data load
    console.log('Capturing dashboard-admin.png...');
    await page.screenshot({ path: path.join(OUT_DIR, 'dashboard-admin.png') });

    console.log('Capturing student-directory.png...');
    await page.goto(`${BASE_URL}/students`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'student-directory.png') });

    console.log('Capturing student-profile.png... (using /profile as proxy)');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'student-profile.png') });

    console.log('Capturing role-management.png...');
    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'role-management.png') });

    console.log('Capturing attendance-tracker.png...');
    await page.goto(`${BASE_URL}/attendances`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'attendance-tracker.png') });

    console.log('Capturing notifications-center.png...');
    await page.goto(`${BASE_URL}/notifications`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'notifications-center.png') });

    console.log('Screenshots generated successfully!');
  } catch (error) {
    console.error('Error during screenshot generation:', error);
  } finally {
    await browser.close();
  }
}

run();
