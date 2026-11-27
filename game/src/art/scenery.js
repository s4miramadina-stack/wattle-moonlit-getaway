// Parallax backdrops for each stage of the night, plus the dawn woods Wattle runs for.

import { PAL, VIEW_W, VIEW_H, GROUND_Y } from '../config.js';
import { hash01 } from '../rng.js';

function sky(ctx, top, mid, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, top);
  g.addColorStop(0.6, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
}

function stars(ctx, scroll, t, count = 70) {
  for (let i = 0; i < count; i++) {
    const x = (hash01(i) * VIEW_W * 1.4 - scroll * 0.02) % (VIEW_W * 1.4);
    const y = hash01(i + 99) * 330;
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.fillStyle = `rgba(244,236,208,${0.35 + tw * 0.5})`;
    ctx.fillRect((x + VIEW_W * 1.4) % (VIEW_W * 1.4), y, 2, 2);
  }
}

export function drawMoon(ctx, x, y, r) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3);
  g.addColorStop(0, 'rgba(244,236,208,0.35)');
  g.addColorStop(1, 'rgba(244,236,208,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.moon;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,170,140,0.35)';
  for (const [dx, dy, rr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.1], [0.35, -0.35, 0.08]]) {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function hills(ctx, scroll, factor, baseY, amp, color, seed) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W + 20; x += 20) {
    const wx = x + scroll * factor;
    const y = baseY - amp * (0.5 + 0.5 * Math.sin(wx * 0.004 + seed)) - amp * 0.4 * Math.sin(wx * 0.011 + seed * 2);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function farmhouseSilhouette(ctx, x, y) {
  ctx.fillStyle = '#141a3f';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 70);
  ctx.lineTo(x + 55, y - 110);
  ctx.lineTo(x + 110, y - 70);
  ctx.lineTo(x + 110, y);
  ctx.fill();
  ctx.fillRect(x + 76, y - 120, 14, 30);
  ctx.fillStyle = PAL.amber;
  ctx.fillRect(x + 18, y - 56, 16, 18);
  ctx.fillRect(x + 72, y - 56, 16, 18);
  ctx.fillStyle = 'rgba(255,179,71,0.25)';
  ctx.fillRect(x + 14, y - 60, 24, 26);
  ctx.fillRect(x + 68, y - 60, 24, 26);
}

