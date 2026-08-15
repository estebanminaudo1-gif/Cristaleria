import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SiniestroCaso, EstadoOperativo, EstadoFinanciero, ItemTrabajo, FotoDocumento, EventoAuditoria } from '../types';
import { initialCasos } from '../mock/initialData';

// Map PostgreSQL snake_case to Frontend camelCase SiniestroCaso
const mapCasoFromDB = (dbRow: any): SiniestroCaso => {
  const items: ItemTrabajo[] = (dbRow.items_trabajo || []).map((i: any) => ({
    id: i.id,
    tipoArticulo: i.tipo_articulo,
    anchoMm: i.ancho_mm,
    altoMm: i.alto_mm,
    espesorMm: i.espesor_mm,
    detallesHerrajes: i.detalles_herrajes,
    cantidad: i.cantidad || 1,
    precioUnitario: i.precio_unitario || 0
  }));

  const fotos: FotoDocumento[] = (dbRow.documentos || []).map((d: any) => ({
    id: d.id,
    tipo: d.tipo,
    url: d.url,
    subidoPor: d.subido_por,
    fecha: d.fecha || d.created_at
  }));

  const timeline: EventoAuditoria[] = (dbRow.eventos || []).map((e: any) => ({
    id: e.id,
    fecha: e.fecha || e.created_at,
    usuario: e.usuario,
    rol: e.rol,
    evento: e.evento,
    descripcion: e.descripcion
  }));

  return {
    id: dbRow.id,
    nroTrabajo: dbRow.nro_trabajo,
    nroSiniestro: dbRow.nro_siniestro,
    poliza: dbRow.poliza || '-',
    aseguradora: dbRow.aseguradora,
    canalIngreso: dbRow.canal_ingreso || 'MANUAL',
    fechaIngreso: dbRow.fecha_ingreso,
    fechaDenuncia: dbRow.fecha_denuncia,

    aseguradoNombre: dbRow.asegurado_nombre,
    aseguradoTel: dbRow.asegurado_tel || '',
    aseguradoDireccion: dbRow.asegurado_direccion,
    aseguradoCiudad: dbRow.asegurado_ciudad || 'Mar del Plata',

    prestadorAsignado: dbRow.prestadores?.nombre || dbRow.prestador_nombre || 'Sin Asignar',
    fechaDerivacion: dbRow.fecha_derivacion,
    fechaVisitaCoordinada: dbRow.fecha_visita_coordinada,
    fechaRealizacion: dbRow.fecha_realizacion,
    magicToken: dbRow.magic_token || `tok_${dbRow.nro_trabajo}`,

    detalleTrabajo: dbRow.detalle_trabajo,
    sumaAsegurada: dbRow.suma_asegurada || '100% en cobertura',
    items: items.length > 0 ? items : [
      { id: `item-${dbRow.id}`, tipoArticulo: 'Vidrio General', cantidad: 1 }
    ],
    fotos,

    estadoOperativo: dbRow.estado_operativo as EstadoOperativo,
    estadoFinanciero: dbRow.estado_financiero as EstadoFinanciero,
    causaCancelacion: dbRow.causa_cancelacion,
    infoExtraOperativa: dbRow.info_extra_operativa,
    infoExtraFinanciera: dbRow.info_extra_financiera,

    costoPrestador: Number(dbRow.costo_prestador || 0),
    pagadoPrestadorFecha: dbRow.pagado_prestador_fecha,
    precioVidrioMaterial: Number(dbRow.precio_vidrio_material || 0),
    montoCompaniaSinIva: Number(dbRow.monto_compania_sin_iva || 0),
    montoCompaniaFinal: Number(dbRow.monto_compania_final || (dbRow.monto_compania_sin_iva * 1.21)),

    nroFactura: dbRow.nro_factura,
    fechaMailFactura: dbRow.fecha_mail_factura,
    fechaCobro: dbRow.fecha_cobro,
    montoDepositado: dbRow.monto_depositado ? Number(dbRow.monto_depositado) : undefined,
    retencionIva: Number(dbRow.retencion_iva || 0),
    retencionGanancias: Number(dbRow.retencion_ganancias || 0),
    retencionIibb: Number(dbRow.retencion_iibb || 0),

    timeline
  };
};

