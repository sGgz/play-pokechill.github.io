package com.pokechill.game;

import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Set;

/** Owns immutable objects and crash-safe version selection; never owns or removes game saves. */
final class ReleaseStore {
    interface Source { InputStream open(String hash) throws IOException; }
    interface Progress { void report(int complete, int total); }
    private final File root, objects, manifests;
    private final Source bundledObjects;
    final ReleaseManifest bundled;
    private final Set<String> bundledHashes = new HashSet<>();
    private final Set<String> failed = new HashSet<>();
    private volatile ReleaseManifest current;
    private String previous = "", pending = "", staged = "";
    boolean recovered;

    ReleaseStore(File root, ReleaseManifest bundled, Source bundledObjects) throws IOException {
        this.root = root; this.bundled = bundled; this.bundledObjects = bundledObjects;
        objects = new File(root, "objects"); manifests = new File(root, "releases");
        Files.createDirectories(objects.toPath()); Files.createDirectories(manifests.toPath());
        for (ReleaseManifest.Entry entry : bundled.files.values()) bundledHashes.add(entry.hash);
        current = bundled;
        File stateFile = new File(root, "state.json");
        if (stateFile.isFile()) {
            try {
                JSONObject state = new JSONObject(new String(Files.readAllBytes(stateFile.toPath()), StandardCharsets.UTF_8));
                if (bundled.buildId.equals(state.getString("bundled"))) {
                    JSONArray rejected = state.optJSONArray("failed");
                    if (rejected != null) for (int i = 0; i < rejected.length(); i++) failed.add(rejected.getString(i));
                    previous = state.optString("previous"); pending = state.optString("pending"); staged = state.optString("staged");
                    String active = state.optString("active", bundled.buildId);
                    if (!pending.isEmpty()) { failed.add(pending); active = previous; pending = ""; recovered = true; }
                    current = load(active);
                    validate(current);
                    if (!staged.isEmpty()) validate(load(staged));
                }
            } catch (Exception error) {
                // A damaged selection or object cannot prevent the APK's bundled game from starting.
                current = bundled; previous = ""; pending = ""; staged = ""; recovered = true;
            }
        }
        persist();
    }

    ReleaseManifest current() { return current; }
    synchronized boolean hasStaged() { return !staged.isEmpty() && !staged.equals(current.buildId); }
    synchronized boolean isTrial() { return !pending.isEmpty(); }

    private ReleaseManifest load(String id) throws IOException {
        if (id.equals(bundled.buildId)) return bundled;
        if (!id.matches("[a-f0-9]{20}")) throw new IOException("本地资源版本无效。");
        ReleaseManifest manifest = new ReleaseManifest(Files.readAllBytes(new File(manifests, id + ".json").toPath()));
        if (!manifest.buildId.equals(id)) throw new IOException("本地版本标识不一致。");
        return manifest;
    }

    InputStream open(ReleaseManifest.Entry entry) throws IOException {
        if (bundledHashes.contains(entry.hash)) return bundledObjects.open(entry.hash);
        File object = new File(objects, entry.hash);
        if (!object.isFile() || object.length() != entry.size) throw new IOException("本地资源不完整。");
        return new FileInputStream(object);
    }

    private void validate(ReleaseManifest manifest) throws IOException {
        Set<String> checked = new HashSet<>();
        for (ReleaseManifest.Entry entry : manifest.files.values()) {
            if (!checked.add(entry.hash)) continue;
            try (InputStream stream = open(entry)) {
                if (!digest(stream, entry.size).equals(entry.hash)) throw new IOException("本地资源校验失败。");
            }
        }
    }

    // Called on a single download executor, without holding the resource serving lock.
    boolean stage(ReleaseManifest manifest, Source remote, Progress progress) throws IOException {
        synchronized (this) {
            if (manifest.buildId.equals(current.buildId)) return false;
            if (!pending.isEmpty()) throw new IOException("当前版本正在验证，请先进入游戏。");
            if (failed.contains(manifest.buildId)) throw new IOException("此版本启动失败，已保留可用版本，等待新的发布。");
        }
        Set<String> unique = new HashSet<>();
        for (ReleaseManifest.Entry entry : manifest.files.values()) unique.add(entry.hash);
        Set<String> complete = new HashSet<>();
        for (ReleaseManifest.Entry entry : manifest.files.values()) {
            if (!complete.add(entry.hash)) continue;
            File destination = new File(objects, entry.hash);
            boolean reusable = bundledHashes.contains(entry.hash);
            if (!reusable && destination.isFile()) {
                try (InputStream stream = new FileInputStream(destination)) { reusable = digest(stream, entry.size).equals(entry.hash); }
                catch (IOException ignored) { reusable = false; }
            }
            if (!reusable) {
                File temp = new File(objects, entry.hash + ".part");
                try (InputStream input = remote.open(entry.hash); FileOutputStream output = new FileOutputStream(temp)) {
                    MessageDigest digest = sha256(); long count = 0; byte[] buffer = new byte[32768]; int length;
                    while ((length = input.read(buffer)) != -1) {
                        count += length;
                        if (count > entry.size) throw new IOException("下载资源长度不符。");
                        digest.update(buffer, 0, length); output.write(buffer, 0, length);
                    }
                    if (count != entry.size || !hex(digest.digest()).equals(entry.hash)) throw new IOException("下载资源校验失败，当前游戏继续可用。");
                    output.getFD().sync();
                } catch (IOException error) { Files.deleteIfExists(temp.toPath()); throw error; }
                move(temp, destination);
            }
            progress.report(complete.size(), unique.size());
        }
        validate(manifest);
        atomicWrite(new File(manifests, manifest.buildId + ".json"), manifest.bytes);
        synchronized (this) { staged = manifest.buildId; persist(); }
        return true;
    }

