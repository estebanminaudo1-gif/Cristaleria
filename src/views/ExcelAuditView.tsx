import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ExcelAuditView: React.FC = () => {
  const sampleExcelRows = [
    {
      nro: 1120,
      recibido: '02/01',
      cia: 'IGS',
      siniestro: '661259',
      asegurado: 'ELIZONDO, EDUARDO',
      direccion: 'REPUBLICA ARABE SIRIA 2268',
      detalle: '320*240mm 4 m incoloro',
      prestador: 'Lolo',
      costoVidriero: '$20.000,00',
      montoSinIva: '50.000,00',
      montoConIva: '60.500,00',
      nroFc: '942',
      estado1: 'INSTALADO',
      estado2: 'Paga'
    },
    {
      nro: 1121,
      recibido: '02/01',
      cia: 'Particular',
      siniestro: 'CUIT 30521742832',
      asegurado: 'Administración González',
      direccion: 'Santa fe 1635',
      detalle: 'Vidrio armado 1495*735 con corte caño gasista',
      prestador: 'Lolo',
      costoVidriero: '$80.000,00',
      montoSinIva: '160.000,00',
      montoConIva: '193.600,00',
      nroFc: 'B 047',
      estado1: 'INSTALADO',
      estado2: 'Paga'
    },
    {
      nro: 1122,
      recibido: '02/01',
      cia: 'BBVA',
      siniestro: '40629/23',
      asegurado: 'LUCAS GABRIEL HOYOS',
      direccion: 'Av. Constitucion 5062 (Horario 7-14 / 17-22)',
      detalle: 'Espejo 4mm - 900x1410 y 1596x437',
      prestador: 'Lolo',
      costoVidriero: '$80.000,00',
      montoSinIva: '265.416,00',
      montoConIva: '321.153,36',
      nroFc: '943',
      estado1: 'INSTALADO',
      estado2: 'Paga'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Auditoría de la Planilla Excel & Estrategia ETL
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnóstico de inconsistencias de la planilla previa y mapa de migración de datos hacia el nuevo sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normalización de 34 Columnas
          </span>
        </div>
      </div>

      {/* Hallazgos y Diagnóstico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" /> Duplicación de Estados
          </div>
          <p className="text-xs text-slate-300">
            La planilla original poseía 2 columnas separadas llamadas <code className="text-amber-300">ESTADO</code> (una para "INSTALADO" y otra para "Paga").
          </p>
          <div className="text-[11px] text-amber-200/80 font-medium pt-2 border-t border-amber-500/20">
            ✓ Solucionado mediante Estados Ortogonales (Operativo vs Financiero).
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" /> Normalización de Medidas
          </div>
          <p className="text-xs text-slate-300">
            La columna <code className="text-cyan-300">DETALLE</code> contenía textos libres como "templado 8mm: tirador (P 68B) + 2 bisagras (P63)".
          </p>
          <div className="text-[11px] text-cyan-200/80 font-medium pt-2 border-t border-cyan-500/20">
            ✓ Parseado automático en tabla relacional <code className="font-mono">items_trabajo</code>.
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> Control de Retenciones
          </div>
          <p className="text-xs text-slate-300">
            Retenciones de IVA, Ganancias e IIBB calculadas de forma manual en celdas aisladas.
          </p>
          <div className="text-[11px] text-purple-200/80 font-medium pt-2 border-t border-purple-500/20">
            ✓ Cálculo automático inmutable del Monto Neto Depositado y Margen Bruto.
          </div>
        </div>
      </div>

      {/* Muestra Mapeada */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Muestra de Registros Históricos Auditados e Importados al MVP
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Nº Trab</th>
                <th className="py-3 px-3">Recibido</th>
                <th className="py-3 px-3">Compañía</th>
                <th className="py-3 px-3">Nº Siniestro</th>
                <th className="py-3 px-3">Asegurado / Domicilio</th>
                <th className="py-3 px-3">Prestador</th>
                <th className="py-3 px-3">Monto Sin IVA</th>
                <th className="py-3 px-3">Monto Final</th>
                <th className="py-3 px-3">Estado Op.</th>
                <th className="py-3 px-3">Estado Fin.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sampleExcelRows.map(r => (
                <tr key={r.nro} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-cyan-400">#{r.nro}</td>
                  <td className="py-3 px-3 text-slate-400">{r.recibido}</td>
                  <td className="py-3 px-3 font-bold text-white">{r.cia}</td>
                  <td className="py-3 px-3 font-mono">{r.siniestro}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100">{r.asegurado}</div>
                    <div className="text-[10px] text-slate-400">{r.direccion}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-purple-300">{r.prestador}</td>
                  <td className="py-3 px-3 font-medium">${r.montoSinIva}</td>
                  <td className="py-3 px-3 font-bold text-cyan-300">${r.montoConIva}</td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {r.estado1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {r.estado2}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
