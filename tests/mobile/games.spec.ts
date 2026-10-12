import { test, expect, type Page } from '@playwright/test';
import { CROSSWORD_ITEMS } from '../../src/data/crosswordData';
import { QUIZ_QUESTIONS } from '../../src/data/quizData';
import { MATCHING_PAIRS } from '../../src/data/matchingData';
import { WORD_BANK } from '../../src/data/clozeData';
import { WORD_SEARCH_WORDS } from '../../src/data/wordSearchData';

async function open(page: Page, week: number) {
  await page.goto(`/semana/${week}`);
  await page.reload();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Cargando...');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (test.info().project.name === '390px') await page.screenshot({ path: test.info().outputPath(`semana-${week}.png`), fullPage: true });
}
test('crucigrama: error, nueve respuestas, borrado y reinicio', async ({ page }) => {
  await open(page, 1);
  const input = page.getByRole('textbox', { name: 'Letra del crucigrama' });
  await expect(page.locator('[data-cross-cell]').first()).toBeVisible();
  const intersection = page.locator('[data-cross-cell="0-5"]');
  await intersection.tap(); await intersection.tap();
  await expect(page.getByText('Vertical', { exact: true })).toBeVisible();
  await intersection.tap();
  await expect(page.getByText('Horizontal', { exact: true })).toBeVisible();
  await input.fill('Z');
  await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
  await expect(page.getByRole('progressbar', { name: 'Palabras correctas' })).toHaveAttribute('value', '0');
  await page.getByRole('button', { name: 'Reiniciar todo' }).tap();
  await page.locator('[data-clues] summary').tap();
  for (const word of CROSSWORD_ITEMS) {
    await page.getByText(word.clue, { exact: true }).last().tap();
    for (const letter of word.word) await input.fill(letter);
  }
  await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Volver a jugar' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a jugar' }).tap();
  await expect(page.locator('[data-cross-cell]').filter({ hasText: /[A-Z]/ })).toHaveCount(0);
  const cell = page.locator('[data-cross-cell]').first();
  await cell.tap(); await input.fill('Á'); await input.press('Backspace');
  // At an empty next cell Backspace returns to the previous cell; another deletes it.
  await input.press('Backspace');
  await expect(cell).not.toContainText('A');
});
test('cuestionario: cambiar selección, confirmar, bloquear, puntuar y revisar', async ({ page }) => {
  await open(page, 2);
  for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
    const q = QUIZ_QUESTIONS[i];
    const options = page.locator('main button').filter({ hasText: q.options[(q.correctIndex + 1) % 4] });
    await options.tap();
    const chosen = i === 0 ? (q.correctIndex + 1) % 4 : q.correctIndex;
    await page.getByRole('button', { name: new RegExp(q.options[chosen].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).tap();
    await page.getByRole('button', { name: 'Comprobar respuesta', exact: true }).tap();
    await expect(page.getByText(`Respuesta correcta: ${'ABCD'[q.correctIndex]}.`, { exact: false })).toBeVisible();
    await expect(options).toBeDisabled();
    await page.getByRole('button', { name: i === 9 ? 'Ver resultados' : 'Siguiente pregunta' }).tap();
  }
  await expect(page.getByText('9/10', { exact: true })).toBeVisible();
  await expect(page.getByText('90%', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revisar respuestas' }).tap();
  await expect(page.getByText('Revisión de Respuestas')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).tap();
  await page.getByRole('button', { name: 'Volver a intentar' }).tap();
  await expect(page.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
});
test('relacionar: error, cambiar concepto, diez parejas, reiniciar en ambas rondas', async ({ page }) => {
  await open(page, 3);
  await page.locator('[data-concept="1"]').tap();
  await page.locator('[data-definition="2"]').tap();
  await expect(page.getByRole('status')).toContainText('no corresponde');
  await page.locator('[data-concept="2"]').tap();
  await page.locator('[data-definition="2"]').tap();
  await expect(page.locator('[data-concept="2"]')).toBeDisabled();
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).tap();
  await expect(page.locator('[data-concept="2"]')).toBeEnabled();
  for (const pair of MATCHING_PAIRS) {
    await page.locator(`[data-concept="${pair.id}"]`).tap();
    await page.locator(`[data-definition="${pair.id}"]`).tap();
  }
  await expect(page.getByText('10 de 10 parejas', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a jugar' }).tap();
  await expect(page.getByText('Ronda 1 de 2 · 0 de 10 parejas')).toBeVisible();
});
test('completar: devolución, error, aciertos bloqueados, corrección y reinicio', async ({ page }) => {
  await open(page, 4);
  await page.getByRole('button', { name: WORD_BANK[0], exact: true }).tap();
  await page.getByRole('button', { name: 'Espacio 1', exact: true }).tap();
  await page.getByRole('button', { name: 'Espacio 1', exact: true }).tap();
  await expect(page.getByRole('button', { name: WORD_BANK[0], exact: true })).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.getByRole('button', { name: WORD_BANK[i < 2 ? 1 - i : i], exact: true }).tap();
    await page.getByRole('button', { name: `Espacio ${i + 1}`, exact: true }).tap();
  }
  await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Espacio 3', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Espacio 1', exact: true }).tap();
  await page.getByRole('button', { name: 'Espacio 2', exact: true }).tap();
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: WORD_BANK[i], exact: true }).tap();
    await page.getByRole('button', { name: `Espacio ${i + 1}`, exact: true }).tap();
  }
  await page.getByRole('button', { name: 'Comprobar', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Volver a jugar' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a jugar' }).tap();
  await expect(page.getByRole('button', { name: 'Comprobar', exact: true })).toBeDisabled();
});
test('sopa: gesto táctil, cancelación, doce palabras y reinicio', async ({ page }) => {
  await open(page, 5);
  await expect(page.locator('[data-cell]')).toHaveCount(256);
  const session = await page.context().newCDPSession(page);
  async function point(r: number, c: number) {
    const box = await page.locator(`[data-cell][data-r="${r}"][data-c="${c}"]`).boundingBox();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  }
  async function drag(path: { r: number; c: number }[], cancel = false) {
    const first = await point(path[0].r, path[0].c);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
    for (const p of path.slice(1)) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [await point(p.r, p.c)] });
    await session.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  }
  await drag([{ r: 0, c: 0 }]);
  await expect(page.getByRole('status')).toContainText('no forma');
  await drag([{ r: 0, c: 0 }, { r: 0, c: 1 }], true);
  await expect(page.getByText('0 de 12 palabras', { exact: true })).toBeVisible();
  const letters = await page.locator('[data-cell]').allTextContents();
  for (const item of WORD_SEARCH_WORDS) {
    let found: { r: number; c: number }[] | undefined;
    for (let r = 0; r < 16 && !found; r++) for (let c = 0; c < 16 && !found; c++) for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const path = Array.from(item.word, (_, i) => ({ r: r + dr * i, c: c + dc * i }));
      if (path.every((p, i) => p.r >= 0 && p.r < 16 && p.c >= 0 && p.c < 16 && letters[p.r * 16 + p.c] === item.word[i])) found = path;
    }
    expect(found).toBeTruthy();
    await drag(found!);
    await expect(page.getByRole('status')).toContainText('encontrada');
  }
  await expect(page.getByRole('button', { name: 'Volver a jugar' })).toBeVisible();
  await session.detach();
  await page.getByRole('button', { name: 'Volver a jugar' }).tap();
  await expect(page.getByText('0 de 12 palabras', { exact: true })).toBeVisible();
});
