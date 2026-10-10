package com.pokechill.game;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** A complete, bounded resource version. URLs are derived from hashes, never supplied by the server. */
final class ReleaseManifest {
    static final int NATIVE_API = 1;
    static final long MAX_FILE_BYTES = 20L * 1024 * 1024;
    static final long MAX_TOTAL_BYTES = 120L * 1024 * 1024;
    static final int MAX_MANIFEST_BYTES = 4 * 1024 * 1024;
    final String buildId;
    final String gameVersion;
    final byte[] bytes;
    final Map<String, Entry> files;

    static final class Entry {
        final String path, hash;
        final long size;
        Entry(String path, String hash, long size) { this.path = path; this.hash = hash; this.size = size; }
    }

    ReleaseManifest(byte[] bytes) throws IOException {
        try {
            if (bytes.length > MAX_MANIFEST_BYTES) throw new IOException("更新清单过大。");
            JSONObject json = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            if (json.getInt("schema") != 1 || json.getInt("nativeApi") != NATIVE_API) {
                throw new IOException("此版本需要新版 APK，请更新安卓安装包。");
            }
            buildId = json.getString("buildId");
            gameVersion = json.getString("gameVersion");
            if (!buildId.matches("[a-f0-9]{20}") || !gameVersion.matches("[0-9]+(?:\\.[0-9]+)*")) throw new IOException("更新版本无效。");
            JSONArray list = json.getJSONArray("files");
            if (list.length() == 0 || list.length() > 20000) throw new IOException("更新文件数量无效。");
            Map<String, Entry> entries = new LinkedHashMap<>();
            long total = 0;
            for (int i = 0; i < list.length(); i++) {
                JSONObject file = list.getJSONObject(i);
                String path = file.getString("path"), hash = file.getString("sha256");
                long size = file.getLong("size");
                if (!validPath(path) || !hash.matches("[a-f0-9]{64}") || size < 0 || size > MAX_FILE_BYTES
                    || entries.containsKey(path)) throw new IOException("更新文件信息无效。");
                total += size;
                if (total > MAX_TOTAL_BYTES) throw new IOException("更新资源总量过大。");
                entries.put(path, new Entry(path, hash, size));
            }
            if (!entries.containsKey("index.html") || !entries.containsKey("scripts/cloud-save.js")) throw new IOException("更新缺少游戏入口。");
            files = Collections.unmodifiableMap(entries);
            this.bytes = bytes.clone();
        } catch (JSONException | ArithmeticException error) { throw new IOException("更新清单格式无效。", error); }
    }

    static boolean validPath(String path) {
        if (path.isEmpty() || path.length() > 512 || path.matches(".*[\\\\%?#:\\x00-\\x1f\\x7f].*") || path.startsWith("/")) return false;
        for (String part : path.split("/", -1)) if (part.isEmpty() || part.equals(".") || part.equals("..")) return false;
        return path.equals("index.html") || path.equals("styles.css") || path.equals("cloud-save.css") || path.equals("build-info.json")
            || path.startsWith("scripts/") || path.startsWith("img/") || path.startsWith("font/");
    }
}
