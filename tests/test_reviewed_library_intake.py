import json
from pathlib import Path
from library_catalog import merge_catalogs

ROOT = Path(__file__).resolve().parents[1]

def test_reviewed_book_identity_and_rights_survive_a_newer_unreviewed_opds_snapshot():
    candidate=json.loads((ROOT/'docs/evidence/WRN-CONTENT-EDITORIAL-2026-10-03/intake-candidate.json').read_text(encoding='utf-8'))['bookRecords']
    sources=json.loads((ROOT/'library-sources.json').read_text(encoding='utf-8'))
    for row in candidate:
        stale=dict(row,contentPolicy='playable',authors=['Unreviewed'],updatedAt='2099-01-01T00:00:00Z',readUrl=row['readUrl']+'.epub',downloads={'epub':row['readUrl']+'.epub'},formats=['epub'])
        for catalogs in [[row],[stale]], [[stale],[row]]:
            assert merge_catalogs(catalogs,sources)==[row]
        assert merge_catalogs([[row],[dict(stale,status='withdrawn')]],sources)[0]['status']=='withdrawn'
