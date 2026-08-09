import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { SiniestroCaso, EstadoOperativo, EstadoFinanciero, Role, DashboardKPIs, FotoDocumento } from '../types';
import { initialCasos } from '../mock/initialData';
import { casosService } from '../services/casosService';
import { isSupabaseConfigured } from '../lib/supabase';

interface SiniestrosContextType {
  casos: SiniestroCaso[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isCloudConnected: boolean;
  clearError: () => void;
  kpis: DashboardKPIs;
  getCasoById: (id: string) => SiniestroCaso | undefined;
  getCasoByToken: (token: string) => SiniestroCaso | undefined;
  addCaso: (casoData: Partial<SiniestroCaso>) => Promise<SiniestroCaso>;
  updateCaso: (id: string, partial: Partial<SiniestroCaso>) => Promise<void>;
  changeEstadoOperativo: (id: string, estado: EstadoOperativo, motivo?: string) => Promise<void>;
  changeEstadoFinanciero: (id: string, estado: EstadoFinanciero) => Promise<void>;
  addFotoToCaso: (casoId: string, foto: Omit<FotoDocumento, 'id'>) => Promise<void>;
  marcarTrabajoRealizado: (casoId: string, costoPrestador: number, fotoUrl: string, firmaUrl?: string, obs?: string) => Promise<boolean>;
  parseEmailAndCreateCaso: (mailData: { aseguradora: string; siniestro: string; poliza?: string; asegurado: string; tel: string; direccion: string; detalle: string }) => Promise<SiniestroCaso>;
}

const SiniestrosContext = createContext<SiniestrosContextType | undefined>(undefined);

export const SiniestrosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [casos, setCasos] = useState<SiniestroCaso[]>(initialCasos);
  const [activeRole, setActiveRole] = useState<Role>('ADMIN');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Carga inicial de datos desde Supabase o Fallback Mock
  useEffect(() => {
    let isMounted = true;
    const fetchCasos = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const data = await casosService.getCasos();
          if (isMounted) setCasos(data);
        } else {
          if (isMounted) setCasos(initialCasos);
        }
      } catch (err: any) {
        console.error('Error al cargar casos:', err);
        if (isMounted) setError(err.message || 'No se pudieron obtener los datos de la nube.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCasos();
    return () => { isMounted = false; };
  }, []);

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

  const addCaso = async (casoData: Partial<SiniestroCaso>): Promise<SiniestroCaso> => {
    setSaving(true);
    try {
      const nuevo = await casosService.createCaso(casoData);
      setCasos(prev => [nuevo, ...prev]);
      return nuevo;
    } catch (err: any) {
      setError(err.message || 'Error al guardar el siniestro.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateCaso = async (id: string, partial: Partial<SiniestroCaso>): Promise<void> => {
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        await casosService.updateCaso(id, partial);
      }
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
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el caso.');
    } finally {
      setSaving(false);
    }
  };

  const changeEstadoOperativo = async (id: string, nuevoEstado: EstadoOperativo, motivo?: string): Promise<void> => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (isSupabaseConfigured) {
        await casosService.updateCaso(id, { estadoOperativo: nuevoEstado, causaCancelacion: motivo });
        await casosService.addEvento(id, 'CAMBIO_ESTADO_OPERATIVO', `Transición a ${nuevoEstado}${motivo ? `. Motivo: ${motivo}` : ''}`);
      }

      setCasos(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              estadoOperativo: nuevoEstado,
              causaCancelacion: motivo || c.causaCancelacion,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  fecha: now,
                  usuario: 'Usuario Operaciones',
                  rol: activeRole,
                  evento: 'CAMBIO_ESTADO_OPERATIVO',
                  descripcion: `Transición a ${nuevoEstado}${motivo ? `. Motivo: ${motivo}` : ''}`
                }
              ]
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado operativo.');
    } finally {
      setSaving(false);
    }
  };

  const changeEstadoFinanciero = async (id: string, nuevoEstado: EstadoFinanciero): Promise<void> => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (isSupabaseConfigured) {
        await casosService.updateCaso(id, { estadoFinanciero: nuevoEstado });
        await casosService.addEvento(id, 'CAMBIO_ESTADO_FINANCIERO', `Estado financiero actualizado a ${nuevoEstado}`);
      }

      setCasos(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              estadoFinanciero: nuevoEstado,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  fecha: now,
                  usuario: 'Usuario Administración',
                  rol: activeRole,
                  evento: 'CAMBIO_ESTADO_FINANCIERO',
                  descripcion: `Estado financiero actualizado a ${nuevoEstado}`
                }
              ]
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado financiero.');
    } finally {
      setSaving(false);
    }
  };

  const addFotoToCaso = async (casoId: string, fotoData: Omit<FotoDocumento, 'id'>): Promise<void> => {
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

  const marcarTrabajoRealizado = async (
    casoId: string,
    costoPrestador: number,
    fotoUrl: string,
    firmaUrl?: string,
    obs?: string
  ): Promise<boolean> => {
    const caso = getCasoById(casoId);
    if (!caso) return false;

    setSaving(true);
    try {
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

      if (isSupabaseConfigured) {
        await casosService.updateCaso(casoId, {
          costoPrestador,
          estadoOperativo: 'TRABAJO_REALIZADO',
          fechaRealizacion: now.split('T')[0]
        });
        await casosService.addEvento(casoId, 'TRABAJO_REALIZADO', 'Trabajo finalizado registrado con fotos y conformidad desde celular', 'Vidriero', 'PRESTADOR');
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
    } catch (err: any) {
      setError(err.message || 'Error al guardar finalización de trabajo.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const parseEmailAndCreateCaso = async (mailData: {
    aseguradora: string;
    siniestro: string;
    poliza?: string;
    asegurado: string;
    tel: string;
    direccion: string;
    detalle: string;
  }): Promise<SiniestroCaso> => {
    return await addCaso({
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
        loading,
        saving,
        error,
        isCloudConnected: isSupabaseConfigured,
        clearError,
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