    synchronized void activate() throws IOException {
        if (!hasStaged()) return;
        ReleaseManifest next = load(staged);
        validate(next);
        ReleaseManifest old = current;
        String oldPrevious = previous, oldStaged = staged;
        previous = current.buildId; pending = next.buildId; current = next; staged = "";
        try { persist(); }
        catch (IOException error) { current = old; previous = oldPrevious; staged = oldStaged; pending = ""; throw error; }
    }

    synchronized void healthy() throws IOException {
        if (!pending.isEmpty()) {
            String trial = pending; pending = "";
            try { persist(); } catch (IOException error) { pending = trial; throw error; }
            prune();
        }
    }

    private void prune() {
        try {
            Set<String> keepVersions = new HashSet<>(), keepObjects = new HashSet<>();
            keepVersions.add(current.buildId); keepVersions.add(bundled.buildId);
            if (!previous.isEmpty()) keepVersions.add(previous);
            if (!staged.isEmpty()) keepVersions.add(staged);
            for (String id : keepVersions) for (ReleaseManifest.Entry entry : load(id).files.values()) keepObjects.add(entry.hash);
            File[] cached = objects.listFiles();
            if (cached != null) for (File file : cached) if (file.getName().matches("[a-f0-9]{64}") && !keepObjects.contains(file.getName())) Files.deleteIfExists(file.toPath());
            File[] versions = manifests.listFiles();
            if (versions != null) for (File file : versions) if (file.getName().matches("[a-f0-9]{20}\\.json") && !keepVersions.contains(file.getName().substring(0, 20))) Files.deleteIfExists(file.toPath());
        } catch (IOException ignored) { /* Cleanup is optional; it must never invalidate a healthy release. */ }
    }

    synchronized void rollback() throws IOException {
        if (pending.isEmpty()) return;
        failed.add(pending);
        try { current = load(previous); validate(current); }
        catch (IOException error) { current = bundled; }
        pending = ""; staged = ""; persist(); recovered = true;
    }

    private void persist() throws IOException {
        try {
            JSONObject state = new JSONObject().put("bundled", bundled.buildId).put("active", current.buildId)
                .put("previous", previous).put("pending", pending).put("staged", staged).put("failed", new JSONArray(failed));
            atomicWrite(new File(root, "state.json"), state.toString().getBytes(StandardCharsets.UTF_8));
        } catch (org.json.JSONException error) { throw new IOException("无法保存更新状态。", error); }
    }

    static byte[] readBounded(InputStream stream, int maximum) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream(); byte[] buffer = new byte[32768]; int length;
        while ((length = stream.read(buffer)) != -1) {
            if ((long) output.size() + length > maximum) throw new IOException("响应过大。");
            output.write(buffer, 0, length);
        }
        return output.toByteArray();
    }

    private static String digest(InputStream stream, long expected) throws IOException {
        MessageDigest digest = sha256(); byte[] buffer = new byte[32768]; int count; long total = 0;
        while ((count = stream.read(buffer)) != -1) {
            total += count;
            if (total > expected) throw new IOException("资源长度不符。");
            digest.update(buffer, 0, count);
        }
        if (total != expected) throw new IOException("资源长度不符。");
        return hex(digest.digest());
    }

    static MessageDigest sha256() {
        try { return MessageDigest.getInstance("SHA-256"); }
        catch (NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }
    static String hex(byte[] bytes) {
        StringBuilder value = new StringBuilder();
        for (byte b : bytes) value.append(String.format(java.util.Locale.ROOT, "%02x", b & 255));
        return value.toString();
    }
    private static void atomicWrite(File destination, byte[] bytes) throws IOException {
        File temp = new File(destination.getParentFile(), destination.getName() + ".tmp");
        try (FileOutputStream output = new FileOutputStream(temp)) { output.write(bytes); output.getFD().sync(); }
        move(temp, destination);
    }
    private static void move(File source, File destination) throws IOException {
        try { Files.move(source.toPath(), destination.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING); }
        catch (java.nio.file.AtomicMoveNotSupportedException error) { Files.move(source.toPath(), destination.toPath(), StandardCopyOption.REPLACE_EXISTING); }
    }
}
