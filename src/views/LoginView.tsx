import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase no está configurado. Revisa tu archivo .env');
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Error de inicio de sesión:', err);
      setError(err.message || 'Credenciales no válidas. Revisa tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white font-sans">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">MERCADO DE CRISTALES</h1>
          <p className="text-xs text-slate-400">Inicio de Sesión para Personal Autorizado</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@mercadodecristales.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Iniciando Sesión...' : 'Ingresar al Sistema'}</span>
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Acceso protegido con políticas RLS de Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
};
