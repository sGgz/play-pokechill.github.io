import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { IDBFactory } from 'fake-indexeddb';
import { CloudStorage, emptyState, payloadRaw } from '../cloud-save/storage';
import { hashPayload, type RemoteSave, type SavePayload } from '../cloud-save/protocol';

const { JSDOM } = createRequire(import.meta.url)('jsdom');
test('the actual checkbox change persists the selected value through busy-state rerenders', async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://fixture.test' });
    const originalFetch = globalThis.fetch;
    const globals = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval'];
    const descriptors = globals.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    const slot = crypto.randomUUID();
    const payload: SavePayload = { gameId: 'pokechill', gameData: { saved: { version: 5, firstTimePlaying: false }, team: {} } };
    const hash = await hashPayload(payload);
    const remote: RemoteSave = { blobSha: 'a'.repeat(40), envelope: {
        schemaVersion: 1, slotId: slot, revision: 1, snapshotId: crypto.randomUUID(), parentSnapshotId: null,
        serverSavedAt: new Date().toISOString(), clientSavedAt: new Date().toISOString(), deviceId: crypto.randomUUID(),
        gameVersion: '5', clientBuild: 'test', payloadHash: hash, payload,
    } };
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: { request(_name: string, _options: unknown, callback: (lock: object) => unknown) { callback({}); return Promise.resolve(); } } },
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        const storage = new CloudStorage();
        const state = emptyState();
        Object.assign(state, { slotId: slot, localKey: 'gameData', base: {
            blobSha: remote.blobSha, revision: 1, payloadHash: hash, serverSavedAt: remote.envelope.serverSavedAt,
        } });
        await storage.saveState(state);
        localStorage.setItem('gameData', payloadRaw(payload));
        globalThis.fetch = async input => Response.json(String(input).endsWith('/status') ? { slotId: slot } : remote);
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        await game.bootstrap(); game.started();
        const checkbox = document.getElementById('pc-cloud-auto') as HTMLInputElement;
        assert.equal(checkbox.disabled, false);
        for (const selected of [true, false]) {
            checkbox.checked = selected;
            checkbox.dispatchEvent(new dom.window.Event('change'));
            await new Promise(resolve => setTimeout(resolve, 20));
            assert.equal(checkbox.checked, selected);
            assert.equal((await storage.getState()).autoSync, selected);
        }
    } finally {
        globalThis.fetch = originalFetch;
        globals.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});
