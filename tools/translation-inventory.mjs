import ts from 'typescript';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
const root = fileURLToPath(new URL('../', import.meta.url));
const inventory = new Map();
function add(text, file) {
    text = text.trim().replace(/\s+/g, ' ');
    if (!/[a-zA-Z]/.test(text) || text.length < 2 || /(?:https?:|img\/|#[0-9a-f]|function\(|document\.|\.png|style=|<svg|^[a-zA-Z0-9_.-]+$)/.test(text)) return;
    inventory.set(text, [...new Set([...(inventory.get(text) || []), file])]);
}
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const doc = new JSDOM(html).window.document;
const walker = doc.createTreeWalker(doc.body, 4);
while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('script,style,svg')) add(walker.currentNode.textContent, 'index.html');
for (const file of (await readdir(resolve(root, 'scripts'))).filter(file => file.endsWith('.js') && !/fuse|HackTimer/.test(file))) {
    const source = ts.createSourceFile(file, await readFile(resolve(root, 'scripts', file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function visit(node) {
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
            const text = node.text;
            if (text.includes('<')) {
                const parsed = new JSDOM('<body>' + text).window.document;
                const walk = parsed.createTreeWalker(parsed.body, 4);
                while (walk.nextNode()) if (!walk.currentNode.parentElement.closest('script,style,svg')) add(walk.currentNode.textContent, file);
            } else add(text, file);
        }
        ts.forEachChild(node, visit);
    }
    visit(source);
}
await mkdir(resolve(root, 'output'), { recursive: true });
const entries = [...inventory].sort((a, b) => a[0].localeCompare(b[0]));
await writeFile(resolve(root, 'output/translation-inventory.json'), JSON.stringify(Object.fromEntries(entries), null, 2) + '\n');
await writeFile(resolve(root, 'output/translation-inventory.txt'), entries.map(([text, files], i) => `${i + 1}\t${text}\t${files.join(',')}`).join('\n'));
console.log('Visible text candidates: ' + entries.length);
