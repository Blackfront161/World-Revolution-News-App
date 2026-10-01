from library_catalog import merge_catalogs

SOURCES = [{'id': 'books', 'status': 'active'}, {'id': 'disabled', 'status': 'disabled'}]


def book(key, **fields):
    return {'id': key, 'sourceId': 'books', 'title': key, **fields}


def test_partial_refresh_preserves_archive_and_uses_work_revision():
    old = book('shared', updatedAt='2025-01-01T00:00:00Z', authors=['Earlier'])
    new = book('shared', updatedAt='2026-01-01T00:00:00Z', authors=['Corrected'])
    result = merge_catalogs([[book('archive'), new], [old, book('german', languages=['de'])]], SOURCES)
    assert {x['id'] for x in result} == {'archive', 'shared', 'german'}
    assert next(x for x in result if x['id'] == 'shared')['authors'] == ['Corrected']
    assert merge_catalogs([result, []], SOURCES) == result
    assert new['authors'] == ['Corrected']


def test_takedown_survives_stale_cache_and_partial_refresh():
    removal = book('removed', status='withdrawn')
    result = merge_catalogs([[removal], [book('removed'), book('keep'), book('disabled', sourceId='disabled')]], SOURCES)
    assert next(x for x in result if x['id'] == 'removed')['status'] == 'withdrawn'
    assert {x['id'] for x in result} == {'removed', 'keep'}
    assert merge_catalogs([result, [book('removed')]], SOURCES) == result
