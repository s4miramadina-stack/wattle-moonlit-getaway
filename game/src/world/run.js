// The rules of one escape attempt: running, jumping, ducking, hiding, dashing, corn decoys,
// lantern sightings, hits, grabs, scoring, and how the night ends (caught or pardoned at dawn).

import { TUNE, TURKEY_X, GROUND_Y, PX_PER_M, STAGES, TOTAL_LENGTH } from '../config.js';
import { makeRng } from '../rng.js';
import { buildCourse, stageAt } from './course.js';
import { hazardContact } from './hazards.js';
import { pickupY } from './pickups.js';
import { createFarmer, updateFarmer, updateBeam, spotWattle, lureWithCorn, shoveBack, say } from './farmerBrain.js';
import { lanternPoint } from '../art/farmer.js';
import { createParticles, burst, popText, updateParticles } from '../fx/particles.js';
import { sfx } from '../audio.js';
import { medalFor, newStageLog, medalPoints } from './medals.js';

export const FARMER_PX_PER_M = 32;
export const BEAM_REACH = 780;
export const BEAM_SPREAD = 0.17;
export const KNIFE_SPEED = 640; // px per second across the screen

export function createRun(seed, mode = 'free') {
  const rng = makeRng(seed);
  const course = buildCourse(rng);
  return {
    seed, mode, rng, ...course,
    t: 0, d: 0, speed: TUNE.baseSpeed,
    ty: 0, vy: 0, onGround: true, jumpHold: 0, ducking: false, hidden: false,
    lives: TUNE.lives, invuln: 0, stun: 0, slip: 0,
    dashLeft: 0, dashMeter: 1,
    corn: 0, decoyCooldown: 0, score: 0,
    spotted: 0, spottedFlash: 0, inBeam: false,
    farmer: createFarmer(),
    knives: [], decoys: [], warnings: [],
    fx: createParticles(),
    stageIndex: 0, banner: 3, shake: 0,
    stats: { corn: 0, nearMisses: 0, hides: 0, decoys: 0, hits: 0, ovens: 0 },
    medals: [], stageLog: newStageLog(), medalFlash: 0, medalLast: null,
    heat: 0, // 0..1: how close the farmer's breath is; drives the red vignette and heartbeat
    outcome: null, endT: 0,
  };
}

export function screenX(run, m) {
  return TURKEY_X + (m - run.d) * PX_PER_M;
}

export function farmerScreenX(run) {
  return TURKEY_X - 40 - run.farmer.gap * FARMER_PX_PER_M;
}

export function turkeyBox(run) {
  const h = run.ducking ? 70 : 128;
  const bottom = GROUND_Y - run.ty;
  return { left: TURKEY_X - 34, right: TURKEY_X + 46, top: bottom - h, bottom };
}

export function turkeyPose(run) {
  if (run.outcome === 'escaped') return 'victory';
  if (run.stun > 0) return 'hurt';
  if (run.dashLeft > 0) return 'dash';
  if (!run.onGround) return 'jump';
  if (run.ducking) return 'duck';
  if (run.spotted > 0.7 || run.farmer.gap < 5) return 'panic';
  return 'run';
}

export function beamOrigin(run) {
  return lanternPoint(farmerScreenX(run), GROUND_Y, run.farmer.state, run.t);
}

function loseLife(run, why) {
  run.lives -= 1;
  run.stats.hits += 1;
  run.stageLog.hits += 1;
  run.invuln = TUNE.hurtInvuln;
  run.stun = TUNE.stunTime;
  run.shake = 0.35;
  sfx.hit();
  burst(run.fx, TURKEY_X, GROUND_Y - run.ty - 70, run.rng, { count: 18, colors: ['#5d6f99', '#9fb0d6', '#8fd3d1', '#fff4dc'], kind: 'feather', speed: 320, life: 1.1, size: 6, gravity: 220 });
  popText(run.fx, TURKEY_X, GROUND_Y - run.ty - 170, why, '#ff4d5e', 30);
  if (run.lives <= 0) endRun(run, 'caught');
}

