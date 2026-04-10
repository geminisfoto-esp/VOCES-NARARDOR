const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("Resend API Key no configurada");
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Voces Narrador <onboarding@resend.dev>',
        to: email,
        subject: `${code} es tu código de acceso a Voces Narrador`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #020617; color: white; border-radius: 20px; border: 1px solid #312e81;">
            <h2 style="color: #6366f1; margin-bottom: 20px;">Seguridad Voces Narrador</h2>
            <p style="color: #94a3b8;">Tu código de verificación de un solo uso es:</p>
            <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid #1e1b4b;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: white;">${code}</span>
            </div>
            <p style="color: #475569; font-size: 12px;">Este código caducará en unos minutos. Si no has intentado entrar, puedes ignorar este correo.</p>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
}
