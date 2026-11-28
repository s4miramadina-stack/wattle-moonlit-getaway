// Everything Wattle must get past: what each hazard is, how it is drawn, and how it hits.
// Positions are in world metres; the run converts them to screen pixels.

import { PAL, GROUND_Y } from '../config.js';

// kind -> shape. lane: ground (jump it), overhead (duck it), slick (jump it or skid), fire (time it)
export const HAZARD_SPEC = {
  fence: { lane: 'ground', w: 84, h: 58, label: 'fence' },
  feedTrough: { lane: 'ground', w: 100, h: 44, label: 'feed trough' },
  clothesline: { lane: 'overhead', w: 190, h: 60, gap: 84, label: 'washing line' },
  pumpkin: { lane: 'ground', w: 62, h: 50, label: 'pumpkin' },
  wheelbarrow: { lane: 'ground', w: 96, h: 58, label: 'wheelbarrow' },
  hayBale: { lane: 'ground', w: 86, h: 66, label: 'hay bale' },
  dutchOven: { lane: 'ground', w: 70, h: 52, label: 'hot pot' },
  oven: { lane: 'fire', w: 112, h: 96, label: 'oven' },
  rollingPin: { lane: 'ground', w: 74, h: 30, label: 'rolling pin', rolls: 4.5 },
  stringLights: { lane: 'overhead', w: 150, h: 26, gap: 84, label: 'lights' },
  beam: { lane: 'overhead', w: 170, h: 40, gap: 84, label: 'beam' },
  knifeRack: { lane: 'overhead', w: 130, h: 70, gap: 82, label: 'knife rack' },
  gravy: { lane: 'slick', w: 150, h: 10, label: 'gravy' },
};

export const OVEN_CYCLE = 2.4;
export const OVEN_FLAME_ON = 0.95;

export function ovenFlaming(h, t) {
  return ((t + h.phase) % OVEN_CYCLE) < OVEN_FLAME_ON;
}

export function makeHazard(kind, m, rng) {
  const spec = HAZARD_SPEC[kind];
  return { kind, m, spec, phase: rng ? rng.range(0, OVEN_CYCLE) : 0, passed: false, hit: false };
}

// Hit test against Wattle's box (screen space). Returns 'hit' | 'slip' | null.
export function hazardContact(h, sx, box, t) {
  const s = h.spec;
  const left = sx - s.w / 2;
  const right = sx + s.w / 2;
  if (box.right < left + 8 || box.left > right - 8) return null;
  if (s.lane === 'ground') {
    return box.bottom > GROUND_Y - s.h + 6 ? 'hit' : null;
  }
  if (s.lane === 'fire') {
    const top = ovenFlaming(h, t) ? GROUND_Y - s.h - 190 : GROUND_Y - s.h;
    return box.bottom > top + 6 ? 'hit' : null;
  }
  if (s.lane === 'overhead') {
    return box.top < GROUND_Y - s.gap ? 'hit' : null;
  }
  if (s.lane === 'slick') {
    return box.bottom >= GROUND_Y - 2 ? 'slip' : null;
  }
  return null;
}

