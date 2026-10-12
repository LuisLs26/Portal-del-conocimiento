import { expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { raceServer } from './fixture';
import { BOOK_QUESTIONS } from '../../server/maraton/questions';
import type { Session, StateMessage } from '../../src/maraton/protocol';

it('31 conexiones reales: docente + 30 estudiantes, ranking compartido, autenticación, reconexión y duplicados', async()=>{
  const server=await raceServer();
  const connections:{ws:WebSocket;state:StateMessage|null;errors:string[]}[]=[];
  async function post(path:string,body:unknown={}){const r=await fetch(server.url+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return{status:r.status,data:await r.json()};}
  async function connect(identity:Session){
    const ws=new WebSocket(server.url.replace('http:','ws:')+`/rooms/${identity.room}/socket`);
    const client={ws,state:null as StateMessage|null,errors:[] as string[]};connections.push(client);
    ws.on('message',raw=>{const m=JSON.parse(raw.toString());if(m.type==='state')client.state=m;else if(m.type==='error')client.errors.push(m.error);});
    await new Promise<void>((resolve,reject)=>{ws.on('open',()=>{ws.send(JSON.stringify({type:'auth',token:identity.token}));resolve();});ws.on('error',reject);});
    await expect.poll(()=>!!client.state).toBe(true);return client;
  }
  const send=(client:typeof connections[number],type:string,extra:object={})=>client.ws.send(JSON.stringify({type,round:client.state!.room.round,requestId:crypto.randomUUID(),...extra}));
  try{
    const hostIdentity=(await post('/rooms')).data as Session,host=await connect(hostIdentity);
    const identities=await Promise.all(Array.from({length:30},async(_,i)=>(await post(`/rooms/${hostIdentity.room}/join`,{name:`Estudiante ${i+1}`})).data as Session));
    const clients=await Promise.all(identities.map(connect));
    expect((await post(`/rooms/${hostIdentity.room}/join`,{name:'Participante 31'})).status).toBe(400);
    await expect.poll(()=>host.state?.room.players.filter(p=>p.online).length).toBe(30);
    send(clients[0],'start');await expect.poll(()=>clients[0].errors.length).toBe(1);expect(host.state!.room.phase).toBe('lobby');
    send(host,'start');await expect.poll(()=>clients.every(c=>c.state?.room.phase==='playing')).toBe(true);
    const started=performance.now();
    for(const client of clients)send(client,'roll');
    await expect.poll(()=>clients.every(c=>c.state?.you?.done||c.state?.you?.question),{timeout:5000}).toBe(true);
    for(const client of clients)if(client.state!.you!.question){const q=client.state!.you!.question!;const answer=BOOK_QUESTIONS.find(b=>b.text===q.text)!.options[0];send(client,'answer',{questionId:q.id,option:q.options.indexOf(answer)});}
    await expect.poll(()=>connections.every(c=>c.state?.room.round===2),{timeout:5000}).toBe(true);
    const elapsed=performance.now()-started;
    const ranking=host.state!.room.players.map(p=>`${p.id}:${p.position}:${p.rank}`);
    for(const client of clients){expect(client.state!.room.players.map(p=>`${p.id}:${p.position}:${p.rank}`)).toEqual(ranking);expect(JSON.stringify(client.state)).not.toContain('hostToken');}
    expect(Buffer.byteLength(JSON.stringify(host.state))).toBeLessThan(12_000);
    const resumed=await connect(identities[0]);
    expect(resumed.state!.you!.id).toBe(identities[0].id);expect(resumed.state!.room.players).toHaveLength(30);
    expect(resumed.state!.room.players.find(p=>p.id===identities[0].id)!.position).toBe(server.room(hostIdentity.room).players.find(p=>p.id===identities[0].id)!.position);
    const requestId=crypto.randomUUID(),round=resumed.state!.room.round;
    const roll=JSON.stringify({type:'roll',round,requestId});resumed.ws.send(roll);resumed.ws.send(roll);
    await expect.poll(()=>resumed.state?.ack).toBe(requestId);
    expect(server.room(hostIdentity.room).players.find(p=>p.id===identities[0].id)!.rolls).toBe(2);
    console.log(`30 estudiantes + docente: ronda sincronizada en ${Math.round(elapsed)} ms; estado ${Buffer.byteLength(JSON.stringify(host.state))} bytes.`);
  }finally{for(const c of connections)c.ws.terminate();await server.close();}
},15000);
