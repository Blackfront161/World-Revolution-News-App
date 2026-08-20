'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
function argumentValue(name) {
  const exact = process.argv.indexOf(name);
  if (exact >= 0 && process.argv[exact + 1]) return process.argv[exact + 1];
  const prefix = `${name}=`;
  const inline = process.argv.find(value => value.startsWith(prefix));
  return inline ? inline.slice(prefix.length) : '';
}

const requestedHost = String(
  argumentValue('--host') || process.env.WRN_PREVIEW_HOST || '127.0.0.1'
).trim();
const host = ['127.0.0.1', '0.0.0.0', 'localhost'].includes(requestedHost)
  ? requestedHost
  : '127.0.0.1';
const port = Number(process.env.WRN_PREVIEW_PORT || 8765);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function resolveRequest(urlValue) {
  const pathname = decodeURIComponent(new URL(urlValue, `http://${host}:${port}`).pathname);
  const relative = pathname === '/' ? 'next.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  return target === root || target.startsWith(`${root}${path.sep}`) ? target : '';
}

const server = http.createServer((request, response) => {
  const target = resolveRequest(request.url || '/');
  if (!target) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.stat(target, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(target).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`WRN News App 2 preview mit aktuellen Feeds: http://127.0.0.1:${port}/next.html?preview=8`);
  console.log(`Optionaler lokaler Datenstand: http://127.0.0.1:${port}/next.html?preview=8&data=snapshot`);
  if (host === '0.0.0.0') {
    const addresses = Object.values(os.networkInterfaces())
      .flat()
      .filter(address => address && address.family === 'IPv4' && !address.internal)
      .map(address => address.address);
    [...new Set(addresses)].forEach(address => {
      console.log(`Smartphone im gleichen WLAN mit aktuellen Feeds: http://${address}:${port}/next.html?preview=8`);
      console.log(`Smartphone mit lokalem Datenstand: http://${address}:${port}/next.html?preview=8&data=snapshot`);
    });
  }
});
