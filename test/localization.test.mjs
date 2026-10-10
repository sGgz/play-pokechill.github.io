import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import ts from 'typescript';
import { name, translate, searchTerms, escapeText } from '../scripts/i18n/core.mjs';

test('localized game names and misspelled legacy IDs resolve without renaming saved IDs', () => {
    for (const [id, expected] of Object.entries({ turtwig: '草苗龟', litten: '火斑喵', froakie: '呱呱泡蛙',
        pikachu: '皮卡丘', rareCandy: '神奇糖果', charcoal: '木炭', airShlash: '空气斩',
        goldenBottleCap: '金色王冠', hiJumpKick: '飞膝踢', flamethrowerTm: '招式学习器：喷射火焰',
        megaCharizardX: '超级喷火龙X', raichutiteX: '雷丘进化石X' })) assert.equal(name(id), expected);
    assert.equal(searchTerms('水属性 异色 !已捕获'), 'water shiny !caught');
});

test('every defined Pokémon, item, move, ability, field and area has a display label', async () => {
    let count = 0;
    for (const file of ['pkmnDictionary.js', 'itemDictionary.js', 'moveDictionary.js', 'areasDictionary.js']) {
        const source = await readFile(new URL('../scripts/' + file, import.meta.url), 'utf8');
        for (const [, id] of source.matchAll(/^(?:pkmn|item|move|ability|field|areas)\.(\w+)\s*=\s*\{/gm)) {
            assert.ok(name(id), `${file}: missing ${id}`); count++;
        }
    }
    assert.ok(count > 2500);
});

test('the actual game formatter localizes display while keeping TM image filenames in English', async () => {
    const source = await readFile(new URL('../scripts/explore.js', import.meta.url), 'utf8');
    const ast = ts.createSourceFile('explore.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const functions = ast.statements.filter(node => ts.isFunctionDeclaration(node) && ['format', 'formatEnglish'].includes(node.name?.text));
    const context = { window: { PokeChillI18n: { name } }, pkmn: {}, move: {}, ability: {}, item: {}, field: {}, areas: {} };
    runInNewContext(functions.map(node => node.getText(ast)).join('\n'), context);
    assert.equal(context.format('water'), '水');
    assert.equal(context.formatEnglish('water'), 'Water');
    for (const file of ['explore.js', 'shop.js', 'tooltip.js']) {
        const text = await readFile(new URL('../scripts/' + file, import.meta.url), 'utf8');
        assert.ok(!/tm\$\{format\(/.test(text), `${file}: a TM asset path was localized`);
    }
});

test('live DOM localization handles new content and placeholders, preserving user input and internal attributes', async () => {
    const bundle = await build({ entryPoints: [new URL('../scripts/i18n/browser.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')],
        bundle: true, format: 'iife', platform: 'browser', write: false });
    const dom = new JSDOM('<html><body><button data-id="water">Settings</button><input placeholder="Enter tag name..." value="Fire"><span data-user-text>Fire</span><code>water</code></body></html>',
        { runScripts: 'dangerously', pretendToBeVisual: true });
    try {
        dom.window.eval(bundle.outputFiles[0].text);
        const document = dom.window.document;
        assert.equal(document.documentElement.lang, 'zh-CN');
        assert.equal(document.querySelector('button').textContent, '设置');
        assert.equal(document.querySelector('button').dataset.id, 'water');
        assert.equal(document.querySelector('input').placeholder, '输入标签名称……');
        assert.equal(document.querySelector('input').value, 'Fire');
        assert.equal(document.querySelector('span').textContent, 'Fire');
        assert.equal(document.querySelector('code').textContent, 'water');
        const button = document.createElement('button'); button.textContent = 'Evolution'; document.body.append(button);
        await new Promise(resolve => setTimeout(resolve, 60));
        assert.equal(button.textContent, '进化');
        assert.equal(translate('Hits 2-5 times'), '攻击 2-5 次');
        assert.equal(escapeText('<Fire & Water>'), '&lt;Fire &amp; Water&gt;');
    } finally { dom.window.close(); }
});
