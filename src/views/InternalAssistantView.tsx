import React, { useEffect, useRef, useState, useMemo } from 'react';

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

  const chatConfig = useMemo(() => ({
    webhookUrl,
    mode: 'fullscreen',
    showWelcomeScreen: false,
    initialMessages: [
      '¡Hola! Soy el asistente IA de Mercado de Cristales. Podés preguntarme el estado de cualquier siniestro, consultar montos pendientes de cobro, revisar la agenda de prestadores o buscar casos por aseguradora.'
    ],
    i18n: {
      en: {
        title: 'Asistente IA Mercado de Cristales',
        subtitle: 'Consultas operativas y financieras en tiempo real',
        inputPlaceholder: 'Escribí tu consulta sobre casos, cobros o prestadores...'
      },
      es: {
        title: 'Asistente IA Mercado de Cristales',
        subtitle: 'Consultas operativas y financieras en tiempo real',
        inputPlaceholder: 'Escribí tu consulta sobre casos, cobros o prestadores...'
      }
    }
  }), [webhookUrl]);

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
          ...chatConfig,
          target: elem
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
  }, [webhookUrl, chatConfig]);

  return (
    <div className="w-full h-[calc(100vh-110px)] min-h-[600px] glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col">
      {chatError ? (
        <div className="p-6 text-xs text-rose-400 font-semibold text-center">
          {chatError}
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full text-slate-100 bg-slate-950 flex-1 flex flex-col min-h-0" />
      )}
    </div>
  );
};
