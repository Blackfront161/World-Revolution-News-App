from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_parallel_preview_assets_exist():
    for name in (
        "next.html", "news-app-2.css", "news-app-2.js", "news-app-2-core.js",
        "news-app-2-config.js", "news-app-2-specialty.js", "news-app-2-media.js",
        "news-app-2-release.js", "news-app-2-release.css",
        "news-app-2-release-checklist.html", "news-app-2-release-checklist.css",
        "news-app-2-sw.js", "offline-db.js", "local-diagnostics.js",
        "solinaridao-header-logo.png", "solinaridao-header-logo-transparent.png",
        "solinaridao-header-logo-light-transparent.png",
        "solinaridao-header-mark-filled.png", "solinaridao-world-revolution-news-mask.png",
        "language-origin.js"
    ):
        path = ROOT / name
        assert path.exists(), f"{name} is missing"
        assert path.stat().st_size > 300, f"{name} looks empty"


def test_preview_server_can_be_exposed_to_private_lan():
    server = (ROOT / "scripts" / "serve_news_app_2.js").read_text(encoding="utf-8")
    assert "argumentValue('--host')" in server
    assert "'0.0.0.0'" in server
    assert "Smartphone im gleichen WLAN" in server
    assert "data=snapshot" in server
    assert "mit aktuellen Feeds" in server


def test_release_entry_point_is_news_app_2_and_classic_is_preserved():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    classic = (ROOT / "classic.html").read_text(encoding="utf-8")
    redirect = (ROOT / "next.html").read_text(encoding="utf-8")
    service_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    assert "language-origin.js?release=1" in index
    assert "news-app-2.js?release=48" in index
    assert "news-app-2.css?release=43" in index
    assert "news-app-2-specialty.js?release=3" in index
    assert "stories-core.js?release=3" in index
    assert "app.js" in classic
    assert "classic.html" in index
    assert "index.html" in redirect
    assert "preview=8" in redirect
    assert "target.searchParams.has('preview')" in redirect
    assert "language-origin.js?release=1" in service_worker
    assert "news-app-2.js?release=48" in service_worker
    assert "news-app-2-specialty.js?release=3" in service_worker
    assert "stories-core.js?release=3" in service_worker
    assert "classic.html" in service_worker


def test_release_keeps_card_translation_and_safe_metadata():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    assert "shared-translation-client.js" in html
    assert '<script src="config.js"></script>' not in html
    assert "news-app-2-config.js" in html
    assert 'data-action="translate"' in script
    assert "title_and_text" in script
    assert 'meta name="robots" content="index,follow"' in html
    assert "news-app-2-specialty.js" in html
    assert "news-app-2-media.js" in html
    assert "zine-designer.js" in html
    assert "zine-designer.css" in html
    assert "renderZineSection" in script
    assert "wrn_zine_articles" in script
    assert "next-dialog-zine" in html
    assert "stories-core.js" in html
    assert "lexicon-tab.js" in html
    assert "prisoner-solidarity.js" in html
    assert "isProduction ? './service-worker.js' : './news-app-2-sw.js'" in script
    assert "scope: './'" in script


def test_release_uses_live_feeds_with_packaged_offline_fallback():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    assert "https://blackfront161.github.io" in html
    assert "WRN_PREVIEW_SNAPSHOT_DATA" in config
    assert "WRN_PREVIEW_PARAMETERS.has('preview')" in config
    assert "WRN_RELEASE_CHANNEL === 'production'" in config
    assert "'live-readonly-with-offline-fallback'" in config
    assert "'live-readonly-with-offline-fallback'" in config
    assert "wrnDataUrl('news-feed.json')" in config
    assert "wrnDataUrl('events-feed.json')" in config
    assert "fetchFirstJson([dataMirrors.events, dataUrls.events, 'events-feed.json'])" in script
    assert "fetchMergedJsonArrays(['podcasts.json', dataUrls.podcasts, dataMirrors.podcasts])" in script
    assert "url: 'news-feed.json'" in script
    assert "url: 'news.json'" in script


