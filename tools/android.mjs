import { randomBytes } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, access, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { sha256 } from './web-release.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const android = resolve(root, 'android');
const exists = path => access(path).then(() => true, () => false);

export function validateOrigin(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || (url.port && url.port !== '443')) {
        throw new Error('安卓游戏地址必须是 HTTPS 根域名，不能包含路径、账号或非标准端口。');
    }
    return url.origin;
}

export async function prepareAndroid(origin) {
    const manifest = JSON.parse(await readFile(resolve(root, 'dist/updates/latest.json'), 'utf8'));
    const target = resolve(android, 'app/src/main/assets');
    if (relative(android, target).replaceAll('\\', '/') !== 'app/src/main/assets') throw new Error('Unsafe Android assets directory');
    await rm(target, { recursive: true, force: true });
    await mkdir(resolve(target, 'web/objects'), { recursive: true });
    const copied = new Set();
    for (const entry of manifest.files) {
        if (copied.has(entry.sha256)) continue;
        if (!/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid build resource hash');
        const source = resolve(root, 'dist/updates/objects', entry.sha256);
        const bytes = await readFile(source);
        if (bytes.length !== entry.size || sha256(bytes) !== entry.sha256) throw new Error('Resource integrity check failed: ' + entry.path);
        await copyFile(source, resolve(target, 'web/objects', entry.sha256));
        copied.add(entry.sha256);
    }
    await copyFile(resolve(root, 'dist/updates/latest.json'), resolve(target, 'web/latest.json'));
    await copyFile(resolve(android, 'app/src/main/js/exports.js'), resolve(target, 'android-exports.js'));
    await writeFile(resolve(target, 'android-config.json'), JSON.stringify({ origin: validateOrigin(origin) }) + '\n', 'utf8');
    console.log(`Android resources ready: ${manifest.buildId}; ${copied.size} unique files.`);
    return manifest;
}

async function buildEnvironment() {
    const env = { ...process.env };
    // Local portable tools are optional; a normal Android Studio installation works too.
    const portable = 'E:/DevCache/pokechill-android';
    if (!env.JAVA_HOME && await exists(resolve(portable, 'jdk/bin/javac.exe'))) env.JAVA_HOME = resolve(portable, 'jdk');
    if (!env.ANDROID_HOME && await exists(resolve(portable, 'sdk/platforms/android-35'))) env.ANDROID_HOME = resolve(portable, 'sdk');
    if (!env.ANDROID_HOME && env.LOCALAPPDATA && await exists(resolve(env.LOCALAPPDATA, 'Android/Sdk'))) env.ANDROID_HOME = resolve(env.LOCALAPPDATA, 'Android/Sdk');
    if (!env.GRADLE_USER_HOME && await exists(resolve(portable, 'gradle-cache'))) env.GRADLE_USER_HOME = resolve(portable, 'gradle-cache');
    if (!env.JAVA_HOME || !await exists(resolve(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'javac.exe' : 'javac'))) {
        throw new Error('需要 JDK 17 或更高版本，请将 JAVA_HOME 指向完整 JDK（JRE 不够）。');
    }
    return env;
}

async function ensureSigning(env) {
    const properties = resolve(android, 'signing.local.properties');
    const keyStore = resolve(root, '.local/android-release.jks');
    if (await exists(properties)) return;
    if (await exists(keyStore)) throw new Error('已有签名密钥，请恢复 android/signing.local.properties，不能重新生成不同签名。');
    await mkdir(resolve(root, '.local'), { recursive: true });
    const password = randomBytes(32).toString('base64url');
    execFileSync(resolve(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool'), [
        '-genkeypair', '-keystore', keyStore, '-storepass:env', 'POKECHILL_SIGNING_PASSWORD', '-keypass:env', 'POKECHILL_SIGNING_PASSWORD',
        '-alias', 'pokechill', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=PokeChill', '-noprompt',
    ], { env: { ...env, POKECHILL_SIGNING_PASSWORD: password }, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    await writeFile(properties, `storeFile=../.local/android-release.jks\nstorePassword=${password}\nkeyAlias=pokechill\nkeyPassword=${password}\n`, { encoding: 'utf8', mode: 0o600 });
    console.log('Created a persistent private APK signing key. Back up .local/android-release.jks and android/signing.local.properties.');
}

async function main() {
    const command = process.argv[2] || 'build';
    if (!['prepare', 'build'].includes(command)) throw new Error('Usage: node tools/android.mjs [prepare|build]');
    let origin = process.env.POKECHILL_ORIGIN;
    if (!origin) {
        try { origin = JSON.parse(await readFile(resolve(root, 'cloud-save-worker/wrangler.local.json'), 'utf8')).vars?.ALLOWED_ORIGIN; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!origin) throw new Error('请先配置云站点，或设置 POKECHILL_ORIGIN=https://game.example.com。');
    validateOrigin(origin);
    await import('./build.mjs');
    await prepareAndroid(origin);
    if (command === 'prepare') return;
    const env = await buildEnvironment();
    await ensureSigning(env);
    const args = [':app:testReleaseUnitTest', ':app:lintRelease', ':app:assembleRelease', '--console=plain'];
    if (process.platform === 'win32') {
        const portableGradle = 'E:/DevCache/pokechill-android/gradle-8.11.1/bin/gradle';
        const launcher = await exists(portableGradle) ? '/e/DevCache/pokechill-android/gradle-8.11.1/bin/gradle' : './gradlew';
        execFileSync('D:/software/Git/bin/bash.exe', ['-c', launcher + ' ' + args.join(' ')], { cwd: android, env, stdio: 'inherit', windowsHide: true });
    } else execFileSync('./gradlew', args, { cwd: android, env, stdio: 'inherit' });
    const output = resolve(root, 'output/android');
    await mkdir(output, { recursive: true });
    await copyFile(resolve(android, 'app/build/outputs/apk/release/app-release.apk'), resolve(output, 'PokeChill.apk'));
    console.log('Signed APK: output/android/PokeChill.apk');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
