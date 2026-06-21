# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: theme.spec.ts >> dashboard has dark neon theme and no toggle
- Location: tests/theme.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Start Free Trial/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('button', { name: /Start Free Trial/i })

```

```yaml
- heading "Something went wrong" [level=4]
- alert: "Failed to fetch dynamically imported module: https://localhost:5176/src/features/landing/pages/LandingPage.tsx"
- button "Reload Page"
- text: "[plugin:vite:oxc] Transform failed with 1 error: [PARSE_ERROR] Unexpected token. Did you mean `{'}'}` or `&rbrace;`? ╭─[ src/features/landing/pages/LandingPage.tsx:362:1 ] │ 362 │ }; │ │ │ ╰─ ─────╯ /Users/shyamlal/Desktop/ai-coding/student-management/frontend/src/features/landing/pages/LandingPage.tsx at transformWithOxc (file:///Users/shyamlal/Desktop/ai-coding/student-management/frontend/node_modules/vite/dist/node/chunks/node.js:3344:19) at TransformPluginContext.transform (file:///Users/shyamlal/Desktop/ai-coding/student-management/frontend/node_modules/vite/dist/node/chunks/node.js:3415:26) at EnvironmentPluginContainer.transform (file:///Users/shyamlal/Desktop/ai-coding/student-management/frontend/node_modules/vite/dist/node/chunks/node.js:30387:51) at async loadAndTransform (file:///Users/shyamlal/Desktop/ai-coding/student-management/frontend/node_modules/vite/dist/node/chunks/node.js:24646:26) at async viteTransformMiddleware (file:///Users/shyamlal/Desktop/ai-coding/student-management/frontend/node_modules/vite/dist/node/chunks/node.js:24440:20) Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```

# Test source

```ts
  1  | // frontend/tests/theme.spec.ts
  2  | import { test, expect } from '@playwright/test';
  3  | 
  4  | const baseUrl = process.env.BASE_URL || 'https://localhost:5176';
  5  | 
  6  | test('dashboard has dark neon theme and no toggle', async ({ page }) => {
  7  |   await page.goto(`${baseUrl}/`);
  8  | 
  9  |   // Wait for hero banner to be visible
  10 |   const heroButton = page.getByRole('button', { name: /Start Free Trial/i });
> 11 |   await expect(heroButton).toBeVisible({ timeout: 10000 });
     |                            ^ Error: expect(locator).toBeVisible() failed
  12 | 
  13 |   // Check body background color is dark
  14 |   const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  15 |   // Expect a dark color (e.g., rgb(15,17,21) or similar)
  16 |   expect(bodyBg).toMatch(/rgb\(\s*15\s*,\s*17\s*,\s*21\s*\)/);
  17 | 
  18 |   // Ensure theme toggle button is not present
  19 |   const toggle = page.locator('button[aria-label*="mode"]');
  20 |   await expect(toggle).toHaveCount(0);
  21 | 
  22 |   // Verify hero banner gradient style contains expected colors
  23 |   const heroCard = page.locator('section >> nth=0');
  24 |   const bg = await heroCard.evaluate(el => getComputedStyle(el).background);
  25 |   expect(bg).toContain('linear-gradient(135deg, #1e3a8a');
  26 |   expect(bg).toContain('#831843');
  27 | });
  28 | 
```