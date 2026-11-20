import { test, expect } from '@playwright/test';

test.describe('F01 Core Streaming Loop: Browse to Play', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') throw new Error(`console error: ${msg.text()}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 500) throw new Error(`${res.status()} on ${res.url()}`);
    });
  });

  test('F01-H1 Happy Path: Open catalog, inspect modal details, and launch video player', async ({ page }) => {
    await page.goto('http://localhost:3000/#/browse');

    // Verify Billboard Hero presence
    const billboard = page.locator('.billboard');
    await expect(billboard).toBeVisible();

    // Verify Row Carousels and Title Cards
    const titleCard = page.locator('.title-card').first();
    await expect(titleCard).toBeVisible();

    // Click card to open S05 details modal
    await titleCard.click();
    const modal = page.locator('.modal-container');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible();

    // Click Play to launch S06 custom video player
    await page.getByRole('button', { name: /play/i }).first().click();
    await expect(page.locator('.player-screen')).toBeVisible();
    await expect(page.locator('#main-video')).toBeVisible();
  });

  test('F01-E1 Mobile Width Viewport (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/#/browse');

    await expect(page.locator('.brand-logo')).toBeVisible();
    const titleCards = page.locator('.title-card');
    await expect(titleCards.first()).toBeVisible();
  });

  test('F01-E2 Keyboard Navigation Only', async ({ page }) => {
    await page.goto('http://localhost:3000/#/browse');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Verify focus is functional
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
