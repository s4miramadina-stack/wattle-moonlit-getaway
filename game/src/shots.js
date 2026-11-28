// The screenshot scenes behind ?shot=chase|title|hide|end&seed=N. Each one plays the real rules
// forward from a fresh run with a small autopilot (jump ground hazards, duck overhead ones, wait
// out oven flames, hide when the lantern finds Wattle), then holds that frame still, so the same
// seed always gives the same picture of the game as it really plays.

import { TURKEY_X, PX_PER_M, TOTAL_LENGTH, GROUND_Y, STAGES } from './config.js';
import { createParticles } from './fx/particles.js';
import { createRun, stepRun, screenX, tossDecoy } from './world/run.js';
import { ovenFlaming, OVEN_CYCLE } from './world/hazards.js';

const STEP = 1 / 60;

// screenshot runs are Daily Moon runs, pinned to day 331 so the pictures never drift
function daily(seed) {
  const run = createRun(seed, 'daily');
  run.moonDay = 331;
  return run;
}

export function autopilot(run) {
  const c = { left: false, right: false, jumpHeld: false, jumpPressed: false, duck: false, dashPressed: false };
  for (const h of run.hazards) {
    if (h.passed || h.hit) continue;
    const sx = screenX(run, h.m);
    const ahead = sx - h.spec.w / 2 - (TURKEY_X + 46);
    if (sx + h.spec.w / 2 < TURKEY_X - 44 || ahead > 300) continue;
    const lead = run.speed * PX_PER_M * 0.08;
    if (h.spec.lane === 'overhead' && ahead < 120) c.duck = true;
    if ((h.spec.lane === 'ground' || h.spec.lane === 'slick') && ahead < lead + 15 && ahead > lead - 40) c.jumpPressed = c.jumpHeld = true;
    if (h.spec.lane === 'fire') {
      const timeTo = ahead / (run.speed * PX_PER_M);
      const willFlame = ovenFlaming(h, run.t + timeTo + 0.25) || ovenFlaming(h, run.t + timeTo + 0.05);
      if (willFlame && ahead < 300) c.left = true;
      else if (ahead < lead + 15 && ahead > lead - 40) c.jumpPressed = c.jumpHeld = true;
    }
  }
  for (const k of run.knives) {
    const dx = TURKEY_X - 34 - k.x;
    if (dx > -90 && dx < 170) {
      if (k.lane === 'high') c.duck = true;
      else c.jumpPressed = c.jumpHeld = true;
    }
  }
  const busy = run.hazards.some((h) => !h.passed && !h.hit && Math.abs(screenX(run, h.m) - TURKEY_X) < 300);
  if (!busy && !c.jumpPressed && run.spotted > 0.6) {
    for (const cv of run.covers) if (Math.abs(screenX(run, cv.m) - TURKEY_X) < 60) c.duck = true;
  }
  if (c.duck) c.jumpPressed = c.jumpHeld = false;
  return c;
}

function simulate(run, seconds, { untilM = Infinity, keepLives = false } = {}) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps && run.d < untilM && !run.outcome; i++) {
    if (keepLives) run.lives = Math.max(run.lives, 2);
    // a sensible player spends corn when the lantern is on them or the farmer is close
    if ((run.spotted > 0.55 || run.farmer.gap < 4) && run.farmer.state !== 'distracted') tossDecoy(run, TURKEY_X - 260);
    stepRun(run, STEP, autopilot(run));
  }
  return run;
}

// Where a stage begins, in metres from the coop.
function stageStart(index) {
  return STAGES.slice(0, index).reduce((sum, st) => sum + st.length, 0);
}

// Hold the frame still and readable: no leftover pops, banners, flashes or shake.
function settle(run) {
  run.fx = createParticles();
  run.banner = 0;
  run.medalFlash = 0;
  run.invuln = 0;
  run.shake = 0;
  run.stun = 0;
  run.slip = 0;
  run.dashLeft = 0;
}

// Clear the stretch around Wattle so the picture shows one moment, not a pile-up.
function clearAround(run, keep, before = 20, after = 32) {
  for (const h of run.hazards) if (h !== keep && h.m > run.d - before && h.m < run.d + after) h.m = run.d - 60;
  for (const p of run.pickups) if (p.m > run.d - before && p.m < run.d + after && !(keep && Math.abs(p.m - keep.m) < 0.5)) p.taken = true;
  for (const c of run.covers) if (c.m > run.d - before && c.m < run.d + after) c.m = run.d - 60;
}

export function buildShot(name, seed) {
  if (name === 'title') return { screen: 'title', t: 4.2 };
  if (name === 'chase') {
    // the kitchen: Wattle leaps a low-thrown carving knife, the farmer sprints behind with
    // his lantern locked on, and the oven ahead is mid-flame
    const run = daily(seed);
    simulate(run, 200, { untilM: stageStart(3) + 60, keepLives: true });
    const oven = run.hazards.find((h) => h.kind === 'oven' && h.m > run.d + 6);
    run.d = oven.m - 7.6;
    run.t = OVEN_CYCLE * 60 - oven.phase + 0.35;
    clearAround(run, oven);
    settle(run);
    run.stageIndex = 3;
    run.lives = 2;
    run.corn = 9;
    run.spotted = 0.82;
    run.inBeam = true;
    run.heat = 0;
    run.farmer.gap = 7;
    run.farmer.state = 'sprint';
    run.farmer.sprintLeft = 2;
    run.farmer.windup = 0;
    run.farmer.beamAngle = -0.2;
    run.farmer.line = 'The oven is PREHEATED, Wattle!';
    run.farmer.lineLeft = 2;
    run.knives = [{ x: TURKEY_X - 70, y: GROUND_Y - 26, lane: 'low', passed: false }];
    run.warnings = [{ lane: 'low', life: 0.5 }];
    run.ducking = false;
    run.hidden = false;
    run.onGround = false;
    run.ty = 104;
    run.vy = -200;
    return { screen: 'play', run };
  }
  if (name === 'hide') {
    // the smokehouse barn: Wattle ducked into a haystack while the lantern sweeps right over it
    const run = daily(seed);
    simulate(run, 200, { untilM: stageStart(2) + 120, keepLives: true });
    clearAround(run, null);
    const stack = run.covers.find((c) => c.kind === STAGES[2].cover);
    stack.m = run.d + 0.2;
    settle(run);
    run.stageIndex = 2;
    run.lives = 3;
    run.corn = 6;
    run.hidden = true;
    run.ducking = true;
    run.onGround = true;
    run.ty = 0;
    run.spotted = 0.38;
    run.inBeam = false;
    run.heat = 0;
    run.knives = [];
    run.warnings = [];
    run.farmer.gap = 9.5;
    run.farmer.state = 'search';
    run.farmer.windup = 0;
    run.farmer.beamAngle = 0.02;
    run.farmer.line = 'Where did that bird go...';
    run.farmer.lineLeft = 2;
    run.fx.pops.push({ x: TURKEY_X + 10, y: GROUND_Y - 190, text: 'HIDDEN! +150', color: '#8fd3d1', size: 28, life: 0.9 });
    return { screen: 'play', run };
  }
  // end: a whole run played through to the Dawn Woods
  const run = daily(seed);
  simulate(run, 400, { keepLives: true });
  if (!run.outcome) {
    run.d = TOTAL_LENGTH;
    stepRun(run, STEP, autopilot(run));
  }
  run.endT = 2.5;
  return { screen: 'end', run };
}
