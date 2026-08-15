import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SiniestroCaso, EstadoOperativo, EstadoFinanciero, Role, DashboardKPIs, FotoDocumento } from '../types';
import { casosService } from '../services/casosService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const isDemoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const LOCAL_STORAGE_KEY = 'mercado_cristales_casos_v1';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  role: Role;
}

interface SiniestrosContextType {
  casos: SiniestroCaso[];
  user: User | null;
  profile: UserProfile | null;
  activeRole: Role | null;
  setActiveRole: (role: Role) => void;
  loading: boolean;
  authLoading: boolean;
  saving: boolean;
  error: string | null;
  unauthorizedError: string | null;
  clearUnauthorizedError: () => void;
  isCloudConnected: boolean;
  isDemoMode: boolean;
  isSetupRequired: boolean;
  clearError: () => void;
  logout: () => Promise<void>;
  kpis: DashboardKPIs;
  getCasoById: (id: string) => SiniestroCaso | undefined;
  getCasoByToken: (token: string) => SiniestroCaso | undefined;
  addCaso: (casoData: Partial<SiniestroCaso>) => Promise<SiniestroCaso>;
  updateCaso: (id: string, partial: Partial<SiniestroCaso>) => Promise<void>;
  changeEstadoOperativo: (id: string, estado: EstadoOperativo, motivo?: string) => Promise<void>;
  changeEstadoFinanciero: (id: string, estado: EstadoFinanciero) => Promise<void>;
  addFotoToCaso: (casoId: string, foto: Omit<FotoDocumento, 'id'>) => Promise<void>;
  removeFotoFromCaso: (casoId: string, fotoId: string) => Promise<void>;
  marcarTrabajoRealizado: (casoId: string, costoPrestador: number, fotoUrl: string, firmaUrl?: string, obs?: string) => Promise<boolean>;
  parseEmailAndCreateCaso: (mailData: { aseguradora: string; siniestro: string; poliza?: string; asegurado: string; tel: string; direccion: string; detalle: string }) => Promise<SiniestroCaso>;
}

const SiniestrosContext = createContext<SiniestrosContextType | undefined>(undefined);

