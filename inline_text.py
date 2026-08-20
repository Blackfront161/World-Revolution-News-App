"""HTML text extraction that preserves spacing already present in inline content."""

from __future__ import annotations

import re

_COMMON_ENTITIES = {
    "amp": "&", "apos": "'", "gt": ">", "lt": "<", "nbsp": " ", "quot": '"'
}


def _decode_entity(match: re.Match[str]) -> str:
    value = match.group(1)
    if value.startswith(("#x", "#X")):
        try:
            return chr(int(value[2:], 16))
        except ValueError:
            return match.group(0)
    if value.startswith("#"):
        try:
            return chr(int(value[1:]))
        except ValueError:
            return match.group(0)
    return _COMMON_ENTITIES.get(value.lower(), match.group(0))


def inline_preserving_text(value: object) -> str:
    """Keep source whitespace, but do not invent spaces between adjacent spans."""
    html = re.sub(r"<br\s*/?>", " ", str(value or ""), flags=re.IGNORECASE)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
    text = re.sub(r"<[^>]*>", "", html)
    text = re.sub(r"&([A-Za-z]+|#[0-9]+|#x[0-9A-Fa-f]+);", _decode_entity, text)
    return re.sub(r"\s+", " ", text).strip()


def prefer_inline_preserving_text(existing: object, extracted: object) -> str:
    """Prefer a spacing repair even when the corrected text is slightly shorter."""
    current = str(existing or "").strip()
    candidate = str(extracted or "").strip()
    if len(candidate) > len(current):
        return candidate
    current_signature = re.sub(r"\s+", "", current).casefold()
    candidate_signature = re.sub(r"\s+", "", candidate).casefold()
    if candidate and current_signature == candidate_signature:
        return candidate
    return current
