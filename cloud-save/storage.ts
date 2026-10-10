import { hashPayload, importPayload, isUuid, validateRemote } from './protocol';
import type { RemoteSave, SavePayload, UploadRequest } from './protocol';

export interface SyncBase {
    blobSha: string;
    revision: number;
    payloadHash: string;
    serverSavedAt: string;
}

export interface SyncState {
    deviceId: string;
    localKey: string | null;
    slotId: string | null;
    base: SyncBase | null;
    autoSync: boolean;
    latest: SavePayload | null;
    pending: UploadRequest | null;
    hasConflict: boolean;
    remoteConflict: RemoteSave | null;
}

export type RawSave = string | null;
export interface InstallJournal {
    key: string;
    before: RawSave;
    after: string;
    remote: RemoteSave | null;
}

export function emptyState(): SyncState {
    return {
        deviceId: crypto.randomUUID(), localKey: null, slotId: null, base: null,
        autoSync: false, latest: null, pending: null, hasConflict: false, remoteConflict: null,
    };
}

export function readLocal(_key = 'gameData', storage: Storage = localStorage): RawSave {
    return storage.getItem('gameData');
}

export function writeLocal(_key: string, raw: RawSave, storage: Storage = localStorage): void {
    if (raw === null) storage.removeItem('gameData');
    else storage.setItem('gameData', raw);
}

export function rawPayload(raw: RawSave): SavePayload | null {
    return raw ? importPayload(JSON.parse(raw)) : null;
}

export function payloadRaw(payload: SavePayload): string {
    return JSON.stringify(payload.gameData);
}

export interface StateStorage {
    getState(): Promise<SyncState>;
    saveState(state: SyncState): Promise<void>;
}

// Separate origin-local database and keys from PokéClicker, even when both games share a browser.
export class CloudStorage implements StateStorage {
    private database: Promise<IDBDatabase>;

    constructor(profileId = 'player') {
        if (profileId !== 'player' && !isUuid(profileId)) throw new Error('本地玩家身份无效。');
        this.database = new Promise((resolve, reject) => {
            const request = indexedDB.open('pokechill-cloud-save' + (profileId === 'player' ? '' : ':' + profileId), 1);
            request.onupgradeneeded = () => {
                request.result.createObjectStore('kv');
                request.result.createObjectStore('backups', { autoIncrement: true });
            };
            request.onsuccess = () => {
                request.result.onversionchange = () => request.result.close();
                resolve(request.result);
            };
            request.onerror = () => reject(new Error('无法打开浏览器备份空间，请检查隐私模式和存储权限。'));
            request.onblocked = () => reject(new Error('请先关闭其他游戏标签页，再重试。'));
        });
    }

