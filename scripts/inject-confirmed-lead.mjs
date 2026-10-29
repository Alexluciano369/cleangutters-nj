import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const file = new URL('index.html', root);
let source = await readFile(file, 'utf8');
const offerMarker = '        <p class="form-sub">Real South Jersey work · Alex usually responds within 2 business hours</p>';
const offerReplacement = '        <p class="form-sub"><strong>Fall offer: Save $250 on a new gutter guard installation.</strong><br>Seniors and military get 10% off instead — whichever saves more. New installations only. Discounts cannot be combined. Book your free estimate by October 31, 2026. No pressure.</p>';
if (source.includes(offerMarker)) source = source.replace(offerMarker, offerReplacement);
else if (!source.includes(offerReplacement)) throw new Error('Estimate-form offer marker not found');
const titleMarker = '<h2>Get Your Free Estimate</h2>';
const titleReplacement = '<h2>Save $250 on Gutter Guard Installation</h2>';
if (source.includes(titleMarker)) source = source.replace(titleMarker, titleReplacement);
else if (!source.includes(titleReplacement)) throw new Error('Estimate-form title marker not found');
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
if (source.includes(serviceMarker)) source = source.replace(serviceMarker, serviceReplacement);
else if (!source.includes(serviceReplacement)) throw new Error('Estimate-form service marker not found');
source = source.replace('Get My Free Estimate →', 'Claim My $250 Savings →');

// Keep the existing project, design, phone numbers and tracking. Replace only
// the legacy submit handlers with the route already deployed by Bolt.
const client = `(function () {
  'use strict';
  var ENDPOINT = 'https://kwswimlnfpflatpyycic.supabase.co/functions/v1/submit-estimate';
  var FAILURE = 'We could not confirm your request. Your details are still filled in. Please try again or call (856) 874-6640.';
  var TEST = new URLSearchParams(location.search).has('test');
  function status(form, text) {
    var node = form.querySelector('.status, [data-estimate-status]') || form.querySelector('#formError');
    if (!node) { node = document.createElement('p'); node.setAttribute('data-estimate-status', ''); node.setAttribute('role', 'alert'); node.setAttribute('aria-live', 'polite'); form.appendChild(node); }
    node.textContent = text; node.style.display = text ? 'block' : 'none'; node.style.color = '#b91c1c';
  }
  function track(form) {
    if (TEST || typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', 'conversion', {send_to:'AW-18146670851/HZx0COTCwqocEIPygM1D', value:150, currency:'USD'});
      if (form.id === 'leadForm') window.gtag('event', 'ads_conversion_Submit_lead_form_1');
      window.gtag('event', 'qualify_lead', {territory:'new_jersey', service:form.dataset.service || 'gutter-protection', lead_stage:'confirmed_form_submit'});
    } catch (_) { /* Tracking must never turn an accepted inquiry into failure. */ }
  }
  document.querySelectorAll('form#leadForm, form[data-lead-form]').forEach(function (form) {
    if (form.dataset.estimateBound) return;
    form.dataset.estimateBound = 'true';
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (form.dataset.sending === 'true' || form.dataset.sent === 'true') return;
      var button = form.querySelector('button[type="submit"], button:not([type])');
      var data = Object.fromEntries(new FormData(form));
      var name = (data.name || '').trim(), phone = (data.phone || '').trim();
      if (!name || !phone) { status(form, 'Please enter your name and phone number.'); return; }
      if (!form._leadKey) form._leadKey = 'lead-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
      var payload = {idempotency_key:form._leadKey, name:name, phone:phone, service:String(data.service || form.dataset.service || ''), page_url:location.origin + location.pathname, source:TEST ? 'ryze-delivery-test-not-a-customer' : form.dataset.source || form.id || 'estimate-form'};
      var original = button.textContent;
      form.dataset.sending = 'true'; button.disabled = true; button.textContent = 'Sending...'; status(form, '');
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 20000);
      try {
        var response = await fetch(ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal});
        var result = await response.json();
        if (!response.ok || result.success !== true) throw new Error('Submission not confirmed');
        form.dataset.sent = 'true';
        var success = document.getElementById('formSuccess');
        if (success) { form.style.display = 'none'; success.style.display = 'block'; }
        else { status(form, 'Request received. Alex will call you personally.'); var node = form.querySelector('.status, [data-estimate-status]'); if (node) node.style.color = '#047857'; }
        button.textContent = 'Request Sent';
        track(form);
      } catch (_) {
        status(form, FAILURE); button.disabled = false; button.textContent = original;
      } finally {
        clearTimeout(timer); form.dataset.sending = 'false';
      }
    });
  });
})();\n`;
const tag = '<script src="/estimate-form.js?v=20261029-repair1" defer></script>';
const planned = new Map();
function attach(html) {
  if (html.includes('/estimate-form.js')) return html;
  if (!html.includes('</body>')) throw new Error('Missing body close');
  return html.replace('</body>', tag + '\n</body>');
}
for (const path of ['index.html', 'gutters-v2.html', 'cherry-hill-gutter-guards.html', 'gutter-guard-installation-near-cherry-hill/index.html']) {
  let html = path === 'index.html' ? source : await readFile(new URL(path, root), 'utf8');
  const startMarker = "document.getElementById('leadForm').addEventListener('submit',";
  const start = html.indexOf(startMarker);
  if (start !== -1) {
    if (html.indexOf(startMarker, start + startMarker.length) !== -1) throw new Error('Multiple legacy handlers in ' + path);
    const next = html.indexOf("document.querySelectorAll('a[href^=\"tel:\"]')", start);
    if (next === -1) throw new Error('Phone handler boundary missing in ' + path);
    const comment = html.lastIndexOf('    // Track phone-call', next);
    const end = comment > start ? comment : next;
    html = html.slice(0, start) + '// Form submissions are handled by estimate-form.js.\n    ' + html.slice(end);
  } else if (!html.includes('/estimate-form.js')) throw new Error('Legacy handler missing in ' + path);
  if (html.includes('agents.runlobster.com/hooks/leads')) throw new Error('Legacy endpoint remains in ' + path);
  planned.set(path, attach(html));
}
let serviceJs = await readFile(new URL('service-page.js', root), 'utf8');
const serviceStart = serviceJs.indexOf("document.querySelectorAll('[data-lead-form]')");
const serviceEnd = serviceJs.indexOf("document.querySelectorAll('a[href^=\"tel:\"]')", serviceStart);
if (serviceStart !== -1 && serviceEnd > serviceStart) serviceJs = serviceJs.slice(0, serviceStart) + serviceJs.slice(serviceEnd);
else if (serviceJs.includes('formsubmit.co')) throw new Error('Service form boundary missing');
planned.set('service-page.js', serviceJs);
for (const path of ['gutter-cleaning/index.html', 'gutter-installation/index.html', 'gutter-repair/index.html']) {
  const html = await readFile(new URL(path, root), 'utf8');
  if (!html.includes('data-lead-form')) throw new Error('Service form missing in ' + path);
  planned.set(path, attach(html));
}
// Parse generated JavaScript before writing any generated output.
new Function(client);
new Function(serviceJs);
for (const [path, html] of planned) {
  if (path.endsWith('.html')) {
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/type=["']application\/ld\+json["']/i.test(match[1]) && !/\bsrc=/i.test(match[1])) new Function(match[2]);
    }
  }
}
await writeFile(new URL('estimate-form.js', root), client);
for (const [path, content] of planned) await writeFile(new URL(path, root), content);
console.log('Published shared timeout-safe estimate handler on seven NJ pages; existing design, phone and tracking preserved.');
