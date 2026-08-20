from pathlib import Path
import json

root = Path('.')
config = (root / 'config.js').read_text(encoding='utf-8')
worker = (root / 'service-worker.js').read_text(encoding='utf-8')
media = (root / 'media-player.js').read_text(encoding='utf-8')
workflow = (root / '.github/workflows/quality-gate.yml').read_text(encoding='utf-8')
css = (root / 'audio-tab-183.css').read_text(encoding='utf-8')
sources = json.loads((root / 'podcast-sources.json').read_text(encoding='utf-8'))

assert 'audio-tab-183.css' in config
assert 'audio-tab-183.js' in config
assert 'audio-tab-183.css' in worker
assert 'audio-tab-183.js' in worker
assert "wrn-app-v2.1.1-r1" in worker
assert 'seek: seekGlobalMedia' in media
assert 'skip: skipGlobalMedia' in media
assert 'python tests/run_contract_matrix.py' in workflow
assert 'var(--bg-card)' in css and 'var(--bg-input)' in css
assert 'rgba(0,0,0' not in css.replace(' ', '')
ids = {entry.get('id') for entry in sources if isinstance(entry, dict)}
for expected in {
    'radio-ambulante',
    'yeah-nah-pasaran',
    'asian-labor-futures',
    'leftover-talk',
    'real-sankara-hours',
    'the-dugout-black-anarchist',
}:
    assert expected in ids, f'missing podcast source {expected}'
print('Audio block 2 asset tests passed.')
