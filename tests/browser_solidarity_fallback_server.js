'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || 8793);
const mode = process.argv[3] || 'normal';
const mime = { '.css':'text/css', '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml' };

http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/viewport-fixture') {
    const width = Math.max(320, Math.min(1600, Number(requestUrl.searchParams.get('width')) || 390));
    const height = Math.max(480, Math.min(1200, Number(requestUrl.searchParams.get('height')) || 844));
    const language = String(requestUrl.searchParams.get('language') || 'de').replace(/[^a-z]/g, '');
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(`<!doctype html><meta charset="utf-8"><title>WRN viewport fixture</title>
      <iframe id="app" src="/index.html?viewport-fixture=${width}" style="width:${width}px;height:${height}px;border:0"></iframe><pre id="result">pending</pre>
      <script>app.onload=()=>setTimeout(()=>{const d=app.contentDocument;
        d.querySelector('button[data-view-target="discover"]')?.click();
        setTimeout(()=>{d.querySelector('button[data-view-target="help"]')?.click();setTimeout(()=>{
          const select=d.querySelector('#next-language');if(select){select.value=${JSON.stringify(language)};select.dispatchEvent(new Event('change',{bubbles:true}));}
          setTimeout(()=>{result.textContent=JSON.stringify({width:${width},height:${height},language:${JSON.stringify(language)},clientWidth:d.documentElement.clientWidth,scrollWidth:d.documentElement.scrollWidth,overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,profiles:d.querySelectorAll('[data-help-profile]').length});},250);
        },250);},250);},1200);</script>`);
    return;
  }
  if (pathname === '/solidarity-network.json' && mode !== 'normal') {
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
    if (mode === 'header-fallback') headers['X-WRN-Synthetic-Offline-Fallback'] = 'solidarity-network-empty-v1';
    response.writeHead(200, headers);
    response.end(JSON.stringify({ schemaVersion: 2, profiles: [], fallbackContext: 'service-worker-offline-empty' }));
    return;
  }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (!target.startsWith(root) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    response.writeHead(404); response.end('Not found'); return;
  }
  response.writeHead(200, { 'Content-Type': `${mime[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
  fs.createReadStream(target).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`WRN solidarity browser fixture ${mode} on ${port}`));
