export interface VoiceOption {
  id: string;
  name: string;
  descriptor: string; // Character adjective, e.g. "Firme", "Cálida"
  apiVoiceName: string; // The actual name sent to Gemini (Puck, Kore, etc.)
}

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  audioBlob: Blob; // Raw PCM wrapped in WAV container for download/play
  duration: number;
  settings: {
    voiceName: string;
    style: string;
  };
}

export interface GenerationSettings {
  voiceId: string;
  language: string;
  voiceDescription: string; // free text: age/character, e.g. "niña de 9 años, alegre"
  style: string;
  speed: number; // 0.5 to 2.0
  pitch: number; // -10 to 10
}

export type TagType = '[pausa]' | '[risa]' | '[grito]' | '[llanto]' | '[susurro]' | '[aplausos]';