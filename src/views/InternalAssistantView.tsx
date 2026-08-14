import React, { useEffect, useRef, useState } from 'react';
import { Bot, RefreshCw } from 'lucide-react';

const loadN8nModule = async (): Promise<{ createChat: (config: any) => void }> => {
  if ((window as any).n8nChatModule) {
    return (window as any).n8nChatModule;
  }
  const mod = await (new Function(`return import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js')`)());
  (window as any).n8nChatModule = mod;
  return mod;
};

export const InternalAssistantView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const webhookUrl =
    import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL ||
    'http://localhost:5678/webhook/e01e03b4-c954-4a5e-b83a-f69b0c084886/chat';

  useEffect(() => {
    let isMounted = true;
    const elem = containerRef.current;

    const initN8nChat = async () => {
      try {
        if (!elem) return;
        elem.innerHTML = '';

        const module = await loadN8nModule();

        if (!isMounted || !elem) return;

        module.createChat({
          target: elem,
          webhookUrl,
          mode: 'fullscreen',
          showWelcomeScreen: true,
          initialMessages: [
            '¡Hola! Soy el asistente IA de Mercado de Cristales. Podés preguntarme el estado de cualquier siniestro, consultar montos pendientes de cobro, revisar la agenda de prestadores o buscar casos por aseguradora.'
          ]
        });
      } catch (err: any) {
        console.error('Error al cargar n8n chat:', err);
        if (isMounted) {
          setChatError(err.message || 'No se pudo cargar el chat de n8n.');
        }
      }
    };

    initN8nChat();

    return () => {
      isMounted = false;
      if (elem) {
        elem.innerHTML = '';
      }
    };
  }, [webhookUrl]);

  const handleReset = async () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      try {
        const module = await loadN8nModule();
        if (containerRef.current) {
          module.createChat({
            target: containerRef.current,
            webhookUrl,
            mode: 'fullscreen',
            showWelcomeScreen: true,
            initialMessages: [
              '¡Hola! Soy el asistente IA de Mercado de Cristales. Podés preguntarme el estado de cualquier siniestro, consultar montos pendientes de cobro, revisar la agenda de prestadores o buscar casos por aseguradora.'
            ]
          });
        }
      } catch (e: any) {
        console.error('Error al reiniciar chat:', e);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header Panel */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Asistente IA n8n (Agente Conectado)
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                Rioplatense
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Integración oficial con Webhook de n8n ({webhookUrl})
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
          title="Reiniciar chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reiniciar Chat</span>
        </button>
      </div>

      {/* Embedded n8n Chat Area */}
      <div className="flex-1 w-full h-full relative bg-slate-950/60 overflow-hidden">
        {chatError && (
          <div className="p-4 text-xs text-rose-400 font-semibold text-center">
            {chatError}
          </div>
        )}
        <div ref={containerRef} className="w-full h-full text-slate-100" />
      </div>
    </div>
  );
};