// A stage is behind Wattle: its medal is decided by the log of hits and sightings in it.
function awardMedal(run) {
  const medal = medalFor(run.stageLog);
  run.medals.push(medal);
  run.score += medalPoints(medal);
  run.medalLast = medal;
  run.medalFlash = 2.2;
  run.stageLog = newStageLog();
  sfx.medal(medal);
}

function endRun(run, outcome) {
  if (run.outcome) return;
  run.outcome = outcome;
  run.endT = 0;
  if (outcome === 'escaped') {
    awardMedal(run);
    run.score += 1000 + run.lives * 300;
    sfx.escaped();
  } else {
    sfx.caught();
  }
}

export function tossDecoy(run, targetX) {
  if (run.outcome || run.corn < TUNE.decoyCost || run.decoyCooldown > 0) return false;
  run.corn -= TUNE.decoyCost;
  run.decoyCooldown = TUNE.decoyCooldown;
  run.stats.decoys += 1;
  const tx = Math.max(farmerScreenX(run) + 40, Math.min(TURKEY_X - 60, targetX));
  run.decoys.push({ x0: TURKEY_X, y0: GROUND_Y - run.ty - 80, tx, t: 0, dur: 0.65, landed: false, m: 0 });
  sfx.decoy();
  return true;
}

// controls: { left, right, jumpHeld, jumpPressed, duck, dashPressed }
export function stepRun(run, dt, controls) {
  run.t += dt;
  if (run.outcome) {
    run.endT += dt;
    updateParticles(run.fx, dt, 0);
    return;
  }
  const f = run.farmer;
  run.invuln = Math.max(0, run.invuln - dt);
  run.stun = Math.max(0, run.stun - dt);
  run.slip = Math.max(0, run.slip - dt);
  run.shake = Math.max(0, run.shake - dt);
  run.banner = Math.max(0, run.banner - dt);
  run.medalFlash = Math.max(0, run.medalFlash - dt);
  run.decoyCooldown = Math.max(0, run.decoyCooldown - dt);
  run.dashMeter = Math.min(1, run.dashMeter + dt * 0.09);

  // posture
  run.ducking = controls.duck && run.onGround;
  if (controls.jumpPressed && run.onGround && run.stun <= 0) {
    run.vy = TUNE.jumpVel;
    run.onGround = false;
    run.jumpHold = TUNE.jumpHoldTime;
    sfx.jump();
  }
  if (!run.onGround) {
    if (controls.jumpHeld && run.jumpHold > 0) {
      run.vy += TUNE.jumpHoldBoost * dt;
      run.jumpHold -= dt;
    } else run.jumpHold = 0;
    run.vy -= TUNE.gravity * dt;
    run.ty += run.vy * dt;
    if (run.ty <= 0) {
      run.ty = 0;
      run.vy = 0;
      run.onGround = true;
      sfx.land();
    }
  }
  if (controls.dashPressed && run.dashMeter >= 1 && run.dashLeft <= 0) {
    run.dashLeft = TUNE.dashTime;
    run.dashMeter = 0;
    sfx.dash();
    sfx.gobble();
    popText(run.fx, TURKEY_X + 20, GROUND_Y - 190, 'FEATHER BURST!', '#ffd27a', 28);
  }
  run.dashLeft = Math.max(0, run.dashLeft - dt);

  // cover
  const box = turkeyBox(run);
  let inCover = null;
  for (const c of run.covers) {
    const sx = screenX(run, c.m);
    if (Math.abs(sx - (TURKEY_X + 6)) < c.spec.w / 2 - 10) inCover = c;
  }
  const wasHidden = run.hidden;
  run.hidden = !!inCover && run.ducking;
  if (run.hidden && !wasHidden) {
    sfx.hide();
    if (run.spotted > 0.55) {
      run.stats.hides += 1;
      run.score += 150;
      popText(run.fx, TURKEY_X, GROUND_Y - 160, 'HIDDEN! +150', '#8fd3d1', 26);
    }
  }

  // speed
  const stage = stageAt(run.d);
  if (stage.index !== run.stageIndex) {
    awardMedal(run);
    run.stageIndex = stage.index;
    run.banner = 2.6;
    sfx.stage();
    say(f, STAGES[stage.index].farmerLine, 2.6);
  }
  let v = Math.min(TUNE.maxSpeed, TUNE.baseSpeed + run.d * TUNE.speedGain);
  if (controls.right) v += 1.3;
  if (controls.left) v -= 2.4;
  if (run.ducking) v *= run.hidden ? TUNE.hideSpeedMul : TUNE.duckSpeedMul;
  if (run.slip > 0) v *= 0.55;
  if (run.stun > 0) v *= 0.3;
  if (run.dashLeft > 0) v += TUNE.dashSpeedAdd;
  run.speed = Math.max(1.5, v);
  run.d += run.speed * dt;
  run.score += run.speed * dt;

  // lantern sightline
  const origin = beamOrigin(run);
  const cx = TURKEY_X + 6;
  const cy = GROUND_Y - run.ty - 60;
  const target = Math.atan2(cy - origin.y, cx - origin.x);
  updateBeam(f, dt, target);
  const dist = Math.hypot(cx - origin.x, cy - origin.y);
  run.inBeam = !run.hidden && f.state !== 'distracted' && dist < BEAM_REACH && Math.abs(target - f.beamAngle) < BEAM_SPREAD;
  if (run.inBeam) run.spotted += TUNE.spotRise * dt * STAGES[run.stageIndex].spotMul;
  else run.spotted -= (run.hidden ? TUNE.spotHideFall : TUNE.spotFall) * dt;
  run.spotted = Math.max(0, Math.min(1, run.spotted));
  if (run.spotted >= 1 && f.state !== 'sprint' && f.state !== 'lunge') {
    spotWattle(f);
    run.stageLog.sightings += 1;
    sfx.spotted();
    run.spottedFlash = 1;
    popText(run.fx, TURKEY_X, GROUND_Y - 200, 'SPOTTED!', '#ff4d5e', 34);
  }
  run.spottedFlash = Math.max(0, run.spottedFlash - dt);

  // farmer
  const events = updateFarmer(f, dt, { turkeySpeed: run.speed, stageIndex: run.stageIndex, spotted: run.spotted, rng: run.rng, allowThrow: run.d > 40 });
  for (const e of events) {
    if (e.type === 'windup') run.warnings.push({ lane: e.lane, life: 0.75 });
    if (e.type === 'throw') {
      run.knives.push({ x: farmerScreenX(run) + 60, y: e.lane === 'high' ? GROUND_Y - 108 : GROUND_Y - 26, lane: e.lane, passed: false });
      sfx.knife();
    }
    if (e.type === 'grab') {
      if (run.invuln > 0 || run.dashLeft > 0) {
        shoveBack(f);
      } else {
        loseLife(run, 'GRABBED!');
        shoveBack(f);
        if (!run.outcome) popText(run.fx, TURKEY_X, GROUND_Y - 220, 'wriggled free!', '#fff4dc', 22);
      }
    }
  }
  run.warnings = run.warnings.filter((w) => (w.life -= dt) > 0);

  // the farmer's breath: inside 6 m the screen reddens and a heartbeat speeds up
  const heatTarget = f.state === 'distracted' ? 0 : Math.max(0, Math.min(1, (6 - f.gap) / 4.4));
  run.heat += (heatTarget - run.heat) * Math.min(1, dt * 5);
  if (run.heat > 0.15) {
    run.beatT = (run.beatT || 0) - dt;
    if (run.beatT <= 0) {
      sfx.heartbeat(run.heat);
      run.beatT = 0.95 - run.heat * 0.55;
    }
  }

  // thrown knives fly right relative to the scrolling world
  for (const k of run.knives) {
    k.x += KNIFE_SPEED * dt;
    const hit = k.x > box.left - 10 && k.x < box.right && k.y > box.top && k.y < box.bottom;
    if (hit && run.invuln <= 0 && run.dashLeft <= 0 && !run.outcome) {
      k.dead = true;
      loseLife(run, 'CARVED!');
    } else if (!k.passed && k.x > box.right) {
      k.passed = true;
      if (Math.abs(k.y - (box.top + box.bottom) / 2) < 70) nearMiss(run);
    }
  }
  run.knives = run.knives.filter((k) => !k.dead && k.x < 1400);

  // corn decoys in flight
  for (const dcy of run.decoys) {
    dcy.t += dt;
    if (!dcy.landed && dcy.t >= dcy.dur) {
      dcy.landed = true;
      dcy.m = run.d + (dcy.tx - TURKEY_X) / PX_PER_M;
      if (lureWithCorn(f)) {
        run.spotted = Math.max(0, run.spotted - 0.6);
        popText(run.fx, farmerScreenX(run) + 40, GROUND_Y - 260, 'DISTRACTED!', '#ffd27a', 26);
      }
    }
  }
  run.decoys = run.decoys.filter((dcy) => !dcy.landed || screenX(run, dcy.m) > -60);

  // hazards
  for (const h of run.hazards) {
    const sx = screenX(run, h.m);
    if (sx < -200 || sx > 1500) continue;
    if (h.spec.rolls) h.m -= h.spec.rolls * dt;
    if (h.hit) continue;
    const contact = hazardContact(h, sx, box, run.t);
    if (contact === 'slip') {
      if (run.slip <= 0) popText(run.fx, TURKEY_X, GROUND_Y - 150, 'SPLAT! GRAVY', '#e6c27a', 24);
      run.slip = 0.7;
    } else if (contact === 'hit') {
      if (run.dashLeft > 0) {
        h.hit = true;
        run.score += 40;
        burst(run.fx, sx, GROUND_Y - 40, run.rng, { count: 10, colors: ['#ffd27a', '#e8732c'], speed: 300 });
      } else if (run.invuln <= 0) {
        h.hit = true;
        loseLife(run, h.kind === 'oven' ? 'ROASTED!' : 'OOF!');
      }
    } else if (!h.passed && sx + h.spec.w / 2 < box.left) {
      h.passed = true;
      if (h.kind === 'oven') {
        run.stats.ovens += 1;
        run.score += 100;
        popText(run.fx, TURKEY_X, GROUND_Y - 200, 'OVEN CLEARED +100', '#ffb347', 24);
      } else if (h.spec.lane === 'ground' && !run.onGround && run.ty < h.spec.h + 30) nearMiss(run);
    }
  }

  // pickups
  for (const p of run.pickups) {
    if (p.taken) continue;
    const sx = screenX(run, p.m);
    if (sx < box.left - 20 || sx > box.right + 20) continue;
    const py = pickupY(p);
    if (py > box.top - 30 && py < box.bottom + 10) {
      p.taken = true;
      if (p.kind === 'corn') {
        run.corn += 1;
        run.stats.corn += 1;
        run.score += 10;
        run.dashMeter = Math.min(1, run.dashMeter + 0.05);
        sfx.corn();
        burst(run.fx, sx, py, run.rng, { count: 5, colors: ['#ffd34d', '#fff4dc'], speed: 140, life: 0.4, size: 3, gravity: 0 });
      } else {
        run.lives = Math.min(TUNE.maxFeathers, run.lives + 1);
        run.score += 200;
        sfx.feather();
        popText(run.fx, sx, py - 30, '+1 FEATHER', '#ffd27a', 26);
      }
    }
  }

  updateParticles(run.fx, dt, run.speed * PX_PER_M);
  if (run.d >= TOTAL_LENGTH) endRun(run, 'escaped');
}

function nearMiss(run) {
  run.stats.nearMisses += 1;
  run.score += 50;
  sfx.nearMiss();
  popText(run.fx, TURKEY_X + 40, GROUND_Y - 175, 'CLOSE SHAVE +50', '#8fd3d1', 22);
}

export function metresLeft(run) {
  return Math.max(0, Math.ceil(TOTAL_LENGTH - run.d));
}
