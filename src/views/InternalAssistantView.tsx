import React, { useState, useRef, useEffect } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { chatService, type ChatMessageItem } from '../services/chatService';
import { ChatMessage } from '../components/chat/ChatMessage';
import { Bot, Send, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export const InternalAssistantView: React.FC = () => {
  const { activeRole } = useSiniestros();
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy el asistente interno de Mercado de Cristales. Podés preguntarme el estado de cualquier siniestro, consultar montos pendientes de cobro, revisar la agenda de prestadores o buscar casos por aseguradora.',
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
    '¿Cuánto tenemos pendiente de cobro?',
    'Buscá los casos de SURA.',
    '¿Qué casos están pendientes de facturación?'
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
      const responseText = await chatService.sendMessageToN8n(text, activeRole);
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
        text: err.message || 'No se pudo conectar con n8n.',
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
    <div className="flex flex-col h-[calc(100vh-120px)] glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header Panel */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Asistente Interno IA (n8n Agent)
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                Rioplatense
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Consultas en lenguaje natural conectadas a la base de datos de Mercado de Cristales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
            title="Reiniciar conversación"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse bg-cyan-500/10 border border-cyan-500/20 w-max px-3 py-2 rounded-2xl">
            <Sparkles className="w-4 h-4" />
            <span>El Asistente está consultando n8n y la base de datos...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Preguntas sugeridas:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700 whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Textarea Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <div className="relative flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu pregunta sobre casos, cobros o prestadores... (Presioná Enter para enviar)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          ></textarea>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-cyan-600/20 transition-all shrink-0 mb-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
