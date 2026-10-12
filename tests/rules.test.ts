import { describe, it, expect } from 'vitest';
import { CROSSWORD_ITEMS, generateCrossword, validateCrossword, normalizeLetter } from '../src/data/crosswordData';
import { generateWordSearchGrid, WORD_SEARCH_WORDS } from '../src/data/wordSearchData';
import { QUIZ_QUESTIONS } from '../src/data/quizData';
import { CLOZE_BLANKS, WORD_BANK } from '../src/data/clozeData';
import { MATCHING_PAIRS } from '../src/data/matchingData';
import { shuffle, straightPath, placeTerm, quizScore, validPair } from '../src/data/gameRules';
import { publicBaseUrl } from '../src/data/qrData';

describe('Reglas educativas', () => {
  it('QR: normaliza dominios y rechaza enlaces inválidos', () => {
    expect(publicBaseUrl('https://ejemplo.com/semana/2?q=1')).toBe('https://ejemplo.com');
    expect(publicBaseUrl('')).toBeNull();
    expect(publicBaseUrl('ejemplo.com')).toBeNull();
    expect(publicBaseUrl('javascript:alert(1)')).toBeNull();
    expect(publicBaseUrl('https://usuario:clave@ejemplo.com')).toBeNull();
  });
  it('resuelve todas las intersecciones y rechaza letras incompatibles', () => {
    expect(validateCrossword(CROSSWORD_ITEMS)).toBe(true);
    for (let attempt = 0; attempt < 10; attempt++) expect(validateCrossword(generateCrossword())).toBe(true);
    const grid = new Map<string, string>();
    for (const w of CROSSWORD_ITEMS) Array.from(w.word).forEach((letter, i) => {
      const key = `${w.row + (w.direction === 'V' ? i : 0)},${w.col + (w.direction === 'H' ? i : 0)}`;
      if (grid.has(key)) expect(grid.get(key)).toBe(letter);
      grid.set(key, letter);
    });
    expect(validateCrossword(CROSSWORD_ITEMS.map(w => ({ ...w, row: 0, col: 0 })))).toBe(false);
    expect(normalizeLetter('Evaluación')).toBe('EVALUACION');
  });
  it('reconoce doce palabras completas en 100 tableros, en ambos sentidos', () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const { grid, placedWords } = generateWordSearchGrid();
      expect(grid).toHaveLength(16); expect(placedWords).toHaveLength(12);
      for (const word of placedWords) {
        const path = straightPath(word.path[0], word.path.at(-1)!);
        expect(path.map(p => grid[p.r][p.c]).join('')).toBe(word.word);
        expect(straightPath(path.at(-1)!, path[0]).map(p => grid[p.r][p.c]).reverse().join('')).toBe(word.word);
      }
      expect(new Set(placedWords.map(w => w.word))).toEqual(new Set(WORD_SEARCH_WORDS.map(w => w.word)));
    }
    expect(straightPath({ r: 0, c: 0 }, { r: 1, c: 3 })).toHaveLength(1);
    expect(() => generateWordSearchGrid(8)).toThrow();
  });
  it('diez preguntas con cuatro alternativas distintas y respuestas distribuidas', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(10);
    expect(new Set(QUIZ_QUESTIONS.map(q => q.correctIndex)).size).toBe(4);
    for (const q of QUIZ_QUESTIONS) { expect(new Set(q.options).size).toBe(4); expect(q.options[q.correctIndex]).toBeTruthy(); expect(q.explanation).toBeTruthy(); }
    const answers = Object.fromEntries(QUIZ_QUESTIONS.map((q, i) => [i, q.correctIndex]));
    expect(quizScore(QUIZ_QUESTIONS, answers)).toEqual({ correct: 10, percentage: 100 });
    answers[0] = (answers[0] + 1) % 4;
    expect(quizScore(QUIZ_QUESTIONS, answers)).toEqual({ correct: 9, percentage: 90 });
    expect(quizScore(QUIZ_QUESTIONS, {})).toEqual({ correct: 0, percentage: 0 });
  });
  it('diez parejas únicas y dos rondas de cinco', () => {
    expect(new Set(MATCHING_PAIRS.map(p => p.id)).size).toBe(10);
    for (const round of [1, 2]) expect(MATCHING_PAIRS.filter(p => p.round === round)).toHaveLength(5);
    const pairs = MATCHING_PAIRS.slice(0, 5);
    expect(shuffle(pairs)).not.toEqual(pairs);
    expect(validPair(1, 1, [])).toBe(true);
    expect(validPair(1, 2, [])).toBe(false);
    expect(validPair(1, 1, [1])).toBe(false);
    expect(validPair(null, 1, [])).toBe(false);
  });
  it('coloca, devuelve y reemplaza palabras sin duplicar ni modificar aciertos', () => {
    let slots: Record<number, string | null> = Object.fromEntries(CLOZE_BLANKS.map(b => [b.id, null]));
    slots = placeTerm(slots, null, 0, WORD_BANK[1]);
    expect(placeTerm(slots, null, 1, WORD_BANK[1])).toBe(slots);
    slots = placeTerm(slots, null, 0, null); expect(slots[0]).toBeNull();
    for (const b of CLOZE_BLANKS) slots = placeTerm(slots, null, b.id, b.correctWord);
    expect(Object.values(slots)).toEqual(WORD_BANK);
    expect(placeTerm(slots, { 0: true }, 0, null)).toBe(slots);
    slots = placeTerm(slots, null, 0, null); expect(Object.values(slots).filter(Boolean)).toHaveLength(7);
  });
});