def test_preview_and_production_offline_caches_are_distinct():
    preview_worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    live_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    assert "wrn-news-app-2-" in preview_worker
    assert "./next.html" in preview_worker
    assert "./index.html?preview=8" in preview_worker
    assert "navigationFirst(request)" in preview_worker
    assert "wrn-app-v2.1.0-r4" in live_worker


def test_specialty_views_are_native_preview_routes():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    for view in ("events", "lexicon", "prisoners", "developments"):
        assert f"render{view.capitalize()}" in script
        assert f"'{view}'" in script
    assert "WRNPrisonerSolidarity190.openWorkshop" in script
    assert "DEVELOPMENT_MATCH_THRESHOLD = 0.72" in script
    assert "developmentClassification" in script
    assert "developmentStrength" in script
    assert "developmentAnalysis" in script
    assert "developmentPerspectivesMarkup" in script
    assert "developmentComparisonMarkup" in script
    assert "comparisonShared" in script
    assert "comparisonDifferent" in script
    assert "development-method-note" not in script
    assert "sourceMix" in script
    assert "assignmentStrength" in script
    assert "strengthExplanation" in script
    assert "EVENT_REGION_BY_COUNTRY" in script
    assert "preferredHomeEvents" in script
    assert 'id="next-event-region"' in script
    assert "development-tag--region" in style
    assert "development-tag--topic" in style
    assert 'data-action="prisoner-section"' in script
    assert "prisonerSourcesMarkup" in script
    assert 'referrerpolicy="no-referrer"' in script
    assert "sortedPrisonerProfiles" in script


def test_default_lists_stay_short_and_source_balanced():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    assert "core.balanceEditorially(state.articles, HOME_COUNT" in script
    assert "core.balanceBySource(chosen, HOME_COUNT, 2)" in script
    assert "allDiscoverResults().slice(0, state.discover.limit)" in script
    assert "last7Days" in script
    assert "last30Days" in script
    assert 'data-action="discover-more"' in script


def test_media_sections_are_native_and_privacy_conscious():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "renderPodcastSection" in script
    assert "renderRadioSection" in script
    assert "renderVideoSection" in script
    assert 'id="global-media-player" preload="none"' in html
    assert "media-player.js" in html
    assert "audio-tools.js" in html
    assert "appendSimpleMediaControls" in script
    assert "podcasts.json" in script
    assert "radio-stations.json" in script
    assert "news-app-2-media.js" in html
    assert "videoPortalCardMarkup" in script
    assert "video-feed.json" in script
    assert "dataUrls.videoFeed" in script
    assert 'data-action="video-play"' in script
    assert "videoPlayerMarkup(item)" in script
    assert 'referrerpolicy="strict-origin-when-cross-origin"' in script
    assert "autoplay" not in script[script.index("function videoPlayerMarkup"):script.index("function mediaDescription")]
    assert "mediaTab('radio-podcasts'" in script
    assert "podcastLibraryControls" in script
    assert 'data-action="media-language"' in script
    assert "radioLimit: 50" in script
    assert "perLanguage: 30" in script


def test_complete_radar_archive_is_loaded_only_inside_events_view():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    assert "eventArchive: wrnDataUrl('events.json')" in config
    assert "ensureAllEventsLoaded" in script
    assert "if (view === 'events') void ensureAllEventsLoaded()" in script
    assert "timeoutMs: 90000" in script
    assert 'data-action="event-more"' in script


