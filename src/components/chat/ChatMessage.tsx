import React from 'react';
import type { ChatMessageItem } from '../../services/chatService';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
          <Bot className="w-4.5 h-4.5" />
        </div>
      )}

      <div
        className={`max-w-xl p-3.5 rounded-2xl border space-y-1 ${
          isUser
            ? 'bg-cyan-600 text-white border-cyan-500/40 rounded-tr-none'
            : message.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-tl-none'
            : 'glass-panel text-slate-100 border-slate-800 rounded-tl-none'
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1">
          <span className="font-bold text-slate-300">{isUser ? 'Tú' : 'Asistente IA Mercado de Cristales'}</span>
          <span>{message.timestamp}</span>
        </div>

        {message.isError && (
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5" /> Error de conexión
          </div>
        )}

        {/* Renderizado de texto seguro sin innerHTML destructivo */}
        <p className="whitespace-pre-wrap leading-relaxed font-sans">{message.text}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
