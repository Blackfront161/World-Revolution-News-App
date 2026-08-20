# WRN video data pipeline

The video portal is backed by independent, reviewable data files rather than by a scan inside the app UI.

## Inputs

- `video-sources-registry.json`: approved sources, source aliases, ingest locations, languages, regions, topics, and per-source quotas.
- `video-editorial-seed.json`: individually approved videos that are not supplied by the news feed.
- `news-feed.json`: embedded video candidates from the existing news aggregation.

Adding or disabling a source is a data change in the registry. It does not require a new Android bundle. New sources must still receive an explicit editorial status and must not be enabled solely because their platform or hostname is known.

## Outputs

- `video-feed.json`: normalized and deduplicated items for the app.
- `video-health.json`: totals, metadata gaps, platform/source coverage, duplicate counts, source reachability, original-URL status, embed status, and age classification.

Canonical identifiers use the platform and stable platform ID. This prevents language variants or different URL forms from appearing as separate videos. The generated feed applies a per-source quota before the global limit and balances the remaining source queues round-robin.

## Commands

Build from local data without network checks:

```sh
node scripts/build_video_feed.js
```

Build and check approved source homepages:

```sh
node scripts/build_video_feed.js --check-network
```

Validate the pipeline contract and generated assets:

```sh
node tests/test_video_pipeline.js
python tests/test_video_pipeline_assets.py
```

The scheduled workflow `.github/workflows/update-videos.yml` rebuilds the two outputs every six hours. A failed homepage check is recorded in the health report; it does not silently remove an editorially approved source or its existing videos.

## Metadata contract

Every feed item carries title, description, source, platform, language, region, topic, original URL, canonical ID, and duplicate count. Publication date, duration, thumbnail, subtitle availability, and transcript URL are tracked explicitly; missing values remain visible in the health report rather than being invented.
