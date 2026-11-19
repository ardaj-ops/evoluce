// js/entities/abilities.js – schopnosti postav: 3 běžné (aktivní / pasivní) + 1 ultimátní, pevné pro každou postavu.
// První schopnost je odemčená od začátku; po každé 3. vlně si hráč vybere: odemknout další (ultimátní je vždy poslední) nebo vylepšit odemčenou (až úr. 3).
const AB_EVERY=3,AB_MAX=3,AB_START=1;
// t: a = aktivní, p = pasivní, u = ultimátní; L[úroveň-1] = parametry (cd = čekání v s, efekty: rush, nova, beam, volley, barrage, slow, aura, chain, storm, heal, buff)
const ABIL={
 // --- Střelec (Blaster)
 sal:{n:'Prstencová salva',ic:'🔵',t:'a',L:[{cd:10,volley:{n:12,mul:1.4}},{cd:9,volley:{n:16,mul:1.6}},{cd:8,volley:{n:20,mul:1.9}}]},
 zao:{n:'Zaměřovač',ic:'🎯',t:'p',L:[{up:[['crit',6],['critd',15]]},{up:[['crit',6],['critd',15]]},{up:[['crit',8],['critd',20]]}]},
 hor:{n:'Horečná palba',ic:'⚡',t:'a',L:[{cd:16,buff:{t:5,rate:.4}},{cd:15,buff:{t:6,rate:.55}},{cd:14,buff:{t:7,rate:.7}}]},
 bou:{n:'Bouře kulek',ic:'🌀',t:'u',L:[{cd:55,storm:{t:4,mul:1}},{cd:50,storm:{t:5,mul:1.2}},{cd:45,storm:{t:6,mul:1.4}}]},
 // --- Tank (Brokovnice)
 zed:{n:'Zeď štítů',ic:'🛡️',t:'a',L:[{cd:18,buff:{t:3,dr:.6}},{cd:16,buff:{t:4,dr:.7}},{cd:14,buff:{t:5,dr:.8}}]},
 kuz:{n:'Tlustá kůže',ic:'🧱',t:'p',L:[{up:[['hp',20],['armor',4]]},{up:[['hp',20],['armor',4]]},{up:[['hp',25],['armor',6]]}]},
 ots:{n:'Otřes země',ic:'💥',t:'a',L:[{cd:12,nova:{r:5,dmg:5,kb:3}},{cd:11,nova:{r:6,dmg:7,kb:4}},{cd:10,nova:{r:7,dmg:9,kb:5}}]},
 pev:{n:'Pevnost',ic:'🏰',t:'u',L:[{cd:60,buff:{t:8,dr:.6,dmg:.4}},{cd:55,buff:{t:10,dr:.7,dmg:.5}},{cd:50,buff:{t:12,dr:.75,dmg:.6}}]},
 // --- Stíhač (Kulomet)
 zad:{n:'Zadržení',ic:'❄️',t:'a',L:[{cd:14,slow:{r:7,t:3,m:.5}},{cd:13,slow:{r:8,t:4,m:.6}},{cd:12,slow:{r:9,t:5,m:.7}}]},
 nab:{n:'Nabitá přesnost',ic:'🔁',t:'p',L:[{up:[['thrift',10],['rld',12]]},{up:[['thrift',10],['rld',12]]},{up:[['thrift',12],['rld',15]]}]},
 ryk:{n:'Rychlý krok',ic:'💨',t:'a',L:[{cd:12,buff:{t:4,haste:.4}},{cd:11,buff:{t:5,haste:.5}},{cd:10,buff:{t:6,haste:.6}}]},
 tot:{n:'Totální palba',ic:'🔥',t:'u',L:[{cd:55,buff:{t:6,rate:.8,dmg:.2}},{cd:50,buff:{t:7,rate:1,dmg:.3}},{cd:45,buff:{t:8,rate:1.2,dmg:.4}}]},
 // --- Průzkumník (Railgun)
 zab:{n:'Záblesk',ic:'✨',t:'a',L:[{cd:8,rush:{d:9,dmg:2,inv:.4}},{cd:7,rush:{d:11,dmg:3,inv:.4}},{cd:6,rush:{d:13,dmg:4,inv:.4}}]},
 zas:{n:'Zaostření',ic:'👁️',t:'p',L:[{up:[['boss',10],['acd',6]]},{up:[['pierce',1],['acd',4]]},{up:[['boss',15],['acd',6]]}]},
 pap:{n:'Zaměřený paprsek',ic:'➖',t:'a',L:[{cd:10,beam:{n:1,len:40,w:1.1,dmg:8,fan:0}},{cd:9,beam:{n:1,len:40,w:1.1,dmg:11,fan:0}},{cd:8,beam:{n:1,len:40,w:1.1,dmg:15,fan:0}}]},
 cas:{n:'Časový zlom',ic:'⏳',t:'u',L:[{cd:60,slow:{r:30,t:5,m:.7},buff:{t:5,rate:.5,dmg:.25}},{cd:55,slow:{r:30,t:6,m:.7},buff:{t:6,rate:.6,dmg:.3}},{cd:50,slow:{r:30,t:7,m:.7},buff:{t:7,rate:.7,dmg:.35}}]},
 // --- Granátník (Raketomet)
 gra:{n:'Salva granátů',ic:'💣',t:'a',L:[{cd:11,barrage:{n:3,d:9,sp:3,rad:3,dmg:5,gap:.18}},{cd:10,barrage:{n:4,d:9,sp:3,rad:3,dmg:7,gap:.18}},{cd:9,barrage:{n:5,d:9,sp:3.5,rad:3,dmg:9,gap:.18}}]},
 vyb:{n:'Výbušný talent',ic:'🧨',t:'p',L:[{up:[['blast',1.4]]},{up:[['dmg',10]]},{up:[['blast',2.2],['dmg',8]]}]},
 tla:{n:'Tlaková vlna',ic:'🌬️',t:'a',L:[{cd:10,nova:{r:5,dmg:3,kb:6}},{cd:9,nova:{r:6,dmg:4,kb:7}},{cd:8,nova:{r:7,dmg:6,kb:8}}]},
 bom:{n:'Bombardování',ic:'☢️',t:'u',L:[{cd:65,barrage:{n:14,d:12,sp:9,rad:3.4,dmg:8,gap:.12}},{cd:60,barrage:{n:18,d:12,sp:9,rad:3.4,dmg:10,gap:.12}},{cd:55,barrage:{n:22,d:12,sp:9.5,rad:3.4,dmg:13,gap:.12}}]},
 // --- Žhář (Plamenomet)
 pre:{n:'Ohnivý prstenec',ic:'🔥',t:'a',L:[{cd:11,nova:{r:5,dmg:3,kb:1,burn:4}},{cd:10,nova:{r:6,dmg:4,kb:1,burn:6}},{cd:9,nova:{r:7,dmg:5,kb:1,burn:9}}]},
 zha:{n:'Žhavá krev',ic:'🩸',t:'p',L:[{up:[['burn',3],['regen',.5]]},{up:[['burn',3],['regen',.5]]},{up:[['burn',4],['regen',.8]]}]},
 aur:{n:'Spalující aura',ic:'♨️',t:'a',L:[{cd:15,aura:{r:4,dps:3,t:5}},{cd:14,aura:{r:4.5,dps:4.5,t:6}},{cd:13,aura:{r:5,dps:6,t:7}}]},
 pek:{n:'Peklo',ic:'🌋',t:'u',L:[{cd:60,aura:{r:8,dps:8,t:8,burn:6}},{cd:55,aura:{r:9,dps:11,t:9,burn:8}},{cd:50,aura:{r:10,dps:14,t:10,burn:11}}]},
 // --- Rytíř (Meč)
 vyp:{n:'Štítový výpad',ic:'🛡️',t:'a',L:[{cd:9,rush:{d:6,dmg:3,inv:.5}},{cd:8,rush:{d:7,dmg:4,inv:.5}},{cd:7,rush:{d:8,dmg:5,inv:.5}}]},
 zbr:{n:'Bojová zbroj',ic:'🪖',t:'p',L:[{up:[['armor',5],['hp',10]]},{up:[['armor',5],['hp',10]]},{up:[['armor',6],['hp',15]]}]},
 pok:{n:'Válečný pokřik',ic:'📣',t:'a',L:[{cd:16,buff:{t:5,dmg:.4,dr:.2}},{cd:15,buff:{t:6,dmg:.55,dr:.25}},{cd:14,buff:{t:7,dmg:.7,dr:.3}}]},
 roz:{n:'Rozsudek',ic:'⚔️',t:'u',L:[{cd:55,nova:{r:8,dmg:14,kb:4,heal:.2}},{cd:50,nova:{r:9,dmg:18,kb:4,heal:.25}},{cd:45,nova:{r:10,dmg:23,kb:4,heal:.3}}]},
 // --- Berserker (Kladivo)
 sei:{n:'Seismický úder',ic:'🔨',t:'a',L:[{cd:10,nova:{r:4,dmg:6,kb:5}},{cd:9,nova:{r:5,dmg:8,kb:5}},{cd:8,nova:{r:6,dmg:11,kb:5}}]},
 krv:{n:'Krvavá zuřivost',ic:'🩸',t:'p',L:[{up:[['dmg',8],['vamp',1]]},{up:[['dmg',8],['vamp',1]]},{up:[['dmg',10],['vamp',1]]}]},
 bes:{n:'Útočný běs',ic:'😡',t:'a',L:[{cd:15,buff:{t:5,haste:.35,rate:.3}},{cd:14,buff:{t:6,haste:.45,rate:.4}},{cd:13,buff:{t:7,haste:.55,rate:.5}}]},
 ber:{n:'Berserk',ic:'💢',t:'u',L:[{cd:60,buff:{t:8,dmg:.7,rate:.4,haste:.25,vamp:2}},{cd:55,buff:{t:10,dmg:.9,rate:.5,haste:.3,vamp:3}},{cd:50,buff:{t:12,dmg:1.1,rate:.6,haste:.35,vamp:4}}]},
 // --- Lovec (Kopí)
 kop:{n:'Vrhací kopí',ic:'🏹',t:'a',L:[{cd:7,beam:{n:1,len:30,w:1.3,dmg:7,fan:0}},{cd:6,beam:{n:1,len:30,w:1.3,dmg:10,fan:0}},{cd:5,beam:{n:1,len:30,w:1.3,dmg:14,fan:0}}]},
 sto:{n:'Stopař',ic:'🧭',t:'p',L:[{up:[['reach',10],['speed',4]]},{up:[['reach',10],['speed',4]]},{up:[['reach',12],['speed',5]]}]},
 usk:{n:'Úskok',ic:'🦘',t:'a',L:[{cd:9,rush:{d:8,dmg:0,inv:.6,back:1}},{cd:8,rush:{d:9,dmg:0,inv:.7,back:1}},{cd:7,rush:{d:10,dmg:0,inv:.8,back:1}}]},
 smr:{n:'Smršť kopí',ic:'🌟',t:'u',L:[{cd:55,beam:{n:7,len:28,w:1,dmg:8,fan:2.6}},{cd:50,beam:{n:9,len:28,w:1,dmg:10,fan:2.6}},{cd:45,beam:{n:11,len:28,w:1,dmg:13,fan:2.6}}]},
 // --- Zabiják (Dýky)
 skok:{n:'Skok mezi stíny',ic:'🌑',t:'a',L:[{cd:9,chain:{n:2,dmg:4}},{cd:8,chain:{n:3,dmg:5}},{cd:7,chain:{n:4,dmg:7}}]},
 jed:{n:'Jed na ostří',ic:'☠️',t:'p',L:[{up:[['burn',3],['vamp',1]]},{up:[['burn',3],['crit',4]]},{up:[['burn',4],['vamp',1]]}]},
 mlz:{n:'Mlžný krok',ic:'🌫️',t:'a',L:[{cd:13,buff:{t:3,haste:.5,dr:.4}},{cd:12,buff:{t:4,haste:.6,dr:.5}},{cd:11,buff:{t:5,haste:.7,dr:.6}}]},
 tan:{n:'Tanec smrti',ic:'💀',t:'u',L:[{cd:55,chain:{n:6,dmg:8},buff:{t:3,dr:.8}},{cd:50,chain:{n:8,dmg:10},buff:{t:3,dr:.8}},{cd:45,chain:{n:10,dmg:13},buff:{t:3,dr:.8}}]}};
