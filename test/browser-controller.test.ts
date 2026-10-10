import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { IDBFactory } from 'fake-indexeddb';
import { CloudStorage, emptyState, payloadRaw } from '../cloud-save/storage';
import { hashPayload, type RemoteSave, type SavePayload } from '../cloud-save/protocol';

const { JSDOM } = createRequire(import.meta.url)('jsdom');
test('the controller persists checkbox choices and switches players before any cloud upload', async () => {
    const dom = new JSDOM('<!doctype html><html><body><button id="menu-button" class="menu-button-open"></button><div id="menu-items"></div></body></html>', { url: 'https://fixture.test' });
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
        globalThis.fetch = async input => Response.json(String(input).endsWith('/identity')
            ? { slotId: slot, playerId: 'player', primaryPlayerId: 'player', playerName: '我' }
            : String(input).endsWith('/status') ? { slotId: slot } : remote);
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        await game.bootstrap(); game.started();
        const panel = document.getElementById('pc-cloud') as HTMLDetailsElement;
        assert.equal(panel.open, false);
        const entry = document.getElementById('menu-item-cloud-save') as HTMLButtonElement;
        entry.click();
        assert.equal(panel.open, true);
        assert.equal(document.getElementById('menu-button')?.classList.contains('menu-button-open'), false);
        panel.open = false;
        await new Promise(resolve => setTimeout(resolve, 20));
        assert.equal(entry.getAttribute('aria-expanded'), 'false');
        const checkbox = document.getElementById('pc-cloud-auto') as HTMLInputElement;
        assert.equal(checkbox.disabled, false);
        for (const selected of [true, false]) {
            checkbox.checked = selected;
            checkbox.dispatchEvent(new dom.window.Event('change'));
            await new Promise(resolve => setTimeout(resolve, 20));
            assert.equal(checkbox.checked, selected);
            assert.equal((await storage.getState()).autoSync, selected);
        }
        let uploads = 0, reloads = 0, saves = 0;
        const friend = crypto.randomUUID(), friendSlot = crypto.randomUUID();
        const mine = localStorage.getItem('gameData');
        Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: {
            saveGame: () => { saves++; }, location: { reload: () => { reloads++; } },
        } });
        globalThis.fetch = async (input, init) => {
            if (init?.method === 'PUT') uploads++;
            assert.ok(String(input).endsWith('/identity'), 'must stop before reading/uploading the other player cloud');
            return Response.json({ playerId: friend, primaryPlayerId: 'player', playerName: '朋友', slotId: friendSlot });
        };
        await (game as any).action('sync');
        assert.equal(uploads, 0);
        assert.equal(saves, 1);
        assert.equal(reloads, 1);
        assert.equal(game.canSave(), false);
        assert.equal(game.canRun(), false);
        assert.equal(localStorage.getItem('gameData'), null);
        assert.equal(await storage.getProfile(), friend);
        await game.importData(payload.gameData);
        assert.equal(await storage.getJournal(), undefined, 'a pending player reload must block imports into the old player storage');
        assert.equal(localStorage.getItem('gameData'), null);
        await storage.selectProfile('player');
        assert.equal(localStorage.getItem('gameData'), mine);
        assert.equal((await new CloudStorage(friend).getState()).latest, null);
    } finally {
        globalThis.fetch = originalFetch;
        globals.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});

test('a blocked mobile page can reopen cloud controls and retry after the other tab closes', { timeout: 5000 }, async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="menu-button"><svg><path id="menu-icon" /></svg><div id="menu-items"></div></div><button id="game-action">游戏按钮</button></body></html>', { url: 'https://fixture.test' });
    const names = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval', 'fetch'];
    const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    const slot = crypto.randomUUID();
    let otherTabOpen = true, requests = 0, gameClicks = 0, started = false;
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: { request(_name: string, _options: unknown, callback: (lock: object | null) => unknown) {
                requests++; callback(otherTabOpen ? null : {}); return Promise.resolve();
            } } },
            fetch: async (input: unknown) => Response.json(String(input).endsWith('/identity')
                ? { playerId: 'player', primaryPlayerId: 'player', playerName: '我', slotId: slot }
                : String(input).endsWith('/status') ? { slotId: slot }
                : { code: 'EMPTY_SLOT', message: 'empty' }, { status: String(input).includes('/slots/') ? 404 : 200 }),
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        void game.bootstrap().then(() => { started = true; game.started(); });
        await new Promise(resolve => setTimeout(resolve, 20));
        const panel = document.getElementById('pc-cloud') as HTMLDetailsElement;
        assert.match(document.getElementById('pc-cloud-status')!.textContent!, /另一个标签页/);
        assert.equal(game.canSave(), false);
        document.getElementById('game-action')!.addEventListener('click', () => { gameClicks++; });
        const pointer = new dom.window.Event('pointerdown', { bubbles: true, cancelable: true });
        document.getElementById('menu-icon')!.dispatchEvent(pointer);
        assert.equal(pointer.defaultPrevented, false, 'touch pointerdown must still allow the browser to dispatch click');
        panel.open = false;
        document.getElementById('menu-icon')!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
        assert.equal(panel.open, true, 'the mobile Pokémon icon must reopen the panel while the game is blocked');
        panel.open = false;
        document.getElementById('menu-item-cloud-save')!.click();
        assert.equal(panel.open, true, 'the cloud menu entry must remain reachable while blocked');
        panel.open = false;
        document.querySelector('#menu-button > svg')!.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        assert.equal(panel.open, true, 'keyboard activation must reach cloud controls while blocked');
        document.getElementById('game-action')!.click();
        assert.equal(gameClicks, 0, 'reopening cloud controls must not enable gameplay without the lock');
        const retry = panel.querySelector<HTMLButtonElement>('button[data-action="check"]')!;
        assert.equal(retry.disabled, false);
        retry.click();
        await new Promise(resolve => setTimeout(resolve, 20));
        assert.equal(started, false);
        assert.equal(game.canSave(), false);
        otherTabOpen = false;
        retry.click();
        await new Promise(resolve => setTimeout(resolve, 40));
        assert.equal(started, true);
        assert.equal(requests, 3, 'retry must attempt the real writer lock again without stealing it');
        assert.equal(game.canSave(), true);
    } finally {
        names.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});
