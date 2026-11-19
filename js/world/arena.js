// js/world/arena.js – aréna: kamenná podlaha s runovým kruhem, hradby s cimbuřím a věžemi, pochodně, sloupy / bedny / sudy z mapy, trosky, prapory, noční obloha
const ARN={torches:[],tick:null};
function cvs(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c}
function ctex(c,rx,ry){const t=new G.CanvasTexture(c);t.wrapS=t.wrapT=G.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=8;return t}
const rnd=(a,b)=>a+R()*(b-a);
function brickCanvas(){return cvs(256,256,(x,w,h)=>{x.fillStyle='#4b4e60';x.fillRect(0,0,w,h);const rows=8,bh=h/rows;
 for(let r=0;r<rows;r++){const off=r%2?32:0;for(let c=-1;c<5;c++){const sh=rnd(-14,14)|0,bx=c*64+off;x.fillStyle='rgb('+(75+sh)+','+(78+sh)+','+(96+sh)+')';x.fillRect(bx+2,r*bh+2,60,bh-4);if(R()<.18){x.fillStyle='rgba(60,90,50,.22)';x.fillRect(bx+2,r*bh+bh*.6,60,bh*.4-2)}}}
 x.strokeStyle='rgba(20,22,30,.9)';x.lineWidth=3;for(let r=0;r<=rows;r++){x.beginPath();x.moveTo(0,r*bh);x.lineTo(w,r*bh);x.stroke()}
 for(let r=0;r<rows;r++){const off=r%2?32:0;for(let c=-1;c<5;c++){x.beginPath();x.moveTo(c*64+off,r*bh);x.lineTo(c*64+off,(r+1)*bh);x.stroke()}}})}
function floorCanvas(){return cvs(512,512,(x,w,h)=>{x.fillStyle='#20233a';x.fillRect(0,0,w,h);const n=4,s=w/n;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const sh=rnd(-10,10)|0;x.fillStyle='rgb('+(38+sh)+','+(42+sh)+','+(64+sh)+')';x.fillRect(i*s+3,j*s+3,s-6,s-6);if(R()<.3){x.fillStyle='rgba(10,12,22,.35)';x.beginPath();x.arc(i*s+rnd(20,s-20),j*s+rnd(20,s-20),rnd(8,30),0,7);x.fill()}}
 x.strokeStyle='rgba(8,10,18,.85)';x.lineWidth=6;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,h);x.moveTo(0,i*s);x.lineTo(w,i*s);x.stroke()}
 x.strokeStyle='rgba(6,8,14,.7)';x.lineWidth=2;for(let k=0;k<7;k++){x.beginPath();let px=rnd(0,w),py=rnd(0,h);x.moveTo(px,py);for(let m=0;m<6;m++){px+=rnd(-40,40);py+=rnd(-40,40);x.lineTo(px,py)}x.stroke()}})}
function runeCanvas(){return cvs(512,512,(x,w,h)=>{x.translate(w/2,h/2);x.strokeStyle='rgba(124,140,255,.9)';x.lineWidth=5;for(const r of[240,215,150]){x.beginPath();x.arc(0,0,r,0,7);x.stroke()}
 x.lineWidth=3;for(let i=0;i<24;i++){const a=i*Math.PI/12;x.beginPath();x.moveTo(Math.cos(a)*215,Math.sin(a)*215);x.lineTo(Math.cos(a)*240,Math.sin(a)*240);x.stroke()}
 x.lineWidth=4;for(let k=0;k<2;k++){x.beginPath();for(let i=0;i<3;i++){const a=i*2.094+k*1.047;x.lineTo(Math.cos(a)*150,Math.sin(a)*150)}x.closePath();x.stroke()}})}