// pevné schopnosti postav: [běžná 1, běžná 2, běžná 3, ultimátní] – pořadí odemykání
const CAB=[['sal','zao','hor','bou'],['zed','kuz','ots','pev'],['zad','nab','ryk','tot'],['zab','zas','pap','cas'],['gra','vyb','tla','bom'],['pre','zha','aur','pek'],['vyp','zbr','pok','roz'],['sei','krv','bes','ber'],['kop','sto','usk','smr'],['skok','jed','mlz','tan']];
const ABKEYS=['1','2','3','Q'];
// ---- popisy (generované z parametrů úrovně, vždy s čísly)
const BFN={rate:q=>`+${Math.round(q*100)} % rychlost útoku`,haste:q=>`+${Math.round(q*100)} % rychlost pohybu`,dmg:q=>`+${Math.round(q*100)} % poškození`,dr:q=>`−${Math.round(q*100)} % přijímaného poškození`,vamp:q=>`+${q} životů za zabití`};
function abDesc(id,l){const d=ABIL[id],q=d&&d.L[l-1];if(!q)return'';if(q.up)return q.up.map(([k,v])=>k=='acd'?`−${v} % čekání schopností`:k=='adm'?`+${v} % poškození schopností`:UP[k].t(v)).join('; ');const o=[];
 if(q.rush)o.push(q.rush.back?`skok o ${q.rush.d} m vzad, ${q.rush.inv} s nezranitelnosti`:`výpad o ${q.rush.d} m, ${q.rush.dmg} poškození všem na cestě`);
 if(q.nova)o.push(`vlna v okruhu ${q.nova.r} m: ${q.nova.dmg} poškození, odhození ${q.nova.kb}`+(q.nova.burn?`, zapálení ${q.nova.burn}/s`:'')+(q.nova.heal?`, léčení ${Math.round(q.nova.heal*100)} % životů`:''));
 if(q.beam)o.push(q.beam.n>1?`${q.beam.n} paprsků ve vějíři, každý ${q.beam.dmg} poškození`:`paprsek dlouhý ${q.beam.len} m: ${q.beam.dmg} poškození, probíjí vše`);
 if(q.volley)o.push(`${q.volley.n} střel do všech stran (${q.volley.mul}× poškození)`);
 if(q.barrage)o.push(`${q.barrage.n} výbuchů před tebou, každý ${q.barrage.dmg} poškození v okruhu ${q.barrage.rad} m`);
 if(q.slow)o.push(`zpomalení nepřátel o ${Math.round(q.slow.m*100)} % na ${q.slow.t} s (okruh ${q.slow.r} m)`);
 if(q.aura)o.push(`ohnivá aura ${q.aura.r} m po dobu ${q.aura.t} s: ${q.aura.dps} poškození/s`+(q.aura.burn?`, zapálení ${q.aura.burn}/s`:''));
 if(q.chain)o.push(`skok mezi ${q.chain.n} nepřáteli, každý ${q.chain.dmg} poškození`);
 if(q.storm)o.push(`${q.storm.t} s spirála střel kolem tebe (${q.storm.mul}× poškození)`);
 if(q.heal)o.push(`léčení ${Math.round(q.heal*100)} % životů`);
 if(q.buff){const b=q.buff;o.push(Object.keys(BFN).filter(k=>b[k]).map(k=>BFN[k](b[k])).join(', ')+` na ${b.t} s`)}
 return o.join('; ')}
