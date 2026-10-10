import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, relative } from 'node:path';
import { ensureAndroidSigning, parseSigningProperties } from '../tools/android-signing.mjs';

const properties = Buffer.from('storeFile=../.local/android-release.jks\nstorePassword=test_password_123456\nkeyAlias=pokechill\nkeyPassword=test_password_123456\n');

test('signing configuration rejects path changes, missing credentials and duplicate fields', () => {
    assert.equal(parseSigningProperties(properties).keyAlias, 'pokechill');
    for (const value of [properties.toString().replace('../.local/android-release.jks', '../../another.jks'),
        properties.toString().replace('keyAlias=pokechill', 'keyAlias=another'),
        properties.toString().replace('storePassword=test_password_123456', 'storePassword='),
        properties.toString() + 'keyAlias=pokechill\n']) {
        assert.throws(() => parseSigningProperties(Buffer.from(value)));
    }
});

test('private signing restores the original pair and refuses incompatible credentials', async t => {
    const javaHome = process.env.JAVA_HOME || (process.platform === 'win32' ? 'E:/DevCache/pokechill-android/jdk' : '');
    const keytool = javaHome ? resolve(javaHome, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool') : 'keytool';
    const env = { ...process.env, ...(javaHome ? { JAVA_HOME: javaHome } : {}), SIGNING_TEST_PASSWORD: 'test_password_123456' };
    try { execFileSync(keytool, ['-help'], { env, windowsHide: true, stdio: 'ignore' }); }
    catch { t.skip('JDK keytool required for private signing integration tests'); return; }
    const directory = await mkdtemp(resolve(tmpdir(), 'pokechill-signing-test-'));
    const git = args => execFileSync('git', args, { cwd: directory, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
        const keystore = resolve(directory, 'fixture.jks');
        const args = ['-keystore', keystore, '-storepass:env', 'SIGNING_TEST_PASSWORD', '-alias', 'pokechill'];
        execFileSync(keytool, ['-genkeypair', ...args, '-keypass:env', 'SIGNING_TEST_PASSWORD', '-keyalg', 'RSA', '-keysize', '2048', '-dname', 'CN=Signing Test', '-noprompt'], { env, windowsHide: true, stdio: 'ignore' });
        const certificate = execFileSync(keytool, ['-exportcert', ...args], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
        const expectedCertificate = createHash('sha256').update(certificate).digest('hex');
        const bytes = await readFile(keystore);
        const repo = resolve(directory, 'repository');
        await mkdir(resolve(repo, 'android-signing'), { recursive: true });
        await writeFile(resolve(repo, 'android-signing/android-release.jks'), bytes);
        await writeFile(resolve(repo, 'android-signing/signing.local.properties'), properties);
        git(['init', '-b', 'main', repo]);
        git(['-C', repo, 'add', 'android-signing']);
        git(['-C', repo, '-c', 'user.name=Signing Test', '-c', 'user.email=test@example.com', 'commit', '-m', 'Signing fixture']);
        const options = { env, repositoryUrl: repo, expectedCertificate };
        const createRoot = async name => {
            const root = resolve(directory, name);
            await mkdir(resolve(root, 'android'), { recursive: true });
            await mkdir(resolve(root, '.local'), { recursive: true });
            return root;
        };
        await t.test('fresh restore and offline reuse preserve identical bytes', async () => {
            const root = await createRoot('fresh');
            const result = await ensureAndroidSigning({ ...options, root });
            assert.equal(result.restored, true);
            assert.match(result.commit, /^[a-f0-9]{40}$/);
            assert.deepEqual(await readFile(resolve(root, '.local/android-release.jks')), bytes);
            assert.deepEqual(await readFile(resolve(root, 'android/signing.local.properties')), properties);
            assert.equal((await ensureAndroidSigning({ ...options, root, repositoryUrl: resolve(directory, 'absent') })).restored, false);
            assert.equal((await ensureAndroidSigning({ ...options, root, forceRestore: true })).restored, false);
        });
        await t.test('one missing file is restored without changing the other', async () => {
            const root = await createRoot('partial');
            await writeFile(resolve(root, '.local/android-release.jks'), bytes);
            assert.equal((await ensureAndroidSigning({ ...options, root })).restored, true);
            assert.deepEqual(await readFile(resolve(root, '.local/android-release.jks')), bytes);
            assert.deepEqual(await readFile(resolve(root, 'android/signing.local.properties')), properties);
        });
        await t.test('local conflicts and mismatched certificates never install credentials', async () => {
            const root = await createRoot('conflict');
            await writeFile(resolve(root, '.local/android-release.jks'), 'keep existing');
            await assert.rejects(ensureAndroidSigning({ ...options, root }), /本地签名文件与私有备份不同/);
            assert.equal(await readFile(resolve(root, '.local/android-release.jks'), 'utf8'), 'keep existing');
            await assert.rejects(access(resolve(root, 'android/signing.local.properties')));
            const other = await createRoot('wrong-certificate');
            await assert.rejects(ensureAndroidSigning({ ...options, root: other, expectedCertificate: '0'.repeat(64) }), /签名证书与已分发 APK 不一致/);
            await assert.rejects(access(resolve(other, '.local/android-release.jks')));
        });
        await t.test('invalid private key password and unavailable backup do not create a new key', async () => {
            const root = await createRoot('wrong-password');
            await writeFile(resolve(root, '.local/android-release.jks'), bytes);
            await writeFile(resolve(root, 'android/signing.local.properties'), properties.toString().replace('keyPassword=test_password_123456', 'keyPassword=wrong_password_123456'));
            await assert.rejects(ensureAndroidSigning({ ...options, root }), /签名配置与既有 APK 不兼容/);
            await writeFile(resolve(root, 'android/signing.local.properties'), properties.toString().replaceAll('test_password_123456', 'wrong_password_123456'));
            await assert.rejects(ensureAndroidSigning({ ...options, root }), /无法验证签名密钥及密码/);
            const other = await createRoot('unavailable');
            await assert.rejects(ensureAndroidSigning({ ...options, root: other, repositoryUrl: resolve(directory, 'absent') }), /无法从私有存档仓库读取/);
            await assert.rejects(access(resolve(other, '.local/android-release.jks')));
        });
    } finally {
        const child = relative(tmpdir(), directory);
        if (child.startsWith('pokechill-signing-test-') && !child.includes('/') && !child.includes('\\')) await rm(directory, { recursive: true, force: true });
    }
});
