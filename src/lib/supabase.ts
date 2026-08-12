import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseUrl.includes('tu-proyecto')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Mercado de Cristales] Supabase no está configurado aún. Se utilizará el modo local en memoria. Para habilitar la persistencia real, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Inicialización del cliente Supabase con anon key pública y detección de la sesión por URL (Magic Link)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
