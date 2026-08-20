const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = {
  addEventListener() {}
};
global.document = {
  documentElement: { lang: 'de' },
  getElementById() {
    return null;
  }
};

const source = fs.readFileSync(
  path.join(__dirname, '..', 'wrn-i18n.js'),
  'utf8'
);
vm.runInThisContext(source, { filename: 'wrn-i18n.js' });

const expected = {
  de: 'Stimme testen',
  en: 'Test voice',
  es: 'Probar voz',
  fr: 'Tester la voix',
  it: 'Prova voce',
  pt: 'Testar voz',
  ru: 'Проверить голос',
  el: 'Δοκιμή φωνής',
  tr: 'Sesi dene'
};

for (const [language, label] of Object.entries(expected)) {
  assert.strictEqual(
    window.WRNI18n.t('briefing.voicePreview', language),
    label,
    `voice preview label missing for ${language}`
  );
  assert.notStrictEqual(
    window.WRNI18n.t('briefing.voiceQualityNote', language),
    'briefing.voiceQualityNote',
    `voice quality note missing for ${language}`
  );
}

console.log('Briefing voice translations: OK');
