import { readFile, writeFile } from 'node:fs/promises';

// Run after the existing estimate build. Only the homepage's Google tag
// bootstrap changes; all lead handlers, identifiers, phone numbers and design stay.
const file = new URL('../index.html', import.meta.url);
let html = await readFile(file, 'utf8');
const marker = '<!-- nj-standard-google-tag-20261031 -->';
const standard = `${marker}
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18146670851"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18146670851');
  gtag('config', 'G-E7NG44429T');
  gtag('config', 'AW-18146670851/OnzICJfTuoAdEIPygM1D', { 'phone_conversion_number': '(856) 874-6640' });
</script>`;
if (!html.includes(marker)) {
  const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/\bsrc=/i.test(m[1]) && m[2].includes("gtag('config', 'AW-18146670851', { send_page_view: false })") && m[2].includes('function loadGtag()'));
  if (blocks.length !== 1) throw new Error('Expected exactly one delayed homepage Google tag bootstrap; no changes written');
  const block = blocks[0][0];
  if (!block.includes("phone_conversion_number': '(856) 874-6640'") || !block.includes('G-E7NG44429T')) throw new Error('Existing tracking identifiers changed; no changes written');
  html = html.replace(block, '');
  if (!/<head\s*>/i.test(html)) throw new Error('Homepage head not found');
  html = html.replace(/<head\s*>/i, m => m + '\n  ' + standard);
}
if ((html.match(/src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18146670851"/g) || []).length !== 1) throw new Error('Expected one static Ads tag loader');
if (html.includes('function loadGtag()') || html.includes('send_page_view: false')) throw new Error('Legacy delayed tag setup remains');
for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc=/i.test(m[1]) && !/type=["']application\/ld\+json["']/i.test(m[1])) new Function(m[2]);
}
if (!html.includes('/estimate-form.js?v=20261029-repair1')) throw new Error('Confirmed estimate handler missing');
await writeFile(file, html);
console.log('NJ homepage standard Google tag verified: immediate async loader, existing Analytics and website-call settings preserved.');
