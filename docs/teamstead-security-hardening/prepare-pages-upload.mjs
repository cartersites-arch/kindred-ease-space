import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [rootArg, outputArg, target = 'maintenance-hub', project = 'pms-company-hub'] = process.argv.slice(2);
if (!rootArg || !outputArg) {
  throw new Error('Usage: node prepare-pages-upload.mjs <deployment-directory> <payload.json> [target] [project]');
}

const root = path.resolve(rootArg);
const output = path.resolve(outputArg);
const controls = new Set(['_headers', '_redirects', '_routes.json', '_worker.js']);
const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.ico', 'image/x-icon'],
  ['.pdf', 'application/pdf'],
]);

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

const manifest = {};
const assets = [];
const deploymentControls = [];
for (const absolute of await files(root)) {
  const relative = path.relative(root, absolute).replaceAll('\\', '/');
  const bytes = await readFile(absolute);
  if (controls.has(relative)) {
    deploymentControls.push({ name: relative, filename: relative, value: bytes.toString('utf8') });
    continue;
  }
  const key = createHash('md5').update(bytes).digest('hex');
  const urlPath = '/' + relative;
  manifest[urlPath] = key;
  assets.push({
    base64: true,
    key,
    metadata: { contentType: types.get(path.extname(relative).toLowerCase()) || 'application/octet-stream' },
    path: urlPath,
    value: bytes.toString('base64'),
  });
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ target, project, manifest, assets, controls: deploymentControls }));
console.log(JSON.stringify({ target, project, manifestAssets: Object.keys(manifest).length, controls: deploymentControls.map(item => item.name) }));
