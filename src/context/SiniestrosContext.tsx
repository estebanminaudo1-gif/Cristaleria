import React, { createContext, useContext, useState, useMemo } from 'react';
import type { SiniestroCaso, EstadoOperativo, EstadoFinanciero, Role, DashboardKPIs, FotoDocumento } from '../types';
import { initialCasos } from '../mock/initialData';

interface SiniestrosContextType {
  casos: SiniestroCaso[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  kpis: DashboardKPIs;
  getCasoById: (id: string) => SiniestroCaso | undefined;
  getCasoByToken: (token: string) => SiniestroCaso | undefined;
  addCaso: (casoData: Partial<SiniestroCaso>) => SiniestroCaso;
  updateCaso: (id: string, partial: Partial<SiniestroCaso>) => void;
  changeEstadoOperativo: (id: string, estado: EstadoOperativo, motivo?: string) => void;
  changeEstadoFinanciero: (id: string, estado: EstadoFinanciero) => void;
  addFotoToCaso: (casoId: string, foto: Omit<FotoDocumento, 'id'>) => void;
  marcarTrabajoRealizado: (casoId: string, costoPrestador: number, fotoUrl: string, firmaUrl?: string, obs?: string) => boolean;
  parseEmailAndCreateCaso: (mailData: { aseguradora: string; siniestro: string; poliza?: string; asegurado: string; tel: string; direccion: string; detalle: string }) => SiniestroCaso;
}

const SiniestrosContext = createContext<SiniestrosContextType | undefined>(undefined);

export const SiniestrosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [casos, setCasos] = useState<SiniestroCaso[]>(initialCasos);
  const [activeRole, setActiveRole] = useState<Role>('ADMIN');

  // Compute KPIs dynamically
  const kpis: DashboardKPIs = useMemo(() => {
    const abiertos = casos.filter(c => c.estadoOperativo !== 'DOCUMENTACION_COMPLETA' && c.estadoOperativo !== 'CANCELADO');
    const pendCoordinacion = casos.filter(c => c.estadoOperativo === 'NUEVO' || c.estadoOperativo === 'PENDIENTE_CONTACTO');
    const demorados = casos.filter(c => {
      if (c.estadoOperativo === 'NUEVO') {
        const horas = (new Date().getTime() - new Date(c.fechaIngreso).getTime()) / (1000 * 60 * 60);
        return horas > 24;
      }
      return false;
    });

    const porCobrarCompania = casos
      .filter(c => c.estadoFinanciero === 'FACTURADO' || c.estadoFinanciero === 'PENDIENTE_FACTURACION')
      .reduce((sum, c) => sum + (c.montoCompaniaFinal || 0), 0);

    const porPagarPrestadores = casos
      .filter(c => !c.pagadoPrestadorFecha && c.costoPrestador > 0)
      .reduce((sum, c) => sum + c.costoPrestador, 0);

    const margenTotal = casos.reduce((sum, c) => {
      const margen = (c.montoCompaniaSinIva || 0) - (c.costoPrestador || 0) - (c.precioVidrioMaterial || 0);
      return sum + (margen > 0 ? margen : 0);
    }, 0);

    const rentabilidadProm = casos.length > 0
      ? (casos.reduce((sum, c) => {
          if (!c.montoCompaniaSinIva) return sum;
          const m = c.montoCompaniaSinIva - c.costoPrestador - c.precioVidrioMaterial;
          return sum + ((m / c.montoCompaniaSinIva) * 100);
        }, 0) / casos.length)
      : 0;

    return {
      casosAbiertos: abiertos.length,
      pendientesCoordinacion: pendCoordinacion.length,
      demoradosMas48h: demorados.length,
      trabajosEstaSemana: casos.filter(c => c.fechaRealizacion || c.fechaVisitaCoordinada).length,
      porCobrarCompania,
      porPagarPrestadores,
      margenBrutoTotal: margenTotal,
      rentabilidadPromedioPct: Math.round(rentabilidadProm * 10) / 10
    };
  }, [casos]);

