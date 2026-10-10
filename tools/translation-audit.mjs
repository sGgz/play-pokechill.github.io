import { readFile, writeFile } from 'node:fs/promises';
import { translate, name } from '../scripts/i18n/core.mjs';
const inventory = JSON.parse(await readFile('output/translation-inventory.json', 'utf8'));
const remaining = Object.keys(inventory).filter(text => !/^[#.;]|(?:\.\w+|=|>|<|"|rgba?\(|scale\(|rotate\(|px|\b(infinite|ease|linear)\b)/.test(text))
    .map(text => [text, translate(text)]).filter(([, zh]) => /[a-zA-Z]{3,}/.test(zh.replace(/(?:Pokémon|Nintendo|Creatures Inc\.|The Pokémon Company|Pokemon|PokeChill|PokeAPI|OLED|SSS|STAB|IV|HP|BP|TM|PKRS|AFK|Nuzlocke|AND|OR|keyword[AB]?|ivsum|shiny|pokerus|signature|eggMove|unobtainable|wild|park|event|frontier|mart|caught)/gi, '')));
await writeFile('output/translation-remaining.txt', remaining.map(([en, zh], i) => `${i + 1}\t${en}\t${zh}`).join('\n'), 'utf8');
const source = await readFile('scripts/pkmnDictionary.js', 'utf8');
const ids = [...new Set([...source.matchAll(/^pkmn\.(\w+)\s*=/gm)].map(match => match[1]))];
const missing = ids.filter(id => !name(id));
await writeFile('output/name-missing.txt', missing.join('\n'), 'utf8');
console.log(`Unreviewed text candidates: ${remaining.length}; Pokémon IDs without names: ${missing.length}/${ids.length}`);
