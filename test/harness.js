// test/harness.js – spustí celou hru v jsdom bez grafické karty (WebGL je nahrazen atrapou)
// a umožní řídit smyčku po snímcích. Používají ho smoke testy.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

function createGame({ url = 'http://localhost:3000/', storage = {} } = {}) {
    const html = fs
        .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
        .replace(/<script[^>]*><\/script>/g, '')
        .replace(/<script>[\s\S]*?<\/script>/g, '');
    const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    const errors = [];
    w.requestAnimationFrame = () => 0;
    w.cancelAnimationFrame = () => {};
    w.WebSocket = class { constructor() { this.readyState = 3; setTimeout(() => this.onerror && this.onerror(), 0); } send() {} close() {} };
    Object.defineProperty(w, 'innerWidth', { value: 1280 });
    Object.defineProperty(w, 'innerHeight', { value: 720 });
    for (const k in storage) w.localStorage.setItem(k, storage[k]);

    // atrapa 2D kontextu (canvas v jsdom bez nativní knihovny nic nekreslí)
    const ctx2d = new Proxy({}, {
        get(t, k) {
            if (k in t) return t[k];
            if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
            if (k === 'getImageData') return (x, y, a, b) => ({ data: new Uint8ClampedArray(a * b * 4), width: a, height: b });
            if (k === 'createImageData') return (a, b) => ({ data: new Uint8ClampedArray(a * b * 4), width: a, height: b });
            if (k === 'measureText') return () => ({ width: 10 });
            return () => {};
        },
        set(t, k, v) { t[k] = v; return true; },
    });
    w.HTMLCanvasElement.prototype.getContext = function () { return ctx2d; };

    const ctx = dom.getInternalVMContext();
    const run = (code, name) => new vm.Script(code, { filename: name }).runInContext(ctx);

    // three.js (stejná verze jako v index.html)
    run(fs.readFileSync(require.resolve('three/build/three.min.js'), 'utf8'), 'three.min.js');
    const THREE = w.THREE;
    THREE.WebGLRenderer = class {
        constructor() {
            this.domElement = w.document.createElement('canvas');
            this.shadowMap = {};
            this.info = { render: { calls: 0 } };
            this.capabilities = { getMaxAnisotropy: () => 8 };
        }
        setSize() {} setPixelRatio() {} setClearColor() {} dispose() {} setRenderTarget() {}
        render() { this.info.render.calls++; }
    };
    THREE.PMREMGenerator = class { constructor() { throw new Error('bez WebGL'); } };

    const html0 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const files = [...html0.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]);
    for (const f of files) {
        if (f === 'js/main.js') continue; // smyčku řídí test
        try { run(fs.readFileSync(path.join(ROOT, f), 'utf8'), f); }
        catch (e) { errors.push(`${f}: ${e.message}`); }
    }
    const ev = (code) => run(code, 'test-eval');
    let ts = 1000;
    const frame = (dt = 1 / 60) => {
        ts += dt * 1000;
        try { ev(`loop(${ts})`); } catch (e) { errors.push('loop: ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
    };
    return { dom, w, ev, frame, errors, files };
}

module.exports = { createGame, ROOT };
