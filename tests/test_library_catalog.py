import xml.etree.ElementTree as ET
import json
import unittest

import aggregate_libraries


ATOM_ENTRY = """
<entry xmlns="http://www.w3.org/2005/Atom"
       xmlns:dcterms="http://purl.org/dc/terms/">
  <id>urn:wrn:test:mutual-aid</id>
  <title>Mutual Aid</title>
  <author><name>Peter Kropotkin</name></author>
  <category term="anarchism" label="Anarchism" />
  <dcterms:language>en-US</dcterms:language>
  <updated>2026-08-04T08:00:00Z</updated>
  <link rel="alternate" type="text/html" href="/library/mutual-aid" />
  <link rel="http://opds-spec.org/acquisition/open-access"
        type="application/pdf" href="/downloads/mutual-aid.pdf" />
  <link rel="http://opds-spec.org/acquisition/open-access"
        type="application/epub+zip" href="/downloads/mutual-aid.epub" />
</entry>
"""


class LibraryCatalogueTest(unittest.TestCase):
    def test_opds_entry_keeps_read_and_download_links(self):
        source = {
            "id": "fixture-library",
            "name": "Fixture Library",
            "languages": ["en"],
        }
        item = aggregate_libraries.parse_entry(
            ET.fromstring(ATOM_ENTRY),
            source,
            "https://library.example/opds/new",
        )

        self.assertEqual(item["title"], "Mutual Aid")
        self.assertEqual(item["authors"], ["Peter Kropotkin"])
        self.assertEqual(item["languages"], ["en"])
        self.assertEqual(item["topics"], ["Anarchism"])
        self.assertEqual(item["readUrl"], "https://library.example/library/mutual-aid")
        self.assertEqual(item["downloads"], {
            "pdf": "https://library.example/downloads/mutual-aid.pdf",
            "epub": "https://library.example/downloads/mutual-aid.epub",
        })
        self.assertEqual(item["formats"], ["html", "pdf", "epub"])

    def test_catalog_rejects_unsafe_urls_and_cross_host_pagination(self):
        self.assertEqual(aggregate_libraries.safe_http_url("javascript:alert(1)"), "")
        self.assertTrue(aggregate_libraries.same_host(
            "https://library.example/opds",
            "https://library.example/opds?page=2",
        ))
        self.assertFalse(aggregate_libraries.same_host(
            "https://library.example/opds",
            "https://tracker.example/opds?page=2",
        ))

    def test_english_catalog_uses_the_full_main_catalog_endpoint(self):
        sources = json.loads(aggregate_libraries.SOURCE_PATH.read_text(encoding="utf-8"))
        english = next(item for item in sources if item["id"] == "anarchist-library-en")
        self.assertEqual(
            english["opdsUrl"],
            "https://theanarchistlibrary.org/opds",
        )
