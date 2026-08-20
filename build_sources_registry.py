#!/usr/bin/env python3
"""Build one declarative registry from static and dynamically merged sources."""

from __future__ import annotations

import ast
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "sources-registry.json"

JSON_INPUTS = (
    "multilingual-source-registry.json",
    "source-catalog.json",
    "podcast-sources.json",
    "radio-sources.json",
)

NAME_FIELDS = (
    "name",
    "sourceName",
    "title",
    "station",
    "label",
    "podcast",
)

URL_FIELDS = (
    "feedUrl",
    "url",
    "feed",
    "rss",
    "streamUrl",
    "stream_url",
    "homepage",
    "website",
    "pageUrl",
)

LANGUAGE_FIELDS = (
    "languages",
    "language",
    "lang",
    "sprache",
    "locale",
)

GEOGRAPHY_BY_CODE = {
    "AR": ("Argentina", "South America"),
    "AT": ("Austria", "Europe"),
    "AU": ("Australia", "Oceania"),
    "BE": ("Belgium", "Europe"),
    "BR": ("Brazil", "South America"),
    "BY": ("Belarus", "Europe"),
    "CA": ("Canada", "North America"),
    "CH": ("Switzerland", "Europe"),
    "CL": ("Chile", "South America"),
    "CN": ("China", "East Asia"),
    "CO": ("Colombia", "South America"),
    "CZ": ("Czechia", "Europe"),
    "DE": ("Germany", "Europe"),
    "DK": ("Denmark", "Europe"),
    "EC": ("Ecuador", "South America"),
    "ES": ("Spain", "Europe"),
    "FI": ("Finland", "Europe"),
    "FR": ("France", "Europe"),
    "GB": ("United Kingdom", "Europe"),
    "GR": ("Greece", "Europe"),
    "ID": ("Indonesia", "Southeast Asia"),
    "IE": ("Ireland", "Europe"),
    "IN": ("India", "South Asia"),
    "IT": ("Italy", "Europe"),
    "JP": ("Japan", "East Asia"),
    "KE": ("Kenya", "East Africa"),
    "MX": ("Mexico", "North America"),
    "NL": ("Netherlands", "Europe"),
    "NO": ("Norway", "Europe"),
    "NZ": ("New Zealand", "Oceania"),
    "PE": ("Peru", "South America"),
    "PL": ("Poland", "Europe"),
    "PT": ("Portugal", "Europe"),
    "RU": ("Russia", "Eastern Europe"),
    "SE": ("Sweden", "Europe"),
    "SI": ("Slovenia", "Europe"),
    "TR": ("Türkiye", "Türkiye"),
    "UA": ("Ukraine", "Eastern Europe"),
    "US": ("United States", "North America"),
    "UY": ("Uruguay", "South America"),
    "VE": ("Venezuela", "South America"),
    "ZA": ("South Africa", "Southern Africa"),
}

GEOGRAPHY_NAME_MARKERS = (
    ("AR", ("argentina", " buenos aires", "anred")),
    ("AT", ("austria", "osterreich", "österreich", "vienna", "wien")),
    ("AU", ("australia", "melbourne", "sydney")),
    ("BE", ("belgium", "belgique", "brussels", "bruxelles")),
    ("BR", ("brazil", "brasil", "agência pública", "agencia publica")),
    ("BY", ("belarus",)),
    ("CA", ("canada", "montreal", "montréal", "toronto")),
    ("CH", ("switzerland", "schweiz", "suisse", "zurich", "zürich")),
    ("CL", ("chile", "santiago de chile")),
    ("CN", ("china", "chuang")),
    ("CO", ("colombia",)),
    ("CZ", ("czech", "praha", "prague")),
    ("DE", ("germany", "deutschland", "berlin", "hamburg", "leipzig")),
    ("DK", ("denmark", "danmark", "copenhagen")),
    ("EC", ("ecuador",)),
    ("ES", ("spain", "spanien", "españa", "barcelona", "madrid", "catalunya")),
    ("FI", ("finland", "helsinki")),
    ("FR", ("france", "paris", "marseille", "lyon", "montpellier", "rouen")),
    ("GB", ("united kingdom", "britain", " uk)", "london", "bristol")),
    ("GR", ("greece", "greek", "athens", "athina", " gr)")),
    ("ID", ("indonesia", "jakarta", "palang hitam")),
    ("IE", ("ireland", "dublin")),
    ("IN", ("india", "mumbai", "delhi")),
    ("IT", ("italy", "italia", "milan", "milano", "rome", "roma", "turin", "torino")),
    ("JP", ("japan", "tokyo")),
    ("KE", ("kenya", "nairobi")),
    ("MX", ("mexico", "méxico", "chiapas", "ezln")),
    ("NL", ("netherlands", "nederland", "amsterdam")),
    ("NO", ("norway", "oslo")),
    ("NZ", ("new zealand", "aotearoa")),
    ("PE", ("peru", "lima")),
    ("PL", ("poland", "polska", "warsaw", "warszawa")),
    ("PT", ("portugal", "lisbon", "lisboa")),
    ("RU", ("russia", "russian", "moscow")),
    ("SE", ("sweden", "stockholm")),
    ("SI", ("slovenia", "ljubljana")),
    ("TR", ("turkey", "türkiye", "istanbul", "bianet", "evrensel")),
    ("UA", ("ukraine", "kyiv", "kiev")),
    ("US", ("united states", " usa", " u.s.", "new york", "portland", "seattle")),
    ("UY", ("uruguay", "montevideo")),
    ("VE", ("venezuela",)),
    ("ZA", ("south africa", "johannesburg", "cape town")),
)

