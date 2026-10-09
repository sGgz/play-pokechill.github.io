import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
export function startServer(port = 3000) {
    return createServer(async (request, response) => {
        try {
            const url = new URL(request.url, 'http://localhost');
            if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
                response.writeHead(503, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ code: 'CLOUD_UNAVAILABLE', message: '本地预览未连接云存档，部署后在自己的域名使用。' }));
                return;
            }
            const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
            if (!path.startsWith(resolve(root) + sep)) throw new Error('outside build');
            const body = await readFile(path);
            response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
            response.end(body);
        } catch { response.writeHead(404); response.end('Not found'); }
    }).listen(port, '127.0.0.1');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    startServer(Number(process.env.PORT || 3000));
    console.log('Local game: http://127.0.0.1:' + (process.env.PORT || 3000));
}
