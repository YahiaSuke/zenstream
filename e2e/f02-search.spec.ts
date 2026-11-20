import { test, expect } from '@playwright/test';

test.describe('F02 Instant Search to Watch', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') throw new Error(`console error: ${msg.text()}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 500) throw new Error(`${res.status()} on ${res.url()}`);
    });
  });

  test('F02-H1 Happy Path: Search query returns populated results grid', async ({ page }) => {
    await page.goto('http://localhost:3000/#/browse');

    const searchInput = page.locator('.nav-search-input');
    await searchInput.fill('Neon');
    await page.keyboard.press('Enter');

    await page.waitForURL(/#\/search\?q=Neon/);
    const searchResult = page.locator('.title-card');
    await expect(searchResult.first()).toBeVisible();
    await expect(page.locator('.card-title', { hasText: 'Neon Vanguard' })).toBeVisible();
  });

  test('F02-N1 Negative Case: Non-matching query displays friendly suggestions', async ({ page }) => {
    await page.goto('http://localhost:3000/#/search?q=xyznonexistent999');
    await expect(page.getByText(/did not find any matches/i)).toBeVisible();
    await expect(page.getByText(/try different keywords/i)).toBeVisible();
  });

  test('F02-E1 Edge Case: Special characters & XSS payload sanitized', async ({ page }) => {
    await page.goto('http://localhost:3000/#/search?q=%3Cscript%3Ealert(1)%3C/script%3E');
    await expect(page.getByText(/did not find any matches/i)).toBeVisible();
  });
});
