// Small bursts of life: feathers when hit, sparkles on corn, embers by the ovens, text pops.

export function createParticles() {
  return { list: [], pops: [] };
}

export function burst(fx, x, y, rng, { count = 12, colors = ['#fff'], speed = 260, life = 0.8, size = 5, gravity = 500, kind = 'dot' } = {}) {
  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const s = rng.range(speed * 0.3, speed);
    fx.list.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3,
      life, max: life, size: rng.range(size * 0.6, size * 1.3),
      color: colors[i % colors.length], gravity, kind, spin: rng.range(-8, 8),
    });
  }
}

export function popText(fx, x, y, text, color = '#fff4dc', size = 26) {
  fx.pops.push({ x, y, text, color, size, life: 1.1 });
}

export function updateParticles(fx, dt, scrollPx) {
  for (const p of fx.list) {
    p.life -= dt;
    p.vy += p.gravity * dt;
    p.x += (p.vx - scrollPx) * dt;
    p.y += p.vy * dt;
  }
  fx.list = fx.list.filter((p) => p.life > 0);
  for (const p of fx.pops) {
    p.life -= dt;
    p.y -= 50 * dt;
  }
  fx.pops = fx.pops.filter((p) => p.life > 0);
}

export function drawParticles(ctx, fx, t) {
  for (const p of fx.list) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    if (p.kind === 'feather') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin * (p.max - p.life) + t);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.6, p.size * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const p of fx.pops) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.font = `bold ${p.size}px "Trebuchet MS", "DejaVu Sans", sans-serif`;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0b0f24';
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
