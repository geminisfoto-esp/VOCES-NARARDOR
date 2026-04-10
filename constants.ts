import { VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  // --- HOMBRES (10) ---
  { id: 'm1', name: 'Adrián (Madrid-Centro)', gender: 'male', apiVoiceName: 'Puck' },
  { id: 'm2', name: 'Alfonso (Toledo-Clásico)', gender: 'male', apiVoiceName: 'Charon' },
  { id: 'm3', name: 'Rodrigo (Castellano)', gender: 'male', apiVoiceName: 'Fenrir' },
  { id: 'm4', name: 'Sergio (Joven Madrid)', gender: 'male', apiVoiceName: 'Puck' },
  { id: 'm5', name: 'Mariano (Narrador Toledo)', gender: 'male', apiVoiceName: 'Charon' },
  { id: 'm6', name: 'Víctor (Enérgico)', gender: 'male', apiVoiceName: 'Fenrir' },
  { id: 'm7', name: 'Pablo (Suave)', gender: 'male', apiVoiceName: 'Puck' },
  { id: 'm8', name: 'Ignacio (Formal)', gender: 'male', apiVoiceName: 'Charon' },
  { id: 'm9', name: 'Fernando (Autoritario)', gender: 'male', apiVoiceName: 'Fenrir' },
  { id: 'm10', name: 'Dani (Amistoso)', gender: 'male', apiVoiceName: 'Puck' },
  
  // --- MUJERES (10) ---
  { id: 'f1', name: 'Jimena (Madrid-Ventas)', gender: 'female', apiVoiceName: 'Kore' },
  { id: 'f2', name: 'Beatriz (Toledo-Casco)', gender: 'female', apiVoiceName: 'Zephyr' },
  { id: 'f3', name: 'Lucía (Castellana)', gender: 'female', apiVoiceName: 'Kore' },
  { id: 'f4', name: 'Clara (Serena)', gender: 'female', apiVoiceName: 'Zephyr' },
  { id: 'f5', name: 'Isabel (Profesional)', gender: 'female', apiVoiceName: 'Kore' },
  { id: 'f6', name: 'Marta (Joven Capital)', gender: 'female', apiVoiceName: 'Zephyr' },
  { id: 'f7', name: 'Pilar (Madura Toledo)', gender: 'female', apiVoiceName: 'Kore' },
  { id: 'f8', name: 'Elena (Pausada)', gender: 'female', apiVoiceName: 'Zephyr' },
  { id: 'f9', name: 'Sara (Dinámica)', gender: 'female', apiVoiceName: 'Kore' },
  { id: 'f10', name: 'Inés (Tradicional)', gender: 'female', apiVoiceName: 'Zephyr' },
];

export const ACCENTS = [
  { id: 'madrid', label: 'Madrid (Castizo)', description: 'Entonación directa, pronunciación clara de la s, y el toque característico de la capital.' },
  { id: 'toledo', label: 'Toledo (Castellano)', description: 'Un castellano muy puro y sobrio, con un ritmo pausado típico de Castilla-La Mancha.' },
  { id: 'espana', label: 'España (Norte)', description: 'Acento del norte/estándar de la península, muy articulado.' },
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