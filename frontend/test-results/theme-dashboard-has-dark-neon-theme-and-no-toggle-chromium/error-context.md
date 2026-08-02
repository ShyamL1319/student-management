# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: theme.spec.ts >> dashboard has dark neon theme and no toggle
- Location: tests/theme.spec.ts:6:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at https://localhost:5176/
Call log:
  - navigating to "https://localhost:5176/", waiting until "load"

```

# Test source

```ts
  1  | // frontend/tests/theme.spec.ts
  2  | import { test, expect } from '@playwright/test';
  3  | 
  4  | const baseUrl = process.env.BASE_URL || 'https://localhost:5176';
  5  | 
  6  | test('dashboard has dark neon theme and no toggle', async ({ page }) => {
> 7  |   await page.goto(`${baseUrl}/`);
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at https://localhost:5176/
  8  |   await page.waitForLoadState('networkidle');
  9  | 
  10 |   // Wait for the primary CTA button to be visible
  11 |   const ctaButton = page.getByText('Start Free Trial');
  12 |   await expect(ctaButton).toBeVisible({ timeout: 10000 });
  13 | 
  14 |   // Check body background color is dark
  15 |   const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  16 |   // Expect a dark color (e.g., rgb(15,17,21) or similar)
  17 |   expect(bodyBg).toMatch(/rgb\(\s*15\s*,\s*17\s*,\s*21\s*\)/);
  18 | 
  19 |   // Ensure theme toggle button is not present
  20 |   const toggle = page.locator('button[aria-label*="mode"]');
  21 |   await expect(toggle).toHaveCount(0);
  22 | 
  23 |   // Verify hero banner gradient style contains expected colors
  24 |   const heroCard = page.locator('section >> nth=0');
  25 |   const bg = await heroCard.evaluate(el => getComputedStyle(el).background);
  26 |   expect(bg).toContain('linear-gradient(135deg, #1e3a8a');
  27 |   expect(bg).toContain('#831843');
  28 | });
  29 | 
```