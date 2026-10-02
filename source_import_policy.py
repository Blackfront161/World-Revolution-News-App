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
    categories = metadata_categories(feed.get("categories"), continent)
    region = next(value for value in categories if value in REGION_ALIASES.values())
    topic = next(value for value in categories if value in TOPICS)
    # This sentence is WRN-authored. Even an RSS summary may contain a full text.
    return {
        "kontinent": continent,
        "categories": categories,
        "primaryRegion": region,
        "primaryTopic": topic,
        "secondaryTopics": [value for value in categories if value in TOPICS and value != topic],
        "classificationConfidence": 0.4,
        "classificationMethod": "source-metadata-only",
        "editorialReview": True,
        "editorialReviewReasons": ["headline-only metadata record"],
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


def restrict_existing_article(article, source_policies):
    """Apply a newly reviewed restricted source policy to old archive rows too."""
    name = str(article.get("quelleName") or article.get("source") or article.get("sourceName") or "").strip().casefold()
    feeds = [feed for feed in source_policies or []
             if str(feed.get("name") or "").strip().casefold() == name
             and feed.get("status") == "approved" and feed.get("importMode") == "metadata-only"]
    if not feeds:
        return article
    entry = {"title": article.get("title"), "link": article.get("link"),
             "published": article.get("pubDate"), "author": article.get("author")}
    for feed in feeds:
        admitted = metadata_article(feed, entry, article.get("kontinent") or (feed.get("categories") or ["Global"])[0])
        if admitted is not None:
            if article.get("id"):
                admitted["id"] = article["id"]
            return admitted
    # An old external/non-HTTPS link cannot bypass a restricted publisher's host guard.
    return None
