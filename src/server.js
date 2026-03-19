import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { buildReply, defaultBusinessConfig } from './faq.js';

function loadEnvFile() {
  if (!existsSync('.env')) return;

  const content = readFileSync('.env', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const {
  PORT = 3000,
  VERIFY_TOKEN = 'verify-token',
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  BUSINESS_NAME,
  BUSINESS_DESCRIPTION,
  ADVISOR_LABEL,
  ADVISOR_HOURS,
  AD_SUMMARY,
  CALL_TO_ACTION,
  BUSINESS_HOURS,
  BUSINESS_LOCATION,
  BUSINESS_PRICING
} = process.env;

const businessConfig = {
  ...defaultBusinessConfig,
  businessName: BUSINESS_NAME || defaultBusinessConfig.businessName,
  businessDescription: BUSINESS_DESCRIPTION || defaultBusinessConfig.businessDescription,
  advisorLabel: ADVISOR_LABEL || defaultBusinessConfig.advisorLabel,
  advisorHours: ADVISOR_HOURS || defaultBusinessConfig.advisorHours,
  adSummary: AD_SUMMARY || defaultBusinessConfig.adSummary,
  callToAction: CALL_TO_ACTION || defaultBusinessConfig.callToAction,
  hours: BUSINESS_HOURS || defaultBusinessConfig.hours,
  location: BUSINESS_LOCATION || defaultBusinessConfig.location,
  pricing: BUSINESS_PRICING || defaultBusinessConfig.pricing
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/webhook') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return sendText(res, 200, challenge || '');
    }

    return sendText(res, 403, 'Forbidden');
  }

  if (req.method === 'POST' && url.pathname === '/webhook') {
    try {
      const body = await parseJsonBody(req);
      const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message || message.type !== 'text') {
        return sendText(res, 200, 'ok');
      }

      const from = message.from;
      const text = message.text?.body || '';
      const { intent, reply } = buildReply(text, businessConfig);

      console.log(`[bot] Intent detectado: ${intent} | Mensaje: ${text}`);

      if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.log('[bot] Respuesta simulada (faltan credenciales):', reply);
        return sendText(res, 200, 'ok');
      }

      const response = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          text: { body: reply }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[bot] Error enviando mensaje a Meta:', errorBody);
      }

      return sendText(res, 200, 'ok');
    } catch (error) {
      console.error('[bot] Error procesando webhook:', error);
      return sendText(res, 500, 'error');
    }
  }

  return sendText(res, 404, 'Not found');
});

server.listen(Number(PORT), () => {
  console.log(`Bot de WhatsApp escuchando en http://localhost:${PORT}`);
});
