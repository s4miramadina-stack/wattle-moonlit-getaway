// Play-test helper: opens the real game (no ?shot) in headless Chrome over the DevTools protocol,
// presses Enter on the title, plays a few seconds with keys and a mouse click, reports any page
// errors and saves frames. Standard library only (Node 22+ has fetch and WebSocket).
//   node tools/playtest.mjs <chrome> <port> <outdir>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [chrome, port, outDir] = process.argv.slice(2);
const profile = mkdtempSync(join(tmpdir(), 'wattle-play-'));
const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, '--window-size=1280,720', 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(1500);
const targets = await (await fetch('http://127.0.0.1:9333/json')).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
});
const send = (method, params = {}) => new Promise((r) => { id += 1; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const key = async (code, type) => send('Input.dispatchKeyEvent', { type, code, key: code, windowsVirtualKeyCode: code === 'Enter' ? 13 : 0 });
const tap = async (code, hold = 80) => { await key(code, 'keyDown'); await sleep(hold); await key(code, 'keyUp'); };
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
  writeFileSync(join(outDir, name), Buffer.from(r.data, 'base64'));
};

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: `http://localhost:${port}/` });
await sleep(1500);
await shot('p0-title.jpg');
await tap('Enter');
await sleep(1200);
for (let i = 0; i < 6; i++) { await tap('Space', 220); await sleep(400); }
await tap('ShiftLeft');
await sleep(300);
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 300, y: 500, button: 'left', clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 300, y: 500, button: 'left', clickCount: 1 });
await sleep(500);
await shot('p1-play.jpg');
await tap('KeyP');
await sleep(300);
await shot('p2-pause.jpg');
await tap('KeyP');
await sleep(15000);
await shot('p3-later.jpg');
const state = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
console.log(JSON.stringify({ errors, title: state?.result?.value }));
ws.close();
proc.kill();
