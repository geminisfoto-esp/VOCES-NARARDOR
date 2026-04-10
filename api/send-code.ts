import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;
    const resend = new Resend(process.env.VITE_RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'Voces Narrador <onboarding@resend.dev>',
      to: email,
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

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
