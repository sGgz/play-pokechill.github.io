package com.pokechill.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.webkit.CookieManager;
import android.webkit.JsPromptResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Keeps game resources local while same-origin authentication and saves use the existing server. */
public final class MainActivity extends Activity {
    private static final int IMPORT_FILE = 10, EXPORT_FILE = 11;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private WebView game;
    private ReleaseStore releases;
    private TextView status;
    private Button apply, check;
    private Dialog loginDialog;
    private ValueCallback<Uri[]> fileChooser;
    private byte[] exportBytes;
    private String exportScript;
    private boolean checking, foreground, destroyed;
    private long lastCheck, healthDeadline;
    private final Runnable periodic = new Runnable() {
        public void run() { if (foreground && !destroyed) { checkUpdate(false); handler.postDelayed(this, 300000); } }
    };
    private final Runnable health = new Runnable() {
        public void run() {
            if (destroyed || !foreground || !releases.isTrial()) return;
            game.evaluateJavascript("window.PokeChillCloud?.resourceStatus?.() || 'missing'", value -> {
                if (destroyed || !releases.isTrial()) return;
                if ("\"ready\"".equals(value)) {
                    io.execute(() -> { try { releases.healthy(); ui(() -> message("已更新，进度继续保存在本机。")); } catch (IOException error) { showError(error); } });
                } else if ("\"waiting\"".equals(value)) {
                    // Login, cloud conflict resolution and deliberate offline startup are user decisions.
                    healthDeadline = SystemClock.elapsedRealtime() + 60000;
                    handler.postDelayed(this, 1500);
                } else if (SystemClock.elapsedRealtime() > healthDeadline) rollback();
                else handler.postDelayed(this, 1500);
            });
        }
    };

