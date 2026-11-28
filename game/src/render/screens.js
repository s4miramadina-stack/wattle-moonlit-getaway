// The title card, the pause card and the two endings: ON THE MENU (caught) or PARDONED AT DAWN.

import { PAL, VIEW_W, VIEW_H, GROUND_Y, FONT_TITLE, FONT_UI, STAGES, TOTAL_LENGTH, rankFor } from '../config.js';
import { drawBackdrop } from '../art/scenery.js';
import { drawTurkey } from '../art/turkey.js';
import { drawFarmer, drawBeam } from '../art/farmer.js';
import { drawHazard, makeHazard } from '../world/hazards.js';
import { drawCorn } from '../world/pickups.js';
import { speechBubble } from './scene.js';
import { drawMedal, MEDAL_STYLE } from '../world/medals.js';

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
  // shrink the label until it sits inside the pill with room to spare
  let size = 24;
  ctx.font = `bold ${size}px ${FONT_UI}`;
  while (size > 14 && ctx.measureText(text).width > w - 48) {
    size -= 1;
    ctx.font = `bold ${size}px ${FONT_UI}`;
  }
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

// The four stages as a row of numbered chips joined by arrows: coop -> patch -> barn -> kitchen.
function stageStrip(ctx, cx, y) {
  const step = 190;
  STAGES.forEach((st, i) => {
    const x = cx - step * 1.5 + i * step;
    if (i > 0) {
      ctx.fillStyle = 'rgba(255,244,220,0.5)';
      ctx.beginPath();
      ctx.moveTo(x - step / 2 - 6, y - 7); ctx.lineTo(x - step / 2 + 6, y); ctx.lineTo(x - step / 2 - 6, y + 7);
      ctx.fill();
    }
    ctx.fillStyle = st.color;
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), x, y + 6);
    ctx.fillStyle = PAL.cream;
    ctx.font = `bold 15px ${FONT_UI}`;
    ctx.fillText(st.short, x, y + 40);
  });
}

export function drawTitle(ctx, t, best, moon = { day: 1 }, dailyBest = 0) {
  drawBackdrop(ctx, 'coop', t * 60, t);
  ctx.fillStyle = 'rgba(10,12,36,0.25)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // the chase, as a living tableau: the farmer and his lantern behind, Wattle mid-leap over a fence
  drawBeam(ctx, { x: 196, y: GROUND_Y - 176 }, -0.1 + Math.sin(t * 1.2) * 0.1, 900, 0.17, false);
  drawFarmer(ctx, 150, GROUND_Y, { state: 'chase', t });
  speechBubble(ctx, 128, GROUND_Y - 250, 'Turkey, turkey...');
  drawHazard(ctx, makeHazard('fence', 0, null), 1075, t);
  drawTurkey(ctx, 1085, GROUND_Y - 46 - Math.sin(t * 3) * 6, { pose: 'jump', t, speed: 1, scale: 1.1 });
  drawCorn(ctx, 930, GROUND_Y - 60, t, 1.2);
  ctx.save();
  ctx.translate(1205, 0);
  ctx.scale(0.8, 0.8);
  ctx.translate(-1205, GROUND_Y * 0.25);
  drawHazard(ctx, TITLE_OVEN, 1205, t);
  ctx.restore();

  const cx = VIEW_W / 2;
  ctx.fillStyle = PAL.amberHot;
  ctx.font = `bold 20px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText('A THANKSGIVING TURKEY ESCAPE', cx, 56);
  titleText(ctx, "WATTLE'S", cx, 120, 60, PAL.frost, 'rgba(143,211,209,0.8)');
  titleText(ctx, 'MOONLIT GETAWAY', cx, 194, 74, PAL.cream, 'rgba(255,179,71,0.9)');
  ctx.fillStyle = PAL.cream;
  ctx.font = `19px ${FONT_UI}`;
  ctx.fillText(`Farmer Mudge has preheated the oven. Run ${TOTAL_LENGTH.toLocaleString('en-US')} m from the coop to the woods. Don't become dinner.`, cx, 232);

  // four stages of the night, each harder, each with its own medal
  card(ctx, cx - 400, 250, 800, 118);
  stageStrip(ctx, cx, 282);
  const legend = [['gold', 'never hit, never seen'], ['silver', 'never hit'], ['bronze', 'made it through']];
  legend.forEach(([m, txt], i) => {
    const x = cx - 330 + i * 240;
    drawMedal(ctx, x + 10, 346, 10, m);
    ctx.textAlign = 'left';
    ctx.fillStyle = MEDAL_STYLE[m].fill;
    ctx.font = `bold 14px ${FONT_UI}`;
    ctx.fillText(MEDAL_STYLE[m].label, x + 26, 351);
    const lw = ctx.measureText(MEDAL_STYLE[m].label).width;
    ctx.fillStyle = 'rgba(255,244,220,0.8)';
    ctx.font = `13px ${FONT_UI}`;
    ctx.fillText(txt, x + 32 + lw, 351);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(11,15,36,0.7)';
  ctx.beginPath();
  ctx.roundRect(cx - 360, 380, 720, 30, 15);
  ctx.fill();
  ctx.fillStyle = PAL.frost;
  ctx.font = `bold 14px ${FONT_UI}`;
  ctx.fillText('↑/W/Space jump  ·  ↓/S duck & hide  ·  ←/→ pace  ·  Shift feather burst  ·  Click: corn decoy', cx, 400);

  button(ctx, cx, 450, 470, 52, `ENTER / CLICK: DAILY MOON #${moon.day}`, t);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,244,220,0.85)';
  ctx.font = `15px ${FONT_UI}`;
  ctx.fillText(`Same course for every turkey today  ·  today's best ${dailyBest}  ·  N: random night`, cx, 494);
  if (best > 0) {
    ctx.fillStyle = PAL.wheat;
    ctx.font = `bold 15px ${FONT_UI}`;
    ctx.fillText(`Best escape score ever: ${best}`, cx, 516);
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
    ['Distance run', `${Math.floor(Math.min(run.d, TOTAL_LENGTH))} m`],
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
    ctx.fillText(k, x, y + i * 28);
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.cream;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.fillText(v, x + 300, y + i * 28);
    ctx.font = `18px ${FONT_UI}`;
  });
}

