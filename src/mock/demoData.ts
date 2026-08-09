import type { SiniestroCaso } from '../types';

// Datos de demostración genéricos y sanitizados para modo demo/desarrollo (Sin datos reales de clientes ni tokens privados)
export const demoCasos: SiniestroCaso[] = [
  {
    id: 'case-demo-1001',
    nroTrabajo: 1001,
    nroSiniestro: 'SIN-DEMO-1001',
    poliza: 'POL-1001',
    aseguradora: 'Aseguradora Demo A',
    fechaIngreso: '2026-02-01T09:00:00Z',
    fechaDenuncia: '2026-02-01',
    aseguradoNombre: 'Cliente Demo Uno',
    aseguradoTel: '555-0101',
    aseguradoDireccion: 'Calle Ficticia 123',
    aseguradoCiudad: 'Ciudad Demo',
    prestadorAsignado: 'Prestador Demo 1',
    fechaDerivacion: '2026-02-01',
    fechaVisitaCoordinada: '2026-02-02',
    fechaRealizacion: '2026-02-03',
    magicToken: 'tok_demo_1001',
    detalleTrabajo: 'Vidrio 4mm Incoloro 500x500mm',
    sumaAsegurada: '100% en cobertura',
    items: [
      {
        id: 'item-demo-1',
        tipoArticulo: 'Vidrio Float 4mm',
        anchoMm: 500,
        altoMm: 500,
        espesorMm: 4,
        detallesHerrajes: 'Sin herrajes',
        cantidad: 1
      }
    ],
    fotos: [],
    estadoOperativo: 'TRABAJO_REALIZADO',
    estadoFinanciero: 'FACTURADO',
    infoExtraOperativa: 'Instalación de muestra completada',
    costoPrestador: 10000,
    precioVidrioMaterial: 5000,
    montoCompaniaSinIva: 30000,
    montoCompaniaFinal: 36300,
    nroFactura: 'FACT-DEMO-01',
    retencionIva: 0,
    retencionGanancias: 0,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-demo-1',
        fecha: '2026-02-01T09:00:00Z',
        usuario: 'Sistema Demo',
        rol: 'SYSTEM',
        evento: 'CREACION_DEMO',
        descripcion: 'Caso de prueba de demostración'
      }
    ]
  }
];
