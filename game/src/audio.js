// Every sound is synthesised with WebAudio: no audio files, nothing to download.

let ctx = null;
let master = null;
let musicGain = null;
let muted = false;
let musicTimer = null;
let step = 0;

function ensure() {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null; // headless self-test: silent
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.22;
  musicGain.connect(master);
  return ctx;
}

function tone(freq, dur, { type = 'square', vol = 0.2, slide = 0, delay = 0, dest = null } = {}) {
  if (!ensure() || muted) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur, { vol = 0.25, hp = 800, delay = 0 } = {}) {
  if (!ensure() || muted) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
}

export const sfx = {
  unlock() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); },
  gobble() {
    for (let i = 0; i < 5; i++) tone(520 - i * 30, 0.06, { type: 'sawtooth', vol: 0.12, slide: -160, delay: i * 0.07 });
  },
  jump() { tone(330, 0.14, { type: 'triangle', vol: 0.18, slide: 320 }); },
  land() { noise(0.05, { vol: 0.08, hp: 300 }); },
  corn() { tone(980, 0.06, { type: 'square', vol: 0.07 }); tone(1310, 0.08, { type: 'square', vol: 0.06, delay: 0.05 }); },
  feather() { [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.12, { type: 'triangle', vol: 0.1, delay: i * 0.05 })); },
  hit() { noise(0.25, { vol: 0.35, hp: 200 }); tone(180, 0.3, { type: 'sawtooth', vol: 0.18, slide: -120 }); },
  knife() { noise(0.12, { vol: 0.16, hp: 3000 }); tone(1800, 0.1, { type: 'sine', vol: 0.05, slide: 900 }); },
  flame() { noise(0.4, { vol: 0.2, hp: 500 }); },
  spotted() { tone(880, 0.12, { type: 'square', vol: 0.14 }); tone(1175, 0.22, { type: 'square', vol: 0.14, delay: 0.12 }); },
  hide() { noise(0.18, { vol: 0.12, hp: 1500 }); },
  dash() { tone(220, 0.3, { type: 'sawtooth', vol: 0.14, slide: 700 }); noise(0.2, { vol: 0.1, hp: 2000 }); },
  decoy() { tone(500, 0.18, { type: 'triangle', vol: 0.12, slide: -200 }); },
  nearMiss() { tone(1500, 0.07, { type: 'sine', vol: 0.08 }); tone(1900, 0.09, { type: 'sine', vol: 0.07, delay: 0.06 }); },
  stage() { [392, 494, 587, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.14, delay: i * 0.1 })); },
  caught() { [392, 349, 311, 262].forEach((f, i) => tone(f, 0.35, { type: 'sawtooth', vol: 0.13, delay: i * 0.22 })); },
  medal(kind) {
    const top = kind === 'gold' ? [784, 988, 1175, 1568] : kind === 'silver' ? [659, 784, 988] : [523, 659];
    top.forEach((f, i) => tone(f, 0.16, { type: 'triangle', vol: 0.12, delay: i * 0.08 }));
  },
  heartbeat(heat) {
    tone(70, 0.09, { type: 'sine', vol: 0.12 + heat * 0.22 });
    tone(62, 0.11, { type: 'sine', vol: 0.1 + heat * 0.18, delay: 0.16 });
  },
  escaped() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.15, delay: i * 0.12 })); },
};

// A plucky, original 16-step barn-dance loop in A minor: bass on the beat, a pluck melody on top.
const BASS = [110, 0, 165, 0, 98, 0, 147, 0, 87, 0, 131, 0, 98, 0, 147, 0];
const LEAD = [440, 523, 0, 659, 587, 0, 523, 494, 440, 0, 392, 440, 494, 0, 523, 0];

export function startMusic(tempo = 0.16) {
  if (!ensure() || musicTimer) return;
  musicTimer = setInterval(() => {
    if (muted) return;
    const b = BASS[step % 16];
    const l = LEAD[(step + (Math.floor(step / 32) % 2) * 4) % 16];
    if (b) tone(b, 0.18, { type: 'triangle', vol: 0.5, dest: musicGain });
    if (l && step % 2 === 0) tone(l, 0.12, { type: 'square', vol: 0.16, dest: musicGain });
    if (step % 4 === 2) noiseTick();
    step++;
  }, tempo * 1000);
}

function noiseTick() {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.03);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = 0.12;
  s.connect(g);
  g.connect(musicGain);
  s.start(t0);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
