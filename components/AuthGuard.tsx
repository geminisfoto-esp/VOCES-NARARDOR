import React, { useState, useEffect } from 'react';
import { Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle, Mail, RotateCcw, Loader2 } from 'lucide-react';
import { sendVerificationCode } from '../services/emailService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Obtener credenciales de las variables de entorno
  const validUser = import.meta.env.VITE_APP_USER;
  const validPass = import.meta.env.VITE_APP_PASSWORD;
  const targetEmail = "geminisfoto@gmail.com";

  // Si no hay variables configuradas, permitimos el acceso
  const isSecurityConfigured = validUser && validPass;

  useEffect(() => {
    const session = localStorage.getItem('app_auth_session');
    if (session === 'true' || !isSecurityConfigured) {
      setIsAuthenticated(true);
    }
  }, [isSecurityConfigured]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === validUser && password === validPass) {
      setLoading(true);
      setError(null);
      
      try {
        // Generar código de 6 dígitos
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(newCode);

        // Enviar por email
        const success = await sendVerificationCode(targetEmail, newCode);
        
        if (success) {
          setStep('verify');
        } else {
          setError('Error al enviar el código. Revisa VITE_RESEND_API_KEY en Vercel.');
        }
      } catch (err) {
        setError('Ocurrió un problema con el sistema de verificación.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Credenciales incorrectas');
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode) {
      localStorage.setItem('app_auth_session', 'true');
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Código de verificación incorrecto');
    }
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="login-card w-full max-w-md relative z-10 glass-panel p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        
        {step === 'login' ? (
          <>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-2">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Acceso Privado</h2>
              <p className="text-slate-400 text-sm font-medium">Introduce tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium"
                    placeholder="Nombre de usuario"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs font-bold uppercase tracking-wider bg-red-400/5 p-3 rounded-xl border border-red-400/10">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 group mt-4 overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Siguiente</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 mb-2">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Verificación 2FA</h2>
              <p className="text-slate-400 text-sm font-medium">
                Hemos enviado un código a <span className="text-indigo-400">geminisfoto@gmail.com</span>
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Código de Seguridad</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border-2 border-indigo-500/20 rounded-2xl py-6 text-center text-4xl font-black tracking-[10px] text-indigo-400"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs font-bold uppercase tracking-wider bg-red-400/5 p-3 rounded-xl border border-red-400/10">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2">
                  <span>Verificar Acceso</span>
                  <ShieldCheck size={18} />
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep('login')}
                  className="w-full text-[10px] font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
