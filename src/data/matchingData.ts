export interface ConceptPair {
  id: number;
  concept: string;
  definition: string;
  round: 1 | 2;
}

export const MATCHING_PAIRS: ConceptPair[] = [
  // Ronda 1
  {
    id: 1,
    concept: 'Propósito de aprendizaje',
    definition: 'Expresa qué se espera que logre aprender el estudiante.',
    round: 1
  },
  {
    id: 2,
    concept: 'Criterio de evaluación',
    definition: 'Referente que permite valorar aspectos específicos del aprendizaje.',
    round: 1
  },
  {
    id: 3,
    concept: 'Competencia',
    definition: 'Facultad de combinar capacidades para actuar en una situación determinada.',
    round: 1
  },
  {
    id: 4,
    concept: 'Estándar de aprendizaje',
    definition: 'Describe el nivel de desarrollo esperado de una competencia.',
    round: 1
  },
  {
    id: 5,
    concept: 'Desempeño',
    definition: 'Actuación observable que demuestra el desarrollo de una competencia.',
    round: 1
  },

  // Ronda 2
  {
    id: 6,
    concept: 'Evidencia',
    definition: 'Producción o actuación que permite reconocer los aprendizajes logrados.',
    round: 2
  },
  {
    id: 7,
    concept: 'Técnica de evaluación',
    definition: 'Procedimiento utilizado para recoger información sobre el aprendizaje.',
    round: 2
  },
  {
    id: 8,
    concept: 'Instrumento de evaluación',
    definition: 'Herramienta que permite registrar y valorar los aprendizajes.',
    round: 2
  },
  {
    id: 9,
    concept: 'Rúbrica',
    definition: 'Instrumento que describe criterios y niveles de logro.',
    round: 2
  },
  {
    id: 10,
    concept: 'Lista de cotejo',
    definition: 'Instrumento que permite verificar el cumplimiento de determinados aspectos.',
    round: 2
  }
];
