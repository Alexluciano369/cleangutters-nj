import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const version = '20261104-formfix';
const pages = ['index.html', 'gutters-v2.html', 'cherry-hill-gutter-guards.html', 'gutter-guard-installation-near-cherry-hill/index.html', 'gutter-cleaning/index.html', 'gutter-installation/index.html', 'gutter-repair/index.html'];
const serviceJs = await readFile(new URL('service-page.js', root), 'utf8');
if (serviceJs.includes('formsubmit.co') || serviceJs.includes("querySelectorAll('[data-lead-form]')")) throw new Error('Legacy service form handler remains; abort publish');
const client = await readFile(new URL('estimate-form.js', root), 'utf8');
new Function(client);
if (!client.includes('result.success !== true') || !client.includes('if (TEST')) throw new Error('Confirmed delivery and test exclusion required');
for (const path of pages) {
  let html = await readFile(new URL(path, root), 'utf8');
  html = html.replace(/src="\/service-page\.js(?:\?[^"\s]*)?"/g, 'src="/service-page.js?v=' + version + '"');
  html = html.replace(/src="\/estimate-form\.js(?:\?[^"\s]*)?"/g, 'src="/estimate-form.js?v=' + version + '"');
  html = html.replace(/<div\b[^>]*>SENIORS SAVE 10%[^<]*Book by Oct\. 31[^<]*<\/div>/g, '');
  html = html.replace('<h2>Save $250 on Gutter Guard Installation</h2>', '<h2>Get Your Free Gutter Guard Estimate</h2>');
  html = html.replace(/<p class="form-sub"><strong>Fall offer: Save \$250 on a new gutter guard installation\.<\/strong><br>Seniors and military get 10% off instead[^<]*October 31, 2026\. No pressure\.<\/p>/g, '<p class="form-sub">Owner-installed by Alex. Free estimate. No pressure, no obligation.</p>');
  html = html.replaceAll('Claim My $250 Savings →', 'Request My Free Estimate →');
  if (!html.includes('/estimate-form.js?v=' + version)) throw new Error('Shared form handler missing: ' + path);
  await writeFile(new URL(path, root), html);
}
console.log('NJ forms: versioned service and estimate scripts; expired homepage and service banners removed.');
