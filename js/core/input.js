// js/core/input.js – ovládání z první osoby: WASD relativně k pohledu, rozhlížení myší (pointer lock), přemapovatelné klávesy
const FP={yaw:0,pitch:0,locked:false,exiting:false,bob:0,lx:0,lz:0};
const canLock=()=>!!(ren.domElement&&ren.domElement.requestPointerLock),plWant=()=>!!(vs&&vs.ph=='play'&&!SET.open&&!CHAT.open);
function lockOn(force){if(canLock()&&!document.pointerLockElement&&(force||plWant())){try{ren.domElement.requestPointerLock()}catch(e){}}}
function lockOff(){if(document.pointerLockElement){FP.exiting=true;document.exitPointerLock()}}
document.addEventListener('pointerlockchange',()=>{FP.locked=document.pointerLockElement===ren.domElement;if(!FP.locked){if(FP.exiting)FP.exiting=false;else if(plWant())openSettings()}});
let ABQ=0,abAcc=0;
addEventListener('keydown',e=>{
 if(SET.cap){e.preventDefault();if(e.code!='Escape')rebindTo(e.code);SET.cap=null;SET.ver++;return}
 if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.code=='Escape'){SET.open=!SET.open;SET.cap=null;ovKey='';SET.ver++;if(SET.open)lockOff();return}
 if((e.code=='KeyY'||e.code=='KeyN')&&voteCan()&&!CHAT.open&&!SET.open&&!Object.values(BIND).includes(e.code)){voteCast(e.code=='KeyY'?1:0);return}
 if(!e.repeat&&!SET.open&&!CHAT.open)for(let i=0;i<4;i++)if(e.code&&e.code===BIND['ab'+(i+1)])ABQ|=1<<i;
 if(e.code=='Enter'||e.code=='NumpadEnter'){if(net.on&&!SET.open&&!CHAT.open&&vs&&vs.ph!='lobby'&&vs.ph!='menu'){e.preventDefault();chatOpen()}return}
 keys[e.code]=1;if(e.code=='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;mouse.d=false});
// rozhlížení: myš vpravo = otočení doprava (yaw klesá), myš nahoru = pohled nahoru
addEventListener('mousemove',e=>{if(plWant()&&(FP.locked||!canLock())){const k=.0022*GX.sens;FP.yaw-=(e.movementX||0)*k;FP.pitch=cl(FP.pitch-(e.movementY||0)*k*(GX.invy?-1:1),-1.2,1.2)}});
addEventListener('mousedown',e=>{if(e.target.tagName=='CANVAS'&&e.button==SET.btn){if(canLock()&&!FP.locked)lockOn();else mouse.d=true}});addEventListener('mouseup',e=>{if(e.button==SET.btn)mouse.d=false});
addEventListener('contextmenu',e=>{if(e.target.tagName=='CANVAS')e.preventDefault()});
const kd=a=>BIND[a]&&keys[BIND[a]];
function ownPos(){const m=vs&&vs.p&&vs.p.find(a=>a[0]==me);return m?{x:m[1],z:m[2]}:{x:0,z:0}}
// dopředu = (sin yaw, cos yaw); doprava = (−cos yaw, sin yaw); mířím do bodu 80 jednotek před sebe (server ho ořízne)
function readInput(){if(SET.open||CHAT.open)return{dx:0,dz:0,ax:0,az:0,f:0,ds:0,sw:0};
 const f=(kd('up')||keys.ArrowUp?1:0)-(kd('down')||keys.ArrowDown?1:0),s=(kd('right')?1:0)-(kd('left')?1:0),sy=Math.sin(FP.yaw),cy=Math.cos(FP.yaw);
 let dx=f*sy-s*cy,dz=f*cy+s*sy;const k=hyp(dx,dz);if(k>1){dx/=k;dz/=k}
 const p=ownPos();return{dx,dz,ax:p.x+sy*80,az:p.z+cy*80,f:(mouse.d||kd('fire'))&&vs&&vs.ph=='play'?1:0,ds:kd('dash')?1:0,sw:0,rl:kd('reload')?1:0,ex:kd('exec')?1:0,ab:ABQ}}
