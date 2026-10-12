import { test, expect } from '@playwright/test';

test('sonidos silenciables y animaciones con movimiento reducido', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { tones: number }).tones = 0;
    const original = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      (window as unknown as { tones: number }).tones++;
      return original.call(this);
    };
  });
  await page.goto('/semana/3');
  await page.locator('[data-concept="1"]').tap();
  await expect.poll(() => page.evaluate(() => (window as unknown as { tones: number }).tones)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Silenciar', exact: true }).tap();
  const tones = await page.evaluate(() => (window as unknown as { tones: number }).tones);
  await page.locator('[data-definition="2"]').tap();
  expect(await page.evaluate(() => (window as unknown as { tones: number }).tones)).toBe(tones);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Activar sonido', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const transform = await page.locator('.matching-columns').evaluate(el => getComputedStyle(el).transform);
  expect(transform).toBe('none');
});