function drawPumpkin(ctx, x, y, w, h) {
  const ribs = 5;
  for (let i = 0; i < ribs; i++) {
    const rx = x - w / 2 + (w / ribs) * (i + 0.5);
    ctx.fillStyle = i % 2 ? PAL.pumpkin : PAL.pumpkinDark;
    ctx.beginPath();
    ctx.ellipse(rx, y - h / 2, w / ribs + 6, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd27a';
  // a carved, glowing jack-o'-lantern face
  ctx.beginPath();
  ctx.moveTo(x - 16, y - h * 0.62); ctx.lineTo(x - 6, y - h * 0.62); ctx.lineTo(x - 11, y - h * 0.8);
  ctx.moveTo(x + 6, y - h * 0.62); ctx.lineTo(x + 16, y - h * 0.62); ctx.lineTo(x + 11, y - h * 0.8);
  ctx.fill();
  ctx.fillRect(x - 14, y - h * 0.4, 28, 6);
  ctx.fillStyle = '#3c5a2a';
  ctx.fillRect(x - 3, y - h - 10, 7, 14);
}

function drawWheelbarrow(ctx, x, y, w, h) {
  ctx.fillStyle = '#3d5a7a';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + w / 2 - 16, y - 22);
  ctx.lineTo(x - w / 2 + 10, y - 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAL.pumpkin;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x - 22 + i * 22, y - h - 6, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 18, y - 12, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.woodDark;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h + 6); ctx.lineTo(x - w / 2 - 26, y - h + 20);
  ctx.stroke();
}

function drawHayBale(ctx, x, y, w, h) {
  ctx.fillStyle = PAL.hay;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#a87a2a';
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 4, y - h + i * (h / 6));
    ctx.lineTo(x + w / 2 - 4, y - h + i * (h / 6) + 3);
    ctx.stroke();
  }
  ctx.strokeStyle = PAL.cranberryDark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - w / 4, y - h); ctx.lineTo(x - w / 4, y);
  ctx.moveTo(x + w / 4, y - h); ctx.lineTo(x + w / 4, y);
  ctx.stroke();
}

