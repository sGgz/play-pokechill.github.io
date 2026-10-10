import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { IDBFactory } from 'fake-indexeddb';
import { CloudStorage, emptyState, payloadRaw } from '../cloud-save/storage';
import { hashPayload, type RemoteSave, type SavePayload } from '../cloud-save/protocol';

const { JSDOM } = createRequire(import.meta.url)('jsdom');
// esbuild supplies this constant to the real browser bundle.
Object.defineProperty(globalThis, '__GAME_VERSION__', { configurable: true, value: '5' });
test('the controller persists checkbox choices and switches players before any cloud upload', { timeout: 5000 }, async () => {
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
        dom.window.saveGame = () => {};
        assert.equal(game.resourceStatus(), 'ready');
        const beforeUpdate = localStorage.getItem('gameData');
        assert.equal(await game.prepareResourceReload(), true);
        assert.equal(game.canRun(), false, 'gameplay must pause until the shell switches complete resource versions');
        assert.equal(await game.prepareResourceReload(), false, 'only one update preparation may hold the pause');
        assert.equal(localStorage.getItem('gameData'), beforeUpdate);
        assert.ok((await storage.allBackups()).some(backup => backup && typeof backup === 'object'
            && 'reason' in backup && backup.reason === 'before-resource-update'));
        game.cancelResourceReload();
        assert.equal(game.canRun(), true, 'a failed native activation must allow the old game to resume');
        let finishCapture!: () => void;
        (game as any).captureQueue = new Promise<void>(resolve => { finishCapture = resolve; });
        const cancelledReload = game.prepareResourceReload();
        game.cancelResourceReload();
        finishCapture();
        assert.equal(await cancelledReload, false, 'a timed-out preparation must not authorize a later native version switch');
        assert.equal(game.canRun(), true);
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

test('failed startup identity is not requested twice and the saved local profile remains available', { timeout: 5000 }, async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://fixture.test' });
    const names = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval', 'fetch'];
    const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    let requests = 0, started = false;
    const raw = JSON.stringify({ saved: { version: 5, firstTimePlaying: false }, team: {} });
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: { request(_name: string, _options: unknown, callback: (lock: object) => unknown) { callback({}); return Promise.resolve(); } } },
            fetch: async (input: unknown) => {
                requests++;
                assert.ok(String(input).endsWith('/identity'), 'failed startup must not continue with unverified cloud access');
                return Response.json({ code: 'LOGIN_REQUIRED', message: '请重新登录' }, { status: 401 });
            },
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        localStorage.setItem('gameData', raw);
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        void game.bootstrap().then(() => { started = true; game.started(); });
        await waitUntil(() => !document.querySelector<HTMLButtonElement>('button[data-action="check"]')!.disabled);
        assert.equal(requests, 1);
        assert.equal(started, false, 'using the last local player requires a deliberate choice');
        const offline = document.querySelector<HTMLButtonElement>('button[data-action="continue"]')!;
        assert.equal(offline.hidden, false);
        assert.equal(offline.disabled, false);
        offline.click();
        await waitUntil(() => started);
        assert.equal(game.canRun(), true);
        assert.equal(localStorage.getItem('gameData'), raw);
        assert.equal(requests, 1);
    } finally {
        names.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});

test('a blocked mobile page can reopen cloud controls and retry after the other tab closes', { timeout: 12000 }, async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="menu-button"><svg><path id="menu-icon" /></svg><div id="menu-items"></div></div><button id="game-action">游戏按钮</button></body></html>', { url: 'https://fixture.test' });
    const names = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval', 'fetch'];
    const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    const slot = crypto.randomUUID();
    let otherTabOpen = true, requests = 0, gameClicks = 0, started = false;
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: { request(_name: string, options: LockOptions, callback: (lock: object | null) => unknown) {
                requests++;
                if (!otherTabOpen || options.ifAvailable) { callback(otherTabOpen ? null : {}); return Promise.resolve(); }
                return new Promise((_resolve, reject) => options.signal!.addEventListener('abort', () => reject(options.signal!.reason), { once: true }));
            }, query: async () => ({ held: otherTabOpen ? [{ name: 'pokechill-game-writer' }] : [], pending: [] }) } },
            fetch: async (input: unknown) => Response.json(String(input).endsWith('/identity')
                ? { playerId: 'player', primaryPlayerId: 'player', playerName: '我', slotId: slot }
                : String(input).endsWith('/status') ? { slotId: slot }
                : { code: 'EMPTY_SLOT', message: 'empty' }, { status: String(input).includes('/slots/') ? 404 : 200 }),
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        void game.bootstrap().then(() => { started = true; game.started(); });
        await waitUntil(() => !document.querySelector<HTMLButtonElement>('button[data-action="check"]')!.disabled);
        const panel = document.getElementById('pc-cloud') as HTMLDetailsElement;
        assert.match(document.getElementById('pc-cloud-status')!.textContent!, /游戏会话尚未释放/);
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
        await waitUntil(() => !retry.disabled);
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

