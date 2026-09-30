"""Read-only, offline comparison of local WRN media catalogues.

No admission, merge, network request or catalogue mutation is performed.
Reports contain record IDs, counts and hashes, never article bodies/audio URLs.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
from urllib.parse import urlsplit, urlunsplit


FILES = (
    "podcast-sources.json", "podcasts.json", "podcast-health.json",
    "library-sources.json", "library-feed.json", "library-health.json",
)
ARRAY_FILES = {"podcast-sources.json", "podcasts.json", "library-sources.json", "library-feed.json"}
SOURCE_FIELDS = ("name", "homepage", "feedUrl", "feedUrls", "language", "languages", "enabled", "sourceKind", "contentPolicy", "license")
EPISODE_FIELDS = ("sourceId", "sourceName", "episodeUrl", "audioUrl", "published", "language", "sourceKind")
BOOK_FIELDS = ("sourceId", "title", "authors", "languages", "readUrl", "downloads", "formats")


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def https_identity(value) -> str:
    """Only fold scheme/hostname and fragment; preserve path and query identity."""
    if not isinstance(value, str):
        return ""
    try:
        url = urlsplit(value)
        if url.scheme.lower() != "https" or not url.hostname or url.username or url.password:
            return ""
        port = url.port
        authority = url.hostname.lower()
        if ":" in authority:
            authority = f"[{authority}]"
        if port and port != 443:
            authority += f":{port}"
        return urlunsplit(("https", authority, url.path or "/", url.query, ""))
    except ValueError:
        return ""


def source_origin(row: dict) -> str:
    address = https_identity(row.get("homepage"))
    return urlsplit(address).netloc if address else ""


def indexed(rows: list[dict]) -> dict[str, dict]:
    counts = Counter(row.get("id") for row in rows if isinstance(row.get("id"), str) and row["id"])
    # Ambiguous duplicate IDs cannot be compared as if one arbitrary row won.
    return {row["id"]: row for row in rows if isinstance(row.get("id"), str) and counts.get(row["id"]) == 1}


def id_findings(rows: list[dict]) -> dict:
    values = [row.get("id") for row in rows]
    counts = Counter(value for value in values if isinstance(value, str) and value)
    return {
        "missingOrInvalidIdRows": [position for position, value in enumerate(values) if not isinstance(value, str) or not value],
        "duplicateIds": sorted(value for value, count in counts.items() if count > 1),
    }


def changed_fields(left: dict, right: dict, fields: tuple) -> list[str]:
    # Unordered list normalization is deliberately absent: order can be meaningful.
    return [name for name in fields if left.get(name) != right.get(name)]


def compare_rows(left: list[dict], right: list[dict], fields: tuple) -> dict:
    app, data = indexed(left), indexed(right)
    shared = sorted(app.keys() & data.keys())
    drift = [{"id": key, "fields": changed_fields(app[key], data[key], fields)} for key in shared]
    return {
        "appRows": len(left), "dataRows": len(right),
        "sharedUniqueIds": len(shared),
        "idsOnlyInApp": sorted(app.keys() - data.keys()),
        "idsOnlyInData": sorted(data.keys() - app.keys()),
        "sharedIdFieldChanges": [row for row in drift if row["fields"]],
        "appIdFindings": id_findings(left), "dataIdFindings": id_findings(right),
    }


def podcast_findings(sources: list[dict], episodes: list[dict]) -> dict:
    by_id = indexed(sources)
    names = defaultdict(list)
    origins = defaultdict(set)
    for source in sources:
        if source.get("name"):
            names[str(source["name"]).casefold()].append(source)
        if isinstance(source.get("id"), str) and source["id"] in by_id and source_origin(source):
            origins[source_origin(source)].add(source["id"])
    missing_sources = []
    for position, source in enumerate(sources):
        if not isinstance(source.get("id"), str) or not source["id"]:
            missing_sources.append({
                "row": position,
                "possibleExistingSourceIds": sorted(origins[source_origin(source)]),
                "basis": "same_https_origin_only",
                "disposition": "review_required_no_identity_or_rights_approval",
                "restrictedMetadataOnly": source.get("contentPolicy") == "metadata_and_links_only",
            })
    unresolved, disabled = [], []
    for position, episode in enumerate(episodes):
        source_id = episode.get("sourceId")
        if not isinstance(source_id, str) or source_id not in by_id:
            candidates = set()
            for source in names.get(str(episode.get("sourceName") or "").casefold(), []):
                if isinstance(source.get("id"), str) and source["id"] in by_id:
                    candidates.add(source["id"])
                else:
                    candidates.update(origins[source_origin(source)])
            unresolved.append({
                "row": position, "episodeId": episode.get("id") if isinstance(episode.get("id"), str) else None,
                "reason": "missing_source_id" if not source_id else "unresolved_or_duplicate_source_id",
                "possibleExistingSourceIds": sorted(candidates),
                "disposition": "review_required_preserve_episode_id_and_restrictions",
            })
        elif by_id[source_id].get("enabled") is False:
            disabled.append({"episodeId": episode.get("id") if isinstance(episode.get("id"), str) else None, "sourceId": source_id, "disposition": "exclude_from_active_intake_retention_requires_review"})
    return {"sourcesWithoutId": missing_sources, "episodesWithoutResolvableSource": unresolved, "episodesFromExplicitlyDisabledSource": disabled}


def book_links(row: dict) -> set[str]:
    downloads = row.get("downloads")
    values = [row.get("readUrl")]
    if isinstance(downloads, dict):
        values.extend(downloads.values())
    return {identity for value in values if (identity := https_identity(value))}


def possible_book_aliases(left: list[dict], right: list[dict]) -> list[dict]:
    """Exact safe original/download link overlap is evidence for review, not a merge."""
    right_links = defaultdict(set)
    left_index, right_index = indexed(left), indexed(right)
    for key, row in right_index.items():
        for link in book_links(row):
            right_links[link].add(key)
    matches = {}
    for app_id, row in left_index.items():
        for link in book_links(row):
            for data_id in right_links[link]:
                if app_id == data_id:
                    continue
                key = (app_id, data_id)
                entry = matches.setdefault(key, {"appId": app_id, "dataId": data_id, "matchingOriginalLinkHashes": [], "disposition": "review_work_edition_language_and_revocation_before_merge"})
                entry["matchingOriginalLinkHashes"].append(sha256(link.encode("utf-8")))
    return [dict(row, matchingOriginalLinkHashes=sorted(set(row["matchingOriginalLinkHashes"]))) for _, row in sorted(matches.items())]


def git_head(root: Path) -> str:
    result = subprocess.run(["git", "-c", f"safe.directory={root.as_posix()}", "-C", str(root), "rev-parse", "HEAD"], capture_output=True, text=True, check=True)
    return result.stdout.strip()


def load_snapshot(root: Path) -> dict:
    root = root.resolve(strict=True)
    rows, bindings = {}, {}
    for name in FILES:
        value = (root / name).read_bytes()
        payload = json.loads(value)
        if name in ARRAY_FILES:
            if not isinstance(payload, list) or any(not isinstance(row, dict) for row in payload):
                raise ValueError(f"{name}: expected an array of objects")
        elif not isinstance(payload, dict):
            raise ValueError(f"{name}: expected an object")
        rows[name] = payload
        bindings[name] = {"bytes": len(value), "sha256": sha256(value)}
    return {"commit": git_head(root), "inputKind": "worktree_snapshot_hashes_are_authoritative_commit_is_context", "files": bindings, "rows": rows}


def compare_snapshots(app: dict, data: dict) -> dict:
    a, d = app["rows"], data["rows"]
    podcasts = compare_rows(a["podcasts.json"], d["podcasts.json"], EPISODE_FIELDS)
    books = compare_rows(a["library-feed.json"], d["library-feed.json"], BOOK_FIELDS)
    books["possibleAliasesByExactOriginalLink"] = possible_book_aliases(a["library-feed.json"], d["library-feed.json"])
    app_disabled = {key for key, row in indexed(a["podcast-sources.json"]).items() if row.get("enabled") is False}
    cross_policy = [{"episodeId": row.get("id") if isinstance(row.get("id"), str) else None, "sourceId": row["sourceId"], "disposition": "app_policy_blocks_activation_even_if_data_contains_record"} for row in d["podcasts.json"] if isinstance(row.get("sourceId"), str) and row["sourceId"] in app_disabled]
    return {
        "schemaVersion": 1,
        "status": "review_required_not_admission_not_merge_not_live_parity",
        "bindings": {"app": {key: app[key] for key in ("commit", "inputKind", "files")}, "data": {key: data[key] for key in ("commit", "inputKind", "files")}},
        "podcastSources": compare_rows(a["podcast-sources.json"], d["podcast-sources.json"], SOURCE_FIELDS),
        "podcastEpisodes": podcasts,
        "podcastFindings": {"app": podcast_findings(a["podcast-sources.json"], a["podcasts.json"]), "data": podcast_findings(d["podcast-sources.json"], d["podcasts.json"])},
        "dataEpisodesBlockedByExplicitAppPolicy": cross_policy,
        "librarySources": compare_rows(a["library-sources.json"], d["library-sources.json"], ("name", "homepage", "opdsUrl", "languages", "status")),
        "libraryTitles": books,
        "mergeRules": [
            "Preserve stable episode/book IDs and saved state; do not infer admission from presence.",
            "Review incoming-only and archive-only records separately against revocations and retention rights.",
            "Same source origin or original link proposes a review; it does not prove issuer identity or rights.",
            "Respect explicit disabled-language/source policy before any active projection.",
            "Do not publish bodies, audio, artwork or descriptions based on a generic license label.",
        ],
    }


def verify_snapshot(root: Path, snapshot: dict) -> None:
    for name, binding in snapshot["files"].items():
        if sha256((root / name).read_bytes()) != binding["sha256"]:
            raise ValueError(f"Input changed during audit: {name}")
    if git_head(root) != snapshot["commit"]:
        raise ValueError("Input commit changed during audit")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-root", required=True, type=Path)
    parser.add_argument("--data-root", required=True, type=Path)
    parser.add_argument("--output", type=Path, help="Write a new report; never overwrite an existing file")
    args = parser.parse_args()
    try:
        app_root, data_root = args.app_root.resolve(strict=True), args.data_root.resolve(strict=True)
        if args.output:
            output = args.output.resolve()
            if output in {base / name for base in (app_root, data_root) for name in FILES}:
                raise ValueError("Output must not be a catalogue input")
        app, data = load_snapshot(app_root), load_snapshot(data_root)
        report = compare_snapshots(app, data)
        report["observedAtUTC"] = datetime.now(timezone.utc).isoformat()
        report["toolSha256"] = sha256(Path(__file__).read_bytes())
        verify_snapshot(app_root, app)
        verify_snapshot(data_root, data)
        encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            with output.open("x", encoding="utf-8", newline="\n") as stream:
                stream.write(encoded)
            print(json.dumps({"status": report["status"], "sharedEpisodes": report["podcastEpisodes"]["sharedUniqueIds"], "sharedLibraryTitles": report["libraryTitles"]["sharedUniqueIds"]}))
        else:
            print(encoded, end="")
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        # Never print raw parser payloads or source URLs.
        parser.exit(2, f"Audit aborted: {type(error).__name__}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