function medalRow(ctx, run, cx, y) {
  STAGES.forEach((st, i) => {
    const x = cx - 225 + i * 150;
    const m = run.medals[i] || 'none';
    drawMedal(ctx, x, y, 17, m);
    ctx.textAlign = 'center';
    ctx.fillStyle = m === 'none' ? 'rgba(255,244,220,0.45)' : MEDAL_STYLE[m].fill;
    ctx.font = `bold 12px ${FONT_UI}`;
    ctx.fillText(st.short.toUpperCase(), x, y + 34);
    ctx.font = `bold 15px ${FONT_UI}`;
    ctx.fillText(MEDAL_STYLE[m].label, x, y + 52);
  });
}

export function drawEnd(ctx, run, best, dailyBest = 0) {
  const t = run.t;
  const escaped = run.outcome === 'escaped';
  const appear = Math.min(1, run.endT * 2);
  ctx.globalAlpha = appear;
  ctx.fillStyle = escaped ? 'rgba(60,40,90,0.35)' : 'rgba(40,6,16,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const cx = VIEW_W / 2;
  card(ctx, cx - 320, 60, 640, 600);
  if (escaped) {
    ctx.fillStyle = PAL.amberHot;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(run.mode === 'daily' ? `YOU ESCAPED!  ·  DAILY MOON #${run.moonDay}` : 'YOU ESCAPED!', cx, 100);
    titleText(ctx, 'PARDONED AT DAWN', cx, 158, 52, PAL.cream, 'rgba(255,179,71,0.9)');
    ctx.fillStyle = PAL.frost;
    ctx.font = `18px ${FONT_UI}`;
    ctx.fillText('Wattle reached the Dawn Woods. No oven tonight, no oven ever.', cx, 192);
  } else {
    ctx.fillStyle = PAL.danger;
    ctx.font = `bold 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(run.mode === 'daily' ? `CAUGHT!  ·  DAILY MOON #${run.moonDay}` : 'CAUGHT!', cx, 100);
    titleText(ctx, 'ON THE MENU', cx, 158, 58, '#ffd0d0', 'rgba(200,50,75,0.9)');
    ctx.fillStyle = PAL.cream;
    ctx.font = `18px ${FONT_UI}`;
    ctx.fillText(`Farmer Mudge caught Wattle ${Math.max(0, Math.ceil(TOTAL_LENGTH - run.d))} m from freedom. Into the oven at 350°F...`, cx, 192, 580);
  }
  ctx.fillStyle = PAL.wheat;
  ctx.font = `bold 44px ${FONT_UI}`;
  ctx.fillText(String(Math.floor(run.score)), cx, 246);
  ctx.font = `bold 16px ${FONT_UI}`;
  ctx.fillStyle = PAL.frost;
  const dayBest = run.mode === 'daily' ? `   ·   TODAY'S BEST ${Math.max(dailyBest, Math.floor(run.score))}` : '';
  ctx.fillText(`RANK: ${rankFor(run.score).toUpperCase()}   ·   BEST ${Math.max(best, Math.floor(run.score))}${dayBest}`, cx, 274);
  medalRow(ctx, run, cx, 312);
  statRows(ctx, run, cx - 150, 400);
  button(ctx, cx, 598, 440, 50, escaped ? 'RUN AGAIN  ·  ENTER / CLICK' : 'TRY AGAIN  ·  ENTER / CLICK', t);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,244,220,0.7)';
  ctx.font = `14px ${FONT_UI}`;
  ctx.fillText('N: a new random night  ·  Esc: title', cx, 642);
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
