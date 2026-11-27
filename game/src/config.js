// Tuning, palette and the three stages of the night. Everything else reads from here.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600;
export const PX_PER_M = 40;
export const TURKEY_X = 560;

// Moonlit harvest palette: indigo night, slate-blue turkey, cranberry, lantern amber, frost teal.
export const PAL = {
  ink: '#0b0f24',
  night0: '#101538',
  night1: '#1d2460',
  night2: '#3b3f86',
  dusk: '#6b4a8a',
  moon: '#f4ecd0',
  moonGlow: 'rgba(244,236,208,0.18)',
  frost: '#8fd3d1',
  frostDim: '#4d8c97',
  slate: '#5d6f99',
  slateDark: '#3a4670',
  slateLight: '#9fb0d6',
  cranberry: '#c8324b',
  cranberryDark: '#8a1c33',
  amber: '#ffb347',
  amberHot: '#ffd27a',
  pumpkin: '#e8732c',
  pumpkinDark: '#a8481a',
  wheat: '#e6c27a',
  hay: '#d9a74a',
  wood: '#6b3f2a',
  woodDark: '#3e2418',
  copper: '#c9773d',
  tile: '#2f6f73',
  tileLight: '#3f8c8c',
  cream: '#fff4dc',
  danger: '#ff4d5e',
  ok: '#7ee0a4',
};

export const FONT_TITLE = '"Georgia", "DejaVu Serif", "Times New Roman", serif';
export const FONT_UI = '"Trebuchet MS", "DejaVu Sans", "Verdana", sans-serif';

export const TUNE = {
  lives: 3,
  baseSpeed: 7.2, // metres per second
  speedGain: 0.0026, // extra m/s per metre travelled
  maxSpeed: 11.5,
  gravity: 2600,
  jumpVel: 980,
  jumpHoldBoost: 1500,
  jumpHoldTime: 0.18,
  duckSpeedMul: 0.92,
  hideSpeedMul: 0.45,
  stunTime: 0.55,
  hurtInvuln: 1.4,
  dashTime: 0.75,
  dashSpeedAdd: 7,
  maxFeathers: 3,
  decoyCost: 5,
  decoyCooldown: 4.5,
  decoyDistract: 1.8,
  farmerStartGap: 11,
  farmerMaxGap: 26,
  farmerBase: 6.8,
  farmerSprintAdd: 2.4,
  sprintTime: 2.6,
  spotRise: 0.85, // meter per second in the beam
  spotFall: 0.35,
  spotHideFall: 1.4,
  nearMissPx: 26,
};

// The night runs left to right through three places, each harder than the last.
export const STAGES = [
  {
    id: 'patch',
    name: 'The Moonlit Pumpkin Patch',
    short: 'Pumpkin Patch',
    length: 380,
    farmerLine: 'Here, turkey turkey...',
    hazards: ['pumpkin', 'wheelbarrow', 'knifeThrow', 'stringLights'],
    cover: 'cornShock',
    gapMin: 7.5,
    gapMax: 12,
  },
  {
    id: 'barn',
    name: 'The Smokehouse Barn',
    short: 'Smokehouse Barn',
    length: 400,
    farmerLine: 'I can smell those feathers!',
    hazards: ['hayBale', 'dutchOven', 'knifeThrow', 'beam', 'pumpkin'],
    cover: 'haystack',
    gapMin: 6.5,
    gapMax: 10.5,
  },
  {
    id: 'kitchen',
    name: 'The Farmhouse Kitchen',
    short: 'Farmhouse Kitchen',
    length: 440,
    farmerLine: 'The oven is PREHEATED, Wattle!',
    hazards: ['oven', 'knifeRack', 'dutchOven', 'gravy', 'knifeThrow', 'rollingPin'],
    cover: 'pantryCurtain',
    gapMin: 5.8,
    gapMax: 9.5,
  },
];

export const TOTAL_LENGTH = STAGES.reduce((sum, s) => sum + s.length, 0);

export const RANKS = [
  { min: 0, title: 'Drumstick Pending' },
  { min: 900, title: 'Gravy Dodger' },
  { min: 1800, title: 'Feather Duster' },
  { min: 2800, title: 'Moonlight Bolter' },
  { min: 3800, title: 'Presidential Pardon' },
];

export function rankFor(score) {
  let r = RANKS[0];
  for (const x of RANKS) if (score >= x.min) r = x;
  return r.title;
}