const ABTYPE={a:'Aktivní',p:'Pasivní',u:'Ultimátní'};
function abInfo(cls,i,l){const id=(CAB[cls]||CAB[0])[i],d=ABIL[id];if(!d)return null;const L=Math.max(1,Math.min(AB_MAX,l||1));return{id,n:d.n,ic:d.ic,t:d.t,tn:ABTYPE[d.t],key:d.t=='p'?'':ABKEYS[i],cd:d.t=='p'?0:d.L[L-1].cd,desc:abDesc(id,L)}}
// ---- stav schopností hráče
const abm=(p,k)=>{const b=p.bf&&p.bf[k];return b&&b.t>0?b.m:0};
function abApplyUp(p,[k,v]){if(k=='acd')p.u.acd*=1-v/100;else if(k=='adm')p.u.adm*=1+v/100;else if(UP[k])UP[k].f(p.u,v,p)}
function abSet(p,i,l,silent){const a=p.ab[i],d=ABIL[CAB[p.cls][i]];if(!a||!d||l<1||l>AB_MAX)return;a.l=l;a.cd=0;if(d.t=='p')for(const x of d.L[l-1].up)abApplyUp(p,x);if(!silent)ev.push(['abu',p.x,p.z,i,p.id])}
function abInit(p){p.ab=(CAB[p.cls]||CAB[0]).map(()=>({l:0,cd:0,cdT:1}));p.bf={};p.tof=null;for(let i=0;i<AB_START&&i<4;i++)abSet(p,i,1,true)}
// nabídka talentu (každou AB_EVERY-tou vlnu): odemknout nejbližší zamčenou, nebo vylepšit odemčenou
function abOffer(p){const o=[],u=p.ab.findIndex(a=>a.l<1);if(u>=0)o.push('u:'+u);p.ab.forEach((a,i)=>{if(a.l>=1&&a.l<AB_MAX)o.push('l:'+i)});return o}
function talUp(id,i){const p=P[id];if(!p||!p.tof||!p.tof[i])return false;const[k,s]=p.tof[i].split(':'),a=p.ab[+s];if(!a)return false;
 if(k=='u'&&a.l<1)abSet(p,+s,1);else if(k=='l'&&a.l>=1&&a.l<AB_MAX)abSet(p,+s,a.l+1);else return false;p.tof=null;return true}
