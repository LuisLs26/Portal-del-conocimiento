import { PNG } from 'pngjs';
import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';

test('QR: enlaces codificados, cambio de dominio, ZIP e impresión', async ({ page }) => {
  await page.goto('/qr');
  const domain = page.getByRole('textbox', { name: 'Dominio público' });
  const zipButton = page.getByRole('button', { name: 'Descargar ZIP (6 QR)' });
  await domain.fill('dirección inválida');
  await expect(zipButton).toBeDisabled();
  await domain.fill('https://anterior.example');
  await domain.fill('http://127.0.0.1:4173/semana/3');
  await expect(zipButton).toBeEnabled();
  for (let week = 1; week <= 6; week++) {
    const canvas = page.locator(`[data-qr-week="${week}"]`);
    const encoded = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL('image/png'));
    const image = PNG.sync.read(Buffer.from(encoded.split(',')[1], 'base64'));
    expect(jsQR(new Uint8ClampedArray(image.data), image.width, image.height)?.data).toBe(`http://127.0.0.1:4173${week === 6 ? '/maraton' : `/semana/${week}`}`);
  }
  const downloadPromise = page.waitForEvent('download'); await zipButton.tap();
  const download = await downloadPromise;
  const zip = await JSZip.loadAsync(await readFile((await download.path())!));
  expect(Object.keys(zip.files).filter(name => name.endsWith('.png'))).toHaveLength(6);
  expect(Object.keys(zip.files).filter(name => name.endsWith('.svg'))).toHaveLength(6);
  expect(await zip.file('ENLACES_LIBRO.txt')!.async('string')).toContain('http://127.0.0.1:4173/semana/5');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-only')).toBeVisible();
  await expect(page.locator('.print-only svg')).toHaveCount(6);
  await page.emulateMedia({ media: 'screen' });
  await page.reload(); await expect(domain).toHaveValue('http://127.0.0.1:4173');
  for (let week = 1; week <= 6; week++) {
    const response = await page.goto(week === 6 ? '/maraton' : `/semana/${week}`);
    expect(response?.ok()).toBe(true); await page.reload();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salir de la actividad' })).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('Cargando...');
  }
});

test('Parte 2: cada QR abre su actividad y se exporta por separado', async ({ page }) => {
  await page.goto('/parte-2');
  await expect(page.locator('.part-two-card')).toHaveCount(15);
  const paths = await page.locator('.part-two-card').evaluateAll(cards => cards.map(card => (card as HTMLAnchorElement).pathname));
  expect(paths).toHaveLength(15);
  await page.getByRole('link', { name: 'Ver Códigos QR (Parte 2)' }).tap();
  const zipButton = page.getByRole('button', { name: 'Descargar ZIP (15 QR)' });
  await expect(zipButton).toBeEnabled();
  const targets = await page.locator('canvas[data-qr-week]').evaluateAll(nodes =>
    nodes.map(node => (node as HTMLCanvasElement).toDataURL('image/png'))
  );
  const decoded = targets.map(encoded => {
    const image = PNG.sync.read(Buffer.from(encoded.split(',')[1], 'base64'));
    return jsQR(new Uint8ClampedArray(image.data), image.width, image.height)?.data;
  });
  expect(decoded.sort()).toEqual(paths.map(path => 'http://127.0.0.1:4173' + path).sort());
  const downloadPromise = page.waitForEvent('download');
  await zipButton.tap();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('Codigos_QR_Parte_2.zip');
  const zip = await JSZip.loadAsync(await readFile((await download.path())!));
  expect(Object.keys(zip.files).filter(name => name.endsWith('.png'))).toHaveLength(15);
  expect(Object.keys(zip.files).filter(name => name.endsWith('.svg'))).toHaveLength(15);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-only svg')).toHaveCount(15);
  await expect(page.locator('.print-only svg').first()).toHaveCSS('width', '150px');
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('link', { name: 'Parte 1', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Descargar ZIP (6 QR)' })).toBeEnabled();
});
