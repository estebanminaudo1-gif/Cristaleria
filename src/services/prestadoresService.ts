import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Prestador {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  email?: string;
  zonaCobertura?: string;
  especialidad?: string;
  cuit?: string;
  aliasCbu?: string;
  activo: boolean;
}

const mockPrestadores: Prestador[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    nombre: 'Lolo',
    telefono: '2235001122',
    whatsapp: '2235001122',
    email: 'lolo@cristales.com',
    zonaCobertura: 'Mar del Plata Centro / Norte',
    especialidad: 'Float & Templados',
    activo: true
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    nombre: 'Cristales Sur',
    telefono: '2234991122',
    whatsapp: '2234991122',
    email: 'contacto@cristalessur.com',
    zonaCobertura: 'Mar del Plata Sur',
    especialidad: 'Ventanales Balcón',
    activo: true
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    nombre: 'Taller Central',
    telefono: '2236887766',
    whatsapp: '2236887766',
    email: 'taller@mercadodecristales.com',
    zonaCobertura: 'Taller General',
    especialidad: 'Espejos Especiales',
    activo: true
  }
];

export const prestadoresService = {
  async getPrestadores(): Promise<Prestador[]> {
    if (!isSupabaseConfigured) {
      return mockPrestadores;
    }

    const { data, error } = await supabase
      .from('prestadores')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error al obtener prestadores:', error);
      return mockPrestadores;
    }

    return (data || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      telefono: p.telefono,
      whatsapp: p.whatsapp,
      email: p.email,
      zonaCobertura: p.zona_cobertura,
      especialidad: p.especialidad,
      cuit: p.cuit,
      aliasCbu: p.alias_cbu,
      activo: p.activo
    }));
  }
};
