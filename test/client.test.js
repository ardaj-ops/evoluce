// test/client.test.js – hostitel simuluje, klient jen vykresluje přijaté snímky (síť je nahrazena předáváním JSON)
const { createGame } = require('./harness');
const host = createGame(), cli = createGame();
host.ev('applyOpt();setCls(3);solo()');
cli.ev('applyOpt();net.on=true;isHost=false;me=2;st.ph="menu"');
let sent = 0;
for (let f = 0; f < 1800; f++) {
    if (f % 30 === 0) host.ev('mouse.d=true;keys[BIND.up]=1;FP.yaw+=.4');
    if (host.ev('st.ph') === 'pick') host.ev('pick(0);tal(0)');
    host.frame();
    if (f % 3 === 0) {
        const snap = host.ev('JSON.stringify({...vs,ev:evOut.splice(0)})');
        cli.w.__snap = snap;
        cli.ev('netMsg({t:"snap",id:1,s:JSON.parse(__snap)})');
        sent++;
    }
    cli.frame();
}
const e = [...new Set([...host.errors, ...cli.errors])];
console.log('odesláno snímků:', sent, ' hráčů u klienta:', cli.ev('pm.size'), ' nepřátel nakresleno:', cli.ev('en.length'));
e.slice(0, 10).forEach((x) => console.log('  ✗', x));
console.log(e.length ? 'SELHÁNÍ' : 'OK – klient');
process.exit(e.length ? 1 : 0);
