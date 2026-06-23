import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'https://edusphere-dev.com:5173';

test('OAuth Role Selector exists and forwards role parameter on Google login', async ({ page }) => {
  // Go to login page
  await page.goto(`${baseUrl}/login`);
  await page.waitForLoadState('networkidle');

  // Verify the toggle selector is visible
  const selector = page.locator('#oauth-role-selector');
  await expect(selector).toBeVisible();

  // Student toggle button is selected by default
  const studentBtn = page.locator('#role-btn-student');
  await expect(studentBtn).toHaveClass(/Mui-selected/);

  // Click on Teacher toggle button
  const teacherBtn = page.locator('#role-btn-teacher');
  await teacherBtn.click();
  await expect(teacherBtn).toHaveClass(/Mui-selected/);
  await expect(studentBtn).not.toHaveClass(/Mui-selected/);

  // Capture redirection attempt
  // Since we click "Continue with Google", the page will navigate to the backend URL.
  // We can intercept the request or check the resulting URL.
  const googleBtn = page.getByText('Continue with Google');
  await expect(googleBtn).toBeVisible();

  const clickPromise = googleBtn.click();
  
  // Wait for the page to navigate to Google's sign-in screen
  await page.waitForURL(/.*accounts\.google\.com.*/, { timeout: 15000 });
  const currentUrl = page.url();
  expect(currentUrl).toContain('state=%7B%22role%22%3A%22TEACHER%22%7D');
});
