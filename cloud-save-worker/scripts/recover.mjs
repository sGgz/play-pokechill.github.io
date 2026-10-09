import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { importPayload, validateRemote } from '../../cloud-save/protocol.ts';

const input = process.argv[2];
if (!input) throw new Error('请运行 npm run cloud:recover -- "恢复备份包或 GitHub 存档 JSON 的完整路径"。');
const file = resolve(input);
const data = JSON.parse(await readFile(file, 'utf8'));
const candidates = [];
const add = value => importPayload(value);
async function cloud(value, label) {
    const checked = await validateRemote({ envelope: value, blobSha: '0'.repeat(40) }, value.slotId);
    candidates.push({ payload: checked.envelope.payload, label });
}
if (Array.isArray(data)) {
    for (const [index, entry] of data.entries()) {
        const label = String(index + 1).padStart(3, '0') + '-' + String(entry.time || 'unknown').replace(/[^0-9T-]/g, '-');
        if (typeof entry.local === 'string') {
            try { candidates.push({ payload: add(JSON.parse(entry.local)), label: label + '-local' }); }
            catch { console.log('跳过无效本地副本：' + label); }
        }
        if (entry.remote?.envelope?.payload) await cloud(entry.remote.envelope, label + '-cloud');
    }
} else if (data.envelope) await cloud(data.envelope, 'cloud');
else if (data.payload) await cloud(data, 'cloud');
else candidates.push({ payload: add(data), label: 'local' });
if (!candidates.length) throw new Error('文件中没有可恢复的 PokeChill 存档。');
const output = resolve(dirname(file), basename(file, '.json') + '-recovered-' + Date.now());
await mkdir(output);
for (const { payload, label } of candidates) {
    await writeFile(resolve(output, label + '.json'), JSON.stringify(payload.gameData, null, 2) + '\n', 'utf8');
}
console.log('已生成 ' + candidates.length + ' 份 PokeChill 原格式 JSON 存档：' + output);
console.log('在游戏 Menu → Settings → Import Data 导入 JSON，核对进度后再同步。原始备份未修改。');
