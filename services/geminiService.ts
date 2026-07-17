import { GenerationSettings } from "../types";

export async function generateSpeech(text: string, settings: GenerationSettings, signal?: AbortSignal): Promise<string> {
  const response = await fetch('/api/generate-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text, settings }),
    signal,
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || 'Error en la conexión con Google');
    // El servidor responde 499 cuando aborta la generación (cancelación del
    // cliente o límite de seguridad) — se marca igual que un AbortError
    // nativo del navegador para que la UI lo trate de forma consistente.
    if (response.status === 499) err.name = 'AbortError';
    throw err;
  }

  return data.audio;
}

export async function analyzeVoiceSample(base64Audio: string): Promise<any> {
  const response = await fetch('/api/analyze-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ audioBase64: base64Audio }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo analizar el audio');
  }

  return data;
}
