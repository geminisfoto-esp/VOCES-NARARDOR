import { Resend } from 'resend';
import { makeToken, setCookie } from './_lib/session';

const TARGET_EMAIL = 'geminisfoto@gmail.com';
const PENDING_TTL_SEC = 5 * 60;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const validUser = process.env.APP_USER;
  const validPass = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'SESSION_SECRET no configurado en el servidor.' });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = makeToken({ code }, secret, PENDING_TTL_SEC);
  setCookie(res, 'pending_auth', token, PENDING_TTL_SEC);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Voces Narrador <onboarding@resend.dev>',
      to: TARGET_EMAIL,
      subject: `${code} es tu código de acceso`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #020617; color: white; border-radius: 20px; border: 1px solid #312e81;">
          <h2 style="color: #6366f1; margin-bottom: 20px;">Seguridad Voces Narrador</h2>
          <p style="color: #94a3b8;">Tu código de verificación es:</p>
          <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid #1e1b4b;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: white;">${code}</span>
          </div>
        </div>
      `,
    });
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al enviar el código' });
  }
}
