import React from 'react';
import { ShieldAlert, Database, Key, Server } from 'lucide-react';

export const SetupConfigView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 my-8">
      <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold text-white">Configuración Requerida de Supabase</h2>

        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          El sistema está en **modo seguro de producción**. No se han cargado datos ficticios ni datos privados de clientes en el navegador. Para habilitar el funcionamiento de la plataforma, configura tus variables de entorno públicas.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-2">Variables requeridas en Vercel / .env:</div>
          <div><span className="text-cyan-400">VITE_SUPABASE_URL</span>=https://tu-proyecto.supabase.co</div>
          <div><span className="text-cyan-400">VITE_SUPABASE_ANON_KEY</span>=tu-anon-key-publica</div>
          <div><span className="text-purple-400">VITE_N8N_CHAT_WEBHOOK_URL</span>=https://tu-n8n.com/webhook/chat</div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" /> PostgreSQL 3NF
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Key className="w-4 h-4 text-emerald-400" /> RLS Enabled
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Server className="w-4 h-4 text-purple-400" /> Supabase Edge Functions
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Si deseas probar la aplicación localmente en modo demo con datos sanitizados sin conectar Supabase, configura <code className="text-amber-300 font-mono">VITE_ENABLE_DEMO_MODE=true</code> en tu entorno local.
        </p>
      </div>
    </div>
  );
};