COUNTRY_CODE_BY_TLD = {
    "ar": "AR", "at": "AT", "au": "AU", "be": "BE", "br": "BR",
    "by": "BY", "ca": "CA", "ch": "CH", "cl": "CL", "cn": "CN",
    "co": "CO", "cz": "CZ", "de": "DE", "dk": "DK", "ec": "EC",
    "es": "ES", "fi": "FI", "fr": "FR", "gr": "GR", "id": "ID",
    "ie": "IE", "in": "IN", "it": "IT", "jp": "JP", "ke": "KE",
    "mx": "MX", "nl": "NL", "no": "NO", "nz": "NZ", "pe": "PE",
    "pl": "PL", "pt": "PT", "ru": "RU", "se": "SE", "si": "SI",
    "tr": "TR", "ua": "UA", "uk": "GB", "us": "US", "uy": "UY",
    "ve": "VE", "za": "ZA",
}


def read_json(path: Path, fallback: Any) -> Any:
    if not path.is_file():
        return fallback

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def canonical_url(value: Any) -> str:
    raw = str(value or "").strip()

    if not raw:
        return ""

    try:
        parsed = urlsplit(raw)
    except ValueError:
        return raw.lower().rstrip("/")

    host = (parsed.hostname or "").lower()

    if host.startswith("www."):
        host = host[4:]

    path = re.sub(r"/+", "/", parsed.path or "/")

    if path != "/":
        path = path.rstrip("/")

    return urlunsplit(
        (
            parsed.scheme.lower(),
            host,
            path,
            parsed.query,
            "",
        )
    )


def as_languages(value: Any) -> list[str]:
    if isinstance(value, str):
        values = re.split(r"[,;\s]+", value)
    elif isinstance(value, list):
        values = value
    else:
        values = []

    result: list[str] = []

    aliases = {
        "english": "en",
        "deutsch": "de",
        "german": "de",
        "español": "es",
        "spanish": "es",
        "français": "fr",
        "french": "fr",
        "italiano": "it",
        "italian": "it",
        "português": "pt",
        "portuguese": "pt",
        "русский": "ru",
        "russian": "ru",
        "ελληνικά": "el",
        "greek": "el",
        "türkçe": "tr",
        "turkish": "tr",
        "kurdî": "ku",
        "kurdi": "ku",
        "kurdish": "ku",
    }

    for item in values:
        raw = str(item or "").strip().lower()

        if not raw:
            continue

        language = aliases.get(
            raw,
            raw,
        )

        language = re.split(r"[-_]", language)[0]

        if re.fullmatch(r"[a-z]{2,3}", language):
            if language not in result:
                result.append(language)

    return result