    @Override public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        LinearLayout layout = new LinearLayout(this); layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.rgb(238, 244, 236));
        LinearLayout actions = new LinearLayout(this);
        Button login = new Button(this); login.setText("云登录"); login.setOnClickListener(view -> openLogin());
        check = new Button(this); check.setText("检查更新"); check.setOnClickListener(view -> checkUpdate(true));
        apply = new Button(this); apply.setText("应用更新"); apply.setEnabled(false); apply.setOnClickListener(view -> applyUpdate());
        for (Button button : new Button[] { login, check, apply }) actions.addView(button, new LinearLayout.LayoutParams(0, -2, 1));
        layout.addView(actions);
        status = new TextView(this); status.setTextSize(12); status.setPadding(16, 0, 16, 8);
        status.setTextColor(Color.rgb(35, 60, 54)); layout.addView(status);
        game = new WebView(this); layout.addView(game, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(layout);
        // Keep controls clear of system bars, including Android 15's edge-to-edge default.
        layout.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        configure(game, true);
        game.setWebViewClient(new GameClient());
        game.setWebChromeClient(new GameChrome());
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        CookieManager.getInstance().setAcceptCookie(true);
        android.content.pm.PackageInfo webViewPackage = WebView.getCurrentWebViewPackage();
        if (webViewPackage != null && webViewPackage.versionName != null) {
            try {
                if (Integer.parseInt(webViewPackage.versionName.split("\\.")[0]) < 120) {
                    new AlertDialog.Builder(this).setTitle("需要更新网页运行组件")
                        .setMessage("请先更新 Android System WebView 或 Chrome 至 120 或更高版本，再打开游戏。游戏需要新版浏览器的本地存储和多会话保护能力。")
                        .setPositiveButton("关闭", (dialog, which) -> finish()).show();
                    return;
                }
            } catch (NumberFormatException ignored) { /* Unknown vendor version: let the game's capability checks report it. */ }
        }
        io.execute(() -> {
            try {
                ReleaseManifest bundled;
                try (InputStream stream = getAssets().open("web/latest.json")) { bundled = new ReleaseManifest(ReleaseStore.readBounded(stream, ReleaseManifest.MAX_MANIFEST_BYTES)); }
                try (InputStream stream = getAssets().open("android-exports.js")) { exportScript = new String(ReleaseStore.readBounded(stream, 65536), StandardCharsets.UTF_8); }
                releases = new ReleaseStore(new java.io.File(getFilesDir(), "web-updates"), bundled, hash -> getAssets().open("web/objects/" + hash));
                ui(() -> {
                    message(releases.recovered ? "已恢复可用版本，本地存档保留。" : "游戏资源已在本机。联网登录后自动检查更新。");
                    apply.setEnabled(releases.hasStaged()); game.loadUrl(BuildConfig.GAME_ORIGIN + "/"); checkUpdate(false);
                });
            } catch (IOException error) { ui(() -> new AlertDialog.Builder(this).setTitle("无法打开游戏").setMessage(error.getMessage()).setPositiveButton("关闭", (dialog, which) -> finish()).show()); }
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configure(WebView web, boolean isGame) {
        web.getSettings().setJavaScriptEnabled(isGame);
        web.getSettings().setDomStorageEnabled(isGame);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(isGame);
        web.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.getSettings().setSupportMultipleWindows(isGame);
        web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
    }

    private boolean sameOrigin(Uri uri) {
        Uri expected = Uri.parse(BuildConfig.GAME_ORIGIN);
        return "https".equals(uri.getScheme()) && expected.getHost().equals(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443) && uri.getUserInfo() == null;
    }

    private final class GameClient extends WebViewClient {
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (!sameOrigin(uri)) return errorResponse(403, "Forbidden");
            String path = uri.getPath();
            if (path == null) return errorResponse(404, "Not Found");
            if (path.equals("/login") || path.startsWith("/auth/") || path.startsWith("/api/") || path.startsWith("/updates/")) return null;
            if (!request.getMethod().equals("GET")) return errorResponse(405, "Method Not Allowed");
            String resource = path.equals("/") ? "index.html" : path.substring(1);
            ReleaseStore store = releases;
            ReleaseManifest.Entry entry = store == null ? null : store.current().files.get(resource);
            if (entry == null) return errorResponse(404, "Not Found");
            try {
                return new WebResourceResponse(mime(resource), "UTF-8", 200, "OK",
                    localHeaders(), store.open(entry));
            } catch (IOException error) { return errorResponse(503, "Resource Unavailable"); }
        }
        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (sameOrigin(uri) && "/login".equals(uri.getPath())) { openLogin(); return true; }
            // Only the local game document runs in the main WebView.
            if (sameOrigin(uri) && ("/".equals(uri.getPath()) || "/index.html".equals(uri.getPath()))) return false;
            if ("https".equals(uri.getScheme())) { try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (android.content.ActivityNotFoundException ignored) { message("没有可用的浏览器。"); } }
            return true;
        }
        @Override public void onPageFinished(WebView view, String url) {
            if (!sameOrigin(Uri.parse(url))) return;
            injectExports();
            if (releases.isTrial()) { healthDeadline = SystemClock.elapsedRealtime() + 60000; handler.removeCallbacks(health); handler.post(health); }
        }
    }

    private static String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js") || path.endsWith(".mjs")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg")) return "image/jpeg";
        if (path.endsWith(".gif")) return "image/gif";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".ttf")) return "font/ttf";
        return "application/octet-stream";
    }
    private static WebResourceResponse errorResponse(int code, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", code, reason, localHeaders(), new ByteArrayInputStream(new byte[0]));
    }
    private static Map<String, String> localHeaders() {
        Map<String, String> headers = new HashMap<>(); headers.put("Cache-Control", "no-store"); headers.put("X-Content-Type-Options", "nosniff"); return headers;
    }

    private void openLogin() {
        if (loginDialog != null && loginDialog.isShowing()) return;
        Dialog dialog = new Dialog(this); loginDialog = dialog;
        LinearLayout content = new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL);
        Button close = new Button(this); close.setText("返回游戏"); close.setOnClickListener(view -> dialog.dismiss()); content.addView(close);
        WebView login = new WebView(this); configure(login, false); content.addView(login, new LinearLayout.LayoutParams(-1, 0, 1));
        login.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!sameOrigin(request.getUrl())) return true;
                if ("/".equals(request.getUrl().getPath())) { dialog.dismiss(); return true; }
                return false;
            }
        });
        dialog.setContentView(content);
        dialog.setOnDismissListener(ignored -> {
            login.destroy(); loginDialog = null; CookieManager.getInstance().flush(); lastCheck = 0;
            message("回到云存档面板点“检查连接”，确认当前登录玩家。"); checkUpdate(false);
        });
        dialog.show();
        dialog.getWindow().setLayout(-1, -1);
        login.loadUrl(BuildConfig.GAME_ORIGIN + "/login");
    }

    private InputStream remote(String path) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(BuildConfig.GAME_ORIGIN + path).openConnection();
        connection.setConnectTimeout(15000); connection.setReadTimeout(30000);
        connection.setInstanceFollowRedirects(false); connection.setUseCaches(false);
        connection.setRequestProperty("Cache-Control", "no-cache");
        String cookie = CookieManager.getInstance().getCookie(BuildConfig.GAME_ORIGIN);
        if (cookie != null) connection.setRequestProperty("Cookie", cookie);
        int code = connection.getResponseCode();
        if (code != 200) {
            connection.disconnect();
            if (code == 401 || code == 303 || code == 302) throw new IOException("请先云登录，登录后即可下载更新。本地游戏继续可用。");
            if (code == 404) throw new IOException("服务器尚未发布安卓更新资源，本地游戏继续可用。");
            throw new IOException("更新服务暂不可用，本地游戏继续可用。");
        }
        return new FilterInputStream(connection.getInputStream()) {
            @Override public void close() throws IOException { try { super.close(); } finally { connection.disconnect(); } }
        };
    }

    private void checkUpdate(boolean manual) {
        if (releases == null || checking || destroyed) return;
        long now = SystemClock.elapsedRealtime();
        if (!manual && lastCheck != 0 && now - lastCheck < 60000) return;
        lastCheck = now; checking = true; check.setEnabled(false);
        if (manual) message("正在检查更新……");
        io.execute(() -> {
            try {
                ReleaseManifest latest;
                try (InputStream stream = remote("/updates/latest.json")) { latest = new ReleaseManifest(ReleaseStore.readBounded(stream, ReleaseManifest.MAX_MANIFEST_BYTES)); }
                boolean changed = releases.stage(latest, hash -> remote("/updates/objects/" + hash), (done, total) -> {
                    if (done % 40 == 0 || done == total) ui(() -> message("正在准备新版资源 " + done + "/" + total + "，可以继续游戏。"));
                });
                ui(() -> { apply.setEnabled(releases.hasStaged()); if (changed || manual) message(changed ? "新版本已下载。点击“应用更新”保存进度并重载。" : "已经是最新版本。" ); });
            } catch (IOException error) { showError(error); }
            finally { ui(() -> { checking = false; check.setEnabled(true); }); }
        });
    }

    private void applyUpdate() {
        if (!releases.hasStaged() || checking) return;
        new AlertDialog.Builder(this).setTitle("应用新版本").setMessage("保存本地进度和恢复备份后重新打开游戏。")
            .setNegativeButton("稍后", null).setPositiveButton("保存并更新", (dialog, which) -> {
                apply.setEnabled(false);
                game.evaluateJavascript("void (async()=>{const attempt=window.__pcReloadAttempt=(window.__pcReloadAttempt||0)+1;window.__pcReloadReady=false;try{const ready=await window.PokeChillCloud.prepareResourceReload();if(attempt===window.__pcReloadAttempt)window.__pcReloadReady=ready;}catch(e){}})()", ignored -> awaitSave(0));
            }).show();
    }
    private void awaitSave(int attempts) {
        if (destroyed) return;
        game.evaluateJavascript("window.__pcReloadReady === true", result -> {
            if ("true".equals(result)) io.execute(() -> {
                try { releases.activate(); ui(() -> { message("正在打开新版本……"); game.reload(); }); }
                catch (IOException error) { showError(error); ui(() -> { game.evaluateJavascript("window.PokeChillCloud?.cancelResourceReload()", null); apply.setEnabled(releases.hasStaged()); }); }
            });
            else if (attempts < 120) handler.postDelayed(() -> awaitSave(attempts + 1), 500);
            else { game.evaluateJavascript("window.__pcReloadAttempt++;window.PokeChillCloud?.cancelResourceReload()", null); message("当前存档操作尚未完成，请稍后再应用更新。"); apply.setEnabled(true); }
        });
    }
    private void rollback() {
        io.execute(() -> {
            try { releases.rollback(); ui(() -> { message("新版本未能正常启动，已恢复上一版本。存档保留，可从云存档面板导出备份。"); game.reload(); }); }
            catch (IOException error) { showError(error); }
        });
    }

    private void injectExports() {
        game.evaluateJavascript(exportScript, null);
    }
    private final class GameChrome extends WebChromeClient {
        @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, android.os.Message result) {
            if (!gesture) return false;
            WebView popup = new WebView(MainActivity.this);
            popup.setWebViewClient(new WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    if (sameOrigin(uri) && "/login".equals(uri.getPath())) openLogin();
                    else if ("https".equals(uri.getScheme())) try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (android.content.ActivityNotFoundException ignored) { }
                    popup.destroy(); return true;
                }
            });
            ((WebView.WebViewTransport) result.obj).setWebView(popup); result.sendToTarget(); return true;
        }
        @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileChooser != null) fileChooser.onReceiveValue(null);
            fileChooser = callback;
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT); intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("*/*");
            startActivityForResult(intent, IMPORT_FILE); return true;
        }
        @Override public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
            if (!sameOrigin(Uri.parse(url)) || !"pokechill-export".equals(message)) return false;
            try {
                JSONObject data = new JSONObject(defaultValue);
                byte[] bytes = data.getString("text").getBytes(StandardCharsets.UTF_8);
                if (bytes.length > 8 * 1024 * 1024) throw new IOException("导出文件过大。");
                String name = data.getString("name").replaceAll("[^A-Za-z0-9_.-]", "_");
                exportBytes = bytes;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT); intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("application/json"); intent.putExtra(Intent.EXTRA_TITLE, name);
                startActivityForResult(intent, EXPORT_FILE); result.confirm("");
            } catch (Exception error) { result.cancel(); message("无法导出存档，请重试。"); }
            return true;
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
        if (request == IMPORT_FILE && fileChooser != null) { fileChooser.onReceiveValue(uri == null ? null : new Uri[] { uri }); fileChooser = null; }
        if (request == EXPORT_FILE) {
            byte[] bytes = exportBytes; exportBytes = null;
            if (uri != null && bytes != null) io.execute(() -> {
                try (OutputStream stream = getContentResolver().openOutputStream(uri)) {
                    if (stream == null) throw new IOException("无法打开保存位置。"); stream.write(bytes); ui(() -> message("存档已导出。"));
                } catch (IOException error) { showError(error); }
            });
        }
    }

    private void ui(Runnable task) { handler.post(() -> { if (!destroyed) task.run(); }); }
    private void message(String text) { status.setText(text); }
    private void showError(IOException error) { ui(() -> message(error.getMessage() == null ? "连接失败，本地游戏继续可用。" : error.getMessage())); }
    @Override protected void onResume() {
        super.onResume(); foreground = true;
        if (game != null) game.onResume();
        handler.removeCallbacks(periodic); handler.post(periodic);
        if (releases != null && releases.isTrial()) { healthDeadline = SystemClock.elapsedRealtime() + 60000; handler.removeCallbacks(health); handler.post(health); }
    }
    @Override protected void onPause() {
        foreground = false; handler.removeCallbacks(periodic); handler.removeCallbacks(health);
        if (game != null) {
            game.evaluateJavascript("try{if(window.PokeChillCloud?.canSave())window.saveGame()}catch(e){}", null);
            game.onPause();
        }
        CookieManager.getInstance().flush(); super.onPause();
    }
    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setMessage("返回桌面？本地进度会保存。")
            .setNegativeButton("继续游戏", null).setPositiveButton("返回桌面", (dialog, which) -> moveTaskToBack(true)).show();
    }
    @Override protected void onDestroy() {
        destroyed = true; handler.removeCallbacksAndMessages(null);
        if (loginDialog != null) loginDialog.dismiss();
        if (fileChooser != null) fileChooser.onReceiveValue(null);
        if (game != null) game.destroy(); io.shutdown(); super.onDestroy();
    }
}
