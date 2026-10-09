import { hashPayload, importPayload, validateRemote } from './protocol';
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

    constructor() {
        this.database = new Promise((resolve, reject) => {
            const request = indexedDB.open('pokechill-cloud-save', 1);
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
