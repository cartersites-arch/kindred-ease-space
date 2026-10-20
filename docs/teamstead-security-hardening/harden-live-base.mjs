import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.argv[2];
if (!root) throw new Error('Usage: node harden-live-base.mjs <deployment-directory>');

const htmlPath = path.join(root, 'index.html');
let html = await readFile(htmlPath, 'utf8');
const entry = html.match(/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js/)?.[0];
if (!entry) throw new Error('Maintenance Hub entry bundle was not found');

const bundlePath = path.join(root, entry);
let bundle = await readFile(bundlePath, 'utf8');
const marker = 'pms_offline_inspections_queue';
const markerAt = bundle.indexOf(marker);
const moduleStart = bundle.lastIndexOf('__d(', markerAt);
const moduleEnd = bundle.indexOf('__d(', markerAt + marker.length);
if (markerAt < 0 || moduleStart < 0) throw new Error('Offline inspection queue module was not found');
const end = moduleEnd < 0 ? bundle.length : moduleEnd;
const before = bundle.slice(moduleStart, end);
const after = before.replaceAll('window.localStorage', 'window.sessionStorage');
if (after === before || !after.includes('window.sessionStorage')) {
  throw new Error('Offline inspection queue storage was not changed');
}
bundle = bundle.slice(0, moduleStart) + after + bundle.slice(end);
await writeFile(bundlePath, bundle);

const oldBoot = `(function(){var u=new URL(location.href),h=new URLSearchParams(u.hash.slice(1));if(h.has('hub')){window.__pmsHubToken=h.get('hub');u.hash='';history.replaceState(null,'',u.pathname+u.search);}})();`;
const newBoot = `(function(){var k='pms_offline_inspections_queue';try{var q=localStorage.getItem(k);if(q&&!sessionStorage.getItem(k))sessionStorage.setItem(k,q);localStorage.removeItem(k);}catch{}var u=new URL(location.href),h=new URLSearchParams(u.hash.slice(1));if(h.has('hub')){window.__pmsHubToken=h.get('hub');u.hash='';history.replaceState(null,'',u.pathname+u.search);}})();`;
if (!html.includes(oldBoot)) throw new Error('Expected private-link boot script was not found');
const oldHash = `'sha256-${createHash('sha256').update(oldBoot).digest('base64')}'`;
const newHash = `'sha256-${createHash('sha256').update(newBoot).digest('base64')}'`;
if (!html.includes(oldHash)) throw new Error('Expected boot-script CSP hash was not found');
html = html.replace(oldBoot, newBoot).replace(oldHash, newHash);
await writeFile(htmlPath, html);

console.log(JSON.stringify({
  bundle: entry,
  queueStorage: 'sessionStorage',
  legacyPersistentQueueRemoved: true,
  cspHashUpdated: true,
}));