export const casosService = {
  // 1. Listar todos los casos
  async getCasos(): Promise<SiniestroCaso[]> {
    if (!isSupabaseConfigured) {
      return initialCasos;
    }

    const { data, error } = await supabase
      .from('casos')
      .select(`
        *,
        prestadores ( id, nombre ),
        items_trabajo ( * ),
        documentos ( * ),
        eventos ( * )
      `)
      .order('nro_trabajo', { ascending: false });

    if (error) {
      console.error('Error cargando casos de Supabase:', error);
      throw new Error(`Error Supabase: ${error.message}`);
    }

    return (data || []).map(mapCasoFromDB);
  },

  // 2. Obtener un caso por UUID
  async getCasoById(id: string): Promise<SiniestroCaso | null> {
    if (!isSupabaseConfigured) {
      return initialCasos.find(c => c.id === id) || null;
    }

    const { data, error } = await supabase
      .from('casos')
      .select(`
        *,
        prestadores ( id, nombre ),
        items_trabajo ( * ),
        documentos ( * ),
        eventos ( * )
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapCasoFromDB(data);
  },

  // 3. Obtener caso por nroTrabajo
  async getCasoByNroTrabajo(nroTrabajo: number): Promise<SiniestroCaso | null> {
    if (!isSupabaseConfigured) {
      return initialCasos.find(c => c.nroTrabajo === nroTrabajo) || null;
    }

    const { data, error } = await supabase
      .from('casos')
      .select(`
        *,
        prestadores ( id, nombre ),
        items_trabajo ( * ),
        documentos ( * ),
        eventos ( * )
      `)
      .eq('nro_trabajo', nroTrabajo)
      .single();

    if (error || !data) return null;
    return mapCasoFromDB(data);
  },

  async createCaso(casoData: Partial<SiniestroCaso>): Promise<SiniestroCaso> {
    if (!isSupabaseConfigured) {
      const nextNro = casoData.nroTrabajo || Math.floor(1000 + Math.random() * 9000);
      const nuevoMock: SiniestroCaso = {
        id: `case-${Date.now()}`,
        nroTrabajo: nextNro,
        nroSiniestro: casoData.nroSiniestro || `SIN-${nextNro}`,
        poliza: casoData.poliza || '-',
        aseguradora: casoData.aseguradora || 'General',
        fechaIngreso: new Date().toISOString(),
        aseguradoNombre: casoData.aseguradoNombre || 'Asegurado',
        aseguradoTel: casoData.aseguradoTel || '-',
        aseguradoDireccion: casoData.aseguradoDireccion || 'Dirección',
        aseguradoCiudad: casoData.aseguradoCiudad || 'Mar del Plata',
        prestadorAsignado: casoData.prestadorAsignado || 'Lolo',
        magicToken: `tok_${Math.random().toString(36).substring(2, 9)}`,
        detalleTrabajo: casoData.detalleTrabajo || 'Trabajo de vidriado',
        sumaAsegurada: casoData.sumaAsegurada || '100% en cobertura',
        items: casoData.items || [{ id: '1', tipoArticulo: 'Vidrio', cantidad: 1 }],
        fotos: [],
        estadoOperativo: 'NUEVO',
        estadoFinanciero: 'PENDIENTE_FACTURACION',
        costoPrestador: casoData.costoPrestador || 0,
        precioVidrioMaterial: casoData.precioVidrioMaterial || 0,
        montoCompaniaSinIva: casoData.montoCompaniaSinIva || 0,
        montoCompaniaFinal: (casoData.montoCompaniaSinIva || 0) * 1.21,
        retencionIva: 0,
        retencionGanancias: 0,
        retencionIibb: 0,
        timeline: [
          {
            id: `t-${Date.now()}`,
            fecha: new Date().toISOString(),
            usuario: 'Operador',
            rol: 'OPERATOR',
            evento: 'CREACION_CASO',
            descripcion: `Siniestro creado manualmente`
          }
        ]
      };
      return nuevoMock;
    }

    const sinIva = casoData.montoCompaniaSinIva || 0;
    const finalConIva = sinIva * 1.21;

    const payload = {
      nro_siniestro: casoData.nroSiniestro,
      poliza: casoData.poliza || '-',
      aseguradora: casoData.aseguradora,
      canal_ingreso: casoData.canalIngreso || 'MANUAL',
      asegurado_nombre: casoData.aseguradoNombre,
      asegurado_tel: casoData.aseguradoTel,
      asegurado_direccion: casoData.aseguradoDireccion,
      asegurado_ciudad: casoData.aseguradoCiudad || 'Mar del Plata',
      detalle_trabajo: casoData.detalleTrabajo,
      suma_asegurada: casoData.sumaAsegurada || '100% en cobertura',
      estado_operativo: 'NUEVO',
      estado_financiero: 'PENDIENTE_FACTURACION',
      monto_compania_sin_iva: sinIva,
      monto_compania_final: Math.round(finalConIva * 100) / 100,
      costo_prestador: casoData.costoPrestador || 0,
      precio_vidrio_material: casoData.precioVidrioMaterial || 0
    };

    const { data, error } = await supabase
      .from('casos')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('Error insertando caso en Supabase:', error);
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }

    // Insertar evento inicial
    await supabase.from('eventos').insert([
      {
        caso_id: data.id,
        usuario: 'Operador Sistema',
        rol: 'OPERATOR',
        evento: 'CREACION_CASO',
        descripcion: `Siniestro #${data.nro_trabajo} registrado en Supabase`
      }
    ]);

    return mapCasoFromDB(data);
  },

  // 5. Actualizar caso
  async updateCaso(id: string, partial: Partial<SiniestroCaso>): Promise<void> {
    if (!isSupabaseConfigured) return;

    const updatePayload: any = {};
    if (partial.estadoOperativo !== undefined) updatePayload.estado_operativo = partial.estadoOperativo;
    if (partial.estadoFinanciero !== undefined) updatePayload.estado_financiero = partial.estadoFinanciero;
    if (partial.causaCancelacion !== undefined) updatePayload.causa_cancelacion = partial.causaCancelacion;
    if (partial.infoExtraOperativa !== undefined) updatePayload.info_extra_operativa = partial.infoExtraOperativa;
    if (partial.infoExtraFinanciera !== undefined) updatePayload.info_extra_financiera = partial.infoExtraFinanciera;
    if (partial.costoPrestador !== undefined) updatePayload.costo_prestador = partial.costoPrestador;
    if (partial.precioVidrioMaterial !== undefined) updatePayload.precio_vidrio_material = partial.precioVidrioMaterial;
    if (partial.montoCompaniaSinIva !== undefined) {
      updatePayload.monto_compania_sin_iva = partial.montoCompaniaSinIva;
      updatePayload.monto_compania_final = Math.round(partial.montoCompaniaSinIva * 1.21 * 100) / 100;
    }
    if (partial.nroFactura !== undefined) updatePayload.nro_factura = partial.nroFactura;
    if (partial.fechaMailFactura !== undefined) updatePayload.fecha_mail_factura = partial.fechaMailFactura;
    if (partial.fechaCobro !== undefined) updatePayload.fecha_cobro = partial.fechaCobro;
    if (partial.retencionIva !== undefined) updatePayload.retencion_iva = partial.retencionIva;
    if (partial.retencionGanancias !== undefined) updatePayload.retencion_ganancias = partial.retencionGanancias;
    if (partial.retencionIibb !== undefined) updatePayload.retencion_iibb = partial.retencionIibb;

    const { error } = await supabase
      .from('casos')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Error actualizando caso:', error);
      throw new Error(error.message);
    }
  },

  // 6. Agregar evento al timeline
  async addEvento(casoId: string, evento: string, descripcion: string, usuario = 'Sistema', rol = 'OPERATOR'): Promise<void> {
    if (!isSupabaseConfigured) return;

    await supabase.from('eventos').insert([
      {
        caso_id: casoId,
        usuario,
        rol,
        evento,
        descripcion
      }
    ]);
  }
};
