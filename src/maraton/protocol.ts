export const FINISH = 40;
export const MAX_PLAYERS = 30;
export const ROUND_MS = 60_000;
export const TOPICS = ['Fundamentos', 'Competencias', 'Criterios', 'Evidencias', 'Situaciones'] as const;
export function tileKind(position: number) {
  return position === 0 ? 'start' : position === FINISH ? 'finish' : position % 10 === 0 ? 'bonus' : position % 3 === 1 ? 'free' : 'question';
}
export interface PublicQuestion { id: string; text: string; options: string[]; page: number; topic: string }
export interface Feedback { kind: 'correct' | 'wrong' | 'move' | 'timeout'; text: string; explanation?: string; answer?: string; page?: number }
export interface PublicPlayer { id: string; name: string; position: number; correct: number; attempts: number; done: boolean; finished: boolean; online: boolean; rank: number; color: number }
export interface PublicRoom { code: string; phase: 'lobby' | 'playing' | 'finished'; round: number; deadline: number; seq: number; players: PublicPlayer[]; reason: string }
export interface PrivatePlayer { id: string; die: number; done: boolean; finished: boolean; question: PublicQuestion | null; feedback: Feedback | null }
export interface Session { room: string; token: string; id: string; role: 'host' | 'player'; name?: string }
export interface StateMessage { type: 'state'; room: PublicRoom; you: PrivatePlayer | null; serverNow: number; ack?: string }
export type Command = { type: 'roll' | 'answer' | 'start' | 'reset' | 'finish' | 'kick'; round: number; requestId: string; questionId?: string; option?: number; playerId?: string };
