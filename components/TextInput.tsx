import React, { useRef } from 'react';
import { SPECIAL_TAGS } from '../constants';
import { Smile, Frown, Megaphone, PauseCircle, Wind, PartyPopper } from 'lucide-react';
import { TagType } from '../types';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  pause: <PauseCircle size={14} />,
  smile: <Smile size={14} />,
  megaphone: <Megaphone size={14} />,
  frown: <Frown size={14} />,
  wind: <Wind size={14} />,
  party: <PartyPopper size={14} />,
};

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    
    const newText = text.substring(0, start) + " " + tag + " " + text.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = start + tag.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
             <span className="h-1 w-1 rounded-full bg-indigo-500" />
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Etiquetas de Expresión</label>
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Click para insertar</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_TAGS.map((t) => (
            <button
              key={t.tag}
              onClick={() => insertTag(t.tag)}
              disabled={disabled}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/40 hover:bg-indigo-600 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="opacity-70">{ICONS[t.icon]}</span>
              {t.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Comienza a escribir tu guion aquí..."
          className="w-full h-56 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.04] outline-none resize-none transition-all scrollbar-hide"
        />
        <div className="absolute bottom-4 right-6 flex items-center gap-3">
          <div className="flex flex-col items-end">
             <span className={`text-[10px] font-black tracking-widest ${value.length > 500 ? 'text-amber-500' : 'text-slate-500'}`}>
               {value.length} / 1000
             </span>
             <div className="w-20 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (value.length / 1000) * 100)}%` }} 
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};