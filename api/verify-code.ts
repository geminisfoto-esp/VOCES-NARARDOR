import { verifyToken, readCookie, makeToken, setCookie, clearCookie } from './_lib/session.js';

const SESSION_TTL_SEC = 7 * 24 * 60 * 60;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'SESSION_SECRET no configurado en el servidor.' });
  }

  const { code } = req.body || {};
  const pending = verifyToken<{ code: string }>(readCookie(req, 'pending_auth'), secret);

  if (!pending || pending.code !== code) {
    return res.status(401).json({ error: 'Código de verificación incorrecto' });
  }

  clearCookie(res, 'pending_auth');
  setCookie(res, 'app_session', makeToken({}, secret, SESSION_TTL_SEC), SESSION_TTL_SEC);
  return res.status(200).json({ ok: true });
}
