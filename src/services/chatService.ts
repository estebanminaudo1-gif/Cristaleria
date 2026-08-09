export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const getSessionId = (): string => {
  let sid = localStorage.getItem('mercado_cristales_chat_session');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('mercado_cristales_chat_session', sid);
  }
  return sid;
};

export const chatService = {
  async sendMessageToN8n(
    userMessage: string,
    role = 'ADMIN',
    userId = 'user-admin-default'
  ): Promise<string> {
    const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
    const sessionId = getSessionId();

    if (!webhookUrl || webhookUrl.includes('tu-instancia')) {
      // Fallback inteligente simulado cuando n8n no está configurado aún en el .env
      await new Promise(resolve => setTimeout(resolve, 1000));
      return (
        `[Modo Simulación N8N] He recibido tu consulta: "${userMessage}". ` +
        `Para conectarme a tu agente de IA en producción, configura la variable VITE_N8N_CHAT_WEBHOOK_URL en tu archivo .env`
      );
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatInput: userMessage,
          sessionId,
          context: {
            userId,
            role
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor de n8n devolvió código ${response.status}`);
      }

      const data = await response.json();

      // n8n puede devolver la respuesta en formato { output: "..." } o { response: "..." } o texto plano
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
