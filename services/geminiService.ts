import { GenerationSettings, VoiceAnalysisResult } from "../types";
import { VOICES, STYLES, ACCENTS } from "../constants";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent";

export async function generateSpeech(text: string, settings: GenerationSettings): Promise<string> {
  const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
  const accentDetail = ACCENTS.find((a) => a.label === settings.accent) || ACCENTS[0];
  
  // Construir el prompt exacto de AI Studio
  let speedDesc = "normal";
  if (settings.speed < 0.8) speedDesc = "muy lenta";
  else if (settings.speed < 1.0) speedDesc = "lenta";
  else if (settings.speed > 1.5) speedDesc = "muy rápida";
  else if (settings.speed > 1.0) speedDesc = "rápida";

  let pitchDesc = "normal";
  if (settings.pitch < -5) pitchDesc = "muy grave y profundo";
  else if (settings.pitch < 0) pitchDesc = "grave";
  else if (settings.pitch > 5) pitchDesc = "muy agudo";
  else if (settings.pitch > 0) pitchDesc = "agudo";

  const prompt = `
    Por favor, lee el siguiente texto en voz alta. 
    Es CRÍTICO que utilices un acento español de España, específicamente de la zona centro (Castilla).

    Instrucciones de Dirección de Voz Regional:
    - Región Específica: ${settings.accent}.
    - Detalle de Acento: ${accentDetail.description}
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

  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice.apiVoiceName
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error en la conexión con Google");
  }

  const data = await response.json();
  const base64Audio = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("El modelo no devolvió audio. Verifica tu configuración en Google Cloud.");
  }

  return base64Audio;
}

export async function analyzeVoiceSample(base64Audio: string): Promise<any> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "audio/mp3", data: base64Audio } },
          { text: "Analyze this voice sample and return JSON: gender, pitch, speed, style, accent." }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const jsonMatch = text.match(/\{.*\}/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
}