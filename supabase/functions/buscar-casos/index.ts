import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8'
};

// Safe string equality helper to prevent timing attacks
const constantTimeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

serve(async (req: Request) => {
  // 1. RESTRICCIÓN DE MÉTODOS HTTP (Solo GET y OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Método HTTP no permitido. Solo se aceptan solicitudes GET.' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 2. AUTENTICACIÓN FAIL-CLOSED REQUERIDA
    const expectedToken = Deno.env.get('N8N_SERVICE_TOKEN');
    if (!expectedToken || expectedToken.trim() === '') {
      // Fail-closed: rechazar si el servidor no tiene el token configurado
      return new Response(
        JSON.stringify({ success: false, error: 'Error de configuración del servidor: N8N_SERVICE_TOKEN no está configurado.' }),
        { status: 503, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Acceso no autorizado: Encabezado Authorization faltante.' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token || !constantTimeEquals(token, expectedToken)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Acceso no autorizado: Token de servicio no válido.' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 3. Inicializar Supabase Client con Service Role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. SANITIZACIÓN Y VALIDACIÓN DE PARÁMETROS
    const url = new URL(req.url);
    const path = url.pathname;

    const q = url.searchParams.get('q')?.slice(0, 100).trim();
    const aseguradora = url.searchParams.get('aseguradora')?.slice(0, 50).trim();
    const estado = url.searchParams.get('estado')?.slice(0, 50).trim();
    const prestador = url.searchParams.get('prestador')?.slice(0, 50).trim();

    const rawLimit = parseInt(url.searchParams.get('limit') || '20', 10);
    const limit = isNaN(rawLimit) ? 20 : Math.max(1, Math.min(rawLimit, 100));

    // 5. ENDPOINT: Resumen Operativo (/api/resumen-operativo)
    if (path.endsWith('/resumen-operativo')) {
      const { data: casos, error } = await supabase.from('casos').select('estado_operativo, fecha_ingreso');
      if (error) throw error;

      const ahora = new Date();
      const abiertos = casos.filter(c => c.estado_operativo !== 'DOCUMENTACION_COMPLETA' && c.estado_operativo !== 'CANCELADO');
      const demorados = casos.filter(c => {
        if (c.estado_operativo === 'NUEVO') {
          const hrs = (ahora.getTime() - new Date(c.fecha_ingreso).getTime()) / (1000 * 60 * 60);
          return hrs > 24;
        }
        return false;
      });

      return new Response(
        JSON.stringify({
          success: true,
          resumen: {
            totalCasos: casos.length,
            casosAbiertos: abiertos.length,
            casosDemorados: demorados.length
          }
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 6. BÚSQUEDA MULTICRITERIO CON FILTRO DE PRESTADOR Y DEMORADOS
    let query = supabase
      .from('casos')
      .select(`
        id,
        nro_trabajo,
        nro_siniestro,
        poliza,
        aseguradora,
        asegurado_nombre,
        asegurado_tel,
        asegurado_direccion,
        asegurado_ciudad,
        detalle_trabajo,
        estado_operativo,
        estado_financiero,
        costo_prestador,
        monto_compania_sin_iva,
        monto_compania_final,
        nro_factura,
        fecha_ingreso,
        fecha_realizacion,
        prestadores ( id, nombre )
      `)
      .order('nro_trabajo', { ascending: false })
      .limit(limit);

    if (aseguradora) query = query.ilike('aseguradora', `%${aseguradora}%`);

    // Filtro por prestador
    if (prestador) {
      query = query.ilike('prestadores.nombre', `%${prestador}%`);
    }

    // Filtro por estado
    if (estado) {
      if (estado.toUpperCase() === 'DEMORADO') {
        const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.eq('estado_operativo', 'NUEVO').lt('fecha_ingreso', hace24h);
      } else {
        query = query.eq('estado_operativo', estado.toUpperCase());
      }
    }

    // Filtro q multicriterio
    if (q) {
      const isNum = /^\d+$/.test(q);
      if (isNum) {
        query = query.eq('nro_trabajo', parseInt(q, 10));
      } else {
        query = query.ilike('asegurado_nombre', `%${q}%`);
      }
    }

    const { data: casos, error } = await query;
    if (error) throw error;

    const casosFormateados = (casos || []).map((c: any) => ({
      nroTrabajo: c.nro_trabajo,
      nroSiniestro: c.nro_siniestro,
      poliza: c.poliza,
      aseguradora: c.aseguradora,
      aseguradoNombre: c.asegurado_nombre,
      prestador: c.prestadores?.nombre || 'Sin Asignar',
      estadoOperativo: c.estado_operativo,
      estadoFinanciero: c.estado_financiero,
      montoSinIva: Number(c.monto_compania_sin_iva || 0),
      montoFinal: Number(c.monto_compania_final || 0),
      fechaIngreso: c.fecha_ingreso
    }));

    return new Response(
      JSON.stringify({
        success: true,
        total: casosFormateados.length,
        casos: casosFormateados
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error interno del servidor' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