def infer_languages(name: str, url: str) -> list[str]:
    haystack = f"{name} {url}".lower()

    rules = (
        ("de", (
            ".de/", ".de ", "deutsch", "germany",
            "deutschland", "graswurzel", "fau-",
        )),
        ("es", (
            ".es/", ".org.ar", "argentina", "méxico",
            "mexico", "españ", "spanish", "chile",
            "colombia", "subversiones", "anred",
        )),
        ("fr", (
            ".fr/", "france", "français", "paris",
            "marseille", "rebellyon", "lundi",
        )),
        ("it", (
            ".it/", "italia", "italiano",
        )),
        ("pt", (
            ".pt/", ".br/", "brasil", "brazil",
            "agência", "agencia publica", "pública",
        )),
        ("ru", (
            ".ru/", "russia", "russian", "avtonom",
        )),
        ("el", (
            ".gr/", "greece", "greek", "omniatv",
            "alerta gr",
        )),
        ("tr", (
            ".tr/", "turkey", "türkiye", "turkish", "türkçe",
        )),
        ("ku", (
            "kurdî", "kurdish", "/kurdi",
            "pressin",
        )),
        ("pl", (
            ".pl/", "poland", "polska", "federacja",
        )),
        ("id", (
            ".id/", "indonesia", "palang hitam",
        )),
        ("zh", (
            ".cn/", "china", "chinese", "chuang",
        )),
        ("ca", (
            ".cat/", "catalunya", "catalan",
        )),
    )

    result = [
        language
        for language, markers in rules
        if any(marker in haystack for marker in markers)
    ]

    return result


def inferred_geography(
    name: str,
    url: str,
    *,
    origin: str,
    inherited_category: str,
) -> tuple[str, str, str, str]:
    """Infer source geography conservatively and keep its provenance."""
    haystack = f" {name} ".casefold()

    abbreviation = re.search(r"\(([A-Za-z]{2})\)\s*$", name)
    if abbreviation:
        code = abbreviation.group(1).upper()
        code = {"UK": "GB"}.get(code, code)
        if code in GEOGRAPHY_BY_CODE:
            country, region = GEOGRAPHY_BY_CODE[code]
            return region, country, code, "inferred:name"

    for code, markers in GEOGRAPHY_NAME_MARKERS:
        if any(marker.casefold() in haystack for marker in markers):
            country, region = GEOGRAPHY_BY_CODE[code]
            return region, country, code, "inferred:name"

    try:
        host = (urlsplit(url).hostname or "").lower()
    except ValueError:
        host = ""

    tld = host.rsplit(".", 1)[-1] if "." in host else ""
    code = COUNTRY_CODE_BY_TLD.get(tld, "")

    if code:
        country, region = GEOGRAPHY_BY_CODE[code]
        return region, country, code, "inferred:country-domain"

    regional_categories = {
        "Africa": "Africa",
        "Asia": "Asia",
        "Australia & NZ": "Oceania",
        "Europe": "Europe",
        "Latin America": "Latin America",
        "Middle East": "Middle East",
        "North America": "North America",
    }
    region = regional_categories.get(inherited_category, "")

    if region and origin in {
        "aggregate.py",
        "multilingual-source-registry.json",
    }:
        return region, "", "", "inferred:registry-section"

    return "", "", "", "unknown"


def geography_metadata(
    item: dict[str, Any],
    *,
    name: str,
    url: str,
    origin: str,
    inherited_category: str,
) -> tuple[str, str, str, str]:
    region = first_geographic_value(
        item,
        ("originRegion", "geographicRegion", "region"),
    )
    country = first_geographic_value(
        item,
        ("originCountry", "country"),
    )
    code = first_geographic_value(
        item,
        ("originCountryCode", "countryCode"),
    ).upper()

    if region or country or code:
        if code in GEOGRAPHY_BY_CODE:
            inferred_country, inferred_region = GEOGRAPHY_BY_CODE[code]
            country = country or inferred_country
            region = region or inferred_region
        return region, country, code, "explicit"

    return inferred_geography(
        name,
        url,
        origin=origin,
        inherited_category=inherited_category,
    )


def first_value(
    item: dict[str, Any],
    fields: tuple[str, ...],
) -> str:
    for field in fields:
        value = item.get(field)

        if value not in (None, "", [], {}):
            return str(value).strip()

    return ""


def first_geographic_value(
    item: dict[str, Any],
    fields: tuple[str, ...],
) -> str:
    for field in fields:
        value = item.get(field)

        if value not in (None, "", [], {}):
            return str(value).strip()

    return ""


def extract_languages(
    item: dict[str, Any],
    *,
    name: str,
    url: str,
) -> tuple[list[str], str]:
    for field in LANGUAGE_FIELDS:
        if field not in item:
            continue

        languages = as_languages(item.get(field))

        if languages:
            return languages, "explicit"

    inferred = infer_languages(name, url)

    if inferred:
        return inferred, "inferred"

    return ["und"], "unknown"