def test_menu_briefing_and_responsive_images_are_present():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    assert 'id="next-menu-toggle"' in html
    assert 'id="next-menu-dialog"' in html
    assert 'id="next-briefing-dialog"' in html
    assert "openBriefing" in script
    assert "speakBriefing" in script
    assert "speechSynthesis" in script
    assert ".menu-dialog" in style
    assert ".briefing-dialog" in style
    assert "max-width: 100%" in style
    assert "-1px -1px 0 var(--red)" in style
    menu = html.split('id="next-menu-dialog"', 1)[1].split('</dialog>', 1)[0]
    assert 'data-view-target="home"' not in menu
    assert 'data-view-target=' not in menu
    assert 'id="next-menu-theme"' in menu
    assert 'id="next-menu-font-size"' in menu
    assert 'id="next-menu-density"' in menu
    assert "ensureBriefingTranslations" in script
    assert "requestBriefingTranslation" in script
    assert "attempt < 12 && !window.WRNSharedTranslations?.request" in script
    assert "translationForLanguage(article, state.briefing.language)" in script
    assert "Promise.allSettled(items.slice(0, 5)" in script
    assert "data-briefing-id" in script
    assert "targetLanguage," in script
    assert "hero?.querySelector('h1')" in script
    assert "hero.querySelector('.card-actions')?.before(note)" in script
    assert "<h2>${escapeHtml(t('latest'))}</h2>" in script
    assert "UI_SETTINGS_KEY" in script
    assert "article-classification" in script
    assert ':root[data-theme="light"]' in style
    assert ':root[data-theme="pink"]' in style
    assert '<option value="pink">Pink</option>' in html
    assert ':root[data-font-size="xlarge"]' in style
    assert ".news-card__image img" in style
    assert "object-fit: scale-down" in style
    assert "max-height: 100%" in style
    assert "height: auto;\n    max-width: 100%;\n    max-height: min(60vh, 520px);\n    border-radius: 12px;\n    object-fit: contain;" in style
    assert 'feature-grid feature-grid--compact' in script
    assert '.feature-grid--compact .feature-card' in style
    assert ".briefing-item__copy strong {" in style
    assert ".briefing-item__copy small {" in style
    assert "newsCardTeaser(article, translated, language)" in script
    assert ".briefing-item__copy strong {\n  display: block;\n  overflow: visible;" in style
    assert ".briefing-item__copy small {\n  display: block;\n  overflow: visible;" in style
    assert '<span class="tag data-status' not in script
    assert "linear-gradient(90deg, #050508 0 48%, #ff3158 52% 100%)" in style
    assert "-webkit-text-stroke: .6px #ff3158" in style
    assert ".dialog-actions #next-dialog-translate {" in style
    assert 'id="next-source-choices"' in html
    assert 'id="next-prisoner-choices"' in html
    assert 'id="next-development-choices"' in html
    assert 'id="next-development-review-dialog"' in html
    assert "DEVELOPMENT_REVIEW_KEY" in script
    assert "openDevelopmentReviewQueue" in script
    assert "submitDevelopmentReview" in script
    assert "developmentReviewHistoryMarkup" in script
    assert "transitionDevelopmentReview" in script
    assert ".review-history" in style
    assert ".development-review-callout" in style
    assert 'id="next-preference-language"' in html
    assert "data-source-preference" in script
    assert "prisonerIds" in script
    assert "preferredLanguage" in script
    assert "briefingAmount" in script
    assert "preferenceReasons" in script
    assert ".filter-chips--topics" in style
    assert ".media-section-tabs button.active {\n  border-color: var(--red);\n  background: var(--red);\n  color: #07080a;" in style
    assert ".media-section-tabs button.active span {\n  color: #07080a;" in style


def test_article_tools_and_professional_discovery_are_present():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    for action in ("article-summary", "article-translate", "article-podcast", "article-zine", "article-read", "article-share"):
        assert f'data-action="{action}"' in html
    assert "article-summary-core.js" in html
    assert "article-summary-core.js" in worker
    assert "renderTranslationComparison" in script
    assert "articleLexiconMarkup" in script
    assert 'data-action="article-lexicon"' in script
    assert "applyArticleLexiconMarkup(translated.content)" in script
    assert ".article-lexicon-term" in style
    assert "shareOpenArticle" in script
    assert "toggleRead" in script
    assert "TOPIC_GROUPS" in script
    assert "filter-chips--regions" in style
    assert ".archive-periods" in style
    assert "aspect-ratio: 16 / 9;" in style
    assert "object-fit: contain;" in style
    assert 'sizes="(max-width: 560px) calc(100vw - 28px)' in script


