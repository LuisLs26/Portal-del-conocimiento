/// <reference types="@cloudflare/workers-types" />
import { authenticate, command, createRoom, expireRound, GameError, joinRoom, privatePlayer, publicRoom } from './engine';
import type { Room } from './engine';
import type { Command } from '../../src/maraton/protocol';

interface Env { MARATON_ROOMS: DurableObjectNamespace; ALLOWED_ORIGINS?: string }
interface Attachment { role?: 'host' | 'player'; id?: string; opened: number; window: number; count: number }
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export class MaratonRoom {
  private room: Room | null = null;
  private queue: Promise<void> = Promise.resolve();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  constructor(private ctx: DurableObjectState) {
    ctx.blockConcurrencyWhile(async () => { this.room = await ctx.storage.get<Room>('room') || null; });
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }
  private async save() {
    if (!this.room) return;
    await this.ctx.storage.put('room', this.room);
    await this.ctx.storage.setAlarm(this.room.phase === 'playing' ? this.room.deadline : this.room.expires);
  }
  private online() {
    return new Set(this.ctx.getWebSockets().map(ws => (ws.deserializeAttachment() as Attachment)?.id).filter((id): id is string => !!id));
  }
  private snapshot(ws: WebSocket, shared?: ReturnType<typeof publicRoom>, ack?: string) {
    if (!this.room) return;
    const attachment = ws.deserializeAttachment() as Attachment;
    if (!attachment?.role) return;
    try { ws.send(JSON.stringify({ type: 'state', room: shared || publicRoom(this.room, this.online()), you: attachment.role === 'player' ? privatePlayer(this.room, attachment.id!) : null, serverNow: Date.now(), ack })); } catch { /* Closed sockets are removed by the runtime. */ }
  }
  private broadcast() {
    if (this.flushTimer) return;
    // Coalesce simultaneous joins and answers; no periodic full-room polling.
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (!this.room) return;
      const shared = publicRoom(this.room, this.online());
      for (const ws of this.ctx.getWebSockets()) this.snapshot(ws, shared);
    }, 180);
  }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/create')) {
      if (this.room) return json({ error: 'Sala existente.' }, 409);
      const { code } = await request.json() as { code: string };
      this.room = createRoom(code); await this.save();
      return json({ room: code, token: this.room.hostToken, id: 'host', role: 'host' });
    }
    if (!this.room || Date.now() >= this.room.expires) return json({ error: 'La sala no existe o ha caducado. Pide al docente su QR actual.' }, 404);
    if (url.pathname.endsWith('/join') && request.method === 'POST') {
      try {
        const body = await request.json() as { name?: string; token?: string };
        if (typeof body.name !== 'string' || (body.token !== undefined && typeof body.token !== 'string')) return json({ error: 'Escribe tu nombre.' }, 400);
        const player = joinRoom(this.room, body.name, Date.now(), body.token);
        await this.save(); this.broadcast();
        return json({ room: this.room.code, token: player.token, id: player.id, role: 'player', name: player.name });
      } catch (error) { return json({ error: error instanceof GameError ? error.message : 'No se pudo entrar a la sala.' }, 400); }
    }
    if (url.pathname.endsWith('/socket') && request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      // Bound socket count, including unauthenticated connections and reconnects.
      for (const old of this.ctx.getWebSockets()) {
        const a = old.deserializeAttachment() as Attachment;
        if (!a?.role && Date.now() - a.opened > 10_000) old.close(1008, 'Autenticación requerida');
      }
      if (this.ctx.getWebSockets().length >= 64) return json({ error: 'Demasiadas conexiones. Intenta nuevamente.' }, 429);
      const [client, server] = Object.values(new WebSocketPair());
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ opened: Date.now(), window: Date.now(), count: 0 } satisfies Attachment);
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ error: 'Acción no disponible.' }, 404);
  }
  webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const task = this.queue.then(() => this.handle(ws, raw));
    this.queue = task.catch(() => {}); return task;
  }
  private async handle(ws: WebSocket, raw: string | ArrayBuffer) {
    if (!this.room) return;
    let mutated = false;
    try {
      if (typeof raw !== 'string' || raw.length > 4096) throw new GameError('Mensaje inválido.');
      const a = ws.deserializeAttachment() as Attachment;
      const now = Date.now();
      if (now - a.window > 5_000) { a.window = now; a.count = 0; }
      if (++a.count > 20) { ws.close(1008, 'Demasiadas acciones'); return; }
      ws.serializeAttachment(a);
      const message = JSON.parse(raw);
      if (message.type === 'auth') {
        if (a.role) throw new GameError('Ya estás conectado.');
        const actor = authenticate(this.room, message.token);
        for (const old of this.ctx.getWebSockets()) {
          const existing = old.deserializeAttachment() as Attachment;
          if (old !== ws && existing?.id === actor.id && existing.role === actor.role) old.close(4001, 'Conectado en otra pestaña');
        }
        ws.serializeAttachment({ ...a, ...actor }); this.snapshot(ws); this.broadcast(); return;
      }
      if (!a.role || !a.id) { ws.close(1008, 'Autenticación requerida'); return; }
      mutated = expireRound(this.room, now);
      command(this.room, { role: a.role, id: a.id }, message as Command, now);
      mutated = true;
      if (message.type === 'kick') for (const old of this.ctx.getWebSockets()) {
        if ((old.deserializeAttachment() as Attachment).id === message.playerId) old.close(4003, 'El docente te retiró de la sala');
      }
      await this.save(); this.snapshot(ws, undefined, message.requestId); this.broadcast();
    } catch (error) {
      if (mutated) { await this.save(); this.broadcast(); }
      try { ws.send(JSON.stringify({ type: 'error', error: error instanceof GameError ? error.message : 'No se pudo realizar la acción.' })); this.snapshot(ws); } catch { /* Disconnected. */ }
    }
  }
  webSocketClose(ws: WebSocket, code: number, reason: string) { try { ws.close(code, reason); } catch {} this.broadcast(); }
  webSocketError(ws: WebSocket) { try { ws.close(1011, 'Reconecta para continuar'); } catch {} this.broadcast(); }
  async alarm() {
    const task = this.queue.then(async () => {
      if (!this.room) return;
      if (Date.now() >= this.room.expires) {
        for (const ws of this.ctx.getWebSockets()) ws.close(4004, 'La sala ha caducado');
        await this.ctx.storage.deleteAll(); this.room = null; return;
      }
      if (expireRound(this.room)) { await this.save(); this.broadcast(); }
    });
    this.queue = task.catch(() => {}); return task;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), origin = request.headers.get('Origin');
    const allowed = [url.origin, ...(env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)];
    if (origin && !allowed.includes(origin)) return json({ error: 'Origen no autorizado.' }, 403);
    const headers = { 'Access-Control-Allow-Origin': origin || url.origin, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (url.pathname.endsWith('/health')) return json({ ready: true });
    if (request.method === 'POST' && /\/rooms\/?$/.test(url.pathname)) {
      const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
      const room = env.MARATON_ROOMS.get(env.MARATON_ROOMS.idFromName(code));
      const result = await room.fetch(new Request(`${url.origin}/create`, { method: 'POST', body: JSON.stringify({ code }) }));
      const response = new Response(result.body, result); Object.entries(headers).forEach(([k,v]) => response.headers.set(k,v)); return response;
    }
    const match = url.pathname.match(/\/rooms\/([A-Z0-9]{8})\/(join|socket)$/);
    if (!match) return json({ error: 'Ruta no disponible.' }, 404);
    if (request.method === 'POST' && Number(request.headers.get('Content-Length') || 0) > 4096) return json({ error: 'Solicitud demasiado grande.' }, 413);
    const result = await env.MARATON_ROOMS.get(env.MARATON_ROOMS.idFromName(match[1])).fetch(request);
    if (result.status === 101) return result;
    const response = new Response(result.body, result); Object.entries(headers).forEach(([k,v]) => response.headers.set(k,v)); return response;
  },
};
