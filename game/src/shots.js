// The screenshot scenes behind ?shot=title|run|danger|end&seed=N. Each one plays the real rules
// forward from a fresh run with a small autopilot (jump ground hazards, duck overhead ones, wait
// out oven flames, hide when the lantern finds Wattle), then holds that frame still, so the same
// seed always gives the same picture of the game as it really plays.

import { TURKEY_X, PX_PER_M, TOTAL_LENGTH, GROUND_Y } from './config.js';
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

export function buildShot(name, seed) {
  if (name === 'title') return { screen: 'title', t: 4.2 };
  if (name === 'run') {
    const run = daily(seed);
    simulate(run, 26, { keepLives: true });
    run.corn = Math.max(run.corn, 7);
    run.decoyCooldown = 0;
    tossDecoy(run, TURKEY_X - 300);
    simulate(run, 0.3);
    return { screen: 'play', run };
  }
  if (name === 'danger') {
    const run = daily(seed);
    simulate(run, 140, { untilM: 900, keepLives: true });
    // stand Wattle just before the next oven of the kitchen, its flame up, a knife on its way
    const oven = run.hazards.find((h) => h.kind === 'oven' && h.m > run.d + 6);
    if (oven) {
      run.d = oven.m - 8.2;
      run.t = OVEN_CYCLE * 50 - oven.phase + 0.3;
    }
    for (const h of run.hazards) if (h.m < run.d + 30 && h.m > run.d - 2 && h !== oven) h.m = run.d - 40;
    run.pickups.forEach((p) => { if (Math.abs(p.m - run.d) < 1.5) p.taken = true; });
    const rack = run.hazards.find((h) => h.kind === 'knifeRack' || h.kind === 'beam');
    if (rack) { rack.m = run.d + 0.4; rack.passed = true; }
    run.lives = 1;
    run.spotted = 0.93;
    run.inBeam = true;
    run.farmer.gap = 4.1;
    run.heat = 0.85; // the farmer's breath: red vignette + heartbeat
    run.farmer.state = 'sprint';
    run.farmer.sprintLeft = 2;
    run.farmer.beamAngle = -0.12;
    run.farmer.line = 'The oven is PREHEATED, Wattle!';
    run.farmer.lineLeft = 2;
    run.warnings = [];
    run.knives = [{ x: TURKEY_X - 95, y: GROUND_Y - 108, lane: 'high', passed: false }];
    run.warnings.push({ lane: 'high', life: 0.5 });
    run.ducking = true;
    run.ty = 0;
    run.vy = 0;
    run.onGround = true;
    run.corn = 12;
    run.banner = 0;
    run.invuln = 0;
    run.shake = 0;
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