// ---- seslání a efekty
function abHit(p,e,dm,burn){if(e.hp<=0||e.exT>0)return;dm*=p.u.dmg*p.u.adm*(e.boss?p.u.boss:1)*(e.arm||1);e.hp-=dm;ev.push(['s',e.x,e.z]);if(burn){e.burn=3;e.bd=Math.max(e.bd||0,burn);e.bo=p.id}if(e.hp<=0)killE(e,p)}
function abLater(d,f){(st.sch||(st.sch=[])).push({t:d,f})}
function abBoom(p,x,z,rad,dm){ev.push(['e',x,z,rad]);for(const e of en.slice())if(e.hp>0&&hyp(e.x-x,e.z-z)<rad+e.r)abHit(p,e,dm)}
function abFree(x,z){return Math.abs(x)<ar-.8&&Math.abs(z)<ar-.8&&!blockedAt(x,z)}
function abCast(p,i){const a=p.ab&&p.ab[i];if(!a||a.l<1||a.cd>0||p.dead||p.exT>0)return false;const d=ABIL[CAB[p.cls][i]];if(!d||d.t=='p')return false;const q=d.L[a.l-1],U=d.t=='u'?1:0,fx=Math.sin(p.ry),fz=Math.cos(p.ry);
 if(q.chain&&!en.some(e=>e.hp>0&&!(e.exT>0)&&hyp(e.x-p.x,e.z-p.z)<18))return false;
 a.cd=a.cdT=Math.max(1,q.cd*p.u.acd);const ox=p.x,oz=p.z;
 if(q.rush){const r=q.rush,sx=r.back?-fx:fx,sz=r.back?-fz:fz;let tx=p.x,tz=p.z;for(let s=.5;s<=r.d;s+=.5){const nx=p.x+sx*s,nz=p.z+sz*s;if(!abFree(nx,nz))break;tx=nx;tz=nz}
  if(r.dmg)for(const e of en.slice()){if(e.hp<=0)continue;const vx=tx-ox,vz=tz-oz,L2=vx*vx+vz*vz||1,t=cl(((e.x-ox)*vx+(e.z-oz)*vz)/L2,0,1);if(hyp(e.x-(ox+vx*t),e.z-(oz+vz*t))<e.r+1.1)abHit(p,e,r.dmg)}
  p.x=tx;p.z=tz;p.inv=Math.max(p.inv,r.inv);ev.push(['ab',ox,oz,'rush',p.id,tx,tz,U])}
 if(q.nova){const n=q.nova;for(const e of en.slice()){if(e.hp<=0||e.exT>0)continue;const dx=e.x-p.x,dz=e.z-p.z,dd=hyp(dx,dz);if(dd>=n.r+e.r)continue;abHit(p,e,n.dmg,n.burn);const kb=n.kb*(e.k=='tank'||e.boss?.35:1),k=dd||1;e.x=cl(e.x+dx/k*kb,-ar,ar);e.z=cl(e.z+dz/k*kb,-ar,ar);pushOut(e,e.r*.8)}
  if(n.heal)p.hp=Math.min(p.mhp,p.hp+p.mhp*n.heal);ev.push(['ab',p.x,p.z,'nova',p.id,n.r,n.burn?1:0,U])}
 if(q.beam){const b=q.beam;for(let k=0;k<b.n;k++){const ang=p.ry+(b.n>1?(k/(b.n-1)-.5)*b.fan:0),bx=Math.sin(ang),bz=Math.cos(ang);
   for(const e of en.slice()){if(e.hp<=0)continue;const rx=e.x-p.x,rz=e.z-p.z,pr=rx*bx+rz*bz,pe=Math.abs(-rx*bz+rz*bx);if(pr>-e.r&&pr<b.len+e.r&&pe<b.w+e.r)abHit(p,e,b.dmg)}
   ev.push(['ab',p.x,p.z,'beam',p.id,p.x+bx*b.len,p.z+bz*b.len,U])}}
 if(q.volley){const v=q.volley;for(let k=0;k<v.n;k++){const an=k/v.n*Math.PI*2;bl.push({x:p.x,z:p.z,vx:Math.cos(an)*34,vz:Math.sin(an)*34,l:.9,own:p.id,w:0,ao:0,dmg:p.u.dmg*p.u.adm*v.mul,pi:0,hit:[]})}ev.push(['ab',p.x,p.z,'volley',p.id,0,0,U])}
 if(q.barrage){const b=q.barrage,cx=p.x+fx*b.d,cz=p.z+fz*b.d;for(let k=0;k<b.n;k++){const an=R()*6.283,rr=Math.sqrt(R())*b.sp,x=cl(cx+Math.cos(an)*rr,-ar+1,ar-1),z=cl(cz+Math.sin(an)*rr,-ar+1,ar-1);abLater(.25+k*b.gap,()=>abBoom(p,x,z,b.rad,b.dmg))}ev.push(['ab',p.x,p.z,'barrage',p.id,cx,cz,U])}
 if(q.slow){const s=q.slow;for(const e of en)if(e.hp>0&&hyp(e.x-p.x,e.z-p.z)<s.r+e.r){e.slow=Math.max(e.slow||0,s.t);e.sl=Math.max(e.sl||0,s.m)}ev.push(['ab',p.x,p.z,'slow',p.id,Math.min(s.r,12),0,U])}
 if(q.aura){p.bf.aura={t:q.aura.t,m:1,r:q.aura.r,dps:q.aura.dps,burn:q.aura.burn||0,tk:0,u:U};ev.push(['ab',p.x,p.z,'aura',p.id,q.aura.r,0,U])}
 if(q.storm){p.bf.storm={t:q.storm.t,m:1,mul:q.storm.mul,ang:0,tk:0};ev.push(['ab',p.x,p.z,'storm',p.id,0,0,U])}
 if(q.chain){const c=q.chain,tg=en.filter(e=>e.hp>0&&!(e.exT>0)&&hyp(e.x-p.x,e.z-p.z)<18).sort((A,B)=>hyp(A.x-p.x,A.z-p.z)-hyp(B.x-p.x,B.z-p.z)).slice(0,c.n);p.inv=Math.max(p.inv,tg.length*.13+.3);let px=p.x,pz=p.z;
  tg.forEach((e,k)=>{const sx=px,sz=pz;px=e.x;pz=e.z;abLater(k*.13,()=>{if(p.dead)return;const dx=e.x-sx,dz=e.z-sz,dd=hyp(dx,dz)||1;if(e.hp>0){p.x=cl(e.x-dx/dd*1.2,-ar+.8,ar-.8);p.z=cl(e.z-dz/dd*1.2,-ar+.8,ar-.8);pushOut(p,p.r);ev.push(['ab',sx,sz,'chain',p.id,e.x,e.z,U]);abHit(p,e,c.dmg)}})})}
 if(q.heal&&!q.nova){p.hp=Math.min(p.mhp,p.hp+p.mhp*q.heal);ev.push(['ab',p.x,p.z,'heal',p.id,0,0,U])}
 if(q.buff){const b=q.buff;for(const k in b)if(k!='t')p.bf[k]={t:b.t,m:b[k]};ev.push(['ab',p.x,p.z,'buff',p.id,b.dr?1:b.dmg?2:b.haste?3:4,0,U])}
 return true}
