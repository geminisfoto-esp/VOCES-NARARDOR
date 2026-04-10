import React, { useRef } from 'react';
import { VoiceOption } from '../types';
import { User, Mic, Upload, Sparkles, Check, Loader2 } from 'lucide-react';
import { VOICES } from '../constants';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelect: (id: string) => void;
  onImport: (file: File) => void;
  isAnalyzing: boolean;
  detectedGender: 'male' | 'female' | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoiceId, 
  onSelect, 
  onImport,
  isAnalyzing,
  detectedGender
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const males = VOICES.filter(v => v.gender === 'male');
  const females = VOICES.filter(v => v.gender === 'female');

  const VoiceGrid = ({ voices, colorClass, icon: Icon }: { voices: VoiceOption[], colorClass: string, icon: any }) => (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {voices.map((voice) => {
        const isSelected = selectedVoiceId === voice.id;
        return (
          <button
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            className={`
              relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group
              ${isSelected 
                ? `bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/40 ring-2 ring-indigo-500/50 -translate-y-1` 
                : 'glass-card text-slate-400 hover:text-slate-100'
              }
            `}
          >
            <div className={`
              p-2.5 rounded-xl transition-colors
              ${isSelected ? 'bg-indigo-500' : 'bg-slate-800 group-hover:bg-slate-700'}
            `}>
              <Icon size={20} className={isSelected ? 'text-white' : colorClass} />
            </div>
            <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
              {voice.name.split(' ')[0]}
              <br />
              <span className="text-[9px] opacity-60 font-medium">{voice.name.split(' ')[1] || ''}</span>
            </span>
            {isSelected && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white shadow-sm" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-indigo-500" />
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Selección de Voces</h4>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="audio/*" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="group flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 px-4 py-2 rounded-full transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />}
            {isAnalyzing ? "Analizando Voz..." : "Imitar Estilo"}
          </button>
        </div>
      </div>
      
      {/* Sección Hombres */}
      <div className={`space-y-4 transition-all duration-500 ${detectedGender === 'male' ? 'scale-[1.02]' : ''}`}>
        <div className="flex items-center gap-2 px-1">
          <User size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest">Caballeros</span>
          {detectedGender === 'male' && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[8px] font-bold border border-indigo-500/30 animate-pulse">
              RECOMENDADO
            </span>
          )}
        </div>
        <VoiceGrid voices={males} colorClass="text-indigo-400" icon={User} />
      </div>

      {/* Sección Mujeres */}
      <div className={`space-y-4 transition-all duration-500 ${detectedGender === 'female' ? 'scale-[1.02]' : ''}`}>
        <div className="flex items-center gap-2 px-1">
          <Mic size={14} className="text-pink-400" />
          <span className="text-[10px] font-black text-pink-400/80 uppercase tracking-widest">Damas</span>
          {detectedGender === 'female' && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[8px] font-bold border border-pink-500/30 animate-pulse">
              RECOMENDADO
            </span>
          )}
        </div>
        <VoiceGrid voices={females} colorClass="text-pink-400" icon={Mic} />
      </div>
    </div>
  );
};