// Wattle's Moonlit Getaway — hand-in program for make.fun's turkey-run-game-01.
//
// The game itself is the static folder game/ (index.html + ES modules, every picture drawn
// in code on a <canvas>, every sound synthesised with WebAudio, no network request).
// screenshots/ holds the four scenes listed in shots.json (title, run, last-feather danger,
// escaped ending), rendered from game/src/shots.js by tools/take-shots.sh.
// This program copies game/ and screenshots/ to the output directory and writes
// dossier.json with the kit's unchanged vendor/makefun-game.ts library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22.18+ runs this TypeScript file directly; standard library only.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string): void {
  const from = join(root, name);
  const to = join(outDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyFolder('game');
copyFolder('screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
