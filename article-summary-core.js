/* World Revolution News 1.7.5 – lokale Artikel-Zusammenfassung */
'use strict';

(function attachSummaryCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNSummaryCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function createSummaryCore() {
  const LENGTH_SENTENCES = Object.freeze({ short: 2, standard: 4, detailed: 7 });

  const STOPWORDS = Object.freeze({
    en: new Set('a an and are as at be been by for from has have in into is it its of on or that the their this to was were will with without over under after before about against between during through'.split(/\s+/)),
    de: new Set('aber als am an auch auf aus bei bin bis bist da dadurch das dass dein deine dem den der des die dies diese dieser durch ein eine einer einem einen er es für hat haben ich im in ist ja kann kein keine mit nach nicht noch nun oder ohne sein sind so über um und uns von vor war waren was we weil werden wie wir wird wo zu zum zur'.split(/\s+/)),
    es: new Set('a al algo ante bajo como con contra de del desde donde el ella en entre era es esta este fue ha hay la las lo los más no o para pero por que se sin sobre su sus un una y ya'.split(/\s+/)),
    fr: new Set('à au aux avec ce ces cette comme dans de des du elle en est et il la le les leur lui mais ne nous ou par pas pour que qui sans se ses son sous sur un une vous'.split(/\s+/)),
    it: new Set('a al alla anche che chi con contro da dal dalla de dei del della di e è gli ha i il in la le lo ma non o per più se senza si su sul tra un una'.split(/\s+/)),
    pt: new Set('a ao aos as com como contra da das de do dos e ela ele em entre era esta este foi há mais mas na nas no nos não o os ou para pela pelo por que se sem sobre sua um uma'.split(/\s+/)),
    ru: new Set('а без был была были было в во для до его ее если есть и из или как к ко мы на над не но о об от по при с со это у уже что чтобы'.split(/\s+/)),
    el: new Set('η οι το τα του της των και ή από για με σε στο στη στην στον χωρίς δεν είναι ήταν ένα μια που ως κατά μετά πριν'.split(/\s+/)),
    tr: new Set('ama ancak bir bu da daha de değil için ile ise gibi kadar karşı mı ne o olan olarak ve veya ya çok şu'.split(/\s+/))
  });

  function cleanText(value) {
    return String(value || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitSentences(value) {
    const text = cleanText(value);
    if (!text) return [];
    const matches = text.match(/[^.!?…]+(?:[.!?…]+|$)/gu) || [text];
    return matches
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length >= 24)
      .slice(0, 180);
  }

  function tokenize(value, language = 'en') {
    const code = String(language || 'en').toLowerCase().split(/[-_]/)[0];
    const stops = STOPWORDS[code] || STOPWORDS.en;
    return cleanText(value)
      .toLocaleLowerCase(code)
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .map(token => token.replace(/^-+|-+$/g, ''))
      .filter(token => token.length > 2 && !stops.has(token) && !/^\d{1,2}$/.test(token));
  }

  function jaccard(first, second) {
    const a = new Set(first);
    const b = new Set(second);
    if (!a.size || !b.size) return 0;
    let overlap = 0;
    for (const token of a) if (b.has(token)) overlap++;
    return overlap / (a.size + b.size - overlap);
  }

  function hashText(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function summariseText(value, options = {}) {
    const text = cleanText(value);
    const title = cleanText(options.title || '');
    const language = String(options.language || 'en').toLowerCase().split(/[-_]/)[0];
    const length = Object.prototype.hasOwnProperty.call(LENGTH_SENTENCES, options.length)
      ? options.length
      : 'standard';

    const sentences = splitSentences(text);
    const sourceWords = tokenize(text, language).length;

    if (!sentences.length) {
      return {
        length, language, lead: '', bullets: [], plainText: '',
        keyTerms: [], sourceWords, summaryWords: 0, compressionPercent: 0,
        sentenceCount: 0, fingerprint: hashText(`${title}|${text}`)
      };
    }

    if (sentences.length <= LENGTH_SENTENCES[length]) {
      const lead = sentences[0] || '';
      const bullets = sentences.slice(1);
      const plainText = [lead, ...bullets].filter(Boolean).join(' ');
      const summaryWords = tokenize(plainText, language).length;
      return {
        length, language, lead, bullets, plainText,
        keyTerms: tokenize(`${title} ${text}`, language).slice(0, 6),
        sourceWords, summaryWords,
        compressionPercent: sourceWords ? Math.round(summaryWords / sourceWords * 100) : 100,
        sentenceCount: sentences.length,
        fingerprint: hashText(`${title}|${text}`)
      };
    }

    const tokenLists = sentences.map(sentence => tokenize(sentence, language));
    const frequencies = new Map();
    tokenLists.flat().forEach(token => frequencies.set(token, (frequencies.get(token) || 0) + 1));
    const maxFrequency = Math.max(1, ...frequencies.values());
    const titleTokens = new Set(tokenize(title, language));

    const scored = sentences.map((sentence, index) => {
      const tokens = tokenLists[index];
      if (!tokens.length) return { sentence, tokens, index, score: -100 };

      let score = tokens.reduce((sum, token) => {
        const frequency = (frequencies.get(token) || 0) / maxFrequency;
        const titleBonus = titleTokens.has(token) ? 0.72 : 0;
        return sum + frequency + titleBonus;
      }, 0) / Math.sqrt(tokens.length);

      if (index === 0) score += 1.35;
      else if (index === 1) score += 0.65;
      else if (index < Math.max(4, Math.ceil(sentences.length * 0.15))) score += 0.25;

      if (/\d|%|€|\$|£/.test(sentence)) score += 0.18;
      if (sentence.length >= 55 && sentence.length <= 260) score += 0.25;
      if (sentence.length > 380) score -= 0.35;

      return { sentence, tokens, index, score };
    }).sort((a, b) => b.score - a.score);

    const wanted = Math.min(LENGTH_SENTENCES[length], sentences.length);
    const selected = [];

    for (const candidate of scored) {
      if (selected.some(existing => jaccard(existing.tokens, candidate.tokens) > 0.68)) continue;
      selected.push(candidate);
      if (selected.length >= wanted) break;
    }

    if (selected.length < wanted) {
      for (const candidate of scored) {
        if (selected.includes(candidate)) continue;
        selected.push(candidate);
        if (selected.length >= wanted) break;
      }
    }

    selected.sort((a, b) => a.index - b.index);
    const lead = selected[0]?.sentence || sentences[0];
    const bullets = selected.slice(1).map(item => item.sentence);
    const plainText = [lead, ...bullets].filter(Boolean).join(' ');
    const summaryWords = tokenize(plainText, language).length;

    const keyTerms = [...frequencies.entries()]
      .filter(([token]) => !/^\d+$/.test(token))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([token]) => token);

    return {
      length, language, lead, bullets, plainText, keyTerms,
      sourceWords, summaryWords,
      compressionPercent: sourceWords ? Math.max(1, Math.round(summaryWords / sourceWords * 100)) : 0,
      sentenceCount: selected.length,
      fingerprint: hashText(`${title}|${text}`)
    };
  }

  return Object.freeze({
    cleanText,
    splitSentences,
    tokenize,
    jaccard,
    hashText,
    summarizeText: summariseText,
    summariseText
  });
});
