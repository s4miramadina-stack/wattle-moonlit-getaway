// Things that help Wattle: corn to eat or throw, golden feathers that mend a life,
// and cover (corn shocks, haystacks, pantry curtains) to hide in from the lantern.

import { PAL, GROUND_Y } from '../config.js';

export const COVER_SPEC = {
  cornShock: { w: 150, h: 150 },
  haystack: { w: 170, h: 130 },
  pantryCurtain: { w: 150, h: 190 },
};

export function makePickup(kind, m, height) {
  return { kind, m, height, taken: false };
}

export function makeCover(kind, m) {
  return { kind, m, spec: COVER_SPEC[kind] };
}

export function pickupY(p) {
  return GROUND_Y - 40 - p.height;
}

export function drawCorn(ctx, x, y, t, scale = 1) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4 + x * 0.05) * 4);
  ctx.scale(scale, scale);
  ctx.rotate(0.5);
  ctx.fillStyle = '#7fa64a';
  ctx.beginPath();
  ctx.ellipse(-4, 6, 6, 16, -0.4, 0, Math.PI * 2);
  ctx.ellipse(4, 6, 6, 16, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.ellipse(0, -4, 8, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a92a';
  for (let r = -2; r <= 2; r++) {
    ctx.fillRect(-5, -4 + r * 5, 3, 3);
    ctx.fillRect(1, -2 + r * 5, 3, 3);
  }
  ctx.restore();
}

export function drawFeather(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3) * 6);
  ctx.rotate(Math.sin(t * 2) * 0.3);
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 40);
  g.addColorStop(0, 'rgba(255,210,122,0.6)');
  g.addColorStop(1, 'rgba(255,210,122,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.amberHot;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 24, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.pumpkinDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, 22); ctx.lineTo(6, -22);
  ctx.stroke();
  ctx.restore();
}

export function drawCover(ctx, c, x, t, occupied) {
  const { w, h } = c.spec;
  const y = GROUND_Y;
  if (c.kind === 'cornShock') {
    for (let i = 0; i < 11; i++) {
      const lean = (i - 5) * 0.07 + Math.sin(t + i) * 0.02;
      ctx.save();
      ctx.translate(x + (i - 5) * 9, y);
      ctx.rotate(lean);
      ctx.fillStyle = i % 2 ? '#c99a4a' : '#a87a34';
      ctx.fillRect(-5, -h, 10, h);
      ctx.restore();
    }
    ctx.fillStyle = PAL.cranberryDark;
    ctx.fillRect(x - 40, y - h * 0.55, 80, 8);
  } else if (c.kind === 'haystack') {
    ctx.fillStyle = '#c4923a';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x - w / 2, y - h, x, y - h - 10);
    ctx.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y);
    ctx.fill();
    ctx.strokeStyle = '#8f6624';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const sx = x - w / 2 + 10 + (i * (w - 20)) / 13;
      ctx.beginPath();
      ctx.moveTo(sx, y - 6);
      ctx.lineTo(sx + 6, y - 30 - (i % 4) * 10);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = PAL.woodDark;
    ctx.fillRect(x - w / 2 - 6, y - h - 12, w + 12, 12);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#e9dcc0' : PAL.cranberry;
      const sway = Math.sin(t * 1.2 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + i * (w / 6), y - h);
      ctx.lineTo(x - w / 2 + (i + 1) * (w / 6), y - h);
      ctx.lineTo(x - w / 2 + (i + 1) * (w / 6) + sway, y);
      ctx.lineTo(x - w / 2 + i * (w / 6) + sway, y);
      ctx.fill();
    }
  }
  // a soft shadow under cover tells the player "hide here"
  ctx.fillStyle = occupied ? 'rgba(143,211,209,0.35)' : 'rgba(10,12,30,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, w / 2 + 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A carving knife spinning through the air, thrown by the farmer.
export function drawThrownKnife(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 18);
  ctx.fillStyle = '#2a1a12';
  ctx.fillRect(-20, -4, 16, 8);
  ctx.fillStyle = '#e8eef5';
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.lineTo(26, -1);
  ctx.lineTo(-4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(232,238,245,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 70, y);
  ctx.lineTo(x - 24, y);
  ctx.stroke();
}