export const SiniestrosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [casos, setCasos] = useState<SiniestroCaso[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  const isSetupRequired = !isSupabaseConfigured && !isDemoModeEnabled;

  const clearError = () => setError(null);
  const clearUnauthorizedError = () => setUnauthorizedError(null);

  // Permitir cambiar rol únicamente si está en modo demo explícito
  const setActiveRole = (newRole: Role) => {
    if (isDemoModeEnabled) {
      setActiveRoleState(newRole);
    }
  };

  // Función interna para verificar perfil de usuario autenticado
  const verifyUserProfile = async (authUser: User): Promise<UserProfile | null> => {
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('id, nombre, email, role')
        .eq('id', authUser.id)
        .single();

      if (profileErr || !profileData || !profileData.role) {
        return null;
      }

      const validRoles: Role[] = ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE', 'PRESTADOR'];
      if (!validRoles.includes(profileData.role as Role)) {
        return null;
      }

      return {
        id: profileData.id,
        nombre: profileData.nombre,
        email: profileData.email,
        role: profileData.role as Role
      };
    } catch {
      return null;
    }
  };

  // Manejo de la sesión de Supabase Auth
  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured) {
      const initAuthSession = async () => {
        setAuthLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const validProfile = await verifyUserProfile(session.user);
            if (isMounted) {
              if (validProfile) {
                setUser(session.user);
                setProfile(validProfile);
                setActiveRoleState(validProfile.role);
                setUnauthorizedError(null);
              } else {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                setActiveRoleState(null);
                setUnauthorizedError('Tu usuario no está autorizado para acceder a esta aplicación.');
              }
            }
          } else {
            if (isMounted) {
              setUser(null);
              setProfile(null);
              setActiveRoleState(null);
            }
          }
        } catch (err) {
          console.error('Error al inicializar sesión de auth:', err);
        } finally {
          if (isMounted) setAuthLoading(false);
        }
      };

      initAuthSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        setAuthLoading(true);
        try {
          if (session?.user) {
            const validProfile = await verifyUserProfile(session.user);
            if (validProfile) {
              setUser(session.user);
              setProfile(validProfile);
              setActiveRoleState(validProfile.role);
              setUnauthorizedError(null);
            } else {
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setActiveRoleState(null);
              setUnauthorizedError('Tu usuario no está autorizado para acceder a esta aplicación.');
            }
          } else {
            setUser(null);
            setProfile(null);
            setActiveRoleState(null);
          }
        } finally {
          setAuthLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      if (isDemoModeEnabled) {
        setActiveRoleState('ADMIN');
      }
      setAuthLoading(false);
    }
  }, []);

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setActiveRoleState(null);
    setUnauthorizedError(null);
  };

  // Carga e inicialización de datos con persistencia en localStorage o Supabase
  useEffect(() => {
    let isMounted = true;
    const loadCasosData = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          if (user && profile) {
            const data = await casosService.getCasos();
            if (isMounted) setCasos(data);
          } else {
            if (isMounted) setCasos([]);
          }
        } else if (isDemoModeEnabled) {
          // Intentar restaurar desde localStorage en modo demo
          const localStored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localStored) {
            try {
              const parsed = JSON.parse(localStored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (isMounted) setCasos(parsed);
                return;
              }
            } catch (e) {
              console.error('Error leyendo localStorage:', e);
            }
          }

          // Carga inicial de datos demo sanitizados si no hay localStorage previo
          const { demoCasos } = await import('../mock/demoData');
          if (isMounted) {
            setCasos(demoCasos);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoCasos));
          }
        } else {
          if (isMounted) setCasos([]);
        }
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        if (isMounted) setError(err.message || 'Error al obtener siniestros.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCasosData();
    return () => { isMounted = false; };
  }, [user, profile]);

  // Persistir automáticamente cualquier cambio en localStorage en modo local/demo
  useEffect(() => {
    if (!isSupabaseConfigured && casos.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(casos));
      } catch (e) {
        console.error('Error guardando en localStorage:', e);
      }
    }
  }, [casos]);

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
      const existingNums = new Set(casos.map(c => c.nroTrabajo));
      let randomNro: number;
      do {
        randomNro = Math.floor(1000 + Math.random() * 9000);
      } while (existingNums.has(randomNro));

      const nuevo = await casosService.createCaso({
        ...casoData,
        nroTrabajo: casoData.nroTrabajo || randomNro
      });
      setCasos(prev => {
        const updated = [nuevo, ...prev];
        if (!isSupabaseConfigured) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
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
      setCasos(prev => {
        const updated = prev.map(c => {
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
        });
        if (!isSupabaseConfigured) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
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

      setCasos(prev => {
        const updated = prev.map(c => {
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
                  usuario: profile?.nombre || user?.email || 'Usuario Operaciones',
                  rol: activeRole || 'OPERATOR',
                  evento: 'CAMBIO_ESTADO_OPERATIVO',
                  descripcion: `Transición a ${nuevoEstado}${motivo ? `. Motivo: ${motivo}` : ''}`
                }
              ]
            };
          }
          return c;
        });
        if (!isSupabaseConfigured) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
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

      setCasos(prev => {
        const updated = prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              estadoFinanciero: nuevoEstado,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  fecha: now,
                  usuario: profile?.nombre || user?.email || 'Usuario Administración',
                  rol: activeRole || 'FINANCE',
                  evento: 'CAMBIO_ESTADO_FINANCIERO',
                  descripcion: `Estado financiero actualizado a ${nuevoEstado}`
                }
              ]
            };
          }
          return c;
        });
        if (!isSupabaseConfigured) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado financiero.');
    } finally {
      setSaving(false);
    }
  };

  const addFotoToCaso = async (casoId: string, fotoData: Omit<FotoDocumento, 'id'>): Promise<void> => {
    const nuevaFoto: FotoDocumento = {
      ...fotoData,
      id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };

    setCasos(prev => {
      const updated = prev.map(c => {
        if (c.id === casoId) {
          return {
            ...c,
            fotos: [...c.fotos, nuevaFoto]
          };
        }
        return c;
      });
      if (!isSupabaseConfigured) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const removeFotoFromCaso = async (casoId: string, fotoId: string): Promise<void> => {
    setCasos(prev => {
      const updated = prev.map(c => {
        if (c.id === casoId) {
          return {
            ...c,
            fotos: c.fotos.filter(f => f.id !== fotoId)
          };
        }
        return c;
      });
      if (!isSupabaseConfigured) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
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
        await casosService.addEvento(casoId, 'TRABAJO_REALIZADO', 'Trabajo finalizado registrado con fotos y conformidad desde celular', profile?.nombre || user?.email || 'Vidriero', 'PRESTADOR');
      }

      setCasos(prev => {
        const updated = prev.map(c => {
          if (c.id === casoId) {
            return {
              ...c,
              costoPrestador: costoPrestador || c.costoPrestador,
              fechaRealizacion: now.split('T')[0],
              estadoOperativo: 'TRABAJO_REALIZADO' as EstadoOperativo,
              infoExtraOperativa: obs ? `${c.infoExtraOperativa || ''}\n[PWA Vidriero]: ${obs}` : c.infoExtraOperativa,
              fotos: [...c.fotos, ...fotosNuevas],
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  fecha: now,
                  usuario: `${profile?.nombre || user?.email || caso.prestadorAsignado || 'Vidriero'} (PWA Móvil)`,
                  rol: 'PRESTADOR',
                  evento: 'TRABAJO_REALIZADO',
                  descripcion: 'Trabajo finalizado registrado con fotos y conformidad desde celular'
                }
              ]
            };
          }
          return c;
        });
        if (!isSupabaseConfigured) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });

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
        user,
        profile,
        activeRole: activeRole || 'OPERATOR',
        setActiveRole,
        loading,
        authLoading,
        saving,
        error,
        unauthorizedError,
        clearUnauthorizedError,
        isCloudConnected: isSupabaseConfigured,
        isDemoMode: isDemoModeEnabled,
        isSetupRequired,
        clearError,
        logout,
        kpis,
        getCasoById,
        getCasoByToken,
        addCaso,
        updateCaso,
        changeEstadoOperativo,
        changeEstadoFinanciero,
        addFotoToCaso,
        removeFotoFromCaso,
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
