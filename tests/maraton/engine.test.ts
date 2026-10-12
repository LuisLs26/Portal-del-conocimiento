import { describe, expect, it } from 'vitest';
import { authenticate, command, createRoom, expireRound, fairDie, joinRoom, privatePlayer, publicRoom } from '../../server/maraton/engine';
import { BOOK_QUESTIONS } from '../../server/maraton/questions';
import type { Command } from '../../src/maraton/protocol';

const act = (type: Command['type'], round = 0, extra: Partial<Command> = {}): Command => ({ type, round, requestId: crypto.randomUUID(), ...extra });
function game(count = 1) {
  const room = createRoom('ABCDEF12', 1000);
  for (let i = 0; i < count; i++) joinRoom(room, `Estudiante ${i + 1}`, 1000);
  const host = authenticate(room, room.hostToken);
  command(room, host, act('start'), 1000);
  return { room, host };
}
describe('Maratón: reglas autoritativas', () => {
  it('40 preguntas del libro, cinco temas, cuatro alternativas únicas y referencias válidas', () => {
    expect(BOOK_QUESTIONS).toHaveLength(40);
    expect(new Set(BOOK_QUESTIONS.map(q => q.text)).size).toBe(40);
    for (const q of BOOK_QUESTIONS) { expect(new Set(q.options).size).toBe(4); expect(q.page).toBeGreaterThanOrEqual(4); expect(q.page).toBeLessThanOrEqual(23); expect(q.explanation).toBeTruthy(); }
    for (let topic = 0; topic < 5; topic++) expect(BOOK_QUESTIONS.filter(q => q.topic === topic)).toHaveLength(8);
  });
  it('acepta 30 nombres, distingue duplicados, reconecta sin otra plaza y bloquea el participante 31', () => {
    const room = createRoom('ABCDEF12', 1000);
    for (let i = 0; i < 30; i++) joinRoom(room, 'Ana', 1000);
    expect(new Set(room.players.map(p => p.name)).size).toBe(30);
    expect(joinRoom(room, 'Ana', 1000, room.players[0].token).id).toBe(room.players[0].id);
    expect(room.players).toHaveLength(30);
    expect(() => joinRoom(room, 'Otra estudiante', 1000)).toThrow('30 participantes');
    expect(() => authenticate(room, 'inventado')).toThrow();
  });
  it('el estudiante no puede dar la salida ni duplicar tiradas o respuestas', () => {
    const { room } = game(2), p = room.players[0], actor = authenticate(room, p.token);
    expect(() => command(room, actor, act('start', room.round), 1001)).toThrow();
    const roll = act('roll', room.round);
    command(room, actor, roll, 1001, () => 2, () => 0);
    expect(p.position).toBe(2); expect(p.pending).toBeTruthy();
    command(room, actor, roll, 1001, () => 6); expect(p.position).toBe(2);
    expect(() => command(room, actor, act('roll', room.round), 1001)).toThrow('Responde');
    const answer = act('answer', room.round, { questionId:p.pending!.question.id, option:p.pending!.correct });
    command(room, actor, answer, 1002); command(room, actor, answer, 1002);
    expect(p.correct).toBe(1); expect(p.attempts).toBe(1);
    expect(room.round).toBe(1); // The other participant has not played.
  });
  it('casillas libres, estrellas, error, expiración y meta requieren sus reglas reales', () => {
    const { room } = game(2), p = room.players[0], actor = authenticate(room, p.token);
    command(room, actor, act('roll', 1), 1001, () => 1); expect(p.done).toBe(false); expect(p.pending).toBeNull();
    p.done = false; p.position = 4;
    command(room, actor, act('roll', 1), 1001, () => 6, () => 0); expect(p.position).toBe(10);
    command(room, actor, act('answer', 1, { questionId:p.pending!.question.id, option:p.pending!.correct }), 1002); expect(p.position).toBe(12);
    p.done = false;
    command(room, actor, act('roll', 1), 1003, () => 3, () => 0);
    command(room, actor, act('answer', 1, { questionId:p.pending!.question.id, option:1 }), 1004); expect(p.position).toBe(13);
    p.done = false; p.position = 39;
    command(room, actor, act('roll', 1), 1005, () => 6, () => 0); expect(p.position).toBe(40); expect(p.finishOrder).toBe(0);
    command(room, actor, act('answer', 1, { questionId:p.pending!.question.id, option:1 }), 1006); expect(p.position).toBe(38); expect(p.finishOrder).toBe(0);
    p.done = false;
    command(room, actor, act('roll', 1), 1007, () => 2, () => 0);
    command(room, actor, act('answer', 1, { questionId:p.pending!.question.id, option:0 }), 1008); expect(p.finishOrder).toBe(1);
  });
  it('avanza sin esperar a otro estudiante y conserva las preguntas sin cuenta regresiva', () => {
    const { room } = game(2), p = room.players[0], actor = authenticate(room,p.token);
    command(room,actor,act('roll',1),1001,()=>2,()=>0);
    expect(expireRound(room,120000)).toBe(false);
    expect(p.pending).toBeTruthy(); expect(room.deadline).toBe(0);
    command(room,actor,act('answer',1,{questionId:p.pending!.question.id,option:p.pending!.correct}),120001);
    command(room,actor,act('roll',1),120002,()=>2,()=>0);
    expect(p.rolls).toBe(2); expect(room.players[1].rolls).toBe(0);
    expect(p.position).toBe(4); expect(p.pending).toBeNull();
    command(room,actor,act('roll',1),120003,()=>2,()=>0);
    expect(p.rolls).toBe(3);
  });
  it('termina una carrera completa de 30, ordena el ranking y reinicia sin conservar puntuaciones', () => {
    const { room, host } = game(30);
    let turns = 0;
    while (room.phase === 'playing' && turns++ < 150) {
      const round = room.round;
      for (const p of room.players) if (!p.finishOrder) {
        const actor = authenticate(room,p.token);
        command(room, actor, act('roll',round), 1000 + turns, () => 6, () => 0);
        if (p.pending) command(room,actor,act('answer',round,{ questionId:p.pending.question.id,option:p.pending.correct }),1000 + turns);
      }
    }
    expect(room.phase).toBe('finished'); expect(room.players.every(p => p.position === 40)).toBe(true);
    expect(publicRoom(room).players.map(p => p.rank)).toEqual(Array.from({ length:30 },(_,i)=>i+1));
    expect(publicRoom(room).players[0].id).toBe(room.players[0].id);
    command(room,host,act('reset',room.round),1200);
    expect(room.phase).toBe('lobby'); expect(room.players.every(p => p.position === 0 && p.correct === 0 && !p.pending)).toBe(true);
  });
  it('no publica credenciales ni respuestas de preguntas pendientes y limita salas caducadas', () => {
    const { room } = game(); const p = room.players[0];
    command(room, authenticate(room,p.token), act('roll',1), 1001, () => 2, () => 0);
    const data = JSON.stringify({ room:publicRoom(room),you:privatePlayer(room,p.id) });
    expect(data).not.toContain(p.token); expect(data).not.toContain(room.hostToken); expect(data).not.toContain('correctIndex'); expect(data).not.toContain('explanation');
    expect(() => joinRoom(room,'Otra',room.expires)).toThrow('caducado');
    for (let i=0;i<1000;i++) { const die=fairDie(); expect(die).toBeGreaterThanOrEqual(1); expect(die).toBeLessThanOrEqual(6); }
  });
});
