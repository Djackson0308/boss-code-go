import { readFile, writeFile, mkdir, copyFile, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const mobile = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(mobile, '..'), out = resolve(mobile, 'www');
const baseline = JSON.parse(await readFile(resolve(mobile, 'source-baseline.json')));
const release = JSON.parse(await readFile(resolve(mobile, 'release.json')));
const hashes = {};
await mkdir(out, { recursive: true });
for (const name of ['isolated-test-fixtures.js','fixture-video.mp4']) await unlink(resolve(out,name)).catch(error => { if(error.code !== 'ENOENT') throw error; });
for (const item of baseline.files) {
  const path = resolve(root, item.path);
  assert(path.startsWith(root + '/') || path.startsWith(root + '\\'));
  const bytes = await readFile(path);
  const normalized = item.normalization === 'lf' ? Buffer.from(bytes.toString().replaceAll('\r\n', '\n')) : bytes;
  const git = createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${normalized.length}\0`), normalized])).digest('hex');
  if (git !== item.gitSha) assert.equal(createHash('sha256').update(bytes.toString().replaceAll('\r\n', '\n')).digest('hex'), item.normalizedSha256, `Shared source diverged from reviewed production: ${item.path}. Review and refresh source-baseline.json.`);
  const destination = resolve(out, item.path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(path, destination);
  hashes[item.path] = createHash('sha256').update(bytes).digest('hex');
}
// Use the same production source. These additions exist only in the staged native bundle.
await writeFile(resolve(out, 'app.js'), (await readFile(resolve(out, 'app.js'), 'utf8')) + '\n' + await readFile(resolve(mobile, 'src/app-hook.js'), 'utf8'));
let html = await readFile(resolve(out, 'index.html'), 'utf8');
assert(html.includes('#decision-makers-screen #decision-sessions { display:none !important; }'));
html = html.replace('content="width=device-width, initial-scale=1.0"', 'content="width=device-width, initial-scale=1.0, viewport-fit=cover"');
html = html.replace('</head>', '<link rel="stylesheet" href="native.css">\n<script src="native.js"></script>\n</head>');
html = html.replace('https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css', 'vendor/maplibre-gl.css').replace('https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.js', 'vendor/maplibre-gl.js');
if (process.env.BOSS_GO_TEST_FIXTURES === '1') {
  html = html.replace('<script src="native.js"></script>', '<script src="native.js"></script>\n<script src="isolated-test-fixtures.js"></script>');
  await copyFile(resolve(mobile, 'tests/isolated-fixtures.js'), resolve(out, 'isolated-test-fixtures.js'));
  await copyFile(resolve(root, 'backend/tests/fixtures/video.mp4'), resolve(out, 'fixture-video.mp4'));
}
await writeFile(resolve(out, 'index.html'), html);
for (const name of ['native.css', 'offline.html']) await copyFile(resolve(mobile, 'src', name), resolve(out, name));
await mkdir(resolve(out, 'vendor'), { recursive: true });
for (const item of baseline.vendor) {
  const bytes = await readFile(resolve(mobile, 'vendor', item.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.file + ' integrity');
  await copyFile(resolve(mobile, 'vendor', item.file), resolve(out, 'vendor', item.file));
}
await build({ entryPoints: [resolve(mobile, 'src/native.js')], outfile: resolve(out, 'native.js'), bundle: true, platform: 'browser', format: 'iife', target: ['safari15', 'chrome100'], define: { __GO_RELEASE__: JSON.stringify(release) } });
await writeFile(resolve(mobile, 'build-manifest.json'), JSON.stringify({ sourceCommit: baseline.commit, version: release.version, buildNumber: release.buildNumber, appId: release.appId, isolatedTestFixtures: process.env.BOSS_GO_TEST_FIXTURES === '1', sharedSourceSha256: hashes, nativeOnlyAdditions: ['app-hook.js', 'native.js', 'native.css', 'offline.html'], remoteContentBundled: false }, null, 2));
console.log(`Bundled reviewed shared frontend ${baseline.commit}; remote content remains API-driven.`);
