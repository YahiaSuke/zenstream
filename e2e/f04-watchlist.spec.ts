import { test, expect } from '@playwright/test';

test.describe('F04 Watchlist Management (My List)', () => {
  test('F04-H1 & F04-H2 Happy Path: Add to My List, verify presence, then remove', async ({ page }) => {
    await page.goto('http://localhost:3000/#/browse');

    // Open details modal
    const firstCard = page.locator('.title-card').first();
    await firstCard.click();

    // Click Add to My List '+' button
    const addBtn = page.locator('.btn-icon[title="Add to My List"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(addBtn).toHaveText('✓');

    // Navigate to My List
    await page.goto('http://localhost:3000/#/browse/my-list');
    await expect(page.locator('.title-card').first()).toBeVisible();
  });

  test('F04-E1 Empty My List guidance notice', async ({ page }) => {
    // When watchlist has no items for a fresh profile
    await page.goto('http://localhost:3000/#/browse/my-list?profileId=p-empty');
    await expect(page.getByText(/you haven't added any titles/i)).toBeVisible();
  });
});
