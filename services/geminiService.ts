import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GenerationSettings, VoiceOption } from "../types";
import { VOICES, STYLES, ACCENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
    Actúa como un locutor profesional con IDENTIDAD FIJA. No cambies el timbre, la edad ni la textura de la voz entre generaciones.
    
    PERFIL DEL PERSONAJE:
    - Nombre del Personaje: ${voice.name}
    - Género: ${voice.gender === 'male' ? 'Masculino' : 'Femenino'}
    - Acento: Castellano de España (Región: ${settings.accent})
    - Característica Regional: ${accentDetail.description}
    
    DIRECCIÓN TÉNICA DE VOZ (MANTENER ESTABLE):
    - Estilo Emocional: ${settings.style}
    - Velocidad de Habla: ${speedDesc}
    - Tono/Pitch: ${pitchDesc}
    
    GUÍA DE ETIQUETAS:
    - [pausa]: Silencia por 2 segundos.
    - [risa]: Inserta una risa natural del personaje.
    - [grito]: Aumenta la proyección vocal sin cambiar la identidad.
    - [susurro]: Voz sibilante manteniendo el timbre del personaje.

    TEXTO A GENERAR (RESPETA PUNTUACIÓN):
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice.apiVoiceName,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    const modelUsed = "gemini-2.5-flash-tts";
    if (error.status === 403) throw new Error("Acceso denegado (403). Tu clave API no tiene permisos para este modelo.");
    if (error.status === 404) throw new Error("Modelo no encontrado (404). El modelo '" + modelUsed + "' podria no estar disponible en tu region.");
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
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
        { text: `
          Analyze this voice sample and extract the following parameters:
          1. Gender (male or female)
          2. Pitch (scale -10 to 10)
          3. Speed (scale 0.5 to 2.0)
          4. Style (natural, cheerful, sad, whisper, storyteller)
          5. Accent (choose closest label from: Madrid (Castizo), Toledo (Castellano), España (Norte))
        ` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gender: { type: Type.STRING, enum: ['male', 'female'] },
          pitch: { type: Type.NUMBER },
          speed: { type: Type.NUMBER },
          style: { type: Type.STRING, enum: STYLES.map(s => s.id) },
          accent: { type: Type.STRING, enum: ACCENTS.map(a => a.label) }
        },
        required: ['gender', 'pitch', 'speed', 'style', 'accent']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Could not analyze voice sample");
  
  return JSON.parse(text) as VoiceAnalysisResult;
}