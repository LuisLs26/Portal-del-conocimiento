import { PNG } from 'pngjs';
import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';

test('QR: enlaces codificados, cambio de dominio, ZIP e impresión', async ({ page }) => {
  await page.goto('/qr');
  const domain = page.getByRole('textbox', { name: 'Dominio público' });
  const zipButton = page.getByRole('button', { name: 'Descargar ZIP (5 QR)' });
  await domain.fill('dirección inválida');
  await expect(zipButton).toBeDisabled();
  await domain.fill('https://anterior.example');
  await domain.fill('http://127.0.0.1:4173/semana/3');
  await expect(zipButton).toBeEnabled();
  for (let week = 1; week <= 5; week++) {
    const canvas = page.locator(`[data-qr-week="${week}"]`);
    const encoded = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL('image/png'));
    const image = PNG.sync.read(Buffer.from(encoded.split(',')[1], 'base64'));
    expect(jsQR(new Uint8ClampedArray(image.data), image.width, image.height)?.data).toBe(`http://127.0.0.1:4173/semana/${week}`);
  }
  const downloadPromise = page.waitForEvent('download'); await zipButton.tap();
  const download = await downloadPromise;
  const zip = await JSZip.loadAsync(await readFile((await download.path())!));
  expect(Object.keys(zip.files).filter(name => name.endsWith('.png'))).toHaveLength(5);
  expect(Object.keys(zip.files).filter(name => name.endsWith('.svg'))).toHaveLength(5);
  expect(await zip.file('ENLACES_LIBRO.txt')!.async('string')).toContain('http://127.0.0.1:4173/semana/5');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-only')).toBeVisible();
  await expect(page.locator('.print-only svg')).toHaveCount(5);
  await page.emulateMedia({ media: 'screen' });
  await page.reload(); await expect(domain).toHaveValue('http://127.0.0.1:4173');
  for (let week = 1; week <= 5; week++) {
    const response = await page.goto(`/semana/${week}`);
    expect(response?.ok()).toBe(true); await page.reload();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salir de la actividad' })).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('Cargando...');
  }
});
