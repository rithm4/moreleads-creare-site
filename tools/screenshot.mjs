// Captură de ecran (inclusiv toată pagina) cu Chrome, prin DevTools Protocol.
// Folosit pentru: verificarea paginii pe desktop/mobil și capturile site-urilor din portofoliu.
//
// Rulare:
//   node tools/screenshot.mjs <url> <iesire.png> [--width=1440] [--height=900] [--mobile] [--dpr=1]
//                              [--full] [--reveal] [--wait=1500] [--max-height=16000]
//                              [--format=png|jpeg|webp] [--quality=80] [--settle=700]
//                              [--rate=1]  viteza animațiilor (0.1 = de 10 ori mai încet, pentru verificare)
//   --mobile  emulează un telefon (touch, user agent iPhone); implicit 390x844 la dpr 2
//   --full    toată pagina, nu doar primul ecran
//   --reveal  afișează imediat elementele cu animație la derulare (doar pentru previzualizarea noastră)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) {
  console.error('Folosire: node tools/screenshot.mjs <url> <iesire.png> [--mobile] [--full] ...');
  process.exit(1);
}
const flags = Object.fromEntries(rest.map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));
const mobile = !!flags.mobile;
const width = Number(flags.width || (mobile ? 390 : 1440));
const height = Number(flags.height || (mobile ? 844 : 900));
const dpr = Number(flags.dpr || (mobile ? 2 : 1));
const wait = Number(flags.wait || 1500);
const maxHeight = Number(flags['max-height'] || 16000);
const format = flags.format || 'png';
const quality = Number(flags.quality || 80);
const settle = Number(flags.settle || 700);
const rate = Number(flags.rate || 1);
const errors = [];
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 600);
const profile = mkdtempSync(join(tmpdir(), 'ml-shot-'));
const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--mute-audio', 'about:blank',
], { stdio: 'ignore' });

async function main() {
  let targets;
  for (let i = 0; i < 60 && !targets; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); }
    catch { await sleep(200); }
  }
  const page = targets && targets.find((t) => t.type === 'page');
  if (!page) throw new Error('Chrome nu a pornit');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

  listeners.add((m) => {
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value || a.description).join(' '));
  });
  await send('Runtime.enable');
  await send('Page.enable');
  if (rate !== 1) { await send('Animation.enable'); await send('Animation.setPlaybackRate', { playbackRate: rate }); }
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  if (mobile) {
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    });
  }
  const loaded = new Promise((r) => {
    const l = (m) => { if (m.method === 'Page.loadEventFired') { listeners.delete(l); r(); } };
    listeners.add(l);
  });
  await send('Page.navigate', { url });
  await Promise.race([loaded, sleep(30000)]);
  await sleep(wait);

  // Închidem bannerul de cookie-uri, dacă există: apăsăm butonul de acceptare (în mai multe limbi)
  await evaluate(`(() => {
    const re = /^(accept(ă|a)?( (all|tot|toate|cookies?))?|allow all|agree|i agree|ok|got it|am înțeles|sunt de acord|alle akzeptieren|akzeptieren|принять( все)?|согласен|хорошо|понятно)$/i;
    const el = [...document.querySelectorAll('button, a, [role=button]')].find((b) => re.test((b.innerText || '').trim()));
    if (el) el.click();
  })()`);
  await sleep(600);

  // Derulăm toată pagina ca să se încarce imaginile „lazy” și animațiile, apoi revenim sus
  const total = await evaluate('document.documentElement.scrollHeight');
  for (let y = 0; y < Math.min(total, maxHeight); y += Math.round(height * 0.8)) {
    await evaluate(`window.scrollTo(0, ${y})`);
    await sleep(120);
  }
  if (flags.reveal) await evaluate(`document.querySelectorAll('.ml-reveal').forEach(e => e.classList.add('is-in'))`);
  // Imaginile „lazy” din carusele orizontale nu se încarcă la derularea pe verticală: le forțăm și așteptăm să apară (max. 8 s)
  await evaluate(`Promise.race([
    Promise.all([...document.images].map((img) => {
      img.loading = 'eager';
      return img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; });
    })),
    new Promise((r) => setTimeout(r, 8000)),
  ])`);
  await evaluate('window.scrollTo(0, 0)');
  await sleep(settle);

  const info = await evaluate(`(() => {
    const d = document.documentElement, cw = d.clientWidth;
    const wide = [];
    if (d.scrollWidth > cw) {
      for (const e of document.querySelectorAll('body *')) {
        const r = e.getBoundingClientRect();
        if (r.width && r.right > cw + 1 && getComputedStyle(e).position !== 'fixed') {
          wide.push(e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\\s+/).join('.') + ' → ' + Math.round(r.right) + 'px');
          if (wide.length > 12) break;
        }
      }
    }
    return { latime: cw, latimeContinut: d.scrollWidth, inaltime: d.scrollHeight, depasesc: wide };
  })()`);

  const shotHeight = flags.full ? Math.min(info.inaltime, maxHeight) : height;
  const shot = await send('Page.captureScreenshot', {
    format,
    ...(format === 'png' ? {} : { quality }),
    captureBeyondViewport: !!flags.full,
    clip: { x: 0, y: 0, width, height: shotHeight, scale: 1 },
  });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(JSON.stringify({ fisier: out, ...info, erori: errors }, null, 2));
  ws.close();
}

main()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => {
    proc.kill();
    setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} }, 500);
  });
