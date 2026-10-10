import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = resolve(root, 'output/translation-source');
await mkdir(cache, { recursive: true });
const run = promisify(execFile);
async function download(url) {
    return (await run('curl', ['-fsSL', '--retry', '2', '--retry-all-errors', '--connect-timeout', '15', '--max-time', '45',
        '--user-agent', 'PokeChill-localization', url], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true })).stdout;
}
const cached = process.argv.includes('--cached');
const previous = cached ? JSON.parse(await readFile(resolve(root, 'scripts/i18n/name-sources.json'), 'utf8')) : null;
const revision = previous?.revision || JSON.parse(await download('https://api.github.com/repos/PokeAPI/pokeapi/commits/master')).sha;
function csv(raw) {
    const rows = []; let row = [], value = '', quoted = false;
    for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (c === '"') { if (quoted && raw[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; }
        else if (c === ',' && !quoted) { row.push(value); value = ''; }
        else if (c === '\n' && !quoted) { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = ''; }
        else value += c;
    }
    if (value || row.length) { row.push(value); rows.push(row); }
    const header = rows.shift();
    return rows.filter(row => row.length === header.length).map(row => Object.fromEntries(header.map((name, index) => [name, row[index]])));
}
const tables = ['languages', 'pokemon_species', 'pokemon_species_names', 'pokemon', 'pokemon_forms', 'pokemon_form_names',
    'items', 'item_names', 'moves', 'move_names', 'abilities', 'ability_names', 'types', 'type_names', 'natures', 'nature_names', 'regions', 'region_names'];
const sources = {};
const data = {};
for (let start = 0; start < tables.length; start += 3) {
    await Promise.all(tables.slice(start, start + 3).map(async name => {
    const url = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${revision}/data/v2/csv/${name}.csv`;
    let raw;
    if (cached) {
        raw = await readFile(resolve(cache, name + '.csv'), 'utf8');
        if (createHash('sha256').update(raw).digest('hex') !== previous.sources[name]?.sha256) throw new Error('Cached source mismatch: ' + name);
    } else {
        const entry = JSON.parse(await download(`https://api.github.com/repos/PokeAPI/pokeapi/contents/data/v2/csv/${name}.csv?ref=${revision}`));
        if (entry.encoding !== 'base64' || typeof entry.content !== 'string') throw new Error('Unexpected dataset response: ' + name);
        raw = Buffer.from(entry.content, 'base64').toString('utf8');
    }
    await writeFile(resolve(cache, name + '.csv'), raw, 'utf8');
    sources[name] = { url, sha256: createHash('sha256').update(raw).digest('hex') };
    data[name] = csv(raw);
    }));
}
const language = data.languages.find(row => row.identifier === 'zh-hans').id;
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const names = {};
const English = {};
const categories = {};
for (const [table, localized, id] of [
    ['pokemon_species', 'pokemon_species_names', 'pokemon_species_id'], ['moves', 'move_names', 'move_id'],
    ['abilities', 'ability_names', 'ability_id'], ['items', 'item_names', 'item_id'], ['types', 'type_names', 'type_id'],
    ['natures', 'nature_names', 'nature_id'], ['regions', 'region_names', 'region_id'],
]) {
    const chinese = new Map(data[localized].filter(row => row.local_language_id === language).map(row => [row[id], row.name]));
    const english = new Map(data[localized].filter(row => row.local_language_id === '9').map(row => [row[id], row.name]));
    categories[table] = {};
    for (const entity of data[table]) {
        const name = chinese.get(entity.id);
        if (!name) continue;
        names[normalize(entity.identifier)] = name;
        English[english.get(entity.id) || entity.identifier.replaceAll('-', ' ')] = name;
        categories[table][entity.identifier] = name;
    }
}
const pokemon = new Map(data.pokemon.map(row => [row.id, row]));
const species = new Map(data.pokemon_species.map(row => [row.id, row]));
const forms = new Map(data.pokemon_form_names.filter(row => row.local_language_id === language).map(row => [row.pokemon_form_id, row]));
for (const form of data.pokemon_forms) {
    const base = species.get(pokemon.get(form.pokemon_id)?.species_id);
    if (!base) continue;
    const baseTitle = categories.pokemon_species[base.identifier];
    const translated = forms.get(form.id);
    let title = translated?.pokemon_name;
    if (!title && translated?.form_name) {
        const label = translated.form_name.normalize('NFKC');
        title = label.includes(baseTitle) ? label : baseTitle + '（' + label + '）';
    }
    if (!title && /^mega(?:-[xyz])?$/.test(form.form_identifier)) title = '超级' + baseTitle + form.form_identifier.slice(5).toUpperCase();
    if (!title && form.form_identifier === 'gmax') title = baseTitle + '（超极巨化）';
    if (title) names[normalize(form.identifier)] = title;
}
await mkdir(resolve(root, 'scripts/i18n'), { recursive: true });
await writeFile(resolve(root, 'scripts/i18n/official-names.json'), JSON.stringify({ names, english: English, categories }, null, 2) + '\n', 'utf8');
await writeFile(resolve(root, 'scripts/i18n/name-sources.json'), JSON.stringify({
    syncedOn: '2026-10-10', repository: 'https://github.com/PokeAPI/pokeapi', revision, language: 'zh-hans',
    note: 'PokeAPI is a community dataset of game-localized names, not a Pokémon Company service. Official Chinese Pokédex names are cross-checked separately. Custom PokeChill content has separate translations.',
    officialChecks: ['https://pokedex.pokemon.cn/play/pokedex/0387', 'https://pokedex.pokemon.cn/play/pokedex/0725', 'https://pokedex.pokemon.cn/play/pokedex/0656', 'https://pokedex.pokemon.cn/play/pokedex/0025'], sources,
}, null, 2) + '\n', 'utf8');
console.log(`Synced ${Object.keys(names).length} localized names from ${revision}.`);
