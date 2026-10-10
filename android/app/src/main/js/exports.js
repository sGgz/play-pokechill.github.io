(() => {
    if (window.__pcExportInstalled) return;
    window.__pcExportInstalled = true;
    const blobs = new Map();
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    URL.createObjectURL = function (blob) {
        const url = create.call(this, blob);
        blobs.set(url, blob);
        return url;
    };
    URL.revokeObjectURL = function (url) {
        blobs.delete(url);
        return revoke.call(this, url);
    };
    const isExport = anchor => anchor && anchor.download
        && (anchor.href.startsWith('blob:') || anchor.href.startsWith('data:'));
    const send = async anchor => {
        try {
            // The upstream exporter revokes its blob immediately after a detached
            // anchor.click(). Capture the Blob synchronously before that revocation.
            const blob = blobs.get(anchor.href) || await (await fetch(anchor.href)).blob();
            if (blob.size > 8388608) throw new Error('存档文件过大');
            prompt('pokechill-export', JSON.stringify({ name: anchor.download, text: await blob.text() }));
        } catch (error) { alert('导出失败：' + error.message); }
    };
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
        if (isExport(this)) { void send(this); return; }
        return click.apply(this, arguments);
    };
    document.addEventListener('click', event => {
        const anchor = event.target.closest?.('a[download]');
        if (isExport(anchor)) { event.preventDefault(); void send(anchor); }
    }, true);
})();
