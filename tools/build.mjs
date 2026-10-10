import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
// The delete target is a fixed build directory within this repository.
if (relative(root, output) !== 'dist') throw new Error('Unsafe build directory');
await rm(output, { recursive: true, force: true });
await mkdir(output);
const assets = ['index.html', 'styles.css', 'cloud-save.css', 'font', 'img', 'scripts'];
for (const asset of assets) await cp(resolve(root, asset), resolve(output, asset), { recursive: true });

const hash = createHash('sha256');
async function hashSource(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) await hashSource(path);
        else { hash.update(relative(root, path)); hash.update(await readFile(path)); }
    }
}
for (const name of ['scripts', 'cloud-save']) await hashSource(resolve(root, name));
for (const name of ['index.html', 'styles.css', 'cloud-save.css']) hash.update(await readFile(resolve(root, name)));
const versionMatch = (await readFile(resolve(root, 'scripts/script.js'), 'utf8')).match(/saved\.version = ([0-9.]+)\s/);
if (!versionMatch) throw new Error('Cannot identify PokeChill game version');
const gameVersion = String(Number(versionMatch[1]));
const buildId = hash.digest('hex').slice(0, 20);
await build({
    entryPoints: [resolve(root, 'scripts/i18n/browser.mjs')], outfile: resolve(output, 'scripts/zh-cn.js'),
    bundle: true, format: 'iife', platform: 'browser', target: 'es2022', minify: true,
});
await build({
    entryPoints: [resolve(root, 'cloud-save/browser.ts')], outfile: resolve(output, 'scripts/cloud-save.js'),
    bundle: true, format: 'iife', platform: 'browser', target: 'es2022', minify: true,
    define: { __GAME_VERSION__: JSON.stringify(gameVersion), __CLIENT_BUILD__: JSON.stringify(buildId) },
});
const html = await readFile(resolve(output, 'index.html'), 'utf8');
await writeFile(resolve(output, 'index.html'), html.replace('content="development"', 'content="' + buildId + '"'), 'utf8');
await writeFile(resolve(output, 'build-info.json'), JSON.stringify({ gameVersion, buildId }) + '\n', 'utf8');

// Git retains both spellings; Windows checks out one. Map aliases to the actual output spelling.
const tracked = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim().split('\n');
const groups = new Map();
for (const path of tracked.filter(path => path.startsWith('img/'))) {
    const key = path.toLowerCase();
    groups.set(key, [...(groups.get(key) || []), path]);
}
const actual = [];
async function listImages(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) await listImages(path);
        else actual.push(relative(output, path).replaceAll('\\', '/'));
    }
}
await listImages(resolve(output, 'img'));
const redirects = [];
for (const variants of groups.values()) {
    if (variants.length < 2) continue;
    const present = actual.filter(path => path.toLowerCase() === variants[0].toLowerCase());
    for (const alias of variants.filter(path => !present.includes(path))) {
        redirects.push('/' + alias + ' /' + present[0] + ' 302');
    }
}
await writeFile(resolve(output, '_redirects'), redirects.join('\n') + '\n', 'utf8');
console.log(`Built PokeChill ${gameVersion} (${buildId}); ${redirects.length} Windows image aliases.`);
