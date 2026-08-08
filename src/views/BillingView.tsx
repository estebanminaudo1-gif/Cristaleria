import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { BadgeEstado } from '../components/BadgeEstado';
import { Receipt, CheckCircle2, Building } from 'lucide-react';

export const BillingView: React.FC = () => {
  const { casos, updateCaso, changeEstadoFinanciero } = useSiniestros();
  const [selectedInsurance, setSelectedInsurance] = useState<string>('TODAS');
  const [nroFacturaBatch, setNroFacturaBatch] = useState<string>('');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string>('');

  // Filtering cases by insurance
  const casosPendientesFacturacion = casos.filter(
    c => c.estadoFinanciero === 'PENDIENTE_FACTURACION' && (selectedInsurance === 'TODAS' || c.aseguradora === selectedInsurance)
  );

  const casosFacturados = casos.filter(c => c.estadoFinanciero === 'FACTURADO');
  const casosCobrados = casos.filter(c => c.estadoFinanciero === 'COBRADO' || c.estadoFinanciero === 'LIQUIDADO_PRESTADOR');

  // Totals calculations
  const totalCobrado = casosCobrados.reduce((sum, c) => sum + (c.montoDepositado || c.montoCompaniaFinal), 0);
  const totalFacturado = casosFacturados.reduce((sum, c) => sum + c.montoCompaniaFinal, 0);
  const totalRetenciones = casos.reduce((sum, c) => sum + (c.retencionIva || 0) + (c.retencionGanancias || 0) + (c.retencionIibb || 0), 0);
  const totalPagosPrestadores = casos.filter(c => c.pagadoPrestadorFecha).reduce((sum, c) => sum + c.costoPrestador, 0);

  const handleEmiteBatchFactura = () => {
    if (!nroFacturaBatch) return;

    const fechaMail = new Date().toISOString().split('T')[0];
    casosPendientesFacturacion.forEach(caso => {
      updateCaso(caso.id, {
        nroFactura: nroFacturaBatch,
        fechaMailFactura: fechaMail
      });
      changeEstadoFinanciero(caso.id, 'FACTURADO');
    });

    setBatchSuccessMsg(`Factura Nº ${nroFacturaBatch} emitida exitosamente para ${casosPendientesFacturacion.length} casos.`);
    setNroFacturaBatch('');
    setTimeout(() => setBatchSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-400" />
            Módulo de Facturación, Cobros & Retenciones
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión consolidada de facturación por lote a aseguradoras y liquidación a vidrieros.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Facturado</span>
          <div className="text-xl font-bold text-cyan-300 mt-1">${totalFacturado.toLocaleString('es-AR')}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">{casosFacturados.length} facturas en gestión</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Cobrado Efectivo</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">${totalCobrado.toLocaleString('es-AR')}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Acreditado en banco</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Retenciones Acumuladas</span>
          <div className="text-xl font-bold text-amber-400 mt-1">${totalRetenciones.toLocaleString('es-AR')}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">IVA + Ganancias + IIBB</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pagado a Prestadores</span>
          <div className="text-xl font-bold text-purple-400 mt-1">${totalPagosPrestadores.toLocaleString('es-AR')}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Liquidaciones liquidadas</span>
        </div>
      </div>

      {/* Batch Invoicing Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" /> Facturación Consolidada por Lote a Aseguradora
            </h3>
            <p className="text-xs text-slate-400">Agrupa siniestros finalizados e ingresa un número de factura único</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedInsurance}
              onChange={e => setSelectedInsurance(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="TODAS">Aseguradora: Todas</option>
              <option value="IGS">IGS</option>
              <option value="BBVA">BBVA</option>
              <option value="SURA">SURA</option>
              <option value="Particular">Particular</option>
            </select>
          </div>
        </div>

        {batchSuccessMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {batchSuccessMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-300">
            Siniestros listos para facturar: <strong className="text-cyan-400 text-sm">{casosPendientesFacturacion.length}</strong>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ej: Factura Nº 945"
              value={nroFacturaBatch}
              onChange={e => setNroFacturaBatch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleEmiteBatchFactura}
              disabled={casosPendientesFacturacion.length === 0 || !nroFacturaBatch}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all shrink-0"
            >
              Emitir Factura por Lote
            </button>
          </div>
        </div>

        {/* Table Pending Invoicing */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Nº Trabajo</th>
                <th className="py-3 px-3">Aseguradora</th>
                <th className="py-3 px-3">Siniestro</th>
                <th className="py-3 px-3">Asegurado</th>
                <th className="py-3 px-3">Monto Sin IVA</th>
                <th className="py-3 px-3">Monto Con IVA (21%)</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {casosPendientesFacturacion.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                    No hay casos pendientes de facturar para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                casosPendientesFacturacion.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-cyan-400">#{c.nroTrabajo}</td>
                    <td className="py-3 px-3 font-semibold text-white">{c.aseguradora}</td>
                    <td className="py-3 px-3 font-mono">{c.nroSiniestro}</td>
                    <td className="py-3 px-3 text-slate-200">{c.aseguradoNombre}</td>
                    <td className="py-3 px-3 font-medium">${c.montoCompaniaSinIva.toLocaleString('es-AR')}</td>
                    <td className="py-3 px-3 font-bold text-cyan-300">${c.montoCompaniaFinal.toLocaleString('es-AR')}</td>
                    <td className="py-3 px-3">
                      <BadgeEstado tipo="financiero" estado={c.estadoFinanciero} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
