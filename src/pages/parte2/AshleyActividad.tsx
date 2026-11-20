import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { ArrowRight, Check, Compass, Layers3, ListOrdered, Search } from 'lucide-react';

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
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [written, setWritten] = useState<Record<number, string>>({});
  const [showModels, setShowModels] = useState(false);
  const total = activity.items.length;
  const complete = step === total;
  const correct = choice === activity.answers[step];
  const Icon = { parejas: Layers3, secuencia: ListOrdered, tipos: Compass, detectives: Search }[kind];
  const subject = { parejas: 'Planificación', secuencia: 'Momentos de evaluación', tipos: 'Tipos de evaluación', detectives: 'Caso de convivencia' }[kind];

  return (
    <div className={`part-two-game discovery-game discovery-${kind}`}>
      <div className="discovery-cover">
        <span className="discovery-cover-icon"><Icon size={24} aria-hidden="true" /></span>
        <div><p>{subject}</p><GameHeading title={activity.title} hint={activity.hint} /></div>
      </div>
      {kind === 'detectives' && <p className="ios-card antony-situation discovery-scenario">{caseText}</p>}
      {total > 0 && <GameProgress label="Retos resueltos" value={step} total={total} />}
      {!complete && (
        <>
          <section className="ios-card antony-situation discovery-scenario" aria-labelledby="ashley-situation">
            <span>Reto {step + 1} de {total}</span>
            <h2 id="ashley-situation">{activity.items[step]}</h2>
          </section>
          <div className="antony-options" role="group" aria-label="Opciones de respuesta">
            {activity.options.map((option, index) => (
              <button
                type="button"
                className="ios-card antony-option"
                key={option}
                aria-pressed={choice === index}
                data-matched={checked && correct && choice === index}
                data-wrong={checked && !correct && choice === index}
                disabled={checked && correct}
                onClick={() => { setChoice(index); setChecked(false); }}
              >
                <span aria-hidden="true">{kind === 'secuencia' ? index + 1 : String.fromCharCode(65 + index)}</span>
                {option}
                {checked && correct && choice === index && <Check size={18} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <p className="antony-feedback" role="status">{checked ? correct ? '¡Correcto!' : 'Revisa la situación y prueba otra opción.' : ''}</p>
          {checked && correct ? (
            <button className="ios-button ios-button-primary discovery-next" onClick={() => { setStep(step + 1); setChoice(null); setChecked(false); }}>
              {step + 1 < total ? 'Siguiente reto' : activity.prompts.length ? 'Continuar' : 'Ver resultado'} <ArrowRight size={17} />
            </button>
          ) : (
            <button className="ios-button ios-button-primary discovery-next" disabled={choice === null || checked} onClick={() => setChecked(true)}>Comprobar</button>
          )}
        </>
      )}
      {complete && kind === 'tipos' && (
        <section className="ios-card antony-reflection discovery-scenario">
          <Check size={24} aria-hidden="true" />
          <h2>¡Reto completado!</h2>
          <p>Clasificaste las cinco situaciones.</p>
          <button className="ios-button ios-button-primary" onClick={() => setStep(0)}>Volver a jugar</button>
        </section>
      )}
      {complete && activity.prompts.length > 0 && (
        <section className="ios-card antony-reflection discovery-scenario">
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
      <Link className="ios-button ios-button-secondary discovery-back" to="/parte-2">Volver a las actividades</Link>
    </div>
  );
}
