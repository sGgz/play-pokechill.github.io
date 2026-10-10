import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { CloudStorage, emptyState, payloadRaw, readLocal, recoverInstall } from '../cloud-save/storage';
import type { SavePayload } from '../cloud-save/protocol';

const payload = (money: number): SavePayload => ({
    gameId: 'pokechill', gameData: { saved: { firstTimePlaying: false, version: 5, money }, team: {} },
});
function browserStorage() {
    const values = new Map<string, string>();
    return {
        fail: false,
        get length() { return values.size; }, clear() { values.clear(); },
        key(index: number) { return [...values.keys()][index] ?? null; },
        getItem(key: string) { return values.get(key) ?? null; },
        removeItem(key: string) { values.delete(key); },
        setItem(key: string, value: string) {
            if (this.fail && key === 'gameData') { this.fail = false; throw new DOMException('quota', 'QuotaExceededError'); }
            values.set(key, value);
        },
    };
}
function fixture() { globalThis.indexedDB = new IDBFactory(); return new CloudStorage(); }

test('a reload after data replacement replays metadata and preserves the original local JSON', async () => {
    const storage = fixture(), local = browserStorage();
    const before = payloadRaw(payload(1)), after = payloadRaw(payload(2));
    local.setItem('gameData', before); local.setItem('unrelated-settings', 'keep'); local.setItem('pokechillCloud:install', 'pending');
    await storage.stageInstall({ key: 'gameData', before, after, remote: null });
    await assert.rejects(recoverInstall(storage, async () => { throw new Error('interrupted'); }, local), /interrupted/);
    assert.equal(readLocal('', local), after); assert.ok(await storage.getJournal());
    const resumed = new CloudStorage();
    await recoverInstall(resumed, async () => resumed.saveState(emptyState()), local);
    assert.equal(await resumed.getJournal(), undefined); assert.equal(local.getItem('pokechillCloud:install'), null);
    assert.equal(local.getItem('unrelated-settings'), 'keep');
    assert.equal((await resumed.allBackups() as any[])[0].local, before);
    assert.equal(await recoverInstall(resumed, async () => {}, local), false);
});
test('quota failure keeps the original save and a replayable durable journal', async () => {
    const storage = fixture(), local = browserStorage();
    const before = payloadRaw(payload(1)), after = payloadRaw(payload(2));
    local.setItem('gameData', before); await storage.stageInstall({ key: 'gameData', before, after, remote: null }); local.fail = true;
    await assert.rejects(recoverInstall(storage, async () => {}, local), /quota/);
    assert.equal(local.getItem('gameData'), before); assert.ok(await storage.getJournal());
    await recoverInstall(storage, async () => {}, local); assert.equal(local.getItem('gameData'), after);
});
test('failed IndexedDB staging never leaves a partial backup or install journal', async () => {
    const storage = fixture();
    const journal = { key: 'gameData', before: null, after: payloadRaw(payload(2)), remote: null, invalid: () => {} };
    await assert.rejects(storage.stageInstall(journal));
    assert.equal(await storage.getJournal(), undefined); assert.deepEqual(await storage.allBackups(), []);
});
test('malformed install data never replaces a local game', async () => {
    const storage = fixture(), local = browserStorage(); local.setItem('gameData', 'original');
    await storage.stageInstall({ key: 'gameData', before: 'original', after: '{}', remote: null });
    await assert.rejects(recoverInstall(storage, async () => {}, local));
    assert.equal(local.getItem('gameData'), 'original'); assert.ok(await storage.getJournal());
});
test('recovery copies are bounded to the newest thirty snapshots', async () => {
    const storage = fixture();
    for (let index = 0; index < 35; index++) await storage.backup(String(index), null, 'test');
    const backups = await storage.allBackups() as any[];
    assert.equal(backups.length, 30); assert.equal(backups[0].local, '5'); assert.equal(backups.at(-1).local, '34');
});

test('switching players preserves legacy data, new-game markers and unrelated settings', async () => {
    const profiles = fixture(), local = browserStorage(), friend = crypto.randomUUID();
    const mine = payloadRaw(payload(1)), theirs = payloadRaw(payload(2));
    local.setItem('gameData', mine);
    local.setItem('pokechillCloud:newGame', 'pending');
    local.setItem('unrelated-settings', 'keep');
    await profiles.selectProfile(friend, local);
    assert.equal(await profiles.getProfile(), friend);
    assert.equal(local.getItem('gameData'), null);
    assert.equal(local.getItem('pokechillCloud:newGame'), null);
    assert.equal(local.getItem('unrelated-settings'), 'keep');
    local.setItem('gameData', theirs);
    await profiles.selectProfile('player', local);
    assert.equal(local.getItem('gameData'), mine);
    assert.equal(local.getItem('pokechillCloud:newGame'), 'pending');
    await profiles.selectProfile(friend, local);
    assert.equal(local.getItem('gameData'), theirs);
});

test('player switch journal replays after quota failure without archiving partial data', async () => {
    const profiles = fixture(), local = browserStorage(), friend = crypto.randomUUID();
    const mine = payloadRaw(payload(1)), theirs = payloadRaw(payload(2));
    local.setItem('gameData', mine);
    await profiles.selectProfile(friend, local);
    local.setItem('gameData', theirs);
    local.fail = true;
    await assert.rejects(profiles.selectProfile('player', local), /quota/);
    assert.equal(await profiles.getProfile(), friend);
    assert.equal(await profiles.hasProfileJournal(), true);
    const recovery = await profiles.profileRecovery() as any[];
    assert.ok(recovery.some(entry => entry.local === mine));
    assert.ok(recovery.some(entry => entry.local === theirs));
    const reopened = new CloudStorage();
    await reopened.selectProfile('player', local);
    assert.equal(await reopened.hasProfileJournal(), false);
    assert.equal(local.getItem('gameData'), mine);
    await reopened.selectProfile(friend, local);
    assert.equal(local.getItem('gameData'), theirs);
});

test('players have separate pending uploads, conflict records, backups and install journals', async () => {
    const primary = fixture(), friend = new CloudStorage(crypto.randomUUID());
    const state = emptyState();
    state.latest = payload(99); state.autoSync = true; state.hasConflict = true;
    await primary.saveState(state);
    await primary.backup(payloadRaw(payload(1)), null, 'primary');
    await primary.stageInstall({ key: 'gameData', before: null, after: payloadRaw(payload(2)), remote: null });
    assert.equal((await friend.getState()).latest, null);
    assert.equal((await friend.getState()).autoSync, false);
    assert.equal((await friend.getState()).hasConflict, false);
    assert.deepEqual(await friend.allBackups(), []);
    assert.equal(await friend.getJournal(), undefined);
    assert.equal((await new CloudStorage().getState()).latest?.gameData.saved.money, 99);
    assert.throws(() => new CloudStorage('../escape'));
});
