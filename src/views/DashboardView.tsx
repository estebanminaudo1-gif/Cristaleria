import React from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { KPICards } from '../components/KPICards';
import { BadgeEstado } from '../components/BadgeEstado';
import { Clock, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle, FileSpreadsheet } from 'lucide-react';

interface DashboardViewProps {
  onSelectCaso: (id: string) => void;
  onOpenEmailModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectCaso,
  onOpenEmailModal
}) => {
  const { casos } = useSiniestros();

  const casosDemorados = casos.filter(
    c => c.estadoOperativo === 'NUEVO' || c.estadoOperativo === 'PENDIENTE_CONTACTO'
  );

  const ultimosEventos = casos.flatMap(c =>
    c.timeline.map(t => ({ ...t, nroTrabajo: c.nroTrabajo, casoId: c.id }))
  ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Panel Operativo y Financiero
            <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Sistema En Línea
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visión unificada de siniestros, coordinación de prestadores, facturación y márgenes brutos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenEmailModal}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Simular Ingesta Email</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alertas SLA y Casos Urgentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Casos Requiriendo Atención Operativa ({casosDemorados.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Reglas SLA de 24h/48h</span>
            </div>

            <div className="space-y-3">
              {casosDemorados.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  ¡Excelente! No hay casos con demoras operativas pendientes.
                </div>
              ) : (
                casosDemorados.map(caso => (
                  <div
                    key={caso.id}
                    className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">Nº {caso.nroTrabajo}</span>
                        <span className="text-xs font-semibold text-slate-200">{caso.aseguradora}</span>
                        <span className="text-[11px] text-slate-400">• Siniestro: {caso.nroSiniestro}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">{caso.aseguradoNombre}</div>
                      <div className="text-[11px] text-slate-400">{caso.aseguradoDireccion} ({caso.aseguradoCiudad})</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <BadgeEstado tipo="operativo" estado={caso.estadoOperativo} />
                      <button
                        onClick={() => onSelectCaso(caso.id)}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium rounded-lg flex items-center gap-1 transition-all"
                      >
                        <span>Gestionar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estado de Siniestros Recientes */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Últimos Siniestros Registrados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Nº Trab</th>
                    <th className="py-3 px-3">Aseguradora</th>
                    <th className="py-3 px-3">Asegurado</th>
                    <th className="py-3 px-3">Prestador</th>
                    <th className="py-3 px-3">Estado Operativo</th>
                    <th className="py-3 px-3">Monto Final</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {casos.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-cyan-400">#{c.nroTrabajo}</td>
                      <td className="py-3 px-3 font-medium text-white">{c.aseguradora}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{c.aseguradoNombre}</div>
                        <div className="text-[10px] text-slate-400">{c.aseguradoTel}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-purple-300">{c.prestadorAsignado || 'Sin Asignar'}</td>
                      <td className="py-3 px-3">
                        <BadgeEstado tipo="operativo" estado={c.estadoOperativo} />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        ${c.montoCompaniaFinal.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectCaso(c.id)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Ver 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline de Actividad */}
        <div className="space-y-6">
          {/* Live Activity Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Historial de Eventos
              </h3>
              <span className="text-[10px] text-slate-400">Auditoría en tiempo real</span>
            </div>

            <div className="relative pl-4 border-l border-slate-800 space-y-4">
              {ultimosEventos.map((ev, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900"></div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(ev.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} • Caso #{ev.nroTrabajo}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">{ev.evento}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ev.descripcion}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{ev.usuario} ({ev.rol})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
