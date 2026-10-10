// CLI smoke test against test/browser-fixture.ts only; never run against a real player site.
// playwright-cli --session <fixture-session> run-code --filename test/browser-refresh.smoke.js
async (page) => {
    if (new URL(page.url()).origin !== 'http://127.0.0.1:3001') throw new Error('Use the isolated browser fixture');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => window.PokeChillCloud?.canRun());
    const before = await page.evaluate(() => localStorage.getItem('gameData'));
    let releaseImage, intercepted = 0;
    const imageGate = new Promise(resolve => { releaseImage = resolve; });
    await page.route('**/img/icons/pokeball.svg', async route => { intercepted++; await imageGate; await route.continue(); });
    let stalledImageState;
    try {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => window.PokeChillCloud?.canRun(), null, { timeout: 3000 });
        stalledImageState = await page.evaluate(() => ({ readyState: document.readyState,
            cloudVisible: !!document.getElementById('pc-cloud'), canRun: window.PokeChillCloud.canRun() }));
        if (!intercepted || !stalledImageState.cloudVisible || stalledImageState.readyState !== 'interactive') {
            throw new Error('Startup must finish while a requested menu image is still pending: ' + JSON.stringify(stalledImageState));
        }
    } finally { releaseImage(); await page.unrouteAll({ behavior: 'wait' }); }
    const durations = [];
    for (let attempt = 0; attempt < 20; attempt++) {
        const start = Date.now();
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => window.PokeChillCloud?.canRun(), null, { timeout: 4000 });
        const state = await page.evaluate(async () => ({ locks: await navigator.locks.query(),
            save: localStorage.getItem('gameData'), build: document.querySelector('meta[name="pokechill-build"]').content,
            scripts: [...document.querySelectorAll('script[src]')].map(script => script.src) }));
        if (state.locks.held.length !== 1 || state.locks.pending.length) throw new Error('Refresh leaked a writer request: ' + JSON.stringify(state.locks));
        if (state.scripts.some(src => new URL(src).searchParams.get('v') !== state.build)) throw new Error('Scripts must share the current HTML build version');
        if (before) {
            const previous = JSON.parse(before), current = JSON.parse(state.save);
            if (current.saved.firstTimePlaying !== previous.saved.firstTimePlaying || current.litten.caught !== previous.litten.caught) {
                throw new Error('Refresh must preserve the existing starter and local progress');
            }
        }
        durations.push(Date.now() - start);
    }
    return { stalledImageState, refreshes: durations.length, maxMs: Math.max(...durations),
        averageMs: Math.round(durations.reduce((sum, time) => sum + time, 0) / durations.length), checkedExistingSave: !!before };
}
