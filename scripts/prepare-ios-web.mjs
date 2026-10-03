import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensions = new Set(['.html', '.js', '.css', '.json', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.ttf', '.woff', '.woff2', '.txt']);
const excluded = /^(aggregate-errors|workflow-audit|INTEGRATION-REPORT|feature-audit)\.json$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export async function prepareWeb(sourceRoot = root, wrapper = path.join(root, 'ios-wrapper')) {
  // Only the app's flat public assets and the existing news archive are inputs.
  // Backend code, admin pages, secrets, tests and native projects never enter www.
  const paths = [];
  for (const item of await fs.readdir(sourceRoot, { withFileTypes: true })) {
    if (item.isFile() && extensions.has(path.extname(item.name)) && !excluded.test(item.name)) paths.push(item.name);
  }
  async function archive(dir, prefix) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Symlink in public assets');
      if (entry.isDirectory()) await archive(path.join(dir, entry.name), `${prefix}/${entry.name}`);
      else if (extensions.has(path.extname(entry.name))) paths.push(`${prefix}/${entry.name}`);
    }
  }
  await archive(path.join(sourceRoot, 'news-archive'), 'news-archive');
  for (const required of ['index.html', 'news-app-2.js', 'news-card-copy.js', 'news-app-2-config.js', 'offline-db.js', 'native-device-bridge.js']) {
    if (!paths.includes(required)) throw new Error(`Missing app input: ${required}`);
  }
  const stage = path.join(wrapper, `.www-stage-${process.pid}-${Date.now()}`);
  await fs.mkdir(stage);
  let sourceCommit;
  let sourceMode = 'working-tree';
  try {
    const gitOptions = { cwd: sourceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
    const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], gitOptions).trim();
    if (path.resolve(gitRoot).toLowerCase() !== path.resolve(sourceRoot).toLowerCase()) throw new Error('Source archive is inside another repository');
    sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], gitOptions).trim();
  }
  catch {
    const origin = JSON.parse(await fs.readFile(path.join(wrapper, 'SOURCE-ORIGIN.json'), 'utf8'));
    if (!/^[a-f0-9]{40}$/.test(origin.frontendBaselineCommit)) throw new Error('Invalid archive source origin');
    sourceCommit = origin.frontendBaselineCommit;
    sourceMode = 'source-archive-with-byte-manifest';
  }
  const manifest = { schemaVersion: 1, sourceCommit, sourceMode, files: {}, adaptations: ['index.html: iOS adapters, safe-area stylesheet and blob CSP for local exports/images', 'news-app-2.js: explicit iOS article-asset storage'] };
  for (const name of paths.sort()) {
    const bytes = await fs.readFile(path.join(sourceRoot, name));
    let output = bytes;
    if (name === 'index.html') {
      output = Buffer.from(bytes.toString('utf8')
        .replace("img-src 'self' data: https:", "img-src 'self' data: blob: https:")
        .replace("connect-src 'self' ", "connect-src 'self' blob: ")
        .replace('</head>', '  <link rel="stylesheet" href="wrn-ios.css">\n  <script src="wrn-ios.js"></script>\n  <script src="wrn-ios-assets.js"></script>\n</head>'));
    }
    if (name === 'news-app-2.js') {
      const marker = 'async function cacheSavedArticleAssets(article) {';
      const text = bytes.toString('utf8');
      if (text.split(marker).length !== 2) throw new Error('iOS offline adaptation target changed');
      output = Buffer.from(text.replace(marker, `${marker}\n    if (window.WRNIOSAssets) return window.WRNIOSAssets.save(savedArticleAssetUrls(article));`));
    }
    const destination = path.join(stage, name);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, output);
    manifest.files[name] = { sourceSha256: hash(bytes), packagedSha256: hash(output) };
  }
  for (const name of ['wrn-ios.js', 'wrn-ios-assets.js', 'wrn-ios.css']) {
    const bytes = await fs.readFile(path.join(wrapper, 'web', name));
    await fs.writeFile(path.join(stage, name), bytes);
    manifest.files[name] = { sourceSha256: hash(bytes), packagedSha256: hash(bytes), platformAdapter: true };
  }
  const live = path.join(wrapper, 'www');
  const backups = path.join(wrapper, '.tmp');
  await fs.mkdir(backups, { recursive: true });
  // No recursive deletion. Preserve the previous generated package for rollback.
  try {
    const previous = await fs.lstat(live);
    if (previous.isSymbolicLink() || !previous.isDirectory()) throw new Error('Invalid www destination');
    await fs.rename(live, path.join(backups, `www-${Date.now()}`));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.rename(stage, live);
  await fs.writeFile(path.join(wrapper, '.tmp', 'web-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await prepareWeb();
  console.log(`Prepared ${Object.keys(result.files).length} iOS assets from ${result.sourceCommit}; manifest: ios-wrapper/.tmp/web-manifest.json`);
}
