const fs = require('fs');
const path = 'js/net/net.js';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("case 'snap':")) {
        lines[i] = "  case 'snap':vs=m.s;(m.s.sp||[]).forEach(([i,n,g])=>regSp(i,n,g));m.s.ev.forEach(fx);break;\n  case 'in':\n    if(isHost&&m.i){const p=P[m.id|0];if(p){const i=m.i;p.inp.dx=i.dx;p.inp.dz=i.dz;p.inp.ax=i.ax;p.inp.az=i.az;p.inp.f=i.f|0;p.inp.ds=i.ds?1:0;p.inp.sw=i.sw?1:0;p.inp.rl=i.rl|0;p.inp.ex=i.ex|0;p.inp.ab=i.ab|0}}\n    break;";
        found = true;
        break;
    }
}

if (found) {
    fs.writeFileSync(path, lines.join('\n'));
    console.log("Success");
} else {
    console.log("Could not find the line starting with case 'snap':");
}
