import { useEffect, useRef, useState } from 'react';
import type { Command, PrivatePlayer, PublicRoom, Session } from './protocol';
import { tileKind } from './protocol';
import { sound } from '../utils/sound';
import './arena.css';

const colors = ['#2463eb','#e53645','#ffce32','#1847b8','#ef6540','#8b4fe8'];
const track: [number, number][] = [];
// Four connected switchbacks: 41 unique, consecutive spaces from start to finish.
for (let row=0;row<4;row++) {
  const count=row===3?8:11;
  for(let col=0;col<count;col++) {
    const x=row%2?1100-col*100:100+col*100;
    const y=[90,230,490,630][row];
    track.push([x/100-.5,y/100-.5]);
  }
}
const road='M100 90H1100C1175 90 1175 230 1100 230H100C20 230 20 490 100 490H1100C1175 490 1175 630 1100 630H400';
const pips = [[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
function Dice({ value, rolling }: {value:number;rolling:boolean}) {
  return <div className={`arena-dice ${rolling ? 'is-rolling' : ''}`} aria-label={rolling ? 'Dado girando' : `Dado: ${value}`}><div className="dice-cube" data-value={value}>{pips.map((dots,i)=><div className={`dice-face face-${i+1}`} key={i}>{Array.from({length:9},(_,j)=><i key={j} className={dots.includes(j)?'pip':''}/>)}</div>)}</div></div>;
}
type Props = { room:PublicRoom;you:PrivatePlayer|null;session:Session;connection:string;busy:boolean;error:string;send:(type:Command['type'],extra?:Partial<Command>)=>void;leave:()=>void };
export function RaceArena({room,you,session,connection,busy,error,send,leave}:Props) {
  const [stage,setStage]=useState<'idle'|'rolling'|'result'|'moving'>('idle'),[visualPosition,setVisualPosition]=useState<number|null>(null),[selected,setSelected]=useState<number|null>(null),[feedback,setFeedback]=useState(false),[ranking,setRanking]=useState(false),[page,setPage]=useState(0);
  const rollTimer=useRef<ReturnType<typeof setTimeout>|null>(null),rollStarted=useRef(0),lastFeedback=useRef('');
  const self=room.players.find(p=>p.id===session.id),host=session.role==='host';
  const rolling=stage==='rolling',animating=stage!=='idle';
  const displayPlayers=room.players.map(p=>p.id===session.id&&visualPosition!==null?{...p,position:visualPosition}:p);
  useEffect(()=>{setSelected(null);},[you?.question?.id]);
  useEffect(()=>{
    if(stage==='idle'||busy)return;
    if(error||connection!=='live'){setStage('idle');setVisualPosition(null);return;}
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer:ReturnType<typeof setTimeout>;
    if(stage==='rolling')timer=setTimeout(()=>setStage('result'),Math.max(0,650-(Date.now()-rollStarted.current)));
    else if(stage==='result')timer=setTimeout(()=>setStage('moving'),1000);
    else {
      const target=self?.position??0,current=visualPosition??target;
      if(current===target)timer=setTimeout(()=>{setStage('idle');setVisualPosition(null);},300);
      else timer=setTimeout(()=>setVisualPosition(reduce?target:current+Math.sign(target-current)),reduce?0:210);
    }
    return()=>clearTimeout(timer);
  },[stage,busy,error,connection,self?.position,visualPosition]);
  useEffect(()=>{const key=JSON.stringify(you?.feedback);if(you?.feedback&&key!==lastFeedback.current){setFeedback(you.feedback.kind!=='move');}lastFeedback.current=key;},[you?.feedback]);
  useEffect(()=>()=>{if(rollTimer.current)clearTimeout(rollTimer.current);},[]);
  function roll(){
    if(busy||animating||connection!=='live')return;
    if(rollTimer.current)clearTimeout(rollTimer.current);
    setFeedback(false);setVisualPosition(self?.position??0);rollStarted.current=Date.now();setStage('rolling');sound.pop();send('roll');
    rollTimer.current=setTimeout(()=>{setStage('idle');setVisualPosition(null);},12000);
  }
  const question=you?.question&&!animating?you.question:null;
  const leaders=room.players.slice(0,3),mini=host?room.players:self&&self.rank>3?[...leaders,self]:leaders;
  return <div className="arena-shell"><div className={`arena-screen ${host ? "host-screen" : ""}`} data-stage={stage}>
    <header className="arena-hud"><a href="/" className="arena-brand">MARATÓN <span>DEL CONOCIMIENTO</span></a><span className={`arena-live ${connection==='live'?'online':''}`}>{connection==='live'?'● EN VIVO':'● RECONECTANDO'}</span><span className="arena-room">{room.players.length} jugadores · {room.code}</span><button onClick={()=>setRanking(true)}>🏆 Ranking</button><button onClick={leave}>Salir</button></header>
    <div className="arena-playfield">
      <div className="arena-table">
        <svg className="arena-board" viewBox="-12 -12 1224 724" role="img" aria-label="Tablero de Maratón: recorrido serpenteante, salida 0 y meta 40">
          <defs><linearGradient id="table" x2="0" y2="1"><stop stopColor="#2148a0"/><stop offset="1" stopColor="#102a65"/></linearGradient><linearGradient id="pawn" x2="0.8" y2="1"><stop stopColor="#fff" stopOpacity=".6"/><stop offset=".5" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".28"/></linearGradient><pattern id="finish" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fff"/><path d="M0 0h10v10H0zm10 10h10v10H10" fill="#203248"/></pattern></defs>
          <rect x="-10" y="-10" width="1220" height="720" rx="32" fill="url(#table)" stroke="#edf3ff" strokeWidth="10"/>
          <g aria-hidden="true">
            <circle cx="570" cy="380" r="190" fill="#5d8be5" opacity=".08"/>
            <circle cx="840" cy="110" r="110" fill="#fff" opacity=".035"/>
            <path d={road} fill="none" stroke="#061943" strokeWidth="110" strokeLinecap="round" transform="translate(0,8)"/>
            <path d={road} fill="none" stroke="#dce9ff" strokeWidth="104" strokeLinecap="round"/>
            <path d={road} fill="none" stroke="#7496d0" strokeWidth="86" strokeLinecap="round"/>
            <path d={road} fill="none" stroke="#e9f2ff" strokeWidth="3" strokeDasharray="8 12"/>
            <path d="m1150 147 9 12-9 12M45 347l-9 12 9 12m1105 202 12 9-12 9" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          {track.map(([x,y],i)=>{const yellow=i>=17&&i<=24,kind=tileKind(i),own=(visualPosition??self?.position)===i;return <g key={i} data-tile={i} className={`${yellow?'yellow-tile':''} ${own?'current-space':''}`} aria-label={`Casilla ${i}`}>
            <rect x={x*100+7} y={y*100+14} width="86" height="82" rx="18" fill="#071a42" opacity=".5"/>
            <rect x={x*100+7} y={y*100+6} width="86" height="82" rx="18" fill={i===40?'url(#finish)':i===0?'#fff4ba':colors[Math.floor(Math.max(0,i-1)/8)%5]} stroke={own?'#ffe678':'#ffffff80'} strokeWidth={own?5:2}/>
            <path d={`M${x*100+22} ${y*100+12}h56`} stroke="#fff" strokeWidth="3" opacity=".4" strokeLinecap="round"/>
            {(i===0||i===40)&&<rect x={x*100+12} y={y*100+11} width="76" height="24" rx="8" fill={i===40?'#162c60':'#ffe27c'}/>}
            <text x={x*100+18} y={y*100+31} className="arena-tile-number">{i===0?'SALIDA':i===40?'META':i}</text>
            <text x={x*100+69} y={y*100+74} className="arena-tile-icon">{kind==='bonus'?'★':kind==='question'?'?':i===0?'➜':i===40?'⚑':'›'}</text>
          </g>;})}
          <text x="340" y="360" textAnchor="middle" className="arena-board-title">MARATÓN</text>
          <text x="340" y="390" textAnchor="middle" className="arena-board-subtitle">CADA RETO TE ACERCA A LA META</text>
          {displayPlayers.map((p)=>{const [x,y]=track[p.position];const group=displayPlayers.filter(q=>q.position===p.position).sort((a,b)=>Number(b.id===session.id)-Number(a.id===session.id)),index=group.findIndex(q=>q.id===p.id);if(index>2)return null;const dx=group.length>6?(index%6)*10-25:(index%3)*22-22,dy=Math.floor(index/(group.length>6?6:3))*9;return <g key={p.id} data-position={p.position} className={`arena-pawn ${p.id===session.id?'own-pawn':''}`} style={{transform:`translate(${x*100+50+dx}px, ${y*100+50+dy}px)`}} aria-label={`${p.name}, casilla ${p.position}`}><title>{p.name} · #{p.rank}</title><ellipse cy="20" rx="17" ry="6" fill="#000" opacity=".3"/><path d="M-14 18Q-17 12-9 3L-5-5h10l4 8q8 9 5 15Z" fill={colors[p.color]} stroke={p.id===session.id?'#fff':'#172a35'} strokeWidth={p.id===session.id?3:1}/><circle cy="-11" r="10" fill={colors[p.color]} stroke="#ffffff80"/><path d="M-14 18Q-17 12-9 3L-5-5h10l4 8q8 9 5 15Z" fill="url(#pawn)"/><text y="-7" textAnchor="middle" fill={p.color===2?'#182750':'#fff'} fontSize="11" fontWeight="900">{Array.from(p.name)[0]}</text>{index===2&&group.length>3&&<g transform="translate(10,20)"><circle r="12" fill="#142d40" stroke="#fff"/><text y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">+{group.length-3}</text></g>}</g>;})}
        </svg>
        <div className="arena-center">
          {room.phase==='finished'?<div className="arena-victory"><span>🏆</span><h2>{room.players[0]?.name} gana la carrera</h2><p>{room.reason}</p>{host?<button onClick={()=>send('reset')} disabled={busy}>Otra carrera</button>:<strong>Tu puesto: #{self?.rank}</strong>}</div>:host?<div className="arena-host"><span>🏁</span><h2>¡La carrera está en marcha!</h2><p>Cada alumno avanza a su ritmo.</p><button onClick={()=>{if(confirm('¿Finalizar la carrera?'))send('finish');}}>Finalizar carrera</button></div>:<>
            <Dice value={you?.die||1} rolling={rolling}/>{animating&&!rolling&&<span className="arena-dice-result" role="status">Salió {you?.die}</span>}
            <button className="arena-roll" disabled={busy||animating||connection!=='live'||!!you?.question||you?.finished||feedback} onClick={roll}>{you?.finished?'¡Meta alcanzada!':rolling?'Lanzando…':stage==='result'?`Salió ${you?.die}`:stage==='moving'?'Avanzando…':'LANZAR DADO'}</button>
            <span className="arena-center-hint">{you?.finished?'Sigue la llegada de tus compañeros':you?.feedback?.kind==='move'?you.feedback.text:'Lanza, avanza y supera el reto'}</span>
          </>}
        </div>
      </div>
      <aside className="arena-sidebar"><h2>🏆 {host ? "CLASIFICACIÓN DE LA CLASE" : "EN CABEZA"}</h2><div className="arena-leaders">{mini.map(p=><div key={p.id} className={`arena-leader ${p.id===session.id?'me':''}`}><b>{p.rank}</b><i style={{background:colors[p.color]}}/><div><strong>{p.name}</strong><small>{p.finished?'🏁 En la meta':`Casilla ${p.position} · ${p.correct} aciertos`}</small></div></div>)}</div><div className="arena-self"><span>{host?'VISTA DEL DOCENTE':'TU FICHA'}</span><strong>{host?'🏁':`${self?.position||0} / 40`}</strong><small>{host?'La clasificación se actualiza en vivo':`${self?.name} · puesto #${self?.rank}`}</small></div><p className="arena-key">? Pregunta<br/>★ Acierta y avanza +2<br/>› Casilla libre</p></aside>
    </div>
    <footer className="arena-footer"><span>🏁 Cada uno a su ritmo · sin esperas</span><span>{error||'Acierta para mantener el avance. Si fallas: −2 casillas.'}</span></footer>
    {question&&room.phase==='playing'&&<div className="arena-overlay"><section className="arena-question" aria-label="Pregunta del libro"><div className="arena-question-label">RETO · {question.topic}<span>Casilla {self?.position}</span></div><h2>{question.text}</h2><div className="arena-answers">{question.options.map((option,i)=><button key={i} aria-pressed={selected===i} className={selected===i?'selected':''} disabled={busy||connection!=='live'} onClick={()=>{sound.pop();setSelected(i);}}><b>{'ABCD'[i]}</b><span>{option}</span></button>)}</div><button className="arena-confirm" disabled={selected===null||busy||connection!=='live'} onClick={()=>send('answer',{option:selected!,questionId:question.id})}>{busy?'Comprobando…':'CONFIRMAR RESPUESTA'}</button></section></div>}
    {feedback&&!question&&!animating&&you?.feedback&&room.phase==='playing'&&<div className="arena-overlay"><section className={`arena-feedback ${you.feedback.kind}`} role="status"><span className="arena-result-icon">{you.feedback.kind==='correct'?'★':'↩'}</span><h2>{you.feedback.text}</h2><p>{you.feedback.explanation}</p><small>Libro · página {you.feedback.page}</small><button onClick={()=>setFeedback(false)}>SEGUIR JUGANDO ➜</button></section></div>}
    {ranking&&<div className="arena-overlay"><section className="arena-full-ranking"><h2>🏆 Clasificación en vivo</h2>{room.players.slice(page*6,page*6+6).map(p=><div key={p.id}><b>#{p.rank}</b><span>{p.name}</span><strong>{p.position}/40</strong></div>)}<nav><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>{page+1}/{Math.max(1,Math.ceil(room.players.length/6))}</span><button disabled={(page+1)*6>=room.players.length} onClick={()=>setPage(p=>p+1)}>Siguiente</button><button onClick={()=>setRanking(false)}>Volver al tablero</button></nav></section></div>}
  </div></div>;
}
