/* World Revolution News – allgemeine Hilfsfunktionen */
'use strict';

function getClientId() {
    const storageKey = "wrn_client_id";
    let value = localStorage.getItem(storageKey);
    if (value) return value;

    value = (window.crypto?.randomUUID?.() || `wrn-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(storageKey, value);
    return value;
}

// Wandelt beliebigen Text so um, dass er gefahrlos in einen HTML-String eingesetzt werden kann.
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Erlaubt bei externen Links und Bildern ausschließlich http:// und https://.
function getSafeHttpUrl(value) {
    try {
        const url = new URL(String(value ?? ""));
        if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch (error) {}
    return "";
}

// Kodiert Text für Inline-Button-Aufrufe, damit Anführungszeichen keinen Code beschädigen.
function encodeText(value) {
    return btoa(unescape(encodeURIComponent(String(value ?? ""))));
}

function decodeText(value) {
    return decodeURIComponent(escape(atob(value)));
}

// Gibt alle Kategorien eines Artikels zurück.
// Neue Daten verwenden "categories" als Liste. Alte Daten besitzen nur "kontinent".
// Dadurch bleiben bereits vorhandene news.json-Dateien und alte Lesezeichen kompatibel.
function getArticleCategories(article) {
    const result = [];

    if (article && Array.isArray(article.categories)) {
        article.categories.forEach(category => {
            const cleanCategory = String(category ?? "").trim();
            if (cleanCategory && !result.includes(cleanCategory)) {
                result.push(cleanCategory);
            }
        });
    }

    const oldCategory = String(article?.kontinent ?? "").trim();
    if (oldCategory && !result.includes(oldCategory)) {
        result.push(oldCategory);
    }

    return result;
}

// Prüft, ob ein Artikel zu einer bestimmten Kategorie gehört.
function articleMatchesCategory(article, category) {
    return getArticleCategories(article).includes(category);
}

// Fügt übersetzten Klartext mit sichtbaren Zeilenumbrüchen ein, ohne HTML auszuführen.
function appendMultilineText(element, text, addEmptyLine = false) {
    if (!element) return;
    if (addEmptyLine && element.childNodes.length > 0) {
        element.append(document.createElement("br"), document.createElement("br"));
    }
    const lines = String(text ?? "").split("\n");
    lines.forEach((line, index) => {
        if (index > 0) element.append(document.createElement("br"));
        element.append(document.createTextNode(line));
    });
}

function changeFontSize(sizeValue) {
    const numericValue = Math.min(180, Math.max(100, Number(sizeValue) || 100));
    document.documentElement.style.setProperty('--article-font-scale', String(numericValue / 100));
    localStorage.setItem('wrn_font_zoom', String(numericValue));
}

function setTxt(id, text) { const e = document.getElementById(id); if (e && text) e.innerText = text; }
function setHtml(id, html) { const e = document.getElementById(id); if (e && html) e.innerHTML = html; }
function setPh(id, text) { const e = document.getElementById(id); if (e && text) e.placeholder = text; }
