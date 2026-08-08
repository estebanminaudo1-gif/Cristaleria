import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { BadgeEstado } from '../components/BadgeEstado';
import { ArrowLeft, MapPin, Calendar, User, Shield, MessageSquare, DollarSign, Image, Clock, Smartphone, AlertCircle } from 'lucide-react';
import type { EstadoOperativo, EstadoFinanciero } from '../types';

interface SiniestroDetailViewProps {
  casoId: string;
  onBack: () => void;
  onOpenVidrieroPWA: (token: string) => void;
}

export const SiniestroDetailView: React.FC<SiniestroDetailViewProps> = ({
  casoId,
  onBack,
  onOpenVidrieroPWA
}) => {
  const { getCasoById, changeEstadoOperativo, changeEstadoFinanciero, updateCaso } = useSiniestros();
  const caso = getCasoById(casoId);
  const [activeTab, setActiveTab] = useState<'operacion' | 'medidas' | 'fotos' | 'finanzas' | 'timeline'>('operacion');

  // Edit states for financial calculations
  const [editingFinances, setEditingFinances] = useState(false);
  const [montoSinIvaInput, setMontoSinIvaInput] = useState<number>(caso?.montoCompaniaSinIva || 0);
  const [costoPrestadorInput, setCostoPrestadorInput] = useState<number>(caso?.costoPrestador || 0);
  const [precioVidrioInput] = useState<number>(caso?.precioVidrioMaterial || 0);
  const [nroFacturaInput] = useState<string>(caso?.nroFactura || '');
  const [retIvaInput, setRetIvaInput] = useState<number>(caso?.retencionIva || 0);
  const [retGciasInput, setRetGciasInput] = useState<number>(caso?.retencionGanancias || 0);
  const [retIibbInput, setRetIibbInput] = useState<number>(caso?.retencionIibb || 0);

  if (!caso) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center text-slate-400">
        Siniestro no encontrado.
        <button onClick={onBack} className="block mx-auto mt-4 text-cyan-400 font-semibold text-xs">
          ← Volver a la lista
        </button>
      </div>
    );
  }

  // Calculate live margin
  const margenBrutoCalculado = (caso.montoCompaniaSinIva || 0) - (caso.costoPrestador || 0) - (caso.precioVidrioMaterial || 0);
  const rentabilidadPct = caso.montoCompaniaSinIva > 0 ? (margenBrutoCalculado / caso.montoCompaniaSinIva) * 100 : 0;
  const retencionesTotales = (caso.retencionIva || 0) + (caso.retencionGanancias || 0) + (caso.retencionIibb || 0);
  const montoNetoDepositado = (caso.montoCompaniaFinal || 0) - retencionesTotales;

  const handleSaveFinances = () => {
    updateCaso(caso.id, {
      montoCompaniaSinIva: montoSinIvaInput,
      costoPrestador: costoPrestadorInput,
      precioVidrioMaterial: precioVidrioInput,
      nroFactura: nroFacturaInput,
      retencionIva: retIvaInput,
      retencionGanancias: retGciasInput,
      retencionIibb: retIibbInput
    });
    setEditingFinances(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Siniestro Nº {caso.nroTrabajo}</h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                Ref: {caso.nroSiniestro}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compañía: <strong className="text-slate-200">{caso.aseguradora}</strong> | Póliza: {caso.poliza || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <BadgeEstado tipo="operativo" estado={caso.estadoOperativo} />
          <BadgeEstado tipo="financiero" estado={caso.estadoFinanciero} />

          <button
            onClick={() => onOpenVidrieroPWA(caso.magicToken)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg shadow-md shadow-purple-600/20 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver PWA Vidriero</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('operacion')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'operacion' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" /> <span>Operación & Cliente</span>
        </button>

        <button
          onClick={() => setActiveTab('medidas')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'medidas' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> <span>Medidas e Ítems ({caso.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fotos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'fotos' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Image className="w-4 h-4" /> <span>Fotos & Documentos ({caso.fotos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finanzas')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'finanzas' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" /> <span>Desglose Financiero</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'timeline' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> <span>Historial Timeline ({caso.timeline.length})</span>
        </button>
      </div>

      {/* Tab 1: Operación */}
      {activeTab === 'operacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Asegurado */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-cyan-400" /> Información del Asegurado
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block text-[11px]">Nombre y Apellido</label>
                <div className="font-bold text-slate-100 text-sm">{caso.aseguradoNombre}</div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px]">Teléfono / WhatsApp</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-slate-200 font-semibold">{caso.aseguradoTel}</span>
                  <a
                    href={`https://wa.me/${caso.aseguradoTel}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded border border-emerald-500/30 flex items-center gap-1 text-[11px] px-2"
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp Directo
                  </a>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px]">Domicilio del Siniestro</label>
                <div className="flex items-start gap-1.5 font-medium text-slate-200 mt-1">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{caso.aseguradoDireccion} ({caso.aseguradoCiudad})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Prestador & Gestión Operativa */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-4 h-4 text-purple-400" /> Prestador & Estado
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block text-[11px]">Prestador Asignado</label>
                <div className="font-bold text-purple-300 text-sm mt-0.5">
                  👤 {caso.prestadorAsignado || 'Sin Asignar'}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px]">Cambiar Estado Operativo</label>
                <select
                  value={caso.estadoOperativo}
                  onChange={e => changeEstadoOperativo(caso.id, e.target.value as EstadoOperativo)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="NUEVO">NUEVO</option>
                  <option value="PENDIENTE_CONTACTO">PENDIENTE_CONTACTO</option>
                  <option value="VISITA_COORDINADA">VISITA_COORDINADA</option>
                  <option value="PRESUPUESTO_INFORMADO">PRESUPUESTO_INFORMADO</option>
                  <option value="APROBADO">APROBADO</option>
                  <option value="TRABAJO_PROGRAMADO">TRABAJO_PROGRAMADO</option>
                  <option value="TRABAJO_REALIZADO">TRABAJO_REALIZADO</option>
                  <option value="DOCUMENTACION_COMPLETA">DOCUMENTACION_COMPLETA</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px]">Cambiar Estado Financiero</label>
                <select
                  value={caso.estadoFinanciero}
                  onChange={e => changeEstadoFinanciero(caso.id, e.target.value as EstadoFinanciero)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="PENDIENTE_FACTURACION">PENDIENTE_FACTURACION</option>
                  <option value="FACTURADO">FACTURADO</option>
                  <option value="COBRADO">COBRADO</option>
                  <option value="LIQUIDADO_PRESTADOR">LIQUIDADO_PRESTADOR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card Observaciones Operativas */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Observaciones de Operación
            </h3>

            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {caso.infoExtraOperativa || 'Sin observaciones adicionales cargadas.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Medidas e Ítems */}
      {activeTab === 'medidas' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Desglose Estructurado de Vidrios & Herrajes
              </h3>
              <p className="text-xs text-slate-400">Normalización de medidas en milímetros para taller</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              {caso.items.length} Artículos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caso.items.map((item, idx) => (
              <div key={item.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Ítem #{idx + 1}</span>
                  <span className="text-xs font-semibold text-slate-200">{item.tipoArticulo}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-900 p-2 rounded-lg border border-slate-800 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ancho</span>
                    <span className="text-xs font-bold text-slate-100">{item.anchoMm ? `${item.anchoMm} mm` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Alto</span>
                    <span className="text-xs font-bold text-slate-100">{item.altoMm ? `${item.altoMm} mm` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Espesor</span>
                    <span className="text-xs font-bold text-slate-100">{item.espesorMm ? `${item.espesorMm} mm` : 'N/A'}</span>
                  </div>
                </div>

                {item.detallesHerrajes && (
                  <div className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    🔧 <strong>Cortes / Herrajes:</strong> {item.detallesHerrajes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Detalle Texto Completo Original:</h4>
            <p className="text-xs text-slate-400 font-mono">{caso.detalleTrabajo}</p>
          </div>
        </div>
      )}

      {/* Tab 3: Fotos & Documentos */}
      {activeTab === 'fotos' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Documentación Fotográfica de Campo
            </h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              {caso.fotos.length} Fotos Registradas
            </span>
          </div>

          {caso.fotos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              Sin fotos cargadas. Utilice la PWA del vidriero o suba imágenes del trabajo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {caso.fotos.map(foto => (
                <div key={foto.id} className="glass-card p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={foto.url} alt={foto.tipo} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-900/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {foto.tipo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Subido por: <strong>{foto.subidoPor}</strong></span>
                    <span>{new Date(foto.fecha).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Desglose Financiero */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Panel Financiero & Rentabilidad (Caso #{caso.nroTrabajo})
                </h3>
                <p className="text-xs text-slate-400">Cálculos inmutables de Margen Bruto, IVA y Retenciones</p>
              </div>

              {!editingFinances ? (
                <button
                  onClick={() => setEditingFinances(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Editar Valores Financieros
                </button>
              ) : (
                <button
                  onClick={handleSaveFinances}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Guardar Cambios
                </button>
              )}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Compañía Sin IVA</span>
                {!editingFinances ? (
                  <div className="text-xl font-bold text-white mt-1">
                    ${caso.montoCompaniaSinIva.toLocaleString('es-AR')}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={montoSinIvaInput}
                    onChange={e => setMontoSinIvaInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white mt-1"
                  />
                )}
              </div>

              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Monto Final con IVA (21%)</span>
                <div className="text-xl font-bold text-cyan-300 mt-1">
                  ${caso.montoCompaniaFinal.toLocaleString('es-AR')}
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Costo Prestador</span>
                {!editingFinances ? (
                  <div className="text-xl font-bold text-purple-400 mt-1">
                    ${caso.costoPrestador.toLocaleString('es-AR')}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={costoPrestadorInput}
                    onChange={e => setCostoPrestadorInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-purple-300 mt-1"
                  />
                )}
              </div>

              <div className="glass-card p-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-cyan-950/40">
                <span className="text-[11px] text-cyan-400 block font-semibold uppercase">Margen Bruto Real</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  ${margenBrutoCalculado.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] text-emerald-300/80 mt-1 font-semibold">
                  Rentabilidad: {Math.round(rentabilidadPct * 10) / 10}%
                </div>
              </div>
            </div>

            {/* Retenciones Impositivas */}
            <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                Retenciones Impositivas Aplicadas por la Aseguradora
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block text-[11px]">Retención IVA</label>
                  {!editingFinances ? (
                    <div className="font-bold text-slate-200 mt-1">${caso.retencionIva.toLocaleString('es-AR')}</div>
                  ) : (
                    <input
                      type="number"
                      value={retIvaInput}
                      onChange={e => setRetIvaInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 mt-1"
                    />
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px]">Retención Ganancias</label>
                  {!editingFinances ? (
                    <div className="font-bold text-slate-200 mt-1">${caso.retencionGanancias.toLocaleString('es-AR')}</div>
                  ) : (
                    <input
                      type="number"
                      value={retGciasInput}
                      onChange={e => setRetGciasInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 mt-1"
                    />
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px]">Retención IIBB</label>
                  {!editingFinances ? (
                    <div className="font-bold text-slate-200 mt-1">${caso.retencionIibb.toLocaleString('es-AR')}</div>
                  ) : (
                    <input
                      type="number"
                      value={retIibbInput}
                      onChange={e => setRetIibbInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 mt-1"
                    />
                  )}
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <label className="text-cyan-400 block text-[11px] font-bold">Monto Neto Depositado</label>
                  <div className="font-bold text-cyan-300 text-sm mt-1">${montoNetoDepositado.toLocaleString('es-AR')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Timeline */}
      {activeTab === 'timeline' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Línea de Tiempo Auditada (Timeline Inmutable)
          </h3>

          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
            {caso.timeline.map(ev => (
              <div key={ev.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-slate-950"></div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-cyan-400">{ev.evento}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(ev.fecha).toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="text-xs text-slate-200 mt-1 font-medium">{ev.descripcion}</div>
                <div className="text-[11px] text-purple-400/80 mt-0.5">Ejecutado por: {ev.usuario} ({ev.rol})</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
