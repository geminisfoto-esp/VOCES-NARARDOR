import { requireSession } from './_lib/session.js';
import { VOICES } from '../constants.js';
import type { GenerationSettings } from '../types.js';

const TTS_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

// Seed estable derivada de la voz + ajustes (no del texto), para que
// distintas narraciones con los mismos parámetros suenen consistentes
// entre sí. Gemini documenta `seed` como "mejor esfuerzo", no exacto.
function stableSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SESSION_SECRET;
  const configured = Boolean(process.env.APP_USER && process.env.APP_PASSWORD && secret);
  if (configured && !requireSession(req, secret as string)) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { text, settings } = req.body as { text: string; settings: GenerationSettings };
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Falta el texto a narrar' });
  }

  const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
  const language = settings.language?.trim() || 'Español';
  const voiceDescription = settings.voiceDescription?.trim();

  let speedDesc = 'normal';
  if (settings.speed < 0.8) speedDesc = 'muy lenta';
  else if (settings.speed < 1.0) speedDesc = 'lenta';
  else if (settings.speed > 1.5) speedDesc = 'muy rápida';
  else if (settings.speed > 1.0) speedDesc = 'rápida';

  let pitchDesc = 'normal';
  if (settings.pitch < -5) pitchDesc = 'muy grave y profundo';
  else if (settings.pitch < 0) pitchDesc = 'grave';
  else if (settings.pitch > 5) pitchDesc = 'muy agudo';
  else if (settings.pitch > 0) pitchDesc = 'agudo';

  const prompt = `
    Por favor, lee el siguiente texto en voz alta.

    Instrucciones de Dirección de Voz:
    - Idioma objetivo: ${language}. Genera el audio en este idioma; si el texto ya está escrito en otro idioma, respeta el idioma del texto en su lugar.
    ${voiceDescription ? `- Perfil de la voz: ${voiceDescription}.` : ''}
    - Estilo: ${settings.style}
    - Velocidad: ${speedDesc}
    - Tono: ${pitchDesc}

    Instrucciones de Etiquetas Especiales:
    - [pausa]: Silencio de 2 segundos.
    - [risa]: Inserta una risa natural.
    - [grito]: Voz enérgica y exclamativa.
    - [llanto]: Voz quebrada.
    - [susurro]: Voz baja y sibilante.
    - [aplausos]: Sonido de ambiente de aplausos.

    Texto a leer:
    "${text}"
  `;

  const temperature = typeof settings.temperature === 'number' ? settings.temperature : 0.6;

  const seed = stableSeed(
    [voice.apiVoiceName, language, voiceDescription || '', settings.style, settings.speed, settings.pitch, temperature].join('|')
  );

  // Corta la petición a Gemini si el cliente cancela (cierra la conexión)
  // o si se pasa de un límite de seguridad, para no seguir gastando
  // cuota en una generación que ya nadie espera.
  const upstreamController = new AbortController();
  const onClientClose = () => upstreamController.abort();
  req.on?.('close', onClientClose);
  const safetyTimeout = setTimeout(() => upstreamController.abort(), 45_000);

  try {
    const response = await fetch(`${TTS_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: upstreamController.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['audio'],
          seed,
          temperature,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.apiVoiceName } },
          },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error en la conexión con Google' });
    }

    const base64Audio = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
    if (!base64Audio) {
      // Diagnóstico: qué devolvió Gemini realmente (finishReason, texto en
      // vez de audio, bloqueo de seguridad, etc.) — visible en Vercel Logs.
      console.error('Gemini no devolvió audio. Respuesta completa:', JSON.stringify({
        finishReason: data.candidates?.[0]?.finishReason,
        safetyRatings: data.candidates?.[0]?.safetyRatings,
        promptFeedback: data.promptFeedback,
        parts: data.candidates?.[0]?.content?.parts,
        seed,
        temperature,
        voice: voice.apiVoiceName,
      }));
      return res.status(502).json({ error: 'El modelo no devolvió audio. Verifica tu configuración en Google Cloud.' });
    }

    return res.status(200).json({ audio: base64Audio });
  } catch (error: any) {
    if (res.headersSent || res.writableEnded) return;
    if (error.name === 'AbortError') {
      return res.status(499).json({ error: 'Generación cancelada' });
    }
    return res.status(500).json({ error: error.message || 'Error desconocido' });
  } finally {
    clearTimeout(safetyTimeout);
    req.off?.('close', onClientClose);
  }
}
