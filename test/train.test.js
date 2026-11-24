// test/train.test.js – trénink AI samohrou (bez vykreslování) musí doběhnout a nesmí vyrobit NaN váhy
const { createGame } = require('./harness');
const g = createGame();
g.ev('applyOpt();startTrain(2)');
const t0 = Date.now();
let n = 0;
while (g.ev('TR.on') && Date.now() - t0 < 60000) { g.frame(); n++; }
const w = g.ev('JSON.stringify(nn.w||nn)');
const bad = /NaN|null/.test(w.slice(0, 200000));
console.log('trénink doběhl:', !g.ev('TR.on'), ' snímků:', n, ' čas:', Date.now() - t0, 'ms  NaN ve váhách:', bad);
const e = [...new Set(g.errors)];
e.slice(0, 8).forEach((x) => console.log('  ✗', x));
const okk = !g.ev('TR.on') && !bad && !e.length;
console.log(okk ? 'OK – trénink' : 'SELHÁNÍ');
process.exit(okk ? 0 : 1);
