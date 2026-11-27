// The title card, the pause card and the two endings: ON THE MENU (caught) or PARDONED AT DAWN.

import { PAL, VIEW_W, VIEW_H, GROUND_Y, FONT_TITLE, FONT_UI, STAGES, rankFor } from '../config.js';
import { drawBackdrop } from '../art/scenery.js';
import { drawTurkey } from '../art/turkey.js';
import { drawFarmer, drawBeam } from '../art/farmer.js';
import { drawHazard, makeHazard } from '../world/hazards.js';
import { drawCorn } from '../world/pickups.js';
import { speechBubble } from './scene.js';

function titleText(ctx, text, x, y, size, fill, glow) {
  ctx.font = `bold ${size}px ${FONT_TITLE}`;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = PAL.ink;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 24;
  ctx.strokeText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function button(ctx, x, y, w, h, text, t) {
  const pulse = 0.85 + 0.15 * Math.sin(t * 5);
  ctx.fillStyle = PAL.cranberry;
  ctx.strokeStyle = PAL.amberHot;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.globalAlpha = pulse;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = PAL.cream;
  ctx.font = `bold 24px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
  ctx.textBaseline = 'alphabetic';
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(11,15,36,0.82)';
  ctx.strokeStyle = 'rgba(255,179,71,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
}

const TITLE_OVEN = makeHazard('oven', 0, null);

export function drawTitle(ctx, t, best) {
  drawBackdrop(ctx, 'patch', t * 60, t);
  ctx.fillStyle = 'rgba(10,12,36,0.3)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // the chase, as a living tableau: farmer, his lantern, Wattle mid-leap over a pumpkin
  drawBeam(ctx, { x: 196, y: GROUND_Y - 176 }, -0.12 + Math.sin(t * 1.2) * 0.12, 760, 0.17, false);
  drawFarmer(ctx, 150, GROUND_Y, { state: 'chase', t });
  speechBubble(ctx, 150, GROUND_Y - 250, 'Here, turkey turkey...');
  drawHazard(ctx, makeHazard('pumpkin', 0, null), 1060, t);
  drawTurkey(ctx, 1065, GROUND_Y - 34 - Math.sin(t * 3) * 6, { pose: 'jump', t, speed: 1, scale: 1.05 });
  drawCorn(ctx, 900, GROUND_Y - 50, t, 1.2);
  drawCorn(ctx, 960, GROUND_Y - 90, t + 1, 1.2);

  ctx.fillStyle = PAL.amberHot;
  ctx.font = `bold 20px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText('A THANKSGIVING TURKEY ESCAPE', VIEW_W / 2, 64);
  titleText(ctx, "WATTLE'S", VIEW_W / 2, 132, 64, PAL.frost, 'rgba(143,211,209,0.8)');
  titleText(ctx, 'MOONLIT GETAWAY', VIEW_W / 2, 208, 76, PAL.cream, 'rgba(255,179,71,0.9)');
  ctx.fillStyle = PAL.cream;
  ctx.font = `20px ${FONT_UI}`;
  ctx.fillText("Farmer Mudge has preheated the oven. Run 1,220 m through the night and don't become dinner.", VIEW_W / 2, 246);

  // the three stages of the night, with the oven and the carving knives waiting at the end
  const cx = VIEW_W / 2;
  card(ctx, cx - 330, 268, 660, 150);
  const icons = [['1', STAGES[0].short, PAL.pumpkin], ['2', STAGES[1].short, PAL.hay], ['3', STAGES[2].short, PAL.cranberry]];
  icons.forEach(([n, name, col], i) => {
    const x = cx - 220 + i * 220;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, 300, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.fillText(n, x, 306);
    ctx.fillStyle = PAL.cream;
    ctx.font = `bold 17px ${FONT_UI}`;
    ctx.fillText(name, x, 340);
  });
  ctx.fillStyle = 'rgba(255,244,220,0.75)';
  ctx.font = `15px ${FONT_UI}`;
  ctx.fillText('dodge the lantern  ·  jump the pumpkins  ·  hide in the hay  ·  outrun the oven & the carving knife', cx, 372);
  ctx.fillStyle = PAL.frost;
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.fillText('↑/W/Space jump   ↓/S duck & hide   ←/→ pace   Shift feather burst   Mouse click: toss a corn decoy', cx, 400);

  ctx.save();
  ctx.translate(1205, 0);
  ctx.scale(0.8, 0.8);
  ctx.translate(-1205, GROUND_Y * 0.25);
  drawHazard(ctx, TITLE_OVEN, 1205, t);
  ctx.restore();

  button(ctx, cx, 462, 380, 54, 'PRESS ENTER OR CLICK TO RUN', t);
  if (best > 0) {
    ctx.fillStyle = PAL.wheat;
    ctx.font = `bold 16px ${FONT_UI}`;
    ctx.fillText(`Best escape score: ${best}`, cx, 512);
  }
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(11,15,36,0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  card(ctx, VIEW_W / 2 - 220, 260, 440, 170);
  titleText(ctx, 'PAUSED', VIEW_W / 2, 336, 56, PAL.cream, 'rgba(143,211,209,0.7)');
  ctx.fillStyle = PAL.frost;
  ctx.font = `18px ${FONT_UI}`;
  ctx.fillText('P to keep running  ·  R to restart  ·  M mute', VIEW_W / 2, 390);
}

function statRows(ctx, run, x, y) {
  const rows = [
    ['Distance run', `${Math.floor(Math.min(run.d, 1220))} m`],
    ['Corn gobbled', String(run.stats.corn)],
    ['Close shaves', String(run.stats.nearMisses)],
    ['Ovens cleared', String(run.stats.ovens)],
    ['Decoys tossed', String(run.stats.decoys)],
    ['Feathers left', String(Math.max(0, run.lives))],
  ];
  ctx.font = `18px ${FONT_UI}`;
  rows.forEach(([k, v], i) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,244,220,0.75)';
    ctx.fillText(k, x, y + i * 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.cream;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.fillText(v, x + 300, y + i * 30);
    ctx.font = `18px ${FONT_UI}`;
  });
}

export function drawEnd(ctx, run, best) {
  const t = run.t;
  const escaped = run.outcome === 'escaped';
  const appear = Math.min(1, run.endT * 2);
  ctx.globalAlpha = appear;
  ctx.fillStyle = escaped ? 'rgba(60,40,90,0.35)' : 'rgba(40,6,16,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const cx = VIEW_W / 2;
  card(ctx, cx - 300, 120, 600, 470);
  if (escaped) {
    ctx.fillStyle = PAL.amberHot;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('YOU ESCAPED!', cx, 160);
    titleText(ctx, 'PARDONED AT DAWN', cx, 222, 52, PAL.cream, 'rgba(255,179,71,0.9)');
    ctx.fillStyle = PAL.frost;
    ctx.font = `18px ${FONT_UI}`;
    ctx.fillText('Wattle reached the Dawn Woods. No oven tonight, no oven ever.', cx, 256);
  } else {
    ctx.fillStyle = PAL.danger;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', cx, 160);
    titleText(ctx, 'ON THE MENU', cx, 222, 58, '#ffd0d0', 'rgba(200,50,75,0.9)');
    ctx.fillStyle = PAL.cream;
    ctx.font = `18px ${FONT_UI}`;
    ctx.fillText(`Farmer Mudge caught Wattle ${Math.max(0, Math.ceil(1220 - run.d))} m from freedom. Into the oven at 350°F...`, cx, 256);
  }
  ctx.fillStyle = PAL.wheat;
  ctx.font = `bold 44px ${FONT_UI}`;
  ctx.fillText(String(Math.floor(run.score)), cx, 314);
  ctx.font = `bold 16px ${FONT_UI}`;
  ctx.fillStyle = PAL.frost;
  ctx.fillText(`RANK: ${rankFor(run.score).toUpperCase()}   ·   BEST ${Math.max(best, Math.floor(run.score))}`, cx, 342);
  statRows(ctx, run, cx - 150, 380);
  button(ctx, cx, 560, 420, 50, escaped ? 'ENTER / CLICK: RUN AGAIN' : 'ENTER / CLICK: TRY AGAIN', t);
  ctx.globalAlpha = 1;
}

// The scene behind the endings: Wattle celebrating in the woods, or held up by the farmer by the oven.
export function drawEndTableau(ctx, run) {
  const t = run.t;
  if (run.outcome === 'escaped') {
    drawBackdrop(ctx, 'dawn', run.d * 40, t);
    drawTurkey(ctx, 190, GROUND_Y, { pose: 'victory', t, scale: 1.3, speed: 0 });
    drawTurkey(ctx, 1090, GROUND_Y, { pose: 'victory', t: t + 1.3, scale: 1.0, speed: 0 });
  } else {
    drawBackdrop(ctx, 'kitchen', run.d * 40, t);
    drawHazard(ctx, makeHazard('oven', 0, { range: () => 0.2 }), 1120, 0.3);
    drawFarmer(ctx, 170, GROUND_Y, { state: 'grab', t });
    drawTurkey(ctx, 300, GROUND_Y - 150, { pose: 'hurt', t, scale: 0.9 });
  }
}
