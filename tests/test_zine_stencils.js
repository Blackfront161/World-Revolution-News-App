'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');
const printCss = fs.readFileSync(path.join(root, 'zine-designer.css'), 'utf8');

assert(app.includes('data-action="zine-panel"'), 'Zine has no second-level tab control');
assert(app.includes('data-value="stencils"'), 'Zine spray-stencil subtab is missing');
assert(app.includes('data-action="zine-stencil-select"'), 'Stencil motifs cannot be selected');
assert(app.includes('data-action="zine-stencil-download"'), 'Stencil SVG cannot be saved');
assert(app.includes('data-action="zine-stencil-print"'), 'Stencil cannot be printed or saved as PDF');
assert(app.includes("stencilId: 'red-shepherd-solidarity'"), 'Curated default stencil state is missing');

for (const id of [
  'red-shepherd-solidarity', 'red-shepherd-refugees', 'red-shepherd-no-one-illegal',
  'red-shepherd-unite', 'red-shepherd-feminism', 'red-shepherd-international-solidarity',
  'kreaktivismus-all-arms', 'kreaktivismus-all-arms-group', 'kreaktivismus-stay-all',
  'kreaktivismus-antifa-action', 'kreaktivismus-fight-racism',
  'kreaktivismus-fight-white-pride', 'kreaktivismus-fight-authority'
]) {
  assert(app.includes(`id:'${id}'`), `Curated external stencil missing: ${id}`);
}

for (const id of [
  'raised-fist', 'megaphone', 'peace-dove', 'broken-chain',
  'resistance-flower', 'no-surveillance', 'mutual-aid', 'broken-circle-a',
  'open-book-flame', 'housing-for-all', 'earth-leaf', 'broken-missile-flower'
]) {
  assert(app.includes(`id:'${id}'`), `Stencil motif missing: ${id}`);
}

assert(app.includes('function stencilDownloadSvg'), 'Scalable SVG export is missing');
assert(app.includes('function printZineStencil'), 'Print/PDF workflow is missing');
assert(app.includes("'image/svg+xml;charset=utf-8'"), 'SVG MIME type is missing');
assert(app.includes('zineStencilCutSafe'), 'Cut-safe stencil guidance is missing');
assert(app.includes('zineStencilExternal'), 'External stencil sources are not labelled');
assert(app.includes('zineStencilExternalHint'), 'External stencil cutting guidance is missing');
assert(app.includes("orientation:'landscape'"), 'Wide stencil has no landscape print format');
assert(app.includes("size: A4 ${landscape ? 'landscape' : 'portrait'}"), 'Print orientation is not selected per stencil');
assert(app.includes('https://red-shepherd.de/diy/stencil-vorlagen-schablonen/'), 'Red Shepherd source is missing');
assert(app.includes('https://kreaktivismus.org/downloadbereich/stencils/'), 'Kreaktivismus source is missing');
assert(!app.toLowerCase().includes('solidcorona'), 'Vaccination stencil must not be included');
assert(!app.toLowerCase().includes('pitbull'), 'Pitbull stencil must not be included');
const stencilDefinitions = app.slice(
  app.indexOf('const ZINE_STENCILS'),
  app.indexOf('function zineStencil(')
);
assert(!stencilDefinitions.includes('fill="#fff"'), 'A white island would make a stencil area fall out');
assert(!app.includes('data-action="zine-template"'), 'Old issue-layout template cards are still rendered');
assert(css.includes('.zine-stencil-grid'), 'Stencil library styles are missing');
assert(css.includes('.zine-stencil-card.is-selected'), 'Selected stencil has no visible state');
assert(printCss.includes('.wrn-stencil-printing'), 'Stencil-only print layout is missing');
assert(printCss.includes('.wrn-stencil-printing img'), 'External stencil images are not covered by print layout');

console.log('Zine spray stencils: OK');
