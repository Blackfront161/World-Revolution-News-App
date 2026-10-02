import json
from unittest.mock import patch
from pathlib import Path
import aggregate_podcasts as collector
from podcast_content_policy import project_episode

ROOT=Path(__file__).resolve().parents[1]

def test_declared_channel_language_does_not_verify_episode_or_retain_media():
    row=project_episode(dict(id='test',sourceId='3cr-anarchist-world',language='en',languageVerified=True,languageConfidence=1,audioUrl='https://example.com/a.mp3',description='Foreign text',artwork='https://example.com/image.jpg'))
    assert row['language']=='und' and row['languageVerified'] is False
    assert not row.get('audioUrl') and not row.get('description') and not row.get('artwork')
    alias=project_episode(dict(id='legacy',sourceId='old-rebel-alias',feedUrl='https://feeds.acast.com/public/shows/5cd3502455b9e4f12ddc860e#cached',language='en',languageVerified=True))
    assert alias['language']=='und' and alias['languageVerified'] is False

def test_hold_never_fetches_and_source_limit_can_exceed_old_35_cap():
    with patch.object(collector.session,'get',side_effect=AssertionError('must not fetch')):
        rows,feed,errors=collector.source_entries(dict(id='hold',catalogReview={'episodeIntake':'hold'}))
    assert not rows and errors
    source=next(s for s in json.loads((ROOT/'podcast-sources.json').read_text(encoding='utf-8')) if s['id']=='3cr-anarchist-world')
    with patch.object(collector,'discover_feeds',side_effect=AssertionError('reviewed sources must use maintained feeds only')):
        assert collector.source_feed_candidates(source)==source['feedUrls']
    xml=('<rss><channel><language>en-AU</language>'+''.join(f'<item><guid>{i}</guid><title>Episode {i}</title><link>https://www.3cr.org.au/episode/{i}</link><description>Not admitted</description></item>' for i in range(110))+'</channel></rss>').encode()
    class Response:
        url=source['feedUrls'][0]
        def raise_for_status(self): pass
        def iter_content(self,chunk_size): yield xml
        def close(self): pass
    with patch.object(collector.session,'get',return_value=Response()):
        rows,feed,errors=collector.source_entries(source)
    assert not errors and len(rows)==100
    assert all(row['language']=='und' and not row['languageVerified'] and not row['description'] and not row['audioUrl'] for row in rows)

def test_oversized_feed_is_rejected_without_partial_admission():
    source=next(s for s in json.loads((ROOT/'podcast-sources.json').read_text(encoding='utf-8')) if s['id']=='rebel-steps')
    class Response:
        url=source['feedUrls'][0]
        def raise_for_status(self): pass
        def iter_content(self,chunk_size): yield b'x'*(4194304+1)
        def close(self): pass
    with patch.object(collector.session,'get',return_value=Response()):
        rows,feed,errors=collector.source_entries(source)
    assert rows==[] and errors


