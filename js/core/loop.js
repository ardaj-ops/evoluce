// js/core/loop.js – hlavní smyčka: simulace (všichni), síť, vykreslení, kamera
let chatT=0,lbT=0,rcT=0,last=0,snapT=0,inT=0,ambT=0,fpsN=0,fpsT=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;fpsN++;fpsT+=dt;if(fpsT>=.5){if(GX.fps)$('fps').textContent=Math.round(fpsN/fpsT)+' FPS';fpsN=0;fpsT=0}if(!net.on&&st.ph=='menu'){if(net.ws&&net.ws.readyState==1){if((lbT-=dt)<=0){lbT=3;netSend({t:'list'})}}else if(LB.conn=='off'&&(rcT-=dt)<=0){rcT=5;netOpen()}}
 if(chatT-=dt,chatT<=0){chatT=.5;chatOverlay()}if(plWant())FP.yaw+=((keys.ArrowLeft?1:0)-(keys.ArrowRight?1:0))*2*dt;const inp=readInput();ABQ=0;abAcc=(abAcc|(inp.ab|0));
 if(TR.on){trainSlice();vs=null}
   else if((st.ph=='play'||st.ph=='pick')&&!(SET.open&&!net.on)){st.t+=dt;if(isHost)upd(dt);flushEv();vs=makeSnap();if(isHost&&net.on&&(snapT-=dt)<=0){snapT=.05;netSend({t:'snap',s:{...vs,ev:evOut.splice(0)}})}}}
 else if(net.on&&(inT-=dt)<=0){inT=.033;netSend({t:'in',i:{...inp,ab:abAcc}});abAcc=0}
 const tsc=FXS.slow>0?.35:1,zk=FXS.slow>0?Math.sin(Math.min(1,(1.3-FXS.slow)/1.3)*Math.PI):0;FXS.slow=Math.max(0,FXS.slow-dt);if(Math.abs(zk-(FXS.z||0)>.002){FXS.z=zk;cam.fov=GX.fov-16*zk;cam.updateProjectionMatrix()}
 if(vs)sync(vs,dt*tsc);updFx(dt*tsc);if(typeof arenaTick=='function')arenaTick(ts/1000);syncOverlay();updHud();radarDraw();
 const mp=vs&&vs.p.find(a=>a[0]==me),po=pm.get(me);
 if(mp){const px=po?po.position.x:mp[1],pz=po?po.position.z:mp[2],sp=Math.hypot(px-FP.lx,pz-FP.lz)/Math.max(dt,.001);FP.lx=px;FP.lz=pz;FP.bob+=Math.min(sp,14)*dt*1.4;
  const bob=mp[6]?-.7:Math.sin(FP.bob)*.04*Math.min(1,sp/8);cam.rotation.set(FP.pitch,FP.yaw+Math.PI,0);
  cam.position.set(px+(R()-.5)*st.shake*.3,1.45+bob+(R()-.5)*st.shake*.2,pz+(R()-.5)*st.shake*.3)}
 else{const a=ts/7000;cam.position.set(Math.cos(a)*36,15,Math.sin(a)*36);cam.lookAt(0,1,0)}
 st.shake*=.9;if(FP.locked&&!plWant())lockOff();vmAnim(dt*tsc);
 if(gradePass)gradePass.uniforms.time.value=(ts%1000)/1000;if((ambT-=dt)<=0){ambT=.5;const on=!!vs&&(vs.ph=='play'||vs.ph=='pick');ambient(on,on?Math.min(1,vs.e.length/40+(vs.bh>=0?.4:0)):0)}
 dust.rotation.y+=dt*.02;comp&&(GX.bloom||GX.grade)?comp.render():ren.render(sc,cam)}