  const getCasoById = (id: string) => casos.find(c => c.id === id);

  const getCasoByToken = (token: string) => casos.find(c => c.magicToken === token);

  const addCaso = (casoData: Partial<SiniestroCaso>): SiniestroCaso => {
    const nextNroTrabajo = Math.max(...casos.map(c => c.nroTrabajo), 1123) + 1;
    const now = new Date().toISOString();

    const nuevoCaso: SiniestroCaso = {
      id: `case-${Date.now()}`,
      nroTrabajo: nextNroTrabajo,
      nroSiniestro: casoData.nroSiniestro || `SIN-${nextNroTrabajo}`,
      poliza: casoData.poliza || '-',
      aseguradora: casoData.aseguradora || 'General',
      fechaIngreso: now,
      fechaDenuncia: casoData.fechaDenuncia || now.split('T')[0],
      aseguradoNombre: casoData.aseguradoNombre || 'Asegurado Sin Nombre',
      aseguradoTel: casoData.aseguradoTel || '-',
      aseguradoDireccion: casoData.aseguradoDireccion || 'Sin dirección',
      aseguradoCiudad: casoData.aseguradoCiudad || 'Mar del Plata',
      prestadorAsignado: casoData.prestadorAsignado || 'Lolo',
      fechaDerivacion: now.split('T')[0],
      magicToken: `tok_${Math.random().toString(36).substring(2, 9)}`,
      detalleTrabajo: casoData.detalleTrabajo || 'Trabajo de vidriado',
      sumaAsegurada: casoData.sumaAsegurada || '100% en cobertura',
      items: casoData.items || [
        {
          id: `item-${Date.now()}`,
          tipoArticulo: 'Vidrio Float',
          cantidad: 1
        }
      ],
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
          fecha: now,
          usuario: 'Operador Sistema',
          rol: activeRole,
          evento: 'CREACION_CASO',
          descripcion: `Siniestro #${nextNroTrabajo} creado manualmente`
        }
      ]
    };

    setCasos(prev => [nuevoCaso, ...prev]);
    return nuevoCaso;
  };

  const updateCaso = (id: string, partial: Partial<SiniestroCaso>) => {
    setCasos(prev =>
      prev.map(c => {
        if (c.id === id) {
          const sinIva = partial.montoCompaniaSinIva !== undefined ? partial.montoCompaniaSinIva : c.montoCompaniaSinIva;
          const finalConIva = sinIva * 1.21;

          return {
            ...c,
            ...partial,
            montoCompaniaSinIva: sinIva,
            montoCompaniaFinal: Math.round(finalConIva * 100) / 100
          };
        }
        return c;
      })
    );
  };

  const changeEstadoOperativo = (id: string, nuevoEstado: EstadoOperativo, motivo?: string) => {
    const now = new Date().toISOString();
    setCasos(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nuevoTimeline = [
            ...c.timeline,
            {
              id: `t-${Date.now()}`,
              fecha: now,
              usuario: 'Usuario Operaciones',
              rol: activeRole,
              evento: 'CAMBIO_ESTADO_OPERATIVO',
              descripcion: `Transición a ${nuevoEstado}${motivo ? `. Motivo: ${motivo}` : ''}`
            }
          ];
          return {
            ...c,
            estadoOperativo: nuevoEstado,
            causaCancelacion: motivo || c.causaCancelacion,
            timeline: nuevoTimeline
          };
        }
        return c;
      })
    );
  };

  const changeEstadoFinanciero = (id: string, nuevoEstado: EstadoFinanciero) => {
    const now = new Date().toISOString();
    setCasos(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nuevoTimeline = [
            ...c.timeline,
            {
              id: `t-${Date.now()}`,
              fecha: now,
              usuario: 'Usuario Administración',
              rol: activeRole,
              evento: 'CAMBIO_ESTADO_FINANCIERO',
              descripcion: `Estado financiero actualizado a ${nuevoEstado}`
            }
          ];
          return {
            ...c,
            estadoFinanciero: nuevoEstado,
            timeline: nuevoTimeline
          };
        }
        return c;
      })
    );
  };

  const addFotoToCaso = (casoId: string, fotoData: Omit<FotoDocumento, 'id'>) => {
    const nuevaFoto: FotoDocumento = {
      ...fotoData,
      id: `foto-${Date.now()}`
    };

    setCasos(prev =>
      prev.map(c => {
        if (c.id === casoId) {
          return {
            ...c,
            fotos: [...c.fotos, nuevaFoto]
          };
        }
        return c;
      })
    );
  };

  const marcarTrabajoRealizado = (
    casoId: string,
    costoPrestador: number,
    fotoUrl: string,
    firmaUrl?: string,
    obs?: string
  ): boolean => {
    const caso = getCasoById(casoId);
    if (!caso) return false;

    const now = new Date().toISOString();
    const fotosNuevas: FotoDocumento[] = [
      {
        id: `foto-${Date.now()}-1`,
        tipo: 'FOTO_DESPUES',
        url: fotoUrl,
        subidoPor: caso.prestadorAsignado || 'Vidriero PWA',
        fecha: now
      }
    ];

    if (firmaUrl) {
      fotosNuevas.push({
        id: `foto-${Date.now()}-2`,
        tipo: 'FIRMA_CONFORMIDAD',
        url: firmaUrl,
        subidoPor: 'Asegurado Cliente',
        fecha: now
      });
    }

    setCasos(prev =>
      prev.map(c => {
        if (c.id === casoId) {
          return {
            ...c,
            costoPrestador: costoPrestador || c.costoPrestador,
            fechaRealizacion: now.split('T')[0],
            estadoOperativo: 'TRABAJO_REALIZADO',
            infoExtraOperativa: obs ? `${c.infoExtraOperativa || ''}\n[PWA Vidriero]: ${obs}` : c.infoExtraOperativa,
            fotos: [...c.fotos, ...fotosNuevas],
            timeline: [
              ...c.timeline,
              {
                id: `t-${Date.now()}`,
                fecha: now,
                usuario: `${c.prestadorAsignado || 'Vidriero'} (PWA Móvil)`,
                rol: 'PRESTADOR',
                evento: 'TRABAJO_REALIZADO',
                descripcion: 'Trabajo finalizado registrado con fotos y conformidad desde celular'
              }
            ]
          };
        }
        return c;
      })
    );

    return true;
  };

  const parseEmailAndCreateCaso = (mailData: {
    aseguradora: string;
    siniestro: string;
    poliza?: string;
    asegurado: string;
    tel: string;
    direccion: string;
    detalle: string;
  }) => {
    return addCaso({
      aseguradora: mailData.aseguradora,
      nroSiniestro: mailData.siniestro,
      poliza: mailData.poliza,
      aseguradoNombre: mailData.asegurado,
      aseguradoTel: mailData.tel,
      aseguradoDireccion: mailData.direccion,
      detalleTrabajo: mailData.detalle,
      canalIngreso: 'EMAIL'
    });
  };

  return (
    <SiniestrosContext.Provider
      value={{
        casos,
        activeRole,
        setActiveRole,
        kpis,
        getCasoById,
        getCasoByToken,
        addCaso,
        updateCaso,
        changeEstadoOperativo,
        changeEstadoFinanciero,
        addFotoToCaso,
        marcarTrabajoRealizado,
        parseEmailAndCreateCaso
      }}
    >
      {children}
    </SiniestrosContext.Provider>
  );
};

export const useSiniestros = () => {
  const context = useContext(SiniestrosContext);
  if (!context) {
    throw new Error('useSiniestros debe usarse dentro de un SiniestrosProvider');
  }
  return context;
};
