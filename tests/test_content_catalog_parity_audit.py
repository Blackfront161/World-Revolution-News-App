"""Offline regression checks for ambiguous IDs, restrictions and identity boundaries."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("content_catalog_audit", ROOT / "scripts/audit_content_catalog_parity.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class ContentCatalogueAuditTest(unittest.TestCase):
    def test_malformed_id_values_remain_findings_and_cannot_leak_payloads(self):
        sources = [{"id": {"body": "PRIVATE"}, "name": "Radio"}]
        episodes = [{"id": {"audioUrl": "PRIVATE"}, "sourceId": [], "sourceName": "Radio"}]
        comparison = AUDIT.compare_rows(sources, [], AUDIT.SOURCE_FIELDS)
        self.assertEqual(comparison["appIdFindings"]["missingOrInvalidIdRows"], [0])
        self.assertEqual(comparison["idsOnlyInApp"], [])
        result = AUDIT.podcast_findings(sources, episodes)
        self.assertIsNone(result["episodesWithoutResolvableSource"][0]["episodeId"])
        self.assertNotIn("PRIVATE", json.dumps((comparison, result)))

    def test_duplicate_source_ids_never_resolve_an_episode_arbitrarily(self):
        result = AUDIT.podcast_findings([{"id": "radio", "name": "A"}, {"id": "radio", "name": "B"}], [{"id": "saved-1", "sourceId": "radio", "sourceName": "A"}])
        self.assertEqual(result["episodesWithoutResolvableSource"][0]["reason"], "unresolved_or_duplicate_source_id")
        self.assertEqual(result["episodesWithoutResolvableSource"][0]["possibleExistingSourceIds"], [])
        comparison = AUDIT.compare_rows([{"id": "same"}, {"id": "same"}], [{"id": "same"}], ("name",))
        self.assertEqual(comparison["sharedUniqueIds"], 0)
        self.assertEqual(comparison["appIdFindings"]["duplicateIds"], ["same"])

    def test_same_origin_keeps_both_possible_sources_and_metadata_restriction(self):
        sources = [{"id": "one", "homepage": "https://radio.example/one"}, {"id": "two", "homepage": "https://radio.example/two"}, {"name": "Archive", "homepage": "https://radio.example/", "contentPolicy": "metadata_and_links_only"}]
        episodes = [{"id": "old-saved-id", "sourceName": "Archive"}]
        before = json.dumps((sources, episodes), sort_keys=True)
        result = AUDIT.podcast_findings(sources, episodes)
        self.assertEqual(result["sourcesWithoutId"][0]["possibleExistingSourceIds"], ["one", "two"])
        self.assertTrue(result["sourcesWithoutId"][0]["restrictedMetadataOnly"])
        unresolved = result["episodesWithoutResolvableSource"][0]
        self.assertEqual(unresolved["episodeId"], "old-saved-id")
        self.assertEqual(unresolved["possibleExistingSourceIds"], ["one", "two"])
        self.assertTrue(unresolved["disposition"].startswith("review_required"))
        self.assertEqual(json.dumps((sources, episodes), sort_keys=True), before)

    def test_disabled_source_episodes_remain_explicitly_excluded(self):
        result = AUDIT.podcast_findings([{"id": "postponed", "enabled": False}], [{"id": "archive", "sourceId": "postponed"}])
        self.assertEqual(result["episodesFromExplicitlyDisabledSource"], [{"episodeId": "archive", "sourceId": "postponed", "disposition": "exclude_from_active_intake_retention_requires_review"}])

    def test_incoming_data_does_not_override_explicit_app_disabled_policy(self):
        def snapshot(sources, episodes):
            rows = {name: [] if name in AUDIT.ARRAY_FILES else {} for name in AUDIT.FILES}
            rows['podcast-sources.json'] = sources
            rows['podcasts.json'] = episodes
            return {"commit": "fixed", "inputKind": "fixture", "files": {}, "rows": rows}
        app = snapshot([{"id": "postponed", "enabled": False}], [])
        data = snapshot([{"id": "postponed"}], [{"id": "incoming-saved-id", "sourceId": "postponed"}])
        result = AUDIT.compare_snapshots(app, data)
        self.assertEqual(result["dataEpisodesBlockedByExplicitAppPolicy"], [{"episodeId": "incoming-saved-id", "sourceId": "postponed", "disposition": "app_policy_blocks_activation_even_if_data_contains_record"}])
        self.assertEqual(data['rows']['podcasts.json'][0]['id'], "incoming-saved-id")

    def test_original_link_identity_preserves_path_case_queries_and_credentials_boundary(self):
        self.assertEqual(AUDIT.https_identity("https://BOOKS.example:443/Text?a=1#chapter"), "https://books.example/Text?a=1")
        for url in ("http://books.example/Text", "https://user:secret@books.example/Text", "javascript:alert(1)", "https://books.example:bad/Text"):
            self.assertEqual(AUDIT.https_identity(url), "")
        left = [{"id": "edition-a", "readUrl": "https://books.example/Text?a=1#one"}]
        self.assertEqual(AUDIT.possible_book_aliases(left, [{"id": "edition-b", "readUrl": "https://books.example/text?a=1"}]), [])
        self.assertEqual(AUDIT.possible_book_aliases(left, [{"id": "edition-b", "readUrl": "https://books.example/Text?a=2"}]), [])
        matches = AUDIT.possible_book_aliases(left, [{"id": "edition-b", "readUrl": "https://books.example/Text?a=1#two"}])
        self.assertEqual(len(matches), 1)
        self.assertNotIn("https://", json.dumps(matches))
        self.assertTrue(matches[0]["disposition"].startswith("review_"))

    def test_shared_id_conflict_is_reported_without_copying_bodies_or_media_urls(self):
        comparison = AUDIT.compare_rows([{"id": "same", "language": "de", "audioUrl": "https://a.example/private?token=x", "body": "DO NOT COPY"}], [{"id": "same", "language": "en", "audioUrl": "https://b.example/audio"}], AUDIT.EPISODE_FIELDS)
        self.assertEqual(comparison["sharedIdFieldChanges"], [{"id": "same", "fields": ["audioUrl", "language"]}])
        self.assertNotIn("DO NOT COPY", json.dumps(comparison))
        self.assertNotIn("token=x", json.dumps(comparison))

    def test_changed_input_and_invalid_shapes_abort_instead_of_emitting_valid_report(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in AUDIT.FILES:
                (root / name).write_text("[]" if name in AUDIT.ARRAY_FILES else "{}", encoding="utf-8")
            with patch.object(AUDIT, "git_head", return_value="fixed"):
                snapshot = AUDIT.load_snapshot(root)
                (root / "podcasts.json").write_text('[{"id":"changed"}]', encoding="utf-8")
                with self.assertRaisesRegex(ValueError, "Input changed"):
                    AUDIT.verify_snapshot(root, snapshot)
                (root / "podcasts.json").write_text('{}', encoding="utf-8")
                with self.assertRaisesRegex(ValueError, "expected an array"):
                    AUDIT.load_snapshot(root)

    def test_cli_refuses_to_overwrite_any_existing_report_or_input(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in AUDIT.FILES:
                (root / name).write_text("[]" if name in AUDIT.ARRAY_FILES else "{}", encoding="utf-8")
            before = {name: (root / name).read_bytes() for name in AUDIT.FILES}
            arguments = [str(AUDIT.__file__), "--app-root", str(root), "--data-root", str(root), "--output", str(root / "podcasts.json")]
            result = subprocess.run([sys.executable, *arguments], capture_output=True, text=True)
            self.assertEqual(result.returncode, 2)
            self.assertEqual({name: (root / name).read_bytes() for name in AUDIT.FILES}, before)
            existing = root / "report.json"
            existing.write_text("KEEP", encoding="utf-8")
            with patch.object(AUDIT, "git_head", return_value="fixed"), patch.object(sys, "argv", ["audit", *arguments[1:-1], str(existing)]):
                with self.assertRaises(SystemExit) as raised:
                    AUDIT.main()
                self.assertEqual(raised.exception.code, 2)
            self.assertEqual(existing.read_text(encoding="utf-8"), "KEEP")


if __name__ == "__main__":
    unittest.main()
