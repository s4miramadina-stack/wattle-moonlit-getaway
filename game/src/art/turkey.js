// Wattle, a nervous slate-blue heritage turkey in a hand-knitted cranberry scarf.
// Drawn entirely with canvas paths, facing right, (x, y) is the point between the feet.

import { PAL } from '../config.js';

function tailFan(ctx, spread, t, squash) {
  const feathers = 9;
  for (let i = 0; i < feathers; i++) {
    const a = -Math.PI * 0.95 + (i / (feathers - 1)) * Math.PI * 0.75 * spread + Math.sin(t * 9 + i) * 0.03;
    ctx.save();
    ctx.rotate(a);
    ctx.scale(1, squash);
    const len = 64 + (i % 2) * 6;
    ctx.fillStyle = PAL.slateDark;
    ctx.beginPath();
    ctx.ellipse(len * 0.5, 0, len * 0.55, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.slate;
    ctx.beginPath();
    ctx.ellipse(len * 0.5, 0, len * 0.42, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.frost;
    ctx.fillRect(len * 0.72, -6, 6, 12);
    ctx.fillStyle = PAL.cream;
    ctx.beginPath();
    ctx.ellipse(len * 0.98, 0, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function leg(ctx, x, phase, lift) {
  ctx.strokeStyle = PAL.pumpkin;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const knee = { x: x + Math.cos(phase) * 8, y: -26 + lift * 0.5 };
  const foot = { x: x + Math.cos(phase) * 18, y: Math.min(0, -Math.max(0, Math.sin(phase)) * 14 - lift) };
  ctx.beginPath();
  ctx.moveTo(x, -40);
  ctx.lineTo(knee.x, knee.y);
  ctx.lineTo(foot.x, foot.y);
  ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(foot.x - 7, foot.y);
  ctx.lineTo(foot.x + 10, foot.y + 1);
  ctx.moveTo(foot.x, foot.y);
  ctx.lineTo(foot.x + 6, foot.y - 5);
  ctx.stroke();
}

function scarf(ctx, t, speed) {
  ctx.fillStyle = PAL.cranberry;
  ctx.beginPath();
  ctx.ellipse(28, -92, 17, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // the long end streams behind, more the faster Wattle runs
  const wave = Math.sin(t * 14) * 6;
  const reach = 40 + speed * 30;
  ctx.beginPath();
  ctx.moveTo(18, -94);
  ctx.quadraticCurveTo(18 - reach * 0.5, -104 + wave, 18 - reach, -98 - wave);
  ctx.lineTo(18 - reach + 4, -86 - wave);
  ctx.quadraticCurveTo(18 - reach * 0.5, -90 + wave, 22, -84);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.cream;
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const px = 18 - (reach * i) / 4;
    ctx.beginPath();
    ctx.moveTo(px, -100 + wave * (i / 4));
    ctx.lineTo(px + 2, -89 + wave * (i / 4));
    ctx.stroke();
  }
  ctx.fillStyle = PAL.cranberryDark;
  ctx.beginPath();
  ctx.ellipse(28, -88, 15, 4, -0.2, 0, Math.PI);
  ctx.fill();
}

function head(ctx, mood, t) {
  // neck
  ctx.fillStyle = PAL.slateLight;
  ctx.beginPath();
  ctx.moveTo(18, -80);
  ctx.quadraticCurveTo(26, -110, 38, -122);
  ctx.lineTo(50, -114);
  ctx.quadraticCurveTo(38, -100, 36, -82);
  ctx.closePath();
  ctx.fill();
  // head
  ctx.fillStyle = '#c9d4ee';
  ctx.beginPath();
  ctx.ellipse(46, -124, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  // beak
  ctx.fillStyle = PAL.amber;
  ctx.beginPath();
  ctx.moveTo(59, -128);
  ctx.lineTo(74, -122);
  ctx.lineTo(59, -118);
  ctx.closePath();
  ctx.fill();
  if (mood === 'shout' || mood === 'panic') {
    ctx.fillStyle = PAL.cranberryDark;
    ctx.beginPath();
    ctx.moveTo(60, -120);
    ctx.lineTo(72, -114);
    ctx.lineTo(59, -114);
    ctx.fill();
  }
  // snood + wattle
  const sway = Math.sin(t * 12) * 3;
  ctx.fillStyle = PAL.cranberry;
  ctx.beginPath();
  ctx.ellipse(62 + sway * 0.3, -116 + Math.abs(sway), 4, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(52, -108, 7, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // eye: big, worried, always looking a little back over the shoulder
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(48, -128, 7.5, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const look = mood === 'happy' ? 2 : -2;
  ctx.fillStyle = PAL.ink;
  if (mood === 'dizzy') {
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(44, -132); ctx.lineTo(52, -124);
    ctx.moveTo(52, -132); ctx.lineTo(44, -124);
    ctx.stroke();
  } else if (mood === 'happy') {
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(48, -126, 4.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(48 + look, -127, mood === 'panic' ? 2.4 : 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // brow
  ctx.strokeStyle = PAL.slateDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (mood === 'panic' || mood === 'shout') {
    ctx.moveTo(41, -136); ctx.lineTo(55, -141);
  } else if (mood === 'happy') {
    ctx.moveTo(41, -140); ctx.lineTo(55, -139);
  } else {
    ctx.moveTo(41, -138); ctx.lineTo(55, -137);
  }
  ctx.stroke();
}

function body(ctx, t, wingUp) {
  // round body
  ctx.fillStyle = PAL.slateDark;
  ctx.beginPath();
  ctx.ellipse(0, -62, 40, 32, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.slate;
  ctx.beginPath();
  ctx.ellipse(6, -66, 32, 24, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // breast feather scallops
  ctx.strokeStyle = PAL.slateLight;
  ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(18 + c * 9 - r * 4, -76 + r * 10, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
  }
  // wing
  ctx.save();
  ctx.translate(-4, -70);
  ctx.rotate(wingUp ? -0.9 + Math.sin(t * 20) * 0.3 : Math.sin(t * 16) * 0.12);
  ctx.fillStyle = PAL.slateDark;
  ctx.beginPath();
  ctx.ellipse(-10, 6, 26, 13, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.frostDim;
  for (let i = 0; i < 4; i++) ctx.fillRect(-30 + i * 9, 10 + i * 2, 7, 4);
  ctx.restore();
}

// pose: run | jump | duck | hurt | dash | victory | idle | panic
export function drawTurkey(ctx, x, y, { pose = 'run', t = 0, speed = 1, scale = 1, flash = false, alpha = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  if (pose === 'hurt') ctx.rotate(Math.sin(t * 30) * 0.12);
  if (pose === 'dash') {
    ctx.save();
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = 0.18 * (5 - i) * alpha;
      ctx.fillStyle = PAL.amberHot;
      ctx.beginPath();
      ctx.ellipse(-30 - i * 26, -64, 34, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  const squash = pose === 'duck' ? 0.62 : 1;
  ctx.scale(1, squash);
  const phase = t * (11 + speed * 6);
  if (pose === 'jump') {
    leg(ctx, -6, 0.6, 14);
    leg(ctx, 8, 2.2, 16);
  } else if (pose !== 'victory' && pose !== 'idle') {
    leg(ctx, -6, phase, 0);
    leg(ctx, 8, phase + Math.PI, 0);
  } else {
    leg(ctx, -6, Math.PI * 0.5, 0);
    leg(ctx, 8, Math.PI * 0.5, 0);
  }
  ctx.save();
  ctx.translate(-26, -64);
  tailFan(ctx, pose === 'duck' ? 0.75 : pose === 'victory' ? 1.18 : 1, t, 1);
  ctx.restore();
  const bob = pose === 'run' ? Math.abs(Math.sin(phase)) * -4 : 0;
  ctx.translate(0, bob);
  body(ctx, t, pose === 'jump' || pose === 'victory' || pose === 'panic');
  scarf(ctx, t, pose === 'idle' || pose === 'victory' ? 0.1 : speed);
  const mood = pose === 'hurt' ? 'dizzy' : pose === 'victory' ? 'happy' : pose === 'panic' ? 'panic' : pose === 'dash' ? 'shout' : 'worried';
  head(ctx, mood, t);
  if (flash) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(-120, -160, 220, 170);
  }
  ctx.restore();
}

// Only the eyes and the tip of the tail show while Wattle hides in cover.
export function drawHiddenTurkey(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PAL.slate;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-30 + i * 9, -86 - Math.abs(i - 2) * -4, 5, 14, (i - 2) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  const blink = Math.sin(t * 2.3) > 0.96 ? 0.2 : 1;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(24, -58, 7, 7 * blink, 0, 0, Math.PI * 2);
  ctx.ellipse(38, -58, 7, 7 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(22, -57, 2.6 * blink, 0, Math.PI * 2);
  ctx.arc(36, -57, 2.6 * blink, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
