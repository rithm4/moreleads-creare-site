// Server local pentru previzualizare: reconstruiește preview.html și îl servește pe http://localhost:5500
// Rulare: node tools/serve.mjs   (oprire: Ctrl+C)
// În VS Code: Ctrl+Shift+P → „Simple Browser: Show” → http://localhost:5500/preview.html
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5500);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function build() {
  execFileSync(process.execPath, [join(root, 'tools', 'build-preview.mjs')], { stdio: 'inherit' });
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') path = '/preview.html';
  // La fiecare încărcare a paginii, reconstruim previzualizarea din blocuri
  if (path === '/preview.html') {
    try { build(); } catch { /* afișăm ultima versiune reușită */ }
  }
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nu există: ' + path);
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Previzualizare: http://localhost:${port}/preview.html`);
});
