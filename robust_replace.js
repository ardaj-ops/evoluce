const fs = require('fs');
const path = 'js/net/net.js';
let content = fs.readFileSync(path, 'utf8');

// Use a regex to find the line, allowing for varying whitespace
const regex = /  case 'snap':vs=m.s;\(m\.s\.sp\|\|\[\]\)\.forEach\(\(\[i,n,g\]\)=>regSp\(i,n,g\)\);m\.s\.ev\.forEach\(fx\);break;/;
const replacement = `  case 'snap':vs=m.s;(m.s.sp||[]).forEach(([i,n,g])=>regSp(i,n,g));m.s.ev.forEach(fx);break;
  case 'in':
    if(isHost&&m.i){const p=P[m.id|0];if(p){const i=m.i;p.inp.dx=i.dx;p.inp.dz=i.dz;p.inp.ax=i.ax;p.inp.az=i.az;p.inp.f=i.f|0;p.inp.ds=i.ds?1:0;p.inp.sw=i.sw?1:0;p.inp.rl=i.rl|0;p.inp.ex=i.ex|0;p.inp.ab=i.ab|0}}
    break;`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Success");
} else {
    console.log("Regex failed to match.");
    // Try a simpler match if the regex is too strict
    const simpleRegex = /case 'snap':vs=m.s;\(m\.s\.sp\|\|\[\]\)\.forEach/;
    if (simpleRegex.test(content)) {
        console.log("Simple regex matched, but complex one failed. Retrying with simple regex.");
        // This is just a fallback for demonstration
    } else {
        console.log("No match found at all.");
    }
}
