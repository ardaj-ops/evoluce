// js/core/loop.js – hlavní smyčka: simulace (hostitel), síť, vykreslení, kamera
let chatT = 0, lbT = 0, rcT = 0, last = 0, snapT = 0, inT = 0, ambT = 0, fpsN = 0, fpsT = 0;

// vstup lokálního hráče → jeho objekt ve hře (hostitel / sólo); zbytek hráčů dodává síť
function applyLocalInput(inp) {
    const p = P[me];
    if (!p) return;
    const i = p.inp;
    i.dx = inp.dx || 0;
    i.dz = inp.dz || 0;
    i.ax = inp.ax || 0;
    i.az = inp.az || 0;
    i.f = inp.f | 0;
    i.ds = inp.ds | 0;
    i.sw = inp.sw | 0;
    i.rl = inp.rl | 0;
    i.ex = inp.ex | 0;
    i.ab = (i.ab | 0) | abAcc; // schopnosti se hromadí, dokud je simulace nespotřebuje
    abAcc = 0;
}

function loop(ts) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;

    // FPS
    fpsN++;
    fpsT += dt;
    if (fpsT >= 0.5) {
        if (GX.fps) $('fps').textContent = Math.round(fpsN / fpsT) + ' FPS';
        fpsN = 0;
        fpsT = 0;
    }

    // v menu: obnovování seznamu lobby a opětovné připojení k serveru
    if (!net.on && st.ph == 'menu') {
        if (net.ws && net.ws.readyState == 1) {
            if ((lbT -= dt) <= 0) {
                lbT = 3;
                netSend({ t: 'list' });
            }
        } else if (LB.conn == 'off' && (rcT -= dt) <= 0) {
            rcT = 5;
            netOpen();
        }
    }
    if ((chatT -= dt) <= 0) {
        chatT = 0.5;
        chatOverlay();
    }

    // vstup
    if (plWant()) FP.yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 2 * dt;
    const inp = readInput();
    abAcc |= inp.ab | 0;
    ABQ = 0;

    // simulace / síť
    if (TR.on) {
        trainSlice();
        vs = null;
    } else if ((st.ph == 'play' || st.ph == 'pick') && !(SET.open && !net.on)) {
        st.t += dt;
        if (isHost) {
            applyLocalInput(inp);
            upd(dt);
        }
        flushEv();
        if (isHost) vs = makeSnap();
        if (isHost && net.on && (snapT -= dt) <= 0) {
            snapT = 0.05;
            netSend({ t: 'snap', s: { ...vs, ev: evOut.splice(0) } });
        }
    } else if (net.on && !isHost && (inT -= dt) <= 0) {
        inT = 0.033;
        netSend({ t: 'in', i: { ...inp, ab: abAcc } });
        abAcc = 0;
    }

    // zpomalení času při exekuci + plynulé „přiblížení“ zorného pole
    const slow = FXS.slow > 0;
    const tsc = slow ? 0.35 : 1;
    const zk = slow ? Math.sin(Math.min(1, (1.3 - FXS.slow) / 1.3) * Math.PI) : 0;
    FXS.slow = Math.max(0, FXS.slow - dt);
    FXS.z = (FXS.z || 0) + (zk - (FXS.z || 0)) * Math.min(1, dt * 10);
    if (Math.abs(FXS.z) < 0.0005) FXS.z = 0;

    // vykreslení
    if (vs) sync(vs, dt * tsc);
    else if (pm.size || emap.size) clearView();
    updDying(dt * tsc);
    updFx(dt * tsc);
    if (typeof arenaTick == 'function') arenaTick(ts / 1000);
    syncOverlay();
    updHud();
    radarDraw();

    // kamera
    const mp = vs && vs.p.find((a) => a[0] == me),
        po = pm.get(me);
    if (mp) {
        const px = po ? po.position.x : mp[1],
            pz = po ? po.position.z : mp[2],
            vx = (px - FP.lx) / Math.max(dt, 0.001),
            vz = (pz - FP.lz) / Math.max(dt, 0.001),
            sp = Math.hypot(vx, vz),
            lat = vx * -Math.cos(FP.yaw) + vz * Math.sin(FP.yaw); // rychlost do strany (doprava = +)
        FP.lx = px;
        FP.lz = pz;
        FP.spd = sp;
        FP.bob += Math.min(sp, 14) * dt * 1.4;
        FP.roll += (cl((-lat / 10) * 0.03, -0.04, 0.04) - FP.roll) * Math.min(1, dt * 8); // náklon při úkroku
        if (mp[9] === 0 && FP.dashReady === 1) FXS.dash = 1; // dash právě odstartoval
        FP.dashReady = mp[9];
        const bob = mp[6] ? -0.7 : Math.sin(FP.bob) * 0.04 * Math.min(1, sp / 8);
        cam.rotation.set(FP.pitch + (vmKick / 0.18) * 0.015, FP.yaw + Math.PI, mp[6] ? 0 : FP.roll);
        cam.position.set(
            px + (R() - 0.5) * st.shake * 0.3,
            1.45 + bob + (R() - 0.5) * st.shake * 0.2,
            pz + (R() - 0.5) * st.shake * 0.3
        );
    } else {
        const a = ts / 7000;
        cam.position.set(Math.cos(a) * 36, 15, Math.sin(a) * 36);
        cam.lookAt(0, 1, 0);
    }
    FXS.dash = Math.max(0, (FXS.dash || 0) - dt * 4);
    const fov = GX.fov - 16 * FXS.z + 9 * FXS.dash * FXS.dash; // zoom při exekuci, rozšíření při dashi
    if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
    }
    st.shake *= 0.9;
    if (FP.locked && !plWant()) lockOff();
    vmAnim(dt * tsc);
    if (gradePass) gradePass.uniforms.time.value = (ts % 1000) / 1000;

    // adaptivní hudba
    if ((ambT -= dt) <= 0) {
        ambT = 0.5;
        const on = !!vs && (vs.ph == 'play' || vs.ph == 'pick');
        ambient(on, on ? Math.min(1, vs.e.length / 40 + (vs.bh >= 0 ? 0.4 : 0)) : 0);
    }
    dust.rotation.y += dt * 0.02;
    comp && (GX.bloom || GX.grade) ? comp.render() : ren.render(sc, cam);
}
