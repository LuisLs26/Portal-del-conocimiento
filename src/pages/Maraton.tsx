import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Flag, Trophy, Users, Copy, Check } from 'lucide-react';
import { enterRace, forget, remember, savedSession, useRace } from '../maraton/client';
import { MAX_PLAYERS } from '../maraton/protocol';
import type { Session } from '../maraton/protocol';
import { sound } from '../utils/sound';
import '../maraton/maraton.css';
import { RaceArena } from '../maraton/RaceArena';

const COLORS = ['#2463eb','#e53645','#ffce32','#1847b8','#ef6540','#8b4fe8'];
export function Maraton() {
  const location = useLocation(), navigate = useNavigate();
  const code = new URLSearchParams(location.search).get('sala')?.toUpperCase() || '';
  const [session, setSession] = useState<Session | null>(() => savedSession(code));
  const [name, setName] = useState(''), [roomInput, setRoomInput] = useState(code);
  const [joining, setJoining] = useState(false), [entryError, setEntryError] = useState('');
  const [qr, setQr] = useState(''), [copied, setCopied] = useState(false);
  const { state, connection, error, busy, send } = useRace(session);
  const feedbackKey = useRef('');
  const shareUrl = session ? `${locationOrigin()}/maraton?sala=${session.room}` : '';
  useEffect(() => { let cancelled = false; setQr(''); if (shareUrl && session?.role === 'host') QRCode.toDataURL(shareUrl, { width: 360, margin: 4, errorCorrectionLevel: 'M' }).then(image => { if (!cancelled) setQr(image); }).catch(() => setEntryError('No se pudo preparar el QR. Puedes compartir el enlace.')); return () => { cancelled = true; }; }, [shareUrl, session?.role]);
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
    <div className="race-intro"><h1>Maratón<span>del conocimiento</span></h1></div>
    {!session ? <>
      <div className="race-entry race-card"><h2>Tu nombre para jugar</h2>
        <form onSubmit={e => { e.preventDefault(); void enter(); }}>
          <label htmlFor="race-name">Tu nombre</label><input id="race-name" autoComplete="given-name" maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Por ejemplo, Ana Torres" required />
          {!code && <><label htmlFor="race-code">Código de sala</label><input id="race-code" value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))} maxLength={8} placeholder="Código del docente" autoCapitalize="characters" required /></>}
          {code && <span className="race-room-tag">Sala {code}</span>}
          <button className="race-primary" disabled={joining}>{joining ? 'Entrando…' : 'Entrar'} <Flag size={18} /></button>
        </form><p role="alert" className="race-error">{entryError}</p>
      </div>
      <details className="race-teacher race-card"><summary>Soy docente</summary><button className="race-secondary" disabled={joining} onClick={() => void enter(true)}>Crear sala</button></details>

    </> : <>
      <div className={`race-connection ${connection}`} role="status">{connection === 'live' ? '● Conectado en vivo' : connection === 'connecting' ? 'Conectando con la clase…' : connection === 'offline' ? 'Reconectando… tu avance está guardado.' : 'La conexión a la sala terminó.'}</div>
      {(error || entryError) && <p role="alert" className="race-error">{error || entryError}</p>}
      {!room && <p>Preparando tu carrera…</p>}
      {room && <>
        <div className="race-summary"><span><Users size={17} /> {room.players.length}/{MAX_PLAYERS}</span><strong>{`Sala ${room.code}`}</strong></div>
        {room.phase === 'lobby' && <div className="race-card race-lobby"><h2>{session.role === 'host' ? 'Invita a tu clase' : `¡Estás dentro, ${self?.name || session.name}!`}</h2><p>{session.role === 'host' ? 'Comparte este QR.' : 'El docente dará la salida.'}</p>
          {session.role === 'host' && <>{qr && <img src={qr} alt={`QR para unirse a la sala ${room.code}`} className="race-qr" />}<strong className="race-code">{room.code}</strong><button className="race-secondary" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch { setEntryError('No se pudo copiar el enlace.'); } }}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Enlace copiado' : 'Copiar invitación'}</button><button className="race-primary" disabled={!room.players.length || busy || connection !== 'live'} onClick={() => { sound.pop(); send('start'); }}>Dar la salida <Flag size={18} /></button></>}
        </div>}
        <div className="race-card race-ranking"><h2><Trophy size={21} /> Participantes</h2><ol>{room.players.map(p => <li key={p.id} className={p.id === session.id ? 'is-me' : ''}><span className="race-rank">{p.rank}</span><span className="race-avatar" style={{ background: COLORS[p.color], color:p.color===2?"#192950":"#fff" }}>{Array.from(p.name)[0].toUpperCase()}</span><div><strong>{p.name}{p.id === session.id && ' (tú)'}</strong><small>{p.online ? 'Listo para salir' : 'Sin conexión'}</small></div>{p.finished && <Trophy size={17} />}{session.role === 'host' && room.phase === 'lobby' && <button className="race-remove" aria-label={`Quitar a ${p.name}`} disabled={busy} onClick={() => send('kick', { playerId:p.id })}>Quitar</button>}</li>)}</ol>{!room.players.length && <p>Esperando a los estudiantes…</p>}</div>
      </>}
      <button className="race-exit" onClick={leave}>Salir de esta sala</button>
    </>}
  </div>;
}
function locationOrigin() { return window.location.origin; }
