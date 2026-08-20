"""Keep one original-language edition when publishers repeat an article in translation."""

from __future__ import annotations

import re


LANGUAGE_LABELS = {
    "english": "en", "englisch": "en",
    "deutsch": "de", "german": "de",
    "español": "es", "espanol": "es", "spanish": "es",
    "français": "fr", "francais": "fr", "french": "fr",
    "italiano": "it", "italian": "it",
    "português": "pt", "portugues": "pt", "portuguese": "pt",
    "türkçe": "tr", "turkce": "tr", "turkish": "tr",
    "русский": "ru", "russian": "ru",
    "ελληνικά": "el", "greek": "el",
}

LANGUAGE_SIGNALS = {
    "de": {"aber", "auch", "bei", "das", "dem", "den", "der", "die", "ein", "eine", "für", "hat", "ist", "mit", "nicht", "sich", "und", "von", "werden", "wird", "zu"},
    "en": {"also", "and", "are", "as", "at", "been", "but", "for", "from", "has", "have", "in", "is", "not", "of", "on", "that", "the", "their", "this", "to", "was", "were", "with"},
    "es": {"como", "con", "del", "el", "en", "esta", "este", "ha", "la", "las", "los", "más", "no", "para", "pero", "por", "que", "se", "sin", "su", "una", "y"},
    "fr": {"avec", "ce", "ces", "dans", "des", "du", "elle", "en", "est", "et", "les", "mais", "ne", "nous", "pas", "pour", "que", "qui", "sur", "une"},
    "it": {"anche", "che", "con", "del", "della", "di", "e", "gli", "il", "in", "la", "le", "ma", "nel", "non", "per", "più", "sono", "una"},
    "pt": {"as", "com", "como", "da", "das", "de", "do", "dos", "em", "e", "está", "mais", "não", "o", "os", "para", "por", "que", "se", "uma"},
    "tr": {"ama", "bir", "bu", "da", "de", "için", "ile", "olarak", "olan", "ve", "veya"},
}


def normalize_language(value: object) -> str:
    language = str(value or "").strip().casefold().replace("_", "-").split("-")[0]
    return language if language in {*LANGUAGE_SIGNALS, "ru", "el"} else "und"


def paragraph_language(value: object) -> str:
    text = str(value or "").strip()
    label = re.sub(r"[\s:|/–—-]+", " ", text.casefold()).strip()
    if label in LANGUAGE_LABELS:
        return LANGUAGE_LABELS[label]
    if len(text) < 70:
        return "und"
    if len(re.findall(r"[а-яё]", text.casefold())) >= 12:
        return "ru"
    if len(re.findall(r"[α-ωάέήίόύώϊϋΐΰ]", text.casefold())) >= 12:
        return "el"

    words = re.findall(r"[^\W\d_]{2,}", text.casefold(), flags=re.UNICODE)
    scores = {
        language: sum(word in signals for word in words)
        for language, signals in LANGUAGE_SIGNALS.items()
    }
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if not ranked or ranked[0][1] < 3:
        return "und"
    runner_up = ranked[1][1] if len(ranked) > 1 else 0
    return ranked[0][0] if ranked[0][1] >= runner_up + 1 else "und"


def repeated_language_switch(values: list[str], preferred_language: str = "und") -> int | None:
    """Return the first paragraph index of a repeated translated edition."""

    entries = [
        (index, paragraph_language(value), len(str(value or "").strip()))
        for index, value in enumerate(values)
    ]
    substantial = [entry for entry in entries if entry[2] >= 70 and entry[1] != "und"]
    if not substantial:
        return None

    preferred = normalize_language(preferred_language)
    base_language = preferred if preferred != "und" else substantial[0][1]
    base_count = 0
    before_chars = 0

    for position, (original_index, language, length) in enumerate(entries):
        if language == base_language and length >= 70:
            base_count += 1
        if (
            language not in {"und", base_language}
            and base_count >= 2
            and before_chars >= 650
        ):
            following = [
                entry
                for entry in entries[position:position + 7]
                if entry[1] != "und"
            ]
            same_language = sum(entry[1] == language for entry in following)
            returns_to_base = any(entry[1] == base_language for entry in following[:4])
            remaining_chars = sum(entry[2] for entry in entries[position:])
            required_remainder = max(700, min(int(before_chars * 0.35), 2500))
            if same_language >= 2 and not returns_to_base and remaining_chars >= required_remainder:
                return original_index
        before_chars += length
    return None


def trim_repeated_translation(value: object, preferred_language: str = "und") -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n+", text) if part.strip()]
    switch = repeated_language_switch(paragraphs, preferred_language)
    if switch is None:
        return text
    return "\n\n".join(paragraphs[:switch]).strip()


def trim_repeated_translation_blocks(
    blocks: object,
    preferred_language: str = "und",
) -> list[dict[str, object]]:
    if not isinstance(blocks, list):
        return []
    text_entries = [
        (index, str(block.get("text") or "").strip())
        for index, block in enumerate(blocks)
        if isinstance(block, dict)
        and block.get("type") in {"paragraph", "quote", "heading"}
        and str(block.get("text") or "").strip()
    ]
    switch = repeated_language_switch(
        [value for _, value in text_entries],
        preferred_language,
    )
    if switch is None:
        return list(blocks)
    block_index = text_entries[switch][0]
    return list(blocks[:block_index])