def test_release_header_cards_and_mobile_navigation_are_polished():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    assert 'src="solinaridao-header-mark-filled.png"' in html
    assert 'class="brand__subtitle"><span class="brand__subtitle-text">WORLD REVOLUTION NEWS</span></span>' in html
    assert "./solinaridao-header-mark-filled.png" in worker
    assert "./solinaridao-world-revolution-news-mask.png" in worker
    assert 'mask: url("solinaridao-world-revolution-news-mask.png")' in style
    assert "top: calc(var(--brand-size) * .606061);" in style
    assert "width: calc(var(--brand-size) * .760766);" in style
    assert "linear-gradient(90deg, var(--cyan) 0 50%, var(--red) 50% 100%)" in style
    assert 'id="next-website-link"' in html
    assert 'href="https://solinaridao.com/"' in html
    assert 'id="next-website-dialog"' in html
    assert "ist es auf Spenden angewiesen" in html
    assert "WEBSITE_NOTICE_COPY" in script
    assert "websiteDialog.showModal()" in script
    assert ".website-button" in style
    assert "linear-gradient(135deg, #030306 0 58%, #c90032 58% 100%)" in style
    assert "border: 1px solid #ff3158;" in style
    assert 'class="small-action" type="button" data-action="open"' in script
    assert ".card-actions .translate-card,\n.card-actions .small-action {" in style
    assert "height: calc(68px + env(safe-area-inset-bottom));" in style
    assert "inset: auto 0 0;" in style
    assert "contain: paint;" in style
    assert "transform: translate3d(0, 0, 0);" in style
    assert "will-change: transform;" in style
    assert ".news-card::before {\n    opacity: 1;" in style
    assert "homeServiceMarkup" in script
    assert 'class="home-service-grid"' in script
    assert 'data-view-target="developments"' in script
    assert 'data-action="home-events"' in script
    assert "window.location.protocol === 'file:'" in script
    assert "http://127.0.0.1:8765/next.html?preview=8" in script
    assert "fileModeText" in script
    assert ".file-preview-link" in style


def test_animal_liberation_sources_are_expanded_and_registered():
    import json

    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    registry = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))
    expected = {
        "ARIWA – Animal Rights Watch (Germany)",
        "PETA Deutschland",
        "Animal Equality Deutschland",
        "Tier im Fokus (Switzerland)",
        "L214 (France)",
        "269 Libération Animale (France)",
        "Animal Aid (UK)",
    }
    assert all(name in aggregate for name in expected)
    by_name = {source.get("name"): source for source in registry["sources"]}
    assert expected <= set(by_name)
    for name in expected:
        source = by_name[name]
        assert "Animal Liberation" in source["categories"]
        assert source["url"].startswith("https://")


def test_release_logo_and_donation_flow_match_live_safety():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    logo = (ROOT / "solinaridao-header-logo-light-transparent.png").read_bytes()
    assert logo.startswith(b"\x89PNG\r\n\x1a\n")
    assert len(logo) > 100_000, "header logo looks incomplete"
    assert 'class="red-black-star loading-star"' in html
    assert 'class="red-black-star loading-star article-loading-indicator"' in script
    assert 'id="next-menu-donate"' in html
    assert 'id="next-donation-dialog"' in html
    assert "https://www.paypal.com/ncp/payment/6FSV9FEN4X7VS" in html
    assert 'rel="noopener noreferrer"' in html
    assert 'referrerpolicy="no-referrer"' in html
    assert "donationDialog.showModal()" in script
    assert "donateWarning" in script
    assert ".menu-shell > section > .menu-donate" in style


