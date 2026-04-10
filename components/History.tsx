import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem } from '../types';
import { Play, Pause, Download, Trash2, Clock, Music } from 'lucide-react';
import { createWavBlob } from '../utils/audioUtils';

interface HistoryProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ items, onDelete }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = (item: HistoryItem) => {
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const url = URL.createObjectURL(item.audioBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };
    
    audio.play();
    setPlayingId(item.id);
  };

  const handleDownload = (item: HistoryItem) => {
    const url = URL.createObjectURL(item.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narracion-${new Date(item.timestamp).toISOString().split('T')[0]}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="group relative glass-panel p-6 rounded-[2rem] flex items-center gap-6 border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-indigo-500/5"
        >
          {/* Play Button Wrapper */}
          <div className="relative">
            <button
              onClick={() => handlePlay(item)}
              className={`
                relative z-10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500
                ${playingId === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' 
                  : 'bg-slate-900 text-indigo-400 group-hover:bg-slate-800'
                }
              `}
            >
              {playingId === item.id ? (
                <div className="flex gap-1 items-end h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
            {playingId === item.id && (
              <div className="absolute inset-0 bg-indigo-500 rounded-[1.5rem] animate-ping opacity-20" />
            )}
          </div>
          
          <div className="flex-grow min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                {item.settings.voiceName}
              </span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {item.duration.toFixed(1)}s
              </span>
            </div>
            
            <p className="text-sm text-slate-200 font-medium line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
              "{item.text}"
            </p>
            
            <div className="flex items-center gap-4 pt-1">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <Clock size={12} />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
               <div className="h-1 w-1 rounded-full bg-slate-800" />
               <div className="text-[10px] font-bold text-slate-600 uppercase italic">
                  {item.settings.style}
               </div>
            </div>
          </div>

          {/* Floating Actions */}
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => handleDownload(item)}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-2xl border border-white/5 transition-all active:scale-95"
              title="Descargar WAV"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-2xl border border-white/5 transition-all active:scale-95"
              title="Borrar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};