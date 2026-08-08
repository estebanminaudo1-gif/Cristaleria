import React from 'react';
import type { EstadoOperativo, EstadoFinanciero } from '../types';

interface BadgeEstadoProps {
  tipo: 'operativo' | 'financiero';
  estado: EstadoOperativo | EstadoFinanciero;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ tipo, estado }) => {
  if (tipo === 'operativo') {
    const config: Record<EstadoOperativo, { bg: string; label: string }> = {
      NUEVO: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', label: 'NUEVO' },
      PENDIENTE_CONTACTO: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'PEND. CONTACTO' },
      VISITA_COORDINADA: { bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300', label: 'VISITA COORDINADA' },
      PRESUPUESTO_INFORMADO: { bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300', label: 'PRESU. INFORMADO' },
      APROBADO: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'APROBADO' },
      TRABAJO_PROGRAMADO: { bg: 'bg-sky-500/10 border-sky-500/30 text-sky-300', label: 'TRABAJO PROG.' },
      TRABAJO_REALIZADO: { bg: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300', label: 'TRABAJO REALIZADO' },
      DOCUMENTACION_COMPLETA: { bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300', label: 'DOC. COMPLETA' },
      CANCELADO: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', label: 'CANCELADO' }
    };
    const c = config[estado as EstadoOperativo] || { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300', label: estado };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {c.label}
      </span>
    );
  } else {
    const config: Record<EstadoFinanciero, { bg: string; label: string }> = {
      PENDIENTE_FACTURACION: { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400', label: 'PEND. FACTURACIÓN' },
      FACTURADO: { bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', label: 'FACTURADO' },
      COBRADO: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'COBRADO' },
      LIQUIDADO_PRESTADOR: { bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400', label: 'LIQUIDADO' }
    };
    const c = config[estado as EstadoFinanciero] || { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300', label: estado };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
        {c.label}
      </span>
    );
  }
};