def test_feedback_dialog_and_bottom_navigation_icons_are_professionalized():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    assert 'id="next-menu-feedback" data-action="feedback-open"' in html
    assert 'id="next-feedback-dialog"' in html
    assert 'id="next-feedback-message" required maxlength="4000"' in html
    assert 'data-action="feedback-copy"' in html
    assert 'data-action="feedback-email"' in html
    assert 'id="next-feedback-submit"' in html
    assert 'id="next-feedback-website"' in html
    assert "feedbackForm.addEventListener('submit'" in script
    assert "submitFeedbackDirectly" in script
    assert "action: 'feedback.submit'" in script
    assert "mailto:worldrevnews@brief.li" in script
    assert "navigator.clipboard?.writeText" in script
    assert ".bottom-nav button span:first-child" in style
    assert "-webkit-text-stroke: 1.15px var(--red);" in style
    assert ".feedback-dialog" in style


def test_active_podcast_playback_is_visibly_and_semantically_marked():
    player = (ROOT / "media-player.js").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    release_style = (ROOT / "news-app-2-release.css").read_text(encoding="utf-8")
    assert "button.classList.toggle('is-playing', active)" in player
    assert "button.setAttribute('aria-pressed', String(active))" in player
    assert "button.classList.toggle('is-playing', activelyPlaying)" in script
    assert '.btn-media-play[aria-pressed="true"]' in release_style
    assert '[data-action="article-podcast-play"][aria-pressed="true"]' in release_style


def test_anarchist_cyberactivism_source_is_registered():
    import json

    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    registry = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))
    expected = {"No Trace Project"}
    assert "https://www.notrace.how/rss.xml" in aggregate
    by_name = {source.get("name"): source for source in registry["sources"]}
    assert expected <= set(by_name)
    for name in expected:
        source = by_name[name]
        assert "Cyberactivism" in source["categories"]
        assert "Anarchism" in source["categories"]
        assert source["url"].startswith("https://")


def test_antifascist_sources_are_global_and_feed_backed():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    expected = {
        "Anti-Fascistische Actie Nederland": "https://afanederland.org/feed/",
        "Anonymous Comrades Collective": "https://accollective.noblogs.org/feed/",
        "Juntas! Brasil": "https://coletivojuntas.com.br/feed/",
        "Worldwide Antifascism Research Network": "https://antifascismresearchnetwork.com/feed/",
        "Slackbastard": "https://slackbastard.anarchobase.com/?feed=rss2",
    }
    for name, url in expected.items():
        assert name in aggregate
        assert url in aggregate
    assert 'cron: "7 */2 * * *"' in (
        ROOT / ".github" / "workflows" / "update-fast.yml"
    ).read_text(encoding="utf-8")


def test_new_libertarian_communist_sources_are_registered_with_metadata():
    import json

    registry = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))
    expected = {
        "Union Communiste Libertaire (FR)": ("fr", "France"),
        "Courant Alternatif / OCL (FR)": ("fr", "France"),
        "Black Flag Sydney": ("en", "Australia"),
        "Coordenação Anarquista Brasileira (CAB)": ("pt", "Brazil"),
    }
    by_name = {source.get("name"): source for source in registry["sources"]}
    assert expected.keys() <= by_name.keys()
    for name, (language, country) in expected.items():
        source = by_name[name]
        assert language in source["languages"]
        assert source["originCountry"] == country
        assert source["url"].startswith("https://")


def test_video_hub_prioritizes_editorial_items_and_hides_platform_noise():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    pipeline = (ROOT / "video-pipeline-core.js").read_text(encoding="utf-8")
    assert "EDITORIAL_TOPICS" in pipeline
    assert "isEditoriallyRelevant" in pipeline
    assert "deduplicateVideos" in pipeline
    assert "balanceVideos" in pipeline
    assert 'class="video-portal-card' in script
    assert 'class="video-filter-panel"' in script
    assert "VIDEO_SECTION_KEYS" in script
    assert "videoWatchLater" in script
    assert ".video-portal-card" in style
    assert ".video-filter-panel" in style


