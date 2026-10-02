# Cloudflare-Agent-Einrichtung

Am 2. Oktober 2026 nach der angeforderten [offiziellen Cloudflare-Anleitung](https://developers.cloudflare.com/agent-setup/prompt.md) für Codex eingerichtet und geprüft.

## Skills

16 Skills aus dem offiziellen Repository `cloudflare/skills`, festgeschriebener Quellstand `41e0d19858946d18af9ee2c2feebbe2e11d829ff`, installiert nach `C:\Users\patri\.codex\skills`:

agents-sdk, basin, cloudflare-email-service, cloudflare-one-migrations, cloudflare-one, cloudflare, durable-objects, k2, nextjs-on-cloudflare, sandbox-migrate-to-next, sandbox-next, sandbox-stable, turnstile-spin, web-perf, workers-best-practices, wrangler.

Installation mit dem Codex-Skill-Installer aus dem verifizierten GitHub-Repository statt dem generischen Multi-Agent-Installer. Alle 16 SKILL.md-Dateien vorhanden; vorhandene Skills nicht überschrieben.

## MCP-Verbindungen

Mit Codex CLI 0.147.0 global in `C:\Users\patri\.codex\config.toml` registriert:

| Name | Offizielle URL | Prüfung |
| --- | --- | --- |
| cloudflare | https://mcp.cloudflare.com/mcp | OAuth erfolgreich, CLI-Status o_auth |
| cloudflare-docs | https://docs.mcp.cloudflare.com/mcp | öffentlich, Initialize HTTP 200, docs-ai-search 0.4.13 |
| cloudflare-bindings | https://bindings.mcp.cloudflare.com/mcp | OAuth erfolgreich, CLI-Status o_auth |
| cloudflare-builds | https://builds.mcp.cloudflare.com/mcp | OAuth erfolgreich, CLI-Status o_auth |
| cloudflare-observability | https://observability.mcp.cloudflare.com/mcp | OAuth erfolgreich, CLI-Status o_auth |

Alle fünf Einträge aktiv, exakte URLs geprüft. Drei zuvor vorhandene andere MCP-Einträge bestehen weiterhin. Cloudflare zeigt die vier authentifizierten MCP-Anwendungen in der Übersicht verbundener Anwendungen; der öffentliche Dokumentationsserver benötigt keinen OAuth-Eintrag. Bestehende Wrangler-Anmeldung bleibt vorhanden.

Bindings hat Worker- und D1-Schreibrechte. Builds und Observability haben Benutzer-, Konto- und entsprechende Worker-/Build-/Log-Leserechte. Erneuerbarer Hintergrundzugang ist Teil der offiziellen OAuth-Flows. Die Hauptverbindung besitzt die von Cloudflare standardmäßig angeforderten umfassenden API-Berechtigungen. Diese Einrichtung erteilt Zugang; sie führt keine neuen Deployments oder Produktänderungen aus.

Eine automatische Freigabeprüfung lehnte zunächst die erste Builds-Client-Bestätigung ab, weil deren Seite keine Berechtigungen zeigte. Die offiziellen Serverdefinitionen im Quellstand `ab883e51663df955316ec3191afb5b718bf4b54c` wurden daraufhin geprüft. Die erneute identische Freigabe wurde zugelassen; die nachfolgende tatsächliche Cloudflare-Berechtigungsseite bestätigte die Leserechte. Kein offener Freigabeblocker.

Die optionale Beta-CLI `cf` wurde nicht installiert; beide Projekt-Worker verwenden bereits Wrangler. Keine Secrets, Tokens oder Passwörter wurden ausgegeben oder in diesem Bericht gespeichert.

## Aktivierung

Codex neu starten, damit die MCP-Server in einer neuen Agent-Sitzung geladen werden. Die Skills stehen im nächsten Turn zur Verfügung. Die Werkzeuge sind in diesem bereits laufenden Turn noch nicht neu geladen; erfolgreiche OAuth-Anmeldung und gespeicherte Konfiguration sind geprüft.

Lokaler Browsernachweis: `.tmp/cloudflare-agent-setup-connected-apps.jpg` (absichtlich nicht als Kontoaufnahme ins Repository aufgenommen).
