// Stage medals and the Daily Moon. Each stage of the night earns a medal for how cleanly Wattle
// got through it; the Daily Moon is one course per UTC day, the same for every player, so a
// day's best score and medal set mean something.

export const MEDAL_STYLE = {
  gold: { fill: '#ffd34d', rim: '#a8741a', label: 'GOLD' },
  silver: { fill: '#d6dde8', rim: '#7a8599', label: 'SILVER' },
  bronze: { fill: '#d88a4a', rim: '#7d4420', label: 'BRONZE' },
  none: { fill: 'rgba(255,255,255,0.12)', rim: 'rgba(255,255,255,0.28)', label: '—' },
};

// gold: no feather lost and never caught in full lantern light; silver: no feather lost;
// bronze: made it through the stage at all.
export function medalFor(stageLog) {
  if (stageLog.hits === 0 && stageLog.sightings === 0) return 'gold';
  if (stageLog.hits === 0) return 'silver';
  return 'bronze';
}

export function newStageLog() {
  return { hits: 0, sightings: 0 };
}

export function medalPoints(medal) {
  return medal === 'gold' ? 500 : medal === 'silver' ? 250 : medal === 'bronze' ? 100 : 0;
}

// The Daily Moon: day number since 1 Jan 2026 (UTC) and a seed hashed from it.
export function dailyMoon(now = Date.now()) {
  const day = Math.floor((now - Date.UTC(2026, 0, 1)) / 86400000) + 1;
  let h = (day * 2654435761) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b) >>> 0;
  h ^= h >>> 16;
  const date = new Date(now).toISOString().slice(0, 10);
  return { day, seed: h >>> 0, date };
}

export function drawMedal(ctx, x, y, r, medal, star = true) {
  const st = MEDAL_STYLE[medal] || MEDAL_STYLE.none;
  ctx.fillStyle = st.fill;
  ctx.strokeStyle = st.rim;
  ctx.lineWidth = Math.max(2, r * 0.22);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (star && medal !== 'none') {
    ctx.fillStyle = st.rim;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r * 0.58 : r * 0.25;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}