def test_release_candidate_restores_existing_live_capabilities():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    release_style = (ROOT / "news-app-2-release.css").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    helper = (ROOT / "news-app-2-release.js").read_text(encoding="utf-8")
    source_profiles = (ROOT / "source-profiles.js").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    for asset in (
        "source-profiles.js", "source-verification.js", "editorial-review-ui.js",
        "media-player.js", "audio-tools.js", "news-app-2-release.js"
    ):
        assert asset in html
        assert asset in worker
    for feature in (
        "splitTranslationChunks", "READING_POSITIONS_KEY", "discoverAdvancedFiltersMarkup",
        "eventIcs", "EVENT_REMINDERS_KEY", "renderDataControl", "renderSystemStatus",
        "generateCloudPodcast", "reportTranslationProblem"
    ):
        assert feature in script or feature in helper
    assert 'data-action="about"' in html
    assert 'data-action="system-status"' not in html
    assert 'data-action="data-control"' in html
    assert 'class="following-star"' in html
    assert 'id="fb-overlay" hidden' in html
    assert "event.currentTarget.hidden = true" in script
    assert "overlay.hidden = false" in source_profiles
    assert "modal.hidden = true" in source_profiles
    assert "if (overlay) overlay.hidden = true" in source_profiles
    assert ".bottom-nav .following-star" in style
    assert ".menu-shell > .menu-project > button" in style
    assert ".menu-project > button:not(.menu-donate)" in release_style
    assert "color: var(--red);" in release_style
    assert 'value="200"' in html
    assert "unverÃ¤ndert', 'unverändert" in script


def test_hamburger_privacy_is_localized_and_has_a_back_link():
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    privacy = (ROOT / "privacy.html").read_text(encoding="utf-8")
    source_profiles = (ROOT / "source-profiles.js").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    assert "privacy.html?lang=${encodeURIComponent(state.language)}" in script
    assert 'id="privacy-back"' in privacy
    assert "parameters.get('return') === 'preview'" in privacy
    assert "localStorage.getItem(LANGUAGE_KEY)" in privacy
    assert "const PRIVACY_COPY" in privacy
    assert 'data-i18n="providersTitle"' in privacy
    assert 'data-i18n="feedbackTitle"' in privacy
    assert 'data-i18n="retentionTitle"' in privacy
    assert privacy.count("providersTitle:") == 9
    assert privacy.count("feedbackTitle:") == 9
    assert privacy.count("retentionTitle:") == 9
    assert privacy.count("90") >= 19
    for language in ("de", "en", "es", "fr", "it", "pt", "ru", "el", "tr"):
        assert f"        {language}: {{" in privacy
        assert f"        {language}: {{" in source_profiles
    assert "Todos los formatos" in source_profiles
    assert "Tous les formats" in source_profiles
    assert "'./privacy.html'" in worker


def test_release_checklist_is_readable_and_available():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    checklist = (ROOT / "news-app-2-release-checklist.html").read_text(encoding="utf-8")
    style = (ROOT / "news-app-2-release-checklist.css").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    for removed_menu_item in (
        'id="next-menu-status"',
        'id="next-menu-release"',
        'id="next-menu-sources"',
        'id="next-menu-selftest"',
    ):
        assert removed_menu_item not in html
    assert html.count('href="classic.html"') == 1
    assert 'id="next-menu-data"' in html
    assert 'href="news-app-2-release-checklist.html"' not in html
    assert "news-app-2-release-checklist.html" in worker
    assert "news-app-2-release-checklist.css" in worker
    assert "`${CACHE_PREFIX}v86`" in worker
    assert "if (request.mode === 'navigate')" in worker
    assert 'class="release-checklist-page"' in checklist
    assert "Bestanden" in checklist
    assert "Integriert" in checklist
    assert "Build und Bericht ausstehend" in checklist
    assert "Noch vor dem Play-Store-Upload" in checklist
    assert "width: min(1040px, calc(100% - 32px));" in style
    assert "@media (max-width: 720px)" in style
    assert "<table" not in checklist


