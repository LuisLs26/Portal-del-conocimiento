import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import worker, { MaratonRoom } from '../../server/maraton/worker';
import type { Room } from '../../server/maraton/engine';

// Small local harness for the actual production actor. No browsers, no fake ranking.
export async function raceServer(port = 0) {
  (globalThis as any).WebSocketRequestResponsePair = class { constructor(public request: string,public response: string) {} };
  const records = new Map<string, any>();
  function record(code: string) {
    if (records.has(code)) return records.get(code);
    const data = new Map<string, unknown>(), sockets: any[] = [];
    let alarm: ReturnType<typeof setTimeout> | null = null;
    const ctx: any = {
      storage: { get:async(key:string)=>data.get(key), put:async(key:string,value:unknown)=>{ data.set(key,structuredClone(value)); }, deleteAll:async()=>{data.clear();}, setAlarm:async(at:number)=>{ if(!Number.isFinite(at)||at<=0)throw Error('Alarm must be a positive timestamp'); if(alarm)clearTimeout(alarm); alarm=setTimeout(()=>void entry.actor.alarm(),Math.max(1,at-Date.now())); alarm.unref(); } },
      blockConcurrencyWhile:(fn:()=>Promise<void>)=>{ctx.ready=fn();return ctx.ready;},
      setWebSocketAutoResponse:()=>{}, getWebSockets:()=>sockets.filter(s=>s.ws.readyState===WebSocket.OPEN), acceptWebSocket:()=>{},
    };
    const entry = { ctx, data, sockets, actor:null as any, clear:()=>{if(alarm)clearTimeout(alarm);} };
    entry.actor = new MaratonRoom(ctx); records.set(code,entry); return entry;
  }
  const env: any = { MARATON_ROOMS: { idFromName:(code:string)=>code,get:(code:string)=>({fetch:async(req:Request)=>{const e=record(code);await e.ctx.ready;return e.actor.fetch(req as any);}}) } };
  const server = createServer(async(req,res)=>{
    try {
      const chunks: Buffer[]=[]; for await(const chunk of req)chunks.push(Buffer.from(chunk));
      const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers as any,body:req.method==='POST'?Buffer.concat(chunks):undefined});
      const response=await worker.fetch(request as any,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
    }catch{res.writeHead(500);res.end(JSON.stringify({error:'Error del servidor de prueba'}));}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:4096});
  server.on('upgrade',(req,socket,head)=>{
    const code=req.url?.match(/\/rooms\/([A-Z0-9]{8})\/socket$/)?.[1];
    if(!code || !records.get(code)?.data.has('room')){socket.destroy();return;}
    const entry=records.get(code);
    wss.handleUpgrade(req,socket,head,ws=>{
      let attachment:any={opened:Date.now(),window:Date.now(),count:0};
      const wrapped={ws,send:(value:string)=>ws.send(value),close:(code:number,reason:string)=>ws.close(code,reason),serializeAttachment:(value:unknown)=>{attachment=structuredClone(value);},deserializeAttachment:()=>attachment};
      entry.sockets.push(wrapped);
      ws.on('message',data=>{const text=data.toString();if(text==='ping')ws.send('pong');else void entry.actor.webSocketMessage(wrapped,text);});
      ws.on('close',(code,reason)=>entry.actor.webSocketClose(wrapped,code,reason.toString()));
    });
  });
  await new Promise<void>(resolve=>server.listen(port,'127.0.0.1',resolve));
  const address=server.address() as {port:number};
  return {
    url:`http://127.0.0.1:${address.port}/api/maraton`,
    room:(code:string)=>records.get(code)?.data.get('room') as Room,
    close:async()=>{for(const e of records.values()){e.clear();for(const s of e.sockets)s.ws.terminate();}await new Promise<void>(resolve=>wss.close(()=>server.close(()=>resolve())));},
  };
}
