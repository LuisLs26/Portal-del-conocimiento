export interface ClozeBlank {
  id: number;
  correctWord: string;
  explanation: string;
}

export const CLOZE_BLANKS: ClozeBlank[] = [
  {
    id: 0,
    correctWord: 'Competencias',
    explanation: 'El enfoque por competencias busca que el estudiante actúe eficazmente combinando capacidades ante situaciones complejas.'
  },
  {
    id: 1,
    correctWord: 'Situación',
    explanation: 'La situación significativa desafía al estudiante y conecta el aprendizaje con su realidad y contexto auténtico.'
  },
  {
    id: 2,
    correctWord: 'Propósito',
    explanation: 'El propósito de aprendizaje orienta con claridad hacia dónde se dirige el esfuerzo pedagógico y cognitivo.'
  },
  {
    id: 3,
    correctWord: 'Criterios',
    explanation: 'Los criterios de evaluación transparentan qué aspectos específicos se valorarán en el desempeño del alumno.'
  },
  {
    id: 4,
    correctWord: 'Evidencias',
    explanation: 'Las evidencias son producciones o actuaciones concretas que visibilizan el nivel de desarrollo de las capacidades.'
  },
  {
    id: 5,
    correctWord: 'Retroalimentación',
    explanation: 'La retroalimentación formativa oportuna reduce la brecha entre el nivel actual y el nivel esperado.'
  },
  {
    id: 6,
    correctWord: 'Rúbrica',
    explanation: 'La rúbrica describe descriptores graduales de desempeño para valorar niveles de logro (inicio, proceso, esperado, destacado).'
  },
  {
    id: 7,
    correctWord: 'Lista de cotejo',
    explanation: 'La lista de cotejo es un instrumento dicotómico (sí/no) ideal para verificar la presencia o ausencia de aspectos concretos.'
  }
];

export const WORD_BANK = [
  'Competencias',
  'Situación',
  'Propósito',
  'Criterios',
  'Evidencias',
  'Retroalimentación',
  'Rúbrica',
  'Lista de cotejo'
];
