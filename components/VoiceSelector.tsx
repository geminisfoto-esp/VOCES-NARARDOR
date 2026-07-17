import React, { useMemo, useState } from 'react';
import { VoiceOption } from '../types';
import { Search, Sparkles, Upload, Check, Loader2, Star } from 'lucide-react';
import { VOICES } from '../constants';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelect: (id: string) => void;
  onImport: (file: File) => void;
  isAnalyzing: boolean;
  recommendedVoiceId: string | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelect,
  onImport,
  isAnalyzing,
  recommendedVoiceId,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const descriptors = useMemo(
    () => Array.from(new Set(VOICES.map(v => v.descriptor))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VOICES.filter((v: VoiceOption) => {
      const matchesQuery = !q || v.name.toLowerCase().includes(q) || v.descriptor.toLowerCase().includes(q);
      const matchesTag = !activeTag || v.descriptor === activeTag;
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-indigo-500" />
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">30 Voces de Gemini</h4>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="group flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 px-4 py-2 rounded-full transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />}
          {isAnalyzing ? 'Analizando Voz...' : 'Imitar Estilo'}
        </button>
      </div>

      {recommendedVoiceId && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Sparkles size={14} />
          Recomendada según tu audio: <span className="text-white">{VOICES.find(v => v.id === recommendedVoiceId)?.name}</span>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o carácter (ej. cálida, firme, juvenil...)"
          className="w-full bg-slate-900/50 backdrop-blur-md text-slate-200 text-xs font-medium border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder-slate-600"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTag === null ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas
        </button>
        {descriptors.map((d) => (
          <button
            key={d}
            onClick={() => setActiveTag(activeTag === d ? null : d)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTag === d ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400 hover:text-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isRecommended = recommendedVoiceId === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={`
                relative flex flex-col items-start gap-2 p-4 rounded-2xl transition-all duration-300 text-left
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-2 ring-indigo-500/50 -translate-y-1'
                  : 'glass-card text-slate-400 hover:text-slate-100'
                }
              `}
            >
              {isRecommended && !isSelected && (
                <Star size={12} className="absolute top-3 right-3 text-indigo-400 fill-indigo-400" />
              )}
              {isSelected && (
                <Check size={14} className="absolute top-3 right-3 text-white" />
              )}
              <span className="text-xs font-bold">{voice.name}</span>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                {voice.descriptor}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500 text-sm">
            No hay voces que coincidan con "{query}".
          </div>
        )}
      </div>
    </div>
  );
};
