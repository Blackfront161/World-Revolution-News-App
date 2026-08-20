/* World Revolution News 1.7.17 – audio health dialog */
'use strict';

(() => {
    if (window.WRNAudioReliability) return;

    const getLabels = () => {
        const language = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en'
        ).toLowerCase().split(/[-_]/)[0];
        const labels = {
            en: { open:'Check audio', title:'Podcast and radio test', close:'Close', reload:'Reload', empty:'No report yet. Run the audio workflow first.', podcasts:'Original podcasts', radio:'Live radio', playable:'Playable', limited:'Limited', broken:'Broken', unknown:'Not checked' },
            de: { open:'Audio prüfen', title:'Podcast- und Radio-Test', close:'Schließen', reload:'Neu laden', empty:'Noch kein Prüfbericht. Starte zuerst den Audio-Workflow.', podcasts:'Original-Podcasts', radio:'Live-Radio', playable:'Abspielbar', limited:'Eingeschränkt', broken:'Defekt', unknown:'Nicht geprüft' },
            es: { open:'Comprobar audio', title:'Prueba de pódcasts y radio', close:'Cerrar', reload:'Recargar', empty:'Todavía no hay informe.', podcasts:'Pódcasts originales', radio:'Radio en directo', playable:'Reproducible', limited:'Limitado', broken:'Defectuoso', unknown:'No comprobado' },
            fr: { open:'Tester l’audio', title:'Test des podcasts et radios', close:'Fermer', reload:'Recharger', empty:'Aucun rapport pour le moment.', podcasts:'Podcasts originaux', radio:'Radio en direct', playable:'Lisible', limited:'Limité', broken:'Défectueux', unknown:'Non vérifié' },
            it: { open:'Verifica audio', title:'Test podcast e radio', close:'Chiudi', reload:'Ricarica', empty:'Nessun rapporto disponibile.', podcasts:'Podcast originali', radio:'Radio dal vivo', playable:'Riproducibile', limited:'Limitato', broken:'Non funzionante', unknown:'Non verificato' },
            pt: { open:'Verificar áudio', title:'Teste de podcasts e rádio', close:'Fechar', reload:'Recarregar', empty:'Ainda não existe relatório.', podcasts:'Podcasts originais', radio:'Rádio em direto', playable:'Reproduzível', limited:'Limitado', broken:'Com defeito', unknown:'Não verificado' },
            ru: { open:'Проверить аудио', title:'Проверка подкастов и радио', close:'Закрыть', reload:'Обновить', empty:'Отчёт пока отсутствует.', podcasts:'Оригинальные подкасты', radio:'Радио', playable:'Воспроизводится', limited:'Ограничено', broken:'Не работает', unknown:'Не проверено' },
            el: { open:'Έλεγχος ήχου', title:'Έλεγχος podcast και ραδιοφώνου', close:'Κλείσιμο', reload:'Επαναφόρτωση', empty:'Δεν υπάρχει ακόμη αναφορά.', podcasts:'Πρωτότυπα podcast', radio:'Ζωντανό ραδιόφωνο', playable:'Αναπαράγεται', limited:'Περιορισμένο', broken:'Ελαττωματικό', unknown:'Δεν ελέγχθηκε' },
            tr: { open:'Sesi denetle', title:'Podcast ve radyo testi', close:'Kapat', reload:'Yenile', empty:'Henüz denetim raporu yok.', podcasts:'Orijinal podcastler', radio:'Canlı radyo', playable:'Oynatılabilir', limited:'Sınırlı', broken:'Bozuk', unknown:'Kontrol edilmedi' }
        };
        return labels[language] || labels.en;
    };

    let data = null;

    const ensure = () => {
        let overlay = document.getElementById('wrn-audio-health-overlay');
        let dialog = document.getElementById('wrn-audio-health-dialog');

        if (overlay && dialog) return { overlay, dialog };

        overlay = document.createElement('div');
        overlay.id = 'wrn-audio-health-overlay';
        overlay.className = 'wrn-audio-health-overlay';
        overlay.hidden = true;

        dialog = document.createElement('section');
        dialog.id = 'wrn-audio-health-dialog';
        dialog.className = 'wrn-audio-health-dialog';
        dialog.hidden = true;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.innerHTML = `
            <header>
                <h2></h2>
                <button type="button" data-audio-health="close">×</button>
            </header>
            <div id="wrn-audio-health-content"></div>
            <footer>
                <button type="button" data-audio-health="reload"></button>
                <button type="button" data-audio-health="close"></button>
            </footer>
        `;

        document.body.append(overlay, dialog);

        overlay.addEventListener('click', close);
        dialog.addEventListener('click', event => {
            const action = event.target.closest('[data-audio-health]')
                ?.dataset.audioHealth;
            if (action === 'close') close();
            if (action === 'reload') void refresh();
        });

        return { overlay, dialog };
    };

    const cards = section => {
        const summary = section?.summary || {};
        const labels = getLabels();
        return ['playable', 'limited', 'broken', 'unknown']
            .map(key => `
                <div data-state="${key}">
                    <span>${labels[key]}</span>
                    <strong>${Number(summary[key] || 0)}</strong>
                </div>
            `).join('');
    };

    const render = () => {
        const t = getLabels();
        const { dialog } = ensure();
        dialog.querySelector('h2').textContent = t.title;
        dialog.querySelectorAll('[data-audio-health="close"]')
            .forEach((button, index) => {
                if (index > 0) button.textContent = t.close;
            });
        dialog.querySelector('[data-audio-health="reload"]')
            .textContent = t.reload;

        const content = dialog.querySelector('#wrn-audio-health-content');
        if (!data) {
            content.innerHTML = `<p>${t.empty}</p>`;
            return;
        }

        content.innerHTML = `
            <section>
                <h3>${t.podcasts}</h3>
                <div class="wrn-audio-health-grid">${cards(data.podcasts)}</div>
                <p>${Number(data.podcasts?.episodeCount || 0)} Einträge</p>
            </section>
            <section>
                <h3>${t.radio}</h3>
                <div class="wrn-audio-health-grid">${cards(data.radio)}</div>
                <p>${Number(data.radio?.stationCount || 0)} Einträge</p>
            </section>
        `;
    };

    async function refresh() {
        try {
            const url = window.WRN_CONFIG?.dataUrls?.audioHealth
                || './audio-health.json';
            const response = await fetch(
                `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`,
                { cache: 'no-store' }
            );
            data = response.ok ? await response.json() : null;
        } catch {
            data = null;
        }
        render();
    }

    function open() {
        const { overlay, dialog } = ensure();
        overlay.hidden = false;
        dialog.hidden = false;
        render();
        void refresh();
    }

    function close() {
        const overlay = document.getElementById('wrn-audio-health-overlay');
        const dialog = document.getElementById('wrn-audio-health-dialog');
        if (overlay) overlay.hidden = true;
        if (dialog) dialog.hidden = true;
    }

    const install = () => {
        if (document.getElementById('wrn-audio-health-open')) return true;
        const target = document.querySelector('.wrn-more-admin-tools-184')
            || document.querySelector('.wrn-more-grid');
        if (!target) return false;

        const button = document.createElement('button');
        button.id = 'wrn-audio-health-open';
        button.type = 'button';
        button.className = 'wrn-audio-health-open';
        button.textContent = getLabels().open;
        button.addEventListener('click', open);
        target.appendChild(button);
        return true;
    };

    const init = () => {
        ensure();
        if (install()) return;

        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            if (install() || attempts >= 30) window.clearInterval(timer);
        }, 250);
    };

    window.WRNAudioReliability = Object.freeze({ open, close, refresh });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
