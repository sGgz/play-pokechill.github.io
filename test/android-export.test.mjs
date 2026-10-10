import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const { JSDOM } = createRequire(import.meta.url)('jsdom');

test('Android exports detached anchors even when the upstream immediately revokes the blob', async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://game.example.com', runScripts: 'outside-only' });
    try {
        const exports = [], errors = [];
        const source = await readFile(new URL('../android/app/src/main/js/exports.js', import.meta.url), 'utf8');
        dom.window.URL.createObjectURL = () => 'blob:https://game.example.com/test';
        dom.window.URL.revokeObjectURL = () => {};
        dom.window.fetch = () => { throw new Error('A revoked blob must not be fetched'); };
        dom.window.prompt = (message, value) => { exports.push({ message, value: JSON.parse(value) }); return ''; };
        dom.window.alert = message => errors.push(message);
        dom.window.eval(source);
        dom.window.eval(source); // Repeated page-finished callbacks must not double-wrap exports.
        const text = JSON.stringify({ saved: { version: 5 }, nickname: '皮卡丘' });
        const blob = new Blob([text], { type: 'application/json' });
        const url = dom.window.URL.createObjectURL(blob);
        const anchor = dom.window.document.createElement('a');
        anchor.href = url; anchor.download = 'Pokechill.json'; anchor.click();
        dom.window.URL.revokeObjectURL(url);
        await new Promise(resolve => setTimeout(resolve, 20));
        assert.deepEqual(errors, []);
        assert.deepEqual(exports, [{ message: 'pokechill-export', value: { name: 'Pokechill.json', text } }]);
    } finally { dom.window.close(); }
});
