/**
 * Thin wrapper around EmailJS. All credentials come from public env vars
 * (safe to expose — EmailJS is designed for client-side use and is rate-limited
 * per key; pair it with Cloudflare Turnstile for spam protection).
 *
 * Required env vars (see .env.example / README):
 *   NEXT_PUBLIC_EMAILJS_SERVICE_ID
 *   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 *   NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID
 *   NEXT_PUBLIC_EMAILJS_RESERVATION_TEMPLATE_ID
 */

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const CONTACT_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID;
const RESERVATION_TEMPLATE =
  process.env.NEXT_PUBLIC_EMAILJS_RESERVATION_TEMPLATE_ID;

export const emailConfigured = Boolean(
  SERVICE_ID && PUBLIC_KEY && (CONTACT_TEMPLATE || RESERVATION_TEMPLATE),
);

type Params = Record<string, unknown>;

async function send(templateId: string | undefined, params: Params) {
  if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
    // Not configured yet — simulate latency so the UI flow can be reviewed.
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, simulated: true as const };
  }
  const { default: emailjs } = await import("@emailjs/browser");
  await emailjs.send(SERVICE_ID, templateId, params, { publicKey: PUBLIC_KEY });
  return { ok: true, simulated: false as const };
}

export function sendContact(params: Params) {
  return send(CONTACT_TEMPLATE, params);
}

export function sendReservation(params: Params) {
  return send(RESERVATION_TEMPLATE, params);
}
