export type EstadoOperativo =
  | 'NUEVO'
  | 'PENDIENTE_CONTACTO'
  | 'VISITA_COORDINADA'
  | 'PRESUPUESTO_INFORMADO'
  | 'APROBADO'
  | 'TRABAJO_PROGRAMADO'
  | 'TRABAJO_REALIZADO'
  | 'DOCUMENTACION_COMPLETA'
  | 'CANCELADO';

export type EstadoFinanciero =
  | 'PENDIENTE_FACTURACION'
  | 'FACTURADO'
  | 'COBRADO'
  | 'LIQUIDADO_PRESTADOR';

export type Role = 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | 'FINANCE' | 'PRESTADOR';

export interface ItemTrabajo {
  id: string;
  tipoArticulo: string; // ej: "Vidrio 4mm Incoloro", "Espejo 5mm", "Templado 8mm"
  anchoMm?: number;
  altoMm?: number;
  espesorMm?: number;
  detallesHerrajes?: string; // ej: "Tirador P68B + 2 bisagras P63"
  cantidad: number;
}

export interface FotoDocumento {
  id: string;
  tipo: 'FOTO_ANTES' | 'FOTO_DESPUES' | 'FIRMA_CONFORMIDAD' | 'REMITO';
  url: string;
  subidoPor: string;
  fecha: string;
}

export interface EventoAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  rol: string;
  evento: string;
  descripcion: string;
}

export interface SiniestroCaso {
  id: string;
  nroTrabajo: number; // Ej. 1120
  nroSiniestro: string; // Ej. "661259"
  poliza?: string;
  aseguradora: string; // Ej. "IGS", "BBVA", "Particular"
  // Canal e Ingesta
  canalIngreso?: string;
  fechaIngreso: string;
  fechaDenuncia?: string;
  
  // Datos del Asegurado
  aseguradoNombre: string;
  aseguradoTel: string;
  aseguradoDireccion: string;
  aseguradoCiudad: string;
  
  // Prestador (Vidriero)
  prestadorAsignado?: string; // Ej. "Lolo"
  fechaDerivacion?: string;
  fechaVisitaCoordinada?: string;
  fechaRealizacion?: string;
  magicToken: string; // Token único para acceso móvil PWA
  
  // Trabajo y Cobertura
  detalleTrabajo: string;
  sumaAsegurada: string; // Ej. "100% en cobertura"
  items: ItemTrabajo[];
  fotos: FotoDocumento[];
  
  // Estados Ortogonales
  estadoOperativo: EstadoOperativo;
  estadoFinanciero: EstadoFinanciero;
  causaCancelacion?: string;
  infoExtraOperativa?: string;
  infoExtraFinanciera?: string;
  
  // Financiero
  costoPrestador: number;
  pagadoPrestadorFecha?: string;
  precioVidrioMaterial: number;
  montoCompaniaSinIva: number;
  montoCompaniaFinal: number; // Con IVA 21%
  
  // Facturación y Cobro
  nroFactura?: string;
  fechaMailFactura?: string;
  fechaCobro?: string;
  montoDepositado?: number;
  retencionIva: number;
  retencionGanancias: number;
  retencionIibb: number;
  
  // Timeline audit trail
  timeline: EventoAuditoria[];
}

export interface DashboardKPIs {
  casosAbiertos: number;
  pendientesCoordinacion: number;
  demoradosMas48h: number;
  trabajosEstaSemana: number;
  porCobrarCompania: number;
  porPagarPrestadores: number;
  margenBrutoTotal: number;
  rentabilidadPromedioPct: number;
}
