import { test, expect } from '@playwright/test';

// This repo's Playwright config doesn't start a Next.js server automatically.
// Keep this as a scaffold: enable when running against a live BASE_URL.
const baseUrl = process.env.BASE_URL;

test.describe('Onboarding flow (scaffold)', () => {
  test.skip(!baseUrl, 'Set BASE_URL to a running app (e.g. http://localhost:3000)');

  test('GET /onboarding loads', async ({ page }) => {
    await page.goto(`${baseUrl}/onboarding`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/onboarding/);

    // Keep assertions minimal to avoid coupling to UI copy.
    await expect(page.locator('body')).toBeVisible();
  });

  test('API rejects unauthenticated onboarding GET', async ({ request }) => {
    const res = await request.get(`${baseUrl}/api/onboarding`);
    expect([401, 302, 303, 307, 308]).toContain(res.status());
  });
});
