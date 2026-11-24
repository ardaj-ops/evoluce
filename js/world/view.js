// js/world/view.js – převod snímku stavu na 3D objekty (hráči jako lidé, nepřátelé jako příšery; hostitel i klienti kreslí stejně)
const BC = [0xffffff, 0xffb84d, 0xff6b6b, 0x66e0ff, 0xff7a2d, 0xffe14d],
    BS = [1, 0.8, 0.7, 1.7, 0.9, 2],
    BL = [1.4, 0.7, 1.1, 7, 0.9, 1.6];
const la = (a, b, t) => {
    const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
    return a + d * t;
};
// znaky druhů (štít, aura) – v nominálním měřítku archetypu, skupina je pak přeškálována
function mark(m, k) {
    const g = T[k].g;
    if (!g) return;
    const r = R0[m.userData.arch] || 0.8;
    if (g.pow == 'shield') {
        const o = new G.Mesh(
            new G.TorusGeometry(r * 1.5, 0.06, 6, 24),
            new G.MeshBasicMaterial({ color: 0xffffff })
        );
        o.rotation.x = Math.PI / 2;
        o.position.y = r;
        m.add(o);
    }
    if (g.pow == 'aura') {
        const o = new G.Mesh(
            new G.SphereGeometry(r * 2.2, 12, 12),
            new G.MeshBasicMaterial({
                color: T[k].c,
                transparent: true,
                opacity: 0.12,
                depthWrite: false,
            })
        );
        o.position.y = r;
        m.add(o);
    }
}
function mkEnemy(k) {
    const m = makeMonster(k);
    mark(m, k);
    sc.add(m);
    return m;
}
function crown(o, r) {
    const c = new G.Group();
    for (let i = 0; i < 7; i++) {
        const k = new G.Mesh(gK(0.12, 0.55, 5), mm(0xffd27a, 1.2));
        k.position.set(Math.cos(i * 0.897) * 0.45, 0, Math.sin(i * 0.897) * 0.45);
        c.add(k);
    }
    c.position.y = r * 2.6;
    o.add(c);
    const rg = new G.Mesh(
        new G.TorusGeometry(r * 1.7, 0.1, 8, 32),
        new G.MeshBasicMaterial({ color: 0xffd27a })
    );
    rg.rotation.x = Math.PI / 2;
    rg.position.y = 0.05;
    o.add(rg);
}
// zbraň v ruce při pohledu z první osoby (připojená ke kameře, kreslí se přes scénu)
const VM = new G.Group();
cam.add(VM);
VM.position.set(0.32, -0.3, -0.6);
let vmWp = -1,
    vmKick = 0,
    vmRl = 0,
    vmDraw = 0,
    vmYaw = 0,
    vmPitch = 0,
    vmSx = 0,
    vmSy = 0;
