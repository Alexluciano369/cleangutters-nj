import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../index.html', import.meta.url);
let source = await readFile(file, 'utf8');

const trackingMarker = "          gtag('event', 'ads_conversion_Submit_lead_form_1');";
const trackingReplacement = `${trackingMarker}\n          gtag('event', 'qualify_lead', {\n            territory: 'south_jersey',\n            lead_source: 'google_ads',\n            lead_stage: 'confirmed_form_submit'\n          });`;

if (!source.includes(trackingMarker)) {
  throw new Error('Confirmed-lead tracking marker was not found in index.html');
}
source = source.replace(trackingMarker, trackingReplacement);

const offerMarker = '        <p class="form-sub">Real South Jersey work · Alex usually responds within 2 business hours</p>';
const offerReplacement = '        <p class="form-sub"><strong>Fall offer: Save $250 on a new gutter guard installation.</strong><br>Seniors and military get 10% off instead — whichever saves more. New installations only. Discounts cannot be combined. Book your free estimate by October 31, 2026. No pressure.</p>';

if (!source.includes(offerMarker)) {
  throw new Error('Estimate-form offer marker was not found in index.html');
}
source = source.replace(offerMarker, offerReplacement);

const titleMarker = '<h2>Get Your Free Estimate</h2>';
const titleReplacement = '<h2>Save $250 on Gutter Guard Installation</h2>';
if (!source.includes(titleMarker)) {
  throw new Error('Estimate-form title marker was not found in index.html');
}
source = source.replace(titleMarker, titleReplacement);

const serviceMarker = `          <label for="service">What Do You Need? *</label>
          <select id="service" name="service" required>
            <option value="gutter-protection">Gutter Guard Installation</option>
            <option value="gutter-cleaning">Gutter Cleaning</option>
            <option value="new-gutters">New Gutters</option>
            <option value="gutter-repair">Gutter Repair</option>
            <option value="new-downspouts">New Downspouts</option>
            <option value="outdoor-lighting">Permanent Outdoor Lighting</option>
            <option value="all-gutter-services">All Gutter Services</option>
            <option value="other">Other / Not Sure</option>
          </select>`;
const serviceReplacement = '          <input type="hidden" id="service" name="service" value="gutter-protection">';
if (!source.includes(serviceMarker)) {
  throw new Error('Estimate-form service field marker was not found in index.html');
}
source = source.replace(serviceMarker, serviceReplacement);
source = source.replace('Get My Free Estimate →', 'Claim My $250 Savings →');

await writeFile(file, source);
console.log('Added exact $250 offer, senior and military terms, short form and lead tracking.');
