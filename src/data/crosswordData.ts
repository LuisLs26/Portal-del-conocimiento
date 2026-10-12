export interface CrosswordItem {
  id: number;
  number: number;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'H' | 'V'; // H = Horizontal, V = Vertical
}

export const CROSSWORD_ROWS = 14;
export const CROSSWORD_COLS = 16;

export const CROSSWORD_ITEMS: CrosswordItem[] = [
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
