import React, { useState, useMemo } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { BadgeEstado } from '../components/BadgeEstado';
import { Filter, Search, LayoutGrid, List, MessageSquare, Eye, Plus, ArrowUpDown } from 'lucide-react';
import type { EstadoOperativo } from '../types';

interface SiniestrosListViewProps {
  onSelectCaso: (id: string) => void;
  onOpenNewModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SiniestrosListView: React.FC<SiniestrosListViewProps> = ({
  onSelectCaso,
  onOpenNewModal,
  searchQuery,
  setSearchQuery
}) => {
  const { casos } = useSiniestros();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedAseguradora, setSelectedAseguradora] = useState<string>('TODAS');
  const [selectedPrestador, setSelectedPrestador] = useState<string>('TODOS');
  const [selectedEstadoOp, setSelectedEstadoOp] = useState<string>('TODOS');
  const [selectedEstadoFin, setSelectedEstadoFin] = useState<string>('TODOS');

  // Filtered cases
  const casosFiltrados = useMemo(() => {
    return casos.filter(c => {
      const matchSearch =
        !searchQuery ||
        c.nroTrabajo.toString().includes(searchQuery) ||
        c.nroSiniestro.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.aseguradoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.aseguradoDireccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.nroFactura && c.nroFactura.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.poliza && c.poliza.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchAseguradora = selectedAseguradora === 'TODAS' || c.aseguradora === selectedAseguradora;
      const matchPrestador = selectedPrestador === 'TODOS' || c.prestadorAsignado === selectedPrestador;
      const matchEstadoOp = selectedEstadoOp === 'TODOS' || c.estadoOperativo === selectedEstadoOp;
      const matchEstadoFin = selectedEstadoFin === 'TODOS' || c.estadoFinanciero === selectedEstadoFin;

      return matchSearch && matchAseguradora && matchPrestador && matchEstadoOp && matchEstadoFin;
    });
  }, [casos, searchQuery, selectedAseguradora, selectedPrestador, selectedEstadoOp, selectedEstadoFin]);

  const aseguradorasUnicas = Array.from(new Set(casos.map(c => c.aseguradora)));
  const prestadoresUnicos = Array.from(new Set(casos.map(c => c.prestadorAsignado).filter(Boolean))) as string[];

  const kanbanColumns: { id: EstadoOperativo; label: string }[] = [
    { id: 'NUEVO', label: 'Nuevo' },
    { id: 'DEMORADO', label: 'Demorado (+48h)' },
    { id: 'VISITA_COORDINADA', label: 'Visita Coordinada' },
    { id: 'PRESUPUESTO_INFORMADO', label: 'Presupuesto Informado' },
    { id: 'TRABAJO_REALIZADO', label: 'Trabajo Realizado' },
    { id: 'DOCUMENTACION_COMPLETA', label: 'Doc. Completa' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Bandeja de Siniestros</h2>
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {casosFiltrados.length} registros
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Caso</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar siniestro..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Aseguradora */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedAseguradora}
            onChange={e => setSelectedAseguradora(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="TODAS" className="bg-slate-900">Aseguradora: Todas</option>
            {aseguradorasUnicas.map(a => (
              <option key={a} value={a} className="bg-slate-900">{a}</option>
            ))}
          </select>
        </div>

        {/* Filter Prestador */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedPrestador}
            onChange={e => setSelectedPrestador(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="TODOS" className="bg-slate-900">Prestador: Todos</option>
            {prestadoresUnicos.map(p => (
              <option key={p} value={p} className="bg-slate-900">{p}</option>
            ))}
          </select>
        </div>

        {/* Filter Estado Operativo */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <select
            value={selectedEstadoOp}
            onChange={e => setSelectedEstadoOp(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="TODOS" className="bg-slate-900">Estado Operativo: Todos</option>
            <option value="NUEVO" className="bg-slate-900">NUEVO</option>
            <option value="DEMORADO" className="bg-slate-900">DEMORADO (+48H)</option>
            <option value="VISITA_COORDINADA" className="bg-slate-900">VISITA COORDINADA</option>
            <option value="PRESUPUESTO_INFORMADO" className="bg-slate-900">PRESUPUESTO INFORMADO</option>
            <option value="TRABAJO_REALIZADO" className="bg-slate-900">TRABAJO REALIZADO</option>
            <option value="DOCUMENTACION_COMPLETA" className="bg-slate-900">DOC. COMPLETA</option>
          </select>
        </div>

        {/* Filter Estado Financiero */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <select
            value={selectedEstadoFin}
            onChange={e => setSelectedEstadoFin(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="TODOS" className="bg-slate-900">Estado Financiero: Todos</option>
            <option value="PENDIENTE_FACTURACION" className="bg-slate-900">PEND. FACTURACIÓN</option>
            <option value="FACTURADO" className="bg-slate-900">FACTURADO</option>
            <option value="COBRADO" className="bg-slate-900">COBRADO</option>
            <option value="LIQUIDADO_PRESTADOR" className="bg-slate-900">LIQUIDADO</option>
          </select>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'table' ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 flex items-center gap-1 cursor-pointer">
                    Nº Trab <ArrowUpDown className="w-3 h-3" />
                  </th>
                  <th className="py-3.5 px-4">Ingreso</th>
                  <th className="py-3.5 px-4">Aseguradora</th>
                  <th className="py-3.5 px-4">Nº Siniestro</th>
                  <th className="py-3.5 px-4">Asegurado / Domicilio</th>
                  <th className="py-3.5 px-4">Prestador</th>
                  <th className="py-3.5 px-4">Est. Operativo</th>
                  <th className="py-3.5 px-4">Est. Financiero</th>
                  <th className="py-3.5 px-4 text-right">Monto Co. Final</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {casosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                      No se encontraron siniestros que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  casosFiltrados.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cyan-400">#{c.nroTrabajo}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(c.fechaIngreso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{c.aseguradora}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{c.nroSiniestro}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{c.aseguradoNombre}</div>
                        <div className="text-[10px] text-slate-400 max-w-xs truncate">{c.aseguradoDireccion}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-purple-300">
                        {c.prestadorAsignado || 'Sin Asignar'}
                      </td>
                      <td className="py-3.5 px-4">
                        <BadgeEstado tipo="operativo" estado={c.estadoOperativo} />
                      </td>
                      <td className="py-3.5 px-4">
                        <BadgeEstado tipo="financiero" estado={c.estadoFinanciero} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                        ${c.montoCompaniaFinal.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectCaso(c.id)}
                            className="p-1.5 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors"
                            title="Ver Detalle 360°"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${c.aseguradoTel}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const casosEnColumna = casosFiltrados.filter(
              c =>
                c.estadoOperativo === col.id ||
                (col.id === 'NUEVO' && c.estadoOperativo === 'PENDIENTE_CONTACTO')
            );
            return (
              <div key={col.id} className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-col min-w-[260px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.label}</h3>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {casosEnColumna.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {casosEnColumna.map(caso => (
                    <div
                      key={caso.id}
                      onClick={() => onSelectCaso(caso.id)}
                      className="glass-card p-3 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">#{caso.nroTrabajo}</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {caso.aseguradora}
                        </span>
                      </div>

                      <div className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {caso.aseguradoNombre}
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        📍 {caso.aseguradoDireccion}
                      </div>

                      <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-purple-300 font-medium">👤 {caso.prestadorAsignado || 'Sin Asignar'}</span>
                        <span className="font-bold text-slate-200">${caso.montoCompaniaFinal.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
