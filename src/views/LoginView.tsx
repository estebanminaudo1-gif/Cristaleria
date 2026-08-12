import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Mail, CheckCircle2, AlertCircle, Send, ArrowLeft, Inbox } from 'lucide-react';

interface LoginViewProps {
  unauthorizedMessage?: string | null;
  onClearUnauthorizedMessage?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  unauthorizedMessage,
  onClearUnauthorizedMessage
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearUnauthorizedMessage) onClearUnauthorizedMessage();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase no está configurado. Revisa tu archivo .env');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: false
        }
      });

      if (error) {
        // Manejo neutral de errores para evitar revelar la existencia de emails o detalles técnicos
        if (error.message.includes('rate limit') || error.status === 429) {
          setErrorMessage('Has realizado varios intentos recientemente. Aguardá unos minutos antes de solicitar un nuevo enlace.');
        } else if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
          setErrorMessage('Error de conexión a internet. Verificá tu red e intentá nuevamente.');
        } else {
          // Respuesta neutral por seguridad para prevenir enumeración de usuarios
          setSent(true);
        }
        return;
      }

      setSent(true);
    } catch (err: any) {
      // Mensaje genérico amigable en producción
      setErrorMessage(err.message || 'No se pudo enviar el enlace de acceso. Intentá nuevamente en unos instantes.');
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
          <p className="text-xs text-slate-400">Acceso Seguro mediante Enlace Mágico (Magic Link)</p>
        </div>

        {/* Mensaje de Usuario No Autorizado */}
        {unauthorizedMessage && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Acceso Denegado</span>
            </div>
            <p className="text-[11px] leading-relaxed">{unauthorizedMessage}</p>
          </div>
        )}

        {/* Mensaje de Error Técnico Neutral */}
        {errorMessage && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {sent ? (
          /* Estado: Enlace Enviado Correctamente */
          <div className="p-6 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Te enviamos un enlace de acceso. Revisá tu correo.</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si tu usuario está registrado y habilitado en el sistema, recibirás un correo con el botón de ingreso directo a la plataforma.
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recomendación de seguridad:
              </div>
              <p>
                Si no encontrás el correo en tu bandeja de entrada en 1 o 2 minutos, revisá tus carpetas de **Spam**, **Promociones** o **Correo no deseado**.
              </p>
            </div>

            <button
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center justify-center gap-1.5 mx-auto pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Solicitar enlace para otro correo</span>
            </button>
          </div>
        ) : (
          /* Formulario de Solicitud de Magic Link */
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Correo Electrónico Autorizado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@mercadodecristales.com"
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando Enlace Mágico...' : 'Enviar Enlace de Acceso'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Autenticación Passwordless mediante Magic Link de Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
};
