"""Offline union of previously stored podcast records; no new feed intake.

Stable IDs and archived exclusions survive. App configuration is authoritative
for the existing source/language choices; stricter source rights always win.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from podcast_content_policy import MODE, project_episode


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def merge_archive(catalogs, sources):
    by_source = {source['id']: source for source in sources}
    records, withdrawn = {}, set()
    for rows in catalogs:
        seen = set()
        for row in rows:
            identifier = row.get('id')
            if not identifier or identifier in seen:
                raise ValueError('Missing or ambiguous episode ID')
            seen.add(identifier)
            if row.get('sourceId') not in by_source:
                raise ValueError('Episode without configured source: ' + identifier)
            item = project_episode(row, by_source[row['sourceId']], sources)
            for field in ('status', 'deleted'):
                if field in row:
                    item[field] = row[field]
            if item.get('status') in ('withdrawn', 'revoked', 'deleted') or item.get('deleted') is True:
                withdrawn.add(identifier)
                records[identifier] = item
            elif identifier not in withdrawn:
                # Inputs are ordered canonical last; episode age is not a rights grant.
                records[identifier] = item
    return sorted(records.values(), key=lambda row: (row.get('published') or '', row['id']), reverse=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, default=ROOT.parent / 'wrn-data-autonom-current')
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--app-ref', default='25b521fac2a4b06e051614d166f8caadf8dd9c40')
    parser.add_argument('--data-ref', default='e62f56280b737ce6559b830d4a4bba7c349d506f')
    args = parser.parse_args()
    data = args.data.resolve()
    documents, inputs = {}, {}
    for name, root, ref in [('app', ROOT, args.app_ref), ('data', data, args.data_ref)]:
        commit = subprocess.check_output(['git','-C',str(root),'rev-parse',ref], text=True).strip()
        inputs[name] = {'commit': commit, 'files': {}}
        for filename in ('podcasts.json','podcast-sources.json'):
            payload = subprocess.check_output(['git','-C',str(root),'show',f'{commit}:{filename}'])
            inputs[name]['files'][filename] = hashlib.sha256(payload).hexdigest()
            documents[name, filename] = json.loads(payload)
    app_sources = documents['app', 'podcast-sources.json']
    data_sources = {row['id']: row for row in documents['data', 'podcast-sources.json']}
    if len(app_sources) != len(data_sources) or {row['id'] for row in app_sources} != set(data_sources):
        raise ValueError('Source admission is outside this reconciliation')
    sources = []
    for source in app_sources:
        other = data_sources[source['id']]
        if source.get('feedUrls') != other.get('feedUrls'):
            raise ValueError('Endpoint identity conflict: ' + source['id'])
        source = dict(source)
        if other.get('contentPolicy') == MODE:
            source.update(contentPolicy=MODE, pageAudioFallback=False)
        if other.get('enabled') is False:
            source['enabled'] = False
        sources.append(source)
    archive = merge_archive([documents['data','podcasts.json'], documents['app','podcasts.json']], sources)
    blocked = {source['id'] for source in sources if source.get('enabled') is False and source.get('disabledReason')}
    # Intake holds retain historical links; an explicit language exclusion does not become active.
    blocked = {identifier for identifier in blocked if identifier == 'leftover-talk'}
    active = [row for row in archive if row['sourceId'] not in blocked and row.get('status') not in ('withdrawn','revoked','deleted') and row.get('deleted') is not True]
    report = {'schema':'wrn.podcast-archive-reconciliation.v1', 'inputs':inputs,
              'archiveRows':len(archive), 'activeRows':len(active), 'excludedSourceIds':sorted(blocked),
              'excludedRows':len(archive)-len(active), 'freshIntake':False, 'publicationPerformed':False,
              'outputSha256':{name:hashlib.sha256(encode(value)).hexdigest() for name,value in [('podcasts.json',active),('podcast-archive.json',archive),('podcast-sources.json',sources)]}}
    policy_bytes = (ROOT/'podcast-content-policy.json').read_bytes()
    report['policySha256'] = hashlib.sha256(policy_bytes).hexdigest()
    report['languageConflictEpisodeIds'] = json.loads(policy_bytes)['languageConflictEpisodeIds']
    if args.write:
        # Validate every target before writing either repository. Preserve unrelated work.
        for label, root in [('app', ROOT), ('data', data)]:
            if (root/'podcast-content-policy.json').read_bytes() != policy_bytes:
                raise ValueError('Policy mismatch; reconcile policy first')
            for filename, value in [('podcasts.json',active),('podcast-archive.json',archive),('podcast-sources.json',sources)]:
                target = root/filename
                if target.exists():
                    existing = json.loads(target.read_bytes())
                    baseline = documents.get((label, filename))
                    if existing != baseline and existing != value:
                        raise ValueError('Refusing to overwrite unrelated work: ' + str(target))
        # Caller owns both workspaces. Write the same archive; leave health observations intact.
        for root in (ROOT, data):
            (root/'podcasts.json').write_bytes(encode(active))
            (root/'podcast-archive.json').write_bytes(encode(archive))
            (root/'podcast-sources.json').write_bytes(encode(sources))
        (ROOT/'docs/PODCAST-ARCHIVE-PARITY-2026-10-01.json').write_bytes(encode(report))
    print(json.dumps(report, ensure_ascii=True))


if __name__ == '__main__':
    main()
