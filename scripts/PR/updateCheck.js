// Compare the deployed build with the build currently loaded in this page.
// Custom forks must never follow the upstream author's commits.
const loadedBuild = document.querySelector('meta[name="pokechill-build"]')?.content;
let updateShown = false;

async function checkForUpdates() {
    if (!loadedBuild || loadedBuild === 'development' || updateShown) return;
    try {
        const response = await fetch('build-info.json', { cache: 'no-store', credentials: 'same-origin', redirect: 'error' });
        if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) return;
        const next = await response.json();
        if (typeof next.buildId !== 'string' || next.buildId === loadedBuild) return;
        updateShown = true;
        const banner = document.createElement('button');
        banner.type = 'button';
        banner.textContent = '你的游戏有新版本 · 点击保存并刷新';
        banner.className = 'update-banner';
        banner.onclick = () => {
            if (window.PokeChillCloud && !window.PokeChillCloud.canSave()) return;
            saveGame(); location.reload();
        };
        document.body.appendChild(banner);
    } catch { /* A failed update check must not interrupt local play. */ }
}
setInterval(checkForUpdates, 5 * 60 * 1000);
