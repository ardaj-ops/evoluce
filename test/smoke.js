// test/smoke.js – bot zahraje všechny postavy a kontroluje, že hra nespadne a nevznikne NaN
const { createGame } = require('./harness');

const g = createGame();
const { ev, frame, errors } = g;
let fails = 0;
const fail = (m) => { fails++; console.log('  ✗', m); };

if (errors.length) fail('chyby při načtení: ' + errors.join('; '));
ev('applyOpt()');

const nCls = ev('CLS.length'), only = process.argv[2] != null ? +process.argv[2] : null;
for (let c = 0; c < nCls; c++) {
    if (only != null && c !== only) continue;
    ev(`setCls(${c}); solo()`);
    let maxWave = 0, frames = +(process.env.FRAMES || 3000), picks = 0, deaths = 0;
    for (let f = 0; f < frames; f++) {
        // bot: náhodná chůze, střelba, schopnosti, přebíjení, dash, exekuce
        if (f % 40 === 0) {
            ev(`for(const k of ['KeyW','KeyA','KeyS','KeyD'])keys[BIND[{KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right'}[k]]]=0;
                keys[BIND[['up','left','down','right'][${(f / 40) | 0} % 4]]]=1;
                FP.yaw+=${(Math.sin(f) * 0.9).toFixed(3)};mouse.d=true`);
        }
        if (f % 90 === 0) ev(`ABQ|=${1 << ((f / 90) % 4 | 0)};keys[BIND.reload]=${f % 270 === 0 ? 1 : 0};keys[BIND.dash]=${f % 180 === 0 ? 1 : 0};keys[BIND.exec]=1`);
        const ph = ev('st.ph');
        if (ph === 'pick') { ev('pick(0);tal(0)'); picks++; }
        if (ph === 'over') { deaths++; ev('solo()'); }
        if (ph === 'play') maxWave = Math.max(maxWave, ev('st.wave'));
        frame();
        if (f % 300 === 0) ev('for(const id in P){P[id].hp=P[id].mhp}'); // ať se dostane dál (bosové, ability)
    }
    const bad = ev(`(()=>{const o=[];for(const id in P){const p=P[id];if(![p.x,p.z,p.hp].every(Number.isFinite))o.push('hráč');}
        for(const e of en)if(![e.x,e.z,e.hp].every(Number.isFinite))o.push('nepřítel '+e.k);return o})()`);
    console.log(`třída ${c}: vlna ${maxWave}, výběrů ${picks}, smrtí ${deaths}, nepřátel ${ev('en.length')}`);
    if (bad.length) fail('NaN: ' + bad.join(','));
}
const uniq = [...new Set(errors)];
uniq.slice(0, 15).forEach((e) => fail(e));
console.log(fails ? `\nSELHÁNÍ: ${fails}` : '\nOK – bez chyb');
process.exit(fails ? 1 : 0);