function stringLights(ctx, scroll, t, y, factor) {
  const span = 260;
  const off = (scroll * factor) % span;
  for (let s = -1; s < VIEW_W / span + 2; s++) {
    const x0 = s * span - off;
    ctx.strokeStyle = '#1a1f40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo(x0 + span / 2, y + 40, x0 + span, y);
    ctx.stroke();
    for (let k = 1; k < 8; k++) {
      const u = k / 8;
      const bx = x0 + span * u;
      const by = y + 40 * 2 * u * (1 - u) * 1;
      const on = 0.65 + 0.35 * Math.sin(t * 3 + k + s);
      ctx.fillStyle = k % 3 === 0 ? `rgba(200,50,75,${on})` : k % 3 === 1 ? `rgba(255,179,71,${on})` : `rgba(143,211,209,${on})`;
      ctx.beginPath();
      ctx.arc(bx, by + 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function cornRows(ctx, scroll, t) {
  const gap = 46;
  const off = (scroll * 0.55) % gap;
  for (let i = -1; i < VIEW_W / gap + 2; i++) {
    const x = i * gap - off;
    const h = 120 + hash01(Math.floor((i * gap + scroll * 0.55) / gap)) * 50;
    const sway = Math.sin(t * 1.6 + i) * 4;
    ctx.strokeStyle = '#2b3a3e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 20);
    ctx.quadraticCurveTo(x + sway, GROUND_Y - 20 - h / 2, x + sway * 2, GROUND_Y - 20 - h);
    ctx.stroke();
    ctx.fillStyle = '#34494a';
    for (let l = 0; l < 4; l++) {
      const ly = GROUND_Y - 40 - l * (h / 4.5);
      ctx.beginPath();
      ctx.ellipse(x + (l % 2 ? 14 : -14) + sway, ly, 18, 4, l % 2 ? -0.5 : 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function soil(ctx, scroll, top, mid, speck) {
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
  g.addColorStop(0, top);
  g.addColorStop(1, mid);
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = speck;
  for (let i = 0; i < 60; i++) {
    const x = ((hash01(i * 3.1) * 2000 - scroll) % 2000 + 2000) % 2000;
    if (x > VIEW_W) continue;
    ctx.fillRect(x, GROUND_Y + 8 + hash01(i * 7.7) * 100, 10 + hash01(i) * 16, 3);
  }
}

function drawPatch(ctx, scroll, t) {
  sky(ctx, PAL.night0, PAL.night1, PAL.dusk);
  stars(ctx, scroll, t);
  drawMoon(ctx, 980, 140, 64);
  hills(ctx, scroll, 0.08, 470, 60, '#20285e', 1);
  const fh = 700 - ((scroll * 0.08) % 2600);
  farmhouseSilhouette(ctx, fh < -200 ? fh + 2600 : fh, 450);
  hills(ctx, scroll, 0.18, 520, 40, '#182050', 4);
  stringLights(ctx, scroll, t, 300, 0.35);
  cornRows(ctx, scroll, t);
  soil(ctx, scroll, '#2a2238', '#160f20', 'rgba(143,211,209,0.18)');
  ctx.fillStyle = 'rgba(143,211,209,0.35)';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 3);
}

function drawBarn(ctx, scroll, t) {
  // plank walls lit by hanging lanterns
  ctx.fillStyle = '#2a1712';
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
  const pw = 64;
  const off = (scroll * 0.4) % pw;
  for (let i = -1; i < VIEW_W / pw + 2; i++) {
    const x = i * pw - off;
    const shade = 0.6 + hash01(Math.floor((i * pw + scroll * 0.4) / pw)) * 0.4;
    ctx.fillStyle = `rgb(${Math.floor(92 * shade)},${Math.floor(52 * shade)},${Math.floor(36 * shade)})`;
    ctx.fillRect(x + 2, 0, pw - 4, GROUND_Y);
  }
  // big X-braced door frames and a loft window with the moon
  const span = 620;
  const doff = (scroll * 0.4) % span;
  for (let i = -1; i < VIEW_W / span + 2; i++) {
    const x = i * span - doff + 120;
    ctx.fillStyle = '#121638';
    ctx.fillRect(x, 120, 150, 110);
    drawMoon(ctx, x + 100, 160, 22);
    ctx.strokeStyle = '#4a2a1c';
    ctx.lineWidth = 10;
    ctx.strokeRect(x, 120, 150, 110);
    ctx.beginPath();
    ctx.moveTo(x + 75, 120); ctx.lineTo(x + 75, 230);
    ctx.stroke();
  }
  // loft beam
  ctx.fillStyle = '#3e2418';
  ctx.fillRect(0, 60, VIEW_W, 26);
  // hanging lanterns along the beam
  const lspan = 330;
  const loff = (scroll * 0.6) % lspan;
  for (let i = -1; i < VIEW_W / lspan + 2; i++) {
    const x = i * lspan - loff + 160;
    const sw = Math.sin(t * 1.5 + i) * 6;
    ctx.strokeStyle = '#1a1010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 86);
    ctx.lineTo(x + sw, 150);
    ctx.stroke();
    const g = ctx.createRadialGradient(x + sw, 165, 4, x + sw, 165, 160);
    g.addColorStop(0, 'rgba(255,190,100,0.45)');
    g.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x + sw - 160, 5, 320, 320);
    ctx.fillStyle = PAL.amberHot;
    ctx.fillRect(x + sw - 7, 152, 14, 20);
  }
  // smoke haze from the smokehouse
  for (let i = 0; i < 6; i++) {
    const x = ((i * 300 - scroll * 0.25 + t * 20) % 1600 + 1600) % 1600 - 160;
    ctx.fillStyle = 'rgba(200,190,210,0.06)';
    ctx.beginPath();
    ctx.ellipse(x, 360 + Math.sin(t + i) * 20, 220, 50, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  soil(ctx, scroll, '#5a3c1e', '#2b1a0e', 'rgba(230,194,122,0.4)');
  ctx.fillStyle = 'rgba(230,194,122,0.5)';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 4);
}

function drawKitchen(ctx, scroll, t) {
  // teal tile wall
  ctx.fillStyle = PAL.tile;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
  const tw = 40;
  const off = (scroll * 0.45) % tw;
  ctx.strokeStyle = PAL.tileLight;
  ctx.lineWidth = 2;
  for (let i = -1; i < VIEW_W / tw + 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tw - off, 0);
    ctx.lineTo(i * tw - off, GROUND_Y);
    ctx.stroke();
  }
  for (let y = 0; y < GROUND_Y; y += tw) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  // wainscot
  ctx.fillStyle = '#7a2a33';
  ctx.fillRect(0, 430, VIEW_W, GROUND_Y - 430);
  ctx.fillStyle = '#5a1d26';
  ctx.fillRect(0, 430, VIEW_W, 10);
  // windows with the moon, shelves of jars, copper pans
  const span = 560;
  const soff = (scroll * 0.45) % span;
  for (let i = -1; i < VIEW_W / span + 2; i++) {
    const x = i * span - soff + 60;
    ctx.fillStyle = '#101538';
    ctx.fillRect(x, 110, 130, 150);
    drawMoon(ctx, x + 85, 160, 20);
    ctx.strokeStyle = PAL.cream;
    ctx.lineWidth = 8;
    ctx.strokeRect(x, 110, 130, 150);
    ctx.beginPath();
    ctx.moveTo(x + 65, 110); ctx.lineTo(x + 65, 260);
    ctx.moveTo(x, 185); ctx.lineTo(x + 130, 185);
    ctx.stroke();
    // shelf
    ctx.fillStyle = PAL.woodDark;
    ctx.fillRect(x + 220, 200, 200, 10);
    for (let j = 0; j < 5; j++) {
      ctx.fillStyle = [PAL.cranberry, PAL.amber, PAL.wheat, PAL.frost, PAL.pumpkin][j];
      ctx.fillRect(x + 232 + j * 38, 166, 24, 34);
      ctx.fillStyle = PAL.cream;
      ctx.fillRect(x + 232 + j * 38, 160, 24, 7);
    }
    // copper pans on hooks
    for (let j = 0; j < 3; j++) {
      const px = x + 250 + j * 56;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 40); ctx.lineTo(px, 70);
      ctx.stroke();
      ctx.fillStyle = PAL.copper;
      ctx.beginPath();
      ctx.arc(px, 92, 20 - j * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px - 3, 58, 6, 18);
    }
  }
  // warm wash from the ovens
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, 200);
  g.addColorStop(0, 'rgba(255,140,60,0.25)');
  g.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 200, VIEW_W, GROUND_Y - 200);
  // checker floor
  const cw = 60;
  const coff = scroll % (cw * 2);
  for (let row = 0; row < 3; row++) {
    for (let i = -2; i < VIEW_W / cw + 2; i++) {
      ctx.fillStyle = (i + row) % 2 === 0 ? '#e9dcc0' : PAL.cranberryDark;
      ctx.fillRect(i * cw - coff + row * 20, GROUND_Y + row * 40, cw, 40);
    }
  }
  ctx.fillStyle = '#3a1218';
  ctx.fillRect(0, GROUND_Y + 120, VIEW_W, VIEW_H - GROUND_Y - 120);
}

export function drawDawn(ctx, scroll, t) {
  sky(ctx, '#3b3f86', '#c86a7a', '#ffc58a');
  ctx.fillStyle = '#ffe3a8';
  ctx.beginPath();
  ctx.arc(640, GROUND_Y - 40, 90, Math.PI, 0);
  ctx.fill();
  hills(ctx, scroll, 0.1, 480, 50, '#7a4a7a', 2);
  // pine woods: freedom
  for (let i = 0; i < 26; i++) {
    const x = i * 52 + (hash01(i) * 30) - ((scroll * 0.3) % 52);
    const h = 120 + hash01(i + 5) * 90;
    ctx.fillStyle = i % 2 ? '#2e3a5a' : '#3a4a6a';
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 30, GROUND_Y - h);
    ctx.lineTo(x + 60, GROUND_Y);
    ctx.fill();
  }
  soil(ctx, scroll, '#4a5a3a', '#26301e', 'rgba(255,227,168,0.25)');
  void t;
}

export function drawBackdrop(ctx, stageId, scroll, t) {
  if (stageId === 'barn') drawBarn(ctx, scroll, t);
  else if (stageId === 'kitchen') drawKitchen(ctx, scroll, t);
  else if (stageId === 'dawn') drawDawn(ctx, scroll, t);
  else drawPatch(ctx, scroll, t);
}
