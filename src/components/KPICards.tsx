import React from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { AlertCircle, Clock, DollarSign, Wallet, TrendingUp } from 'lucide-react';

export const KPICards: React.FC = () => {
  const { kpis } = useSiniestros();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Abiertos */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Abiertos</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold text-white">{kpis.casosAbiertos}</div>
        <div className="text-[11px] text-slate-400 mt-1">Siniestros activos</div>
        <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-cyan-500/10 rounded-full blur-lg"></div>
      </div>

      {/* Pendientes Coordinación */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pend. Contacto</span>
          <AlertCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-400">{kpis.pendientesCoordinacion}</div>
        <div className="text-[11px] text-slate-400 mt-1">Sin fecha agendada</div>
      </div>

      {/* Demorados */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Demorados</span>
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold text-rose-400">{kpis.demoradosMas48h}</div>
        <div className="text-[11px] text-slate-400 mt-1">SLA +24h sin contacto</div>
      </div>

      {/* Por Cobrar Aseguradoras */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Por Cobrar</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-emerald-400">
          ${kpis.porCobrarCompania.toLocaleString('es-AR')}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Facturas aseguradoras</div>
      </div>

      {/* Por Pagar Vidrieros */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Por Pagar</span>
          <Wallet className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl font-bold text-purple-400">
          ${kpis.porPagarPrestadores.toLocaleString('es-AR')}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Honorarios prestadores</div>
      </div>

      {/* Margen Bruto Total */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Margen Bruto</span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-cyan-300">
          ${kpis.margenBrutoTotal.toLocaleString('es-AR')}
        </div>
        <div className="text-[11px] text-cyan-400/80 mt-1">Rentabilidad ~{kpis.rentabilidadPromedioPct}%</div>
      </div>
    </div>
  );
};
