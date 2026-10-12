export interface WordItem {
  id: number;
  word: string; // uppercase without accents for grid
  display: string; // orthographically correct with accents
}

export const WORD_SEARCH_WORDS: WordItem[] = [
  { id: 1, word: 'CONTEXTO', display: 'CONTEXTO' },
  { id: 2, word: 'DESAFIO', display: 'DESAFÍO' },
  { id: 3, word: 'SITUACION', display: 'SITUACIÓN' },
  { id: 4, word: 'COMPETENCIA', display: 'COMPETENCIA' },
  { id: 5, word: 'CRITERIO', display: 'CRITERIO' },
  { id: 6, word: 'EVIDENCIA', display: 'EVIDENCIA' },
  { id: 7, word: 'PROPOSITO', display: 'PROPÓSITO' },
  { id: 8, word: 'APRENDIZAJE', display: 'APRENDIZAJE' },
  { id: 9, word: 'PLANIFICACION', display: 'PLANIFICACIÓN' },
  { id: 10, word: 'FORMATIVA', display: 'FORMATIVA' },
  { id: 11, word: 'AMBIENTE', display: 'AMBIENTE' },
  { id: 12, word: 'PROBLEMA', display: 'PROBLEMA' }
];

export interface PlacedWord {
  word: string;
  display: string;
  startR: number;
  startC: number;
  endR: number;
  endC: number;
  path: { r: number; c: number }[];
  color: string;
}

const SPANISH_FREQUENT_LETTERS = 'EAOSRNIDLCTUMPGBVFZ';

// Pastel Apple tint highlight colors for found words
export const HIGHLIGHT_COLORS = [
  'rgba(197, 161, 90, 0.45)',  // Dorado
  'rgba(40, 92, 74, 0.45)',   // Esmeralda
  'rgba(120, 47, 67, 0.45)',   // Borgoña
  'rgba(52, 120, 246, 0.40)',  // Azul iOS
  'rgba(52, 199, 89, 0.40)',   // Verde iOS
  'rgba(255, 149, 0, 0.40)',   // Naranja iOS
  'rgba(175, 82, 222, 0.40)',  // Púrpura iOS
  'rgba(88, 86, 214, 0.40)',   // Indigo iOS
  'rgba(255, 45, 85, 0.40)',   // Rosa iOS
  'rgba(0, 199, 190, 0.40)',   // Teal iOS
  'rgba(162, 132, 94, 0.45)',  // Ocre iOS
  'rgba(76, 175, 80, 0.40)'    // Verde oliva
];

export function generateWordSearchGrid(size = 16): {
  grid: string[][];
  placedWords: PlacedWord[];
} {
  const directions = [
    [0, 1],   // H derecha
    [0, -1],  // H izquierda
    [1, 0],   // V abajo
    [-1, 0],  // V arriba
    [1, 1],   // Diagonal abajo-der
    [-1, -1], // Diagonal arriba-izq
    [1, -1],  // Diagonal abajo-izq
    [-1, 1]   // Diagonal arriba-der
  ];

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(''));
    const placedList: PlacedWord[] = [];
    let allPlaced = true;

    // Order words randomly to vary layout
    const wordsToPlace = [...WORD_SEARCH_WORDS].sort(() => Math.random() - 0.5);

    for (let wIndex = 0; wIndex < wordsToPlace.length; wIndex++) {
      const item = wordsToPlace[wIndex];
      const w = item.word;
      let placedCurrent = false;

      // Generate all valid starting spots and directions
      const spots: { r: number; c: number; d: number[] }[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          for (const d of directions) {
            spots.push({ r, c, d });
          }
        }
      }
      spots.sort(() => Math.random() - 0.5);

      for (const { r, c, d } of spots) {
        const er = r + d[0] * (w.length - 1);
        const ec = c + d[1] * (w.length - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;

        let conflict = false;
        for (let i = 0; i < w.length; i++) {
          const cr = r + d[0] * i;
          const cc = c + d[1] * i;
          if (grid[cr][cc] !== '' && grid[cr][cc] !== w[i]) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          const path: { r: number; c: number }[] = [];
          for (let i = 0; i < w.length; i++) {
            const cr = r + d[0] * i;
            const cc = c + d[1] * i;
            grid[cr][cc] = w[i];
            path.push({ r: cr, c: cc });
          }
          placedList.push({
            word: w,
            display: item.display,
            startR: r,
            startC: c,
            endR: er,
            endC: ec,
            path,
            color: HIGHLIGHT_COLORS[wIndex % HIGHLIGHT_COLORS.length]
          });
          placedCurrent = true;
          break;
        }
      }

      if (!placedCurrent) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      // Fill remaining empty cells
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!grid[r][c]) {
            const randomChar = SPANISH_FREQUENT_LETTERS[
              Math.floor(Math.random() * SPANISH_FREQUENT_LETTERS.length)
            ];
            grid[r][c] = randomChar;
          }
        }
      }
      return { grid, placedWords: placedList };
    }
  }

  // Fallback (safe guarantee)
  return generateWordSearchGrid(size);
}
