import { requireSession } from './_lib/session.js';

const ANALYZE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SESSION_SECRET;
  const configured = Boolean(process.env.APP_USER && process.env.APP_PASSWORD && secret);
  if (configured && !requireSession(req, secret as string)) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { audioBase64 } = req.body as { audioBase64: string };
  if (!audioBase64) {
    return res.status(400).json({ error: 'Falta el audio a analizar' });
  }

  try {
    const response = await fetch(`${ANALYZE_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'audio/mp3', data: audioBase64 } },
            { text: 'Analyze this voice sample and return JSON: gender, pitch, speed, style, accent.' },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{.*\}/s);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    return res.status(200).json(analysis);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'No se pudo analizar el audio' });
  }
}
