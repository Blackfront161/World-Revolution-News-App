export async function translationCacheKey({ targetLanguage, mode, title, text }) {
  const source = JSON.stringify({ version: 1, targetLanguage, mode, title, text });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
