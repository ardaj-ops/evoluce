// test/view.test.js – animace: nepřátelé se rodí a umírají, scéna se po odchodu do menu vyčistí, kamera nemá NaN
const { createGame } = require('./harness');
const g = createGame();
g.ev('applyOpt();setCls(0);solo()');
let maxDying = 0, bad = 0;
for (let f = 0; f < 1500; f++) {
    if (f % 30 === 0) g.ev('mouse.d=true;keys[BIND.left]=1;FP.yaw+=.3');
    if (g.ev('st.ph') === 'pick') g.ev('pick(0);tal(0)');
    if (f === 400 || f === 800) g.ev('if(en.length){en[0].hp=-1;killE(en[0],P[me])}'); // vynucená smrt
    g.frame();
    maxDying = Math.max(maxDying, g.ev('dying.length'));
    if (!g.ev('[cam.position.x,cam.position.y,cam.position.z,cam.rotation.x,cam.rotation.z,cam.fov].every(Number.isFinite)')) bad++;
}
const before = g.ev('pm.size+emap.size');
g.ev('quitSolo()');
for (let i = 0; i < 60; i++) g.frame();
const after = g.ev('pm.size+emap.size+dying.length');
const meshes = g.ev('sc.children.filter(o=>o.userData&&(o.userData.arch||o.userData.h)).length');
console.log('max umírajících:', maxDying, '| modely před/po odchodu do menu:', before, '→', after, '| zbylé modely ve scéně:', meshes, '| snímků s NaN kamerou:', bad);
const e = [...new Set(g.errors)];
e.forEach((x) => console.log('  ✗', x));
const ok = !e.length && maxDying > 0 && after === 0 && meshes === 0 && bad === 0;
console.log(ok ? 'OK – animace' : 'SELHÁNÍ');
process.exit(ok ? 0 : 1);
