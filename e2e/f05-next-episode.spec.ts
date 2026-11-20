import { test, expect } from '@playwright/test';

test.describe('F05 Episodic Continuous Playback & Skip Intro', () => {
  test('F05-E1 Skip Intro button trigger at cue points', async ({ page }) => {
    await page.goto('http://localhost:3000/#/watch/t-001?episode=ep-101');

    const video = page.locator('#main-video');
    await expect(video).toBeVisible();

    // Simulate time advance to 10s (within 5s-20s cue window)
    await page.evaluate(() => {
      const v = document.getElementById('main-video') as HTMLVideoElement;
      if (v) {
        v.currentTime = 10;
        v.dispatchEvent(new Event('timeupdate'));
      }
    });

    const skipBtn = page.locator('#skip-intro-btn');
    await expect(skipBtn).toBeVisible();

    // Click Skip Intro
    await skipBtn.click();
    const currentTime = await page.evaluate(() => {
      const v = document.getElementById('main-video') as HTMLVideoElement;
      return v ? v.currentTime : 0;
    });
    expect(currentTime).toBeGreaterThanOrEqual(20);
  });
});
