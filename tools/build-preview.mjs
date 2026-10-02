// Asamblează blocurile din tilda-blocuri/ într-un singur preview.html,
// înfășurate ca în Tilda (div.t-rec > div.t123), plus simularea formularului popup.
// Rulare: node tools/build-preview.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blocksDir = join(root, 'tilda-blocuri');

const files = readdirSync(blocksDir).filter((f) => /^\d{2}-.+\.html$/.test(f)).sort();
const blocks = files
  .map((f) => `<!-- ${f} -->\n<div class="t-rec"><div class="t123">\n${readFileSync(join(blocksDir, f), 'utf8')}\n</div></div>`)
  .join('\n\n');
const mock = readFileSync(join(root, 'preview', 'mock-popup.html'), 'utf8');

const html = `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Previzualizare · Creare site-uri | MoreLeads</title>
<style>body{margin:0;background:#F5F4FA}</style>
</head>
<body>
${blocks}

${mock}
</body>
</html>
`;

writeFileSync(join(root, 'preview.html'), html);
console.log(`preview.html: ${files.length} blocuri (${files.join(', ')})`);
