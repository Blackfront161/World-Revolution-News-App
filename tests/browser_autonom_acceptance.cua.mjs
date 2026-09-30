// Replay in Codex's cua_repl. Uses only the documented browser UI API.
// Pass the existing tab and viewport capability; reset viewport in finally.
export async function runAutonomAcceptance(tab, viewport) {
  const results = [];
  const check = (name, detail, ok) => {
    results.push({name, passed: Boolean(ok), detail});
    if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
  };
  const menu = () => tab.playwright.getByRole('button', {name:'Menü öffnen', exact:true});
  const theme = () => tab.playwright.getByRole('combobox', {name:'Farbdarstellung', exact:true});
  const font = () => tab.playwright.getByRole('combobox', {name:'Schriftgröße', exact:true});
  const geometry = () => tab.playwright.evaluate(() => ({
    width: innerWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    theme: document.documentElement.dataset.theme,
    font: document.documentElement.dataset.fontSize,
    clippedTitles: [...document.querySelectorAll('.home-top-row strong,.news-title,h1,h2,h3')]
      .filter(x => x.getClientRects().length && (x.scrollWidth > x.clientWidth + 2
        || (getComputedStyle(x).overflowY === 'hidden' && x.scrollHeight > x.clientHeight + 2)))
      .map(x => x.textContent.slice(0,80)),
  }));
  try {
    await menu().press('Enter');
    await tab.playwright.domSnapshot();
    await theme().selectOption('autonom');
    await font().selectOption('200');
    await theme().press('Tab');
    const focus = await tab.playwright.evaluate(() => ({
      id: document.activeElement.id,
      visible: document.activeElement.matches(':focus-visible'),
      outline: getComputedStyle(document.activeElement).outlineStyle,
    }));
    check('keyboard-theme-to-font-visible-focus', focus,
      focus.id === 'next-menu-font-size' && focus.visible && focus.outline !== 'none');
    await font().press('Escape');
    await tab.playwright.domSnapshot();
    const restored = await tab.playwright.evaluate(() => document.activeElement.id);
    check('escape-restores-menu-trigger', restored, restored === 'next-menu-toggle');
    for (const width of [320,390,768,1440]) {
      await viewport.set({width,height:900});
      const detail = await geometry();
      check(`autonom-200-percent-${width}`, detail,
        detail.theme === 'autonom' && detail.font === '200'
        && detail.overflow <= 2 && detail.clippedTitles.length === 0);
    }
    await menu().press('Enter');
    await tab.playwright.domSnapshot();
    await font().selectOption('normal');
    await theme().selectOption('dark');
    check('switch-back', await geometry(), (await geometry()).theme === 'dark');
    await theme().selectOption('autonom');
    await font().press('Escape');
    await tab.reload();
    await tab.playwright.getByRole('navigation',{name:'Themen',exact:true}).waitFor({state:'visible'});
    check('reload-persists-autonom', await geometry(), (await geometry()).theme === 'autonom');
    await tab.playwright.getByRole('button',{name:'Antifaschismus',exact:true}).press('Enter');
    const discover = await tab.playwright.domSnapshot();
    check('topic-chip-opens-real-discover', discover.slice(0,1800),
      discover.includes('Entdecken') && discover.includes('Antifaschismus'));
    await tab.playwright.getByRole('button',{name:'Start',exact:true}).click();
    await tab.playwright.domSnapshot();
    await tab.playwright.getByRole('button',{name:'Beitrag öffnen',exact:true}).first().press('Enter');
    await tab.playwright.getByRole('dialog').waitFor({state:'visible'});
    const reader = await tab.playwright.domSnapshot();
    check('keyboard-opens-reader', reader.slice(-1600), reader.includes('dialog'));
    await tab.playwright.getByRole('button',{name:'Schließen',exact:true}).press('Escape');
    await tab.playwright.getByRole('dialog').waitFor({state:'hidden'});
    await tab.playwright.domSnapshot();
    await tab.playwright.getByRole('button',{name:'Quellenprofil',exact:true}).first().press('Enter');
    await tab.playwright.getByRole('dialog',{name:/Quellenprofil/}).waitFor({state:'visible'});
    const passport = await tab.playwright.domSnapshot();
    check('keyboard-opens-source-passport', passport.slice(-1800),
      passport.includes('Betreiber / Organisation') && passport.includes('Unbekannt'));
    await tab.playwright.getByRole('button',{name:'Schließen',exact:true}).press('Escape');
    await tab.playwright.domSnapshot();
    const closed = await tab.playwright.evaluate(() => ({
      visible: [...document.querySelectorAll('[role=dialog],dialog')].some(x => !x.hidden && x.getClientRects().length),
      returnedToSource: document.activeElement?.dataset.action === 'source-profile',
    }));
    check('source-passport-escape-and-return-focus', closed,
      !closed.visible && closed.returnedToSource);
    return {runner:'Codex CUA browser API', results,
      limits:['Reduced-motion system emulation is not exposed by this browser backend.',
              'Offline restart is a separate server-stop test.',
              'Android acceptance is separate.']};
  } finally {
    await viewport.reset();
  }
}
