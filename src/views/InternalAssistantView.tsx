import React, { useState, useRef, useEffect } from 'react';
import { chatService, type ChatMessageItem } from '../services/chatService';
import { ChatMessage } from '../components/chat/ChatMessage';
import { Bot, Send, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export const InternalAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy el asistente IA de Mercado de Cristales. Podés preguntarme el estado de cualquier siniestro, consultar montos pendientes de cobro, revisar la agenda de prestadores o buscar casos por aseguradora.',
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    '¿En qué estado está el trabajo 1120?',
    'Mostrame los casos demorados.',
    '¿Qué trabajos tiene asignados Lolo?',
    '¿Cuánto tenemos pendiente de cobro?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const responseText = await chatService.sendMessageToN8n(text);
      const botMsg: ChatMessageItem = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessageItem = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: err.message || 'No se pudo conectar con el servicio de n8n.',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[550px] sm:h-[600px] flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden font-sans shadow-xl">
      {/* Header Compacto del Chat */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              Asistente IA Mercado de Cristales
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                En línea
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Consultas operativas y financieras en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          title="Reiniciar conversación"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar Chat</span>
        </button>
      </div>

      {/* Área de Conversación con Scroll Interno */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse bg-cyan-500/10 border border-cyan-500/20 w-max px-3 py-2 rounded-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>El Asistente está escribiendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preguntas Sugeridas Compactas */}
      <div className="px-3.5 py-1.5 bg-slate-900/70 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1.5">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          <span>Sugerencias rápidas:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700/80 whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Área para Escribir y Botón de Enviar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
          ></textarea>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 shrink-0 transition-all font-sans"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
