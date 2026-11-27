// Lays out the whole night from a seed: hazards per stage, corn trails, feathers and cover.

import { STAGES, TOTAL_LENGTH } from '../config.js';
import { makeHazard } from './hazards.js';
import { makePickup, makeCover } from './pickups.js';

export function stageAt(m) {
  let start = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (m < start + STAGES[i].length) return { index: i, stage: STAGES[i], start };
    start += STAGES[i].length;
  }
  return { index: STAGES.length - 1, stage: STAGES[STAGES.length - 1], start: start - STAGES[STAGES.length - 1].length };
}

export function buildCourse(rng) {
  const hazards = [];
  const pickups = [];
  const covers = [];
  let start = 0;
  STAGES.forEach((stage, si) => {
    let m = start + (si === 0 ? 30 : 14);
    let nextCover = start + 40 + rng.range(0, 20);
    while (m < start + stage.length - 12) {
      const kind = rng.pick(stage.hazards);
      if (kind !== 'knifeThrow') {
        hazards.push(makeHazard(kind, m, rng));
        // corn hangs over the hazard as a reward for jumping it, or on the ground for ducking
        const over = ['stringLights', 'beam', 'knifeRack'].includes(kind) ? 0 : kind === 'oven' ? 130 : 90;
        pickups.push(makePickup('corn', m, over));
      }
      const gap = rng.range(stage.gapMin, stage.gapMax);
      // a short corn trail in the gap
      if (gap > 8 && rng.chance(0.7)) {
        for (let k = 1; k <= 3; k++) pickups.push(makePickup('corn', m + gap * (k / 4), 10 + Math.sin(k) * 10));
      }
      if (rng.chance(0.06 + si * 0.02)) pickups.push(makePickup('feather', m + gap / 2, 120));
      if (m + gap > nextCover) {
        covers.push(makeCover(stage.cover, m + gap / 2));
        nextCover = m + gap + rng.range(45, 70);
      }
      m += gap;
    }
    start += stage.length;
  });
  return { hazards, pickups, covers, length: TOTAL_LENGTH };
}
