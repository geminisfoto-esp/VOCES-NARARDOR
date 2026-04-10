import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationSettings, VoiceOption } from "../types";
import { VOICES, STYLES, ACCENTS } from "../constants";

// Usamos la libreria estable que funcionaba ayer
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '');

export async function generateSpeech(
  text: string,
  settings: GenerationSettings
): Promise<string> {
  const voice = VOICES.find((v) => v.id === settings.voiceId) || VOICES[0];
  const accentDetail = ACCENTS.find((a) => a.label === settings.accent) || ACCENTS[0];
  
  // Construct a prompt that guides the model on HOW to speak the text
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
    INSTRUCCIÓN DE IDENTIDAD VOCAL (CRÍTICA):
    Actúa como un locutor profesional con IDENTIDAD FIJA.
    - Nombre del Personaje: ${voice.name}
    - Género: ${voice.gender === 'male' ? 'Masculino' : 'Femenino'}
    - Estilo Emocional: ${settings.style}
    - Velocidad: ${speedDesc}
    - Tono: ${pitchDesc}

    TEXTO A GENERAR:
    "${text}"
  `;

  try {
    // Usamos el modelo v1.5-flash que es el estandar oro para esta libreria
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned. Check model visibility.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
}

export interface VoiceAnalysisResult {
  gender: 'male' | 'female';
  pitch: number;
  speed: number;
  style: string;
  accent: string;
}

export async function analyzeVoiceSample(base64Audio: string): Promise<VoiceAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([
    { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
    { text: "Analyze this voice sample and return JSON with: gender, pitch, speed, style, accent." }
  ]);
  
  const text = result.response.text();
  return JSON.parse(text) as VoiceAnalysisResult;
}