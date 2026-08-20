'use strict';

const assert = require('assert');
const path = require('path');
const specialty = require(path.resolve(__dirname, '..', 'news-app-2-specialty.js'));

const now = new Date('2026-07-27T12:00:00Z').getTime();
const events = specialty.collapseRecurringEvents([
  {
    title: 'Solidarity meeting',
    quelleName: 'Radar.squat',
    link: 'https://example.org/1',
    eventStart: '2026-07-20T18:00:00Z',
    eventEnd: '2026-07-20T20:00:00Z',
    eventCity: 'Bern',
    eventCountry: 'CH',
    eventVenue: 'Centre'
  },
  {
    title: 'Solidarity meeting',
    quelleName: 'Radar.squat',
    link: 'https://example.org/2',
    eventStart: '2026-07-30T18:00:00Z',
    eventEnd: '2026-07-30T20:00:00Z',
    eventCity: 'Bern',
    eventCountry: 'CH',
    eventVenue: 'Centre'
  },
  {
    title: 'Long exhibition',
    quelleName: 'Local source',
    eventStart: '2026-07-01T10:00:00Z',
    eventEnd: '2026-08-30T18:00:00Z',
    eventCity: 'Zürich',
    eventCountry: 'CH'
  }
], now);

assert.strictEqual(events.length, 2, 'recurring dates should be grouped');
assert.strictEqual(events.find(event => event.title === 'Solidarity meeting').occurrenceCount, 2);
assert.strictEqual(
  specialty.filterEvents(events, { archived: false }, now).length,
  2,
  'an event remains current until its end date'
);
assert.strictEqual(
  specialty.filterEvents(events, { archived: true }, now).length,
  0,
  'current events must not appear in the archive'
);

const recurring = specialty.collapseRecurringEvents([{
  title: 'Weekly exchange',
  quelleName: 'Radar.squat',
  eventStart: '2026-04-09T14:00:00Z',
  eventEnd: '2026-10-31T18:00:00Z',
  eventCity: 'Berlin',
  eventRecurrence: 'RRULE:FREQ=WEEKLY;BYDAY=TH'
}], now)[0];
assert(recurring.start >= now, 'a weekly series must display its next date, not its first past date');
  assert(recurring.start <= recurring.end);

const detailed = specialty.normalizeEvent({
  title: 'Mapped event',
  eventStart: '2026-07-29T18:00:00Z',
  eventLatitude: '46.948',
  eventLongitude: '7.4474',
  eventGroups: ['Collective'],
  eventPrice: 'free',
  eventExternalLinks: ['https://example.org/info', 'javascript:alert(1)']
});
assert.strictEqual(detailed.latitude, 46.948);
assert.deepStrictEqual(detailed.groups, ['Collective']);
assert.strictEqual(detailed.externalLinks.length, 1);
const zeroCoordinates = specialty.normalizeEvent({
  eventLatitude: '0',
  eventLongitude: '0'
});
assert.strictEqual(zeroCoordinates.latitude, null);
assert.strictEqual(zeroCoordinates.longitude, null);

assert.strictEqual(specialty.safeUrl('javascript:alert(1)'), '');
assert.strictEqual(specialty.localized({ de: 'Deutsch', en: 'English' }, 'de'), 'Deutsch');
assert.strictEqual(
  specialty.isCurrentProfile({
    verification: { status: 'verified', nextReviewAt: '2026-08-01' }
  }, now),
  true
);

const profile = { aliases: ['Example Person'] };
const related = specialty.relatedArticles(profile, [
  { title: 'Letter for Example Person', intro: '', content: '' },
  { title: 'Other story', intro: '', content: '' }
]);
assert.strictEqual(related.length, 1);

const glossary = specialty.glossaryEntries({
  terms: [{
    id: 'mutual-aid',
    category: 'basics',
    title: { de: 'Gegenseitige Hilfe', en: 'Mutual aid' },
    summary: { de: 'Gemeinsam handeln', en: 'Acting together' },
    practice: {},
    debate: {},
    related: []
  }]
}, 'de', 'basics', 'Hilfe');
assert.strictEqual(glossary.length, 1);
assert.strictEqual(glossary[0].displayTitle, 'Gegenseitige Hilfe');

const clusters = specialty.developmentClusters([], {
  clusterStories: () => [
    { sourceCount: 2, matchConfidence: 0.72, matchReasons: ['place', 'person'] },
    { sourceCount: 2, matchConfidence: 0.66, matchReasons: ['topic', 'region'] },
    { sourceCount: 2, matchConfidence: 0.3, matchReasons: ['weak'] }
  ]
}, { approvedOnly: false });
assert.strictEqual(clusters.length, 1, 'development matches below the editorial 72% floor must be rejected');

const legacyResolvedReview = {
  id: 'review-1',
  status: 'resolved',
  createdAt: '2026-08-05T10:00:00Z',
  updatedAt: '2026-08-05T11:00:00Z'
};
assert.deepStrictEqual(
  specialty.developmentReviewHistory(legacyResolvedReview).map(entry => entry.action),
  ['reported', 'resolved'],
  'legacy review records must receive a readable history'
);
const reopenedReview = specialty.transitionDevelopmentReview(
  legacyResolvedReview,
  'open',
  '2026-08-05T12:00:00Z'
);
assert.strictEqual(reopenedReview.status, 'open');
assert.deepStrictEqual(
  reopenedReview.history.map(entry => entry.action),
  ['reported', 'resolved', 'reopened'],
  'review status changes must remain auditable'
);
const resolvedAgain = specialty.transitionDevelopmentReview(
  reopenedReview,
  'resolved',
  '2026-08-05T13:00:00Z'
);
assert.deepStrictEqual(
  resolvedAgain.history.map(entry => entry.action),
  ['reported', 'resolved', 'reopened', 'resolved']
);

console.log('News App 2 specialty contracts: OK');
