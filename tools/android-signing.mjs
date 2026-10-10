import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, link, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const run = promisify(execFile);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const repository = 'git@github.com:sGgz/pokechill-save.git';
export const signingCertificateSha256 = 'aa864f15ac350f8e670e5ca2590d765339a80be14d62b8446a90eb086e1ab81a';
const paths = ['.local/android-release.jks', 'android/signing.local.properties'];
const remotePaths = ['android-signing/android-release.jks', 'android-signing/signing.local.properties'];
const exists = path => access(path).then(() => true, () => false);

export function parseSigningProperties(bytes) {
    if (bytes.length > 4096) throw new Error('签名配置过大。');
    const values = Object.create(null);
    for (const line of bytes.toString('utf8').split(/\r?\n/)) {
        if (!line.trim() || /^\s*[#!]/.test(line)) continue;
        const index = line.indexOf('=');
        const key = line.slice(0, index).trim();
        if (index < 1 || !['storeFile', 'storePassword', 'keyAlias', 'keyPassword'].includes(key) || key in values) {
            throw new Error('签名配置包含无效或重复字段。');
        }
        values[key] = line.slice(index + 1).trim();
    }
    if (values.storeFile !== '../.local/android-release.jks' || values.keyAlias !== 'pokechill' ||
        !/^[A-Za-z0-9_-]{16,}$/.test(values.storePassword || '') || values.keyPassword !== values.storePassword) {
        // The original PKCS12 key shares its store password. keytool can silently ignore a differing key password.
        throw new Error('签名配置与既有 APK 不兼容。');
    }
    return values;
}

async function command(binary, args, options = {}) {
    return (await run(binary, args, { windowsHide: true, timeout: 60000, maxBuffer: 1024 * 1024,
        encoding: 'buffer', ...options })).stdout;
}

async function validatePair(bytes, temporary, env, expectedCertificate) {
    const signing = parseSigningProperties(bytes[1]);
    if (!bytes[0].length || bytes[0].length > 65536) throw new Error('签名密钥大小无效。');
    const keystore = resolve(temporary, 'validate.jks');
    await writeFile(keystore, bytes[0], { mode: 0o600 });
    const keytool = env.JAVA_HOME ? resolve(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool') : 'keytool';
    const options = { env: { ...env, POKECHILL_STORE_PASSWORD: signing.storePassword, POKECHILL_KEY_PASSWORD: signing.keyPassword }, timeout: 20000 };
    const args = ['-keystore', keystore, '-alias', signing.keyAlias, '-storepass:env', 'POKECHILL_STORE_PASSWORD'];
    let certificate;
    try {
        certificate = await command(keytool, ['-exportcert', ...args], options);
        // A matching public certificate alone is insufficient: also verify access to its private key.
        await command(keytool, ['-certreq', ...args, '-keypass:env', 'POKECHILL_KEY_PASSWORD'], options);
    } catch { throw new Error('无法验证签名密钥及密码，请检查 JDK 与私有备份；不会重新生成密钥。'); }
    if (createHash('sha256').update(certificate).digest('hex') !== expectedCertificate) {
        throw new Error('签名证书与已分发 APK 不一致，已停止恢复和构建。');
    }
}

export async function ensureAndroidSigning({ root = projectRoot, env = process.env, forceRestore = false,
    repositoryUrl = repository, expectedCertificate = signingCertificateSha256 } = {}) {
    const local = resolve(root, '.local');
    await mkdir(local, { recursive: true });
    const targets = paths.map(path => resolve(root, path));
    const present = await Promise.all(targets.map(exists));
    const temporary = await mkdtemp(resolve(local, 'android-signing-'));
    try {
        let bytes;
        let commit;
        if (present.every(Boolean) && !forceRestore) {
            bytes = await Promise.all(targets.map(path => readFile(path)));
        } else {
            const cache = resolve(local, 'android-signing.git');
            try {
                if (!await exists(cache)) {
                    await command('git', ['clone', '--bare', '--filter=blob:none', '--depth=1', '--branch', 'main', repositoryUrl, cache], { env });
                } else {
                    const origin = (await command('git', ['-C', cache, 'remote', 'get-url', 'origin'], { env })).toString().trim();
                    if (origin !== repositoryUrl) throw new Error('Unexpected signing repository');
                    await command('git', ['-C', cache, 'fetch', '--depth=1', 'origin', 'main'], { env });
                }
                commit = (await command('git', ['-C', cache, 'rev-parse', 'FETCH_HEAD'], { env }).catch(() =>
                    command('git', ['-C', cache, 'rev-parse', 'HEAD'], { env }))).toString().trim();
                if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid signing revision');
                bytes = await Promise.all(remotePaths.map(path => command('git', ['-C', cache, 'show', `${commit}:${path}`], { env })));
            } catch { throw new Error('无法从私有存档仓库读取签名备份，请检查 Git SSH 权限和 main 分支中的 android-signing/；不会创建新签名。'); }
            for (let i = 0; i < targets.length; i++) {
                if (present[i] && !(await readFile(targets[i])).equals(bytes[i])) {
                    throw new Error('本地签名文件与私有备份不同，已停止恢复，保留原文件。');
                }
            }
        }
        await validatePair(bytes, temporary, env, expectedCertificate);
        for (let i = 0; i < targets.length; i++) {
            if (present[i]) continue;
            await mkdir(resolve(targets[i], '..'), { recursive: true });
            const staged = resolve(temporary, `restore-${i}`);
            await writeFile(staged, bytes[i], { mode: 0o600 });
            // Recheck before installation to avoid replacing files created during the fetch.
            if (await exists(targets[i])) throw new Error('签名文件在恢复过程中出现，请重新核对后重试。');
            await link(staged, targets[i]);
        }
        return { restored: !present.every(Boolean), commit, certificateSha256: expectedCertificate };
    } finally {
        const child = relative(local, temporary);
        if (child.startsWith('android-signing-') && !child.includes('/') && !child.includes('\\')) {
            await rm(temporary, { recursive: true, force: true });
        }
    }
}
