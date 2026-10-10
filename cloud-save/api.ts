import { isRecord, isUuid, MAX_SAVE_BYTES, validateRemote } from './protocol';
import type { RemoteSave, UploadRequest } from './protocol';

export class CloudApiError extends Error {
    constructor(public status: number, public code: string, message: string,
        public remote: RemoteSave | null = null, public retryAfter = 60) { super(message); }
}
export interface SaveApi {
    read(slotId: string): Promise<RemoteSave | null>;
    upload(slotId: string, request: UploadRequest): Promise<RemoteSave>;
}
export interface CloudIdentity {
    playerId: string;
    playerName: string;
    primaryPlayerId: 'player';
    slotId: string;
}

export default class CloudApi implements SaveApi {
    private async request(path: string, init: RequestInit = {}): Promise<unknown> {
        try {
            const response = await fetch(path, {
                ...init, credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(30000),
            });
            if (!response.headers.get('Content-Type')?.includes('application/json')) {
                throw new CloudApiError(response.status, 'CLOUD_UNAVAILABLE', '此地址未启用云存档，本地进度仍保留。');
            }
            const reader = response.body?.getReader();
            let size = 0;
            const chunks: Uint8Array[] = [];
            try {
                if (reader) for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    size += value.byteLength;
                    if (size > MAX_SAVE_BYTES * 2) { await reader.cancel(); throw new Error('云端响应过大。'); }
                    chunks.push(value);
                }
            } finally { reader?.releaseLock(); }
            const bytes = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
            const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
            if (!isRecord(data)) throw new Error('云端响应格式无效。');
            if (!response.ok) {
                throw new CloudApiError(response.status, String(data.code || 'CLOUD_UNAVAILABLE'),
                    typeof data.message === 'string' ? data.message : '云同步失败，请先保留本地备份。',
                    data.remote as RemoteSave | null ?? null, Number(response.headers.get('Retry-After')) || 60);
            }
            return data;
        } catch (error) {
            if (error instanceof CloudApiError) throw error;
            throw new CloudApiError(0, 'NETWORK', '连接云存档失败，本地进度仍保留。请检查网络后重试。');
        }
    }
    async status(): Promise<string> {
        const data = await this.request('/api/cloud-save/status');
        if (!isRecord(data) || !isUuid(data.slotId)) throw new Error('云槽位配置无效。');
        return data.slotId;
    }
    async identity(): Promise<CloudIdentity> {
        let data;
        try { data = await this.request('/api/cloud-save/identity'); }
        catch (error) {
            if (!(error instanceof CloudApiError) || error.code !== 'NOT_FOUND') throw error;
            data = await this.request('/api/cloud-save/status');
        }
        if (!isRecord(data) || !isUuid(data.slotId)) throw new Error('云存档配置无效。');
        if (data.playerId === undefined && data.primaryPlayerId === undefined) {
            return { playerId: 'player', playerName: '我的存档', primaryPlayerId: 'player', slotId: data.slotId };
        }
        if ((data.playerId !== 'player' && !isUuid(data.playerId)) || data.primaryPlayerId !== 'player'
            || typeof data.playerName !== 'string' || !data.playerName.trim() || data.playerName.length > 40) {
            throw new Error('云存档玩家身份无效。');
        }
        return data as unknown as CloudIdentity;
    }
    async logout(): Promise<void> {
        const data = await this.request('/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        if (!isRecord(data) || data.ok !== true) throw new Error('未能确认退出登录，请重试。');
    }
    async read(slotId: string): Promise<RemoteSave | null> {
        try { return await validateRemote(await this.request('/api/cloud-save/slots/' + slotId), slotId); }
        catch (error) {
            if (error instanceof CloudApiError && error.code === 'EMPTY_SLOT') return null;
            throw error;
        }
    }
    async upload(slotId: string, request: UploadRequest): Promise<RemoteSave> {
        try {
            return await validateRemote(await this.request('/api/cloud-save/slots/' + slotId, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
            }), slotId);
        } catch (error) {
            if (error instanceof CloudApiError && error.status === 409 && error.remote) {
                error.remote = await validateRemote(error.remote, slotId);
            }
            throw error;
        }
    }
}
