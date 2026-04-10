export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    // Ahora llamamos a nuestra propia función de Vercel en lugar de directamente a Resend
    const response = await fetch('/api/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error al llamar a la API de envío:", error);
    return false;
  }
}
