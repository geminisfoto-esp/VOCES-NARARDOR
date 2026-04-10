import { GenerationSettings, VoiceAnalysisResult } from "../types";
import { VOICES } from "../constants";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function generateSpeech(text: string, settings: GenerationSettings): Promise<string> {
  const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
  
  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ 
        parts: [{ text: `Genera la narración de audio profesional para el siguiente texto, usando estilo narrador: ${text}` }] 
      }],
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
    throw new Error("El modelo no devolvió audio. Verifica que tu cuenta tenga habilitada la opción de salida de audio.");
  }

  return base64Audio;
}

export async function analyzeVoiceSample(base64Audio: string): Promise<VoiceAnalysisResult> {
  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
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