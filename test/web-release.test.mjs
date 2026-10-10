import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWebRelease, sha256 } from '../tools/web-release.mjs';
import { validateOrigin } from '../tools/android.mjs';

test('complete releases reuse equal content, include image aliases and omit deployment metadata', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'pokechill-release-'));
    try {
        await mkdir(join(directory, 'img'));
        await writeFile(join(directory, 'index.html'), 'game');
        await writeFile(join(directory, 'img/a.png'), 'same image');
        await writeFile(join(directory, 'img/b.png'), 'same image');
        await writeFile(join(directory, '_redirects'), 'private deployment metadata');
        const options = { buildId: '0123456789abcdef0123', gameVersion: '5', aliases: [{ from: 'img/A.png', to: 'img/a.png' }] };
        const manifest = await createWebRelease(directory, options);
        assert.deepEqual(manifest.files.map(file => file.path), ['img/A.png', 'img/a.png', 'img/b.png', 'index.html']);
        const images = manifest.files.filter(file => file.path.startsWith('img/'));
        assert.equal(new Set(images.map(file => file.sha256)).size, 1);
        assert.equal(await readFile(join(directory, 'updates/objects', images[0].sha256), 'utf8'), 'same image');
        assert.deepEqual(await createWebRelease(directory, options), manifest, 'generated updates must not recursively enter the next release');
        await writeFile(join(directory, 'img/a.png'), 'new image');
        const next = await createWebRelease(directory, { ...options, buildId: '1123456789abcdef0123' });
        assert.equal(next.files.find(file => file.path === 'img/b.png').sha256, images[0].sha256);
        assert.equal(next.files.find(file => file.path === 'img/A.png').sha256, sha256('new image'));
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test('APK configuration only accepts an HTTPS origin compatible with server authentication', () => {
    assert.equal(validateOrigin('https://game.example.com/'), 'https://game.example.com');
    for (const value of ['http://game.example.com', 'https://game.example.com/path', 'https://user:password@game.example.com',
        'https://game.example.com:8443', 'https://game.example.com?token=secret', 'https://game.example.com/#fragment']) {
        assert.throws(() => validateOrigin(value), undefined, value);
    }
});
