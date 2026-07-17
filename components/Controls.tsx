import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANGUAGES, STYLES } from '../constants';
import { GenerationSettings } from '../types';

interface ControlsProps {
  settings: GenerationSettings;
  onChange: (newSettings: GenerationSettings) => void;
}

export const Controls: React.FC<ControlsProps> = ({ settings, onChange }) => {
  const [customLanguage, setCustomLanguage] = useState(
    LANGUAGES.some(l => l.label === settings.language) ? '' : settings.language
  );

  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const isCustomLanguage = !LANGUAGES.some(l => l.label === settings.language);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

      {/* Language Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-indigo-500" />
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Idioma</label>
        </div>
        <div className="flex flex-wrap gap-1.5 p-1.5 glass-panel rounded-2xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleChange('language', lang.label)}
              className={`flex-1 min-w-[80px] py-2.5 text-[11px] font-bold rounded-xl transition-all duration-300 ${
                settings.language === lang.label
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={isCustomLanguage ? settings.language : customLanguage}
          onChange={(e) => {
            setCustomLanguage(e.target.value);
            handleChange('language', e.target.value);
          }}
          placeholder="O escribe otro idioma..."
          className="w-full bg-slate-900/50 backdrop-blur-md text-slate-200 text-xs font-medium border border-white/5 rounded-2xl px-4 py-2.5 focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder-slate-600"
        />
      </div>

      {/* Style Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <span className="h-1 w-1 rounded-full bg-indigo-500" />
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estilo de Habla</label>
        </div>
        <div className="relative group">
          <select
            value={settings.style}
            onChange={(e) => handleChange('style', e.target.value)}
            className="w-full bg-slate-900/50 backdrop-blur-md text-slate-200 text-xs font-bold border border-white/5 rounded-2xl px-4 py-3 appearance-none focus:ring-2 ring-indigo-500/20 outline-none transition-all cursor-pointer group-hover:bg-slate-800/80"
          >
            {STYLES.map((style) => (
              <option key={style.id} value={style.id} className="bg-slate-900">
                {style.label.toUpperCase()}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
             <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Voice Profile (free text: age/character) */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-indigo-500" />
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Perfil de la Voz (opcional)</label>
        </div>
        <input
          type="text"
          value={settings.voiceDescription}
          onChange={(e) => handleChange('voiceDescription', e.target.value)}
          placeholder='ej. "niña de unos 9 años, alegre y curiosa" o "hombre mayor, voz cansada y sabia"'
          className="w-full bg-slate-900/50 backdrop-blur-md text-slate-200 text-xs font-medium border border-white/5 rounded-2xl px-4 py-3 focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder-slate-600"
        />
        <p className="text-[10px] text-slate-600 px-1">
          Es una sugerencia para el modelo, no un parámetro exacto — el resultado puede variar.
        </p>
      </div>

      {/* Speed Slider */}
      <div className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2">
             <span className="h-1 w-1 rounded-full bg-indigo-500" />
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocidad</label>
          </div>
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2 py-1 rounded-md border border-indigo-500/20">
            {settings.speed.toFixed(1)}X
          </span>
        </div>
        <div className="relative group px-1">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all group-hover:bg-slate-700"
          />
          <div className="flex justify-between mt-3 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
            <span>Andante</span>
            <span>Allegro</span>
          </div>
        </div>
      </div>

      {/* Pitch Slider */}
      <div className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2">
             <span className="h-1 w-1 rounded-full bg-indigo-500" />
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tonalidad</label>
          </div>
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2 py-1 rounded-md border border-indigo-500/20">
            {settings.pitch > 0 ? '+' : ''}{settings.pitch}
          </span>
        </div>
        <div className="relative group px-1">
          <input
            type="range"
            min="-10"
            max="10"
            step="1"
            value={settings.pitch}
            onChange={(e) => handleChange('pitch', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all group-hover:bg-slate-700"
          />
          <div className="flex justify-between mt-3 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
            <span>Grave</span>
            <span>Agudo</span>
          </div>
        </div>
      </div>

    </div>
  );
};
