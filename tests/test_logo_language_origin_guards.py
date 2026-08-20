import hashlib
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_apk_master_lettering_mask_is_exact_and_transparent():
    path = ROOT / "solinaridao-world-revolution-news-mask.png"
    data = path.read_bytes()
    assert data.startswith(b"\x89PNG\r\n\x1a\n")
    width, height = struct.unpack(">II", data[16:24])
    assert (width, height) == (954, 52)
    assert data[25] == 6, "mask must remain RGBA"
    assert hashlib.sha256(data).hexdigest() == "18c4e5a504cfaa0aac882b68118b7d81dd2b91b3bb9ab3265d54d5480907d411"


def test_logo_uses_reference_mask_at_the_confirmed_position():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
    assert "Arial Narrow" not in css
    assert '<span class="brand__subtitle-text">WORLD REVOLUTION NEWS</span>' in html
    assert "top: calc(var(--brand-size) * .606061);" in css
    assert "width: calc(var(--brand-size) * .760766);" in css
    assert "height: calc(var(--brand-size) * .041467);" in css
    assert 'mask: url("solinaridao-world-revolution-news-mask.png")' in css
    assert "linear-gradient(90deg, var(--cyan) 0 50%, var(--red) 50% 100%)" in css


def test_unknown_language_never_becomes_an_origin_claim():
    helper = (ROOT / "language-origin.js").read_text(encoding="utf-8")
    app = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
    tools = (ROOT / "translation-tools.js").read_text(encoding="utf-8")
    for token in ("'und'", "'mul'", "'zxx'", "'mis'", "'unknown'", "'null'", "'undefined'", "'n-a'"):
        assert token in helper
    assert "translationNoteLabel(article, translation)" in app
    assert "t.machineTranslatedFrom" in tools
    assert "source?.label || ''" in tools
    assert "...(source ? [`Originalsprache: ${source.label}`] : [])" in tools
