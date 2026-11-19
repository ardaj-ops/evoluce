// js/world/models.js – hráči jako lidé a nepřátelé jako příšery, poskládaní z jednoduchých těles (sdílené geometrie a materiály) s animací chůze / vznášení
const GCa={},MCa={};
const geo=(k,f)=>GCa[k]||(GCa[k]=f());
const gB=(w,h,d)=>geo('b'+w+','+h+','+d,()=>new G.BoxGeometry(w,h,d)),gS=(r,s=12)=>geo('s'+r+','+s,()=>new G.SphereGeometry(r,s,Math.max(6,s*.7|0))),
 gC=(a,b,h,s=8)=>geo('c'+a+','+b+','+h+','+s,()=>new G.CylinderGeometry(a,b,h,s)),gK=(r,h,s=6)=>geo('k'+r+','+h+','+s,()=>new G.ConeGeometry(r,h,s)),
 gO=r=>geo('o'+r,()=>new G.OctahedronGeometry(r)),gT=(r,t)=>geo('t'+r+','+t,()=>new G.TorusGeometry(r,t,6,20));
const mm=(c,e,o)=>{o=o||{};e=e||0;const k=c+'|'+e+'|'+(o.m||0)+'|'+(o.o||1)+'|'+(o.r==null?.7:o.r);return MCa[k]||(MCa[k]=new G.MeshStandardMaterial({color:c,emissive:e?c:0x000000,emissiveIntensity:e,roughness:o.r==null?.7:o.r,metalness:o.m||0,transparent:(o.o||1)<1,opacity:o.o||1}))};
const part=(g,geom,mat,x,y,z)=>{const m=new G.Mesh(geom,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
const dk=c=>new G.Color(c).multiplyScalar(.32).getHex(),piv=(p,x,y,z)=>{const q=new G.Group();q.position.set(x,y,z);p.add(q);return q};
// ---- člověk: pánev, trup s hrudním plátem v barvě hráče, hlava s helmou a hledím, paže s lokty, nohy s koleny, zbraň v ruce
function makeHuman(col){const g=new G.Group(),c=mm(col,.5,{m:.4,r:.4}),skin=mm(0xd9a77a,.2,{m:.4,r:.4});const h=piv(g,0,.5,0);part(h,gB(.4,.6,.3),c,0,0,0);part(h,gS(.2,8),skin,0,0,0);const l=x=>{const p=piv(h,x,-.4,0);part(p,gB(.1,.5,.1),c,0,-.25,0);return p};[h.lL,h.lR]=l(-.15);[h.aL,h.aR]=l(.15);h.gun=piv(h.aR,0,-.3,0);part(h.gun,gB(.05,.3,.05),c,0,-.15,0);g.userData.h=h;g.userData.br=h.gun;return g}
  const leg=x=>{const th=piv(h.hip,x,-.12,0);part(th,gC(.12,.1,.5),cloth,0,-.25,0);const kn=piv(th,0,-.5,0);part(kn,gC(.09,.08,.5),armor,0,-.25,0);part(kn,gB(.15,.1,.3),boot,0,-.52,.05);return[th,kn]};
  [h.lL,h.kL]=leg(-.17);[h.lR,h.kR]=leg(.17);
  h.gun=piv(h.eR,0,-.46,0);part(h.gun,gB(.09,.5,.12),mm(0x1b2040,0,{m:.8,r:.3}),0,-.2,0);part(h.gun,gB(.05,.25,.05),mm(col,1,{m:.5}),0,-.55,0);
  g.userData.h=h;g.userData.br=h.gun;return g}
function animHuman(o,dt,spd){const h=o.userData.h;if(!h)return;h.ph=(h.ph||0)+spd*dt*.9;const w=Math.min(1,spd/6),s=Math.sin(h.ph)*w*.9,aim=o.userData.aimT>0;if(aim)o.userData.aimT-=dt;
 h.lL.rotation.x=s;h.lR.rotation.x=-s;h.kL.rotation.x=Math.max(0,-Math.sin(h.ph))*w*.9;h.kR.rotation.x=Math.max(0,Math.sin(h.ph))*w*.9;h.hip.position.y=.95+Math.abs(Math.cos(h.ph))*.04*w;
 if(aim){h.aR.rotation.x=-1.5;h.eR.rotation.x=-.1;h.aL.rotation.x=-1.25;h.aL.rotation.z=.35;h.eL.rotation.x=-.35}else{h.aL.rotation.x=-s*.8;h.aR.rotation.x=s*.8;h.aL.rotation.z=0;h.eL.rotation.x=-.15*w;h.eR.rotation.x=-.15*w}
 h.torso.rotation.x=aim?.06:.02*w}
// ---- příšery (archetypy); každý vrací skupinu s userData.anim(dt,rychlost,čas)
const ARCH={
 ghoul(c){const g=new G.Group(),b=piv(g,0,0,0),fl=mm(dk(c),0,{r:.9}),bone=mm(0xd8d0b8),hip=piv(b,0,.8,0),to=piv(hip,0,.1,0);to.rotation.x=.45;
  part(to,gB(.6,.8,.38),fl,0,.45,0);for(let i=0;i<4;i++)part(to,gK(.07,.3,5),bone,0,.2+i*.2,-.22).rotation.x=-.6;
  const hd=piv(to,0,.95,.15);part(hd,gS(.2,10),fl,0,0,0);part(hd,gB(.22,.07,.2),fl,0,-.17,.06);for(const x of[-.09,.09])part(hd,gS(.05,8),mm(c,2.2),x,.03,.17);
  const arm=x=>{const p=piv(to,x,.8,0);part(p,gC(.07,.05,.95),fl,0,-.48,0);part(p,gK(.08,.25,5),bone,0,-1,0).rotation.x=Math.PI;return p},aL=arm(-.38),aR=arm(.38);
  const leg=x=>{const p=piv(hip,x,0,0);part(p,gC(.1,.08,.8),fl,0,-.4,0);return p},lL=leg(-.18),lR=leg(.18);
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(4+sp*.6));lL.rotation.x=s*.8;lR.rotation.x=-s*.8;aL.rotation.x=-s*.7;aR.rotation.x=s*.7;to.rotation.x=.45+Math.sin(t*3)*.05;b.position.y=Math.abs(s)*.05};return g},
 hound(c){const g=new G.Group(),b=piv(g,0,0,0),fl=mm(dk(c),0,{r:.85});part(b,gS(.45,10),fl,0,.5,0).scale.set(.8,.7,1.6);
  const hd=piv(b,0,.62,.7);part(hd,gS(.22,10),fl,0,0,0);part(hd,gK(.13,.4,6),fl,0,-.05,.28).rotation.x=Math.PI/2;for(const x of[-.09,.09]){part(hd,gS(.045,8),mm(c,2.2),x,.08,.17);part(hd,gK(.06,.2,4),fl,x*1.4,.2,-.03)}
  part(b,gK(.08,.5,5),fl,0,.55,-.8).rotation.x=-1.2;
  const lg=(x,z)=>{const p=piv(b,x,.45,z);part(p,gC(.07,.05,.5),fl,0,-.25,0);return p},l1=lg(-.2,.45),l2=lg(.2,.45),l3=lg(-.2,-.45),l4=lg(.2,-.45);
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(6+sp));l1.rotation.x=s;l2.rotation.x=-s;l3.rotation.x=-s;l4.rotation.x=s;b.position.y=Math.abs(s)*.08*Math.min(1,sp/6);b.rotation.x=s*.04};return g},
 golem(c){const g=new G.Group(),b=piv(g,0,0,0),sm=mm(0x4a4d5e,0,{r:.95}),cr=mm(c,1.6),hip=piv(b,0,1,0);part(hip,gB(1.1,.5,.7),sm,0,0,0);
  const to=piv(hip,0,.25,0);part(to,gB(1.5,1.3,.95),sm,0,.65,0);part(to,gB(.5,.9,.05),cr,0,.7,.49);part(to,gB(.9,.05,.05),cr,0,1,.49);
  const hd=piv(to,0,1.5,.05);part(hd,gB(.55,.5,.55),sm,0,0,0);part(hd,gB(.4,.07,.05),cr,0,.02,.29);
  const arm=x=>{const sh=piv(to,x,1.1,0);part(sh,gS(.38,8),sm,0,0,0);part(sh,gB(.4,1.1,.4),sm,0,-.6,0);part(sh,gB(.55,.5,.55),mm(0x3a3d4c),0,-1.3,0);part(sh,gK(.1,.35,5),mm(0xd8d0b8),x>0?.3:-.3,.3,0);return sh},aL=arm(-1),aR=arm(1);
  const leg=x=>{const p=piv(hip,x,-.1,0);part(p,gB(.5,1,.55),sm,0,-.5,0);return p},lL=leg(-.4),lR=leg(.4);
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(2.2+sp*.4));lL.rotation.x=s*.5;lR.rotation.x=-s*.5;aL.rotation.x=-s*.35;aR.rotation.x=s*.35;to.rotation.z=s*.04;b.position.y=Math.abs(s)*.06};return g},
 caster(c){const g=new G.Group(),b=piv(g,0,.35,0),rb=mm(dk(c),0,{r:.9}),orbs=piv(b,0,1.1,0);part(b,gK(.55,1.5,10),rb,0,.75,0);part(b,gS(.2,10),mm(0xd9a77a),0,1.62,0);part(b,gK(.28,.5,8),rb,0,1.78,0);
  part(b,gB(.12,.05,.05),mm(c,2.2),0,1.62,.18);for(let i=0;i<3;i++)part(orbs,gS(.12,8),mm(c,2),Math.cos(i*2.09)*.8,0,Math.sin(i*2.09)*.8);
  g.userData.anim=(dt,sp,t)=>{orbs.rotation.y=t*2.2;b.position.y=.35+Math.sin(t*2)*.08;b.rotation.z=Math.sin(t*1.3)*.04};return g},
 wraith(c){const g=new G.Group(),b=piv(g,0,.55,0),cl=mm(dk(c),0,{o:.82,r:1});part(b,gK(.5,1.7,10),cl,0,.85,0);part(b,gK(.38,1.4,8),cl,0,1,0).scale.set(1.2,1,1.2);part(b,gS(.2,10),mm(0x101018),0,1.78,0);part(b,gK(.28,.45,8),cl,0,1.95,0);
  for(const x of[-.07,.07])part(b,gS(.04,8),mm(c,2.4),x,1.78,.17);
  const arm=x=>{const p=piv(b,x,1.5,.1);part(p,gC(.05,.03,1),cl,0,-.5,0);part(p,gK(.05,.3,4),mm(0xd8d0b8),0,-1.1,0).rotation.x=Math.PI;return p},aL=arm(-.4),aR=arm(.4);
  g.userData.anim=(dt,sp,t)=>{b.position.y=.55+Math.sin(t*2.4)*.12;b.rotation.z=Math.sin(t*1.7)*.07;aL.rotation.x=-.9+Math.sin(t*3)*.3;aR.rotation.x=-.9-Math.sin(t*3)*.3};return g},
 imp(c){const g=new G.Group(),b=piv(g,0,0,0),fl=mm(dk(c),0,{r:.8});part(b,gS(.28,10),fl,0,.3,0).scale.set(1,.8,1.3);part(b,gS(.16,10),fl,0,.42,.3);for(const x of[-.07,.07])part(b,gS(.05,8),mm(c,2.4),x,.47,.42);
  const legs=[];for(let i=0;i<3;i++)for(const sd of[-1,1]){const p=piv(b,sd*.2,.28,(i-1)*.22);part(p,gC(.025,.02,.4),fl,sd*.18,-.1,0).rotation.z=sd*.9;legs.push([p,i,sd])}
  g.userData.anim=(dt,sp,t)=>{for(const[p,i,sd]of legs)p.rotation.y=Math.sin(t*(12+sp)+i*2+(sd>0?0:Math.PI))*.4;b.position.y=Math.abs(Math.sin(t*(12+sp)))*.03};return g},
 bloat(c){const g=new G.Group(),b=piv(g,0,0,0),fl=mm(dk(c),0,{r:.8}),core=part(b,gS(.4,10),mm(c,1.6),0,.7,0),sk=part(b,gS(.7,14),mm(dk(c),0,{o:.78,r:.6}),0,.7,0);
  for(let i=0;i<7;i++)part(b,gS(.1,6),fl,Math.cos(i*.9)*.62,.7+Math.sin(i*1.7)*.35,Math.sin(i*.9)*.62);part(b,gS(.2,10),fl,0,1.45,.1);for(const x of[-.07,.07])part(b,gS(.04,8),mm(c,2.4),x,1.48,.27);
  const l=x=>{const p=piv(b,x,.25,0);part(p,gC(.1,.08,.3),fl,0,-.1,0);return p},lL=l(-.3),lR=l(.3);
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(5+sp));lL.rotation.x=s*.5;lR.rotation.x=-s*.5;sk.scale.setScalar(1+Math.sin(t*4)*.05);core.scale.setScalar(1+Math.sin(t*8)*.12);b.position.y=Math.abs(s)*.04};return g},
 slime(c){const g=new G.Group(),b=piv(g,0,0,0),body=part(b,gS(.9,14),mm(c,.35,{o:.62,r:.2}),0,.8,0),core=part(b,gS(.3,10),mm(c,1.4),0,.75,0);
  for(let i=0;i<5;i++)part(b,gS(.09,6),mm(0xffffff,.4,{o:.5}),Math.cos(i*1.3)*.4,.6+Math.sin(i*2)*.35,Math.sin(i*1.3)*.4);for(const x of[-.15,.15])part(b,gS(.07,8),mm(0x101018),x,1,.6);
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(3+sp*.3));body.scale.set(1+s*.07,.85-s*.1,1+s*.07);body.position.y=.8+s*.04;core.position.y=.75+Math.sin(t*2)*.08};return g},
 shaman(c){const g=new G.Group(),b=piv(g,0,.1,0),rb=mm(dk(c),0,{r:.9});part(b,gK(.5,1.4,10),rb,0,.7,0);part(b,gS(.2,10),mm(0x7a6a58),0,1.5,0);part(b,gK(.3,.55,8),rb,0,1.68,0);for(const x of[-.07,.07])part(b,gS(.04,8),mm(c,2.4),x,1.5,.17);
  const sf=piv(b,.5,.2,.3);part(sf,gC(.04,.04,1.8),mm(0x5a4a38),0,.7,0);const orb=part(sf,gS(.16,10),mm(c,2),0,1.65,0),ring=part(b,gT(.8,.03),mm(c,1.2,{o:.7}),0,.9,0);ring.rotation.x=Math.PI/2;
  g.userData.anim=(dt,sp,t)=>{ring.rotation.z=t*1.5;ring.scale.setScalar(1+Math.sin(t*3)*.05);orb.scale.setScalar(1+Math.sin(t*5)*.15);b.position.y=.1+Math.sin(t*1.6)*.05;b.rotation.z=Math.sin(t*1.1)*.04};return g},
 specter(c){const g=new G.Group(),b=piv(g,0,.9,0),core=part(b,gO(.38),mm(c,1.8),0,0,0),sh=piv(b,0,0,0);
  for(let i=0;i<6;i++)part(sh,gO(.14),mm(dk(c)|0x202020,.3,{r:.3,m:.5}),Math.cos(i*1.047)*.65,Math.sin(i*2.1)*.3,Math.sin(i*1.047)*.65).rotation.set(i,i*2,0);
  g.userData.anim=(dt,sp,t)=>{sh.rotation.y=t*1.6;sh.rotation.x=Math.sin(t)*.3;core.rotation.y=t*2;b.position.y=.9+Math.sin(t*2.2)*.12};return g},
 spiker(c){const g=new G.Group(),b=piv(g,0,0,0),fl=mm(dk(c),0,{r:.9}),sp_=mm(c,.9,{m:.3});part(b,gS(.55,12),fl,0,.6,0).scale.set(.95,.8,1.4);
  for(let i=0;i<14;i++){const a=i*2.4,k=part(b,gK(.09,.5,5),sp_,Math.cos(a)*.4,.95+Math.sin(i*1.3)*.15,((i%7)-3)*.18);k.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.7)}
  const hd=piv(b,0,.65,.8);part(hd,gS(.24,10),fl,0,0,0);for(const x of[-.12,.12]){part(hd,gK(.07,.35,5),sp_,x,.22,-.05);part(hd,gS(.04,8),mm(c,2.4),x*.7,.05,.2)}
  const lg=(x,z)=>{const p=piv(b,x,.45,z);part(p,gC(.08,.06,.5),fl,0,-.25,0);return p},ls=[lg(-.3,.4),lg(.3,.4),lg(-.3,-.4),lg(.3,-.4)];
  g.userData.anim=(dt,sp,t)=>{const s=Math.sin(t*(4+sp*.5));ls[0].rotation.x=s*.7;ls[1].rotation.x=-s*.7;ls[2].rotation.x=-s*.7;ls[3].rotation.x=s*.7;b.position.y=Math.abs(s)*.05};return g}};
const K2A={chaser:'ghoul',runner:'hound',tank:'golem',shooter:'caster',dodger:'wraith',swarm:'imp',bomber:'bloat',splitter:'slime',healer:'shaman',phaser:'specter',thorn:'spiker'},
 B2A={sphere:'bloat',cube:'golem',spike:'spiker',ring:'wraith',crystal:'specter',pyramid:'ghoul'},
 R0={ghoul:.8,hound:.6,golem:1.3,caster:.8,wraith:.8,imp:.4,bloat:.7,slime:1,shaman:.8,specter:.75,spiker:.9};
function makeMonster(k){const t=T[k],a=t.g?(B2A[t.g.body]||'ghoul'):(K2A[k]||'ghoul'),g=ARCH[a](t.c);g.userData.s0=t.r/R0[a];g.userData.arch=a;g.userData.t=R()*10;g.scale.setScalar(g.userData.s0);return g}