import { VoiceOption } from './types';

// Las 30 voces reales del modelo de audio nativo de Gemini
// (https://ai.google.dev/gemini-api/docs/speech-generation), con su
// descriptor de carácter oficial traducido.
export const VOICES: VoiceOption[] = [
  { id: 'zephyr', name: 'Zephyr', descriptor: 'Brillante', apiVoiceName: 'Zephyr' },
  { id: 'puck', name: 'Puck', descriptor: 'Enérgica', apiVoiceName: 'Puck' },
  { id: 'charon', name: 'Charon', descriptor: 'Informativa', apiVoiceName: 'Charon' },
  { id: 'kore', name: 'Kore', descriptor: 'Firme', apiVoiceName: 'Kore' },
  { id: 'fenrir', name: 'Fenrir', descriptor: 'Excitable', apiVoiceName: 'Fenrir' },
  { id: 'leda', name: 'Leda', descriptor: 'Juvenil', apiVoiceName: 'Leda' },
  { id: 'orus', name: 'Orus', descriptor: 'Firme', apiVoiceName: 'Orus' },
  { id: 'aoede', name: 'Aoede', descriptor: 'Desenfadada', apiVoiceName: 'Aoede' },
  { id: 'callirrhoe', name: 'Callirrhoe', descriptor: 'Relajada', apiVoiceName: 'Callirrhoe' },
  { id: 'autonoe', name: 'Autonoe', descriptor: 'Brillante', apiVoiceName: 'Autonoe' },
  { id: 'enceladus', name: 'Enceladus', descriptor: 'Susurrante', apiVoiceName: 'Enceladus' },
  { id: 'iapetus', name: 'Iapetus', descriptor: 'Clara', apiVoiceName: 'Iapetus' },
  { id: 'umbriel', name: 'Umbriel', descriptor: 'Relajada', apiVoiceName: 'Umbriel' },
  { id: 'algieba', name: 'Algieba', descriptor: 'Suave', apiVoiceName: 'Algieba' },
  { id: 'despina', name: 'Despina', descriptor: 'Suave', apiVoiceName: 'Despina' },
  { id: 'erinome', name: 'Erinome', descriptor: 'Clara', apiVoiceName: 'Erinome' },
  { id: 'algenib', name: 'Algenib', descriptor: 'Rasgada', apiVoiceName: 'Algenib' },
  { id: 'rasalgethi', name: 'Rasalgethi', descriptor: 'Informativa', apiVoiceName: 'Rasalgethi' },
  { id: 'laomedeia', name: 'Laomedeia', descriptor: 'Enérgica', apiVoiceName: 'Laomedeia' },
  { id: 'achernar', name: 'Achernar', descriptor: 'Suave', apiVoiceName: 'Achernar' },
  { id: 'alnilam', name: 'Alnilam', descriptor: 'Firme', apiVoiceName: 'Alnilam' },
  { id: 'schedar', name: 'Schedar', descriptor: 'Neutra', apiVoiceName: 'Schedar' },
  { id: 'gacrux', name: 'Gacrux', descriptor: 'Madura', apiVoiceName: 'Gacrux' },
  { id: 'pulcherrima', name: 'Pulcherrima', descriptor: 'Directa', apiVoiceName: 'Pulcherrima' },
  { id: 'achird', name: 'Achird', descriptor: 'Amistosa', apiVoiceName: 'Achird' },
  { id: 'zubenelgenubi', name: 'Zubenelgenubi', descriptor: 'Casual', apiVoiceName: 'Zubenelgenubi' },
  { id: 'vindemiatrix', name: 'Vindemiatrix', descriptor: 'Gentil', apiVoiceName: 'Vindemiatrix' },
  { id: 'sadachbia', name: 'Sadachbia', descriptor: 'Vivaz', apiVoiceName: 'Sadachbia' },
  { id: 'sadaltager', name: 'Sadaltager', descriptor: 'Erudita', apiVoiceName: 'Sadaltager' },
  { id: 'sulafat', name: 'Sulafat', descriptor: 'Cálida', apiVoiceName: 'Sulafat' },
];

// Subconjunto verificado por el usuario para el detector automático de
// voz por audio (analyze-voice) — el resto del catálogo no se ha
// contrastado con detección de género real.
export const VERIFIED_VOICE_IDS = ['puck', 'charon', 'fenrir', 'kore', 'zephyr'];

export const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'Inglés' },
  { id: 'fr', label: 'Francés' },
  { id: 'de', label: 'Alemán' },
  { id: 'it', label: 'Italiano' },
  { id: 'pt', label: 'Portugués' },
];

export const STYLES = [
  { id: 'natural', label: 'Natural' },
  { id: 'cheerful', label: 'Alegre' },
  { id: 'sad', label: 'Triste' },
  { id: 'whisper', label: 'Susurrar' },
  { id: 'storyteller', label: 'Storyteller' },
];

export const SPECIAL_TAGS = [
  { tag: '[pausa]', label: 'Pausa (2s)', icon: 'pause' },
  { tag: '[risa]', label: 'Risa', icon: 'smile' },
  { tag: '[grito]', label: 'Grito', icon: 'megaphone' },
  { tag: '[llanto]', label: 'Llanto', icon: 'frown' },
  { tag: '[susurro]', label: 'Susurro', icon: 'wind' },
  { tag: '[aplausos]', label: 'Aplausos', icon: 'party' },
];