def extract_categories(
    item: dict[str, Any],
    inherited: str = "",
) -> list[str]:
    value = item.get(
        "categories",
        item.get("category", []),
    )

    if isinstance(value, str):
        values = [value]
    elif isinstance(value, list):
        values = value
    else:
        values = []

    if inherited:
        values.append(inherited)

    result: list[str] = []

    for category in values:
        clean = str(category or "").strip()

        if clean and clean not in result:
            result.append(clean)

    return result


def is_source_like(item: dict[str, Any]) -> bool:
    return bool(
        first_value(item, NAME_FIELDS)
        and first_value(item, URL_FIELDS)
    )


def flatten_json(
    data: Any,
    *,
    origin: str,
    inherited_category: str = "",
) -> list[tuple[dict[str, Any], str, str]]:
    rows: list[tuple[dict[str, Any], str, str]] = []

    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                if is_source_like(item):
                    rows.append(
                        (item, origin, inherited_category)
                    )
                else:
                    rows.extend(
                        flatten_json(
                            item,
                            origin=origin,
                            inherited_category=(
                                inherited_category
                            ),
                        )
                    )

    elif isinstance(data, dict):
        if is_source_like(data):
            rows.append((data, origin, inherited_category))
        else:
            for key, value in data.items():
                category = inherited_category

                if isinstance(value, list):
                    category = str(key)

                rows.extend(
                    flatten_json(
                        value,
                        origin=origin,
                        inherited_category=category,
                    )
                )

    return rows


def extract_aggregate_rows() -> list[
    tuple[dict[str, Any], str, str]
]:
    path = ROOT / "aggregate.py"

    if not path.is_file():
        return []

    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(path))
    rows: list[tuple[dict[str, Any], str, str]] = []

    for node in tree.body:
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue

        value_node = node.value

        if value_node is None:
            continue

        try:
            value = ast.literal_eval(value_node)
        except Exception:
            continue

        rows.extend(
            flatten_json(
                value,
                origin="aggregate.py",
            )
        )

    return rows


def normalize_record(
    item: dict[str, Any],
    *,
    origin: str,
    inherited_category: str,
) -> dict[str, Any] | None:
    name = first_value(item, NAME_FIELDS)
    url = first_value(item, URL_FIELDS)

    if not name or not url:
        return None

    languages, language_source = extract_languages(
        item,
        name=name,
        url=url,
    )
    (
        origin_region,
        origin_country,
        origin_country_code,
        geography_source,
    ) = geography_metadata(
        item,
        name=name,
        url=url,
        origin=origin,
        inherited_category=inherited_category,
    )

    status = str(item.get("status", "active")).lower()

    active = status not in {
        "archived",
        "disabled",
        "inactive",
        "removed",
    }

    media_type = str(
        item.get(
            "kind",
            item.get(
                "mediaType",
                (
                    "radio"
                    if "stream" in " ".join(item.keys()).lower()
                    else (
                        "podcast"
                        if "podcast" in origin
                        else "news"
                    )
                ),
            ),
        )
    )

    return {
        "name": name,
        "url": url,
        "canonicalUrl": canonical_url(url),
        "homepage": str(
            item.get(
                "homepage",
                item.get("website", ""),
            )
            or ""
        ).strip(),
        "languages": languages,
        "languageSource": language_source,
        "categories": extract_categories(
            item,
            inherited_category,
        ),
        "mediaType": media_type,
        "status": status,
        "active": active,
        "originRegion": origin_region,
        "originCountry": origin_country,
        "originCountryCode": origin_country_code,
        "geographySource": geography_source,
        # Provenance files, not geographic origin.
        "origins": [origin],
    }


def merge_record(
    target: dict[str, Any],
    incoming: dict[str, Any],
) -> None:
    for language in incoming["languages"]:
        if language not in target["languages"]:
            target["languages"].append(language)

    if (
        target["languages"] == ["und"]
        and incoming["languages"] != ["und"]
    ):
        target["languages"] = list(incoming["languages"])
        target["languageSource"] = incoming[
            "languageSource"
        ]

    for category in incoming["categories"]:
        if category not in target["categories"]:
            target["categories"].append(category)

    for origin in incoming["origins"]:
        if origin not in target["origins"]:
            target["origins"].append(origin)

    if not target["homepage"] and incoming["homepage"]:
        target["homepage"] = incoming["homepage"]

    for field in (
        "originRegion",
        "originCountry",
        "originCountryCode",
    ):
        if not target.get(field) and incoming.get(field):
            target[field] = incoming[field]

    geography_rank = {
        "unknown": 0,
        "inferred:registry-section": 1,
        "inferred:country-domain": 2,
        "inferred:name": 3,
        "explicit": 4,
    }
    if geography_rank.get(incoming.get("geographySource"), 0) > geography_rank.get(target.get("geographySource"), 0):
        for field in (
            "originRegion",
            "originCountry",
            "originCountryCode",
            "geographySource",
        ):
            if incoming.get(field):
                target[field] = incoming[field]

    target["active"] = target["active"] or incoming["active"]


