import React, { useState, useCallback } from 'react';
import { VoiceSelector } from './components/VoiceSelector';
import { Controls } from './components/Controls';
import { TextInput } from './components/TextInput';
import { History } from './components/History';
import { GenerationSettings, HistoryItem } from './types';
import { VOICES } from './constants';
import { generateSpeech, analyzeVoiceSample } from './services/geminiService';
import { decodeBase64, decodeAudioData, createWavBlob } from './utils/audioUtils';
import { AudioWaveform, Wand2, Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthGuard } from './components/AuthGuard';

const App: React.FC = () => {
  // Load persisted state
  const loadPersisted = (key: string, fallback: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [text, setText] = useState(() => loadPersisted('tts_text', ''));
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [importStatus, setImportStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [settings, setSettings] = useState<GenerationSettings>(() => loadPersisted('tts_settings', {
    voiceId: VOICES[0].id,
    accent: 'España',
    style: 'natural',
    speed: 1.0,
    pitch: 0,
  }));
  
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Persist state changes
  React.useEffect(() => {
    localStorage.setItem('tts_text', JSON.stringify(text));
  }, [text]);

  React.useEffect(() => {
    localStorage.setItem('tts_settings', JSON.stringify(settings));
  }, [settings]);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setImportStatus(null);
    try {
      const base64Audio = await generateSpeech(text, settings);
      const audioBytes = decodeBase64(base64Audio);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(audioBytes, audioContext);
      const channelData = audioBuffer.getChannelData(0);
      const wavBlob = createWavBlob(channelData, 24000);

      const selectedVoice = VOICES.find(v => v.id === settings.voiceId);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        text: text,
        timestamp: Date.now(),
        audioBlob: wavBlob,
        duration: audioBuffer.duration,
        settings: {
          voiceName: selectedVoice?.name || 'Desconocido',
          style: settings.style,
        },
      };

      setHistory((prev) => [newItem, ...prev]);
      
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      
      audio.play();

    } catch (error: any) {
      console.error("Gemini TTS Error:", error);
      if (error.status === 403) alert("Error generando audio: Acceso denegado (403). Tu clave API no tiene permisos para este modelo.");
      else if (error.status === 404) alert("Error generando audio: Modelo no encontrado (404). El modelo 'gemini-2.5-flash-preview-tts' podría no estar disponible en tu región.");
      else {
        const errorMsg = error.message || 'Error desconocido';
        alert(`Error generando audio: ${errorMsg}\n\nVerifica tu conexión y que el modelo gemini-2.5 esté disponible para tu clave.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      setHistory([]);
    }
  };

  const handleVoiceImport = async (file: File) => {
    setAnalyzing(true);
    setImportStatus(null);
    setDetectedGender(null);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Result = reader.result as string;
        const base64Data = base64Result.split(',')[1];
        const analysis = await analyzeVoiceSample(base64Data);
        
        const matchingVoices = VOICES.filter(v => v.gender === analysis.gender);
        const bestVoice = matchingVoices.length > 0 ? matchingVoices[0] : VOICES[0];

        setDetectedGender(analysis.gender);
        setSettings({
          voiceId: bestVoice.id,
          accent: analysis.accent,
          style: analysis.style,
          speed: analysis.speed,
          pitch: analysis.pitch
        });

        setImportStatus({
          msg: `Análisis completado: Se detectó voz ${analysis.gender === 'male' ? 'MASCULINA' : 'FEMENINA'}.`,
          type: 'success'
        });
      } catch (err) {
        setImportStatus({
          msg: "No se pudo analizar el audio. Intenta con un archivo más claro.",
          type: 'error'
        });
      } finally {
        setAnalyzing(false);
      }
    };
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 selection:bg-indigo-500/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-500/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <AudioWaveform className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
                Voces Narrador
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Powered by Gemini 1.5</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
              <span>Status: Online</span>
              <span className="text-indigo-400/50">Model: v1.5-flash</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Sparkles size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Configuration */}
          <div className="lg:col-span-7 space-y-10">
            <section className="glass-panel p-8 rounded-[2rem] space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">1. Configuración de Voz</h3>
                {isPlaying && (
                  <div className="flex gap-1 items-end h-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />
                    ))}
                  </div>
                )}
              </div>

              <VoiceSelector 
                selectedVoiceId={settings.voiceId} 
                onSelect={(id) => setSettings(s => ({ ...s, voiceId: id }))}
                onImport={handleVoiceImport}
                isAnalyzing={analyzing}
                detectedGender={detectedGender}
              />
              
              {importStatus && (
                <div className={`text-sm p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  importStatus.type === 'success' ? 'bg-emerald-500/5 text-emerald-300 border border-emerald-500/10' : 'bg-red-500/5 text-red-300 border border-red-500/10'
                }`}>
                   {importStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                   {importStatus.msg}
                </div>
              )}

              <hr className="border-white/5" />

              <Controls 
                settings={settings} 
                onChange={setSettings} 
              />
            </section>
          </div>

          {/* Right: Synthesis */}
          <div className="lg:col-span-5">
            <section className="glass-panel p-8 rounded-[2rem] sticky top-28">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6">2. Síntesis de Texto</h3>
              <TextInput 
                value={text} 
                onChange={setText} 
                disabled={loading} 
              />
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !text.trim()}
                  className="btn-primary w-full py-5"
                >
                  <span className="flex items-center justify-center gap-3 text-lg">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={24} /> Generando audio...
                      </>
                    ) : (
                      <>
                        <Wand2 size={24} />
                        Generar Narración
                      </>
                    )}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Soporta etiquetas de emoción</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>Calidad de estudio</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* History Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Sparkles className="text-indigo-400" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Historial de Creaciones</h2>
            </div>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                Limpiar Historial
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="glass-panel p-16 rounded-[2rem] text-center border-dashed border-2 border-white/5">
              <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4 text-slate-600">
                <AudioWaveform size={40} />
              </div>
              <p className="text-slate-400 font-medium">No hay audios generados todavía.</p>
              <p className="text-slate-600 text-sm mt-1">Tu historial aparecerá aquí automáticamente.</p>
            </div>
          ) : (
            <History items={history} onDelete={deleteHistory} />
          )}
        </section>

      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 grayscale opacity-50">
           <AudioWaveform size={20} />
           <span className="text-sm font-bold tracking-tighter">VOCES NARRADOR</span>
        </div>
        <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} — Made with Gemini Intelligence</p>
        <div className="flex gap-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
          <a href="#" className="hover:text-indigo-400 transition-colors">Github</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">API Keys</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Modelos</a>
        </div>
      </footer>
    </div>
    </AuthGuard>
  );
};


export default App;