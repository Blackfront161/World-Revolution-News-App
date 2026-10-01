"""Merge bounded OPDS snapshots without interpreting absence as deletion."""
from copy import deepcopy
from datetime import datetime


def withdrawn(item):
    return item.get('status') in {'withdrawn', 'revoked', 'deleted'} or item.get('deleted') is True


def revision(item):
    try:
        return datetime.fromisoformat(item.get('updatedAt', '').replace('Z', '+00:00')).timestamp()
    except (ValueError, TypeError):
        return 0


def merge_catalogs(catalogs, sources):
    allowed = {s['id'] for s in sources if s.get('status') == 'active'}
    merged, removed = {}, set()
    for catalog in catalogs:
        if not isinstance(catalog, list):
            raise ValueError('Library catalog must be an array')
        for item in catalog:
            if not isinstance(item, dict) or not item.get('id') or item.get('sourceId') not in allowed:
                continue
            key = item['id']
            if withdrawn(item):
                removed.add(key)
                merged[key] = deepcopy(item)
            elif item.get('title') and key not in removed:
                if key not in merged or revision(item) >= revision(merged[key]):
                    merged[key] = deepcopy(item)
    # Retain tombstones in persisted snapshots so later partial fetches cannot resurrect them.
    return sorted(merged.values(), key=lambda x: (x.get('sourceName', '').casefold(), x.get('title', '').casefold(), x['id']))
