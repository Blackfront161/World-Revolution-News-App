from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding='utf-8')


def main() -> None:
    config = read('config.js')
    worker = read('service-worker.js')
    workflow = read('.github/workflows/quality-gate.yml')
    script = read('interface-block3.js')
    style = read('interface-block3.css')
    app = read('app.js')

    assert "['interface-block3.css', 'interface-block3-recovery-183']" in config
    assert "['interface-block3.js', 'interface-block3-recovery-183']" in config
    assert "'./interface-block3.css'" in worker
    assert "'./interface-block3.js'" in worker
    assert 'python tests/run_contract_matrix.py' in workflow
    assert 'wrn-source-range-bar-183' in style
    assert 'wrn-zine-editor-183' in style
    assert 'ensureThirtyDayArchive' in script
    assert 'matchesCorruption' in script
    assert '.wrn-rb-star-184 {' in style
    assert 'animation: none;' in style
    assert '.wrn-card-language-action-183.is-loading .wrn-rb-star-184' in style
    assert '[data-wrn-article-action="translate"].is-loading .wrn-rb-star-184' in style
    assert "btnEl.classList.add('is-loading')" in app
    assert "btnEl.classList.remove('is-loading')" in app
    assert "attributeFilter: ['class', 'disabled']" in script
    assert 'btnTranslate: "Übersetzen"' in app
    assert "translate: 'Übersetzen'" in script
    assert 'btnTranslate: "Ubersetzen"' not in app
    assert "translate: 'Ubersetzen'" not in script

    print('Block 3 assets: OK')


if __name__ == '__main__':
    main()
