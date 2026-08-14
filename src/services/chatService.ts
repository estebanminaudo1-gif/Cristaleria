import { supabase } from '../lib/supabase';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const DEFAULT_N8N_WEBHOOK = 'http://localhost:5678/webhook/e01e03b4-c954-4a5e-b83a-f69b0c084886/chat';

const getSessionId = (): string => {
  let sid = localStorage.getItem('mercado_cristales_chat_session');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('mercado_cristales_chat_session', sid);
  }
  return sid;
};

export const chatService = {
  async sendMessageToN8n(userMessage: string): Promise<string> {
    const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK;
    const sessionId = getSessionId();

    // Obtener sesión de usuario real desde Supabase Auth
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    // Obtener perfil autenticado
    let userRole = 'GUEST';
    let userId = 'anon-user';
    let accessToken = '';

    if (session) {
      userId = session.user.id;
      accessToken = session.access_token;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role) {
        userRole = profile.role;
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chatInput: userMessage,
          sessionId,
          context: {
            userId,
            role: userRole
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor n8n devolvió código ${response.status}`);
      }

      const data = await response.json();

      if (data.output) return data.output;
      if (data.response) return data.response;
      if (data.text) return data.text;
      if (typeof data === 'string') return data;

      return JSON.stringify(data);
    } catch (err: any) {
      console.error('Error al comunicarse con el Webhook de n8n:', err);
      throw new Error(`No se pudo conectar con el Asistente n8n. (${err.message})`);
    }
  }
};
