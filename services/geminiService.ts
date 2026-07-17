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
    throw new Error(data.error || 'Error en la conexión con Google');
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