    private async get<T>(key: string): Promise<T | undefined> {
        const database = await this.database;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('kv', 'readonly');
            const request = transaction.objectStore('kv').get(key);
            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    private async mutate(stores: string[], action: (transaction: IDBTransaction) => void): Promise<void> {
        const database = await this.database;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(stores, 'readwrite');
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error('浏览器备份写入失败，请先下载存档并释放空间。'));
            transaction.onabort = transaction.onerror;
            try { action(transaction); } catch (error) { transaction.abort(); reject(error); }
        });
    }

    async getState(): Promise<SyncState> { return (await this.get<SyncState>('state')) || emptyState(); }
    saveState(state: SyncState): Promise<void> {
        return this.mutate(['kv'], transaction => transaction.objectStore('kv').put(state, 'state'));
    }
    getJournal(): Promise<InstallJournal | undefined> { return this.get<InstallJournal>('journal'); }
    stageInstall(journal: InstallJournal): Promise<void> {
        return this.mutate(['kv', 'backups'], transaction => {
            this.addBackup(transaction, { time: new Date().toISOString(), reason: 'before-install', local: journal.before, remote: journal.remote });
            transaction.objectStore('kv').put(journal, 'journal');
        });
    }
    clearJournal(): Promise<void> {
        return this.mutate(['kv'], transaction => transaction.objectStore('kv').delete('journal'));
    }
    backup(local: RawSave, remote: RemoteSave | null, reason: string): Promise<void> {
        return this.mutate(['backups'], transaction => {
            this.addBackup(transaction, { time: new Date().toISOString(), reason, local, remote });
        });
    }
    private addBackup(transaction: IDBTransaction, value: unknown): void {
        const backups = transaction.objectStore('backups');
        backups.add(value);
        const keys = backups.getAllKeys();
        keys.onsuccess = () => keys.result.slice(0, -30).forEach(key => backups.delete(key));
    }
    async allBackups(): Promise<unknown[]> {
        const database = await this.database;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('backups', 'readonly');
            const request = transaction.objectStore('backups').getAll();
            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    getProfile(): Promise<string | undefined> { return this.get<string>('activeProfile'); }
    async hasProfileJournal(): Promise<boolean> { return !!await this.get('profileJournal'); }
    async profileRecovery(): Promise<unknown[]> {
        const database = await this.database;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('kv', 'readonly');
            const store = transaction.objectStore('kv');
            const keys = store.getAllKeys(), values = store.getAll();
            transaction.oncomplete = () => resolve(keys.result.flatMap((key, index) => {
                if (typeof key !== 'string' || !(key.startsWith('profile:') || key === 'profileJournal')) return [];
                const value = values.result[index];
                return [{ reason: key, playerId: key === 'profileJournal' ? value.id : key.slice(8),
                    local: (key === 'profileJournal' ? value.values : value).gameData ?? null }];
            }));
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = transaction.onerror;
        });
    }

    // Hold the site writer lock before replaying or switching, before the game reads localStorage.
    async selectProfile(id: string, local: Storage = localStorage): Promise<void> {
        if (id !== 'player' && !isUuid(id)) throw new Error('本地玩家身份无效。');
        type Values = Record<string, string>;
        type Journal = { id: string; values: Values };
        // Only game-owned keys move. Unrelated origin settings stay in place.
        const owned = (key: string) => key === 'gameData' || key.startsWith('pokechillCloud:');
        const finish = async (journal: Journal) => {
            const keys = Array.from({ length: local.length }, (_, index) => local.key(index));
            for (const key of keys) if (key && owned(key)) local.removeItem(key);
            for (const [key, value] of Object.entries(journal.values)) if (owned(key)) local.setItem(key, value);
            await this.mutate(['kv'], transaction => {
                transaction.objectStore('kv').put(journal.id, 'activeProfile');
                transaction.objectStore('kv').delete('profileJournal');
            });
        };
        const journal = await this.get<Journal>('profileJournal');
        if (journal) await finish(journal);
        const active = await this.getProfile() || 'player';
        if (active === id) {
            await this.mutate(['kv'], transaction => transaction.objectStore('kv').put(id, 'activeProfile'));
            return;
        }
        const before: Values = Object.create(null);
        for (let index = 0; index < local.length; index++) {
            const key = local.key(index);
            if (key && owned(key)) {
                const value = local.getItem(key);
                if (value !== null) before[key] = value;
            }
        }
        const next: Journal = { id, values: await this.get<Values>('profile:' + id) || {} };
        await this.mutate(['kv'], transaction => {
            transaction.objectStore('kv').put(before, 'profile:' + active);
            transaction.objectStore('kv').put(next, 'profileJournal');
        });
        await finish(next);
    }
}

// Replay before game startup. Do not clear the journal until local data AND metadata are durable.
export async function recoverInstall(storage: CloudStorage,
    commitState: (journal: InstallJournal) => Promise<void>, local: Storage = localStorage): Promise<boolean> {
    const journal = await storage.getJournal();
    if (!journal) return false;
    const payload = rawPayload(journal.after);
    if (!payload) throw new Error('恢复副本为空，请先导出备份包。');
    if (journal.remote) {
        await validateRemote(journal.remote, journal.remote.envelope.slotId);
        if (await hashPayload(payload) !== journal.remote.envelope.payloadHash) {
            throw new Error('恢复副本与云端快照不一致，请保留备份。');
        }
    }
    try { writeLocal(journal.key, journal.after, local); }
    catch (error) { writeLocal(journal.key, journal.before, local); throw error; }
    await commitState(journal);
    await storage.clearJournal();
    local.removeItem('pokechillCloud:install');
    return true;
}
