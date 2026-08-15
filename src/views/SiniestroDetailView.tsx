import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { BadgeEstado } from '../components/BadgeEstado';
import { documentosService } from '../services/documentosService';
import {
  ArrowLeft,
  MapPin,
  User,
  Shield,
  MessageSquare,
  DollarSign,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  CheckCircle2,
  Trash2,
  FileCheck
} from 'lucide-react';
import type { EstadoOperativo, EstadoFinanciero, ItemTrabajo } from '../types';

interface SiniestroDetailViewProps {
  casoId: string;
  onBack: () => void;
}

export const SiniestroDetailView: React.FC<SiniestroDetailViewProps> = ({
  casoId,
  onBack
}) => {
  const {
    getCasoById,
    changeEstadoOperativo,
    changeEstadoFinanciero,
    updateCaso,
    addFotoToCaso,
    removeFotoFromCaso,
    marcarTrabajoRealizado,
    profile,
    user
  } = useSiniestros();

  const caso = getCasoById(casoId);
  const [activeTab, setActiveTab] = useState<'operacion' | 'medidas' | 'fotos' | 'finanzas' | 'timeline'>('operacion');

  // Edit states for financial calculations
  const [editingFinances, setEditingFinances] = useState(false);
  const [montoSinIvaInput, setMontoSinIvaInput] = useState<number>(caso?.montoCompaniaSinIva || 0);
  const [costoPrestadorInput, setCostoPrestadorInput] = useState<number>(caso?.costoPrestador || 0);
  const [precioVidrioInput, setPrecioVidrioInput] = useState<number>(caso?.precioVidrioMaterial || 0);
  const [nroFacturaInput, setNroFacturaInput] = useState<string>(caso?.nroFactura || '');
  const [retIvaInput, setRetIvaInput] = useState<number>(caso?.retencionIva || 0);
  const [retGciasInput, setRetGciasInput] = useState<number>(caso?.retencionGanancias || 0);
  const [retIibbInput, setRetIibbInput] = useState<number>(caso?.retencionIibb || 0);

  // States for adding glass item directly in office
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [nuevoItemTipo, setNuevoItemTipo] = useState('Vidrio Float 4mm');
  const [nuevoItemAncho, setNuevoItemAncho] = useState<number>(500);
  const [nuevoItemAlto, setNuevoItemAlto] = useState<number>(500);
  const [nuevoItemEspesor, setNuevoItemEspesor] = useState<number>(4);
  const [nuevoItemDetalles, setNuevoItemDetalles] = useState('');
  const [nuevoItemCantidad, setNuevoItemCantidad] = useState<number>(1);

  // States for uploading photo directly in office
  const [uploadTipo, setUploadTipo] = useState<'FOTO_ANTES' | 'FOTO_DESPUES' | 'FIRMA_CONFORMIDAD' | 'REMITO'>('FOTO_ANTES');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // States for marking work done from office
  const [obsTrabajoOficina, setObsTrabajoOficina] = useState('');
  const [isSavingTrabajo, setIsSavingTrabajo] = useState(false);
  const [trabajoCompletadoExito, setTrabajoCompletadoExito] = useState(false);

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

  const handleAddItem = () => {
    const newItem: ItemTrabajo = {
      id: `item-${Date.now()}`,
      tipoArticulo: nuevoItemTipo,
      anchoMm: nuevoItemAncho,
      altoMm: nuevoItemAlto,
      espesorMm: nuevoItemEspesor,
      detallesHerrajes: nuevoItemDetalles,
      cantidad: nuevoItemCantidad
    };

    const updatedItems = [...caso.items, newItem];
    updateCaso(caso.id, { items: updatedItems });
    setShowAddItemForm(false);
    setNuevoItemDetalles('');
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = caso.items.filter(i => i.id !== itemId);
    updateCaso(caso.id, { items: updatedItems });
  };

  const handleUpdateItemField = (itemId: string, field: keyof ItemTrabajo, value: any) => {
    const updatedItems = caso.items.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateCaso(caso.id, { items: updatedItems });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesToUpload = Array.from(fileList);
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploaderName = profile?.nombre || user?.email || 'Operador Oficina';
      for (const file of filesToUpload) {
        const uploadedDoc = await documentosService.uploadDocumento(caso.id, file, uploadTipo, uploaderName);
        await addFotoToCaso(caso.id, {
          tipo: uploadedDoc.tipo,
          url: uploadedDoc.url,
          subidoPor: uploadedDoc.subidoPor,
          fecha: uploadedDoc.fecha
        });
      }
    } catch (err: any) {
      console.error('Error al subir documentos:', err);
      setUploadError(err.message || 'Error al subir una o más imágenes.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleMarcarRealizadoOficina = async () => {
    setIsSavingTrabajo(true);
    try {
      const ok = await marcarTrabajoRealizado(
        caso.id,
        costoPrestadorInput || caso.costoPrestador || 10000,
        caso.fotos[0]?.url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        undefined,
        obsTrabajoOficina ? `[Oficina]: ${obsTrabajoOficina}` : 'Trabajo completado desde Oficina'
      );
      if (ok) {
        setTrabajoCompletadoExito(true);
        setTimeout(() => setTrabajoCompletadoExito(false), 3000);
      }
    } finally {
      setIsSavingTrabajo(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
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
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('operacion')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'operacion' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" /> <span>Operación & Cliente</span>
        </button>

        <button
          onClick={() => setActiveTab('medidas')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'medidas' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" /> <span>Medidas e Ítems ({caso.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fotos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fotos' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> <span>Fotos & Documentos ({caso.fotos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finanzas')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'finanzas' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" /> <span>Desglose Financiero</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
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

          {/* Card Finalización Directa de Trabajo desde Oficina */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <FileCheck className="w-4 h-4 text-cyan-400" /> Registro de Trabajo (Oficina)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block text-[11px]">Costo Prestador / Mano de Obra ($)</label>
                <input
                  type="number"
                  value={costoPrestadorInput}
                  onChange={e => setCostoPrestadorInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-cyan-200 mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[11px]">Observaciones del Trabajo</label>
                <textarea
                  rows={2}
                  value={obsTrabajoOficina}
                  onChange={e => setObsTrabajoOficina(e.target.value)}
                  placeholder="Ej: Vidrio instalado conforme en planta baja por equipo de taller"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {trabajoCompletadoExito && (
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Trabajo marcado como realizado
                </div>
              )}

              <button
                onClick={handleMarcarRealizadoOficina}
                disabled={isSavingTrabajo}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingTrabajo ? 'Guardando...' : 'Marcar Trabajo Realizado'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medidas e Ítems con Carga Directa */}
      {activeTab === 'medidas' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Desglose de Vidrios, Medidas & Herrajes
              </h3>
              <p className="text-xs text-slate-400">Carga directa de medidas en milímetros para producción</p>
            </div>

            <button
              onClick={() => setShowAddItemForm(!showAddItemForm)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddItemForm ? 'Cancelar' : 'Agregar Nuevo Vidrio / Ítem'}</span>
            </button>
          </div>

          {/* Formulario de Carga Directa de Ítem */}
          {showAddItemForm && (
            <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-cyan-300 uppercase">Cargar Nuevo Cristal al Siniestro</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Tipo de Vidrio</label>
                  <select
                    value={nuevoItemTipo}
                    onChange={e => setNuevoItemTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Vidrio Float 4mm Incoloro">Float 4mm Incoloro</option>
                    <option value="Vidrio Float 5mm Incoloro">Float 5mm Incoloro</option>
                    <option value="Vidrio Float 6mm Incoloro">Float 6mm Incoloro</option>
                    <option value="Vidrio Templado 6mm">Templado 6mm</option>
                    <option value="Vidrio Templado 8mm">Templado 8mm</option>
                    <option value="Vidrio Templado 10mm">Templado 10mm</option>
                    <option value="Laminado 3+3 Incoloro">Laminado 3+3 Incoloro</option>
                    <option value="Laminado 4+4 Incoloro">Laminado 4+4 Incoloro</option>
                    <option value="DVH 4/9/4">DVH 4/9/4</option>
                    <option value="Espejo 4mm">Espejo 4mm</option>
                    <option value="Fantasia / Armado">Fantasía / Armado</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Ancho (mm)</label>
                  <input
                    type="number"
                    value={nuevoItemAncho}
                    onChange={e => setNuevoItemAncho(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Alto (mm)</label>
                  <input
                    type="number"
                    value={nuevoItemAlto}
                    onChange={e => setNuevoItemAlto(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Espesor (mm)</label>
                  <input
                    type="number"
                    value={nuevoItemEspesor}
                    onChange={e => setNuevoItemEspesor(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={nuevoItemCantidad}
                    onChange={e => setNuevoItemCantidad(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Detalles de Herrajes / Muescas / Cortes</label>
                <input
                  type="text"
                  value={nuevoItemDetalles}
                  onChange={e => setNuevoItemDetalles(e.target.value)}
                  placeholder="Ej: 2 muescas superiores, herrajes cromados de freno"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Ítem de Vidrio</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caso.items.map((item, idx) => (
              <div key={item.id} className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-slate-900/60 space-y-3 relative group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-cyan-400">Ítem #{idx + 1}</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar Ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tipo de Vidrio */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Tipo de Cristal / Vidrio</label>
                  <input
                    type="text"
                    value={item.tipoArticulo || ''}
                    onChange={e => handleUpdateItemField(item.id, 'tipoArticulo', e.target.value)}
                    placeholder="Ej. Vidrio Float 4mm Incoloro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100 font-semibold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Grid de Medidas Editables */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div>
                    <label className="text-[10px] text-cyan-400 block mb-0.5 font-bold">Ancho (mm)</label>
                    <input
                      type="number"
                      value={item.anchoMm || ''}
                      onChange={e => handleUpdateItemField(item.id, 'anchoMm', parseInt(e.target.value) || 0)}
                      placeholder="Ej. 900"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-bold text-slate-100 text-center focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-cyan-400 block mb-0.5 font-bold">Alto (mm)</label>
                    <input
                      type="number"
                      value={item.altoMm || ''}
                      onChange={e => handleUpdateItemField(item.id, 'altoMm', parseInt(e.target.value) || 0)}
                      placeholder="Ej. 1410"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-bold text-slate-100 text-center focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-cyan-400 block mb-0.5 font-bold">Espesor (mm)</label>
                    <input
                      type="number"
                      value={item.espesorMm || ''}
                      onChange={e => handleUpdateItemField(item.id, 'espesorMm', parseInt(e.target.value) || 0)}
                      placeholder="Ej. 4"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-bold text-slate-100 text-center focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cantidad y Cortes / Herrajes */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad || 1}
                      onChange={e => handleUpdateItemField(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 text-center font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Herrajes / Cortes</label>
                    <input
                      type="text"
                      value={item.detallesHerrajes || ''}
                      onChange={e => handleUpdateItemField(item.id, 'detallesHerrajes', e.target.value)}
                      placeholder="Ej. 2 muescas, herrajes..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-amber-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Detalle Texto Completo Original:</h4>
            <p className="text-xs text-slate-400 font-mono">{caso.detalleTrabajo}</p>
          </div>
        </div>
      )}

      {/* Tab 3: Fotos & Documentos con Carga Directa */}
      {activeTab === 'fotos' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Documentación Fotográfica & Remitos
              </h3>
              <p className="text-xs text-slate-400">Subida directa de imágenes y documentos desde la oficina</p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              {caso.fotos.length} Archivos Registrados
            </span>
          </div>

          {/* Formulario Uploader de Fotos */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-2">
              <Upload className="w-4 h-4" /> Cargar Nueva Imagen / Documento al Caso
            </h4>

            {uploadError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-auto">
                <label className="text-slate-400 block text-[10px] mb-1">Categoría del Archivo</label>
                <select
                  value={uploadTipo}
                  onChange={e => setUploadTipo(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="FOTO_ANTES">Foto Antes (Siniestro / Vidrio Roto)</option>
                  <option value="FOTO_DESPUES">Foto Después (Trabajo Instalado)</option>
                  <option value="FIRMA_CONFORMIDAD">Acta / Firma de Conformidad</option>
                  <option value="REMITO">Remito / Factura Material</option>
                </select>
              </div>

              <div className="w-full sm:flex-1">
                <label className="text-slate-400 block text-[10px] mb-1">Seleccionar una o varias imágenes (JPG, PNG, WEBP, PDF - Hasta 10+ fotos)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-lg p-1"
                />
              </div>
            </div>

            {isUploading && (
              <div className="text-xs text-cyan-400 font-semibold animate-pulse">
                Subiendo imágenes a la nube de Supabase Storage...
              </div>
            )}
          </div>

          {/* Galería de Archivos */}
          {caso.fotos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              Sin fotos cargadas. Suba imágenes (hasta 10+ por caso) usando el selector múltiple superior.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {caso.fotos.map(foto => (
                <div key={foto.id} className="glass-card p-3 rounded-xl border border-slate-800 space-y-2 relative group">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={foto.url} alt={foto.tipo} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-900/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {foto.tipo}
                    </span>
                    <button
                      onClick={() => removeFotoFromCaso(caso.id, foto.id)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Precio Vidrio Material</span>
                {!editingFinances ? (
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    ${caso.precioVidrioMaterial.toLocaleString('es-AR')}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={precioVidrioInput}
                    onChange={e => setPrecioVidrioInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-amber-300 mt-1"
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

            {editingFinances && (
              <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <label className="text-slate-400 block text-[11px]">Nº de Factura Emitida</label>
                <input
                  type="text"
                  value={nroFacturaInput}
                  onChange={e => setNroFacturaInput(e.target.value)}
                  placeholder="Ej. FC-0001-00001120"
                  className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                />
              </div>
            )}

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
