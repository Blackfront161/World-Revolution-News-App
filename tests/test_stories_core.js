'use strict';

const assert = require('node:assert/strict');
const core = require('../stories-core.js');

const now = Date.parse('2026-07-21T12:00:00Z');
const articles = [
  {
    title: 'Dockworkers strike expands across Hamburg port',
    quelleName: 'Labor Notes',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://labornotes.example/a',
    originCountry: 'Germany',
    language: 'de'
  },
  {
    title: 'Hamburg port strike spreads to more terminals',
    quelleName: 'Freedom News',
    pubDate: '2026-07-21T08:00:00Z',
    link: 'https://freedomnews.example/b',
    originCountry: 'United Kingdom',
    language: 'en'
  },
  {
    title: 'Workers in Hamburg extend port strike',
    quelleName: 'Unicorn Riot',
    pubDate: '2026-07-21T10:00:00Z',
    link: 'https://unicornriot.example/c',
    originCountry: 'United States',
    language: 'en'
  },
  {
    title: 'Community garden opens in Lisbon',
    quelleName: 'Other',
    pubDate: '2026-07-20T10:00:00Z',
    link: 'https://other.example/d'
  }
];

const stories = core.clusterStories(articles, {
  now,
  days: 7,
  minSources: 2,
  threshold: 0.2
});

assert.equal(stories.length, 1);
assert.equal(stories[0].itemCount, 3);
assert.equal(stories[0].sourceCount, 3);
assert.equal(stories[0].items[0].link, 'https://labornotes.example/a');
assert.equal(stories[0].items[2].link, 'https://unicornriot.example/c');

const mix = core.sourceMix(stories[0], item => ({
  ...item,
  geographySource: item.quelleName === 'Labor Notes' ? 'explicit' : 'inferred:name'
}));
assert.equal(mix.level, 'broad');
assert.equal(mix.sourceCount, 3);
assert.equal(mix.explicitOriginSources, 1);
assert.equal(mix.inferredOriginSources, 2);
assert.deepEqual(mix.languages.sort(), ['de', 'en']);
assert.equal(core.perspectiveRows(stories[0]).length, 3);

const falsePositiveStories = core.clusterStories([
  {
    title: 'Summer break at an independent magazine',
    quelleName: 'Magazine',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://magazine.example/summer'
  },
  {
    title: 'Summer solidarity call for a housing protest',
    quelleName: 'Radar',
    pubDate: '2026-07-20T10:00:00Z',
    link: 'https://radar.example/call'
  },
  {
    title: 'July protest for neighbourhood solidarity',
    quelleName: 'Calendar A',
    pubDate: '2026-07-20T11:00:00Z',
    link: 'https://calendar-a.example/protest'
  },
  {
    title: 'July memorial event in another city',
    quelleName: 'Calendar B',
    pubDate: '2026-07-20T12:00:00Z',
    link: 'https://calendar-b.example/memorial'
  }
], { now, days: 7, minSources: 2 });

assert.equal(falsePositiveStories.length, 0);

const locationOnlyStories = core.clusterStories([
  {
    title: 'Athens: Claim for attack with fire against DELTA unit in Exarchia',
    quelleName: 'Source A',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://source-a.example/delta'
  },
  {
    title: 'Hip-hop live for convicted comrades (Athens, Greece)',
    quelleName: 'Source B',
    pubDate: '2026-07-20T10:00:00Z',
    link: 'https://source-b.example/concert'
  },
  {
    title: 'Arson attack on DELTA motorbike cops in Exarcheia (Athens, Greece)',
    quelleName: 'Source C',
    pubDate: '2026-07-20T11:00:00Z',
    link: 'https://source-c.example/delta'
  }
], { now, days: 7, minSources: 2, threshold: 0.72 });

assert.equal(locationOnlyStories.length, 1);
assert.equal(locationOnlyStories[0].itemCount, 2);
assert.equal(locationOnlyStories[0].items.some(item => item.link.includes('concert')), false);

const sameSourceDuplicates = core.clusterStories([
  {
    title: 'Community blocks eviction at Oak Street social centre',
    quelleName: 'Local Collective',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://local.example/eviction-1'
  },
  {
    title: 'Community blocks eviction at Oak Street social centre',
    quelleName: 'Local Collective',
    pubDate: '2026-07-20T10:00:00Z',
    link: 'https://local.example/eviction-2'
  }
], { now, days: 7, minSources: 2, threshold: 0.72 });

assert.equal(sameSourceDuplicates.length, 0, 'duplicate reports from one source must not create a development');

const distantRepeatStories = core.clusterStories([
  {
    title: 'Residents defend Oak Street social centre from eviction',
    quelleName: 'Source A',
    pubDate: '2026-06-25T09:00:00Z',
    link: 'https://source-a.example/oak-june'
  },
  {
    title: 'Residents defend Oak Street social centre from eviction',
    quelleName: 'Source B',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://source-b.example/oak-july'
  }
], { now, days: 30, minSources: 2, threshold: 0.72 });

assert.equal(distantRepeatStories.length, 0, 'similar headlines weeks apart must not be treated as the same news event');

const classificationOnlyStories = core.clusterStories([
  {
    title: 'Workers protest wage cuts at central station',
    quelleName: 'Source A',
    pubDate: '2026-07-20T09:00:00Z',
    link: 'https://source-a.example/wages',
    primaryRegion: 'Europe',
    primaryTopic: 'Labor Struggles'
  },
  {
    title: 'Community opens a free kitchen for neighbours',
    quelleName: 'Source B',
    pubDate: '2026-07-20T10:00:00Z',
    link: 'https://source-b.example/kitchen',
    primaryRegion: 'Europe',
    primaryTopic: 'Labor Struggles'
  }
], { now, days: 7, minSources: 2, threshold: 0.72 });

assert.equal(classificationOnlyStories.length, 0, 'matching region and topic must never link unrelated reports on their own');

const watchTerms = core.normalizeWatchTerms([
  'Hamburg',
  ' port strike ',
  'Hamburg'
]);

assert.deepEqual(watchTerms, ['Hamburg', 'port strike']);
assert.equal(
  core.matchesWatchlist(articles[0], watchTerms),
  true
);
assert.equal(
  core.matchesWatchlist(articles[3], watchTerms),
  false
);

const history = [
  {
    date: '2026-07-21',
    sections: [
      {
        id: 'overview',
        items: [
          {
            ...articles[2],
            isNew: true
          }
        ]
      }
    ]
  },
  {
    date: '2026-07-20',
    sections: [
      {
        id: 'overview',
        items: [
          {
            ...articles[0],
            isUpdated: true
          },
          {
            ...articles[1],
            isNew: true
          }
        ]
      }
    ]
  }
];

const week = core.weeklyInsights(history, {
  now,
  days: 7
});

assert.equal(week.daysCovered, 2);
assert.equal(week.itemCount, 3);
assert.equal(week.sourceCount, 3);
assert.equal(week.newCount, 2);
assert.equal(week.updatedCount, 1);
assert.ok(week.stories.length >= 1);

console.log('WRN stories core tests: OK');