async function waitUntil(condition: () => boolean): Promise<void> {
    const until = Date.now() + 4000;
    while (!condition()) {
        assert.ok(Date.now() < until, 'controller did not settle');
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

test('one mobile page starts even when the browser denies only ifAvailable requests', { timeout: 5000 }, async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="menu-items"></div></body></html>', { url: 'https://fixture.test' });
    const names = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval', 'fetch'];
    const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    let held = false, started = false, saved = 0, release: Promise<unknown> | undefined;
    let finishConnection: (() => void) | undefined;
    let connectionStarted = false;
    let startupIdentities = 0, startupStatuses = 0;
    const slot = crypto.randomUUID();
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: {
                request(_name: string, options: LockOptions, callback: (lock: object | null) => unknown) {
                    if (options.ifAvailable) { callback(null); return Promise.resolve(); }
                    assert.equal(held, false, 'one page must not request its own held lock again');
                    held = true;
                    release = Promise.resolve(callback({})).finally(() => { held = false; });
                    return release;
                },
                query: async () => ({ held: held ? [{ name: 'pokechill-game-writer' }] : [], pending: [] }),
            } },
            fetch: async (input: unknown) => {
                if (!started && String(input).endsWith('/identity')) startupIdentities++;
                if (!started && String(input).endsWith('/status')) startupStatuses++;
                if (String(input).endsWith('/identity') && started) {
                    connectionStarted = true;
                    await new Promise<void>(resolve => { finishConnection = resolve; });
                }
                return Response.json(String(input).endsWith('/identity')
                    ? { playerId: 'player', primaryPlayerId: 'player', playerName: '我', slotId: slot }
                    : String(input).endsWith('/status') ? { slotId: slot }
                    : { code: 'EMPTY_SLOT', message: 'empty' }, { status: String(input).includes('/slots/') ? 404 : 200 });
            },
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        dom.window.saveGame = () => { saved++; };
        void game.bootstrap().then(() => { started = true; game.started(); });
        await waitUntil(() => !document.querySelector<HTMLButtonElement>('button[data-action="check"]')!.disabled);
        assert.equal(started, true, 'a single page must start when a normal lock request can succeed');
        assert.equal(startupIdentities, 1, 'startup must reuse its verified identity instead of repeating network checks');
        assert.equal(startupStatuses, 0, 'reading the authenticated cloud slot already checks availability');
        assert.equal(held, true);
        assert.equal(game.canRun(), true);
        const connection = (game as any).action('check');
        await waitUntil(() => connectionStarted);
        dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide', { persisted: true }));
        assert.equal(saved, 1, 'departing page saves before losing write permission');
        assert.equal(game.canRun(), false, 'a cached page must stop gameplay immediately');
        assert.equal(game.canSave(), false);
        assert.equal(held, true, 'the departing page must finish its active operation before releasing exclusivity');
        finishConnection!();
        await connection;
        await waitUntil(() => !held);
        await release;
    } finally {
        names.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});

test('leaving a blocked page cancels its queued lock request without starting or writing', { timeout: 5000 }, async () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://fixture.test' });
    const names = ['window', 'document', 'localStorage', 'indexedDB', 'navigator', 'setInterval', 'fetch'];
    const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
    let signal: AbortSignal | undefined, started = false, calls = 0;
    try {
        for (const [name, value] of Object.entries({
            window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
            indexedDB: new IDBFactory(), setInterval: () => 0,
            navigator: { locks: { request(_name: string, options: LockOptions, callback: (lock: object | null) => unknown) {
                if (options.ifAvailable) { callback(null); return Promise.resolve(); }
                signal = options.signal;
                return new Promise((_resolve, reject) => signal!.addEventListener('abort', () => reject(signal!.reason), { once: true }));
            } } },
            fetch: async () => { calls++; throw new Error('departed page must not prepare a profile'); },
        })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
        const { CloudGame } = await import('../cloud-save/browser');
        const game = new CloudGame();
        void game.bootstrap().then(() => { started = true; });
        assert.ok(signal, 'startup must enqueue a cancellable lock request');
        dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide', { persisted: true }));
        assert.equal(signal.aborted, true);
        await waitUntil(() => !document.querySelector<HTMLButtonElement>('button[data-action="check"]')!.disabled);
        assert.equal(started, false);
        assert.equal(calls, 0);
        assert.equal(game.canSave(), false);
        assert.equal(game.canRun(), false);
        await (game as any).action('check');
        assert.equal(started, false, 'an obsolete page cannot restart through its retry button');
    } finally {
        names.forEach((name, index) => {
            if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!);
            else Reflect.deleteProperty(globalThis, name);
        });
        dom.window.close();
    }
});
