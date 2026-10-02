"""Restricted metadata admission; never copy a feed body or publisher media."""
from urllib.parse import urlsplit


REGION_ALIASES = {"Global": "Global", "Europe": "Europe", "Europa": "Europe", "Africa": "Africa", "Afrika": "Africa", "North America": "North America", "Latin America": "Latin America", "Asia": "Asia", "Asien": "Asia", "Australia & NZ": "Australia & NZ"}
TOPICS = {"Labor Struggles", "Antifascism", "Antisexism", "Queer-Feminism", "Antiracism", "No Borders", "Anticapitalism", "Theory & Strategy", "Anticolonialism", "Anti-Imperialism", "Squatting & Housing", "Demonstrations", "Anti-Rep & Prisons", "Cyberactivism", "No War", "Animal Liberation", "Eco-Anarchism", "Indigenous Struggles", "Radical Health & Disability", "Libraries", "Movement News"}


def metadata_categories(categories, continent):
    values = categories if isinstance(categories, list) else []
    result = list(dict.fromkeys(REGION_ALIASES.get(str(value), str(value)) for value in values if value))
    if not set(REGION_ALIASES.values()).intersection(result):
        result.insert(0, REGION_ALIASES.get(str(continent), "Global"))
    if not TOPICS.intersection(result):
        result.append("Movement News")
    return result


def metadata_article(feed, entry, continent):
    """Return a link record for an explicitly restricted source, or reject it."""
    if feed.get("importMode") != "metadata-only":
        raise ValueError("metadata-only admission required")
    link = str(entry.get("link") or "").strip()
    parsed = urlsplit(link)
    home = urlsplit(str(feed.get("homepage") or ""))
    if (parsed.scheme != "https" or parsed.username or parsed.password
            or not home.hostname or parsed.hostname != home.hostname):
        return None
    title = str(entry.get("title") or "").strip()
    if not title:
        return None
    # This sentence is WRN-authored. Even an RSS summary may contain a full text.
    return {
        "kontinent": continent,
        "categories": metadata_categories(feed.get("categories"), continent),
        "quelleName": feed["name"],
        "author": str(entry.get("author") or "Unknown").strip(),
        "title": title,
        "link": link,
        "pubDate": entry.get("published") or entry.get("updated") or "",
        "content": "Überschrift und Originalverweis. Den Beitrag auf der Originalseite lesen.",
        "contentComplete": False,
        "image": "",
        "images": [],
        "language": (feed.get("languages") or ["und"])[0],
        "languages": list(feed.get("languages") or ["und"]),
        "originCountry": feed.get("originCountry", ""),
        "originCountryCode": feed.get("originCountryCode", ""),
        "originRegion": feed.get("originRegion", ""),
        "sourceHomepage": feed.get("homepage", ""),
        "importMode": "metadata-only",
        "rightsReview": feed.get("rightsReview", "unknown"),
    }
