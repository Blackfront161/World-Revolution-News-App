import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from inline_text import inline_preserving_text, prefer_inline_preserving_text


def main() -> None:
    publisher_html = (
        '<p><span>Ben Kayseri’de bir Anadolu </span><span>L</span>'
        '<span>isesinde okuyorum. Gerçekleşen l</span><span>ise </span>'
        '<span>f</span><span>orumundan bahsedeceğim.</span></p>'
    )
    assert inline_preserving_text(publisher_html) == (
        "Ben Kayseri’de bir Anadolu Lisesinde okuyorum. "
        "Gerçekleşen lise forumundan bahsedeceğim."
    )
    assert inline_preserving_text("<p>Ein <strong>echter</strong> Abstand<br>bleibt.</p>") == (
        "Ein echter Abstand bleibt."
    )
    broken = "Anadolu L isesinde gerçekleşen l ise f orumundan"
    repaired = "Anadolu Lisesinde gerçekleşen lise forumundan"
    assert prefer_inline_preserving_text(broken, repaired) == repaired
    assert prefer_inline_preserving_text("Ein längerer gespeicherter Volltext", "Kurz") == (
        "Ein längerer gespeicherter Volltext"
    )
    print("Inline HTML text extraction: OK")


if __name__ == "__main__":
    main()
