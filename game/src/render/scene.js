// Draws one frame of the chase: backdrop, cover, the lantern beam, hazards, corn,
// thrown knives, the farmer and Wattle, in that order, plus his speech bubble.

import { PAL, GROUND_Y, TURKEY_X, VIEW_W, VIEW_H, FONT_UI } from '../config.js';
import { drawBackdrop } from '../art/scenery.js';
import { drawTurkey, drawHiddenTurkey } from '../art/turkey.js';
import { drawFarmer, drawBeam } from '../art/farmer.js';
import { drawHazard } from '../world/hazards.js';
import { drawCorn, drawFeather, drawCover, drawThrownKnife, pickupY } from '../world/pickups.js';
import { drawParticles } from '../fx/particles.js';
import { screenX, farmerScreenX, turkeyPose, beamOrigin, BEAM_REACH, BEAM_SPREAD } from '../world/run.js';
import { STAGES } from '../config.js';

export function speechBubble(ctx, x, y, text, color = PAL.cream) {
  ctx.font = `bold 22px ${FONT_UI}`;
  const w = ctx.measureText(text).width + 30;
  const bx = Math.max(10, Math.min(VIEW_W - w - 10, x - w / 2));
  ctx.fillStyle = color;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(bx, y - 44, w, 40, 14);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 5);
  ctx.lineTo(x + 2, y + 12);
  ctx.lineTo(x + 10, y - 5);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + w / 2, y - 24);
  ctx.textBaseline = 'alphabetic';
}

function laneWarning(ctx, w, t) {
  const y = w.lane === 'high' ? GROUND_Y - 108 : GROUND_Y - 26;
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 30);
  ctx.strokeStyle = PAL.danger;
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(TURKEY_X + 60, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = PAL.danger;
  ctx.font = `bold 20px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText(w.lane === 'high' ? 'KNIFE! DUCK ↓' : 'KNIFE! JUMP ↑', TURKEY_X + 70, y + 7);
  ctx.restore();
}

export function drawWorld(ctx, run) {
  const t = run.t;
  const stageId = run.outcome === 'escaped' ? 'dawn' : STAGES[run.stageIndex].id;
  ctx.save();
  if (run.shake > 0) ctx.translate(Math.sin(t * 90) * 10 * run.shake, Math.cos(t * 70) * 6 * run.shake);
  drawBackdrop(ctx, stageId, run.d * 40, t);

  for (const c of run.covers) {
    const sx = screenX(run, c.m);
    if (sx > -200 && sx < VIEW_W + 200) drawCover(ctx, c, sx, t, run.hidden && Math.abs(sx - TURKEY_X) < c.spec.w / 2);
  }

  // night dims everything outside the lanterns
  ctx.fillStyle = run.stageIndex === 2 ? 'rgba(10,12,36,0.18)' : 'rgba(10,12,36,0.32)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const fx = farmerScreenX(run);
  if (fx > -400) drawBeam(ctx, beamOrigin(run), run.farmer.beamAngle, BEAM_REACH, BEAM_SPREAD, run.inBeam);

  for (const h of run.hazards) {
    const sx = screenX(run, h.m);
    if (sx > -160 && sx < VIEW_W + 160 && !(h.hit && h.spec.lane === 'ground' && run.dashLeft > 0)) drawHazard(ctx, h, sx, t);
  }
  for (const p of run.pickups) {
    if (p.taken) continue;
    const sx = screenX(run, p.m);
    if (sx < -40 || sx > VIEW_W + 40) continue;
    if (p.kind === 'corn') drawCorn(ctx, sx, pickupY(p), t);
    else drawFeather(ctx, sx, pickupY(p), t);
  }
  for (const d of run.decoys) {
    if (d.landed) {
      drawCorn(ctx, screenX(run, d.m), GROUND_Y - 12, t, 1.3);
    } else {
      const u = Math.min(1, d.t / d.dur);
      const x = d.x0 + (d.tx - d.x0) * u;
      const y = d.y0 + (GROUND_Y - 12 - d.y0) * u - Math.sin(u * Math.PI) * 170;
      ctx.strokeStyle = 'rgba(255,211,77,0.4)';
      ctx.setLineDash([6, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(d.x0, d.y0);
      ctx.quadraticCurveTo((d.x0 + d.tx) / 2, d.y0 - 300, d.tx, GROUND_Y - 12);
      ctx.stroke();
      ctx.setLineDash([]);
      drawCorn(ctx, x, y, t * 3, 1.3);
    }
  }

  if (fx > -160) {
    drawFarmer(ctx, fx, GROUND_Y, { state: run.outcome === 'caught' ? 'grab' : run.farmer.state, t });
    if (run.farmer.windup > 0) speechBubble(ctx, fx + 30, GROUND_Y - 250, 'HYAH!', '#ffd0d0');
    else if (run.farmer.lineLeft > 0) speechBubble(ctx, Math.max(fx + 30, 150), GROUND_Y - 250, run.farmer.line);
  } else if (run.farmer.lineLeft > 0) {
    speechBubble(ctx, 170, GROUND_Y - 250, run.farmer.line);
  }

  for (const w of run.warnings) laneWarning(ctx, w, t);
  for (const k of run.knives) drawThrownKnife(ctx, k.x, k.y, t);

  const pose = turkeyPose(run);
  const blink = run.invuln > 0 && Math.floor(t * 14) % 2 === 0;
  if (run.hidden) drawHiddenTurkey(ctx, TURKEY_X, GROUND_Y, t);
  else drawTurkey(ctx, TURKEY_X, GROUND_Y - run.ty, { pose, t, speed: run.speed / 10, alpha: blink ? 0.45 : 1 });

  drawParticles(ctx, run.fx, t);
  ctx.restore();

  // red edge pulse when the farmer is close or the turkey is being spotted
  const danger = Math.max(run.spotted > 0.6 ? run.spotted : 0, run.farmer.gap < 6 ? 1 - run.farmer.gap / 6 : 0);
  if (danger > 0) {
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
    g.addColorStop(0, 'rgba(200,30,50,0)');
    g.addColorStop(1, `rgba(200,30,50,${0.45 * danger * (0.75 + 0.25 * Math.sin(t * 10))})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
