import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { X, Plus } from 'lucide-react';

interface NewSiniestroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewSiniestroModal: React.FC<NewSiniestroModalProps> = ({ isOpen, onClose }) => {
  const { addCaso } = useSiniestros();

  const [aseguradora, setAseguradora] = useState('BBVA');
  const [nroSiniestro, setNroSiniestro] = useState('');
  const [poliza, setPoliza] = useState('');
  const [aseguradoNombre, setAseguradoNombre] = useState('');
  const [aseguradoTel, setAseguradoTel] = useState('');
  const [aseguradoDireccion, setAseguradoDireccion] = useState('');
  const [aseguradoCiudad, setAseguradoCiudad] = useState('Mar del Plata');
  const [prestadorAsignado, setPrestadorAsignado] = useState('Lolo');
  const [detalleTrabajo, setDetalleTrabajo] = useState('');
  const [montoCompaniaSinIva, setMontoCompaniaSinIva] = useState<number>(0);
  const [costoPrestador, setCostoPrestador] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCaso({
      aseguradora,
      nroSiniestro: nroSiniestro || `SIN-${Date.now().toString().slice(-4)}`,
      poliza: poliza || '-',
      aseguradoNombre: aseguradoNombre || 'Nuevo Asegurado',
      aseguradoTel: aseguradoTel || '2230000000',
      aseguradoDireccion: aseguradoDireccion || 'Dirección de ejemplo',
      aseguradoCiudad,
      prestadorAsignado,
      detalleTrabajo: detalleTrabajo || 'Colocación de vidrio float 4mm',
      montoCompaniaSinIva,
      costoPrestador
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Crear Nuevo Siniestro</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Aseguradora</label>
              <select
                value={aseguradora}
                onChange={e => setAseguradora(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="BBVA">BBVA Seguros</option>
                <option value="IGS">IGS Assist</option>
                <option value="SURA">SURA</option>
                <option value="Particular">Particular</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nº de Siniestro</label>
              <input
                type="text"
                required
                placeholder="Ej. 40629/23"
                value={nroSiniestro}
                onChange={e => setNroSiniestro(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Póliza</label>
              <input
                type="text"
                placeholder="Ej. 481482"
                value={poliza}
                onChange={e => setPoliza(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre Completo Asegurado</label>
              <input
                type="text"
                required
                placeholder="Ej. Lucas Hoyos"
                value={aseguradoNombre}
                onChange={e => setAseguradoNombre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                required
                placeholder="Ej. 2235267022"
                value={aseguradoTel}
                onChange={e => setAseguradoTel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Domicilio del Siniestro</label>
              <input
                type="text"
                required
                placeholder="Ej. Av. Constitución 5062"
                value={aseguradoDireccion}
                onChange={e => setAseguradoDireccion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Ciudad</label>
              <input
                type="text"
                value={aseguradoCiudad}
                onChange={e => setAseguradoCiudad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Vidriero Asignado</label>
              <select
                value={prestadorAsignado}
                onChange={e => setPrestadorAsignado(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Lolo">Lolo</option>
                <option value="Cristales Sur">Cristales Sur</option>
                <option value="Taller Central">Taller Central</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Monto Co. Sin IVA ($)</label>
              <input
                type="number"
                placeholder="Ej. 50000"
                value={montoCompaniaSinIva || ''}
                onChange={e => setMontoCompaniaSinIva(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Costo Prestador ($)</label>
              <input
                type="number"
                placeholder="Ej. 20000"
                value={costoPrestador || ''}
                onChange={e => setCostoPrestador(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Detalle del Vidrio / Trabajo</label>
            <textarea
              rows={2}
              required
              placeholder="Ej. Espejo 4mm 900x1410mm..."
              value={detalleTrabajo}
              onChange={e => setDetalleTrabajo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-600/20"
            >
              Guardar Siniestro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
