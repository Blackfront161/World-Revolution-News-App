/* iOS-only adapter; bundled app code and public backend configuration are reused. */
'use strict';
(() => {
  if (window.Capacitor?.getPlatform?.() !== 'ios') return;
  document.documentElement.classList.add('wrn-ios');
  const plugin = window.Capacitor.Plugins.WRNDevice;
  if (!plugin) return;
  // WKWebView cannot download blob: links to Files. Reuse the native share sheet.
  // Capturing also handles the existing app's programmatic anchor.click().
  document.addEventListener('click', async event => {
    const link = event.target?.closest?.('a[download]');
    if (!link || !link.href.startsWith('blob:')) return;
    event.preventDefault();
    try {
      const response = await fetch(link.href);
      const blob = await response.blob();
      if (blob.size > 16 * 1024 * 1024) throw new Error('export-too-large');
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await plugin.exportFile({ filename: link.download, base64 });
    } catch (error) {
      if (error?.code === 'CANCELLED') return;
      window.alert(({ de: 'Export fehlgeschlagen. Bitte erneut versuchen.', en: 'Export failed. Please try again.', es: 'Error al exportar. Inténtalo de nuevo.', fr: 'Échec de l’export. Réessayez.', it: 'Esportazione non riuscita. Riprova.', pt: 'Falha na exportação. Tenta novamente.', ru: 'Не удалось экспортировать. Повторите попытку.', el: 'Η εξαγωγή απέτυχε. Δοκιμάστε ξανά.', tr: 'Dışa aktarma başarısız. Tekrar deneyin.' })[document.documentElement.lang?.split('-')[0]] || 'Export failed. Please try again.');
    }
  }, true);
})();