def propagate_geography_by_name(
    records: list[dict[str, Any]],
) -> None:
    """Keep geographic metadata on alternate URLs of the same source."""
    geography: dict[str, dict[str, str]] = {}
    geography_rank = {
        "unknown": 0,
        "inferred:registry-section": 1,
        "inferred:country-domain": 2,
        "inferred:name": 3,
        "explicit": 4,
    }

    for record in records:
        key = record["name"].casefold()
        shared = geography.get(key)
        if (
            shared is None
            or geography_rank.get(record.get("geographySource"), 0)
            > geography_rank.get(shared.get("geographySource"), 0)
        ):
            geography[key] = {
                field: record.get(field, "")
                for field in (
                    "originRegion",
                    "originCountry",
                    "originCountryCode",
                    "geographySource",
                )
            }

    for record in records:
        shared = geography.get(record["name"].casefold(), {})

        for field, value in shared.items():
            if value and (
                not record.get(field)
                or field == "geographySource"
            ):
                record[field] = value


def build_registry() -> dict[str, Any]:
    rows = extract_aggregate_rows()

    for filename in JSON_INPUTS:
        path = ROOT / filename

        if not path.is_file():
            continue

        rows.extend(
            flatten_json(
                read_json(path, {}),
                origin=filename,
            )
        )

    merged: dict[str, dict[str, Any]] = {}

    for item, origin, category in rows:
        record = normalize_record(
            item,
            origin=origin,
            inherited_category=category,
        )

        if record is None:
            continue

        key = (
            record["canonicalUrl"]
            or re.sub(
                r"[^a-z0-9]+",
                "",
                record["name"].lower(),
            )
        )

        if key not in merged:
            merged[key] = record
        else:
            merge_record(merged[key], record)

    records = list(merged.values())
    propagate_geography_by_name(records)
    records = sorted(
        records,
        key=lambda item: item["name"].casefold(),
    )

    active = [
        item for item in records
        if item["active"]
    ]

    known_languages = sorted({
        language
        for item in active
        for language in item["languages"]
        if language != "und"
    })

    explicit_geography = sum(
        item.get("geographySource") == "explicit"
        for item in records
    )
    inferred_geography_count = sum(
        str(item.get("geographySource", "")).startswith("inferred:")
        for item in records
    )
    known_geography = sum(
        bool(item.get("originRegion") or item.get("originCountry"))
        for item in records
    )
    known_language_count = sum(
        item.get("languages") != ["und"]
        for item in records
    )

    payload = {
        "schemaVersion": 3,
        "version": "2.1.0",
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
        "sourceCount": len(records),
        "activeSourceCount": len(active),
        "knownLanguages": known_languages,
        "metadataCompleteness": {
            "knownGeography": known_geography,
            "explicitGeography": explicit_geography,
            "inferredGeography": inferred_geography_count,
            "unknownGeography": len(records) - known_geography,
            "knownLanguage": known_language_count,
            "unknownLanguage": len(records) - known_language_count,
        },
        "metadataPolicy": {
            "explicit": "Declared by a source record.",
            "inferred:name": "Derived from an unambiguous country or city marker in the source name.",
            "inferred:country-domain": "Derived from the source country's top-level domain.",
            "inferred:registry-section": "Derived from a geographic section in the maintained source registry.",
            "unknown": "No defensible source-origin metadata is available.",
        },
        "provenanceFiles": [
            "aggregate.py",
            *JSON_INPUTS,
        ],
        "sources": records,
    }

    OUTPUT.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    return payload


def main() -> int:
    payload = build_registry()
    print(
        json.dumps(
            {
                "sourceCount": payload["sourceCount"],
                "activeSourceCount":
                    payload["activeSourceCount"],
                "knownLanguages":
                    payload["knownLanguages"],
                "metadataCompleteness":
                    payload["metadataCompleteness"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    if payload["activeSourceCount"] == 0:
        print("FEHLER: Keine aktiven Quellen erkannt.")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
