import type { SiniestroCaso } from '../types';

export const initialCasos: SiniestroCaso[] = [
  {
    id: 'case-1120',
    nroTrabajo: 1120,
    nroSiniestro: '661259',
    poliza: '-',
    aseguradora: 'IGS',
    fechaIngreso: '2026-01-02T09:30:00Z',
    fechaDenuncia: '2026-01-02',
    aseguradoNombre: 'ELIZONDO, EDUARDO',
    aseguradoTel: '2235123456',
    aseguradoDireccion: 'REPUBLICA ARABE SIRIA 2268- ENTRE COLON Y BROWN',
    aseguradoCiudad: 'Mar del Plata',
    prestadorAsignado: 'Lolo',
    fechaDerivacion: '2026-01-02',
    fechaVisitaCoordinada: '2026-01-04',
    fechaRealizacion: '2026-01-06',
    magicToken: 'tok_lolo_1120',
    detalleTrabajo: '320*240mm 4 mm incoloro - vidrio repartido',
    sumaAsegurada: '100% en cobertura',
    items: [
      {
        id: 'item-1',
        tipoArticulo: 'Vidrio 4mm Incoloro',
        anchoMm: 320,
        altoMm: 240,
        espesorMm: 4,
        detallesHerrajes: 'Vidrio repartido comedor',
        cantidad: 1
      }
    ],
    fotos: [
      {
        id: 'foto-1',
        tipo: 'FOTO_ANTES',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        subidoPor: 'Lolo',
        fecha: '2026-01-06T14:10:00Z'
      },
      {
        id: 'foto-2',
        tipo: 'FOTO_DESPUES',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        subidoPor: 'Lolo',
        fecha: '2026-01-06T15:30:00Z'
      }
    ],
    estadoOperativo: 'TRABAJO_REALIZADO',
    estadoFinanciero: 'COBRADO',
    infoExtraOperativa: 'Doy aviso a IGS que cambiamos otro vidrio que indicó quien lo recibió. Habla con el cliente y supervisor: APROBADO.',
    infoExtraFinanciera: 'Paga en término',
    costoPrestador: 20000,
    pagadoPrestadorFecha: '2026-02-24',
    precioVidrioMaterial: 8000,
    montoCompaniaSinIva: 50000,
    montoCompaniaFinal: 60500,
    nroFactura: '942',
    fechaMailFactura: '2026-01-07',
    fechaCobro: '2026-01-13',
    montoDepositado: 119000,
    retencionIva: 2000,
    retencionGanancias: 0,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-1',
        fecha: '2026-01-02T09:30:00Z',
        usuario: 'Sistema Email Parser',
        rol: 'SYSTEM',
        evento: 'INGESTA_EMAIL',
        descripcion: 'Caso creado automáticamente desde email entrante de IGS (Siniestro #661259)'
      },
      {
        id: 't-2',
        fecha: '2026-01-02T09:35:00Z',
        usuario: 'Ana Operaciones',
        rol: 'OPERATOR',
        evento: 'CONTACTO_ASEGURADO',
        descripcion: 'Mensaje de WhatsApp de bienvenida enviado al asegurado Eduardo Elizondo'
      },
      {
        id: 't-3',
        fecha: '2026-01-02T10:15:00Z',
        usuario: 'Ana Operaciones',
        rol: 'OPERATOR',
        evento: 'ASIGNACION_PRESTADOR',
        descripcion: 'Vidriero Lolo asignado y notificado vía Magic Link WhatsApp'
      },
      {
        id: 't-4',
        fecha: '2026-01-06T15:30:00Z',
        usuario: 'Lolo (Prestador)',
        rol: 'PRESTADOR',
        evento: 'TRABAJO_REALIZADO',
        descripcion: 'Prestador subió 2 fotos de la instalación y marcó el trabajo como realizado'
      },
      {
        id: 't-5',
        fecha: '2026-01-07T11:00:00Z',
        usuario: 'Carlos Finanzas',
        rol: 'FINANCE',
        evento: 'FACTURADO',
        descripcion: 'Factura Nº 942 emitida y enviada por mail a la aseguradora IGS'
      }
    ]
  },
  {
    id: 'case-1121',
    nroTrabajo: 1121,
    nroSiniestro: 'CUIT 30521742832',
    poliza: '-',
    aseguradora: 'Particular',
    fechaIngreso: '2026-01-02T10:00:00Z',
    aseguradoNombre: 'Administración González',
    aseguradoTel: '2236069360 (Florencia 2235035880 8-11am)',
    aseguradoDireccion: 'Santa fe 1635',
    aseguradoCiudad: 'Mar del Plata',
    prestadorAsignado: 'Lolo',
    fechaDerivacion: '2026-01-06',
    fechaVisitaCoordinada: '2026-01-06',
    fechaRealizacion: '2026-02-04',
    magicToken: 'tok_lolo_1121',
    detalleTrabajo: 'Retirar vidrio, dejar trabajar al gasista, cortarlo arriba a la izquierda por caño. Vidrio armado 1495*735 mm.',
    sumaAsegurada: 'Particular - Presupuesto Aprobado',
    items: [
      {
        id: 'item-2',
        tipoArticulo: 'Vidrio Armado Espacial',
        anchoMm: 1495,
        altoMm: 735,
        espesorMm: 6,
        detallesHerrajes: 'Corte especial caja de gas arriba izquierda',
        cantidad: 1
      }
    ],
    fotos: [
      {
        id: 'foto-3',
        tipo: 'FOTO_DESPUES',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        subidoPor: 'Lolo',
        fecha: '2026-02-04T16:00:00Z'
      }
    ],
    estadoOperativo: 'TRABAJO_REALIZADO',
    estadoFinanciero: 'COBRADO',
    infoExtraOperativa: '30/01 gasista terminado. Pasa Lolo a medir nuevo recuadro de hierro.',
    infoExtraFinanciera: 'Pagado 5 y 9/03',
    costoPrestador: 80000,
    pagadoPrestadorFecha: '2026-03-09',
    precioVidrioMaterial: 25000,
    montoCompaniaSinIva: 160000,
    montoCompaniaFinal: 193600,
    nroFactura: 'B 047',
    fechaMailFactura: '2026-02-04',
    fechaCobro: '2026-02-05',
    montoDepositado: 193600,
    retencionIva: 0,
    retencionGanancias: 0,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-1121-1',
        fecha: '2026-01-02T10:00:00Z',
        usuario: 'Ana Operaciones',
        rol: 'OPERATOR',
        evento: 'CREACION_MANUAL',
        descripcion: 'Siniestro creado a pedido de Admin González'
      },
      {
        id: 't-1121-2',
        fecha: '2026-01-06T12:00:00Z',
        usuario: 'Lolo (Prestador)',
        rol: 'PRESTADOR',
        evento: 'INSPECCION_CAMPO',
        descripcion: 'Lolo inspeccionó el lugar y coordinó esperar fin del trabajo del gasista'
      }
    ]
  },
  {
    id: 'case-1122',
    nroTrabajo: 1122,
    nroSiniestro: '40629/23',
    poliza: '481482',
    aseguradora: 'BBVA',
    fechaIngreso: '2026-01-02T11:15:00Z',
    fechaDenuncia: '2026-01-02',
    aseguradoNombre: 'LUCAS GABRIEL HOYOS',
    aseguradoTel: '2235267022 (CRISTIAN)',
    aseguradoDireccion: 'Av. Constitución 5062 (Atención 7 a 14hs y 17 a 22hs)',
    aseguradoCiudad: 'Mar del Plata',
    prestadorAsignado: 'Lolo',
    fechaDerivacion: '2026-01-02',
    fechaVisitaCoordinada: '2026-01-03',
    fechaRealizacion: '2026-01-06',
    magicToken: 'tok_lolo_1122',
    detalleTrabajo: 'Espejo 4mm - 900 x 1410 mm // Espejo 4mm - 1596 x 437 mm',
    sumaAsegurada: '$ 2.287.863,81',
    items: [
      {
        id: 'item-1122-1',
        tipoArticulo: 'Espejo 4mm Float',
        anchoMm: 900,
        altoMm: 1410,
        espesorMm: 4,
        detallesHerrajes: 'Corte pulido',
        cantidad: 1
      },
      {
        id: 'item-1122-2',
        tipoArticulo: 'Espejo 4mm Float',
        anchoMm: 1596,
        altoMm: 437,
        espesorMm: 4,
        detallesHerrajes: 'Corte pulido',
        cantidad: 1
      }
    ],
    fotos: [
      {
        id: 'foto-1122-1',
        tipo: 'FOTO_DESPUES',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
        subidoPor: 'Lolo',
        fecha: '2026-01-06T18:00:00Z'
      }
    ],
    estadoOperativo: 'TRABAJO_REALIZADO',
    estadoFinanciero: 'COBRADO',
    infoExtraOperativa: 'Instalación de ambos espejos en vestidor comercial.',
    costoPrestador: 80000,
    pagadoPrestadorFecha: '2026-02-24',
    precioVidrioMaterial: 42000,
    montoCompaniaSinIva: 265416,
    montoCompaniaFinal: 321153.36,
    nroFactura: '943',
    fechaMailFactura: '2026-01-07',
    fechaCobro: '2026-01-14',
    montoDepositado: 324910.15,
    retencionIva: 53409.89,
    retencionGanancias: 6358.32,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-1122-1',
        fecha: '2026-01-02T11:15:00Z',
        usuario: 'Sistema Mail Parser',
        rol: 'SYSTEM',
        evento: 'INGESTA_EMAIL',
        descripcion: 'Mail recibido de BBVA Seguros (Siniestro 40629/23, Póliza 481482)'
      }
    ]
  },
  {
    id: 'case-1123',
    nroTrabajo: 1123,
    nroSiniestro: 'PENDIENTE-BBVA-01',
    poliza: '-',
    aseguradora: 'Particular',
    fechaIngreso: '2026-01-02T14:30:00Z',
    aseguradoNombre: 'Sebastián Panasci',
    aseguradoTel: '2235253750',
    aseguradoDireccion: 'Lijo López 8241- La Florida',
    aseguradoCiudad: 'Mar del Plata',
    prestadorAsignado: 'Lolo',
    magicToken: 'tok_lolo_1123',
    detalleTrabajo: 'Templados 8mm de 2170x640mm con herrajes (tirador P68B + bisagras P63) + Espejos 5mm con cortes escalonados.',
    sumaAsegurada: 'Pendiente Cotización',
    items: [
      {
        id: 'item-1123-1',
        tipoArticulo: 'Templado 8mm Incoloro',
        anchoMm: 2170,
        altoMm: 640,
        espesorMm: 8,
        detallesHerrajes: 'Tirador P 68B + 2 bisagras P63',
        cantidad: 2
      },
      {
        id: 'item-1123-2',
        tipoArticulo: 'Templado 8mm Incoloro',
        anchoMm: 2550,
        altoMm: 920,
        espesorMm: 8,
        detallesHerrajes: 'Tirador P 68B + 3 bisagras P63',
        cantidad: 1
      },
      {
        id: 'item-1123-3',
        tipoArticulo: 'Espejo 5mm Especial',
        anchoMm: 1650,
        altoMm: 3050,
        espesorMm: 5,
        detallesHerrajes: 'Cortes escalones y caja de luz a definir con Lolo',
        cantidad: 1
      }
    ],
    fotos: [],
    estadoOperativo: 'PRESUPUESTO_INFORMADO',
    estadoFinanciero: 'PENDIENTE_FACTURACION',
    infoExtraOperativa: '15/01 Presupuesto informado $294.000, copia detallada lista.',
    costoPrestador: 110000,
    precioVidrioMaterial: 75000,
    montoCompaniaSinIva: 294000,
    montoCompaniaFinal: 355740,
    retencionIva: 0,
    retencionGanancias: 0,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-1123-1',
        fecha: '2026-01-02T14:30:00Z',
        usuario: 'Ana Operaciones',
        rol: 'OPERATOR',
        evento: 'CREACION_CASO',
        descripcion: 'Carga inicial de especificaciones de vidrios y espejos para Panasci'
      },
      {
        id: 't-1123-2',
        fecha: '2026-01-15T10:00:00Z',
        usuario: 'Lolo (Prestador)',
        rol: 'PRESTADOR',
        evento: 'PRESUPUESTO_CARGADO',
        descripcion: 'Lolo envió presupuesto por $294.000 sin IVA'
      }
    ]
  },
  {
    id: 'case-1124',
    nroTrabajo: 1124,
    nroSiniestro: '992140',
    poliza: '772183',
    aseguradora: 'SURA',
    fechaIngreso: '2026-01-05T08:10:00Z',
    fechaDenuncia: '2026-01-04',
    aseguradoNombre: 'MARIA LAURA BENITEZ',
    aseguradoTel: '2234991122',
    aseguradoDireccion: 'Alvarado 1420 2° B',
    aseguradoCiudad: 'Mar del Plata',
    prestadorAsignado: 'Cristales Sur',
    fechaDerivacion: '2026-01-05',
    fechaVisitaCoordinada: '2026-01-08',
    magicToken: 'tok_sur_1124',
    detalleTrabajo: 'Ventanal balcón 1200x2000mm 5mm Float incoloro',
    sumaAsegurada: '$ 500.000,00',
    items: [
      {
        id: 'item-1124-1',
        tipoArticulo: 'Vidrio 5mm Float Incoloro',
        anchoMm: 1200,
        altoMm: 2000,
        espesorMm: 5,
        detallesHerrajes: 'Sellado silicona estructural',
        cantidad: 1
      }
    ],
    fotos: [],
    estadoOperativo: 'VISITA_COORDINADA',
    estadoFinanciero: 'PENDIENTE_FACTURACION',
    infoExtraOperativa: 'Coordinado para el 8 de enero de 9 a 11 hrs.',
    costoPrestador: 35000,
    precioVidrioMaterial: 18000,
    montoCompaniaSinIva: 98000,
    montoCompaniaFinal: 118580,
    retencionIva: 0,
    retencionGanancias: 0,
    retencionIibb: 0,
    timeline: [
      {
        id: 't-1124-1',
        fecha: '2026-01-05T08:10:00Z',
        usuario: 'Sistema Mail Parser',
        rol: 'SYSTEM',
        evento: 'INGESTA_EMAIL',
        descripcion: 'Ingreso desde SURA Seguros'
      }
    ]
  }
];
