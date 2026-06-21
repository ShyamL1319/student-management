// frontend/tests/theme.spec.ts
import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'https://localhost:5176';

test('dashboard has dark neon theme and no toggle', async ({ page }) => {
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');

  // Wait for the primary CTA button to be visible
  const ctaButton = page.getByText('Start Free Trial');
  await expect(ctaButton).toBeVisible({ timeout: 10000 });

  // Check body background color is dark
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // Expect a dark color (e.g., rgb(15,17,21) or similar)
  expect(bodyBg).toMatch(/rgb\(\s*15\s*,\s*17\s*,\s*21\s*\)/);

  // Ensure theme toggle button is not present
  const toggle = page.locator('button[aria-label*="mode"]');
  await expect(toggle).toHaveCount(0);

  // Verify hero banner gradient style contains expected colors
  const heroCard = page.locator('section >> nth=0');
  const bg = await heroCard.evaluate(el => getComputedStyle(el).background);
  expect(bg).toContain('linear-gradient(135deg, #1e3a8a');
  expect(bg).toContain('#831843');
});
