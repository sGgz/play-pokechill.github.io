import { name, translate, searchTerms, escapeText } from './core.mjs';

window.PokeChillI18n = { name, translate, searchTerms, escapeText };
document.documentElement.lang = 'zh-CN';
const skip = 'script,style,svg,code,pre,input,textarea,[translate="no"],[data-user-text]';
const visited = new WeakMap();
function localizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (!node.parentElement || node.parentElement.closest(skip) || visited.get(node) === node.nodeValue) return;
        const next = translate(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue = next;
        visited.set(node, node.nodeValue);
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.closest('script,style,svg,code,pre,[translate="no"],[data-user-text]')) {
        for (const attribute of ['title', 'placeholder', 'aria-label']) {
            if (!node.hasAttribute(attribute)) continue;
            const value = node.getAttribute(attribute);
            const next = translate(value);
            if (next !== value) node.setAttribute(attribute, next);
        }
        if (!node.matches('input,textarea')) for (const child of node.childNodes) localizeNode(child);
    }
}
localizeNode(document.body);
const pending = new Set();
let frame = 0;
new MutationObserver(records => {
    for (const record of records) {
        if (record.type === 'childList') for (const node of record.addedNodes) pending.add(node);
        else pending.add(record.target);
    }
    if (!frame && pending.size) frame = requestAnimationFrame(() => {
        frame = 0;
        for (const node of pending) if (node.isConnected) localizeNode(node);
        pending.clear();
    });
}).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder', 'aria-label'] });

for (const method of ['alert', 'confirm', 'prompt']) {
    const original = window[method].bind(window);
    window[method] = (message, ...args) => original(translate(message), ...args);
}
