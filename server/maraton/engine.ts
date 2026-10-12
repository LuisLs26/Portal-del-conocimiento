import { FINISH, MAX_PLAYERS, TOPICS, tileKind } from '../../src/maraton/protocol';
import type { Command, Feedback, PrivatePlayer, PublicQuestion, PublicRoom } from '../../src/maraton/protocol';
import { BOOK_QUESTIONS } from './questions';

interface Pending { question: PublicQuestion; correct: number; explanation: string; bonus: boolean }
export interface Player {
  id: string; token: string; name: string; position: number; correct: number; attempts: number;
  done: boolean; die: number; rolls: number; finishOrder: number; color: number;
  pending: Pending | null; feedback: Feedback | null; seen: string[];
}
export interface Room {
  code: string; hostToken: string; phase: PublicRoom['phase']; players: Player[];
  round: number; deadline: number; expires: number; raceEnds: number; seq: number; finishCount: number; reason: string;
}
export class GameError extends Error {}
export const uid = () => crypto.randomUUID();
export function createRoom(code: string, now = Date.now()): Room {
  return { code, hostToken: uid(), phase: 'lobby', players: [], round: 0, deadline: 0, expires: now + 4 * 60 * 60_000, raceEnds: 0, seq: 0, finishCount: 0, reason: '' };
}
export function joinRoom(room: Room, rawName: string, now = Date.now(), token?: string) {
  if (now >= room.expires) throw new GameError('Esta sala ha caducado. Pide al docente un nuevo QR.');
  if (token) {
    const existing = room.players.find(p => p.token === token);
    if (existing) return existing;
  }
  if (room.phase !== 'lobby') throw new GameError('La carrera ya comenzó. Pide al docente entrar en la siguiente.');
  if (room.players.length >= MAX_PLAYERS) throw new GameError('La sala ya tiene 30 participantes.');
  const base = rawName.normalize('NFC').trim().replace(/\s+/g, ' ');
  if ([...base].length < 2 || [...base].length > 24 || /[\p{Cc}\p{Cf}<>]/u.test(base)) throw new GameError('Escribe un nombre de entre 2 y 24 caracteres.');
  let name = base, suffix = 2;
  while (room.players.some(p => p.name.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))) name = `${base} (${suffix++})`;
  const player: Player = { id: uid().slice(0, 12), token: uid(), name, position: 0, correct: 0, attempts: 0, done: false, die: 0, rolls: 0, finishOrder: 0, color: room.players.length % 6, pending: null, feedback: null, seen: [] };
  room.players.push(player); room.seq++;
  return player;
}
export function authenticate(room: Room, token: string) {
  if (token === room.hostToken) return { role: 'host' as const, id: 'host' };
  const p = room.players.find(p => p.token === token);
  if (!p) throw new GameError('Vuelve a entrar a la sala con tu nombre.');
  return { role: 'player' as const, id: p.id };
}
export function fairDie() {
  const bytes = new Uint8Array(1);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= 252);
  return bytes[0] % 6 + 1;
}
function finished(room: Room, player: Player) {
  if (player.position >= FINISH && !player.finishOrder) { player.finishOrder = ++room.finishCount; player.done = true; }
}
function maybeAdvance(room: Room) {
  if (room.players.every(p => p.finishOrder)) { room.phase = 'finished'; room.reason = '¡Toda la clase completó la Maratón!'; room.deadline = 0; }
}
// No shared round or answer deadline: a slow or disconnected player never blocks another.
export function expireRound(_room: Room, _now = Date.now()) { return false; }
function question(position: number, player: Player, random: () => number): Pending {
  const topic = Math.min(4, Math.floor((position - 1) / 8));
  const pool = BOOK_QUESTIONS.filter(q => q.topic === topic);
  // A private question instance prevents replaying an answer from another turn.
  const index = (player.rolls - 1 + Math.floor(random() * pool.length)) % pool.length;
  const q = pool[index], correct = Math.floor(random() * 4);
  const options = [...q.options]; [options[0], options[correct]] = [options[correct], options[0]];
  return { question: { id: uid(), text: q.text, options, page: q.page, topic: TOPICS[topic] }, correct, explanation: q.explanation, bonus: tileKind(position) === 'bonus' };
}
export function command(room: Room, actor: { role: 'host' | 'player'; id: string }, action: Command, now = Date.now(), dice = fairDie, random = Math.random) {
  if (now >= room.expires) throw new GameError('La sala ha caducado.');
  expireRound(room, now);
  if (!action || typeof action.requestId !== 'string' || action.requestId.length > 64 || action.requestId.length < 8) throw new GameError('Acción inválida.');
  if (actor.role === 'host') {
    if (action.type === 'start') {
      if (room.phase !== 'lobby' || !room.players.length) throw new GameError('Espera a que entre al menos un estudiante.');
      room.phase = 'playing'; room.round = 1; room.deadline = 0; room.raceEnds = 0;
    } else if (action.type === 'finish') {
      if (room.phase !== 'playing') throw new GameError('No hay una carrera en marcha.');
      room.phase = 'finished'; room.reason = 'El docente finalizó la carrera.'; room.deadline = 0;
      room.players.forEach(p => { p.pending = null; p.done = true; });
    } else if (action.type === 'reset') {
      if (room.phase !== 'finished') throw new GameError('Finaliza la carrera antes de comenzar otra.');
      room.phase = 'lobby'; room.round = 0; room.deadline = 0; room.finishCount = 0; room.reason = '';
      for (const p of room.players) Object.assign(p, { position: 0, correct: 0, attempts: 0, done: false, die: 0, rolls: 0, finishOrder: 0, pending: null, feedback: null, seen: [] });
    } else if (action.type === 'kick' && room.phase === 'lobby') room.players = room.players.filter(p => p.id !== action.playerId);
    else throw new GameError('Acción no disponible para el docente.');
    room.seq++; return;
  }
  const p = room.players.find(p => p.id === actor.id);
  if (!p) throw new GameError('No perteneces a esta sala.');
  if (p.seen.includes(action.requestId)) return;
  if (room.phase !== 'playing' || action.round !== room.round) throw new GameError('La ronda cambió. Espera la actualización antes de jugar.');
  if (p.finishOrder) throw new GameError('¡Ya llegaste a la meta!');
  if (action.type === 'roll') {
    if (p.pending) throw new GameError('Responde la pregunta antes de volver a lanzar.');
    const die = dice();
    if (!Number.isInteger(die) || die < 1 || die > 6) throw new GameError('Tirada inválida.');
    p.die = die; p.rolls++; p.feedback = null; p.position = Math.min(FINISH, p.position + die);
    if (tileKind(p.position) === 'free') {
      p.done = false; p.feedback = { kind: 'move', text: `Avanzaste ${die} casillas. ¡Puedes volver a lanzar!` };
    } else p.pending = question(p.position, p, random);
  } else if (action.type === 'answer') {
    if (!p.pending || action.questionId !== p.pending.question.id || !Number.isInteger(action.option) || action.option! < 0 || action.option! > 3) throw new GameError('Esa pregunta ya no está disponible.');
    const q = p.pending, correct = action.option === q.correct;
    p.attempts++;
    if (correct) { p.correct++; if (q.bonus) p.position = Math.min(FINISH - 1, p.position + 2); }
    else p.position = Math.max(0, p.position - 2);
    p.feedback = { kind: correct ? 'correct' : 'wrong', text: correct ? q.bonus ? '¡Correcto! Casilla estrella: avanzas 2 más.' : '¡Correcto! Conservas tu avance.' : 'Esta vez no acertaste. Retrocedes 2 casillas.', explanation: q.explanation, answer: q.question.options[q.correct], page: q.question.page };
    p.pending = null; p.done = false; finished(room, p);
  } else throw new GameError('Solo puedes lanzar el dado o responder.');
  p.seen.push(action.requestId); p.seen = p.seen.slice(-20);
  room.seq++; maybeAdvance(room);
}
export function publicRoom(room: Room, online = new Set<string>()): PublicRoom {
  const ranked = [...room.players].sort((a, b) => {
    if (a.finishOrder || b.finishOrder) return (a.finishOrder || 999) - (b.finishOrder || 999);
    return b.position - a.position || b.correct - a.correct || a.attempts - b.attempts || room.players.indexOf(a) - room.players.indexOf(b);
  });
  return { code: room.code, phase: room.phase, round: room.round, deadline: room.deadline, seq: room.seq, reason: room.reason, players: ranked.map((p, i) => ({ id: p.id, name: p.name, position: p.position, correct: p.correct, attempts: p.attempts, done: p.done, finished: !!p.finishOrder, online: online.has(p.id), rank: i + 1, color: p.color })) };
}
export function privatePlayer(room: Room, id: string): PrivatePlayer | null {
  const p = room.players.find(p => p.id === id);
  return p ? { id: p.id, die: p.die, done: p.done, finished: !!p.finishOrder, question: p.pending?.question || null, feedback: p.feedback } : null;
}
