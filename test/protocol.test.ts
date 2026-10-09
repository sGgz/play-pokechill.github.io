import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareVersions, hashPayload, importPayload, payloadVersion, validatePayload } from '../cloud-save/protocol';

const gameData = () => ({ saved: { version: 5, firstTimePlaying: false, lastFrameRecorded: 123 }, team: {}, pikachu: { caught: true, nickname: '皮卡丘🙂 50%' } });
test('raw original PokeChill JSON preserves every gameplay and Unicode field', () => {
    const raw = gameData(); assert.deepEqual(importPayload(raw), { gameId: 'pokechill', gameData: raw });
    assert.equal(payloadVersion(importPayload(raw)), '5');
});
test('PokéClicker and other-game envelopes are rejected before storage writes', () => {
    assert.throws(() => importPayload({ player: {}, save: {}, settings: {} }));
    assert.throws(() => validatePayload({ gameId: 'another-game', gameData: gameData() }));
});
test('unfinished starts, array teams, invalid versions and timestamps are rejected', () => {
    for (const change of [{ firstTimePlaying: true }, { version: 'unknown' }, { lastFrameRecorded: -1 }, { version: Infinity }]) {
        const raw = gameData(); Object.assign(raw.saved, change); assert.throws(() => importPayload(raw));
    }
    assert.throws(() => importPayload({ ...gameData(), team: [] }));
});
test('numeric upstream versions and dotted versions compare without lexical downgrade errors', () => {
    assert.ok(compareVersions('5.1', '5') > 0); assert.ok(compareVersions('10', '5') > 0); assert.ok(compareVersions('5', '4.9') > 0);
});
test('pollution keys and oversized saves are rejected before cloud submission', () => {
    const raw = JSON.parse(JSON.stringify(gameData()).replace('"team":{}', '"team":{"__proto__":{}}'));
    assert.throws(() => importPayload(raw), /不支持/);
    assert.throws(() => importPayload({ ...gameData(), large: 'x'.repeat(6 * 1024 * 1024) }), /5 MiB/);
});
test('gameplay differences change the hash, while object property ordering does not', async () => {
    const raw = gameData(), a = importPayload(raw), b = importPayload({ pikachu: raw.pikachu, team: raw.team, saved: raw.saved });
    assert.equal(await hashPayload(a), await hashPayload(b));
    assert.notEqual(await hashPayload(a), await hashPayload(importPayload({ ...raw, pikachu: { caught: false } })));
});
