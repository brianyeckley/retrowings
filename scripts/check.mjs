// Sanity checks for the game, run in CI before an image is published.
//   node scripts/check.mjs
// 1. The game script parses.
// 2. The simulation (the "SIM" section of index.html, no rendering) builds the world,
//    every course resolves onto dry land, and each vehicle behaves within expected ranges.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) failures++; };

// 1. Syntax
const moduleSrc = html.split('<script type="module">')[1].split('</script>')[0];
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rw-')), 'game.mjs');
fs.writeFileSync(tmp, moduleSrc);
try { execFileSync(process.execPath, ['--check', tmp]); check(true, 'game script parses'); }
catch (e) { check(false, 'game script parses\n' + e.stderr); }

// 2. Simulation
const sim = html.split('// ======== SIM START ========')[1].split('// ======== SIM END ========')[0];
const S = new Function(sim + '; return { createWorld, prepareCourse, SIMS, ringCross, landingScore, computeScore, LEVELS, LEVEL_ORDER };')();

// every level: the world builds and each course sits sensibly on its terrain
for (const id of S.LEVEL_ORDER) {
  const Wl = S.createWorld(id);
  check(Wl.trees.length > 1000, `${id}: world builds (${Wl.trees.length} plants)`);
  for (const key of Object.keys(S.LEVELS[id].courses)) {
    const c = S.prepareCourse(key, Wl);
    check(!Wl.isWater(c.target.x, c.target.z), `${id} ${key}: landing spot is on dry land`);
    if (c.spawn.ground) check(!Wl.isWater(c.spawn.x, c.spawn.z), `${id} ${key}: start is on dry land`);
    check(c.rings.every(r => r.c.y - Wl.surfaceAt(r.c.x, r.c.z) > r.r * 0.9), `${id} ${key}: every ring clears the ground`);
    if (c.landing.type === 'target') {
      const g = Wl.groundAt(c.target.x, c.target.z), flat = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dz]) => Math.abs(Wl.groundAt(c.target.x + dx * c.landing.r, c.target.z + dz * c.landing.r) - g) < 1.5);
      check(flat, `${id} ${key}: the bullseye is flat`);
    }
  }
}
// the physics checks below run on the Heartland
const W = S.createWorld('heartland');

const neutral = () => ({ lx: 0, ly: 0, rx: 0, ry: 0, l1: 0, r1: 0, r2: 0, cross: false, square: false, crossP: false });
const run = (key, ctl, T, spawn, thermals = true, stop = null) => {
  const c = S.prepareCourse(key, W); W.thermals = thermals ? c.thermals : [];
  const s = new S.SIMS[key](W); s.reset(spawn ? spawn(c) : c.spawn);
  let t = 0;
  while (t < T && !s.done && !(stop && stop(s))) { s.update(1 / 120, Object.assign(neutral(), ctl(t, s, c))); t += 1 / 120; }
  return { s, c };
};


{ const { s } = run('plane', (t) => ({ cross: t < 3, ly: t > 6 && t < 7 ? 0.5 : 0 }), 20);
  check(s.airborne && !s.done, `plane takes off at full throttle with a gentle pull (alt ${s.agl.toFixed(0)} m)`); }
{ const { s } = run('glider', () => ({}), 20, null, false);
  const sink = -s.vel.y; check(sink > 1 && sink < 2.5 && s.v > 12 && s.v < 16, `glider (still air) trims at ${s.v.toFixed(1)} m/s, sink ${sink.toFixed(2)} m/s`); }
{ // circling 60 m off a thermal's center should still climb most of its height quickly (inflow draws you in)
  const c0 = S.prepareCourse('glider', W);
  for (const [k, th] of c0.thermals.entries()) {
    const climb = th.top - 180;
    let t = 0; const { s } = run('glider', (tt) => { t = tt; return { lx: 0.55 }; }, 120, () => ({ x: th.x + 60, z: th.z, y: th.base + 80, yaw: 0, speed: 14 }), true, s => s.pos.y - th.base - 80 >= climb);
    check(s.pos.y - th.base - 80 >= climb && t < 40, `thermal ${k + 1}: climbs ${climb} m in ${t.toFixed(0)} s (limit 40 s)`);
  }
  // easy-course rule (Heartland only): rings sit in calm air, outside every thermal's lift and inflow
  for (const [i, r] of c0.rings.entries()) {
    W.thermals = c0.thermals; const inflow = W.thermalInflow(r.c);
    check(W.thermalLift(r.c) === 0 && inflow.x === 0 && inflow.z === 0, `glider ring ${i + 1} is in calm air (${Math.min(...c0.thermals.map(t => Math.hypot(t.x - r.c.x, t.z - r.c.z))).toFixed(0)} m from the nearest thermal)`);
  }
}
{ const { s } = run('jetpack', (t) => ({ r2: t < 2 ? 0.7 : 0.48 }), 12);
  check(s.agl > 5 && Math.abs(s.vel.y) < 4, `jetpack hovers near half thrust (vs ${s.vel.y.toFixed(1)} m/s)`); }
{ const { s } = run('jetpack', (t) => ({ r2: 1, ly: t > 2 ? -1 : 0 }), 8);
  check(s.leanF > 1.2 && s.vel.len() > 30, `jetpack full lean flies flat out (${s.vel.len().toFixed(0)} m/s)`); }
{ const { s } = run('skydive', (t, s) => ({ crossP: s.phase === 'free' && s.agl < 450 }), 200);
  check(s.done && s.done.type === 'landed', `skydive with chute at 450 m lands safely (${s.done && s.done.type})`); }
{ // canopy: brisk default glide; brakes slow you down but sink you faster; a flare near the ground lands softly
  const fly = (ly, T) => run('skydive', (t, s) => ({ crossP: s.phase === 'free' && s.agl < 500, ly: s.phase === 'free' ? 0 : ly }), 200, null, true, s => s.phase === 'canopy' && (s.__t = (s.__t || 0) + 1 / 120) > T).s;
  const n = fly(0, 10), b = fly(1, 10);
  check(n.vel.lenH() > 15, `canopy glides forward at ${(n.vel.lenH() * 2.237).toFixed(0)} mph`);
  check(b.vel.lenH() < n.vel.lenH() * 0.5 && -b.vel.y > -n.vel.y + 2, `canopy brakes: ${(b.vel.lenH() * 2.237).toFixed(0)} mph forward, sinking ${(-b.vel.y).toFixed(1)} vs ${(-n.vel.y).toFixed(1)} m/s`);
  const { s: f } = run('skydive', (t, s) => ({ crossP: s.phase === 'free' && s.agl < 500, ly: s.phase !== 'free' && s.agl < 4 ? 1 : 0 }), 300);
  check(f.done && f.done.type === 'landed' && f.done.vs < 5.5 && f.done.hs < 13.5, `canopy flare at 4 m lands softly (${f.done && f.done.vs.toFixed(1)} m/s down)`); }

const r = { c: { x: 0, y: 0, z: 0 }, n: { x: 0, y: 0, z: -1 }, r: 10 };
check(!!S.ringCross({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 }, r) && !S.ringCross({ x: 20, y: 1, z: 1 }, { x: 20, y: 1, z: -1 }, r), 'ring pass detection');

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
