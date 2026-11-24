// test/check.js – statická kontrola celého klienta tak, jak ho vidí prohlížeč (všechny skripty ve společném globálním rozsahu):
// syntaktické chyby, duplicitní deklarace (let/const napříč soubory = SyntaxError), nedefinované názvy
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { ESLint } = require('eslint');
const globals = require('globals');

const ROOT = path.join(__dirname, '..');
process.chdir(ROOT);
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]);
let problems = 0;
const bad = (m) => { problems++; console.log('  ✗', m); };

const decl = {};
const names = (p, out) => {
    if (p.type === 'Identifier') out.push(p.name);
    else if (p.type === 'ObjectPattern') p.properties.forEach((q) => names(q.value || q.argument, out));
    else if (p.type === 'ArrayPattern') p.elements.forEach((q) => q && names(q, out));
    else if (p.type === 'AssignmentPattern') names(p.left, out);
    else if (p.type === 'RestElement') names(p.argument, out);
};
for (const f of files) {
    let ast;
    try { ast = acorn.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 'latest', sourceType: 'script', locations: true }); }
    catch (e) { bad(`${f}: ${e.message}`); continue; }
    for (const n of ast.body) {
        const out = [];
        let kind = null;
        if (n.type === 'FunctionDeclaration') { out.push(n.id.name); kind = 'function'; }
        else if (n.type === 'ClassDeclaration') { out.push(n.id.name); kind = 'class'; }
        else if (n.type === 'VariableDeclaration') { n.declarations.forEach((d) => names(d.id, out)); kind = n.kind; }
        out.forEach((x) => (decl[x] = decl[x] || []).push({ f, kind, line: n.loc.start.line }));
    }
}
for (const [n, a] of Object.entries(decl)) {
    if (a.length < 2) continue;
    const fatal = a.some((x) => ['let', 'const', 'class'].includes(x.kind));
    bad(`${fatal ? 'redeklarace (SyntaxError)' : 'duplicitní název'} ${n}: ` + a.map((x) => `${x.f}:${x.line}`).join(', '));
}

(async () => {
    const g = {};
    Object.keys(decl).forEach((k) => (g[k] = 'writable'));
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [{
            files: ['**/*.js'],
            languageOptions: { sourceType: 'script', ecmaVersion: 'latest', globals: { ...globals.browser, ...globals.es2021, THREE: 'readonly', ...g } },
            rules: { 'no-undef': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error' },
        }],
    });
    for (const r of await eslint.lintFiles(files))
        for (const m of r.messages) bad(`${path.relative(ROOT, r.filePath)}:${m.line} ${m.message}`);
    console.log(problems ? `\nSELHÁNÍ: ${problems}` : 'OK – statická kontrola');
    process.exit(problems ? 1 : 0);
})();
