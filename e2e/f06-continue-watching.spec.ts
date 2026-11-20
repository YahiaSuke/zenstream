import { test, expect } from '@playwright/test';

test.describe('F06 Continue Watching & Resume Progress', () => {
  test('F06-H1 & F06-E1 Playback sync and 95% completion threshold', async ({ page }) => {
    // Simulate updating watch history to 50%
    const updateRes = await page.request.post('http://localhost:3000/api/watch-history', {
      data: {
        profileId: 'p-001',
        titleId: 't-003',
        progressSeconds: 3720,
        durationSeconds: 7440,
      },
    });
    const updateData = await updateRes.json();
    expect(updateData.completed).toBe(false);
    expect(updateData.record.progressPercent).toBe(50);

    // Verify it appears in Continue Watching
    const cwRes = await page.request.get('http://localhost:3000/api/continue-watching?profileId=p-001');
    const cwData = await cwRes.json();
    const item = cwData.inProgress.find((c: any) => c.titleId === 't-003');
    expect(item).toBeTruthy();
    expect(item.progressPercent).toBe(50);

    // Simulate watching past 95% -> Auto completed
    const completeRes = await page.request.post('http://localhost:3000/api/watch-history', {
      data: {
        profileId: 'p-001',
        titleId: 't-003',
        progressSeconds: 7200,
        durationSeconds: 7440,
      },
    });
    const completeData = await completeRes.json();
    expect(completeData.completed).toBe(true);
  });
});
