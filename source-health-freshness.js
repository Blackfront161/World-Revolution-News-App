/* World Revolution News 2.0 – Ablaufstatus der automatischen Quellenprüfung */
'use strict';

(() => {
    if (window.WRNSourceHealthFreshness) return;

    const TEXT = {
        de: { current:'Prüfstand aktuell', stale:'Prüfstand abgelaufen – Status nicht als aktuell werten', checked:'Automatisch geprüft', valid:'Gültig bis', policy:'Automatische Prüfung alle 4 Stunden · Ablauf nach 12 Stunden' },
        en: { current:'Checks are current', stale:'Checks have expired — do not treat statuses as current', checked:'Automatically checked', valid:'Valid until', policy:'Automatic check every 4 hours · expires after 12 hours' },
        es: { current:'Comprobaciones actuales', stale:'Comprobaciones caducadas: los estados no son actuales', checked:'Comprobado automáticamente', valid:'Válido hasta', policy:'Comprobación cada 4 horas · caduca tras 12 horas' },
        fr: { current:'Contrôles à jour', stale:'Contrôles expirés — les statuts ne sont plus actuels', checked:'Vérifié automatiquement', valid:'Valable jusqu’au', policy:'Contrôle toutes les 4 heures · expiration après 12 heures' },
        it: { current:'Controlli aggiornati', stale:'Controlli scaduti: gli stati non sono più attuali', checked:'Controllato automaticamente', valid:'Valido fino a', policy:'Controllo ogni 4 ore · scadenza dopo 12 ore' },
        pt: { current:'Verificações atuais', stale:'Verificações expiradas — os estados já não são atuais', checked:'Verificado automaticamente', valid:'Válido até', policy:'Verificação a cada 4 horas · expira após 12 horas' },
        ru: { current:'Проверки актуальны', stale:'Срок проверок истёк — статусы не считаются актуальными', checked:'Автоматическая проверка', valid:'Действительно до', policy:'Проверка каждые 4 часа · срок 12 часов' },
        el: { current:'Οι έλεγχοι είναι ενημερωμένοι', stale:'Οι έλεγχοι έληξαν — οι καταστάσεις δεν θεωρούνται τρέχουσες', checked:'Αυτόματος έλεγχος', valid:'Ισχύει έως', policy:'Έλεγχος κάθε 4 ώρες · λήξη μετά από 12 ώρες' },
        tr: { current:'Kontroller güncel', stale:'Kontrollerin süresi doldu — durumlar güncel kabul edilmez', checked:'Otomatik kontrol', valid:'Geçerlilik', policy:'Her 4 saatte otomatik kontrol · 12 saat sonra sona erer' }
    };
    const state = { report: null, loaded: false };
    const language = () => {
        const raw = document.getElementById('ui-language')?.value || document.documentElement.lang || 'en';
        const code = String(raw).toLowerCase().split(/[-_]/)[0];
        return TEXT[code] ? code : 'en';
    };
    const t = () => TEXT[language()] || TEXT.en;

    const load = async () => {
        if (state.loaded) return state.report;
        state.loaded = true;
        try {
            const url = window.WRN_CONFIG?.dataUrls?.sourceHealthReport || './source-health-report.json';
            const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}freshness=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            state.report = await response.json();
        } catch {
            state.report = null;
        }
        render();
        return state.report;
    };

    const render = () => {
        const modal = document.getElementById('wrn-source-verification-modal');
        if (!modal || !state.report) return;
        let node = document.getElementById('wrn-source-health-freshness');
        if (!node) {
            node = document.createElement('aside');
            node.id = 'wrn-source-health-freshness';
            node.className = 'wrn-source-health-freshness';
            modal.querySelector('.wrn-source-verification-head')?.after(node);
        }
        const generated = new Date(state.report.generatedAt || 0);
        const explicitFreshUntil = new Date(state.report.freshUntil || 0);
        const freshUntil = Number.isFinite(explicitFreshUntil.getTime()) && explicitFreshUntil.getTime() > 0
            ? explicitFreshUntil
            : new Date(generated.getTime() + 12 * 3600000);
        const stale = !Number.isFinite(generated.getTime()) || Date.now() > freshUntil.getTime();
        const labels = t();
        node.classList.toggle('stale', stale);
        node.innerHTML = `<strong>${stale ? labels.stale : labels.current}</strong><span>${labels.checked}: ${Number.isFinite(generated.getTime()) ? generated.toLocaleString(language()) : '—'}</span><span>${labels.valid}: ${Number.isFinite(freshUntil.getTime()) ? freshUntil.toLocaleString(language()) : '—'}</span><small>${labels.policy}</small>`;
    };

    const init = () => {
        void load();
        const observer = new MutationObserver(() => render());
        const modal = document.getElementById('wrn-source-verification-modal');
        if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
        document.getElementById('ui-language')?.addEventListener('change', render);
    };

    window.WRNSourceHealthFreshness = Object.freeze({ load, render });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
