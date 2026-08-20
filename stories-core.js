/* World Revolution News 1.8.0 – pure story and briefing analysis */
'use strict';

((root, factory) => {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.WRNStoriesCore = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const STOPWORDS = new Set([
    'the','and','for','with','from','that','this','into','over','after','against','about','their','they','are','was','were','will','has','have',
    'der','die','das','den','dem','des','und','mit','für','von','aus','auf','gegen','über','eine','einer','einem','einen','ist','sind','wird','werden',
    'les','des','une','pour','avec','dans','sur','contre','est','sont','aux','par',
    'del','los','las','una','para','con','por','contra','sobre','desde',
    'sono','della','delle','degli','una','con','per','contro',
    'que','dos','das','uma','com','sem','sobre','contra',
    'это','для','как','что','или','при','был','будет',
    'και','των','για','από','στο','στη','είναι',
    'ile','bir','bu','için','karşı','olan',
    // Generic newsroom words must not connect otherwise unrelated reports.
    'world','global','international','news','report','reports','update','updates','bay','area',
    'support','solidarity','movement','people','today','week','month','year',
    'summer','winter','spring','autumn','break','holiday','statement','issue',
    'welt','bericht','berichte','meldung','aktuell','heute','woche','monat',
    'unterstützung','unterstutzung','solidarität','solidaritat','sommer','pause','erklärung','erklarung',
    'fur','uber','aufruf','aufrufe','aktion','aktionen','januar','februar','marz','april','mai','juni','juli','august','september','oktober','november','dezember',
    'monde','rapport','actualité','soutien','solidarité','été',
    'mundo','noticias','informe','apoyo','solidaridad','verano',
    'mondo','notizie','rapporto','sostegno','solidarietà',
    'haber','dünya','destek','dayanışma','açıklama'
  ]);

  // Einzelne sehr große Regionen oder Länder sind kein ausreichender Grund,
  // zwei inhaltlich verschiedene Meldungen als dieselbe Entwicklung zu führen.
  const WEAK_ENTITIES = new Set([
    'world','global','international','europe','europa','africa','afrika','asia','asien',
    'argentina','bay area','germany','deutschland','france','frankreich','italy','italien',
    'spain','spanien','turkey','turkiye','türkiye','philippines','ukraine','russia',
    'january','february','march','april','may','june','july','august','september',
    'october','november','december','januar','februar','marz','märz','mai','juni',
    'juli','oktober','dezember'
  ]);

  function cleanText(value) {
    return String(value ?? '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;|&#34;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeToken(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLocaleLowerCase();
  }

  function tokens(value, limit = 16) {
    return normalizeToken(cleanText(value))
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .map(token => token.replace(/^-+|-+$/g, ''))
      .filter(token =>
        token.length > 2
        && !STOPWORDS.has(token)
        && !/^\d+$/.test(token)
      )
      .slice(0, limit);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function jaccard(first, second) {
    const a = new Set(first);
    const b = new Set(second);

    if (!a.size || !b.size) return 0;

    let intersection = 0;

    for (const token of a) {
      if (b.has(token)) intersection += 1;
    }

    return intersection / (a.size + b.size - intersection);
  }

  function sharedCount(first, second) {
    const other = new Set(second);
    return unique(first).filter(token => other.has(token)).length;
  }

  function dateMs(item) {
    const raw = item?.eventStart
      || item?.pubDate
      || item?.published
      || item?.date
      || item?.createdAt;

    const value = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(value) ? value : 0;
  }

  function sourceName(item) {
    return cleanText(
      item?.quelleName
      || item?.sourceName
      || item?.source
      || item?.author
      || ''
    );
  }

  function itemKey(item) {
    return cleanText(
      item?.link
      || item?.id
      || `${sourceName(item)}::${item?.title || ''}::${dateMs(item)}`
    );
  }

  function isEvent(item) {
    return Boolean(
      item?.type === 'event'
      || item?.kategorie === 'Radar'
      || item?.eventStart
    );
  }

  function itemTokens(item) {
    return tokens(
      `${item?.title || ''} ${item?.summary || ''}`,
      24
    );
  }

  function sourceIdentity(item) {
    const link = cleanText(item?.link || item?.sourceHomepage || '');
    if (link) {
      try {
        return new URL(link).hostname
          .toLocaleLowerCase()
          .replace(/^www\./, '');
      } catch (error) {}
    }
    return normalizeToken(sourceName(item))
      .replace(/\s*\([^)]*\)\s*$/u, '')
      .trim();
  }

  function normalizedLanguage(value) {
    const language = cleanText(value).toLocaleLowerCase().split(/[-_]/)[0];
    return ['und', 'zxx', 'unknown'].includes(language) ? '' : language;
  }

  function sourceMix(story, metadataResolver) {
    const resolveMetadata = typeof metadataResolver === 'function'
      ? metadataResolver
      : item => item || {};
    const sources = new Map();

    for (const item of story?.items || []) {
      const identity = sourceIdentity(item) || normalizeToken(sourceName(item));
      if (!identity) continue;
      if (!sources.has(identity)) {
        sources.set(identity, {
          identity,
          name: sourceName(item) || 'Source',
          origins: new Set(),
          languages: new Set(),
          geographySource: 'unknown'
        });
      }
      const row = sources.get(identity);
      const metadata = resolveMetadata(item) || {};
      const origin = cleanText(
        metadata.originCountry
        || item?.originCountry
        || metadata.originRegion
        || item?.originRegion
      );
      if (origin) row.origins.add(origin);
      const geographySource = cleanText(metadata.geographySource || item?.geographySource || 'unknown');
      const provenanceRank = {
        unknown: 0,
        'inferred:registry-section': 1,
        'inferred:country-domain': 2,
        'inferred:name': 3,
        explicit: 4
      };
      if ((provenanceRank[geographySource] || 0) > (provenanceRank[row.geographySource] || 0)) {
        row.geographySource = geographySource;
      }
      [
        ...(Array.isArray(metadata.languages) ? metadata.languages : []),
        metadata.language,
        item?.originalLanguage,
        item?.language,
        item?.lang
      ].map(normalizedLanguage).filter(Boolean).forEach(value => row.languages.add(value));
    }

    const sourceRows = [...sources.values()].map(row => ({
      identity: row.identity,
      name: row.name,
      origins: [...row.origins],
      languages: [...row.languages],
      geographySource: row.geographySource
    }));
    const origins = unique(sourceRows.flatMap(row => row.origins));
    const languages = unique(sourceRows.flatMap(row => row.languages));
    const sourceCount = sourceRows.length;
    const knownOriginSources = sourceRows.filter(row => row.origins.length).length;
    const explicitOriginSources = sourceRows.filter(row => row.geographySource === 'explicit').length;
    const inferredOriginSources = sourceRows.filter(row => row.geographySource.startsWith('inferred:')).length;

    let level = 'limited';
    if (sourceCount >= 3 && origins.length >= 2) level = 'broad';
    else if (sourceCount >= 3 || origins.length >= 2 || languages.length >= 2) level = 'varied';

    return {
      level,
      sourceCount,
      knownOriginSources,
      explicitOriginSources,
      inferredOriginSources,
      unknownOriginSources: Math.max(0, sourceCount - knownOriginSources),
      origins,
      languages,
      sources: sourceRows
    };
  }

  function itemType(item) {
    return isEvent(item) ? 'event' : 'news';
  }

  function sourceTags(item) {
    const values = Array.isArray(item?.sourceTags) ? item.sourceTags : [];
    return values
      .map(value => cleanText(value?.term || value))
      .filter(Boolean);
  }

  function namedEntities(item) {
    const title = cleanText(item?.title || '');
    const quoted = [...title.matchAll(/[“"'«](.{3,80}?)[”"'»]/gu)]
      .map(match => match[1]);
    const capitalized = title.match(
      /(?:\p{Lu}[\p{L}\p{M}.'’-]{2,})(?:\s+(?:\p{Lu}[\p{L}\p{M}.'’-]{2,}|of|de|del|la|der|die|von|and|und)){0,4}/gu
    ) || [];
    const structured = [
      item?.eventCity,
      item?.eventVenue,
      item?.originRegion,
      item?.originCountry,
      ...(Array.isArray(item?.eventGroups) ? item.eventGroups : []),
      ...sourceTags(item)
    ];

    return unique([...quoted, ...capitalized, ...structured])
      .map(value => normalizeToken(value).replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim())
      .filter(value => {
        if (value.length < 4 || WEAK_ENTITIES.has(value)) return false;
        const parts = value.split(/\s+/).filter(Boolean);
        return parts.some(part => part.length > 3 && !STOPWORDS.has(part));
      });
  }

  function titlePhrases(item) {
    const parts = tokens(item?.title || '', 24);
    const phrases = [];
    for (let index = 0; index < parts.length - 1; index += 1) {
      phrases.push(`${parts[index]} ${parts[index + 1]}`);
      if (index < parts.length - 2) {
        phrases.push(`${parts[index]} ${parts[index + 1]} ${parts[index + 2]}`);
      }
    }
    return unique(phrases);
  }

  function rowFeatures(item) {
    return {
      item,
      date: dateMs(item),
      source: sourceName(item),
      sourceIdentity: sourceIdentity(item),
      type: itemType(item),
      tokens: itemTokens(item),
      entities: namedEntities(item),
      phrases: titlePhrases(item),
      region: normalizeToken(cleanText(item?.primaryRegion || '')),
      topics: unique([
        item?.primaryTopic,
        ...(Array.isArray(item?.secondaryTopics) ? item.secondaryTopics : [])
      ].map(value => normalizeToken(cleanText(value))).filter(Boolean))
    };
  }

  function similarityEvidence(first, second) {
    if (!first || !second || first.type !== second.type) {
      return { score: 0, reasons: [], sharedTokens: [], sharedEntities: [], sharedPhrases: [], sharedRegions: [], sharedTopics: [] };
    }

    const sharedTokens = unique(first.tokens).filter(token => second.tokens.includes(token));
    const sharedEntities = unique(first.entities).filter(entity => second.entities.includes(entity));
    const sharedPhrases = unique(first.phrases).filter(phrase => second.phrases.includes(phrase));
    const sharedRegions = first.region && first.region === second.region ? [first.region] : [];
    const sharedTopics = unique(first.topics).filter(topic => second.topics.includes(topic));
    const titleA = normalizeToken(cleanText(first.item?.title || ''));
    const titleB = normalizeToken(cleanText(second.item?.title || ''));
    const exactTitle = Boolean(titleA && titleA === titleB);
    const tokenScore = jaccard(first.tokens, second.tokens);
    const score = Math.min(1,
      (exactTitle ? 0.9 : 0)
      + tokenScore * 0.42
      + Math.min(sharedTokens.length, 5) * 0.065
      + Math.min(sharedEntities.length, 2) * 0.24
      + Math.min(sharedPhrases.length, 2) * 0.18
      + Math.min(sharedRegions.length, 1) * 0.04
      + Math.min(sharedTopics.length, 2) * 0.04
    );
    const reasons = unique([
      ...sharedEntities.slice(0, 2),
      ...sharedPhrases.slice(0, 2),
      ...sharedTokens.slice(0, 3),
      ...sharedRegions.map(value => `region:${value}`),
      ...sharedTopics.slice(0, 2).map(value => `topic:${value}`)
    ]).slice(0, 5);

    return { score, reasons, sharedTokens, sharedEntities, sharedPhrases, sharedRegions, sharedTopics, exactTitle };
  }

  function clusterLabel(items, fallback = 'Story') {
    const counts = new Map();

    for (const item of items) {
      for (const token of unique(itemTokens(item))) {
        counts.set(token, (counts.get(token) || 0) + 1);
      }
    }

    const keywords = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
      .filter(([, count]) => count >= Math.min(2, items.length))
      .slice(0, 4)
      .map(([token]) => token);

    if (keywords.length >= 2) {
      return keywords
        .map(token => token.charAt(0).toLocaleUpperCase() + token.slice(1))
        .join(' · ');
    }

    return cleanText(items[0]?.title || fallback);
  }

  function clusterStories(items, options = {}) {
    const now = Number(options.now || Date.now());
    const days = Math.max(1, Number(options.days || 30));
    const minSources = Math.max(1, Number(options.minSources || 2));
    const minItems = Math.max(2, Number(options.minItems || 2));
    // A caller may raise the threshold, but not weaken the editorial floor.
    const threshold = Math.max(0.52, Number(options.threshold || 0.58));
    const cutoff = now - days * 86400000;

    const rows = (Array.isArray(items) ? items : [])
      .filter(item => item && cleanText(item.title))
      .map(rowFeatures)
      .filter(row => row.date >= cutoff && row.tokens.length >= 2)
      .sort((a, b) => b.date - a.date);

    const clusters = [];
    const clusterIndex = new Map();

    const indexClusterRow = (cluster, row) => {
      const keys = unique([
        ...row.entities.map(value => `entity:${value}`),
        ...row.phrases.map(value => `phrase:${value}`),
        ...row.tokens.map(value => `token:${value}`)
      ]);
      keys.forEach(key => {
        if (!clusterIndex.has(key)) clusterIndex.set(key, new Set());
        clusterIndex.get(key).add(cluster);
      });
    };

    const indexedCandidates = row => {
      const candidates = new Set();
      [
        ...row.entities.map(value => `entity:${value}`),
        ...row.phrases.map(value => `phrase:${value}`),
        ...row.tokens.map(value => `token:${value}`)
      ].forEach(key => {
        clusterIndex.get(key)?.forEach(cluster => candidates.add(cluster));
      });
      return candidates;
    };

    for (const row of rows) {
      let best = null;
      let bestScore = 0;
      let bestEvidence = null;

      for (const cluster of indexedCandidates(row)) {
        if (cluster.type !== row.type) continue;
        const newestDistance = Math.abs(row.date - cluster.newest);
        const maximumDistance = row.type === 'event' ? 45 * 86400000 : 12 * 86400000;
        if (row.date && cluster.newest && newestDistance > maximumDistance) continue;

        let evidence = null;
        for (const member of cluster.rows) {
          const candidate = similarityEvidence(row, member);
          if (!evidence || candidate.score > evidence.score) evidence = candidate;
        }
        // A shared city or country alone must not merge unrelated reports.
        // Require a title match or several mutually reinforcing signals.
        const hasStrongAnchor = Boolean(
          evidence?.exactTitle
          || (
            evidence?.sharedPhrases?.length >= 1
            && evidence?.sharedTokens?.length >= 3
          )
          || (
            evidence?.sharedEntities?.length >= 2
            && evidence?.sharedTokens?.length >= 3
          )
          || evidence?.sharedTokens?.length >= 5
        );

        if (evidence && evidence.score > bestScore && evidence.score >= threshold && hasStrongAnchor) {
          best = cluster;
          bestScore = evidence.score;
          bestEvidence = evidence;
        }
      }

      if (!best) {
        const cluster = {
          rows: [row],
          tokens: [...row.tokens],
          type: row.type,
          reasons: [],
          confidences: [],
          newest: row.date,
          oldest: row.date
        };
        clusters.push(cluster);
        indexClusterRow(cluster, row);
        continue;
      }

      best.rows.push(row);
      indexClusterRow(best, row);
      best.reasons.push(...(bestEvidence?.reasons || []));
      best.confidences.push(bestScore);
      best.newest = Math.max(best.newest, row.date);
      best.oldest = Math.min(best.oldest, row.date);

      const tokenCounts = new Map();

      for (const entry of best.rows) {
        for (const token of unique(entry.tokens)) {
          tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
        }
      }

      best.tokens = [...tokenCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 16)
        .map(([token]) => token);
    }

    return clusters
      .map(cluster => {
        const ordered = cluster.rows
          .sort((a, b) => a.date - b.date)
          .map(row => row.item);

        const sources = unique(
          cluster.rows.map(row => row.source)
        );
        const sourceIdentities = unique(
          cluster.rows.map(row => row.sourceIdentity || row.source)
        );

        const story = {
          id: hashlibId(
            ordered
              .map(itemKey)
              .sort()
              .join('|')
          ),
          title: cleanText(
            ordered[ordered.length - 1]?.title
            || clusterLabel(ordered)
          ),
          items: ordered,
          sources,
          sourceCount: sourceIdentities.length,
          itemCount: ordered.length,
          oldest: cluster.oldest,
          newest: cluster.newest,
          keywords: cluster.tokens.slice(0, 6),
          eventCount: ordered.filter(isEvent).length
        };
        story.kind = cluster.type;
        story.matchReasons = unique(cluster.reasons).slice(0, 6);
        story.matchConfidence = cluster.confidences.length
          ? cluster.confidences.reduce((sum, value) => sum + value, 0) / cluster.confidences.length
          : 1;

        const recency = Math.max(
          0,
          1 - (now - story.newest) / (days * 86400000)
        );

        story.score = (
          story.sourceCount * 3
          + story.itemCount * 1.5
          + recency * 4
        );

        return story;
      })
      .filter(story =>
        story.itemCount >= minItems
        && story.sourceCount >= minSources
      )
      .sort((a, b) =>
        b.score - a.score
        || b.newest - a.newest
      );
  }

  function hashlibId(value) {
    let hash = 2166136261;

    for (const character of String(value || '')) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }

    return `wrn-story-${(hash >>> 0).toString(36)}`;
  }

  function summarizeText(value, maximum = 360) {
    const text = cleanText(value);

    if (!text) return '';

    const sentences = text.match(
      /[^.!?…]+[.!?…]+|[^.!?…]+$/g
    ) || [text];

    const summary = sentences
      .slice(0, 2)
      .join(' ')
      .trim();

    if (summary.length <= maximum) return summary;

    return `${summary
      .slice(0, maximum)
      .replace(/\s+\S*$/, '')
      .trim()}…`;
  }

  function perspectiveRows(story, maximum = 4, metadataResolver) {
    const seen = new Set();
    const rows = [];
    const resolveMetadata = typeof metadataResolver === 'function'
      ? metadataResolver
      : item => item || {};

    for (const item of [...(story?.items || [])].reverse()) {
      const source = sourceName(item) || 'Source';
      const identity = sourceIdentity(item) || normalizeToken(source);

      if (seen.has(identity)) continue;
      seen.add(identity);
      const metadata = resolveMetadata(item) || {};

      rows.push({
        item,
        identity,
        source,
        title: cleanText(item.title),
        summary: summarizeText(
          item.summary
          || item.description
          || item.content
          || item.title
        ),
        link: cleanText(item.link),
        date: dateMs(item),
        origin: cleanText(
          metadata.originCountry
          || item?.originCountry
          || metadata.originRegion
          || item?.originRegion
        ),
        language: normalizedLanguage(
          metadata.language
          || item?.originalLanguage
          || item?.language
          || item?.lang
        ),
        region: cleanText(item?.primaryRegion || item?.kontinent),
        topic: cleanText(item?.primaryTopic)
      });

      if (rows.length >= maximum) break;
    }

    return rows;
  }

  function flattenBriefingHistory(history, days = 7, now = Date.now()) {
    const cutoff = now - days * 86400000;
    const rows = [];

    for (const briefing of Array.isArray(history) ? history : []) {
      const briefingDate = new Date(
        `${briefing?.date || ''}T12:00:00`
      ).getTime();

      if (!Number.isFinite(briefingDate) || briefingDate < cutoff) {
        continue;
      }

      for (const section of briefing?.sections || []) {
        for (const item of section?.items || []) {
          if (item?.isConnection) continue;

          rows.push({
            ...item,
            briefingDate,
            sectionId: section.id || ''
          });
        }
      }
    }

    return rows;
  }

  function weeklyInsights(history, options = {}) {
    const now = Number(options.now || Date.now());
    const days = Math.max(1, Number(options.days || 7));
    const rows = flattenBriefingHistory(history, days, now);

    const stories = clusterStories(rows, {
      now,
      days,
      minSources: 1,
      minItems: 2,
      threshold: 0.22
    }).slice(0, 6);

    const sources = new Map();
    const dates = new Set();

    for (const row of rows) {
      const source = sourceName(row);

      if (source) {
        sources.set(source, (sources.get(source) || 0) + 1);
      }

      if (row.briefingDate) {
        dates.add(new Date(row.briefingDate)
          .toISOString()
          .slice(0, 10));
      }
    }

    return {
      daysCovered: dates.size,
      itemCount: rows.length,
      sourceCount: sources.size,
      newCount: rows.filter(item => item.isNew).length,
      updatedCount: rows.filter(item => item.isUpdated).length,
      storyCount: stories.length,
      stories,
      topSources: [...sources.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }))
    };
  }

  function normalizeWatchTerms(values) {
    const source = Array.isArray(values) ? values : [values];

    return unique(
      source
        .flatMap(value => String(value || '').split(/[,;\n]+/))
        .map(value => cleanText(value).slice(0, 80))
        .filter(value => value.length >= 2)
    ).slice(0, 30);
  }

  function matchesWatchlist(item, terms) {
    const normalizedTerms = normalizeWatchTerms(terms)
      .map(normalizeToken);

    if (!normalizedTerms.length) return false;

    const haystack = normalizeToken(
      `${item?.title || ''} `
      + `${item?.summary || ''} `
      + `${item?.description || ''} `
      + `${item?.content || ''} `
      + `${sourceName(item)}`
    );

    return normalizedTerms.some(term => haystack.includes(term));
  }

  return Object.freeze({
    cleanText,
    normalizeToken,
    tokens,
    jaccard,
    sharedCount,
    dateMs,
    sourceName,
    itemKey,
    isEvent,
    itemType,
    namedEntities,
    titlePhrases,
    similarityEvidence,
    clusterStories,
    sourceMix,
    perspectiveRows,
    summarizeText,
    weeklyInsights,
    normalizeWatchTerms,
    matchesWatchlist
  });
});
