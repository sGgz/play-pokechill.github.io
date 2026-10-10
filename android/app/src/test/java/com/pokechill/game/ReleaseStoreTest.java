package com.pokechill.game;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.Rule;
import org.junit.rules.TemporaryFolder;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.Assert.*;

public class ReleaseStoreTest {
    @Rule public TemporaryFolder temp = new TemporaryFolder();
    private final Map<String, byte[]> objects = new HashMap<>();
    private ReleaseManifest version(char id, String html, String script) throws Exception {
        JSONArray files = new JSONArray();
        for (String[] file : new String[][] {{ "index.html", html }, { "scripts/cloud-save.js", script }, { "img/test.png", "unchanged image" }, { "img/Test.png", "unchanged image" }}) {
            byte[] bytes = file[1].getBytes(StandardCharsets.UTF_8);
            String hash = ReleaseStore.hex(ReleaseStore.sha256().digest(bytes)); objects.put(hash, bytes);
            files.put(new JSONObject().put("path", file[0]).put("size", bytes.length).put("sha256", hash));
        }
        JSONObject json = new JSONObject().put("schema", 1).put("nativeApi", 1).put("buildId", String.valueOf(id).repeat(20)).put("gameVersion", "5").put("files", files);
        return new ReleaseManifest(json.toString().getBytes(StandardCharsets.UTF_8));
    }
    private ReleaseStore store(File root, ReleaseManifest bundled) throws Exception {
        return new ReleaseStore(root, bundled, hash -> new ByteArrayInputStream(objects.get(hash)));
    }
    @Test public void reusesBundledFilesAndDownloadsOnlyChangedObjects() throws Exception {
        ReleaseManifest bundled = version('a', "old html", "script"), next = version('b', "new html", "script");
        ReleaseStore store = store(temp.newFolder(), bundled);
        AtomicInteger downloads = new AtomicInteger();
        assertTrue(store.stage(next, hash -> { downloads.incrementAndGet(); return new ByteArrayInputStream(objects.get(hash)); }, (done, total) -> {}));
        assertEquals(1, downloads.get()); assertEquals(bundled.buildId, store.current().buildId);
        store.activate(); assertEquals(next.buildId, store.current().buildId); assertTrue(store.isTrial());
        store.healthy(); assertFalse(store.isTrial());
        assertFalse(store.stage(next, hash -> { throw new AssertionError("Must not redownload same release"); }, (done, total) -> {}));
    }
    @Test public void interruptedDownloadRetainsOldReleaseAndResumesVerifiedObjects() throws Exception {
        ReleaseManifest bundled = version('a', "old", "old script"), next = version('b', "new", "new script");
        File root = temp.newFolder(); ReleaseStore store = store(root, bundled); AtomicInteger downloads = new AtomicInteger();
        try {
            store.stage(next, hash -> { if (downloads.incrementAndGet() == 2) throw new IOException("offline"); return new ByteArrayInputStream(objects.get(hash)); }, (done, total) -> {});
            fail("Expected network failure");
        } catch (IOException expected) { assertEquals("offline", expected.getMessage()); }
        assertFalse(store.hasStaged()); assertEquals(bundled.buildId, store.current().buildId);
        ReleaseStore restarted = store(root, bundled); downloads.set(0);
        restarted.stage(next, hash -> { downloads.incrementAndGet(); return new ByteArrayInputStream(objects.get(hash)); }, (done, total) -> {});
        assertEquals(1, downloads.get()); assertTrue(restarted.hasStaged());
    }
    @Test public void rejectsCorruptDownloadWithoutChangingActiveVersion() throws Exception {
        ReleaseManifest bundled = version('a', "old", "script"), next = version('b', "new", "script");
        ReleaseStore store = store(temp.newFolder(), bundled);
        assertThrows(IOException.class, () -> store.stage(next, hash -> new ByteArrayInputStream("bad".getBytes()), (done, total) -> {}));
        assertFalse(store.hasStaged()); assertEquals(bundled.buildId, store.current().buildId);
    }
    @Test public void processDeathDuringTrialRollsBackAndBlocksBadVersion() throws Exception {
        ReleaseManifest bundled = version('a', "old", "script"), next = version('b', "new", "script");
        File root = temp.newFolder(); ReleaseStore store = store(root, bundled);
        store.stage(next, hash -> new ByteArrayInputStream(objects.get(hash)), (done, total) -> {}); store.activate();
        ReleaseStore restarted = store(root, bundled);
        assertTrue(restarted.recovered); assertEquals(bundled.buildId, restarted.current().buildId);
        assertThrows(IOException.class, () -> restarted.stage(next, hash -> { throw new AssertionError(); }, (done, total) -> {}));
    }
    @Test public void healthyVersionAndPreparedUpdateSurviveRestart() throws Exception {
        ReleaseManifest bundled = version('a', "old", "script"), next = version('b', "new", "script");
        File root = temp.newFolder(); ReleaseStore store = store(root, bundled);
        store.stage(next, hash -> new ByteArrayInputStream(objects.get(hash)), (done, total) -> {});
        store = store(root, bundled); assertTrue(store.hasStaged()); store.activate(); store.healthy();
        assertEquals(next.buildId, store(root, bundled).current().buildId);
    }
    @Test public void manifestRejectsTraversalDuplicateFilesAndIncompatibleNativeCode() throws Exception {
        ReleaseManifest valid = version('a', "game", "script");
        for (String path : new String[] { "../index.html", "/index.html", "img/../../secret", "img/%2e%2e/secret", "img/a\\b", "updates/latest.json", "img//a" }) {
            JSONObject json = new JSONObject(new String(valid.bytes, StandardCharsets.UTF_8)); json.getJSONArray("files").getJSONObject(2).put("path", path);
            assertThrows(path, IOException.class, () -> new ReleaseManifest(json.toString().getBytes(StandardCharsets.UTF_8)));
        }
        JSONObject duplicate = new JSONObject(new String(valid.bytes, StandardCharsets.UTF_8));
        duplicate.getJSONArray("files").put(duplicate.getJSONArray("files").getJSONObject(0));
        assertThrows(IOException.class, () -> new ReleaseManifest(duplicate.toString().getBytes(StandardCharsets.UTF_8)));
        JSONObject incompatible = new JSONObject(new String(valid.bytes, StandardCharsets.UTF_8)).put("nativeApi", 2);
        assertThrows(IOException.class, () -> new ReleaseManifest(incompatible.toString().getBytes(StandardCharsets.UTF_8)));
    }
}
