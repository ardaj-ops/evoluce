// test/server.test.js – spustí server a ověří lobby, relé zpráv, chat, kick a úklid při odpojení
const { spawn } = require('child_process');
const path = require('path');
const WebSocket = require('ws');
const PORT = 3200 + ((Math.random() * 500) | 0);
const srv = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT, DATA_DIR: require('os').tmpdir() + '/evo-test-' + PORT } });
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗', m); } else console.log('  ✓', m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function client() {
    const ws = new WebSocket('ws://localhost:' + PORT), got = [];
    ws.on('message', (d) => got.push(JSON.parse(d)));
    ws.send2 = (o) => ws.send(JSON.stringify(o));
    ws.got = got;
    return new Promise((res) => ws.on('open', () => res(ws)));
}
const find = (c, t) => c.got.find((m) => m.t === t);
(async () => {
    await wait(1200);
    const A = await client(), B = await client();
    A.send2({ t: 'create', name: 'test', pass: 'tajne', p: { name: 'Anna', color: 1 }, cid: 'a'.repeat(16) });
    await wait(300);
    ok(find(A, 'welcome') && find(A, 'welcome').host, 'vytvoření lobby, A je hostitel');
    B.send2({ t: 'join', room: 'test', pass: 'spatne', p: { name: 'Bob' }, cid: 'b'.repeat(16) });
    await wait(400);
    ok(find(B, 'err') && find(B, 'err').code === 'pass', 'špatné heslo odmítnuto');
    B.send2({ t: 'join', room: 'test', pass: 'tajne', p: { name: 'Bob' }, cid: 'b'.repeat(16) });
    await wait(400);
    ok(find(B, 'welcome') && !find(B, 'welcome').host, 'připojení se správným heslem');
    B.send2({ t: 'in', i: { dx: 1, dz: 0, ab: 2 } });
    A.send2({ t: 'snap', s: { ph: 'play', ev: [] } });
    await wait(300);
    ok(find(A, 'in') && find(A, 'in').i.ab === 2, 'vstup klienta dorazí hostiteli');
    ok(find(B, 'snap'), 'snímek hostitele dorazí klientovi');
    B.send2({ t: 'chat', text: 'ahoj' });
    await wait(300);
    ok(A.got.some((m) => m.t === 'chat' && m.text === 'ahoj'), 'chat');
    const bid = find(B, 'welcome').id;
    A.send2({ t: 'kick', id: bid });
    await wait(300);
    ok(find(B, 'kicked'), 'kick');
    const C = await client();
    C.send2({ t: 'list' });
    await wait(300);
    ok(find(C, 'lobbies').list.some((l) => l.name === 'test'), 'lobby je v seznamu');
    A.close(); // hostitel zavře kartu bez „leave“ → lobby musí zaniknout
    await wait(500);
    C.got.length = 0;
    C.send2({ t: 'list' });
    await wait(300);
    ok(!find(C, 'lobbies').list.some((l) => l.name === 'test'), 'lobby zanikne po odpojení hostitele');
    [B, C].forEach((c) => c.close());
    srv.kill();
    console.log(fails ? '\nSELHÁNÍ: ' + fails : '\nOK – server');
    process.exit(fails ? 1 : 0);
})();
