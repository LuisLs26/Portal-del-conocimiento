export interface CrosswordItem {
  id: number;
  number: number;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'H' | 'V'; // H = Horizontal, V = Vertical
}




const fallback: CrosswordItem[] = [
  {
    id: 6,
    number: 1,
    word: 'COEVALUACION',
    clue: 'Cuando los estudiantes evalúan el trabajo de sus compañeros.',
    row: 0,
    col: 3,
    direction: 'H'
  },
  {
    id: 1,
    number: 2,
    word: 'EVALUACION',
    clue: 'Proceso sistemático que permite recoger, analizar y valorar información sobre los aprendizajes.',
    row: 0,
    col: 5,
    direction: 'V'
  },
  {
    id: 5,
    number: 3,
    word: 'AUTOEVALUACION',
    clue: 'Cuando el estudiante valora su propio desempeño.',
    row: 0,
    col: 10,
    direction: 'V'
  },
  {
    id: 3,
    number: 4,
    word: 'DIAGNOSTICA',
    clue: 'Evaluación que permite conocer los conocimientos previos.',
    row: 1,
    col: 2,
    direction: 'V'
  },
  {
    id: 9,
    number: 5,
    word: 'ESTUDIANTE',
    clue: 'Persona que participa, reflexiona y mejora sus aprendizajes.',
    row: 1,
    col: 15,
    direction: 'V'
  },
  {
    id: 4,
    number: 6,
    word: 'SUMATIVA',
    clue: 'Evaluación que valora los resultados obtenidos al finalizar un periodo.',
    row: 2,
    col: 7,
    direction: 'V'
  },
  {
    id: 2,
    number: 7,
    word: 'FORMATIVA',
    clue: 'Evaluación que acompaña el proceso de aprendizaje y ayuda a mejorar.',
    row: 2,
    col: 13,
    direction: 'V'
  },
  {
    id: 7,
    number: 8,
    word: 'HETEROEVALUACION',
    clue: 'Cuando el docente u otra persona evalúa al estudiante.',
    row: 8,
    col: 0,
    direction: 'H'
  },
  {
    id: 8,
    number: 9,
    word: 'DOCENTE',
    clue: 'Persona encargada de orientar y acompañar el aprendizaje.',
    row: 12,
    col: 9,
    direction: 'H'
  }
];

// Helper to normalize letters (remove accents, uppercase)
export function normalizeLetter(char: string): string {
  return char
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}


type Occupied = { letter: string; directions: Set<string> };
const key = (r: number, c: number) => `${r},${c}`;
export function validateCrossword(items: CrosswordItem[]): boolean {
  const cells = new Map<string, Occupied>();
  const links = new Map<number, Set<number>>(items.map(w => [w.id, new Set()]));
  for (const w of items) {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.row + (w.direction === 'V' ? i : 0), c = w.col + (w.direction === 'H' ? i : 0);
      const cell = cells.get(key(r, c));
      if (cell && (cell.letter !== w.word[i] || cell.directions.has(w.direction))) return false;
      if (!cell) cells.set(key(r, c), { letter: w.word[i], directions: new Set([w.direction]) });
      else cell.directions.add(w.direction);
    }
  }
  for (const w of items) {
    const dr = w.direction === 'V' ? 1 : 0, dc = w.direction === 'H' ? 1 : 0;
    if (cells.has(key(w.row - dr, w.col - dc)) || cells.has(key(w.row + dr * w.word.length, w.col + dc * w.word.length))) return false;
    for (let i = 0; i < w.word.length; i++) {
      const r = w.row + dr * i, c = w.col + dc * i;
      if (cells.get(key(r, c))!.directions.size === 1 && (cells.has(key(r + dc, c + dr)) || cells.has(key(r - dc, c - dr)))) return false;
      for (const other of items) if (other.id !== w.id && other.direction !== w.direction) {
        const j = other.direction === 'H' ? c - other.col : r - other.row;
        if (j >= 0 && j < other.word.length && (other.direction === 'H' ? r === other.row : c === other.col)) links.get(w.id)!.add(other.id);
      }
    }
  }
  const visited = new Set<number>();
  function visit(id: number) { if (visited.has(id)) return; visited.add(id); links.get(id)?.forEach(visit); }
  visit(items[0]?.id);
  return visited.size === items.length;
}

export function generateCrossword(): CrosswordItem[] {
  const words = [...fallback].sort((a, b) => b.word.length - a.word.length);
  for (let attempt = 0; attempt < 100; attempt++) {
    const placed: CrosswordItem[] = [{ ...words[0], row: 0, col: 0, direction: 'H' }];
    const pending = [...words.slice(1)];
    while (pending.length) {
      let added = false;
      for (let n = 0; n < pending.length; n++) {
        const word = pending[n];
        const candidates: CrosswordItem[] = [];
        for (const anchor of placed) for (let i = 0; i < anchor.word.length; i++) for (let j = 0; j < word.word.length; j++) {
          if (anchor.word[i] !== word.word[j]) continue;
          const direction = anchor.direction === 'H' ? 'V' : 'H';
          const row = anchor.row + (anchor.direction === 'V' ? i : 0) - (direction === 'V' ? j : 0);
          const col = anchor.col + (anchor.direction === 'H' ? i : 0) - (direction === 'H' ? j : 0);
          const candidate = { ...word, row, col, direction } as CrosswordItem;
          if (validateCrossword([...placed, candidate])) candidates.push(candidate);
        }
        if (candidates.length) {
          placed.push(candidates[Math.floor(Math.random() * candidates.length)]);
          pending.splice(n, 1); added = true; break;
        }
      }
      if (!added) break;
    }
    if (!pending.length) {
      const minR = Math.min(...placed.map(w => w.row)), minC = Math.min(...placed.map(w => w.col));
      placed.forEach(w => { w.row -= minR; w.col -= minC; });
      placed.sort((a, b) => a.row - b.row || a.col - b.col);
      let number = 0, last = '';
      placed.forEach(w => { const start = key(w.row, w.col); if (start !== last) { number++; last = start; } w.number = number; });
      return placed;
    }
  }
  if (!validateCrossword(fallback)) throw new Error('No se pudo construir un crucigrama válido.');
  return fallback;
}
// Stable validated layout keeps the board and its clues consistent across renders.
export const CROSSWORD_ITEMS = validateCrossword(fallback) ? fallback : generateCrossword();
export const CROSSWORD_ROWS = Math.max(...CROSSWORD_ITEMS.map(w => w.row + (w.direction === 'V' ? w.word.length : 1)));
export const CROSSWORD_COLS = Math.max(...CROSSWORD_ITEMS.map(w => w.col + (w.direction === 'H' ? w.word.length : 1)));
