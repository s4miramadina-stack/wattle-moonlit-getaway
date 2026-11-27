// Keyboard and mouse, read as "held" and "pressed this frame".

const KEYMAP = {
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  ArrowDown: 'duck', KeyS: 'duck',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyK: 'dash',
  KeyE: 'decoy',
  Enter: 'confirm',
  KeyP: 'pause', Escape: 'pause',
  KeyM: 'mute',
  KeyR: 'restart',
  KeyN: 'newNight',
};

export function createInput(canvas, viewW, viewH) {
  const held = new Set();
  const pressed = new Set();
  const mouse = { x: viewW / 2, y: viewH / 2, clicked: false, down: false };

  window.addEventListener('keydown', (e) => {
    const action = KEYMAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (!held.has(action)) pressed.add(action);
    held.add(action);
  });
  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (action) held.delete(action);
  });
  window.addEventListener('blur', () => held.clear());

  const toView = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * viewW;
    mouse.y = ((e.clientY - r.top) / r.height) * viewH;
  };
  canvas.addEventListener('mousemove', toView);
  canvas.addEventListener('mousedown', (e) => {
    toView(e);
    mouse.down = true;
    mouse.clicked = true;
    canvas.focus();
  });
  window.addEventListener('mouseup', () => { mouse.down = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    mouse,
    isHeld: (a) => held.has(a),
    wasPressed: (a) => pressed.has(a),
    endFrame() {
      pressed.clear();
      mouse.clicked = false;
    },
  };
}
