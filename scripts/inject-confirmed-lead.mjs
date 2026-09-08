import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../index.html', import.meta.url);
let source = await readFile(file, 'utf8');

const trackingMarker = "          gtag('event', 'ads_conversion_Submit_lead_form_1');";
const trackingReplacement = `${trackingMarker}\n          gtag('event', 'qualify_lead', {\n            territory: 'south_jersey',\n            lead_source: 'google_ads',\n            lead_stage: 'confirmed_form_submit'\n          });`;

if (!source.includes(trackingMarker)) {
  throw new Error('Confirmed-lead tracking marker was not found in index.html');
}
source = source.replace(trackingMarker, trackingReplacement);

const offerMarker = '        <p class="form-sub">⏱ Alex usually responds within 2 business hours</p>';
const offerReplacement = '        <p class="form-sub"><strong>Fall, senior &amp; military savings available.</strong><br>Ask Alex what applies to your home. No pressure.</p>';

if (!source.includes(offerMarker)) {
  throw new Error('Estimate-form offer marker was not found in index.html');
}
source = source.replace(offerMarker, offerReplacement);

await writeFile(file, source);
console.log('Added confirmed-lead tracking and estimate-form savings message.');
