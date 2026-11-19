// js/entities/player.js – hráči: zbraně se zásobníky a přebíjením, pohyb, zranění, útok zblízka, exekuce bossů
const WP=[
{n:'Blaster',d:'Vyvážená, 1 střela',w:{cd:.16,n:1,fan:.25,sp:.05,v:40,l:1.2,dmg:1,pi:0},am:{mag:18,res:270,rld:1.1}},
{n:'Brokovnice',d:'5 broků, silná nablízko',w:{cd:.65,n:5,fan:.6,sp:.1,v:32,l:.5,dmg:.8,pi:0},am:{mag:6,res:60,rld:1.9}},
{n:'Kulomet',d:'Extrémně rychlá palba',w:{cd:.07,n:1,fan:.2,sp:.12,v:42,l:1.1,dmg:.55,pi:0},am:{mag:60,res:360,rld:2.2}},
{n:'Railgun',d:'Pomalý, probíjí nepřátele',w:{cd:.8,n:1,fan:.15,sp:.01,v:75,l:1,dmg:3,pi:3},am:{mag:3,res:30,rld:2.0}},
{n:'Plamenomet',d:'Krátký dosah, probíjí dav',w:{cd:.05,n:2,fan:.5,sp:.3,v:22,l:.35,dmg:.35,pi:99},am:{mag:120,res:480,rld:2.5}},
{n:'Raketomet',d:'Pomalý, výbuch zasáhne okolí',w:{cd:.9,n:1,fan:.1,sp:.02,v:26,l:1.6,dmg:2,pi:0,aoe:3.2},am:{mag:2,res:20,rld:2.4}},
{n:'Meč',d:'Sek v oblouku, odráží střely',w:{cd:.45,dmg:2.6},mel:{r:3.2,ang:1.9,kb:.9,defl:1}},
{n:'Kladivo',d:'Pomalý úder do kruhu, odhodí nepřátele',w:{cd:1.1,dmg:4.5},mel:{r:4.2,ang:6.3,kb:2.5,defl:1}},
{n:'Kopí',d:'Dlouhé bodnutí v řadě, probíjí',w:{cd:.7,dmg:3},mel:{r:6.5,ang:0,line:.9,kb:.5,defl:0}},
{n:'Dýky',d:'Rychlé krátké seky, léčí',w:{cd:.16,dmg:.9},mel:{r:2.3,ang:1.3,kb:.2,defl:0,ls:.6}}];
const CLS=[
{n:'Střelec',d:'Blaster · vyvážený, 100 životů',hp:100,spd:1,rate:1,dmg:1,wd:0},
{n:'Tank',d:'Brokovnice · 150 životů, pomalejší',hp:150,spd:.85,rate:1,dmg:1.2,wd:1},
{n:'Stíhač',d:'Kulomet · 80 životů, rychlá palba',hp:80,spd:1,rate:1.2,dmg:1,wd:2},
{n:'Průzkumník',d:'Railgun · 75 životů, rychlý',hp:75,spd:1.3,rate:1.1,dmg:1,wd:3},
{n:'Granátník',d:'Raketomet · 110 životů',hp:110,spd:.95,rate:1,dmg:1,wd:5},
{n:'Žhář',d:'Plamenomet · 100 životů',hp:100,spd:1,rate:1,dmg:1,wd:4},
{n:'Rytíř',d:'Meč · 130 životů, odráží střely',hp:130,spd:1,rate:1,dmg:1,wd:6},
{n:'Berserker',d:'Kladivo · 160 životů, pomalejší',hp:160,spd:.9,rate:1,dmg:1.1,wd:7},
{n:'Lovec',d:'Kopí · 100 životů, dlouhý dosah',hp:100,spd:1.1,rate:1,dmg:1,wd:8},
{n:'Zabiják',d:'Dýky · 85 životů, rychlý, léčí se',hp:85,spd:1.25,rate:1,dmg:1,wd:9}];
const EXECN=['Přímý zásah do jádra','Střela mezi oči','Smršť olova','Průstřel srdcem','Raketa do tlamy','Spálení zaživa','Rozseknutí vedví','Rozdrcení','Probodnutí','Smršť čepelí'];
const magMax=p=>{const A=WP[p.wp].am;return A?Math.max(1,Math.round(A.mag*p.u.mag)):0},resMax=p=>{const A=WP[p.wp].am;return A?Math.round(A.res*p.u.res):0};
function ammoFill(p){p.am=magMax(p);p.rs=resMax(p);p.rl=0}
function startReload(p){const A=WP[p.wp].am;if(!A||p.rl>0||p.am>=magMax(p)||p.rs<=0)return false;p.rlT=A.rld/p.u.rld;p.rl=p.rlT;ev.push(['rl',p.x,p.z,p.id,p.wp]);return true}
const newPlayer=(id,c=0,ml,wp)=>{const C=CLS[c]||CLS[0],W0=cl(wp===undefined?C.wd:wp|0,0,WP.length-1),ML=ml||sanM(id==me?META.lv:null);
 const p={id,cls:c,ml:ML,wp:W0,wp0:W0,own:[W0],name:'Hráč',col:0,x:(id%4-1.5)*3,z:0,ry:0,hp:C.hp+10*ML.hp,mhp:C.hp+10*ML.hp,r:.7,cd:0,inv:0,dead:false,offer:null,cards:[],
  inp:{dx:0,dz:0,ax:0,az:0,f:0,ds:0,sw:0,rl:0,ex:0,ab:0},dash:0,dcd:0,am:0,rs:0,rl:0,rlT:1,trk:0,exT:0,exId:0,
  u:{dmg:C.dmg*(1+.05*ML.dmg),rate:C.rate,spd:C.spd*(1+.04*ML.spd),multi:1,pierce:0,vamp:0,crit:0,critd:2.5,regen:0,shield:0,armor:0,cdash:1,burn:0,slow:0,xth:0,boss:1,luck:0,rev:0,blast:0,mag:1,res:1,rld:1,thr:0,reach:1,acd:1,adm:1}};
 ammoFill(p);abInit(p);return p};
