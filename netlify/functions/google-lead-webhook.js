const LEAD_ENDPOINT = 'https://aautomated-gutterleads.agents.runlobster.com/hooks/leads';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ message: 'POST required' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const suppliedKey = new URL(event.rawUrl || `https://cleangutters-nj.com${event.path || ''}`).searchParams.get('key');

    if (!suppliedKey || payload.google_key !== suppliedKey) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Invalid key' }) };
    }

    if (payload.is_test) {
      return { statusCode: 200, body: '{}' };
    }

    const fields = {};
    for (const item of payload.user_column_data || []) {
      if (item && item.column_id) fields[item.column_id] = item.string_value || '';
    }

    if (!fields.FULL_NAME || !fields.PHONE_NUMBER) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Name and phone are required' }) };
    }

    const response = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fields.FULL_NAME,
        phone: fields.PHONE_NUMBER,
        service: 'gutter-protection',
        pageUrl: `https://cleangutters-nj.com/?source=google-lead-form&campaign=${encodeURIComponent(payload.campaign_id || '')}&lead=${encodeURIComponent(payload.lead_id || '')}`
      })
    });

    if (!response.ok) {
      return { statusCode: 503, body: JSON.stringify({ message: 'Lead system unavailable' }) };
    }

    return { statusCode: 200, body: '{}' };
  } catch (error) {
    console.error('Google lead webhook error', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Temporary error' }) };
  }
};
