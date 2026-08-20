"""Build a bounded multilingual library search index from approved OPDS catalogues."""

from __future__ import annotations

import hashlib
import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

ROOT = Path(__file__).resolve().parent
SOURCE_PATH = ROOT / "library-sources.json"
FEED_PATH = ROOT / "library-feed.json"
HEALTH_PATH = ROOT / "library-health.json"
TIMEOUT = (8, 25)
MAX_PAGES_PER_SOURCE = max(1, int(os.environ.get("WRN_LIBRARY_MAX_PAGES", "80")))
MAX_ITEMS_PER_SOURCE = max(20, int(os.environ.get("WRN_LIBRARY_MAX_ITEMS", "2000")))
USER_AGENT = "WorldRevolutionNews-LibraryIndexer/1.0 (+https://github.com/Blackfront161/Revolution-News-Data)"
ATOM = "{http://www.w3.org/2005/Atom}"
DC = "{http://purl.org/dc/terms/}"
FORMAT_BY_MIME = {
    "application/pdf": "pdf",
    "application/epub+zip": "epub",
    "application/x-mobipocket-ebook": "mobi",
    "text/html": "html",
    "application/xhtml+xml": "html",
}


def load_json(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return fallback


def atomic_json(path: Path, value) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def clean(value) -> str:
    return " ".join(str(value or "").split()).strip()


def safe_http_url(value, base="") -> str:
    candidate = urljoin(base, clean(value))
    parsed = urlparse(candidate)
    return candidate if parsed.scheme in {"http", "https"} and parsed.netloc else ""


def same_host(first: str, second: str) -> bool:
    return urlparse(first).hostname == urlparse(second).hostname


def entry_text(entry, tag: str) -> str:
    node = entry.find(f"{ATOM}{tag}")
    return clean("".join(node.itertext())) if node is not None else ""


def entry_languages(entry, default_languages) -> list[str]:
    values = [
        clean(node.text).lower().split("-")[0]
        for node in entry.findall(f"{DC}language")
        if clean(node.text)
    ]
    return list(dict.fromkeys(values or default_languages or ["und"]))


def parse_entry(entry, source, page_url: str):
    title = entry_text(entry, "title")
    if not title:
        return None
    authors = [
        entry_text(author, "name")
        for author in entry.findall(f"{ATOM}author")
    ]
    authors = [value for value in authors if value]
    topics = [
        clean(category.get("label") or category.get("term"))
        for category in entry.findall(f"{ATOM}category")
    ]
    topics = list(dict.fromkeys(value for value in topics if value))
    downloads = {}
    read_url = ""
    formats = []
    for link in entry.findall(f"{ATOM}link"):
        href = safe_http_url(link.get("href"), page_url)
        if not href:
            continue
        mime = clean(link.get("type")).lower().split(";")[0]
        relation = clean(link.get("rel")).lower()
        format_name = FORMAT_BY_MIME.get(mime)
        if format_name:
            formats.append(format_name)
        if format_name and "acquisition" in relation:
            downloads.setdefault(format_name, href)
        if not read_url and (format_name == "html" or relation == "alternate"):
            read_url = href
    if not read_url:
        read_url = downloads.get("html", "")
    if not read_url and not downloads:
        return None
    raw_id = entry_text(entry, "id") or read_url or f"{source['id']}:{title}:{','.join(authors)}"
    item_id = hashlib.sha256(raw_id.encode("utf-8")).hexdigest()[:24]
    return {
        "id": f"{source['id']}-{item_id}",
        "sourceId": source["id"],
        "sourceName": source["name"],
        "title": title,
        "authors": authors,
        "languages": entry_languages(entry, source.get("languages", [])),
        "topics": topics[:20],
        "formats": list(dict.fromkeys(formats)),
        "readUrl": read_url,
        "downloads": downloads,
        "updatedAt": entry_text(entry, "updated") or entry_text(entry, "published"),
    }


def fetch_source(session, source: dict):
    import requests

    start_url = safe_http_url(source.get("opdsUrl"))
    if not start_url:
        return [], {"ok": True, "status": "catalog-link-only", "pages": 0, "items": 0}
    queue = deque([start_url])
    visited = set()
    items = {}
    errors = []
    while queue and len(visited) < MAX_PAGES_PER_SOURCE and len(items) < MAX_ITEMS_PER_SOURCE:
        url = queue.popleft()
        if url in visited or not same_host(start_url, url):
            continue
        visited.add(url)
        try:
            response = session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            root = ET.fromstring(response.content)
        except (requests.RequestException, ET.ParseError) as error:
            errors.append(f"{url}: {type(error).__name__}")
            continue
        for entry in root.findall(f"{ATOM}entry"):
            parsed = parse_entry(entry, source, url)
            if parsed:
                items.setdefault(parsed["id"], parsed)
                if len(items) >= MAX_ITEMS_PER_SOURCE:
                    break
            # OPDS roots expose the useful "New" and "Titles" acquisition
            # feeds as entries. Author/topic navigation is intentionally not
            # crawled because it would repeatedly index the same texts.
            for link in entry.findall(f"{ATOM}link"):
                relation = clean(link.get("rel")).lower()
                mime = clean(link.get("type")).lower()
                if "atom+xml" not in mime:
                    continue
                if relation != "http://opds-spec.org/sort/new" and "kind=acquisition" not in mime:
                    continue
                candidate = safe_http_url(link.get("href"), url)
                if candidate and candidate not in visited and same_host(start_url, candidate):
                    queue.append(candidate)
        for link in root.findall(f"{ATOM}link"):
            relation = clean(link.get("rel")).lower()
            mime = clean(link.get("type")).lower()
            if relation not in {"next", "subsection", "http://opds-spec.org/sort/new"}:
                continue
            if mime and "atom+xml" not in mime:
                continue
            candidate = safe_http_url(link.get("href"), url)
            if candidate and candidate not in visited and same_host(start_url, candidate):
                queue.append(candidate)
    status = {
        "ok": bool(items),
        "status": "ok" if items else "empty",
        "pages": len(visited),
        "items": len(items),
        "errors": errors[:10],
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }
    return list(items.values()), status


def main() -> int:
    import requests

    sources = load_json(SOURCE_PATH, [])
    previous = load_json(FEED_PATH, [])
    previous_by_source = {}
    for item in previous if isinstance(previous, list) else []:
        if isinstance(item, dict) and item.get("sourceId"):
            previous_by_source.setdefault(item["sourceId"], []).append(item)
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/atom+xml, application/xml;q=0.9"})
    output = []
    health = {}
    for source in sources if isinstance(sources, list) else []:
        if not isinstance(source, dict) or source.get("status") != "active" or not source.get("id"):
            continue
        items, status = fetch_source(session, source)
        if items:
            output.extend(items)
        else:
            preserved = previous_by_source.get(source["id"], [])
            output.extend(preserved)
            status["preservedItems"] = len(preserved)
        health[source["id"]] = status
    output.sort(key=lambda item: (clean(item.get("sourceName")).casefold(), clean(item.get("title")).casefold()))
    atomic_json(FEED_PATH, output)
    atomic_json(HEALTH_PATH, {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "itemCount": len(output),
        "sources": health,
    })
    print(f"Library index: {len(output)} items from {len(health)} sources")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
