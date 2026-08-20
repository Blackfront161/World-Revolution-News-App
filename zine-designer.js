/* World Revolution News 1.7.19 – Flyer-Designer für Zine */
'use strict';

(() => {
    if (window.WRNZineDesigner1719) return;

    const STORAGE_KEY = 'wrn-zine-design-1719';

    const defaults = {
        template: 'cyber-issue',
        format: 'a4',
        style: 'cyber',
        columns: '2',
        images: 'normal',
        density: 'comfortable',
        font: 'sans',
        accent: 'cyan',
        headline: '',
        intro: '',
        footer: ''
    };

    const templates = Object.freeze({
        'cyber-issue': Object.freeze({ format: 'a4', style: 'cyber', columns: '2', images: 'normal', density: 'comfortable', font: 'sans', accent: 'cyan' }),
        'classic-newspaper': Object.freeze({ format: 'a4', style: 'newspaper', columns: '2', images: 'gray', density: 'compact', font: 'serif', accent: 'black' }),
        'accessible-reading': Object.freeze({ format: 'a4', style: 'minimal', columns: '1', images: 'normal', density: 'comfortable', font: 'sans', accent: 'black' }),
        'a5-booklet': Object.freeze({ format: 'a5', style: 'minimal', columns: '1', images: 'gray', density: 'compact', font: 'sans', accent: 'black' }),
        'action-poster': Object.freeze({ format: 'a4', style: 'contrast', columns: '1', images: 'normal', density: 'comfortable', font: 'sans', accent: 'red' }),
        'ink-saving': Object.freeze({ format: 'a4', style: 'minimal', columns: '2', images: 'none', density: 'compact', font: 'serif', accent: 'black' })
    });

    let settings = { ...defaults };

    try {
        settings = {
            ...defaults,
            ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        };
    } catch {
        settings = { ...defaults };
    }

    if (settings.headline === 'WORLD REVOLUTION NEWS') settings.headline = '';
    if (settings.footer === 'worldrevnews') settings.footer = '';

    const currentLanguage = () => String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en'
        ).toLowerCase().split(/[-_]/)[0];

    const text = () => {
        const language = currentLanguage();
        const translations = {
            de: {
                title: '3. Ausgabe gestalten und exportieren',
                workflow: '1. Artikel auswählen  ·  2. Texte bearbeiten  ·  3. Gestaltung wählen und als PDF speichern',
                headline: 'Titel der Ausgabe',
                intro: 'Kurze Einleitung (optional)',
                footer: 'Fußzeile / Kontakt (optional)',
                format: 'Format',
                style: 'Stil',
                columns: 'Spalten',
                images: 'Bilder',
                density: 'Abstand',
                font: 'Schrift',
                accent: 'Akzentfarbe',
                print: 'Drucken / als PDF',
                reset: 'Zurücksetzen',
                a4: 'A4 Hochformat',
                a5: 'A5 Hochformat',
                square: 'Quadratisch',
                story: 'Story 9:16',
                cyber: 'Cyberpunk',
                newspaper: 'Zeitung',
                minimal: 'Minimal',
                contrast: 'Hoher Kontrast',
                normal: 'Normal',
                gray: 'Graustufen',
                none: 'Ohne Bilder',
                compact: 'Kompakt',
                comfortable: 'Luftig'
            },
            en: {
                title: '3. Design and export',
                workflow: '1. Select articles  ·  2. Edit the text  ·  3. Choose a design and save as PDF',
                headline: 'Issue title',
                intro: 'Short introduction (optional)',
                footer: 'Footer / contact (optional)',
                format: 'Format',
                style: 'Style',
                columns: 'Columns',
                images: 'Images',
                density: 'Spacing',
                font: 'Typography',
                accent: 'Accent colour',
                print: 'Print / save PDF',
                reset: 'Reset',
                a4: 'A4 portrait',
                a5: 'A5 portrait',
                square: 'Square',
                story: 'Story 9:16',
                cyber: 'Cyberpunk',
                newspaper: 'Newspaper',
                minimal: 'Minimal',
                contrast: 'High contrast',
                normal: 'Normal',
                gray: 'Grayscale',
                none: 'No images',
                compact: 'Compact',
                comfortable: 'Comfortable'
            },
            es: {
                title:'3. Diseñar y exportar', workflow:'1. Selecciona artículos · 2. Edita el texto · 3. Elige el diseño y guarda en PDF',
                headline:'Título de la edición', intro:'Introducción breve (opcional)', footer:'Pie / contacto (opcional)',
                format:'Formato', style:'Estilo', columns:'Columnas', images:'Imágenes', density:'Espaciado',
                print:'Imprimir / guardar PDF', reset:'Restablecer', a4:'A4 vertical', a5:'A5 vertical',
                square:'Cuadrado', story:'Historia 9:16', cyber:'Cyberpunk', newspaper:'Periódico',
                minimal:'Minimalista', contrast:'Alto contraste', normal:'Normal', gray:'Escala de grises',
                none:'Sin imágenes', compact:'Compacto', comfortable:'Amplio'
            },
            fr: {
                title:'3. Mise en page et export', workflow:'1. Sélectionnez les articles · 2. Modifiez le texte · 3. Choisissez la mise en page et enregistrez en PDF',
                headline:'Titre du numéro', intro:'Courte introduction (facultative)', footer:'Pied de page / contact (facultatif)',
                format:'Format', style:'Style', columns:'Colonnes', images:'Images', density:'Espacement',
                print:'Imprimer / enregistrer en PDF', reset:'Réinitialiser', a4:'A4 portrait', a5:'A5 portrait',
                square:'Carré', story:'Story 9:16', cyber:'Cyberpunk', newspaper:'Journal',
                minimal:'Minimal', contrast:'Contraste élevé', normal:'Normal', gray:'Niveaux de gris',
                none:'Sans images', compact:'Compact', comfortable:'Aéré'
            },
            it: {
                title:'3. Impagina ed esporta', workflow:'1. Seleziona gli articoli · 2. Modifica il testo · 3. Scegli il design e salva in PDF',
                headline:'Titolo del numero', intro:'Breve introduzione (facoltativa)', footer:'Piè di pagina / contatto (facoltativo)',
                format:'Formato', style:'Stile', columns:'Colonne', images:'Immagini', density:'Spaziatura',
                print:'Stampa / salva PDF', reset:'Reimposta', a4:'A4 verticale', a5:'A5 verticale',
                square:'Quadrato', story:'Storia 9:16', cyber:'Cyberpunk', newspaper:'Giornale',
                minimal:'Minimale', contrast:'Contrasto elevato', normal:'Normale', gray:'Scala di grigi',
                none:'Senza immagini', compact:'Compatto', comfortable:'Ampio'
            },
            pt: {
                title:'3. Criar e exportar', workflow:'1. Selecionar artigos · 2. Editar o texto · 3. Escolher o design e guardar em PDF',
                headline:'Título da edição', intro:'Introdução breve (opcional)', footer:'Rodapé / contacto (opcional)',
                format:'Formato', style:'Estilo', columns:'Colunas', images:'Imagens', density:'Espaçamento',
                print:'Imprimir / guardar PDF', reset:'Repor', a4:'A4 vertical', a5:'A5 vertical',
                square:'Quadrado', story:'Story 9:16', cyber:'Cyberpunk', newspaper:'Jornal',
                minimal:'Minimalista', contrast:'Alto contraste', normal:'Normal', gray:'Tons de cinzento',
                none:'Sem imagens', compact:'Compacto', comfortable:'Espaçoso'
            },
            ru: {
                title:'3. Оформление и экспорт', workflow:'1. Выберите статьи · 2. Измените текст · 3. Выберите оформление и сохраните PDF',
                headline:'Название выпуска', intro:'Краткое введение (необязательно)', footer:'Нижний колонтитул / контакт (необязательно)',
                format:'Формат', style:'Стиль', columns:'Колонки', images:'Изображения', density:'Интервалы',
                print:'Печать / сохранить PDF', reset:'Сбросить', a4:'A4, книжная', a5:'A5, книжная',
                square:'Квадрат', story:'История 9:16', cyber:'Киберпанк', newspaper:'Газета',
                minimal:'Минимализм', contrast:'Высокая контрастность', normal:'Обычные', gray:'Оттенки серого',
                none:'Без изображений', compact:'Компактно', comfortable:'Свободно'
            },
            el: {
                title:'3. Σχεδίαση και εξαγωγή', workflow:'1. Επιλέξτε άρθρα · 2. Επεξεργαστείτε το κείμενο · 3. Επιλέξτε σχεδίαση και αποθηκεύστε PDF',
                headline:'Τίτλος έκδοσης', intro:'Σύντομη εισαγωγή (προαιρετικά)', footer:'Υποσέλιδο / επικοινωνία (προαιρετικά)',
                format:'Μορφή', style:'Στυλ', columns:'Στήλες', images:'Εικόνες', density:'Απόσταση',
                print:'Εκτύπωση / αποθήκευση PDF', reset:'Επαναφορά', a4:'A4 κατακόρυφο', a5:'A5 κατακόρυφο',
                square:'Τετράγωνο', story:'Story 9:16', cyber:'Cyberpunk', newspaper:'Εφημερίδα',
                minimal:'Λιτό', contrast:'Υψηλή αντίθεση', normal:'Κανονικές', gray:'Κλίμακα του γκρι',
                none:'Χωρίς εικόνες', compact:'Συμπαγές', comfortable:'Άνετο'
            },
            tr: {
                title:'3. Tasarla ve dışa aktar', workflow:'1. Makaleleri seç · 2. Metni düzenle · 3. Tasarımı seç ve PDF olarak kaydet',
                headline:'Sayı başlığı', intro:'Kısa giriş (isteğe bağlı)', footer:'Alt bilgi / iletişim (isteğe bağlı)',
                format:'Biçim', style:'Stil', columns:'Sütunlar', images:'Görseller', density:'Boşluk',
                print:'Yazdır / PDF kaydet', reset:'Sıfırla', a4:'A4 dikey', a5:'A5 dikey',
                square:'Kare', story:'Hikâye 9:16', cyber:'Siberpunk', newspaper:'Gazete',
                minimal:'Minimal', contrast:'Yüksek kontrast', normal:'Normal', gray:'Gri tonlama',
                none:'Görselsiz', compact:'Kompakt', comfortable:'Ferah'
            }
        };
        return translations[language] || translations.en;
    };

    const findTarget = () => document.querySelector('[data-zine-designer-enabled="true"]');

    const apply = target => {
        if (!target) return;

        target.classList.add('wrn-zine-design-target-1719');
        target.dataset.zineFormat = settings.format;
        target.dataset.zineStyle = settings.style;
        target.dataset.zineColumns = settings.columns;
        target.dataset.zineImages = settings.images;
        target.dataset.zineDensity = settings.density;
        target.dataset.zineFont = settings.font;
        target.dataset.zineAccent = settings.accent;

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );
        } catch {
            // Local storage is optional.
        }
    };

    const control = (label, name, options) => `
        <label>
            <span>${label}</span>
            <select data-zine-setting="${name}">
                ${options.map(([value, text]) => `
                    <option value="${value}">
                        ${text}
                    </option>
                `).join('')}
            </select>
        </label>
    `;

    const textControl = (label, name) => `
        <label class="wrn-zine-designer-text-1719">
            <span>${label}</span>
            <input type="text" data-zine-text="${name}">
        </label>
    `;

    const install = () => {
        const target = findTarget();

        if (!target) return false;

        const existing = document.getElementById('wrn-zine-designer-1719');
        if (existing && existing.dataset.language === currentLanguage()) {
            apply(target);
            return true;
        }
        existing?.remove();

        const t = text();
        const panel = document.createElement('section');
        panel.id = 'wrn-zine-designer-1719';
        panel.className = 'wrn-zine-designer-1719';
        panel.dataset.language = currentLanguage();
        panel.innerHTML = `
            <header>
                <h2>${t.title}</h2>
                <p>${t.workflow}</p>
            </header>

            <div class="wrn-zine-designer-copy-1719">
                ${textControl(t.headline, 'headline')}
                ${textControl(t.intro, 'intro')}
                ${textControl(t.footer, 'footer')}
            </div>
            <div class="wrn-zine-designer-grid-1719">
                ${control(t.format, 'format', [
                    ['a4', t.a4],
                    ['a5', t.a5],
                    ['square', t.square],
                    ['story', t.story]
                ])}

                ${control(t.style, 'style', [
                    ['cyber', t.cyber],
                    ['newspaper', t.newspaper],
                    ['minimal', t.minimal],
                    ['contrast', t.contrast]
                ])}

                ${control(t.columns, 'columns', [
                    ['1', '1'],
                    ['2', '2'],
                    ['3', '3']
                ])}

                ${control(t.images, 'images', [
                    ['normal', t.normal],
                    ['gray', t.gray],
                    ['none', t.none]
                ])}

                ${control(t.density, 'density', [
                    ['comfortable', t.comfortable],
                    ['compact', t.compact]
                ])}

                ${control(t.font || 'Typography', 'font', [
                    ['sans', 'Sans'],
                    ['serif', 'Serif'],
                    ['mono', 'Mono']
                ])}

                ${control(t.accent || 'Accent', 'accent', [
                    ['cyan', 'Cyan'],
                    ['red', 'Rot / Red'],
                    ['purple', 'Violett / Purple'],
                    ['black', 'Schwarz / Black']
                ])}
            </div>

            <div class="wrn-zine-designer-actions-1719">
                <button type="button" data-zine-action="print">
                    ${t.print}
                </button>
                <button type="button" data-zine-action="reset">
                    ${t.reset}
                </button>
            </div>
        `;

        target.parentElement?.insertBefore(panel, target);

        panel.querySelectorAll('[data-zine-setting]')
            .forEach(select => {
                const name = select.dataset.zineSetting;
                select.value = settings[name];

                select.addEventListener('change', () => {
                    settings[name] = select.value;
                    settings.template = 'custom';
                    document.querySelectorAll('[data-action="zine-template"]').forEach(button => {
                        button.closest('.zine-template-card')?.classList.remove('is-selected');
                        button.classList.remove('secondary-button');
                        button.classList.add('primary-button');
                        button.setAttribute('aria-pressed', 'false');
                        button.textContent = button.dataset.selectLabel || button.textContent.replace(/^✓\s*/, '');
                    });
                    apply(target);
                });
            });

        panel.querySelectorAll('[data-zine-text]').forEach(input => {
            const name = input.dataset.zineText;
            input.value = settings[name] || '';
            input.addEventListener('input', () => {
                settings[name] = input.value.slice(0, 180);
                apply(target);
            });
        });

        panel.addEventListener('click', async event => {
            const action = event.target.closest(
                '[data-zine-action]'
            )?.dataset.zineAction;

            if (action === 'print') {
                target.classList.add('wrn-zine-printing-1719');
                const pageStyle = document.createElement('style');
                pageStyle.dataset.zinePrintPage = 'true';
                pageStyle.textContent = `@page { size: ${settings.format === 'a5' ? 'A5' : 'A4'} portrait; margin: 0; }`;
                document.head.appendChild(pageStyle);
                const cleanup = () => {
                    target.classList.remove('wrn-zine-printing-1719');
                    pageStyle.remove();
                };
                window.addEventListener('afterprint', cleanup, { once: true });
                try {
                    await (window.WRNDeviceBridge?.print?.(t.print) || Promise.resolve(window.print()));
                } catch (error) {
                    console.warn('Zine print unavailable', error?.name || 'error');
                    cleanup();
                }
                window.setTimeout(cleanup, 60_000);
            }

            if (action === 'reset') {
                settings = { ...defaults };

                panel.querySelectorAll('[data-zine-setting]')
                    .forEach(select => {
                        const name = select.dataset.zineSetting;
                        select.value = settings[name];
                    });
                panel.querySelectorAll('[data-zine-text]').forEach(input => {
                    input.value = settings[input.dataset.zineText] || '';
                });

                apply(target);
            }
        });

        apply(target);
        return true;
    };

    const applyTemplate = id => {
        if (!templates[id]) return false;
        settings = { ...settings, ...templates[id], template: id };
        apply(findTarget());
        return true;
    };

    const queueInstall = () => {
        window.setTimeout(install, 80);
        window.setTimeout(install, 500);
        window.setTimeout(install, 1400);
    };

    document.addEventListener('click', event => {
        if (
            event.target.closest?.(
                '.wrn-top-tab[data-key="zine"]'
            )
        ) {
            queueInstall();
        }
    });

    new MutationObserver(records => {
        if (records.some(record => record.addedNodes.length)) {
            install();
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window.WRNZineDesigner1719 = Object.freeze({
        install,
        applyTemplate,
        templates: () => Object.keys(templates),
        settings: () => ({ ...settings })
    });
})();
