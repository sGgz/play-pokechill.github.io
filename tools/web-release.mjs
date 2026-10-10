import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const NATIVE_API = 1;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// A manifest describes a complete release; content-addressed objects make partial
// downloads and deployments harmless and let devices reuse unchanged resources.
export async function createWebRelease(directory, { buildId, gameVersion, aliases = [] }) {
    const files = [];
    const objects = new Map();
    async function visit(relative) {
        const path = join(directory, relative);
        for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
            const name = relative ? relative + '/' + entry.name : entry.name;
            if (!relative && ['updates', '_redirects', '_headers'].includes(name)) continue;
            if (entry.isDirectory()) await visit(name);
            else if (entry.isFile()) {
                const bytes = await readFile(join(directory, name));
                const digest = sha256(bytes);
                files.push({ path: name, sha256: digest, size: bytes.length });
                objects.set(digest, join(directory, name));
            } else throw new Error('Unsupported release entry: ' + name);
        }
    }
    await visit('');
    for (const { from, to } of aliases) {
        const source = files.find(file => file.path === to);
        if (!source || files.some(file => file.path === from)) throw new Error('Invalid image alias: ' + from);
        files.push({ ...source, path: from });
    }
    files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const manifest = { schema: 1, nativeApi: NATIVE_API, buildId, gameVersion, files };
    const updateDir = join(directory, 'updates');
    await mkdir(join(updateDir, 'objects'), { recursive: true });
    for (const [digest, source] of objects) await copyFile(source, join(updateDir, 'objects', digest));
    await writeFile(join(updateDir, 'latest.json'), JSON.stringify(manifest) + '\n', 'utf8');
    return manifest;
}