function vmBuild(wp) {
    while (VM.children.length) VM.remove(VM.children[0]);
    VM.userData.mag = null;
    vmWp = wp;
    vmDraw = 1; // animace vytažení zbraně
    const mm = WP[wp] && WP[wp].mel,
        c = mm ? SLC[wp - 6] || 0xffffff : 0x66e0ff;
    const add = (geo, x, y, z, col) => {
        const m = new G.Mesh(
            geo,
            new G.MeshStandardMaterial({
                color: col || 0x20284f,
                emissive: col || 0x20284f,
                emissiveIntensity: 0.5,
                roughness: 0.4,
                metalness: 0.7,
                depthTest: false,
            })
        );
        m.renderOrder = 999;
        m.position.set(x, y, z);
        VM.add(m);
        return m;
    };
    if (!mm) {
        add(new G.BoxGeometry(0.12, 0.14, 0.7), 0, 0, -0.1);
        add(new G.BoxGeometry(0.06, 0.06, 0.3), 0, 0.03, -0.55, c);
        add(new G.BoxGeometry(0.1, 0.2, 0.14), 0, -0.14, 0.1);
        VM.userData.mag = add(new G.BoxGeometry(0.08, 0.22, 0.12), 0, -0.17, -0.12, 0x3a4a8a);
        VM.userData.magY = -0.17;
    } else if (wp == 6) add(new G.BoxGeometry(0.05, 0.05, 1.3), 0, 0.15, -0.5, c);
    else if (wp == 7) {
        add(new G.BoxGeometry(0.05, 0.05, 1), 0, 0.1, -0.4);
        add(new G.BoxGeometry(0.4, 0.28, 0.25), 0, 0.12, -0.95, c);
    } else if (wp == 8) {
        add(new G.BoxGeometry(0.04, 0.04, 1.9), 0, 0.1, -0.8);
        add(new G.ConeGeometry(0.08, 0.3, 6), 0, 0.1, -1.9, c).rotation.x = -Math.PI / 2;
    } else {
        add(new G.BoxGeometry(0.04, 0.04, 0.5), 0.05, 0, -0.35, c);
        add(new G.BoxGeometry(0.04, 0.04, 0.5), -0.3, -0.05, -0.35, c);
    }
}
function vmAnim(dt) {
    VM.visible = !!(vs && (vs.ph == 'play' || vs.ph == 'pick' || vs.ph == 'over') && pm.get(me));
    vmKick = Math.max(0, vmKick - dt);
    const k = vmKick / 0.18,
        mel = WP[vmWp] && WP[vmWp].mel;
    if (mel) {
        VM.position.x = 0.32 - k * 0.9;
        VM.rotation.z = -k * 1.1;
        VM.position.z = -0.6;
        VM.rotation.x = 0;
        VM.position.y = -0.3;
    } else {
        VM.position.z = -0.6 + k * 0.18;
        VM.rotation.z = 0;
        const r = vmRl,
            mg = VM.userData.mag;
        if (r > 0) {
            const q = Math.sin(Math.PI * r);
            VM.rotation.x = -0.9 * q;
            VM.position.y = -0.3 - 0.22 * q;
            VM.position.x = 0.32 - 0.12 * q;
            if (mg) {
                const d =
                    r < 0.3 ? 0 : r < 0.55 ? (r - 0.3) / 0.25 : r < 0.8 ? 1 - (r - 0.55) / 0.25 : 0;
                mg.position.y = VM.userData.magY - d * 0.45;
            }
        } else {
            VM.rotation.x = 0;
            VM.position.y = -0.3;
            VM.position.x = 0.32;
            if (mg) mg.position.y = VM.userData.magY;
        }
    }
    // zbraň „žije“: dýchání, houpání při chůzi, zpoždění za pohybem myši, zpětný ráz a vytažení po výměně
    const w = Math.min(1, (FP.spd || 0) / 8),
        sd = Math.max(dt, 0.001),
        f = Math.min(1, dt * 10);
    vmSx += (cl(((FP.yaw - vmYaw) / sd) * 0.012, -0.07, 0.07) - vmSx) * f;
    vmSy += (cl(((vmPitch - FP.pitch) / sd) * 0.012, -0.05, 0.05) - vmSy) * f;
    vmYaw = FP.yaw;
    vmPitch = FP.pitch;
    vmDraw = Math.max(0, vmDraw - dt * 4);
    VM.position.x += vmSx + Math.sin(FP.bob * 0.5) * 0.008 * w;
    VM.position.y += Math.sin(FP.bob) * 0.012 * w + Math.sin(performance.now() / 900) * 0.004 + vmSy - vmDraw * 0.4;
    VM.rotation.y = vmSx * 2.2;
    VM.rotation.x += (mel ? 0 : k * 0.1) - vmDraw * 0.7;
}
// model chladné zbraně v ruce postavy + animace seknutí / bodnutí
function setWpn(g, wp) {
    if (g.userData.pv) {
        g.remove(g.userData.pv);
        disposeObj(g.userData.pv);
    }
    g.userData.wp = wp;
    const mm = WP[wp] && WP[wp].mel;
    if (g.userData.br) g.userData.br.visible = !mm;
    if (!mm) {
        g.userData.pv = null;
        return;
    }
    const pv = new G.Group(),
        c = SLC[wp - 6] || 0xffffff,
        mk = (geo, z) => {
            const m = new G.Mesh(geo, mt(c, 0.8));
            m.position.z = z;
            pv.add(m);
            return m;
        };
    if (wp == 6) mk(new G.BoxGeometry(0.12, 0.12, 2.4), 1.6);
    else if (wp == 7) {
        mk(new G.BoxGeometry(0.14, 0.14, 1.8), 1.2);
        mk(new G.BoxGeometry(0.9, 0.7, 0.6), 2.3);
    } else if (wp == 8) {
        mk(new G.BoxGeometry(0.1, 0.1, 3.4), 1.9);
        mk(new G.ConeGeometry(0.22, 0.7, 6), 3.8).rotation.x = Math.PI / 2;
    } else mk(new G.BoxGeometry(0.1, 0.1, 1.1), 1.3);
    pv.position.y = 1.25;
    g.add(pv);
    g.userData.pv = pv;
}
function animWpn(o, dt) {
    const pv = o.userData.pv;
    if (!pv) return;
    const mm = WP[o.userData.wp].mel;
    let k = 1;
    if (o.userData.sw > 0) {
        o.userData.sw -= dt;
        k = 1 - Math.max(0, o.userData.sw) / 0.18;
    }
    if (k >= 1) {
        pv.rotation.y = 0;
        pv.position.z = 0;
        return;
    }
    if (mm.line) {
        pv.rotation.y = 0;
        pv.position.z = Math.sin(k * Math.PI) * 1.4;
    } else {
        pv.position.z = 0;
        pv.rotation.y = mm.ang > 6 ? k * 6.28 : -mm.ang / 2 + k * mm.ang;
    }
}
function nameTex(n) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const x = c.getContext('2d');
    x.font = 'bold 34px system-ui,sans-serif';
    x.textAlign = 'center';
    x.fillStyle = 'rgba(0,0,0,.55)';
    x.fillRect(8, 6, 240, 52);
    x.fillStyle = '#fff';
    x.fillText(n, 128, 46);
    return new G.CanvasTexture(c);
}
function mkPlayer(id, cc, nm, wp) {
    const c = PCOL[cc] != null ? PCOL[cc] : COLS[(id - 1) % 4],
        g = makeHuman(c);
    const gl = new G.Mesh(
        new G.CircleGeometry(1.6, 32),
        new G.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.2, depthWrite: false })
    );
    gl.rotation.x = -Math.PI / 2;
    gl.position.y = 0.03;
    g.add(gl);
    {
        const sp = new G.Sprite(
            new G.SpriteMaterial({ map: nameTex(cleanPN(nm)), transparent: true, depthTest: false })
        );
        sp.scale.set(3.2, 0.8, 1);
        sp.position.y = 2.7;
        g.add(sp);
        g.userData.nm = sp;
    }
    setWpn(g, wp | 0);
    if (id == me) {
        const l = new G.PointLight(c, 1.4, 28);
        l.position.y = 3;
        g.add(l);
    }
    sc.add(g);
    return g;
}
const sgeo = new G.CylinderGeometry(0.09, 0.09, 1, 6).rotateX(Math.PI / 2),
    bgeo = new G.SphereGeometry(0.22, 8, 8),
    mkB = () => {
        const m = new G.Mesh(
            sgeo,
            new G.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                blending: G.AdditiveBlending,
                depthWrite: false,
            })
        );
        sc.add(m);
        return m;
    },
    mkQ = () => {
        const m = new G.Mesh(bgeo, new G.MeshBasicMaterial({ color: 0x66e0ff }));
        m.scale.setScalar(1.4);
        sc.add(m);
        return m;
    },
    mkHz = () => {
        const g = new G.Group(),
            r = new G.Mesh(
                new G.RingGeometry(3.4, 3.55, 40),
                new G.MeshBasicMaterial({ color: 0xff9d4d, side: 2 })
            ),
            d = new G.Mesh(
                new G.CircleGeometry(3.5, 40),
                new G.MeshBasicMaterial({
                    color: 0xff9d4d,
                    transparent: true,
                    opacity: 0.35,
                    side: 2,
                })
            );
        g.add(r, d);
        g.rotation.x = -Math.PI / 2;
        g.position.y = 0.05;
        g.userData.d = d;
        sc.add(g);
        return g;
    };
