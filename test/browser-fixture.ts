// Local-only UI acceptance fixture: the real API handler + an in-memory GitHub store.
// It has no real credentials and never connects to GitHub or Cloudflare.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createHandler, type Env } from '../cloud-save-worker/src/index';
import { SESSION_COOKIE, players } from '../cloud-save-worker/src/auth';
import type { CloudSaveEnvelope, RemoteSave } from '../cloud-save/protocol';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
let current: RemoteSave | null = null;
let writes = 0;
let now = Date.now();
const env: Env = {
    GITHUB_OWNER: 'fixture', GITHUB_SAVE_REPO: 'fixture', GITHUB_SAVE_BRANCH: 'main', GITHUB_SAVE_TOKEN: 'fake-not-a-credential',
    CLOUD_SLOT_ID: '82952bce-6e76-48d1-bcd5-34178aa5ee7c', ALLOWED_ORIGIN: 'https://browser-fixture.test',
    GAME_AUTH: JSON.stringify({ version: 1, passwordHash: 'a'.repeat(64), sessionKey: 'b'.repeat(43) }),
    LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) }, LOGIN_GLOBAL_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { async fetch(request) {
        const url = new URL(request.url);
        const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
        if (!path.startsWith(resolve(root) + sep)) return new Response('Not found', { status: 404 });
        try {
            const body = await readFile(path);
            const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
            return new Response(body, { headers: { 'Content-Type': mime[extname(path)] || 'application/octet-stream' } });
        } catch { return new Response('Not found', { status: 404 }); }
    } },
};
const handler = createHandler({ authenticate: async (_token, config) => players(config)[0], now: () => { now += 20000; return now; }, store: () => ({
    async assertAvailable() {}, async read() { return structuredClone(current); },
    async write(envelope: CloudSaveEnvelope, sha: string | null) {
        if ((current?.blobSha ?? null) !== sha) throw new Error('fixture race');
        writes++;
        current = { blobSha: randomBytes(20).toString('hex'), envelope: structuredClone(envelope) };
        return { blobSha: current.blobSha, commitSha: randomBytes(20).toString('hex') };
    },
}) });
const server = createServer(async (incoming, outgoing) => {
    try {
        if (incoming.url === '/__fixture/state') {
            outgoing.writeHead(200, { 'Content-Type': 'application/json' }); outgoing.end(JSON.stringify({ writes, current })); return;
        }
        const chunks: Buffer[] = [];
        for await (const chunk of incoming) chunks.push(chunk);
        const headers = new Headers({ Cookie: SESSION_COOKIE + '=fixture' });
        if (incoming.headers['content-type']) headers.set('Content-Type', incoming.headers['content-type']);
        if (incoming.headers.origin) headers.set('Origin', incoming.headers.origin === 'http://127.0.0.1:3001' ? env.ALLOWED_ORIGIN : incoming.headers.origin);
        const body = Buffer.concat(chunks);
        const response = await handler(new Request(env.ALLOWED_ORIGIN + incoming.url, {
            method: incoming.method, headers, ...(body.length ? { body } : {}),
        }), env);
        outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch { outgoing.writeHead(500); outgoing.end('fixture error'); }
});
server.listen(3001, '127.0.0.1', () => console.log('TEST DATA ONLY: http://127.0.0.1:3001'));
