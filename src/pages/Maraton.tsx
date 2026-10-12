import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Flag, Trophy, Users, Copy, Check, Dice5, Sparkles } from 'lucide-react';
import { enterRace, forget, remember, savedSession, useRace } from '../maraton/client';
import { FINISH, MAX_PLAYERS, tileKind } from '../maraton/protocol';
import type { PublicPlayer, Session } from '../maraton/protocol';
import { sound } from '../utils/sound';
import '../maraton/maraton.css';
import { RaceArena } from '../maraton/RaceArena';

const COLORS = ['#7a52de','#e45171','#008a99','#d6790c','#2974dc','#426c4e'];
const Board = memo(function Board({ players, self }: { players: PublicPlayer[]; self: string }) {
  const groups = useMemo(() => {
    const map = new Map<number, PublicPlayer[]>();
    for (const p of players) map.set(p.position, [...(map.get(p.position) || []), p]);
    return map;
  }, [players]);
  const cells = Array.from({ length: 45 }, (_, index) => {
    const row = 8 - Math.floor(index / 5), col = index % 5;
    return row * 5 + (row % 2 ? 4 - col : col);
  });
  return <div className="race-board" aria-label="Tablero de Maratón: salida 0 y meta 40">
    {cells.map(position => {
      if (position > FINISH) return <div key={position} className="race-cell-empty" aria-hidden="true" />;
      const occupants = groups.get(position) || [], kind = tileKind(position);
      const topic = Math.min(4, Math.floor(Math.max(0, position - 1) / 8));
      return <div key={position} data-tile={position} className={`race-cell tile-${kind} zone-${topic} ${occupants.some(p => p.id === self) ? 'my-tile' : ''}`} aria-label={`Casilla ${position}, ${kind === 'question' ? 'pregunta' : kind === 'bonus' ? 'estrella' : kind === 'finish' ? 'meta' : kind === 'start' ? 'salida' : 'libre'}. ${occupants.map(p => p.name).join(', ')}`}>
        <strong>{position === 0 ? <Flag size={18} /> : position === FINISH ? <Trophy size={20} /> : position}</strong>
        <span className="tile-mark">{kind === 'question' ? '?' : kind === 'bonus' ? '★' : kind === 'start' ? 'SALIDA' : kind === 'finish' ? 'META' : '·'}</span>
        <div className="race-pieces">{occupants.slice(0,3).map(p => <span key={p.id} title={p.name} style={{ background: COLORS[p.color] }} className={p.id === self ? 'my-piece' : ''}>{p.name[0].toUpperCase()}</span>)}{occupants.length > 3 && <small>+{occupants.length - 3}</small>}</div>
      </div>;
    })}
  </div>;
});
export function Maraton() {
  const location = useLocation(), navigate = useNavigate();
  const code = new URLSearchParams(location.search).get('sala')?.toUpperCase() || '';
  const [session, setSession] = useState<Session | null>(() => savedSession(code));
  const [name, setName] = useState(''), [roomInput, setRoomInput] = useState(code);
  const [joining, setJoining] = useState(false), [entryError, setEntryError] = useState('');
  const [qr, setQr] = useState(''), [copied, setCopied] = useState(false), [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const { state, connection, error, busy, send } = useRace(session);
  const feedbackKey = useRef('');
  const shareUrl = session ? `${locationOrigin()}/maraton?sala=${session.room}` : '';
  useEffect(() => { let cancelled = false; setQr(''); if (shareUrl && session?.role === 'host') QRCode.toDataURL(shareUrl, { width: 360, margin: 4, errorCorrectionLevel: 'M' }).then(image => { if (!cancelled) setQr(image); }).catch(() => setEntryError('No se pudo preparar el QR. Puedes compartir el enlace.')); return () => { cancelled = true; }; }, [shareUrl, session?.role]);
  useEffect(() => { setSelected(null); }, [state?.you?.question?.id]);
  useEffect(() => {
    const feedback = state?.you?.feedback, key = JSON.stringify(feedback);
    if (feedback && key !== feedbackKey.current) { if (feedback.kind === 'correct') sound.success(); else if (feedback.kind === 'wrong' || feedback.kind === 'timeout') sound.error(); }
    feedbackKey.current = key;
  }, [state?.you?.feedback]);
  async function enter(host = false) {
    if (joining) return;
    setEntryError('');
    if (!host && (!/^[A-Z0-9]{8}$/.test(roomInput) || name.trim().length < 2)) { setEntryError('Escribe tu nombre y el código de la sala del docente.'); return; }
    setJoining(true);
    try { const identity = await enterRace(host ? undefined : name, roomInput); remember(identity); setSession(identity); navigate(`/maraton?sala=${identity.room}`, { replace: true }); sound.pop(); }
    catch (e) { setEntryError(e instanceof Error ? e.message : 'No se pudo entrar.'); }
    finally { setJoining(false); }
  }
  function leave() { if (session) forget(session.room); setSession(null); setEntryError(''); navigate('/maraton', { replace: true }); }
  const room = state?.room, you = state?.you, self = room?.players.find(p => p.id === session?.id);
  if (room && session && room.phase !== 'lobby') return <RaceArena room={room} you={you || null} session={session} connection={connection} busy={busy} error={error} send={send} leave={leave} />;
  return <div className="maraton">
    <div className="race-intro"><span className="race-eyebrow"><Sparkles size={15} /> Una clase. Una gran carrera.</span><h1>Maratón<span>del conocimiento</span></h1><p>Lanza el dado, supera retos del libro y llega a la meta con tu clase.</p></div>
    {!session ? <>
      <div className="race-entry race-card"><h2>¡Únete a la carrera!</h2><p>Escanea el QR de tu docente y escribe tu nombre.</p>
        <form onSubmit={e => { e.preventDefault(); void enter(); }}>
          <label htmlFor="race-name">Tu nombre</label><input id="race-name" autoComplete="given-name" maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Por ejemplo, Ana Torres" required />
          {!code && <><label htmlFor="race-code">Código de sala</label><input id="race-code" value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))} maxLength={8} placeholder="Código del docente" autoCapitalize="characters" required /></>}
          {code && <span className="race-room-tag">Sala {code}</span>}
          <button className="race-primary" disabled={joining}>{joining ? 'Entrando…' : 'Entrar con mi nombre'} <Flag size={18} /></button>
        </form><p role="alert" className="race-error">{entryError}</p>
      </div>
      <details className="race-teacher race-card"><summary>Soy docente · organizar una carrera</summary><p>Crea una sala para hasta {MAX_PLAYERS} estudiantes. Comparte su QR y da la salida cuando estén listos.</p><button className="race-secondary" disabled={joining} onClick={() => void enter(true)}>Crear sala de Maratón</button></details>
      <Rules />
    </> : <>
      <div className={`race-connection ${connection}`} role="status">{connection === 'live' ? '● Conectado en vivo' : connection === 'connecting' ? 'Conectando con la clase…' : connection === 'offline' ? 'Reconectando… tu avance está guardado.' : 'La conexión a la sala terminó.'}</div>
      {(error || entryError) && <p role="alert" className="race-error">{error || entryError}</p>}
      {!room && <p>Preparando tu carrera…</p>}
      {room && <>
        <div className="race-summary"><span><Users size={17} /> {room.players.length}/{MAX_PLAYERS}</span><strong>{room.phase === 'lobby' ? `Sala ${room.code}` : room.phase === 'finished' ? 'Carrera terminada' : `Ronda ${room.round}`}</strong></div>
        {room.phase === 'lobby' && <div className="race-card race-lobby"><h2>{session.role === 'host' ? 'Reúne a tu clase' : `¡Estás dentro, ${self?.name || session.name}!`}</h2><p>{session.role === 'host' ? 'Este QR lleva a tu sala. Cada estudiante solo escribe su nombre.' : 'La carrera comienza cuando el docente da la salida.'}</p>
          {session.role === 'host' && <>{qr && <img src={qr} alt={`QR para unirse a la sala ${room.code}`} className="race-qr" />}<strong className="race-code">{room.code}</strong><button className="race-secondary" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch { setEntryError('No se pudo copiar el enlace.'); } }}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Enlace copiado' : 'Copiar invitación'}</button><button className="race-primary" disabled={!room.players.length || busy || connection !== 'live'} onClick={() => { sound.pop(); send('start'); }}>Dar la salida <Flag size={18} /></button></>}
        </div>}
        {room.phase !== 'lobby' && <>
          {room.phase === 'finished' && <div className="race-podium race-card"><Trophy size={34} /><h2>{room.players[0]?.name || 'La clase'} lidera la Maratón</h2><p>{room.reason}</p>{self && <strong>Tu puesto: {self.rank} · {self.correct} aciertos</strong>}</div>}
          {session.role === 'player' && room.phase === 'playing' && <div className="race-card race-turn">
            <div className="race-my-stats"><span>Tu puesto <strong>#{self?.rank}</strong></span><span>Casilla <strong>{self?.position}/{FINISH}</strong></span></div>
            {you?.question ? <div className="race-question" key={you.question.id}><span className="race-room-tag">Reto · {you.question.topic}</span><h2>{you.question.text}</h2><div className="race-options">{you.question.options.map((option,i) => <button key={i} className={selected === i ? 'chosen' : ''} aria-pressed={selected === i} disabled={busy || connection !== 'live'} onClick={() => { sound.pop(); setSelected(i); }}><b>{'ABCD'[i]}</b>{option}</button>)}</div><button className="race-primary" disabled={selected === null || busy || connection !== 'live'} onClick={() => send('answer', { option: selected!, questionId: you.question!.id })}>{busy ? 'Comprobando…' : 'Comprobar respuesta'}</button></div>
              : <><div className={`race-die ${busy ? 'rolling' : ''}`} aria-label={you?.die ? `Dado: ${you.die}` : 'Dado listo'}>{you?.die || <Dice5 size={42} />}</div><button className="race-primary" disabled={busy || connection !== 'live' || you?.done || you?.finished} onClick={() => { sound.pop(); send('roll'); }}>{you?.finished ? '¡Llegaste a la meta!' : you?.done ? 'Espera a la clase…' : busy ? 'Lanzando…' : 'Lanzar el dado'}</button></>}
            {you?.feedback && <div className={`race-feedback ${you.feedback.kind}`} role="status"><strong>{you.feedback.text}</strong>{you.feedback.answer && <p>Respuesta correcta: {you.feedback.answer}</p>}{you.feedback.explanation && <p>{you.feedback.explanation}</p>}{you.feedback.page && <small>Libro · página {you.feedback.page}</small>}</div>}
          </div>}
          <div className="race-board-heading"><h2>El recorrido</h2><span>40 casillas · 5 temas</span></div><Board players={room.players} self={session.id} /><div className="race-legend"><span>❔ Pregunta</span><span>⭐ +2 si aciertas</span><span>● Tu ficha</span></div>
        </>}
        <div className="race-card race-ranking"><h2><Trophy size={21} /> {room.phase === 'lobby' ? 'Participantes' : 'Ranking en vivo'}</h2><ol>{(showAll || room.phase === 'lobby' ? room.players : room.players.slice(0,5)).map(p => <li key={p.id} className={p.id === session.id ? 'is-me' : ''}><span className="race-rank">{p.rank}</span><span className="race-avatar" style={{ background: COLORS[p.color] }}>{p.name[0].toUpperCase()}</span><div><strong>{p.name}{p.id === session.id && ' (tú)'}</strong><small>{room.phase === 'lobby' ? p.online ? 'Listo para salir' : 'Sin conexión' : `${p.position}/${FINISH} · ${p.correct} aciertos${!p.online ? ' · sin conexión' : ''}`}</small></div>{p.finished && <Trophy size={17} />}{session.role === 'host' && room.phase === 'lobby' && <button className="race-remove" aria-label={`Quitar a ${p.name}`} disabled={busy} onClick={() => send('kick', { playerId:p.id })}>Quitar</button>}</li>)}</ol>{!room.players.length && <p>Esperando a los estudiantes…</p>}{room.players.length > 5 && room.phase !== 'lobby' && <button className="race-secondary" onClick={() => setShowAll(v => !v)}>{showAll ? 'Ver primeros 5' : `Ver los ${room.players.length} participantes`}</button>}</div>
        {session.role === 'host' && room.phase === 'playing' && <button className="race-secondary" disabled={busy || connection !== 'live'} onClick={() => { if (window.confirm('¿Finalizar la carrera y conservar el ranking actual?')) send('finish'); }}>Finalizar carrera</button>}
        {session.role === 'host' && room.phase === 'finished' && <button className="race-primary" disabled={busy || connection !== 'live'} onClick={() => send('reset')}>Organizar otra carrera</button>}
      </>}
      <button className="race-exit" onClick={leave}>Salir de esta sala</button><Rules />
    </>}
  </div>;
}
function locationOrigin() { return window.location.origin; }
function Rules() { return <details className="race-rules race-card"><summary>Cómo se juega</summary><ol><li>El docente da la salida. Cada estudiante juega a su ritmo, sin esperar a la clase.</li><li>Lanza el dado y avanza de 1 a 6 casillas.</li><li>En ❔ o ⭐ responde una pregunta del libro. Puedes cambiar tu elección antes de comprobar.</li><li>Si aciertas, conservas tu avance; en ⭐ ganas 2 casillas más. Si fallas o dejas una pregunta sin responder, retrocedes 2.</li><li>No hay cuenta regresiva ni espera entre turnos.</li><li>Para cruzar la meta debes responder correctamente su pregunta. El orden de llegada decide los primeros puestos; mientras avanzas, los aciertos desempatan.</li></ol></details>; }