function woodCanvas(){return cvs(128,128,(x,w,h)=>{x.fillStyle='#6b4a2b';x.fillRect(0,0,w,h);for(let i=0;i<6;i++){x.fillStyle='rgb('+(90+rnd(-12,12)|0)+','+(62+rnd(-8,8)|0)+',36)';x.fillRect(0,i*21+1,w,19)}x.strokeStyle='rgba(30,18,8,.8)';x.lineWidth=2;for(let i=0;i<=6;i++){x.beginPath();x.moveTo(0,i*21);x.lineTo(w,i*21);x.stroke()}})}
function bannerCanvas(col){return cvs(128,256,(x,w,h)=>{x.fillStyle=col;x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,0,w,14);x.fillRect(0,h-34,w,34);x.strokeStyle='#ffd27a';x.lineWidth=5;x.beginPath();x.arc(w/2,100,34,0,7);x.stroke();x.beginPath();x.moveTo(w/2,60);x.lineTo(w/2,140);x.moveTo(w/2-30,100);x.lineTo(w/2+30,100);x.stroke()})}
(function arenaBuild(){try{
 const brick=new G.MeshStandardMaterial({map:ctex(brickCanvas(),10,1),roughness:.95,metalness:.05}),stone=new G.MeshStandardMaterial({color:0x5a5d70,roughness:.9}),dark=new G.MeshStandardMaterial({color:0x14161f,roughness:1}),
  add=(m,x,y,z,sh)=>{m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;sc.add(m);return m};
 // podlaha a runový kruh
 fl.material.map=ctex(floorCanvas(),10,10);fl.material.metalness=.2;fl.material.needsUpdate=true;
 const ru=new G.Mesh(new G.CircleGeometry(12,48),new G.MeshBasicMaterial({map:ctex(runeCanvas()),transparent:true,opacity:.5,blending:G.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));ru.rotation.x=-Math.PI/2;ru.position.y=.03;sc.add(ru);ARN.rune=ru;
 // hradby, věže, pilíře, cimbuří, brány
 add(new G.Mesh(new G.BoxGeometry(64,5,1.8),brick),0,2.5,-31);add(new G.Mesh(new G.BoxGeometry(64,5,1.8),brick),0,2.5,31);add(new G.Mesh(new G.BoxGeometry(1.8,5,64),brick),-31,2.5,0);add(new G.Mesh(new G.BoxGeometry(1.8,5,64),brick),31,2.5,0);
 for(const[x,z]of[[-31,-31],[31,-31],[-31,31],[31,31]]){add(new G.Mesh(new G.CylinderGeometry(2.6,2.9,8,12),brick),x,4,z);add(new G.Mesh(new G.CylinderGeometry(3,2.6,.7,12),stone),x,8.3,z);add(new G.Mesh(new G.ConeGeometry(3.2,2.6,12),dark),x,10,z)}
 const cr=new G.InstancedMesh(new G.BoxGeometry(1.2,.9,1.8),brick,112),d=new G.Object3D();let n=0;
 for(let i=0;i<28&&n<112;i++){const p=-30+i*2.2;for(const[x,z,ry]of[[p,-31,0],[p,31,0],[-31,p,Math.PI/2],[31,p,Math.PI/2]]){d.position.set(x,5.45,z);d.rotation.y=ry;d.updateMatrix();cr.setMatrixAt(n++,d.matrix)}}cr.count=n;cr.castShadow=cr.receiveShadow=true;sc.add(cr);
 for(let i=-2;i<=2;i++){for(const[x,z,w,dd]of[[i*12,-30.1,1.2,.9],[i*12,30.1,1.2,.9],[-30.1,i*12,.9,1.2],[30.1,i*12,.9,1.2]])add(new G.Mesh(new G.BoxGeometry(w,4.4,dd),stone),x,2.2,z)}
 for(const[x,z,ry]of[[-6,-30.2,0],[6,-30.2,0],[-6,30.2,Math.PI],[6,30.2,Math.PI],[-30.2,-6,Math.PI/2],[-30.2,6,Math.PI/2],[30.2,-6,-Math.PI/2],[30.2,6,-Math.PI/2]]){const g=new G.Group();g.position.set(x,0,z);g.rotation.y=ry;
  const a=new G.Mesh(new G.BoxGeometry(2.2,3.2,.3),dark);a.position.y=1.6;g.add(a);const t=new G.Mesh(new G.CylinderGeometry(1.1,1.1,.3,16,1,false,-Math.PI/2,Math.PI),dark);t.rotation.x=Math.PI/2;t.position.y=3.2;g.add(t);
  const f=new G.Mesh(new G.BoxGeometry(2.7,.25,.45),stone);f.position.y=3.3;g.add(f);sc.add(g)}
 // pochodně (4 se světlem)
 let ti=0;for(const[x,z,ry]of[[-15,-29.9,0],[15,-29.9,0],[-15,29.9,Math.PI],[15,29.9,Math.PI],[-29.9,-15,Math.PI/2],[-29.9,15,Math.PI/2],[29.9,-15,-Math.PI/2],[29.9,15,-Math.PI/2]]){
  const g=new G.Group();g.position.set(x,3,z);g.rotation.y=ry;const br=new G.Mesh(new G.CylinderGeometry(.08,.1,.9,6),dark);br.position.set(0,0,.2);g.add(br);const cup=new G.Mesh(new G.CylinderGeometry(.22,.12,.3,8),dark);cup.position.set(0,.5,.2);g.add(cup);
  const fm=new G.Sprite(new G.SpriteMaterial({map:glowT,color:0xff9a40,blending:G.AdditiveBlending,depthWrite:false,transparent:true}));fm.position.set(0,.95,.2);fm.scale.set(1.8,2.2,1);g.add(fm);
  let li=null;if(ti<4){li=new G.PointLight(0xff9040,1,24);li.position.set(0,1,.8);g.add(li)}ARN.torches.push({fm,li,i:ti});ti++;sc.add(g)}
 // překážky z mapy
 const wood=new G.MeshStandardMaterial({map:ctex(woodCanvas(),1,1),roughness:.85}),metal=new G.MeshStandardMaterial({color:0x2a2e3c,roughness:.5,metalness:.7}),rust=new G.MeshStandardMaterial({color:0x6a3a2a,roughness:.7,metalness:.4}),haz=new G.MeshBasicMaterial({color:0xff8a2d});
 for(const[x,z,r,t]of MAPOB){const g=new G.Group();g.position.set(x,0,z);g.rotation.y=rnd(0,6.28);
  if(t==0){const b=new G.Mesh(new G.BoxGeometry(r*2.5,.5,r*2.5),stone),sh=new G.Mesh(new G.CylinderGeometry(r*.78,r*.88,5.6,14),stone),cp=new G.Mesh(new G.BoxGeometry(r*2.1,.5,r*2.1),stone),gl=new G.Mesh(new G.TorusGeometry(r*.84,.05,6,20),new G.MeshBasicMaterial({color:0x7c8cff}));
   b.position.y=.25;sh.position.y=3.3;cp.position.y=6.35;gl.rotation.x=Math.PI/2;gl.position.y=1.2;g.add(b,sh,cp,gl)}
  else if(t==1){const s=r*1.41,b=new G.Mesh(new G.BoxGeometry(s,2.2,s),wood);b.position.y=1.1;g.add(b);for(const y of[.45,1.75]){const k=new G.Mesh(new G.BoxGeometry(s+.06,.18,s+.06),metal);k.position.y=y;g.add(k)}}
  else{const b=new G.Mesh(new G.CylinderGeometry(r*.85,r*.85,1.9,14),rust);b.position.y=.95;g.add(b);for(const y of[.4,1.5]){const k=new G.Mesh(new G.CylinderGeometry(r*.89,r*.89,.12,14),metal);k.position.y=y;g.add(k)}const z2=new G.Mesh(new G.CylinderGeometry(r*.86,r*.86,.25,14),haz);z2.position.y=.95;g.add(z2)}
  g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});sc.add(g)}
 // trosky
 const rb=new G.InstancedMesh(new G.BoxGeometry(1,1,1),stone,70);let rn=0;for(let i=0;i<200&&rn<70;i++){const x=rnd(-28,28),z=rnd(-28,28);if(blockedAt(x,z,2.5)||Math.hypot(x,z)<4)continue;const s=rnd(.15,.55);d.position.set(x,s*.3,z);d.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));d.scale.set(s*rnd(.8,1.6),s*.7,s*rnd(.8,1.6));d.updateMatrix();rb.setMatrixAt(rn++,d.matrix)}rb.count=rn;rb.receiveShadow=true;sc.add(rb);
 // prapory
 [[-21,-30.1,0,'#7a1f2e'],[21,-30.1,0,'#1f3c7a'],[-21,30.1,Math.PI,'#1f3c7a'],[21,30.1,Math.PI,'#7a1f2e'],[-30.1,-21,Math.PI/2,'#7a1f2e'],[30.1,21,-Math.PI/2,'#1f3c7a']].forEach(([x,z,ry,c])=>{const m=new G.Mesh(new G.PlaneGeometry(1.6,3.2),new G.MeshStandardMaterial({map:ctex(bannerCanvas(c)),roughness:.9,side:2}));m.position.set(x,3,z);m.rotation.y=ry;sc.add(m)});
 // obloha: gradient, hvězdy, měsíc
 const sk=new G.Mesh(new G.SphereGeometry(150,24,16),new G.MeshBasicMaterial({map:new G.CanvasTexture(cvs(8,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#04050e');g.addColorStop(.55,'#0b1030');g.addColorStop(1,'#2a1d48');x.fillStyle=g;x.fillRect(0,0,w,h)})),side:G.BackSide,fog:false,depthWrite:false}));sc.add(sk);
 const sp=[];for(let i=0;i<350;i++){const a=rnd(0,6.28),e=rnd(.15,1.3);sp.push(Math.cos(a)*Math.cos(e)*140,Math.sin(e)*140,Math.sin(a)*Math.cos(e)*140)}
 const sg=new G.BufferGeometry();sg.setAttribute('position',new G.Float32BufferAttribute(sp,3));sc.add(new G.Points(sg,new G.PointsMaterial({color:0xdfe6ff,size:1.4,sizeAttenuation:false,fog:false,transparent:true,opacity:.8})));
 const mo=new G.Sprite(new G.SpriteMaterial({map:glowT,color:0xc8d4ff,fog:false,depthWrite:false,transparent:true}));mo.position.set(-70,62,-95);mo.scale.set(34,34,1);sc.add(mo);
 if(typeof dl!='undefined'&&dl.color)dl.color.setHex(0xb8c4ff);
 ARN.tick=t=>{for(const o of ARN.torches){const f=Math.sin(t*9+o.i*1.7)*.25+Math.sin(t*23+o.i)*.1+R()*.15;o.fm.scale.set(1.7+f*.5,2.1+f,1);if(o.li)o.li.intensity=1+f*.6}if(ARN.rune)ARN.rune.material.opacity=.42+Math.sin(t*1.4)*.1};
}catch(e){console.error('arena:',e)}})();
function arenaTick(t){if(ARN.tick)ARN.tick(t)}
