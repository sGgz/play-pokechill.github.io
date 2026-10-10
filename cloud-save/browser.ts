import CloudApi, { CloudApiError, type CloudIdentity } from './api';
import { SyncEngine, decideStartup } from './SyncEngine';
import { CloudStorage, rawPayload, readLocal, payloadRaw, recoverInstall } from './storage';
import { compareVersions, importPayload, payloadVersion, SYNC_INTERVAL } from './protocol';
import type { RemoteSave, SavePayload } from './protocol';
import type { InstallJournal } from './storage';

declare const __GAME_VERSION__: string;
declare const __CLIENT_BUILD__: string;
declare global {
    interface Window { PokeChillCloud: CloudGame; saveGame(): void; }
}

function download(value: unknown, name: string): void {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class CloudGame {
    private storage!: CloudStorage;
    private profiles!: CloudStorage;
    private profileId = 'player';
    private playerName = '';
    private profileReady = false;
    private api = new CloudApi();
    private engine!: SyncEngine;
    private ready?: Promise<void>;
    private resume?: () => void;
    private writer = false;
    private running = false;
    private paused = false;
    private stopped = false;
    private installPending = false;
    private busy = false;
    private blocked = '';
    private loginRequired = false;
    private serverSlot: string | null = null;
    private captureQueue: Promise<void> = Promise.resolve();
    private retryAt = 0;
    private failures = 0;
    private lastAttempt = 0;
    private status = '正在检查本地与云端进度……';

    canSave(): boolean { return this.writer && this.profileReady && this.running && !this.stopped; }
    canRun(): boolean { return this.profileReady && this.running && !this.paused && !this.stopped; }
    started(): void { this.running = true; this.render(); }

    bootstrap(): Promise<void> {
        if (!this.ready) {
            this.ready = new Promise<void>(resolve => { this.resume = resolve; });
            this.mount();
            void this.prepareStartup();
        }
        return this.ready;
    }

    private mount(): void {
        const panel = document.createElement('details');
        panel.className = 'pc-cloud'; panel.id = 'pc-cloud'; panel.open = true;
        panel.innerHTML = `<summary>云存档 · <span id="pc-cloud-summary">正在检查</span></summary>
            <section class="pc-cloud__body" aria-label="PokeChill 云存档">
            <h2>随时接着玩</h2><p>本地保存，云端接力。换设备前，请等待云端确认。</p>
            <p class="pc-cloud__status" id="pc-cloud-status" role="status" aria-live="polite"></p>
            <p class="pc-cloud__time" id="pc-cloud-player"></p>
            <p class="pc-cloud__time" id="pc-cloud-time"></p>
            <div class="pc-cloud__actions">
            <button type="button" data-action="check">检查连接</button>
            <button type="button" data-action="sync">上传 / 立即同步</button>
            <button type="button" data-action="restore">下载云档</button>
            <button type="button" data-action="handoff">同步后换设备</button>
            <button type="button" data-action="continue" hidden>继续本地游戏</button>
            </div>
            <label><input id="pc-cloud-auto" type="checkbox">每 10 分钟自动同步</label>
            <div class="pc-cloud__conflict" id="pc-cloud-conflict" hidden>
            <strong>需要选择继续哪份进度</strong><p id="pc-cloud-comparison"></p>
            <p>选择前会保留双方备份，不会合并宝可梦、物品或离线收益。</p>
            <div class="pc-cloud__actions"><button type="button" data-action="use-remote">使用云端进度</button>
            <button type="button" data-action="use-local">使用本地进度并上传</button></div></div>
            <div class="pc-cloud__actions">
            <button type="button" data-action="export">导出本地存档</button>
            <button type="button" data-action="backups">导出恢复备份包</button>
            <a href="/login" target="_blank" rel="noopener">重新登录</a>
            <button type="button" data-action="logout">退出云登录</button>
            </div><p class="pc-cloud__time">每位玩家使用自己的专用密码。登录过期或切换玩家时，在新标签页登录，再回这里检查连接；当前进度会分别保存。</p>
            </section>`;
        document.body.appendChild(panel);
        const menu = document.getElementById('menu-items');
        if (menu) {
            const entry = document.createElement('button');
            entry.id = 'menu-item-cloud-save'; entry.className = 'menu-item pc-cloud__entry'; entry.type = 'button';
            entry.setAttribute('aria-controls', 'pc-cloud'); entry.setAttribute('aria-expanded', 'true');
            entry.innerHTML = '<span class="pc-cloud__entry-icon" aria-hidden="true">☁</span><span>云存档</span><small id="pc-cloud-menu-status">正在检查</small>';
            entry.addEventListener('click', () => {
                panel.open = true;
                document.getElementById('menu-button')?.classList.remove('menu-button-open');
                panel.querySelector<HTMLElement>('summary')?.focus();
            });
            menu.insertBefore(entry, menu.children[1] ?? null);
            panel.addEventListener('toggle', () => entry.setAttribute('aria-expanded', String(panel.open)));
        }
        const menuIcon = document.querySelector<SVGElement>('#menu-button > svg');
        menuIcon?.setAttribute('role', 'button');
        menuIcon?.setAttribute('tabindex', '0');
        menuIcon?.setAttribute('aria-label', '打开菜单或云存档');
        menuIcon?.addEventListener('keydown', event => {
            if (this.canRun() && ['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                menuIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        });
        for (const name of ['click', 'pointerdown', 'keydown']) {
            window.addEventListener(name, event => {
                if (!this.canRun() && !panel.contains(event.target as Node)) {
                    const target = event.target as Element;
                    const cloudEntry = target.closest?.('#menu-button > svg, #menu-item-cloud-save');
                    if (cloudEntry) {
                        if (name === 'click' || (name === 'keydown' && ['Enter', ' '].includes((event as KeyboardEvent).key))) {
                            event.preventDefault(); event.stopImmediatePropagation();
                            panel.open = true;
                            document.getElementById('menu-button')?.classList.remove('menu-button-open');
                            panel.querySelector<HTMLElement>('summary')?.focus();
                        }
                        // Keep pointerdown uncancelled so touch browsers still dispatch click.
                        return;
                    }
                    event.preventDefault(); event.stopImmediatePropagation();
                }
            }, true);
        }
        panel.addEventListener('click', event => {
            const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
            if (button) void this.action(button.dataset.action!);
        });
        document.getElementById('pc-cloud-auto')!.addEventListener('change', () => void this.action('automatic'));
        document.addEventListener('visibilitychange', () => {
            // Local synchronous save only; an unload is not proof of a cloud receipt.
            if (document.hidden && this.canSave()) window.saveGame();
        });
        window.addEventListener('pagehide', () => { if (this.canSave()) window.saveGame(); });
        window.addEventListener('beforeunload', event => {
            if (this.busy) { event.preventDefault(); event.returnValue = ''; }
            else if (this.canSave()) window.saveGame();
        });
        setInterval(() => {
            if (this.engine?.state.autoSync && this.running && !this.stopped && !this.busy && !this.blocked
                && !this.loginRequired && !this.engine.state.hasConflict
                && Date.now() >= Math.max(this.lastAttempt + SYNC_INTERVAL, this.retryAt)) void this.action('sync');
        }, 15000);
        this.render();
    }

    private async prepareStartup(): Promise<void> {
        if (this.busy) return;
        this.busy = true; this.render();
        try { await this.prepare(); }
        catch (error) { this.report(error); }
        finally { this.busy = false; this.render(); }
    }

    private async prepare(): Promise<void> {
        if (!navigator.locks) throw new Error('此浏览器不支持多标签保护，请使用新版 Chrome、Edge、Firefox 或 Safari。');
        const held = await new Promise<boolean>((resolve, reject) => {
            void navigator.locks.request('pokechill-game-writer', { ifAvailable: true }, lock => {
                if (!lock) { resolve(false); return; }
                this.writer = true; resolve(true);
                return new Promise<void>(() => {});
            }).catch(reject);
        });
        if (!held) throw new Error('游戏已在本浏览器的另一个标签页打开，也可能在其他窗口或标签组中。请关闭旧游戏页面，再点“重试打开游戏”。这只检查本机浏览器，不受其他设备影响。');
        try {
            this.profiles = new CloudStorage();
            let identity: CloudIdentity | undefined;
            try { identity = await this.api.identity(); }
            catch (error) {
                // Without a verified identity, continue only under the last local profile.
                if (!(error instanceof CloudApiError)) throw error;
                this.report(error);
            }
            this.profileId = identity?.playerId || await this.profiles.getProfile() || 'player';
            await this.profiles.selectProfile(this.profileId);
            this.storage = this.profileId === 'player' ? this.profiles : new CloudStorage(this.profileId);
            this.engine = new SyncEngine(this.storage, this.api, await this.storage.getState());
            this.installPending = !!await this.storage.getJournal();
            await recoverInstall(this.storage, journal => this.commitInstall(journal));
            this.installPending = false;
            this.profileReady = true;
            if (identity) this.playerName = identity.playerName;
        } catch (error) {
            this.blocked = error instanceof Error ? error.message : '备份空间不可用。';
            // An incomplete replacement must be recovered before any game writes.
            if (!this.profileReady || this.installPending || localStorage.getItem('pokechillCloud:install')) throw error;
            this.report(error); this.render();
            return;
        }
        rawPayload(readLocal()); // Invalid local data stays available for backup; do not run it.
        await this.checkStartup();
    }

    private async connection(): Promise<string> {
        const identity = await this.api.identity();
        if (identity.playerId !== this.profileId) {
            this.paused = true;
            try {
                if (this.running && !this.stopped) this.current();
                await this.captureQueue; await this.engine.wait();
                if (this.blocked) throw new Error('当前玩家的备份未完成，请导出本地存档后再切换玩家。');
                this.stopped = true;
                this.profileReady = false;
                await this.profiles.selectProfile(identity.playerId);
                window.location.reload();
                throw new Error('登录玩家已切换，双方本地进度已分别保存，正在加载该玩家的存档。');
            } finally { if (!this.stopped) this.paused = false; }
        }
        const slot = identity.slotId;
        if (this.engine?.state.slotId && this.engine.state.slotId !== slot) {
            throw new Error('服务器云槽位与本机已关联槽位不同，请检查配置。');
        }
        if (await this.api.status() !== slot) throw new Error('检查连接期间登录身份发生变化，请重试。');
        this.playerName = identity.playerName;
        this.serverSlot = slot; this.loginRequired = false;
        return slot;
    }

    private async checkStartup(): Promise<void> {
        try {
            const slot = await this.connection();
            const local = rawPayload(readLocal());
            const remote = await this.api.read(slot);
            if (!local && localStorage.getItem('pokechillCloud:newGame')) {
                this.message('正在开始新的本地游戏；原云档保留，上传时需要明确选择。');
                this.startLocal();
                return;
            }
            const decision = await decideStartup(this.engine.state, local, remote);
            await this.engine.acknowledgePending(remote);
            if (decision === 'remote') {
                await this.install(remote!.envelope.payload, remote);
                this.message('云端进度已恢复到本机，可以继续游戏。');
            } else if (decision === 'conflict' || this.engine.state.hasConflict) {
                if (local) await this.engine.capture(local);
                await this.engine.conflict(remote);
                this.message('本地与云端有不同进度，请选择继续哪一份。');
                return;
            } else {
                this.message(remote ? '本地进度已与云档关联。换设备前请同步。' : '云槽位为空。选择初始宝可梦或导入旧档后，点击上传。');
            }
            this.startLocal();
        } catch (error) { this.report(error); }
        finally { this.render(); }
    }

    private startLocal(): void {
        if (!this.writer || !this.profileReady || this.installPending || localStorage.getItem('pokechillCloud:install')) throw new Error('请先完成玩家切换或本地存档恢复，导出备份并释放空间后刷新。');
        rawPayload(readLocal());
        this.resume?.(); this.resume = undefined;
        if (this.running && this.stopped) window.location.reload();
        if (!this.engine?.state.hasConflict && !this.blocked) (document.getElementById('pc-cloud') as HTMLDetailsElement).open = false;
        this.render();
    }

    private current(): SavePayload {
        if (this.canSave()) window.saveGame();
        const payload = rawPayload(readLocal());
        if (!payload) throw new Error('请先选择初始宝可梦并保存，或导入已有存档。');
        return payload;
    }

    afterLocalSave(raw: string): void {
        if (!this.engine || this.blocked || this.stopped) return;
        this.captureQueue = this.captureQueue.then(async () => {
            const payload = rawPayload(raw);
            if (payload) await this.engine.capture(payload);
        }).catch(error => { this.blocked = error.message; this.report(error); });
    }

    private async commitInstall(journal: InstallJournal): Promise<void> {
        localStorage.removeItem('pokechillCloud:newGame');
        if (journal.remote) await this.engine.bind('gameData', journal.remote.envelope.slotId, journal.remote);
        else {
            // Preserve the cloud baseline on imports: future uploads must still detect other-device writes.
            this.engine.state.latest = rawPayload(journal.after);
            this.engine.state.pending = null;
            this.engine.state.autoSync = false;
            this.engine.state.hasConflict = false;
            this.engine.state.remoteConflict = null;
            await this.storage.saveState(this.engine.state);
        }
    }

    private async install(payload: SavePayload, remote: RemoteSave | null): Promise<void> {
        if (compareVersions(payloadVersion(payload), __GAME_VERSION__) > 0) throw new Error('存档来自更新游戏版本，请先更新网页。');
        this.paused = true;
        try {
            if (this.running) this.current();
            await this.captureQueue; await this.engine.wait();
            await this.storage.stageInstall({ key: 'gameData', before: readLocal(), after: payloadRaw(payload), remote });
            this.installPending = true;
            this.stopped = true;
            localStorage.setItem('pokechillCloud:install', 'pending');
            await recoverInstall(this.storage, journal => this.commitInstall(journal));
            this.installPending = false;
            if (this.running) window.location.reload();
            else this.stopped = false;
        } finally { if (!this.stopped) this.paused = false; }
    }

    async importData(data: unknown): Promise<void> {
        await this.guarded(async () => {
            const payload = importPayload(data);
            if (!confirm('导入会替换当前本地进度并关闭自动同步；原进度会备份。继续吗？')) return;
            await this.install(payload, null);
            if (!this.running) await this.checkStartup();
        });
    }

    async reset(): Promise<void> {
        await this.guarded(async () => {
            if (!confirm('重新开始本地游戏？当前进度会备份，云端存档保留。')) return;
            if (this.running) this.current();
            await this.captureQueue; await this.engine.wait();
            await this.storage.backup(readLocal(), null, 'before-reset');
            await this.engine.forget('gameData');
            this.stopped = true;
            localStorage.setItem('pokechillCloud:newGame', 'pending');
            localStorage.removeItem('gameData');
            window.location.reload();
        });
    }

    private async sync(handoff = false): Promise<void> {
        const slot = await this.connection();
        if (handoff) this.paused = true;
        try {
            const local = this.current();
            await this.captureQueue;
            if (!this.engine.state.slotId) {
                const remote = await this.api.read(slot);
                if (remote) {
                    await this.engine.capture(local); await this.engine.conflict(remote);
                    throw new Error('云端已经有进度，请先选择继续哪一份。');
                }
                await this.engine.bind('gameData', slot, null);
            }
            await this.engine.capture(local);
            this.lastAttempt = Date.now();
            await this.engine.sync(__CLIENT_BUILD__);
            localStorage.removeItem('pokechillCloud:newGame');
            // A persisted uncertain request may be older than the latest local capture.
            if (handoff && await this.engine.dirty()) {
                this.message('正在确认最新进度，请等候第二次提交……');
                await new Promise(resolve => setTimeout(resolve, 15500));
                await this.engine.sync(__CLIENT_BUILD__);
            }
            this.failures = 0; this.retryAt = 0;
            if (handoff) {
                this.stopped = true;
                this.message('云端已确认最新进度，游戏已暂停。现在可以关闭此页、换设备。');
            } else this.message(await this.engine.dirty() ? '已确认前一份快照；本机还有新进度，稍后继续同步。' : '云端已确认保存。换设备请使用“同步后换设备”。');
        } finally { if (!this.stopped) this.paused = false; }
    }

    private async chooseLocal(): Promise<void> {
        const local = this.current();
        const slot = await this.connection();
        const remote = await this.api.read(slot);
        if (remote && compareVersions(payloadVersion(local), remote.envelope.gameVersion) < 0) {
            throw new Error('本地档版本较旧，请更新游戏后再选择。');
        }
        if (!confirm('确认使用本地进度更新云档？双方进度会备份。')) return;
        await this.captureQueue; await this.engine.wait();
        await this.storage.backup(readLocal(), remote, 'choose-local');
        await this.engine.bind('gameData', slot, remote);
        await this.engine.capture(local);
        this.lastAttempt = Date.now();
        await this.engine.sync(__CLIENT_BUILD__);
        this.message('本地进度已上传并获云端确认。');
        if (!this.running) this.startLocal();
    }

    private async guarded(operation: () => Promise<void>): Promise<void> {
        if (this.busy) return;
        this.busy = true; this.render();
        try {
            if (this.installPending) throw new Error('存档恢复尚未完成，请导出备份、释放空间后刷新。');
            if (!this.profileReady) throw new Error('玩家切换尚未完成，请导出恢复备份包、释放空间后刷新。');
            if (!this.writer || !this.engine || this.blocked) throw new Error(this.blocked || '云同步尚未就绪，请先导出本地存档。');
            await operation();
        } catch (error) { this.report(error); }
        finally { this.busy = false; this.render(); }
    }

    private async action(name: string): Promise<void> {
        // Exports and deliberate local startup remain usable when cloud services are unavailable.
        if (name === 'export') {
            if (!this.profileReady) { this.message('玩家切换未完成，请导出恢复备份包并释放存储空间后刷新。'); return; }
            try { download(this.current().gameData, 'Pokechill-' + new Date().toISOString().slice(0, 10) + '.json'); }
            catch (error) {
                const raw = readLocal();
                if (raw) download({ damagedLocal: raw }, 'Pokechill-damaged-local.json');
                this.report(error);
            }
            return;
        }
        if (name === 'backups') {
            try {
                await this.captureQueue;
                const backups = await (this.storage || this.profiles).allBackups();
                const profiles = await this.profiles.profileRecovery();
                download([...backups, { time: new Date().toISOString(), reason: 'export-current', playerId: this.profileId,
                    local: this.profileReady ? readLocal() : null, remote: this.engine?.state.remoteConflict ?? null }, ...profiles], 'Pokechill-recovery-' + Date.now() + '.json');
            } catch (error) { this.report(error); }
            return;
        }
        if (name === 'continue') { try { this.startLocal(); } catch (error) { this.report(error); } return; }
        if (name === 'check' && !this.writer) { await this.prepareStartup(); return; }
        const automatic = name === 'automatic' && (document.getElementById('pc-cloud-auto') as HTMLInputElement).checked;
        await this.guarded(async () => {
            if (name === 'check') {
                if (!this.running) await this.checkStartup();
                else { await this.connection(); this.message('连接正常。可以上传，或先下载云档。'); }
            } else if (name === 'sync' || name === 'handoff') await this.sync(name === 'handoff');
            else if (name === 'restore' || name === 'use-remote') {
                const remote = await this.api.read(await this.connection());
                if (!remote) throw new Error('云槽位为空，尚未上传存档。');
                if (!confirm('使用云档替换本地进度？原进度会备份，运行中的游戏会重新加载。')) return;
                await this.install(remote.envelope.payload, remote);
                this.message('云端进度已恢复到本机，可以继续游戏。');
                if (!this.running) this.startLocal();
            } else if (name === 'use-local') await this.chooseLocal();
            else if (name === 'automatic') {
                const enabled = automatic;
                if (!this.engine.state.base || this.engine.state.hasConflict || this.loginRequired) throw new Error('请先成功上传或恢复云档，再开启自动同步。');
                await this.engine.setAutomatic(enabled);
                this.lastAttempt = Date.now();
                this.message(enabled ? '已开启每 10 分钟同步。换设备前仍请手动同步并等待确认。' : '已关闭自动同步。');
            } else if (name === 'logout') {
                if (this.running && !this.stopped) this.current();
                await this.captureQueue; await this.engine.wait();
                await this.api.logout(); await this.engine.setAutomatic(false);
                this.serverSlot = null; this.loginRequired = true;
                this.message('已退出当前浏览器云登录，本地进度保留。其他设备不受影响。');
            }
        });
    }

    private report(error: unknown): void {
        if (error instanceof CloudApiError) {
            if (error.code === 'LOGIN_REQUIRED') this.loginRequired = true;
            this.failures++;
            this.retryAt = Date.now() + Math.max(error.retryAfter * 1000, Math.min(30 * 60 * 1000, 60000 * 2 ** Math.min(this.failures, 5)));
        }
        this.message(error instanceof Error ? error.message : '同步失败，请先保留本地备份。');
        (document.getElementById('pc-cloud') as HTMLDetailsElement).open = true;
        this.render();
    }
    private message(text: string): void { this.status = text; this.render(); }
    private describe(payload: SavePayload): string {
        const data = payload.gameData;
        const caught = Object.values(data).filter(value => value && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).caught).length;
        return `已捕获 ${caught} 种，游戏版本 ${payloadVersion(payload)}`;
    }
    private render(): void {
        const panel = document.getElementById('pc-cloud');
        if (!panel) return;
        const state = this.engine?.state;
        document.getElementById('pc-cloud-summary')!.textContent = this.stopped ? '已暂停' : !this.writer ? this.busy ? '正在检查' : '等待打开' : state?.hasConflict ? '进度冲突' : state?.base ? '已关联' : '本地模式';
        const menuStatus = document.getElementById('pc-cloud-menu-status');
        if (menuStatus) menuStatus.textContent = document.getElementById('pc-cloud-summary')!.textContent;
        document.getElementById('pc-cloud-status')!.textContent = this.status;
        document.getElementById('pc-cloud-player')!.textContent = this.playerName ? '当前玩家：' + this.playerName : '本地玩家：' + this.profileId;
        document.getElementById('pc-cloud-time')!.textContent = state?.base ? '云端确认时间：' + new Date(state.base.serverSavedAt).toLocaleString() : '尚未确认云端保存';
        for (const button of panel.querySelectorAll<HTMLButtonElement>('button[data-action]')) {
            const name = button.dataset.action;
            button.disabled = this.busy || (name !== 'export' && name !== 'backups' && name !== 'continue' && (!this.writer || !this.profileReady || !!this.blocked));
            if (name === 'check' && !this.writer) button.disabled = this.busy;
            if (name === 'check') button.textContent = this.writer ? '检查连接' : '重试打开游戏';
            if (name === 'continue') {
                button.hidden = (!this.resume && !this.stopped) || !this.writer || !this.profileReady || this.installPending || !!localStorage.getItem('pokechillCloud:install');
                button.textContent = this.stopped ? '重新进入游戏' : '继续本地游戏';
            }
            if (this.stopped && ['sync', 'handoff', 'use-local'].includes(name!)) button.disabled = true;
        }
        const checkbox = document.getElementById('pc-cloud-auto') as HTMLInputElement;
        checkbox.checked = state?.autoSync ?? false;
        checkbox.disabled = this.busy || this.stopped || !this.profileReady || !state?.base || !!this.blocked || !!state?.hasConflict || this.loginRequired;
        document.getElementById('pc-cloud-conflict')!.hidden = !state?.hasConflict;
        if (state?.hasConflict) {
            const local = state.latest;
            const remote = state.remoteConflict;
            document.getElementById('pc-cloud-comparison')!.textContent = '本地：' + (local ? this.describe(local) : '无有效进度')
                + '。云端：' + (remote ? this.describe(remote.envelope.payload) + '，保存于 ' + new Date(remote.envelope.serverSavedAt).toLocaleString() : '已移走或删除');
        }
    }
}

window.PokeChillCloud = new CloudGame();
