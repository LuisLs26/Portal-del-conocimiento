export interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number; // 0=A, 1=B, 2=C, 3=D
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    topic: 'Concepto de competencia',
    question: 'En una clase de Ciencias, los estudiantes deben diseñar un filtro de agua casero para purificar agua de lluvia. ¿Por qué esta actividad evalúa una competencia y no solo contenidos aislados?',
    options: [
      'Porque exige memorizar los pasos químicos de la purificación sin cometer errores.',
      'Porque moviliza y combina conocimientos científicos, habilidades prácticas y actitudes ante un reto real.',
      'Porque se realiza exclusivamente al término del año escolar para asignar una calificación numérica.',
      'Porque permite comparar qué estudiante terminó el trabajo en menor tiempo que los demás.'
    ],
    correctIndex: 1, // B
    explanation: 'Una competencia es la facultad de combinar diversas capacidades (conocimientos, habilidades y actitudes) para actuar de manera pertinente y eficaz frente a una situación desafiante.'
  },
  {
    id: 2,
    topic: 'Capacidades y sus componentes',
    question: 'Un docente observa que sus alumnos conocen las reglas ortográficas y redactan con fluidez, pero no muestran disposición a revisar críticamente sus textos antes de entregarlos. ¿Qué dimensión de las capacidades necesita fortalecerse?',
    options: [
      'La dimensión actitudinal y reflexiva hacia la mejora continua de su propia producción.',
      'La retención conceptual de reglas gramaticales mediante planas adicionales.',
      'La velocidad mecánica de escritura en el procesador de textos.',
      'La capacidad de memorización a corto plazo de definiciones teóricas.'
    ],
    correctIndex: 0, // A
    explanation: 'Las capacidades integran conocimientos (saber), habilidades (saber hacer) y actitudes (disposición y valoración). La disposición a autorregularse y mejorar es un pilar actitudinal clave.'
  },
  {
    id: 3,
    topic: 'Estándares de aprendizaje',
    question: 'Al diseñar la planificación anual, ¿cuál es la función primordial de los estándares de aprendizaje en el enfoque por competencias?',
    options: [
      'Establecer un ranking entre las diferentes instituciones educativas de la región.',
      'Determinar el número exacto de tareas que cada estudiante debe completar cada mes.',
      'Servir como referentes comunes y progresivos que describen el nivel de desarrollo esperado al término de cada ciclo.',
      'Sustituir la labor pedagógica del docente por rúbricas estandarizadas universales.'
    ],
    correctIndex: 2, // C
    explanation: 'Los estándares de aprendizaje definen con claridad y progresión el nivel de complejidad creciente que se espera que los estudiantes alcancen al finalizar periodos y ciclos formativos.'
  },
  {
    id: 4,
    topic: 'Desempeños',
    question: 'Si un docente necesita comprobar si un estudiante de secundaria está progresando en la competencia comunicativa oral, ¿a qué elemento debe recurrir como indicador observable de su grado de avance?',
    options: [
      'A la cantidad de libros que el estudiante tiene en su biblioteca familiar.',
      'A la prueba escrita de alternativas múltiples sobre historia de la literatura.',
      'A las actuaciones específicas y observables (desempeños) que demuestra durante debates y exposiciones.',
      'Al promedio acumulado de sus calificaciones de años lectivos anteriores.'
    ],
    correctIndex: 2, // C
    explanation: 'Los desempeños son descripciones precisas y observables de lo que hacen los estudiantes respecto a los niveles de desarrollo de las competencias en situaciones determinadas.'
  },
  {
    id: 5,
    topic: 'Relación enseñanza, aprendizaje y evaluación',
    question: '¿Cuál de las siguientes afirmaciones refleja mejor la relación contemporánea entre enseñanza, aprendizaje y evaluación en el aula formativa?',
    options: [
      'La evaluación debe considerarse un acto final, desvinculado por completo de las sesiones de clase.',
      'La enseñanza y el aprendizaje ocurren en clase, mientras que la evaluación pertenece exclusivamente al periodo de exámenes.',
      'La evaluación es un proceso continuo e inherente al aprendizaje que orienta las decisiones pedagógicas en tiempo real.',
      'El propósito de enseñar es preparar al estudiante para responder con éxito exámenes estandarizados.'
    ],
    correctIndex: 2, // C
    explanation: 'En el enfoque formativo, evaluar no es un suceso aislado al final, sino un proceso permanente entrelazado con la enseñanza que permite retroalimentar y reorientar el aprendizaje.'
  },
  {
    id: 6,
    topic: 'Evaluación del desarrollo de competencias',
    question: 'Para evaluar si un grupo de estudiantes ha desarrollado una competencia histórica y ciudadana, ¿cuál de las siguientes estrategias es la más idónea?',
    options: [
      'Pedirles que elaboren un ensayo con propuestas sustentadas frente a un conflicto socioambiental de su localidad.',
      'Aplicar un cuestionario de 50 fechas históricas exactas para medir su retención memorística.',
      'Hacer que copien textualmente dos capítulos del libro escolar en su cuaderno de trabajo.',
      'Calificar el orden y la caligrafía de sus apuntes de clase sin considerar el análisis crítico.'
    ],
    correctIndex: 0, // A
    explanation: 'Evaluar competencias requiere enfrentar a los estudiantes a situaciones auténticas y complejas donde deban deliberar, contrastar fuentes y proponer soluciones fundamentadas.'
  },
  {
    id: 7,
    topic: 'Evaluación formativa',
    question: 'Durante la elaboración de un proyecto científico, el profesor revisa el borrador del informe y formula preguntas que ayudan al equipo a darse cuenta de inconsistencias en sus datos. ¿Qué finalidad prioriza esta intervención?',
    options: [
      'Sancionar de inmediato el error con un descuento de puntos en el registro auxiliar.',
      'Cumplir con un requisito puramente administrativo exigido por la dirección escolar.',
      'Identificar la dificultad a tiempo y promover la reflexión crítica para que los propios estudiantes mejoren su producción.',
      'Asegurar que todos los equipos presenten conclusiones idénticas y homogéneas.'
    ],
    correctIndex: 2, // C
    explanation: 'La evaluación formativa utiliza la información recogida para dialogar con el estudiante, hacer visible su razonamiento y potenciar su autonomía para mejorar el aprendizaje en curso.'
  },
  {
    id: 8,
    topic: 'Importancia de las evidencias',
    question: '¿Por qué un docente no debe basar su valoración únicamente en su impresión subjetiva, sino en evidencias auténticas de aprendizaje?',
    options: [
      'Porque las impresiones subjetivas agilizan el cierre de actas al finalizar el periodo escolar.',
      'Porque únicamente las pruebas elaboradas por el ministerio tienen validez pedagógica.',
      'Porque las evidencias (producciones o actuaciones) constituyen el sustento objetivo y verificable del nivel de competencia alcanzado.',
      'Para evitar que los estudiantes cuestionen las decisiones del cuerpo docente.'
    ],
    correctIndex: 2, // C
    explanation: 'Las evidencias son las producciones o actuaciones concretas de los estudiantes que permiten contrastar sus progresos reales frente a los criterios de evaluación establecidos.'
  },
  {
    id: 9,
    topic: 'Retroalimentación efectiva',
    question: 'Un docente devuelve un informe con la anotación: "Buen trabajo, 17/20". Según los principios de la evaluación formativa, ¿por qué esta retroalimentación es insuficiente?',
    options: [
      'Porque no especifica qué logros se alcanzaron, cuáles son las áreas de mejora ni qué acciones concretas tomar para avanzar.',
      'Porque la nota numérica debió haberse acompañado de una sanción pública.',
      'Porque los elogios nunca deben formar parte del proceso pedagógico en el aula.',
      'Porque los estudiantes de alto rendimiento no requieren ninguna orientación pedagógica adicional.'
    ],
    correctIndex: 0, // A
    explanation: 'Una retroalimentación formativa y eficaz describe aciertos, señala brechas respecto al criterio de evaluación y orienta con claridad los siguientes pasos hacia el nivel deseado.'
  },
  {
    id: 10,
    topic: 'Aplicación en situaciones reales',
    question: 'Un estudiante conoce a la perfección las causas teóricas de la contaminación ambiental, pero no sabe proponer soluciones viables en su comunidad. ¿Qué necesita desarrollar para demostrar su competencia?',
    options: [
      'Memorizar más definiciones del texto escolar sobre ecología y biodiversidad.',
      'Obtener una calificación más alta en la prueba teórica del próximo bimestre.',
      'Repetir exactamente la información del libro sin cambiar ninguna palabra.',
      'Aplicar sus conocimientos de forma articulada para resolver el problema en su contexto real.'
    ],
    correctIndex: 3, // D
    explanation: 'Ser competente significa transferir y articular conocimientos, habilidades y actitudes en situaciones auténticas para resolver problemas y transformar la realidad.'
  }
];

// Rotate alternatives without changing the educational answer.
export const QUIZ_QUESTIONS: Question[] = questions.map((q, i) => {
  const target = i % 4;
  const options = [...q.options];
  [options[target], options[q.correctIndex]] = [options[q.correctIndex], options[target]];
  return { ...q, options, correctIndex: target };
});
