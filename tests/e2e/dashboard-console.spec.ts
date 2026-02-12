import { test, expect } from '@playwright/test';

test('admin dashboard has no runtime console errors', async ({ page }) => {
  const errors: string[] = [];

  await page.setExtraHTTPHeaders({
    Cookie: 'zenith_admin_token=sovereign',
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.locator('text=Neural Thought Dashboard')).toBeVisible();

  expect(errors, `Console errors:\n${errors.join('\n')}`).toEqual([]);
});
