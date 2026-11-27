// Farmer Hollis Mudge's brain: how far behind he is, where his lantern points,
// when he spots Wattle, when he sprints, throws a knife, falls for a corn decoy or grabs.

import { TUNE } from '../config.js';

export function createFarmer() {
  return {
    gap: TUNE.farmerStartGap, // metres behind Wattle
    state: 'chase', // chase | sprint | search | distracted | lunge
    sprintLeft: 0,
    distractLeft: 0,
    beamAngle: 0.2,
    beamPhase: 0,
    throwCooldown: 3.5,
    windup: 0,
    windupLane: 'high',
    lungeLeft: 0,
    line: '',
    lineLeft: 0,
  };
}

export function say(farmer, text, time = 2.2) {
  farmer.line = text;
  farmer.lineLeft = time;
}

// Beam aim: a slow sweep across the ground ahead; locked onto Wattle while sprinting.
export function updateBeam(farmer, dt, targetAngle) {
  farmer.beamPhase += dt * (farmer.state === 'search' ? 1.9 : 1.25);
  let aim = 0.18 + Math.sin(farmer.beamPhase) * 0.34;
  if (farmer.state === 'sprint' || farmer.state === 'lunge') aim = targetAngle;
  if (farmer.state === 'distracted') aim = 1.2;
  farmer.beamAngle += (aim - farmer.beamAngle) * Math.min(1, dt * 6);
}

export function farmerSpeed(farmer, stageIndex, turkeySpeed) {
  if (farmer.state === 'distracted') return 0.6;
  let v = TUNE.farmerBase + stageIndex * 0.45;
  if (farmer.state === 'sprint' || farmer.state === 'lunge') v += TUNE.farmerSprintAdd;
  if (farmer.gap > 19) v = Math.max(v, turkeySpeed + 1.4); // he never falls hopelessly behind
  return v;
}

// One AI step. Returns events the run reacts to.
export function updateFarmer(farmer, dt, ctx) {
  const ev = [];
  farmer.lineLeft = Math.max(0, farmer.lineLeft - dt);
  if (farmer.state === 'distracted') {
    farmer.distractLeft -= dt;
    if (farmer.distractLeft <= 0) {
      farmer.state = 'search';
      say(farmer, 'Hey! That was CORN!');
    }
  } else if (farmer.state === 'sprint') {
    farmer.sprintLeft -= dt;
    if (farmer.sprintLeft <= 0) {
      farmer.state = 'search';
      say(farmer, 'Where did that bird go...');
    }
  } else if (farmer.state === 'search' && ctx.spotted < 0.2) {
    farmer.state = 'chase';
  }

  const v = farmerSpeed(farmer, ctx.stageIndex, ctx.turkeySpeed);
  farmer.gap += (ctx.turkeySpeed - v) * dt;
  farmer.gap = Math.min(TUNE.farmerMaxGap, farmer.gap);

  // knife throws: telegraphed with a wind-up so the player can read the lane
  if (farmer.state !== 'distracted') {
    if (farmer.windup > 0) {
      farmer.windup -= dt;
      if (farmer.windup <= 0) ev.push({ type: 'throw', lane: farmer.windupLane });
    } else {
      farmer.throwCooldown -= dt * (ctx.stageIndex >= 2 ? 1.35 : ctx.stageIndex === 1 ? 1.1 : 0.85);
      if (farmer.throwCooldown <= 0 && ctx.allowThrow && farmer.gap < 18) {
        farmer.windup = 0.75;
        farmer.windupLane = ctx.rng.chance(0.5) ? 'high' : 'low';
        farmer.throwCooldown = ctx.rng.range(3.2, 5.5);
        ev.push({ type: 'windup', lane: farmer.windupLane });
      }
    }
  }

  if (farmer.gap <= 1.6 && farmer.state !== 'distracted') {
    farmer.state = 'lunge';
    ev.push({ type: 'grab' });
  }
  return ev;
}

export function spotWattle(farmer) {
  if (farmer.state === 'distracted') return;
  farmer.state = 'sprint';
  farmer.sprintLeft = TUNE.sprintTime;
  say(farmer, 'THERE you are, Wattle!');
}

export function lureWithCorn(farmer) {
  if (farmer.state === 'lunge') return false;
  farmer.state = 'distracted';
  farmer.distractLeft = TUNE.decoyDistract + 0.4;
  farmer.windup = 0;
  say(farmer, 'Ooh... free corn?', TUNE.decoyDistract);
  return true;
}

export function shoveBack(farmer) {
  farmer.gap = 9;
  farmer.state = 'search';
  farmer.windup = 0;
}