// každý tik hráče: čekání schopností, trvání bonusů, aura a spirála střel
function abTick(p,dt){for(const a of p.ab)if(a.cd>0)a.cd-=dt;const bf=p.bf;for(const k in bf){const b=bf[k];if(b.t>0)b.t-=dt}
 const au=bf.aura;if(au&&au.t>0){au.tk-=dt;if(au.tk<=0){au.tk=.25;for(const e of en.slice())if(e.hp>0&&!(e.exT>0)&&hyp(e.x-p.x,e.z-p.z)<au.r+e.r){abHit(p,e,au.dps*.25);if(au.burn&&e.hp>0){e.burn=Math.max(e.burn||0,1.5);e.bd=Math.max(e.bd||0,au.burn);e.bo=p.id}}if(R()<.5)ev.push(['ab',p.x,p.z,'auratk',p.id,au.r,0,au.u])}}
 const sm=bf.storm;if(sm&&sm.t>0){sm.tk-=dt;if(sm.tk<=0){sm.tk=.06;for(let k=0;k<2;k++){const an=sm.ang+k*Math.PI;bl.push({x:p.x,z:p.z,vx:Math.cos(an)*36,vz:Math.sin(an)*36,l:1,own:p.id,w:0,ao:0,dmg:p.u.dmg*p.u.adm*sm.mul,pi:1,hit:[]})}sm.ang+=.9}}}
function abInput(p){const m=p.inp.ab|0;if(m){for(let i=0;i<4;i++)if(m&(1<<i))abCast(p,i);p.inp.ab=0}}
// odložené události (výbuchy náletu, skoky řetězu) – volá se jednou za tik hry
function abSched(dt){const s=st.sch;if(!s||!s.length)return;for(let i=0;i<s.length;i++)s[i].t-=dt;for(let i=0;i<s.length;i++)if(s[i].t<=0){const o=s.splice(i--,1)[0];try{o.f()}catch(e){}}}
function abSnap(p){return p.ab.map(a=>[a.l,a.cd>0?+(a.cd/(a.cdT||1)).toFixed(2):0])}
