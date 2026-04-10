import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationSettings, VoiceAnalysisResult } from "../types";
import { VOICES } from "../constants";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSpeech(text: string, settings: GenerationSettings): Promise<string> {
  const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
  
  try {
    // Usamos el ID de produccion mas estable para audio hoy en Google
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Genera la narración de audio profesional para este texto: ${text}` }] }],
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
    
    // Extracción de audio ultra-robusta (busca en todas las partes)
    let base64Audio = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Audio = part.inlineData.data;
        break;
      }
    }

    if (!base64Audio) {
      // Si no hay audio, miramos si nos ha dado un mensaje de por qué
      const textResponse = response.text() || "Sin respuesta de texto";
      throw new Error(`Google respondió pero la IA dijo: "${textResponse}". Posiblemente por restricciones de seguridad o facturación activa.`);
    }

    return base64Audio;
  } catch (error: any) {
    console.error("DEBUG - Gemini Full Error:", error);
    throw error;
  }
}

export async function analyzeVoiceSample(base64Audio: string): Promise<VoiceAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent([
    { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
    { text: "Analyze this voice sample and return JSON: gender, pitch, speed, style, accent." }
  ]);
  const response = await result.response;
  const jsonMatch = response.text().match(/\{.*\}/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response.text());
}