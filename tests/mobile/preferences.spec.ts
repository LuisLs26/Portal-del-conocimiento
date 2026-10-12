import { test, expect } from '@playwright/test';

test('sonidos sin controles flotantes ni pantalla completa y movimiento reducido', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sound_enabled', 'false');
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
  await expect(page.getByRole('button', { name: /Silenciar|Activar sonido|Salir de la actividad/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: /Silenciar|Activar sonido|Salir de la actividad/ })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const transform = await page.locator('.matching-columns').evaluate(el => getComputedStyle(el).transform);
  expect(transform).toBe('none');
});