const shots = new Map(),
    pm = new Map(),
    emap = new Map(),
    bp = [],
    qp = [],
    hp_ = [];
// ---- animace nepřátel: zrození (vyskočení se zákmitem), reakce na zásah, smrt (zmenšení + propadnutí)
const dying = [],
    easeBack = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
function updDying(dt) {
    for (let i = dying.length - 1; i >= 0; i--) {
        const d = dying[i],
            o = d.o;
        d.t -= dt;
        const k = Math.min(1, 1 - d.t / 0.45);
        o.scale.setScalar(d.s * Math.max(0.01, 1 - k * k));
        o.position.y = -0.9 * k * k;
        o.rotation.y += dt * (4 + 10 * k);
        if (d.t <= 0) {
            sc.remove(o);
            disposeObj(o);
            dying.splice(i, 1);
        }
    }
}
// po skončení hry / odchodu do menu: odstranit všechny modely, ať nezůstanou zamrzlé ve scéně
function clearView() {
    for (const m of [pm, emap]) {
        for (const [, o] of m) {
            sc.remove(o);
            disposeObj(o);
        }
        m.clear();
    }
    for (const d of dying) {
        sc.remove(d.o);
        disposeObj(d.o);
    }
    dying.length = 0;
    [bp, qp, hp_].forEach((a) => a.forEach((m) => (m.visible = false)));
    shots.clear();
}
function pool(a, n, mk) {
    while (a.length < n) a.push(mk());
    a.forEach((m, i) => (m.visible = i < n));
}
function sync(s, dt) {
    const f = Math.min(1, dt * 20),
        seen = new Set(),
        now = performance.now();
    for (const [
        id,
        x,
        z,
        ry,
        hp,
        mh,
        dead,
        off,
        inv,
        rd_,
        wp,
        own,
        nsh,
        nm,
        cc,
        am,
        rs,
        rlf,
        exf,
        mmx,
        exr,
        cls_,
        abs_,
        tof_,
        bfl,
    ] of s.p) {
        let o = pm.get(id);
        if (!o) {
            o = mkPlayer(id, cc, nm, wp);
            pm.set(id, o);
            o.position.set(x, 0, z);
            o.userData.px = x;
            o.userData.pz = z;
        }
        const ox = o.position.x,
            oz = o.position.z;
        o.position.x += (x - ox) * f;
        o.position.z += (z - oz) * f;
        const spd = Math.hypot(o.position.x - ox, o.position.z - oz) / Math.max(dt, 0.001);
        o.rotation.y = la(o.rotation.y, ry, 0.5);
        o.visible = id != me && !(inv && !dead && ((now / 60) | 0) % 2);
        if (dead) {
            o.rotation.x += (-1.45 - o.rotation.x) * Math.min(1, dt * 8);
            o.position.y += (0.18 - o.position.y) * Math.min(1, dt * 8);
        } else {
            o.rotation.x *= 0.8;
            o.position.y = 0;
        }
        seen.add(id);
        if (o.userData.nm) o.userData.nm.visible = s.p.length > 1 && !dead;
        if (shots.has(id) && nsh > shots.get(id) && !dead) {
            muzzle(x, z, ry, wp | 0);
            o.userData.aimT = 0.5;
            if (o.userData.pv) o.userData.sw = 0.18;
            if (id == me) vmKick = 0.18;
        }
        shots.set(id, nsh | 0);
        if (o.userData.wp !== (wp | 0)) setWpn(o, wp | 0);
        if (id == me) {
            if (vmWp !== (wp | 0)) vmBuild(wp | 0);
            vmRl = rlf || 0;
        }
        {
            const ud = o.userData,
                bf = bfl || [];
            if (bf.length && !ud.bub) {
                ud.bub = new G.Mesh(
                    new G.SphereGeometry(1.5, 16, 12),
                    new G.MeshBasicMaterial({
                        color: 0x66ccff,
                        transparent: true,
                        opacity: 0.18,
                        depthWrite: false,
                    })
                );
                ud.bub.position.y = 1.1;
                ud.bub.visible = false;
                o.add(ud.bub);
                ud.aur = new G.Mesh(
                    new G.TorusGeometry(1.1, 0.06, 6, 24),
                    new G.MeshBasicMaterial({ color: 0xff9a40 })
                );
                ud.aur.rotation.x = Math.PI / 2;
                ud.aur.position.y = 0.1;
                ud.aur.visible = false;
                o.add(ud.aur);
            }
            if (ud.bub) {
                ud.bub.visible = bf.includes('dr') && !dead;
                const ar_ = ['aura', 'dmg', 'storm', 'rate', 'haste'].find((k) => bf.includes(k));
                ud.aur.visible = !!ar_ && !dead;
                if (ar_) {
                    ud.aur.material.color.setHex(
                        {
                            aura: 0xff7a2d,
                            dmg: 0xff6b6b,
                            storm: 0xffe9a0,
                            rate: 0xffd27a,
                            haste: 0xffffff,
                        }[ar_]
                    );
                    ud.aur.rotation.z += dt * 4;
                    ud.aur.scale.setScalar(1 + Math.sin(now / 120) * 0.08);
                }
            }
        }
        if (!dead) animHuman(o, dt, spd);
        animWpn(o, dt);
    }
    for (const [id, o] of pm)
        if (!seen.has(id)) {
            sc.remove(o);
            disposeObj(o);
            pm.delete(id);
        }
    seen.clear();
    (s.sp || []).forEach(([i, n, g]) => regSp(i, n, g));
    for (const [id, k, x, z, fr, fu, bs] of s.e) {
        let o = emap.get(id);
        if (!o) {
            o = mkEnemy(k);
            emap.set(id, o);
            o.position.set(x, 0, z);
            o.userData.born = 0;
            o.userData.fr = fr;
            if (!TRAIN) ring(x, z, T[k] ? T[k].c : 0xffffff, 2.4);
        }
        const ud = o.userData;
        if (bs && !ud.b) {
            ud.b = 1;
            crown(o, R0[ud.arch] || 0.8);
        }
        const ox = o.position.x,
            oz = o.position.z;
        o.position.x += (x - ox) * f;
        o.position.z += (z - oz) * f;
        const vx = o.position.x - ox,
            vz = o.position.z - oz,
            spd = Math.hypot(vx, vz) / Math.max(dt, 0.001);
        if (spd > 0.8) o.rotation.y = la(o.rotation.y, Math.atan2(vx, vz), 0.25);
        ud.t += dt;
        if (ud.anim) ud.anim(dt, Math.min(spd, 14), ud.t);
        ud.born = Math.min(1, ud.born + dt / 0.4);
        if (fr < ud.fr - 0.001) ud.hit = 0.14; // zásah: krátké „stisknutí“ modelu
        ud.fr = fr;
        ud.hit = Math.max(0, (ud.hit || 0) - dt);
        const pop = easeBack(ud.born) * (1 + (ud.hit / 0.14) * 0.14);
        o.position.y = (1 - ud.born) * -0.6;
        o.scale.setScalar(
            (ud.s0 || 1) *
                (bs ? 1.9 : 1) *
                (fu ? 1.3 + Math.sin(now / 40) * 0.2 : 1) *
                Math.max(0.01, pop)
        );
        seen.add(id);
    }
    for (const [id, o] of emap)
        if (!seen.has(id)) {
            dying.push({ o, t: 0.45, s: o.scale.x });
            emap.delete(id);
        }
    pool(bp, s.b.length, mkB);
    s.b.forEach(([x, z, w, vx, vz], i) => {
        const m = bp[i];
        m.position.set(x, 0.8, z);
        m.rotation.y = Math.atan2(vx || 0, vz || 1);
        m.scale.set(BS[w] || 1, BS[w] || 1, BL[w] || 1);
        m.material.color.setHex(BC[w] || 0xffffff);
    });
    pool(qp, s.q.length, mkQ);
    s.q.forEach(([x, z], i) => qp[i].position.set(x, 0.8, z));
    pool(hp_, s.h.length, mkHz);
    s.h.forEach(([x, z, t, d, rr], i) => {
        const g = hp_[i];
        g.scale.setScalar((rr || 3.5) / 3.5);
        g.position.x = x;
        g.position.z = z;
        const dc = g.userData.d;
        dc.scale.setScalar(d ? 1 : Math.max(0.01, 1 - t / 1.1));
        dc.material.opacity = d ? 0.7 : 0.35;
    });
}