function drawDutchOven(ctx, x, y, w, h, t) {
  ctx.fillStyle = '#1e1e26';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h, w, h, 12);
  ctx.fill();
  ctx.fillStyle = '#ff6a3a';
  ctx.fillRect(x - w / 2 + 6, y - 14, w - 12, 5);
  ctx.fillStyle = '#2c2c36';
  ctx.fillRect(x - w / 2 - 6, y - h, w + 12, 10);
  ctx.fillRect(x - 8, y - h - 10, 16, 10);
  // steam
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.8 + i / 3) % 1;
    ctx.fillStyle = `rgba(240,240,255,${0.35 * (1 - k)})`;
    ctx.beginPath();
    ctx.arc(x - 12 + i * 12 + Math.sin(t * 3 + i) * 4, y - h - 14 - k * 50, 8 + k * 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOven(ctx, h, x, y, t) {
  const { w, h: hh } = h.spec;
  const flaming = ovenFlaming(h, t);
  const warn = !flaming && ((t + h.phase) % OVEN_CYCLE) > OVEN_CYCLE - 0.45;
  // flame column first so the oven sits in front of it
  if (flaming) {
    const k = ((t + h.phase) % OVEN_CYCLE) / OVEN_FLAME_ON;
    const tall = 190 * Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.5 + 0.2);
    for (let i = 0; i < 7; i++) {
      const fy = y - hh - (tall * i) / 7;
      const r = 34 - i * 3 + Math.sin(t * 25 + i) * 4;
      ctx.fillStyle = i < 2 ? 'rgba(255,240,170,0.95)' : i < 4 ? 'rgba(255,160,60,0.9)' : 'rgba(220,60,50,0.75)';
      ctx.beginPath();
      ctx.arc(x + Math.sin(t * 18 + i) * 6, fy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#d8dde6';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - hh, w, hh, 10);
  ctx.fill();
  ctx.fillStyle = '#9aa3b4';
  ctx.fillRect(x - w / 2, y - hh, w, 18);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - w / 2 + 18 + i * 25, y - hh + 9, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // glowing window
  ctx.fillStyle = flaming ? '#ffb347' : warn ? '#ff7a3a' : '#7a3420';
  ctx.beginPath();
  ctx.roundRect(x - w / 2 + 14, y - hh + 28, w - 28, hh - 46, 8);
  ctx.fill();
  ctx.strokeStyle = '#555c6a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#555c6a';
  ctx.fillRect(x - w / 2 + 20, y - hh + 22, w - 40, 5);
  // the thermometer is the timing tell
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 13px "DejaVu Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(flaming ? '450°F' : warn ? 'HOT!' : '350°F', x, y - 10);
}

function drawRollingPin(ctx, x, y, w, h, t) {
  ctx.save();
  ctx.translate(x, y - h / 2);
  ctx.fillStyle = PAL.wheat;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 12, -h / 2, w - 24, h, 10);
  ctx.fill();
  ctx.fillStyle = PAL.wood;
  ctx.fillRect(-w / 2, -6, 14, 12);
  ctx.fillRect(w / 2 - 14, -6, 14, 12);
  ctx.strokeStyle = '#b8955a';
  ctx.lineWidth = 2;
  const k = (t * 20) % 12;
  for (let i = -2; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 16 + i * 12 + k, -h / 2 + 3);
    ctx.lineTo(-w / 2 + 16 + i * 12 + k, h / 2 - 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOverhead(ctx, h, x, t) {
  const s = h.spec;
  const bottom = GROUND_Y - s.gap - 4;
  if (h.kind === 'stringLights') {
    ctx.strokeStyle = '#111530';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - s.w / 2, bottom - 70);
    ctx.lineTo(x - s.w / 2, bottom - 4);
    ctx.moveTo(x + s.w / 2, bottom - 70);
    ctx.lineTo(x + s.w / 2, bottom - 4);
    ctx.moveTo(x - s.w / 2, bottom - 8);
    ctx.quadraticCurveTo(x, bottom + 10, x + s.w / 2, bottom - 8);
    ctx.stroke();
    ctx.fillStyle = PAL.woodDark;
    ctx.fillRect(x - s.w / 2 - 5, bottom - 70, 10, GROUND_Y - bottom + 70);
    ctx.fillRect(x + s.w / 2 - 5, bottom - 70, 10, GROUND_Y - bottom + 70);
    for (let i = 1; i < 7; i++) {
      const u = i / 7;
      const on = 0.7 + 0.3 * Math.sin(t * 6 + i);
      ctx.fillStyle = i % 2 ? `rgba(255,179,71,${on})` : `rgba(200,50,75,${on})`;
      ctx.beginPath();
      ctx.arc(x - s.w / 2 + s.w * u, bottom - 8 + 36 * u * (1 - u) + 6, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (h.kind === 'beam') {
    ctx.fillStyle = PAL.woodDark;
    ctx.fillRect(x - s.w / 2, bottom - s.h, s.w, s.h);
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(x - s.w / 2, bottom - s.h, s.w, 8);
    ctx.fillRect(x - s.w / 2 + 10, 0, 16, bottom - s.h);
    // hanging smoked sausages
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = PAL.cranberryDark;
      ctx.beginPath();
      ctx.ellipse(x - s.w / 2 + 40 + i * 34, bottom + 6, 7, 14, Math.sin(t * 3 + i) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // a rack of carving knives, blades down: the farmer's prized set
    ctx.fillStyle = PAL.woodDark;
    ctx.fillRect(x - s.w / 2, bottom - s.h, s.w, 18);
    ctx.fillRect(x - 6, 0, 12, bottom - s.h);
    for (let i = 0; i < 5; i++) {
      const kx = x - s.w / 2 + 16 + i * 25;
      const sway = Math.sin(t * 4 + i) * 2;
      ctx.fillStyle = '#2a1a12';
      ctx.fillRect(kx - 4 + sway, bottom - s.h + 18, 8, 18);
      ctx.fillStyle = '#dfe6ef';
      ctx.beginPath();
      ctx.moveTo(kx - 6 + sway, bottom - s.h + 36);
      ctx.lineTo(kx + 6 + sway, bottom - s.h + 36);
      ctx.lineTo(kx + sway, bottom + 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawGravy(ctx, x, y, w) {
  ctx.fillStyle = '#8a5a2a';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, w / 2, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,160,0.5)';
  ctx.beginPath();
  ctx.ellipse(x - w / 6, y + 1, w / 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A split-rail farmyard fence, freshly whitewashed for the holiday.
function drawFence(ctx, x, y, w, h) {
  ctx.fillStyle = '#d8d2c0';
  for (const px of [x - w / 2 + 6, x + w / 2 - 14]) {
    ctx.fillRect(px, y - h - 6, 10, h + 6);
    ctx.beginPath();
    ctx.moveTo(px, y - h - 6); ctx.lineTo(px + 5, y - h - 14); ctx.lineTo(px + 10, y - h - 6);
    ctx.fill();
  }
  ctx.fillStyle = '#b9b19a';
  ctx.fillRect(x - w / 2, y - h + 8, w, 9);
  ctx.fillRect(x - w / 2, y - h + 30, w, 9);
  ctx.strokeStyle = 'rgba(11,15,36,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - h + 8, w, 9);
  ctx.strokeRect(x - w / 2, y - h + 30, w, 9);
}

// A long wooden feed trough heaped with grain (and one suspicious bucket of brine).
function drawFeedTrough(ctx, x, y, w, h) {
  ctx.fillStyle = PAL.wood;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + w / 2 - 10, y - 8);
  ctx.lineTo(x - w / 2 + 10, y - 8);
  ctx.fill();
  ctx.fillStyle = PAL.woodDark;
  ctx.fillRect(x - w / 2 + 12, y - 10, 8, 10);
  ctx.fillRect(x + w / 2 - 20, y - 10, 8, 10);
  ctx.fillStyle = PAL.wheat;
  ctx.beginPath();
  ctx.ellipse(x, y - h + 2, w / 2 - 6, 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#9fb0d6';
  ctx.fillRect(x + w / 2 - 34, y - h - 22, 22, 24);
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BRINE', x + w / 2 - 23, y - h - 6);
}

// A washing line between two posts, the farmer's long johns flapping at turkey head height.
function drawClothesline(ctx, h, x, t) {
  const s = h.spec;
  const lineY = GROUND_Y - s.gap - s.h;
  ctx.fillStyle = PAL.woodDark;
  ctx.fillRect(x - s.w / 2 - 5, lineY - 20, 10, GROUND_Y - lineY + 20);
  ctx.fillRect(x + s.w / 2 - 5, lineY - 20, 10, GROUND_Y - lineY + 20);
  ctx.strokeStyle = '#e9dcc0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s.w / 2, lineY);
  ctx.quadraticCurveTo(x, lineY + 12, x + s.w / 2, lineY);
  ctx.stroke();
  const items = [['#c8324b', 34, 'johns'], ['#e9dcc0', 46, 'sheet'], ['#8fd3d1', 30, 'shirt'], ['#e8732c', 26, 'sock']];
  let cx = x - s.w / 2 + 12;
  items.forEach(([col, w, kind], i) => {
    const flap = Math.sin(t * 5 + i * 1.7) * 5;
    const top = lineY + 4 + 8 * Math.sin(((cx - x + s.w / 2) / s.w) * Math.PI);
    const len = kind === 'sock' ? 30 : s.h - 2;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + w, top);
    ctx.lineTo(cx + w + flap, top + len);
    if (kind === 'johns') {
      ctx.lineTo(cx + w / 2 + 4 + flap, top + len);
      ctx.lineTo(cx + w / 2 + flap, top + len * 0.45);
      ctx.lineTo(cx + w / 2 - 4 + flap, top + len);
    }
    ctx.lineTo(cx + flap, top + len);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(cx + 4, top - 4, 4, 8);
    ctx.fillRect(cx + w - 8, top - 4, 4, 8);
    cx += w + 8;
  });
}

export function drawHazard(ctx, h, x, t) {
  const y = GROUND_Y;
  const s = h.spec;
  switch (h.kind) {
    case 'fence': drawFence(ctx, x, y, s.w, s.h); break;
    case 'feedTrough': drawFeedTrough(ctx, x, y, s.w, s.h); break;
    case 'clothesline': drawClothesline(ctx, h, x, t); break;
    case 'pumpkin': drawPumpkin(ctx, x, y, s.w, s.h); break;
    case 'wheelbarrow': drawWheelbarrow(ctx, x, y, s.w, s.h); break;
    case 'hayBale': drawHayBale(ctx, x, y, s.w, s.h); break;
    case 'dutchOven': drawDutchOven(ctx, x, y, s.w, s.h, t); break;
    case 'oven': drawOven(ctx, h, x, y, t); break;
    case 'rollingPin': drawRollingPin(ctx, x, y, s.w, s.h, t); break;
    case 'gravy': drawGravy(ctx, x, y, s.w); break;
    default: drawOverhead(ctx, h, x, t);
  }
}
