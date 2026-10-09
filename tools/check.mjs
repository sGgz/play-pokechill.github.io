import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
async function check(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) await check(path);
        else if (/\.(js|mjs)$/.test(path)) execFileSync(process.execPath, ['--check', path], { windowsHide: true });
    }
}
for (const dir of ['scripts', 'tools', 'cloud-save-worker/scripts']) await check(resolve(root, dir));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/<script src="([^"]+)"/g)) {
    if (match[1] !== 'scripts/cloud-save.js') await readFile(resolve(root, match[1]));
}
console.log('Game and tooling JavaScript syntax / entry references checked.');