const addPlayer=id=>P[id]=newPlayer(id);
function applyUp(p,k){applyCard(p,k)}
function hurt(p,d,force){if(p.dead||(p.inv>0&&!force))return;d*=(1-p.u.armor)*(1-abm(p,'dr'));st.wl+=Math.min(d,p.hp);p.hp-=d;p.inv=.5+p.u.shield;ev.push(['h',p.x,p.z,p.id]);
 if(p.hp<=0){if(p.u.rev>0){p.u.rev--;p.hp=p.mhp*.5;p.inv=2.5;ev.push(['rv',p.x,p.z,p.id]);return}p.hp=0;p.dead=true;if(!Object.values(P).some(q=>!q.dead))die()}}
// exekuce bosse (F): boss s ≤ 20 % životů a v dosahu před hráčem; hráč je krátce nezranitelný, boss „zamrzne“ a po animaci zemře
function execTarget(p){if(p.exT>0||p.dead)return null;const WD=WP[p.wp],rng=WD.mel?7:15,thr=.2+p.u.xth;let best=null,bd=1e9;
 for(const e of en){if(!e.boss||e.hp<=0||e.exT>0||e.hp>e.mhp*thr)continue;const dx=e.x-p.x,dz=e.z-p.z,d=hyp(dx,dz);if(d>rng+e.r)continue;let df=Math.atan2(dx,dz)-p.ry;df=Math.atan2(Math.sin(df),Math.cos(df));if(Math.abs(df)>1)continue;if(d<bd){bd=d;best=e}}
 return best}
