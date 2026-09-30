// Replay against a fresh local classic.html tab, English/German UI.
// The last delayed loader is a DOM readiness signal after the landing redirects.
export async function runClassicProfileAcceptance(tab) {
  await tab.playwright.locator('script[data-wrn-module="translation-status-recovery-10"][data-loaded="true"]').waitFor({state:'attached'});
  await tab.playwright.getByRole('button',{name:'Start',exact:true}).click();
  await tab.playwright.domSnapshot();
  await tab.playwright.getByRole('button',{name:'LabourNet DE',exact:true}).first().press('Enter');
  await tab.playwright.getByRole('dialog',{name:/Source profile|Quellenprofil/}).waitFor({state:'visible'});
  await tab.playwright.domSnapshot();
  await tab.playwright.getByRole('button',{name:/^(Close|Schließen)$/}).press('Escape');
  await tab.playwright.domSnapshot();
  const result = await tab.playwright.evaluate(()=>({
    profileHidden:document.querySelector('#source-profile-modal').hidden,
    profileDisplay:getComputedStyle(document.querySelector('#source-profile-modal')).display,
    returnedToSource:document.activeElement?.classList.contains('source-profile-link'),
    returnedSource:document.activeElement?.textContent,
    articleDetailsVisible:Boolean(document.querySelector('.wrn-article-detail')?.getClientRects().length),
  }));
  if (!result.profileHidden || result.profileDisplay !== 'none' || !result.returnedToSource
      || result.returnedSource !== 'LabourNet DE' || result.articleDetailsVisible) throw new Error(JSON.stringify(result));
  return result;
}
