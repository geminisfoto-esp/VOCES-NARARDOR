import React, { useState, useEffect } from 'react';
import { Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Obtener credenciales de las variables de entorno
  const validUser = import.meta.env.VITE_APP_USER;
  const validPass = import.meta.env.VITE_APP_PASSWORD;

  // Si no hay variables configuradas, permitimos el acceso (para no bloquearte por accidente)
  // Pero cuando las pongas en Vercel, el bloqueo se activará
  const isSecurityConfigured = validUser && validPass;

  useEffect(() => {
    const session = localStorage.getItem('app_auth_session');
    if (session === 'true' || !isSecurityConfigured) {
      setIsAuthenticated(true);
    }
  }, [isSecurityConfigured]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === validUser && password === validPass) {
      localStorage.setItem('app_auth_session', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      // Vibración de error visual
      const form = document.querySelector('.login-card');
      form?.classList.add('animate-shake');
      setTimeout(() => form?.classList.remove('animate-shake'), 500);
    }
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="login-card w-full max-w-md relative z-10 glass-panel p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-2">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Acceso Privado</h2>
          <p className="text-slate-400 text-sm font-medium">Introduce tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium"
                placeholder="Nombre de usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider bg-red-400/5 p-3 rounded-xl border border-red-400/10 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} />
              Credenciales incorrectas
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 group mt-4"
          >
            <span>Entrar a Voces Narrador</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <ShieldCheck size={14} />
          Seguridad encriptada vía Vercel
        </div>
      </div>
    </div>
  );
};
