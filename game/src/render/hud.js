// The heads-up display: score, metres to the Dawn Woods with a stage map, feather lives,
// the SPOTTED meter, the farmer's distance, corn decoys and the feather-burst dash.

import { PAL, VIEW_W, STAGES, TOTAL_LENGTH, TUNE, FONT_UI, FONT_TITLE } from '../config.js';
import { metresLeft } from '../world/run.js';
import { isMuted } from '../audio.js';
import { drawMedal, MEDAL_STYLE } from '../world/medals.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(11,15,36,0.78)';
  ctx.strokeStyle = 'rgba(143,211,209,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
}

function meter(ctx, x, y, w, h, value, color, back = 'rgba(255,255,255,0.12)') {
  ctx.fillStyle = back;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  if (value > 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(h, w * value), h, h / 2);
    ctx.fill();
  }
}

function featherIcon(ctx, x, y, full) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.5);
  ctx.fillStyle = full ? PAL.amberHot : 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = full ? PAL.pumpkinDark : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18); ctx.lineTo(0, -16);
  ctx.stroke();
  ctx.restore();
}

// Red breath at the screen edge while the farmer is within a few metres.
function drawHeat(ctx, run) {
  if (run.heat < 0.05) return;
  const pulse = 0.75 + 0.25 * Math.sin(run.t * (6 + run.heat * 8));
  const g = ctx.createRadialGradient(VIEW_W / 2, 380, 260, VIEW_W / 2, 380, 780);
  g.addColorStop(0, 'rgba(200,30,50,0)');
  g.addColorStop(1, `rgba(200,30,50,${(0.55 * run.heat * pulse).toFixed(3)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, 720);
  if (run.heat > 0.6) {
    ctx.textAlign = 'left';
    ctx.fillStyle = `rgba(255,208,208,${(0.6 + 0.4 * pulse).toFixed(3)})`;
    ctx.font = `bold 22px ${FONT_UI}`;
    ctx.fillText("HE'S RIGHT BEHIND YOU!", 24, 140);
  }
}

export function drawHud(ctx, run) {
  ctx.textBaseline = 'alphabetic';
  drawHeat(ctx, run);
  // score + feathers (left)
  panel(ctx, 16, 14, 280, 92);
  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.frost;
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.fillText('SCORE', 32, 40);
  ctx.fillStyle = PAL.cream;
  ctx.font = `bold 34px ${FONT_UI}`;
  ctx.fillText(String(Math.floor(run.score)).padStart(5, '0'), 32, 76);
  ctx.fillStyle = PAL.frost;
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.fillText('LIVES', 178, 40);
  for (let i = 0; i < TUNE.maxFeathers; i++) featherIcon(ctx, 192 + i * 32, 70, i < run.lives);
  if (run.lives === 1 && Math.floor(run.t * 4) % 2 === 0) {
    ctx.fillStyle = PAL.danger;
    ctx.font = `bold 13px ${FONT_UI}`;
    ctx.fillText('LAST FEATHER!', 178, 100);
  }

  // distance + stage map (centre)
  const cx = VIEW_W / 2;
  panel(ctx, cx - 250, 14, 500, 92);
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.cream;
  ctx.font = `bold 26px ${FONT_UI}`;
  ctx.fillText(`${metresLeft(run)} m to the Dawn Woods`, cx, 46);
  const mx = cx - 220;
  const mw = 440;
  let s0 = 0;
  STAGES.forEach((s, i) => {
    const x = mx + (s0 / TOTAL_LENGTH) * mw;
    const w = (s.length / TOTAL_LENGTH) * mw;
    ctx.fillStyle = i === run.stageIndex ? s.color : 'rgba(255,255,255,0.16)';
    ctx.fillRect(x + 1, 62, w - 2, 12);
    ctx.fillStyle = i === run.stageIndex ? PAL.cream : 'rgba(255,244,220,0.55)';
    ctx.font = `bold 12px ${FONT_UI}`;
    ctx.fillText(s.tag, x + w / 2, 94);
    if (run.medals[i]) drawMedal(ctx, x + w - 10, 68, 9, run.medals[i]);
    s0 += s.length;
  });
  const px = mx + Math.min(1, run.d / TOTAL_LENGTH) * mw;
  ctx.fillStyle = PAL.frost;
  ctx.beginPath();
  ctx.moveTo(px, 58); ctx.lineTo(px - 7, 50); ctx.lineTo(px + 7, 50);
  ctx.fill();
  // the farmer's marker trails behind on the same map
  const fpx = mx + Math.max(0, (run.d - run.farmer.gap) / TOTAL_LENGTH) * mw;
  ctx.fillStyle = '#d8a72e';
  ctx.fillRect(fpx - 3, 60, 6, 16);

  // spotted + farmer distance (right)
  panel(ctx, VIEW_W - 296, 14, 280, 92);
  ctx.textAlign = 'left';
  const spotColor = run.spotted > 0.75 ? PAL.danger : run.spotted > 0.4 ? PAL.amber : PAL.frost;
  ctx.fillStyle = spotColor;
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.fillText(run.hidden ? 'HIDDEN IN COVER' : run.inBeam ? 'SPOTTED — IN THE LIGHT!' : 'SPOTTED', VIEW_W - 280, 40);
  meter(ctx, VIEW_W - 280, 48, 248, 14, run.spotted, spotColor);
  ctx.fillStyle = PAL.cream;
  ctx.font = `bold 15px ${FONT_UI}`;
  const gap = Math.max(0, run.farmer.gap);
  ctx.fillText(`FARMER ${gap.toFixed(1)} m`, VIEW_W - 280, 86);
  ctx.fillStyle = gap < 5 ? PAL.danger : 'rgba(255,244,220,0.6)';
  ctx.font = `bold 13px ${FONT_UI}`;
  ctx.textAlign = 'right';
  const st = run.farmer.state;
  ctx.fillText(st === 'sprint' ? 'SPRINTING!' : st === 'distracted' ? 'EATING CORN' : st === 'search' ? 'SEARCHING' : 'CHASING', VIEW_W - 32, 86);

  // corn decoys + dash (bottom)
  panel(ctx, 16, 640, 420, 64);
  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.wheat;
  ctx.font = `bold 20px ${FONT_UI}`;
  ctx.fillText(`CORN ×${run.corn}`, 32, 670);
  ctx.font = `13px ${FONT_UI}`;
  ctx.fillStyle = run.corn >= TUNE.decoyCost && run.decoyCooldown <= 0 ? PAL.ok : 'rgba(255,244,220,0.55)';
  ctx.fillText(run.corn >= TUNE.decoyCost ? (run.decoyCooldown > 0 ? 'decoy reloading…' : 'CLICK: toss a corn decoy') : `decoy needs ${TUNE.decoyCost} corn`, 32, 692);
  ctx.fillStyle = PAL.amberHot;
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.fillText('FEATHER BURST [SHIFT]', 230, 668);
  meter(ctx, 230, 678, 190, 12, run.dashMeter, run.dashMeter >= 1 ? PAL.amberHot : PAL.pumpkin);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,244,220,0.55)';
  ctx.font = `13px ${FONT_UI}`;
  ctx.fillText(`←/→ pace  ↑ jump  ↓ duck/hide  P pause  M ${isMuted() ? 'unmute' : 'mute'}`, VIEW_W - 20, 700);

  // the medal just earned for the stage left behind
  if (run.medalFlash > 0 && run.medalLast && !run.outcome) {
    const a = Math.min(1, run.medalFlash * 1.4);
    ctx.globalAlpha = a;
    const st = MEDAL_STYLE[run.medalLast];
    drawMedal(ctx, VIEW_W / 2 - 150, 290, 26, run.medalLast);
    ctx.textAlign = 'left';
    ctx.fillStyle = st.fill;
    ctx.font = `bold 26px ${FONT_UI}`;
    ctx.fillText(`${st.label} MEDAL`, VIEW_W / 2 - 112, 286);
    ctx.fillStyle = PAL.cream;
    ctx.font = `15px ${FONT_UI}`;
    ctx.fillText(run.medalLast === 'gold' ? 'no feather lost, never caught in the light' : run.medalLast === 'silver' ? 'no feather lost' : 'made it through', VIEW_W / 2 - 112, 308);
    ctx.globalAlpha = 1;
  }
  if (run.mode === 'daily') {
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.frost;
    ctx.font = `bold 13px ${FONT_UI}`;
    ctx.fillText(`DAILY MOON #${run.moonDay}`, VIEW_W - 20, 128);
  }

  // stage title card
  if (run.banner > 0 && !run.outcome) {
    const a = Math.min(1, run.banner * 1.5);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(11,15,36,0.7)';
    ctx.fillRect(0, 160, VIEW_W, 84);
    ctx.fillStyle = PAL.amberHot;
    ctx.font = `bold 16px ${FONT_UI}`;
    ctx.fillText(`STAGE ${run.stageIndex + 1} OF ${STAGES.length}`, VIEW_W / 2, 186);
    ctx.fillStyle = PAL.cream;
    ctx.font = `bold 40px ${FONT_TITLE}`;
    ctx.fillText(STAGES[run.stageIndex].name, VIEW_W / 2, 230);
    ctx.globalAlpha = 1;
  }
}
