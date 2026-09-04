import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../index.html', import.meta.url);
const source = await readFile(file, 'utf8');
const marker = "          gtag('event', 'ads_conversion_Submit_lead_form_1');";
const replacement = `${marker}\n          gtag('event', 'qualify_lead', {\n            territory: 'south_jersey',\n            lead_source: 'google_ads',\n            lead_stage: 'confirmed_form_submit'\n          });`;

if (!source.includes(marker)) {
  throw new Error('Confirmed-lead tracking marker was not found in index.html');
}

await writeFile(file, source.replace(marker, replacement));
console.log('Added GA4 confirmed-lead tracking to the deployed NJ page.');
