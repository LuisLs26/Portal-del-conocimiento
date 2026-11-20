import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameHeading } from '../../components/GameHeading';

const moments = ['Inicio', 'Durante el proceso', 'Final'];
const types = ['Diagnóstica', 'Formativa', 'Sumativa'];
const caseText = 'Una docente planifica una experiencia sobre la convivencia escolar. Su propósito es que los estudiantes analicen los conflictos y propongan soluciones mediante el diálogo. Al comenzar, identifica sus conocimientos previos; durante las actividades, observa sus avances y brinda retroalimentación; finalmente, analiza sus propuestas mediante una rúbrica.';

const activities = {
  parejas: {
    title: '¡Encuentra las parejas!',
    hint: 'Relaciona cada elemento de la planificación y evaluación con su función.',
    options: ['Permite valorar el aprendizaje.', 'Demuestra lo aprendido.', 'Actuación que desarrolla el estudiante.', 'Lo que se espera lograr.', 'Orienta la valoración del aprendizaje.'],
    items: ['Capacidad', 'Propósito', 'Criterio', 'Evidencia', 'Instrumento'],
    answers: [2, 3, 4, 1, 0],
    prompts: ['¿Por qué estos elementos deben mantener una relación entre sí?'],
    models: ['Porque el propósito orienta lo que se espera lograr, los criterios indican qué valorar y las evidencias e instrumentos permiten valorar ese mismo aprendizaje.'],
  },
  secuencia: {
    title: '¡Ordena la secuencia!',
    hint: 'Asigna a cada acción el momento de evaluación que le corresponde.',
    options: moments,
    items: [
      'El docente analiza los productos y reconoce los aprendizajes alcanzados.',
      'El docente identifica los conocimientos previos y las necesidades de los estudiantes.',
      'El docente observa los avances, identifica dificultades y brinda retroalimentación.',
    ],
    answers: [2, 0, 1],
    prompts: moments.map(moment => moment + ' · Acción principal'),
    models: ['Identificar saberes previos y necesidades.', 'Observar avances y retroalimentar.', 'Valorar los productos y reconocer los logros.'],
  },
  tipos: {
    title: '¿Qué tipo de evaluación es?',
    hint: 'Clasifica cada situación según la intención de la evaluación.',
    options: types,
    items: [
      'Antes de iniciar una unidad, el docente realiza preguntas para conocer los saberes previos.',
      'Durante una actividad, el docente identifica dificultades y brinda orientaciones para mejorar los trabajos.',
      'Al finalizar, el docente analiza las evidencias con una rúbrica para determinar el nivel de logro.',
      'El docente identifica qué conocimientos y habilidades necesitan fortalecerse antes de planificar.',
      'Los estudiantes reciben comentarios que les permiten reconocer errores y mejorar sus desempeños.',
    ],
    answers: [0, 1, 2, 0, 1],
    prompts: [],
    models: [],
  },
  detectives: {
    title: '¡Detectives pedagógicos!',
    hint: 'Lee el caso y explica cómo se relacionan la planificación y la evaluación.',
    options: [],
    items: [],
    answers: [],
    prompts: [
      '¿Cuál es el propósito de aprendizaje de la docente?',
      '¿Qué evidencia permite demostrar el aprendizaje?',
      '¿Qué momentos de evaluación se presentan?',
      '¿Qué tipos de evaluación se identifican?',
      '¿Por qué es importante recoger información durante todo el proceso de aprendizaje?',
    ],
    models: [
      'Que los estudiantes analicen conflictos y propongan soluciones mediante el diálogo.',
      'Las propuestas de solución que los estudiantes elaboran para resolver conflictos de convivencia.',
      'Inicio, durante el proceso y final.',
      'Diagnóstica al identificar saberes previos, formativa al retroalimentar y sumativa al valorar las propuestas.',
      'Permite adaptar la enseñanza, orientar las mejoras a tiempo y valorar al final lo que se alcanzó.',
    ],
  },
};

export function AshleyActividad({ kind }: { kind: keyof typeof activities }) {
  const activity = activities[kind];
  const [values, setValues] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [written, setWritten] = useState<Record<number, string>>({});
  const [showModels, setShowModels] = useState(false);
  const score = activity.answers.filter((answer, index) => values[index] === answer).length;
  const complete = score === activity.answers.length;

  return (
    <div className="part-two-game">
      <GameHeading title={activity.title} hint={activity.hint} />
      {kind === 'detectives' && <p className="ios-card antony-situation">{caseText}</p>}
      {activity.items.length > 0 && (
        <>
          <div className="ashley-fields">
            {activity.items.map((item, index) => (
              <label className="ios-card" key={item}>
                <strong>{index + 1}. {item}</strong>
                <select value={values[index] ?? ''} onChange={event => {
                  const value = event.target.value;
                  setValues(previous => ({ ...previous, [index]: value === '' ? -1 : Number(value) }));
                  setChecked(false);
                  setShowModels(false);
                }}>
                  <option value="">Elige una opción</option>
                  {activity.options.map((option, choice) => <option key={option} value={choice}>{kind === 'secuencia' ? `${choice + 1}. ` : ''}{option}</option>)}
                </select>
                {checked && <span>{values[index] === activity.answers[index] ? '✓ Correcto' : 'Revisa esta respuesta'}</span>}
              </label>
            ))}
          </div>
          <button className="ios-button ios-button-primary" disabled={!activity.items.every((_, index) => (values[index] ?? -1) >= 0)} onClick={() => setChecked(true)}>Comprobar</button>
          <p role="status" className="antony-feedback">{checked ? `${score} de ${activity.items.length} correctas` : ''}</p>
        </>
      )}
      {(kind === 'detectives' || (checked && complete)) && activity.prompts.length > 0 && (
        <section className="ios-card antony-reflection">
          <h2>{kind === 'secuencia' ? 'Completa las acciones' : 'Escribe tus respuestas'}</h2>
          {activity.prompts.map((prompt, index) => (
            <div key={prompt}>
              <label htmlFor={`ashley-${index}`}>{prompt}</label>
              <textarea id={`ashley-${index}`} rows={3} value={written[index] ?? ''} onChange={event => setWritten({ ...written, [index]: event.target.value })} />
              {showModels && <p className="ashley-model"><strong>Respuesta de referencia</strong><br />{activity.models[index]}</p>}
            </div>
          ))}
          <button className="ios-button ios-button-primary" disabled={!activity.prompts.every((_, index) => written[index]?.trim())} onClick={() => setShowModels(true)}>Ver respuestas de referencia</button>
        </section>
      )}
      <Link className="ios-button ios-button-secondary" to="/parte-2">Volver a las actividades</Link>
    </div>
  );
}
