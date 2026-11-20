import { useState } from 'react';
import { Check, Lightbulb, Link2, RotateCcw } from 'lucide-react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { sound } from '../../utils/sound';

const techniques = [
  { id: 'A', title: 'Análisis de actuaciones' },
  { id: 'B', title: 'Observación' },
  { id: 'C', title: 'Selección de técnicas según la evidencia y el propósito' },
  { id: 'D', title: 'Diálogo y preguntas' },
  { id: 'E', title: 'Análisis de producciones' },
] as const;

type Technique = typeof techniques[number]['id'];

const situations: { text: string; answer: Technique; why: string }[] = [
  { text: 'El docente observa la participación de sus estudiantes durante una actividad en clase.', answer: 'B', why: 'El docente recoge evidencias al observar directamente la participación.' },
  { text: 'El docente revisa una infografía elaborada por los estudiantes.', answer: 'E', why: 'La infografía es un producto que permite valorar lo aprendido.' },
  { text: 'Un estudiante realiza una dramatización frente a sus compañeros.', answer: 'A', why: 'La dramatización permite valorar cómo se desempeña el estudiante en una actuación.' },
  { text: 'El docente hace preguntas a los estudiantes para comprobar lo aprendido.', answer: 'D', why: 'Las respuestas del diálogo muestran qué entendieron los estudiantes.' },
  { text: 'El docente necesita evaluar una exposición oral y decide qué técnica utilizar.', answer: 'C', why: 'La técnica se elige según lo que se quiere evaluar y la evidencia que ofrece la exposición.' },
];

export function AntonyUneYDescubre() {
  const [step, setStep] = useState(0);
  const [matched, setMatched] = useState<Technique[]>([]);
  const [wrong, setWrong] = useState<Technique | null>(null);
  const [reflection, setReflection] = useState('');
  const situation = situations[step];
  const correct = situation && matched.includes(situation.answer);

  function choose(technique: Technique) {
    if (!situation || correct || matched.includes(technique)) return;
    if (technique !== situation.answer) {
      setWrong(technique);
      sound.error();
      return;
    }
    setWrong(null);
    setMatched([...matched, technique]);
    sound.success();
  }

  return (
    <div className="part-two-game antony-game">
      <GameHeading title="Une y descubre" hint="Elige la técnica de evaluación que corresponde a cada situación." />
      <GameProgress label="Parejas correctas" value={matched.length} total={situations.length} />
      {situation ? (
        <>
          <section className="ios-card antony-situation" aria-labelledby="antony-situation">
            <span><Link2 size={16} aria-hidden="true" /> Situación {step + 1} de {situations.length}</span>
            <h2 id="antony-situation">{situation.text}</h2>
          </section>
          <div className="antony-options" role="group" aria-label="Técnicas de evaluación">
            {techniques.map(technique => (
              <button
                type="button"
                key={technique.id}
                className="ios-card antony-option"
                data-matched={matched.includes(technique.id)}
                data-wrong={wrong === technique.id}
                disabled={Boolean(correct) || matched.includes(technique.id)}
                onClick={() => choose(technique.id)}
              >
                <span>{technique.id}</span>{technique.title}
                {matched.includes(technique.id) && <Check size={18} aria-label="Pareja encontrada" />}
              </button>
            ))}
          </div>
          <p className="antony-feedback" role="status">{correct ? situation.why : wrong ? 'Esa técnica no corresponde. Prueba otra.' : ''}</p>
          {correct && <button className="ios-button ios-button-primary" onClick={() => setStep(step + 1)}>{step + 1 === situations.length ? 'Ir a la reflexión' : 'Siguiente situación'}</button>}
        </>
      ) : (
        <section className="ios-card antony-reflection">
          <Lightbulb size={26} aria-hidden="true" />
          <h2>Reflexión final</h2>
          <label htmlFor="antony-reflection">¿Por qué es importante elegir la técnica de evaluación adecuada según la evidencia y el propósito que queremos evaluar?</label>
          <textarea id="antony-reflection" value={reflection} onChange={event => setReflection(event.target.value)} placeholder="Escribe tu reflexión aquí" rows={4} />
          <button className="ios-button ios-button-secondary" onClick={() => { setStep(0); setMatched([]); setWrong(null); setReflection(''); }}><RotateCcw size={16} /> Volver a jugar</button>
        </section>
      )}
    </div>
  );
}
