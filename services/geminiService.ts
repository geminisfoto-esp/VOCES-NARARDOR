import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationSettings, VoiceAnalysisResult } from "../types";
import { VOICES } from "../constants";

// Priorizar la lectura de la clave desde el entorno
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSpeech(text: string, settings: GenerationSettings): Promise<string> {
  const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
  
  const prompt = `
    Eres un narrador profesional con voz ${voice.gender === 'male' ? 'masculina' : 'femenina'}.
    Tu estilo es ${settings.style}. Tu acento es ${settings.accent}.
    
    Genera una narración natural y profesional para el siguiente texto.
    Usa un ritmo de ${settings.speed}x y un tono de ${settings.pitch}.
    
    TEXTO A NARRAR:
    ${text}
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-1.5-flash-8b-001", 
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Genera el audio para este texto: ${text}` }] }],
      generationConfig: {
        responseModalities: ["audio" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice.apiVoiceName
            }
          }
        }
      } as any
    });

    const response = await result.response;
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("Google aceptó el pago pero no devolvió el audio todavía. Prueba con un texto más corto.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
}

export async function analyzeVoiceSample(base64Audio: string): Promise<VoiceAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent([
    { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
    { text: "Analyze this voice sample and return JSON with: gender, pitch, speed, style, accent. Return ONLY JSON." }
  ]);
  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{.*\}/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
}