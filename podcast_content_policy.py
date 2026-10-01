"""Offline podcast policy projection shared by collection and saved catalogs."""
import json
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

RULES = json.loads(Path(__file__).with_name("podcast-content-policy.json").read_text(encoding="utf-8"))
MODE = "metadata_and_links_only"


def original_url(value):
    try:
        url = urlsplit(str(value or ""))
        if url.scheme != "https" or not url.hostname or url.username or url.password:
            return ""
        if url.path.lower().endswith(tuple(RULES["mediaExtensions"])):
            return ""
        return urlunsplit((url.scheme, url.netloc.lower(), url.path, url.query, ""))
    except ValueError:
        return ""


def restricted_endpoint(item):
    identifier = str(item.get("rawId") or item.get("id") or "").removeprefix("original:")
    return (identifier in RULES["restrictedEpisodeIds"]
            or item.get("endpointId") == RULES["endpointId"]
            or original_url(item.get("feedUrl")) in RULES["feedUrls"])


def source_restriction(item):
    identifier = str(item.get('rawId') or item.get('id') or '').removeprefix('original:')
    return (item.get('sourceId') in RULES.get('metadataOnlySourceIds', [])
            or identifier in RULES.get('metadataOnlyEpisodeIds', [])
            or original_url(item.get('feedUrl')) in RULES.get('metadataOnlyFeedUrls', []))


def metadata_only(item, source=None, sources=()):
    if restricted_endpoint(item) or item.get("contentPolicy") == MODE or source_restriction(item):
        return True
    candidates = [source] if source else []
    feed_url = original_url(item.get("feedUrl"))
    candidates += [entry for entry in sources if (
        (entry.get("id") and entry.get("id") == item.get("sourceId"))
        or (feed_url and feed_url in [original_url(value) for value in
            [entry.get("feedUrl"), *(entry.get("feedUrls") or [])] if value]))]
    return any(entry.get("contentPolicy") == MODE for entry in candidates)


def project_episode(item, source=None, sources=()):
    if not metadata_only(item, source, sources):
        return dict(item)
    result = {key: value for key, value in item.items() if key in RULES["metadataFields"]}
    result["contentPolicy"] = MODE
    result["episodeUrl"] = next((url for value in [item.get("episodeUrl"), item.get("originalUrl"),
        item.get("articleUrl"), item.get("link")] if (url := original_url(value))), "")
    result["feedUrl"] = original_url(item.get("feedUrl"))
    result.update(description="", audioUrl="", artwork="")
    if source_restriction(item):
        result.update(license='Rights unverified; original source only', rightsStatus='unverified')
    identifier = str(item.get('rawId') or item.get('id') or '').removeprefix('original:')
    if item.get('sourceId') in RULES.get('unverifiedLanguageSourceIds', []) or identifier in RULES.get('unverifiedLanguageEpisodeIds', []):
        result.update(language='und', languageVerified=False, languageReviewRequired=True,
                      languageConfidence=0, languageSource='mixed-channel-requires-review', configuredLanguages=['es','ca'])
    if restricted_endpoint(item):
        result["sourceId"] = RULES["canonicalSourceId"]
        result["endpointId"] = RULES["endpointId"]
    return result


def episode_key(item):
    if metadata_only(item):
        return "metadata:" + str(item.get("id") or original_url(item.get("episodeUrl"))) if item.get("id") or original_url(item.get("episodeUrl")) else ""
    return str(item.get("audioUrl") or "")


def preserve_failed_sources(items, previous, health):
    result = {episode_key(item): item for item in items if episode_key(item)}
    for item in previous:
        source = item.get('endpointId') or item.get('sourceId')
        if not health.get(source, {}).get('ok') and episode_key(item):
            result.setdefault(episode_key(item), item)
    return sorted(result.values(), key=lambda x: x.get('published') or '', reverse=True)