function tryExec(p){const best=execTarget(p);if(!best)return false;best.exT=1.1;best.exBy=p.id;p.exT=1.3;p.inv=Math.max(p.inv,2);p.exId=best.id;p.rl=0;ev.push(['xe',best.x,best.z,p.wp,p.id,best.id]);return true}
function applyStatus(e,p){if(p.u.burn){e.burn=3;e.bd=p.u.burn;e.bo=p.id}if(p.u.slow){e.slow=2;e.sl=p.u.slow}}
function updPlayer(p,dt){if(p.dead)return;const i=p.inp,WD=WP[p.wp],A=WD.am,km=hyp(i.dx,i.dz);p.dash-=dt;p.dcd-=dt;p.inv-=dt;p.cd-=dt;
 if(p.exT>0){p.exT-=dt;p.vx=p.vz=0;trackStyle(dt,p,0);return}
 if(i.ds&&p.dcd<=0&&km>.1){p.dash=.18;p.dcd=1.6*p.u.cdash;p.inv=Math.max(p.inv,.3);ev.push(['d',p.x,p.z])}
 const sp=12*p.u.spd*(p.dash>0?3.2:1)*(p.rl>0?.92:1)*(1+abm(p,'haste'));p.x=cl(p.x+i.dx*sp*dt,-ar+.8,ar-.8);p.z=cl(p.z+i.dz*sp*dt,-ar+.8,ar-.8);pushOut(p,p.r);p.vx=i.dx*12*p.u.spd;p.vz=i.dz*12*p.u.spd;
 if(p.u.regen)p.hp=Math.min(p.mhp,p.hp+p.u.regen*dt);const ax=i.ax-p.x,az=i.az-p.z;if(ax||az)p.ry=Math.atan2(ax,az);abTick(p,dt);abInput(p);
 if(A){if(p.rl>0){p.rl-=dt;if(p.rl<=0){const n=Math.min(magMax(p)-p.am,p.rs);p.am+=n;p.rs-=n;p.rl=0;ev.push(['rd',p.x,p.z,p.id,p.wp])}}else if(i.rl)startReload(p);
  if(p.am<=0&&p.rs<=0){p.trk+=dt;if(p.trk>1.2){p.am=1;p.trk=0}}else p.trk=0}
 if(i.ex&&tryExec(p))return;
 if(i.f&&p.cd<=0){const W=WD.w,a0=Math.atan2(az,ax);
  if(WD.mel){p.cd=W.cd/(p.u.rate*(1+abm(p,'rate')));meleeAttack(p,WD,a0);p.nsh=(p.nsh||0)+1}
  else if(p.rl>0){}
  else if(p.am<=0){if(!startReload(p)){p.cd=.4;ev.push(['dry',p.x,p.z,p.id,p.wp])}}
  else{p.cd=W.cd/(p.u.rate*(1+abm(p,'rate')));const n=W.n+p.u.multi-1;
   for(let k=0;k<n;k++){const a=a0+(n>1?(k/(n-1)-.5)*W.fan:0)+(R()-.5)*W.sp;bl.push({x:p.x,z:p.z,vx:Math.cos(a)*W.v,vz:Math.sin(a)*W.v,l:W.l,own:p.id,w:p.wp,ao:W.aoe||p.u.blast||0,dmg:p.u.dmg*(1+abm(p,'dmg'))*W.dmg,pi:p.u.pierce+W.pi,hit:[]})}
   M.shots+=n;p.nsh=(p.nsh||0)+1;if(R()>=p.u.thr)p.am--;if(p.am<=0)startReload(p)}}
 trackStyle(dt,p,km)}
// útok zbraní nablízko: zasáhne všechny v oblouku / kruhu / řadě, odhodí je, odráží nepřátelské střely; ostnatí nepřátelé vracejí zranění
function meleeAttack(p,WD,a0){const m=WD.mel,W=WD.w,r=m.r*p.u.reach,ca=Math.cos(a0),sa=Math.sin(a0);let hit=0;
 for(const e of en){if(e.hp<=0||e.exT>0)continue;const dx=e.x-p.x,dz=e.z-p.z,d=hyp(dx,dz);let ok=false;
  if(m.line){const pr=dx*ca+dz*sa,pe=Math.abs(-dx*sa+dz*ca);ok=pr>-e.r&&pr<r+e.r&&pe<m.line+e.r}
  else if(d<r+e.r){if(m.ang>6||d<e.r+.7)ok=true;else{let df=Math.atan2(dz,dx)-a0;df=Math.atan2(Math.sin(df),Math.cos(df));ok=Math.abs(df)<=m.ang/2}}
  if(!ok)continue;hit++;const dm=W.dmg*p.u.dmg*(1+abm(p,'dmg'))*(R()<p.u.crit?p.u.critd:1)*(e.boss?p.u.boss:1)*(e.arm||1);e.hp-=dm;ev.push(['s',e.x,e.z]);applyStatus(e,p);
  const kd=d||1,kb=m.kb*(e.k=='tank'||e.boss?.35:1);e.x=cl(e.x+dx/kd*kb,-ar,ar);e.z=cl(e.z+dz/kd*kb,-ar,ar);pushOut(e,e.r*.8);
  if(m.ls)p.hp=Math.min(p.mhp,p.hp+m.ls);if(e.thorns)hurt(p,Math.max(3,e.d*.4)*DF[opt.dif].d);if(e.hp<=0)killE(e,p)}
 if(m.defl)for(const b of eb){const dx=b.x-p.x,dz=b.z-p.z,d=hyp(dx,dz);if(d>=r+.5)continue;let df=Math.atan2(dz,dx)-a0;df=Math.atan2(Math.sin(df),Math.cos(df));
  if(m.ang>6||Math.abs(df)<=m.ang/2){const bx=b.x,bz=b.z;b.x=999;ev.push(['s',bx,bz])}}
 M.shots++;if(hit)M.hits++}
