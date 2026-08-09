import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8'
};

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. VALIDACIÓN DE AUTENTICACIÓN SEGURA DE N8N
    const authHeader = req.headers.get('Authorization');
    const expectedToken = Deno.env.get('N8N_SERVICE_TOKEN');

    if (!expectedToken) {
      console.warn('ADVERTENCIA: Secret N8N_SERVICE_TOKEN no está configurado en Supabase Edge Functions.');
    } else {
      const token = authHeader?.replace(/^Bearer\s+/i, '');
      if (!token || token !== expectedToken) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acceso no autorizado. Token de n8n no válido o ausente.' }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // 2. Inicializar cliente Supabase con clave de servicio interna
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;
    const q = url.searchParams.get('q')?.trim();
    const aseguradora = url.searchParams.get('aseguradora')?.trim();
    const estado = url.searchParams.get('estado')?.trim();
    const prestador = url.searchParams.get('prestador')?.trim();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

    // 3. ENDPOINT: Resumen Operativo (/api/resumen-operativo)
    if (path.endsWith('/resumen-operativo')) {
      const { data: casos, error } = await supabase.from('casos').select('estado_operativo, fecha_ingreso');
      if (error) throw error;

      const abiertos = casos.filter(c => c.estado_operativo !== 'DOCUMENTACION_COMPLETA' && c.estado_operativo !== 'CANCELADO');
      const demorados = casos.filter(c => {
        if (c.estado_operativo === 'NUEVO') {
          const hrs = (new Date().getTime() - new Date(c.fecha_ingreso).getTime()) / (1000 * 60 * 60);
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
            casosDemorados: demorados.length,
            porEstado: casos.reduce((acc: any, c) => {
              acc[c.estado_operativo] = (acc[c.estado_operativo] || 0) + 1;
              return acc;
            }, {})
          }
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 4. ENDPOINT: Resumen Financiero (/api/resumen-financiero)
    if (path.endsWith('/resumen-financiero')) {
      const { data: casos, error } = await supabase
        .from('casos')
        .select('monto_compania_sin_iva, monto_compania_final, costo_prestador, precio_vidrio_material, estado_financiero, monto_depositado');
      if (error) throw error;

      const facturado = casos
        .filter(c => c.estado_financiero === 'FACTURADO')
        .reduce((s, c) => s + Number(c.monto_compania_final || 0), 0);

      const cobrado = casos
        .filter(c => c.estado_financiero === 'COBRADO')
        .reduce((s, c) => s + Number(c.monto_depositado || c.monto_compania_final || 0), 0);

      const margenTotal = casos.reduce((s, c) => {
        const m = Number(c.monto_compania_sin_iva || 0) - Number(c.costo_prestador || 0) - Number(c.precio_vidrio_material || 0);
        return s + (m > 0 ? m : 0);
      }, 0);

      return new Response(
        JSON.stringify({
          success: true,
          resumen: {
            totalFacturado: facturado,
            totalCobrado: cobrado,
            margenBrutoEstimado: margenTotal,
            casosPendientesFacturar: casos.filter(c => c.estado_financiero === 'PENDIENTE_FACTURACION').length
          }
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 5. BÚSQUEDA GENERAL MULTICRITERIO DE CASOS
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
        prestadores ( nombre )
      `)
      .order('nro_trabajo', { ascending: false })
      .limit(limit);

    // Filtros específicos
    if (aseguradora) query = query.ilike('aseguradora', `%${aseguradora}%`);
    if (estado) {
      if (estado.toUpperCase() === 'DEMORADO') {
        query = query.eq('estado_operativo', 'NUEVO');
      } else {
        query = query.or(`estado_operativo.ilike.%${estado}%,estado_financiero.ilike.%${estado}%`);
      }
    }

    // Búsqueda q multicriterio
    if (q) {
      const isNum = !isNaN(Number(q));
      if (isNum) {
        query = query.or(`nro_trabajo.eq.${q},nro_siniestro.ilike.%${q}%`);
      } else {
        query = query.or(
          `nro_siniestro.ilike.%${q}%,asegurado_nombre.ilike.%${q}%,poliza.ilike.%${q}%,aseguradora.ilike.%${q}%,asegurado_direccion.ilike.%${q}%,detalle_trabajo.ilike.%${q}%`
        );
      }
    }

    const { data: casos, error } = await query;

    if (error) throw error;

    // Formatear respuesta JSON estructurada y limpia
    const casosFormateados = (casos || []).map((c: any) => ({
      nroTrabajo: c.nro_trabajo,
      nroSiniestro: c.nro_siniestro,
      poliza: c.poliza,
      aseguradora: c.aseguradora,
      aseguradoNombre: c.asegurado_nombre,
      aseguradoTel: c.asegurado_tel,
      direccion: `${c.asegurado_direccion}, ${c.asegurado_ciudad}`,
      prestador: c.prestadores?.nombre || 'Sin Asignar',
      detalleTrabajo: c.detalle_trabajo,
      estadoOperativo: c.estado_operativo,
      estadoFinanciero: c.estado_financiero,
      montoSinIva: Number(c.monto_compania_sin_iva || 0),
      montoFinal: Number(c.monto_compania_final || 0),
      nroFactura: c.nro_factura,
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
