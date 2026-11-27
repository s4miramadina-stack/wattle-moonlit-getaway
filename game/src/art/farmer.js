// Farmer Hollis Mudge: mustard rain slicker, flat cap, cloud of a beard, a storm lantern in one
// hand and the carving knife in the other. (x, y) is the point between his boots, facing right.

import { PAL } from '../config.js';

const SLICKER = '#d8a72e';
const SLICKER_DARK = '#9c7417';
const BOOT = '#2a3a2e';
const SKIN = '#f0b38f';

function boot(ctx, x, phase, run) {
  const lift = run ? Math.max(0, Math.sin(phase)) * 16 : 0;
  const fx = x + (run ? Math.cos(phase) * 22 : 0);
  ctx.strokeStyle = '#3d4a66';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, -70);
  ctx.lineTo((x + fx) / 2 + 4, -36 - lift * 0.4);
  ctx.lineTo(fx, -14 - lift);
  ctx.stroke();
  ctx.fillStyle = BOOT;
  ctx.beginPath();
  ctx.roundRect(fx - 12, -20 - lift, 30, 20, 6);
  ctx.fill();
}

// The lantern's world-space position for the beam, given the same arguments as drawFarmer.
export function lanternPoint(x, y, state, t, scale = 1) {
  const raise = state === 'search' ? Math.sin(t * 2.2) * 10 : 0;
  return { x: x + 48 * scale, y: y - (state === 'distracted' ? 96 : 176 + raise) * scale };
}

export function drawLantern(ctx, x, y, t, lit = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 6) * 0.08);
  if (lit) {
    const g = ctx.createRadialGradient(0, 8, 2, 0, 8, 70);
    g.addColorStop(0, 'rgba(255,210,122,0.75)');
    g.addColorStop(1, 'rgba(255,179,71,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 8, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -8, 8, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(-11, -4, 22, 5);
  ctx.fillRect(-11, 22, 22, 5);
  ctx.fillStyle = lit ? PAL.amberHot : '#776';
  ctx.fillRect(-8, 1, 16, 21);
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = 2;
  ctx.strokeRect(-8, 1, 16, 21);
  ctx.restore();
}

// state: chase | sprint | search | distracted | lunge | grab | idle
export function drawFarmer(ctx, x, y, { state = 'chase', t = 0, scale = 1, lit = true } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const run = state === 'chase' || state === 'sprint' || state === 'lunge';
  const phase = t * (state === 'sprint' ? 15 : 10);
  boot(ctx, -10, phase + Math.PI, run);
  boot(ctx, 12, phase, run);
  const bob = run ? Math.abs(Math.sin(phase)) * -5 : 0;
  ctx.translate(0, bob);
  if (state === 'distracted') ctx.rotate(0.45);
  if (state === 'lunge') ctx.rotate(0.22);

  // slicker coat, flared at the hem
  ctx.fillStyle = SLICKER_DARK;
  ctx.beginPath();
  ctx.moveTo(-34, -64);
  ctx.lineTo(38, -64);
  ctx.lineTo(28, -170);
  ctx.lineTo(-24, -170);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = SLICKER;
  ctx.beginPath();
  ctx.moveTo(-28, -68);
  ctx.lineTo(32, -68);
  ctx.lineTo(24, -168);
  ctx.lineTo(-20, -168);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = SLICKER_DARK;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(10, -150 + i * 22, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // apron with a gravy stain: he has clearly cooked turkey before
  ctx.fillStyle = PAL.cream;
  ctx.fillRect(-6, -140, 26, 60);
  ctx.fillStyle = '#a7672e';
  ctx.beginPath();
  ctx.ellipse(6, -104, 7, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // knife arm (front)
  const chop = state === 'sprint' || state === 'lunge' ? Math.sin(t * 18) * 0.5 : Math.sin(t * 5) * 0.15;
  ctx.save();
  ctx.translate(18, -156);
  ctx.rotate(-0.6 + chop);
  ctx.fillStyle = SLICKER;
  ctx.fillRect(0, -7, 46, 15);
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(50, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  // carving knife
  ctx.fillStyle = PAL.woodDark;
  ctx.fillRect(48, -22, 6, 18);
  ctx.fillStyle = '#d9e2ec';
  ctx.beginPath();
  ctx.moveTo(46, -22);
  ctx.lineTo(56, -22);
  ctx.lineTo(54, -66);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(52, -60, 2, 34);
  ctx.restore();

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.ellipse(6, -188, 20, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // beard cloud
  ctx.fillStyle = '#eef0f5';
  for (const [bx, by, r] of [[-6, -176, 12], [8, -170, 14], [22, -176, 11], [6, -160, 10], [-12, -186, 8], [24, -188, 8]]) {
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // nose
  ctx.fillStyle = '#e0706a';
  ctx.beginPath();
  ctx.arc(24, -190, 7, 0, Math.PI * 2);
  ctx.fill();
  // eye + bushy brow, angrier when he sprints
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(14, -198, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eef0f5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (state === 'sprint' || state === 'lunge' || state === 'grab') {
    ctx.moveTo(4, -210); ctx.lineTo(24, -202);
  } else if (state === 'search') {
    ctx.moveTo(4, -206); ctx.lineTo(24, -210);
  } else {
    ctx.moveTo(4, -206); ctx.lineTo(24, -205);
  }
  ctx.stroke();
  // flat cap
  ctx.fillStyle = '#4b5a3a';
  ctx.beginPath();
  ctx.ellipse(4, -208, 24, 10, -0.05, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-20, -210, 46, 6);
  ctx.beginPath();
  ctx.ellipse(28, -205, 14, 4, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // lantern arm (back), raised high
  ctx.save();
  ctx.translate(-8, -158);
  ctx.rotate(state === 'distracted' ? 0.9 : -1.15);
  ctx.fillStyle = SLICKER_DARK;
  ctx.fillRect(0, -7, 44, 14);
  ctx.restore();
  ctx.restore();

  const lp = lanternPoint(0, 0, state, t, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(0, bob);
  drawLantern(ctx, lp.x, lp.y, t, lit);
  ctx.restore();
}

// The sweeping cone of lantern light. Returns nothing; the AI owns the angle.
export function drawBeam(ctx, origin, angle, reach, spread, alert) {
  ctx.save();
  const g = ctx.createRadialGradient(origin.x, origin.y, 10, origin.x, origin.y, reach);
  g.addColorStop(0, alert ? 'rgba(255,120,110,0.5)' : 'rgba(255,214,140,0.42)');
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.arc(origin.x, origin.y, reach, angle - spread, angle + spread);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
