import { GameHeading } from '../components/GameHeading';
import { sound } from '../utils/sound';
import { useEffect, useState } from 'react';
import { MATCHING_PAIRS } from '../data/matchingData';
import { shuffle, validPair } from '../data/gameRules';
import { SuccessModal } from '../components/SuccessModal';
import { GameProgress } from '../components/GameProgress';

export function Semana3Matching() {
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const [definitions, setDefinitions] = useState(() => shuffle(MATCHING_PAIRS.filter(p => p.round === 1)));
  const pairs = MATCHING_PAIRS.filter(p => p.round === round);
  useEffect(() => {
    if (round !== 1 || matched.length !== 5) return;
    const timer = setTimeout(() => {
      setRound(2); setSelected(null); setMessage('');
      setDefinitions(shuffle(MATCHING_PAIRS.filter(p => p.round === 2)));
    }, 600);
    return () => clearTimeout(timer);
  }, [matched, round]);
  function reset() {
    sound.click(); setRound(1); setSelected(null); setMatched([]); setMessage(''); setFinished(false);
    setDefinitions(shuffle(MATCHING_PAIRS.filter(p => p.round === 1)));
  }
  function pair(id: number) {
    if (selected === null || matched.includes(id)) return;
    if (!validPair(selected, id, matched)) { sound.error(); setMessage('Esa definición no corresponde. Intenta nuevamente.'); return; }
    sound.success();
    const next = [...matched, id]; setMatched(next); setSelected(null); setMessage('¡Pareja correcta!');
    if (next.length === 10) setFinished(true);
  }
  return <div className="game"><GameHeading title="Relaciona los conceptos" />
    <GameProgress value={matched.length} total={10} label="Parejas completadas" />
    <p>Ronda {round} de 2 · {matched.length} de 10 parejas</p>
    <p className="game-hint">Toca un concepto y después su definición. Las parejas comparten el mismo número.</p>
    <p role="status">{message}</p>
    <div key={round} className="matching-columns ios-animate-enter">
      <div>{pairs.map(p => <button key={p.id} data-concept={p.id} className={`match ${selected === p.id ? 'selected' : ''}`} disabled={matched.includes(p.id)} onClick={() => { sound.pop(); setSelected(p.id); setMessage(''); }}>{matched.includes(p.id) && `${p.id}. ✓ `}{p.concept}</button>)}</div>
      <div>{definitions.map(p => <button key={p.id} data-definition={p.id} className="match" disabled={matched.includes(p.id)} onClick={() => pair(p.id)}>{matched.includes(p.id) && `${p.id}. ✓ `}{p.definition}</button>)}</div>
    </div>
    <button className="ios-button ios-button-secondary" onClick={reset}>Reiniciar</button>
    <SuccessModal isOpen={finished} weekNumber={3} scoreText="10 de 10 parejas" onRetry={reset} />
  </div>;
}
