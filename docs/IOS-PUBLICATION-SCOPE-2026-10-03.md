# iOS: vorgesehener GitHub-Upload, 2026-10-03

Freigabe am 2026-10-03: Der Benutzer antwortete auf die konkrete Frage nach
dem zusätzlichen App-Ausgangsstand einschließlich Betriebsdokumentation als
separatem Basisbranch im öffentlichen Repository mit „ja mach das“. Damit sind
die hier beschriebenen Branch-Uploads und der iOS-Entwurfs-PR freigegeben.
Merge, Cloud-Build, Signierung, Apple-Upload und produktive Datenänderungen
sind davon nicht umfasst. Den tatsächlichen Remote-/PR-Status bei Übergabe prüfen.

Historie: Die automatische Freigabeprüfung hatte den ersten Blob-Upload
(`README.md` aus dem Basisstand) abgelehnt. Ihre Begründung: Betriebsdokumentation
würde öffentlich hochgeladen, ohne ausdrückliche Freigabe dieses konkreten
Inhalts und öffentlichen Ziels. Daraufhin wurde dieser Umfang vorgelegt und
die oben dokumentierte zusätzliche Benutzerfreigabe eingeholt.

## Ziel und Trennung

Öffentliches Repository: [Blackfront161/World-Revolution-News-App](https://github.com/Blackfront161/World-Revolution-News-App).
Die Sichtbarkeit `public` wurde über den verbundenen GitHub-Zugang geprüft.

- `codex/ios-source-baseline-83db917`: Snapshot des schon vorhandenen lokalen
  App-Standes vor dem iOS-Port, aus lokalem Commit
  `83db91794d0e2f167eca3037fb7d725b31f52ab7`. GitHub-`main` steht bei
  `c1506f3d7ef53a4bc3c0f35e96e93b55091142d9`; die 104 Unterschiede sind unten
  vollständig aufgeführt. Dazu gehören gemeinsame Web-/App-Änderungen,
  Android-Konfiguration, Prüfbelege und Betriebs-/Release-Dokumentation.
- `codex/ios-app`: der iOS-Port auf dieser Basis. Der Entwurfs-PR soll mit
  `[iOS]` beginnen und auf den Basisbranch zielen, damit gemeinsame/Android-
  Änderungen nicht im iOS-Diff erscheinen. Die 48 Portdateien des lokalen
  Prüfpunkts `3470ad14600dc33917ff13b15b6c4552f32d06f4` stehen unten.
  Die nachfolgende reine Dokumentationskorrektur und dieser Umfangsbericht
  gehören ebenfalls zu den iOS-Dateien.
- Keine Änderung an `main`, kein Merge, keine Signierung, kein Apple-Upload
  und kein Start eines Cloud-Builds als Teil dieser Upload-Freigabe.

Die Benutzerfreigabe umfasst den zusätzlichen Basisstand einschließlich
Betriebs-/Release-Dokumentation und das öffentliche Ziel. Keine automatische
Freigabeentscheidung durch eine andere Übertragungsmethode umgehen.

Die Trennung für AIs steht in `../AGENTS.md` und `../ios-wrapper/AGENTS.md`.
Der echte native Xcode-Build und die Geräteprüfung bleiben offen.

## Vorhandene App-Basis: 104 Unterschiede

Die Tabelle enthält Git-Blob-SHAs, keine Zugangsdaten. Bei diesen Änderungen
handelt es sich um den vorhandenen Ausgangsstand, nicht um neue iOS-Entwicklung.

| Datei | Bytes | Git-Blob |
|---|---:|---|
| `README.md` | 10834 | `9af06d6fdfe5616a694a6c7cbbb71aea7e08591d` |
| `ROADMAP.json` | 47975 | `0c1915fb8e77b1c7d0cc99aadaca37c71b5709a7` |
| `android-wrapper/android/app/build.gradle` | 2226 | `66ba6a8adefbe2af22095ff2c48c76397841d0da` |
| `android-wrapper/android/app/src/androidTest/java/com/world/revolution/AutonomUpgradeInstrumentedTest.java` | 5612 | `bc0711c0bfd27fd8b467fa5461facb054a347b20` |
| `app-check.html` | 12202 | `803b50d6996f8139aa35c24859c72dbea4e34b24` |
| `audio-tab-183.css` | 7070 | `7afca8fc80267991dd8cff3eb7d15101860a0f92` |
| `audio-tab-183.js` | 41101 | `72b1923eda64456a27a2fea86837ce292ecd1420` |
| `audio-tools.js` | 25822 | `d8e015dae895b31bbcac426277efde08bb948080` |
| `build_sources_registry.py` | 24410 | `7aa1cfb0a928479bf10d10c98893978c8fe28707` |
| `classic.html` | 40079 | `4ea76e60ca06a1b99063fc093f33d211bfa4bcab` |
| `config.js` | 27917 | `44d9ec21e5eee416f3e4bc47843f80a305f04742` |
| `docs/AUDIO-SHARING-2026-10-01.md` | 4038 | `34d7cbfd823a8a2283f4db09927952ee62a2db2c` |
| `docs/AUTONOM-ACCEPTANCE-2026-10-01.md` | 9823 | `a9024ece5e3d062cb980f4d047c20841eb081100` |
| `docs/AUTONOM-ANDROID-CODE31-2026-10-01.md` | 4546 | `9e864a65fcd217d24868577432bef6523564d7ef` |
| `docs/AUTONOM-DESIGN-AND-SOURCES-2026-09-30.md` | 6848 | `8b4e128a12a00b99fb8f99352b9d01ff42c057f0` |
| `docs/CONTENT-CATALOG-PARITY-AUDIT-2026-10-01.json` | 99963 | `fba4442535b078290e63c147a07a12da3e9334d6` |
| `docs/CONTENT-CATALOG-PARITY-AUDIT-2026-10-01.md` | 8193 | `426aaf1d2ac023917265bb20071b264e003673f9` |
| `docs/CONTENT-EXPANSION-CONTROLLER-REVIEW-2026-10-01.md` | 3137 | `18a5fb5f80332ef5aece63b88388d2caf8adac19` |
| `docs/CONTENT-EXPANSION-INVENTORY-2026-10-01.json` | 10334 | `e5bd706b1f83d7e10a2e5fef022975e0a05aa607` |
| `docs/CONTENT-EXPANSION-ROADMAP-2026-10-01.md` | 13355 | `a984c62d54f0a723545d45781b798d174562a202` |
| `docs/COORDINATION-2026-09-30.md` | 10841 | `a78a82ab37f6ba0bd4661673350f01d60b146992` |
| `docs/LEXICON-FIRST-CONTENT-BATCH-2026-10-01.md` | 3060 | `2f2063e2527d9370ea70380cba3368d0d90f9aff` |
| `docs/PODCAST-CANDIDATE-FEED-PROBE-2026-10-01.json` | 4699 | `fe280a556cf79454d0e527ac75c932c582ac0b6d` |
| `docs/PODCAST-CANDIDATE-FEED-PROBE-2026-10-01.md` | 3685 | `3ed7652a56545e18a3b4218b9140ee2a03814a68` |
| `docs/PODCAST-CANDIDATES-2026-10-01.md` | 8291 | `4dcb33fd9f2a86b51d96c3d74cc67fccf647c8b0` |
| `docs/RDL-SOURCE-IDENTITY-PROPOSAL-2026-10-01.json` | 18207 | `58d8133b7583bee89c06360d8aa82453f3becebc` |
| `docs/RDL-SOURCE-IDENTITY-PROPOSAL-2026-10-01.md` | 2957 | `5a5332fd5e49612d251f9edbcb83aa4296958a01` |
| `docs/RELEASE-CANDIDATE-CODE32-2026-10-01.md` | 4665 | `e3bc9543e24eab1cc7bf3deab665d941d5a06e08` |
| `docs/WEBSITE-PUBLICATION-2026-10-01.json` | 14893 | `407b892b1f91e826667c35c3735d983563a8b37d` |
| `docs/WEBSITE-PUBLICATION-2026-10-01.md` | 5719 | `83485f41a4fb77c59210025593235ab62ba949c1` |
| `docs/WEBSITE-STAR-ICON-CORRECTION-2026-10-01.json` | 3403 | `aad9074d4cff79b6da4880a33045467b0300ad70` |
| `docs/WEBSITE-STAR-ICON-CORRECTION-2026-10-01.md` | 2846 | `822ac471130b2eae439e45777b62663820250ec0` |
| `docs/evidence/audio-sharing-2026-10-01/browser-result.json` | 725 | `53cc0753e9d0ff28c8add0ad67a2baf902249240` |
| `docs/evidence/audio-sharing-2026-10-01/code32-artifact-check.json` | 1087 | `345afc90d611392005f87d18cde2e2b755b9be01` |
| `docs/evidence/audio-sharing-2026-10-01/code32-controller-acceptance.json` | 1142 | `6e39d90c4627cde98af92b62efd2d7a3156ab312` |
| `docs/evidence/audio-sharing-2026-10-01/contracts.json` | 180 | `30f985c7cea829c7db65d01051e33e51ba6454c1` |
| `docs/evidence/audio-sharing-2026-10-01/controller-acceptance.json` | 791 | `7ce12d56e85b174d2a34156ffeade4eb7de14902` |
| `docs/evidence/audio-sharing-2026-10-01/generated-autonom-mobile.png` | 74650 | `b20927729590d4af70eb8970391f15b311adbeb4` |
| `docs/evidence/audio-sharing-2026-10-01/release-report-code32.json` | 1336 | `dcbcdd496fd7a67a31abfc5afa8cc5c9c643fa5e` |
| `docs/evidence/audio-sharing-2026-10-01/release-report-code32.md` | 1350 | `83a6fab83a2fb45075ca42312b70053c4cf02290` |
| `docs/evidence/autonom-2026-09-30/android-code31-offline-motion.txt` | 1467 | `6f248d9aa69b3af5fc5e46fb93a4988feaff2ab1` |
| `docs/evidence/autonom-2026-09-30/android-code31-offline-process.txt` | 801 | `c496922593d4ee8060d55f0e63389323b6834eaf` |
| `docs/evidence/autonom-2026-09-30/android-code31-seed.txt` | 757 | `f8a80916422267e5eeb483020460776f0a4af78f` |
| `docs/evidence/autonom-2026-09-30/android-code31-upgrade.txt` | 786 | `84e621d53a3872215c6e8e4a20ea8d1b5e0699a3` |
| `docs/evidence/autonom-2026-09-30/autonom-desktop.png` | 116463 | `535e311e5e72aff821f8cd5cd0216854290b2603` |
| `docs/evidence/autonom-2026-09-30/autonom-mobile.png` | 54472 | `377e929f69bc5de6c61e22e32c6f130ab2d97b28` |
| `docs/evidence/autonom-2026-09-30/autonom-r5-offline.png` | 6859 | `0d7b3d04da2e9354d0bd9092bb1dea42fae81132` |
| `docs/evidence/autonom-2026-09-30/browser-acceptance-r5.json` | 7978 | `d8608bee2822464321c9ea56056f2edb083d3399` |
| `docs/evidence/autonom-2026-09-30/browser-acceptance-r7.json` | 8372 | `471f6ceba03fbabfd00f8a316e8cfcb265ac7610` |
| `docs/evidence/autonom-2026-09-30/browser-acceptance-verified-viewport.json` | 8595 | `fa3dd8636756e6785d3e7e65603890348a604902` |
| `docs/evidence/autonom-2026-09-30/browser-checks.json` | 4819 | `26df017e36c0c9c36efc7b2dd36334d91494c692` |
| `docs/evidence/autonom-2026-09-30/classic-profile-browser.json` | 154 | `97578b21ac2870f13a336f208e030026731c3713` |
| `docs/evidence/autonom-2026-09-30/full-contract-matrix-r5.txt` | 4829 | `f3f07867e09294ba28c5f09c595d09af48870319` |
| `docs/evidence/autonom-2026-09-30/full-contract-matrix-r7.txt` | 4946 | `eda450be9aea6c1cf7afe6418f25e9f681a45d87` |
| `docs/evidence/autonom-2026-09-30/full-contract-matrix.txt` | 4728 | `77fa44bd71688a4ff24b836966380d20e2cf8c1a` |
| `docs/evidence/autonom-2026-09-30/offline-before-stop.txt` | 2306 | `93464f1b4e542857bef2c064774c3ace74ece298` |
| `docs/evidence/autonom-2026-09-30/offline-restart-r5.json` | 822 | `3ed5bcf89d088cf02e18e208b3a70a61e37cdb8c` |
| `docs/evidence/autonom-2026-09-30/release-audit-r5.json` | 31752 | `3f7541ab02d62bfbdf240ae6c94798dff18d16ba` |
| `docs/evidence/autonom-2026-09-30/release-audit-r7.json` | 31752 | `5f064709a3e8368444a8dfb7fde3aa68251b355b` |
| `docs/evidence/autonom-2026-09-30/release-audit.json` | 31752 | `b999e0556b675f65d104fe199754855a3c696db7` |
| `docs/evidence/autonom-2026-09-30/release-report-code31.json` | 1363 | `daa3adfde125545682a5092c0fd79ca6f152fff3` |
| `docs/evidence/autonom-2026-09-30/release-report-code31.md` | 1344 | `7657244c882faa82dade31717c94184b3b76b25a` |
| `index.html` | 25445 | `09c169cc7126ddf6a84fcf9b10e5f04c28a8dc7a` |
| `lexicon-tab.js` | 203730 | `d3b7863c79e0ba674c809c6f3b12100714695764` |
| `multilingual-source-registry.json` | 7351 | `763372b79f721eff9fa8d0d7dfdba777c7eab56d` |
| `news-app-2-sw.js` | 12773 | `c011afea3fb208440e47bea4e68bf40e78d7baf4` |
| `news-app-2.css` | 126677 | `59baee8ed0f50eadf2eef714020fb68b2f965f04` |
| `news-app-2.js` | 733083 | `04825c933f22e10882faff56b123c1e11df902ea` |
| `privacy.html` | 47828 | `e95f362fdd30be7ce1a1d2627e2d03356a2b6134` |
| `release-1.5-nav.js` | 56920 | `68000decdfbf374ff14e22f22aaff0a04c4f7f18` |
| `release_audit_183.py` | 23008 | `52e5722206556a68424ac5d5b7efc678015859ae` |
| `scripts/audit_content_catalog_parity.py` | 12575 | `467c6c806d78f78ec98412b27134b109a5a9ef31` |
| `scripts/sign-google-play-aab-2.1.2-code32-6821a02-gui.ps1` | 20225 | `50bf6aec1103db14abeb6220eb1087fc9b74ccf5` |
| `service-worker.js` | 19922 | `2561ca04413ff5dc26fa708106f3158792bbcdda` |
| `source-profiles.js` | 34110 | `880ef3aeaa76e2bba23f2fd7fc4b52e8b2733363` |
| `sources-registry.json` | 335277 | `3ddc27b61dd61f3b256377a279867b1e1889f62f` |
| `tests/android/AudioSharingInstrumentedTest.java` | 8559 | `1a58948c96992354962705e0f7e5821d9dec40fd` |
| `tests/android/AutonomOfflineMotionInstrumentedTest.java` | 5414 | `d2928a6ded0c3eadcd7b4749e30414d08a8a38c4` |
| `tests/android/WRNShareTestReceiverActivity.java` | 454 | `1250ea4dfe0085877bf3a53089b26e5a6d144b70` |
| `tests/browser_audio_sharing.mjs` | 10491 | `4b9c137187b8d3bbb3824f2bee573668304b2f2f` |
| `tests/browser_autonom_acceptance.cua.mjs` | 5634 | `abc8dcb0636da48cd20794f66e58791d2736d575` |
| `tests/browser_classic_source_profile.cua.mjs` | 1554 | `e103157e923955de9c83d5f80be52571e5beaed2` |
| `tests/test_android_toolchain_foundation.py` | 2949 | `502fec23bc6639696055fadd9c934f2f699d11a0` |
| `tests/test_audio_block2_assets.py` | 1257 | `a2026130bbeedf018de7637cd954f83e78cb534b` |
| `tests/test_audio_sharing.js` | 6665 | `83738604ea980ff100709dda66aaec699f3e5366` |
| `tests/test_autonom_behavior.js` | 7556 | `8d4f38b19e2d82b62ce5522c799098dae51635b3` |
| `tests/test_classic_card_keyboard.js` | 1519 | `cf476e581d6691ffb1b0006843ff01e39c65464c` |
| `tests/test_content_catalog_parity_audit.py` | 9996 | `b1738c9d10268a58db57dbade7e627d3e6931d59` |
| `tests/test_fast_start_atomic_cache.js` | 6618 | `9a475a53385499cbd958fb2f9ca270e73b52e012` |
| `tests/test_home_translation_layout.js` | 2640 | `2d4c8949672a12cd166d9fd5114250ee866bbf22` |
| `tests/test_lexicon_relationships.js` | 2332 | `592d0b16a783c2aa4160bd5127fe296f9bb0fa16` |
| `tests/test_news_app_2_assets.py` | 31284 | `e5f52bf3af066322f9b4ca741abe1d1ed9d80ffd` |
| `tests/test_news_app_2_release_round.js` | 11893 | `7205a419705787c647668476fa7b55011a31e0de` |
| `tests/test_next_update_candidate.js` | 2822 | `8badaae66091993acf4d34417dd02205079b9d6c` |
| `tests/test_product_21_offline_assets.py` | 3666 | `9e774af253de7c43536133de7cd2b1b06c6057d8` |
| `tests/test_release_181.py` | 3504 | `3a5cdfb139236ffd5881e2111da2f9c64a9bc066` |
| `tests/test_release_182.py` | 2655 | `ad37e3fb588845741ed7076cea98c84e896dcbba` |
| `tests/test_release_200_assets.py` | 2200 | `67ac111783e5e7867641f6b1cd9d656c3f20ca43` |
| `tests/test_release_211_code26.py` | 4121 | `5971b06b0d79db5c43adec32db61d0282cfdb145` |
| `tests/test_source_profile_keyboard.js` | 3620 | `5ccd827f960e7b9a5769fcffb0dfeabf8041a26a` |
| `tests/test_source_recovery_assets.py` | 2251 | `7c4e013866d572e4534eea9c26ba98af80ce3319` |
| `tests/test_sources_registry_metadata.py` | 3156 | `639034a4149a092ed29fcd844191e4759ab35dd8` |
| `tests/test_video_assets.py` | 2472 | `403e309f0c36e7650f29c07d8d8a194e563e1cc2` |
| `tests/validate_app.py` | 25230 | `0635d258e441f7404a9fabcc268790f79be836ab` |

## iOS-Port: 48 Dateien am Prüfpunkt

| Datei | Bytes | Git-Blob |
|---|---:|---|
| `.gitattributes` | 465 | `58e746bb52179638ca250b18f34cbf73af32c2bb` |
| `.github/workflows/ios-build.yml` | 3883 | `754d5eda3b163e49e5d27f51ae9e153f8f2cf93c` |
| `AGENTS.md` | 3140 | `070bb4a7f13adb06b33a605414dfda0c266f421d` |
| `docs/IOS-PORT-2026-10-01.md` | 5348 | `ff83f8bb9ace2f7f290f191f0f17e5d5f8e47b51` |
| `docs/evidence/ios-port-2026-10-01/autonom-390.png` | 48861 | `0fd82e8c3da8d8aa808994f719be9874c29c5e01` |
| `docs/evidence/ios-port-2026-10-01/classic-390.png` | 77108 | `6e2d3ff68214c0fb6f3a6c81fdbd867212645d01` |
| `docs/evidence/ios-port-2026-10-01/evidence-hashes.json` | 466 | `838d6e6a9261c11a2b7c741241ff7e671bad0c90` |
| `docs/evidence/ios-port-2026-10-01/inherited-release-audit.json` | 31752 | `ef40af3b73ed6b852b43aee160decdc1014396a1` |
| `docs/evidence/ios-port-2026-10-01/web-manifest.json` | 79940 | `b1a15ac91db54d6b47e2d61f15503ca2d361bc8d` |
| `docs/evidence/ios-port-2026-10-01/webkit-result.json` | 2907 | `08b83e97a261a1a0affa1d21f7a32f5157e79586` |
| `ios-wrapper/.gitignore` | 123 | `53bd085ec4118613604b3fffe63053c0bdd2cd2d` |
| `ios-wrapper/AGENTS.md` | 3862 | `164efa1efeb5cf9499af4a43c03e2ec2fc518af3` |
| `ios-wrapper/README.md` | 8844 | `985e9544feaf96498272f0acb0eb0313c05b3036` |
| `ios-wrapper/SOURCE-ORIGIN.json` | 439 | `169a415338d1fb1495180f1efeef19e5bcd62295` |
| `ios-wrapper/capacitor.config.json` | 403 | `b02a8be90ebb77aec1dbd166393b5db74bb2d881` |
| `ios-wrapper/ios/.gitignore` | 206 | `f47029973b442a32c7ce8a83195f29d70661f124` |
| `ios-wrapper/ios/App/App.xcodeproj/project.pbxproj` | 15991 | `a1bba7e4c7bcdfdea099cf7aec41b42fba7fde3d` |
| `ios-wrapper/ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist` | 238 | `18d981003d68d0546c4804ac2ff47dd97c6e7921` |
| `ios-wrapper/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` | 2038 | `c1ffc79ca50ff51630f7c5b16a37ccf8d926ad65` |
| `ios-wrapper/ios/App/App/AppDelegate.swift` | 3031 | `c3cd83b5c0a62be3fc56a7909aedc70ccf6a92c0` |
| `ios-wrapper/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` | 1908440 | `ef3fdeb084a041481545801ae2844c58403f2dde` |
| `ios-wrapper/ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json` | 218 | `9b7d382dcecca887eac19d7f1c4c8dc57abe00e4` |
| `ios-wrapper/ios/App/App/Assets.xcassets/Contents.json` | 62 | `da4a164c918651cdd1e11dca5cc62c333f097601` |
| `ios-wrapper/ios/App/App/Assets.xcassets/WRNLogo.imageset/Contents.json` | 118 | `6584e8b58a91ecd62559bcf97c6ce8ee23ec1278` |
| `ios-wrapper/ios/App/App/Assets.xcassets/WRNLogo.imageset/wrn-logo.png` | 1908440 | `ef3fdeb084a041481545801ae2844c58403f2dde` |
| `ios-wrapper/ios/App/App/Base.lproj/LaunchScreen.storyboard` | 1995 | `416e4c69c636c3123f3cc62cedffff3cf6db5409` |
| `ios-wrapper/ios/App/App/Base.lproj/Main.storyboard` | 1007 | `538bcea84e75402ba206300accf13e7353f588cf` |
| `ios-wrapper/ios/App/App/Info.plist` | 2028 | `5489985d98655b349b60425ebd17080969df2d98` |
| `ios-wrapper/ios/App/App/PrivacyInfo.xcprivacy` | 1204 | `cf9944cb895e4e87ff06624b455926f2e017a0ba` |
| `ios-wrapper/ios/App/App/WRNDevicePlugin.swift` | 11592 | `46cdbfb7fc053cf55eada74a6ffd9712d05490b5` |
| `ios-wrapper/ios/App/App/WRNViewController.swift` | 600 | `b327f0b34bf48fb09dd782d525584b717580d678` |
| `ios-wrapper/ios/App/CapApp-SPM/.gitignore` | 165 | `3b29812086f28a2b21884e57ead495ffd9434178` |
| `ios-wrapper/ios/App/CapApp-SPM/Package.swift` | 1085 | `ac37a28c5d14f6e8e4e259ece11c4c8e4f62bbae` |
| `ios-wrapper/ios/App/CapApp-SPM/README.md` | 162 | `03964db900841d8d1125314f12ace8394c755b3b` |
| `ios-wrapper/ios/App/CapApp-SPM/Sources/CapApp-SPM/CapApp-SPM.swift` | 33 | `945afec8c778e227bfd9892d58cc9b43a3b45ce3` |
| `ios-wrapper/ios/debug.xcconfig` | 23 | `53ce18dead86a04b15c04ccc23da732642cfcc6a` |
| `ios-wrapper/package-lock.json` | 41076 | `a4a91fb7204d6675effc38b0fd4d6c57ffc1ed2a` |
| `ios-wrapper/package.json` | 845 | `675babba90ad244dfbb36a97fe29f2a17c558a9d` |
| `ios-wrapper/web/wrn-ios-assets.js` | 7280 | `835f7b3d5dd63c1078416e03b126da335bb33471` |
| `ios-wrapper/web/wrn-ios.css` | 291 | `e834f68e005fa45cea99e7695987c5b395c8852d` |
| `ios-wrapper/web/wrn-ios.js` | 1843 | `98a35f67f1d8ec2f6c537a3e78dfd0ea0cc63403` |
| `scripts/build-ios.mjs` | 1003 | `6f4064f3cc736b8b1d412f8dc4d8fc89e35bf90d` |
| `scripts/finalize-ios-sync.mjs` | 515 | `e9e4c1e964b38ba767320071d6b26aa1a3ed5f36` |
| `scripts/prepare-ios-web.mjs` | 5434 | `25c880ca6fe3a15153839f4b28d027e030255938` |
| `scripts/verify-ios-project.mjs` | 4565 | `263977084d0e2219029c8375cf55bba17177dd17` |
| `tests/ios/adapter.test.mjs` | 2779 | `e4bd2b845ea49d92d25343bbf8579cd9cb6c9c22` |
| `tests/ios/browser.mjs` | 8943 | `1ada95adfc1e674e87e2d5d6bf713b0cf645301f` |
| `tests/ios/packaging.test.mjs` | 2342 | `ef0122cee8e4f2913d27c35f6bd9887755b0f674` |