def test_privacy_first_diagnostics_offline_fallback_and_opt_in_notifications():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    diagnostics = (ROOT / "local-diagnostics.js").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    assert html.index("offline-db.js") < html.index("news-app-2.js")
    assert html.index("local-diagnostics.js") < html.index("news-app-2.js")
    assert 'id="next-menu-notifications"' in html
    assert "MAX_RECORDS = 30" in diagnostics
    assert "URLs and email addresses removed" in diagnostics
    assert "fetch(" not in diagnostics
    assert "sendBeacon" not in diagnostics
    assert "news-app-2-saved-articles" in script
    assert "news-app-2-news" in script
    assert "indexeddb-cache" in script
    assert "Notification.requestPermission()" in script
    assert "configuredPushPublicKey" in script
    assert "self.addEventListener('push'" in worker
    assert "self.addEventListener('notificationclick'" in worker
    assert "connectPushSubscription" in script
    assert "subscription.toJSON()" in script
    assert "enabled: true" in config
    assert "?action=push.config" in config
    assert "?action=push.subscribe" in config
    assert "regions: [...new Set(state.preferences.regions || [])]" in script
    assert "topics: [...new Set(state.preferences.topics || [])]" in script


def test_podcast_archive_quotas_are_independent_before_ui_limits():
    aggregate = (ROOT / "aggregate_podcasts.py").read_text(encoding="utf-8")
    media = (ROOT / "news-app-2-media.js").read_text(encoding="utf-8")
    assert "MAX_RADIO_ARCHIVE = 600" in aggregate
    assert "MAX_INDEPENDENT_ARCHIVE_PER_LANGUAGE = 240" in aggregate
    assert "def partitioned_catalog" in aggregate
    assert "items[:MAX_TOTAL]" not in aggregate
    assert "radioLimit) || 50" in media
    assert "perLanguage) || 30" in media


def test_separate_multilingual_library_catalogue_is_available():
    import json

    script = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    sources = json.loads((ROOT / "library-sources.json").read_text(encoding="utf-8"))
    assert len(sources) >= 8
    assert len({language for source in sources for language in source.get("languages", [])}) >= 5
    assert "renderLibrary" in script
    assert "t('library'), t('libraryText'), 'library'" in script
    assert "Das Nachrichtenthema „Libraries“ bleibt unverändert." in script
    assert "librarySources: wrnDataUrl('library-sources.json')" in config
    assert "libraryFeed: wrnDataUrl('library-feed.json')" in config
    assert "library-sources.json" in worker
    assert (ROOT / "aggregate_libraries.py").is_file()
    assert (ROOT / ".github" / "workflows" / "update-libraries.yml").is_file()
    assert "wrn-main-write" in (ROOT / ".github" / "workflows" / "update-libraries.yml").read_text(encoding="utf-8")


if __name__ == "__main__":
    test_parallel_preview_assets_exist()
    test_preview_server_can_be_exposed_to_private_lan()
    test_release_entry_point_is_news_app_2_and_classic_is_preserved()
    test_release_keeps_card_translation_and_safe_metadata()
    test_release_uses_live_feeds_with_packaged_offline_fallback()
    test_preview_and_production_offline_caches_are_distinct()
    test_specialty_views_are_native_preview_routes()
    test_default_lists_stay_short_and_source_balanced()
    test_media_sections_are_native_and_privacy_conscious()
    test_complete_radar_archive_is_loaded_only_inside_events_view()
    test_menu_briefing_and_responsive_images_are_present()
    test_article_tools_and_professional_discovery_are_present()
    test_release_header_cards_and_mobile_navigation_are_polished()
    test_feedback_dialog_and_bottom_navigation_icons_are_professionalized()
    test_active_podcast_playback_is_visibly_and_semantically_marked()
    test_anarchist_cyberactivism_source_is_registered()
    test_new_libertarian_communist_sources_are_registered_with_metadata()
    test_release_logo_and_donation_flow_match_live_safety()
    test_release_candidate_restores_existing_live_capabilities()
    test_hamburger_privacy_is_localized_and_has_a_back_link()
    test_release_checklist_is_readable_and_available()
    test_privacy_first_diagnostics_offline_fallback_and_opt_in_notifications()
    test_podcast_archive_quotas_are_independent_before_ui_limits()
    test_separate_multilingual_library_catalogue_is_available()
    print("News App 2 parallel preview assets: OK")
