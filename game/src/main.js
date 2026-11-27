// Entry point: the screen flow (title -> run -> pause -> ending -> run again), the fixed-step
// game loop, and wiring keyboard + mouse to the run. ?shot=... renders a still scene instead.

import { VIEW_W, VIEW_H } from './config.js';
import { createInput } from './input.js';
import { createRun, stepRun, tossDecoy } from './world/run.js';
import { drawWorld } from './render/scene.js';
import { drawHud } from './render/hud.js';
import { drawTitle, drawPause, drawEnd, drawEndTableau } from './render/screens.js';
import { buildShot } from './shots.js';
import { sfx, startMusic, stopMusic, toggleMute } from './audio.js';

const STEP = 1 / 60;
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const input = createInput(canvas, VIEW_W, VIEW_H);

const game = { screen: 'title', run: null, t: 0, best: loadBest() };

function loadBest() {
  try { return Number(window.localStorage.getItem('wattle.best')) || 0; } catch { return 0; }
}
function saveBest(score) {
  game.best = Math.max(game.best, Math.floor(score));
  try { window.localStorage.setItem('wattle.best', String(game.best)); } catch { /* private mode */ }
}

function startRun() {
  sfx.unlock();
  sfx.gobble();
  startMusic();
  game.run = createRun((Date.now() ^ 0x5bd1e995) >>> 0);
  game.screen = 'play';
}

function update(dt) {
  game.t += dt;
  const go = input.wasPressed('confirm') || input.mouse.clicked;
  if (input.wasPressed('mute')) toggleMute();
  if (game.screen === 'title') {
    if (go || input.wasPressed('jump')) startRun();
  } else if (game.screen === 'pause') {
    if (input.wasPressed('pause') || go) game.screen = 'play';
    if (input.wasPressed('restart')) startRun();
  } else if (game.screen === 'play') {
    const run = game.run;
    if (input.wasPressed('pause')) { game.screen = 'pause'; return; }
    if (input.wasPressed('restart')) { startRun(); return; }
    if (input.mouse.clicked) tossDecoy(run, input.mouse.x);
    if (input.wasPressed('decoy')) tossDecoy(run, 360);
    stepRun(run, dt, {
      left: input.isHeld('left'),
      right: input.isHeld('right'),
      jumpHeld: input.isHeld('jump'),
      jumpPressed: input.wasPressed('jump'),
      duck: input.isHeld('duck'),
      dashPressed: input.wasPressed('dash'),
    });
    if (run.outcome) {
      saveBest(run.score);
      stopMusic();
      game.screen = 'end';
    }
  } else if (game.screen === 'end') {
    stepRun(game.run, dt, {});
    if (game.run.endT > 0.8 && (go || input.wasPressed('restart'))) startRun();
  }
}

function render() {
  if (game.screen === 'title') {
    drawTitle(ctx, game.t, game.best);
    return;
  }
  if (game.screen === 'end') {
    drawEndTableau(ctx, game.run);
    drawEnd(ctx, game.run, game.best);
    return;
  }
  drawWorld(ctx, game.run);
  drawHud(ctx, game.run);
  if (game.screen === 'pause') drawPause(ctx);
}

function loop() {
  let last = performance.now();
  let acc = 0;
  const frame = (now) => {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      update(STEP);
      input.endFrame();
      acc -= STEP;
    }
    render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  const scene = buildShot(shot, Number(params.get('seed')) || 1);
  game.screen = scene.screen;
  game.run = scene.run || null;
  game.t = scene.t || 0;
  render();
  document.body.dataset.shotReady = '1';
} else {
  loop();
}
