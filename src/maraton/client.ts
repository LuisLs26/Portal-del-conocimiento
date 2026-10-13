import { useEffect, useRef, useState } from 'react';
import type { Command, Session, StateMessage } from './protocol';

const base = (import.meta.env.VITE_MARATON_API_URL || '/api/maraton').replace(/\/$/, '');
export function savedSession(room: string): Session | null {
  try { return JSON.parse(sessionStorage.getItem(`maraton:${room}`) || 'null'); } catch { return null; }
}
export function remember(session: Session) { try { sessionStorage.setItem(`maraton:${session.room}`, JSON.stringify(session)); } catch {} }
export function forget(room: string) { try { sessionStorage.removeItem(`maraton:${room}`); } catch {} }
export async function enterRace(name?: string, room?: string): Promise<Session> {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(name ? `${base}/rooms/${room}/join` : `${base}/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(name ? { name } : {}), signal: controller.signal });
    if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error('La Maratón todavía no está disponible. Consulta al docente.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudo entrar a la carrera.');
    remember(data); return data;
  } catch (error) {
    if (error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError')) throw new Error('No se pudo conectar. Revisa tu conexión e inténtalo nuevamente.');
    throw error;
  } finally { clearTimeout(timer); }
}
export function useRace(session: Session | null) {
  const [state, setState] = useState<StateMessage | null>(null);
  const [connection, setConnection] = useState<'connecting' | 'live' | 'offline' | 'gone'>('connecting');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const socket = useRef<WebSocket | null>(null), pending = useRef(''), timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentState = useRef<StateMessage | null>(null);
  useEffect(() => {
    setState(null); currentState.current = null; setError('');
    if (!session) return;
    let stopped = false, retry: ReturnType<typeof setTimeout> | null = null, attempts = 0;
    const clearPending = () => { pending.current = ''; setBusy(false); if (timeout.current) clearTimeout(timeout.current); };
    function connect() {
      if (stopped) return;
      setConnection(attempts ? 'offline' : 'connecting');
      const url = new URL(`${base}/rooms/${session!.room}/socket`, location.origin);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(url); socket.current = ws;
      ws.onopen = () => { if (!stopped) ws.send(JSON.stringify({ type: 'auth', token: session!.token })); };
      ws.onmessage = event => {
        if (stopped || socket.current !== ws || event.data === 'pong') return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'error') { setError(message.error); clearPending(); return; }
          if (message.type !== 'state' || message.room.seq < (currentState.current?.room.seq ?? -1)) return;
          currentState.current = message; setState(message); setConnection('live'); attempts = 0;
          if (message.ack === pending.current || !pending.current) { clearPending(); setError(''); }
        } catch { setError('No se pudo leer la actualización. Reconecta para continuar.'); }
      };
      ws.onclose = async event => {
        if (stopped || socket.current !== ws) return;
        clearPending();
        if ([4001,4003,4004,1008].includes(event.code)) { setConnection('gone'); setError(event.reason || 'Vuelve a entrar a la carrera.'); return; }
        setConnection('offline');
        try {
          const status=await fetch(`${base}/rooms/${session!.room}/status`,{signal:AbortSignal.timeout(3000)});
          if(stopped||socket.current!==ws)return;
          if(status.status===404){setConnection('gone');setError('Esta sala ha caducado. Pide al docente un nuevo QR.');return;}
        } catch { /* A mobile network interruption should keep retrying. */ }
        if(stopped||socket.current!==ws)return;
        retry = setTimeout(connect, Math.min(10_000, 1000 * 2 ** attempts++) + Math.random() * 350);
      };
      ws.onerror = () => { /* onclose schedules a single reconnect. */ };
    }
    connect();
    const heartbeat = setInterval(() => { if (socket.current?.readyState === WebSocket.OPEN) socket.current.send('ping'); }, 25_000);
    return () => { stopped = true; if (retry) clearTimeout(retry); clearInterval(heartbeat); clearPending(); socket.current?.close(); socket.current = null; };
  }, [session]);
  function send(type: Command['type'], extra: Partial<Command> = {}) {
    if (!state || connection !== 'live' || pending.current || socket.current?.readyState !== WebSocket.OPEN) return;
    const requestId = crypto.randomUUID(); pending.current = requestId; setBusy(true); setError('');
    socket.current.send(JSON.stringify({ ...extra, type, round: state.room.round, requestId }));
    timeout.current = setTimeout(() => { if (pending.current === requestId) socket.current?.close(); }, 8000);
  }
  return { state, connection, error, busy, send };
}
