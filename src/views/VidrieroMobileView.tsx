import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { Phone, MapPin, CheckCircle, Camera, PenTool, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';

interface VidrieroMobileViewProps {
  token: string;
  onBack: () => void;
}

export const VidrieroMobileView: React.FC<VidrieroMobileViewProps> = ({ token, onBack }) => {
  const { getCasoByToken, marcarTrabajoRealizado } = useSiniestros();
  const caso = getCasoByToken(token);

  // Mobile Form States
  const [costoPrestador, setCostoPrestador] = useState<number>(caso?.costoPrestador || 20000);
  const [observaciones, setObservaciones] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>(
    caso?.fotos.find(f => f.tipo === 'FOTO_DESPUES')?.url || ''
  );
  const [firmaDone, setFirmaDone] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(caso?.estadoOperativo === 'TRABAJO_REALIZADO');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!caso) {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl text-center">
        Token no válido o siniestro expirado.
        <button onClick={onBack} className="block mx-auto mt-4 text-cyan-400 font-bold text-xs">
          ← Volver
        </button>
      </div>
    );
  }

  // Handle Photo Simulation
  const handleTakeFoto = () => {
    // Simulated upload of glass installation photo
    const mockPhotos = [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
    ];
    const photo = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setFotoUrl(photo);
    setErrorMsg('');
  };

  // Simple Canvas signature draw simulation
  const handleSign = () => {
    setFirmaDone(true);
    setErrorMsg('');
  };

  const handleSubmitTrabajo = async () => {
    if (!fotoUrl) {
      setErrorMsg('⚠️ Debes tomar al menos 1 foto del trabajo realizado antes de finalizar.');
      return;
    }
    if (costoPrestador <= 0) {
      setErrorMsg('⚠️ Ingresa el monto de tu mano de obra / costo prestador.');
      return;
    }

    const firmaMock = firmaDone ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=80' : undefined;

    const ok = await marcarTrabajoRealizado(
      caso.id,
      costoPrestador,
      fotoUrl,
      firmaMock,
      observaciones
    );

    if (ok) {
      setCompleted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-4 text-slate-100 font-sans">
      {/* Phone Top Notch Bar */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Salir PWA
        </button>
        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
          Token: WhatsApp Directo
        </span>
      </div>

      {/* App Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">🪟 Novedad Trabajo de Campo</span>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            #{caso.nroTrabajo}
          </span>
        </div>
        <h2 className="text-lg font-extrabold mt-1">{caso.aseguradora} Seguros</h2>
        <div className="text-xs text-purple-200">Siniestro: {caso.nroSiniestro}</div>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
        {completed && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-2xl text-emerald-300 text-xs text-center space-y-1">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm">¡Trabajo Marcado como Realizado!</div>
            <p className="text-[11px] text-emerald-200">
              La documentación y fotos fueron enviadas a la oficina central para su facturación.
            </p>
          </div>
        )}

        {/* Cliente & Ubicación */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">👤 Datos del Cliente</span>
            <span className="text-xs font-bold text-slate-100">{caso.aseguradoNombre}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Teléfono:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${caso.aseguradoTel}`}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Phone className="w-3 h-3" /> Llamar
                </a>
                <a
                  href={`https://wa.me/${caso.aseguradoTel}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 bg-emerald-600/30 text-emerald-300 rounded font-semibold flex items-center gap-1 text-[11px]"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Dirección:</span>
              <div className="font-semibold text-slate-100 mt-0.5 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{caso.aseguradoDireccion} ({caso.aseguradoCiudad})</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(caso.aseguradoDireccion + ' ' + caso.aseguradoCiudad)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] text-cyan-400 font-semibold underline mt-1"
              >
                🗺️ Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Detalle de Vidrio */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">🪟 Vidrio a Instalar</span>
          <p className="text-xs font-semibold text-slate-200">{caso.detalleTrabajo}</p>
        </div>

        {/* Carga de Fotos */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">📸 Fotos del Trabajo (Obligatorio)</span>

          {fotoUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700">
              <img src={fotoUrl} alt="Trabajo" className="w-full h-full object-cover" />
              <button
                onClick={handleTakeFoto}
                className="absolute bottom-2 right-2 bg-slate-900/90 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-700 font-semibold"
              >
                Cambiar Foto
              </button>
            </div>
          ) : (
            <button
              onClick={handleTakeFoto}
              className="w-full py-6 border-2 border-dashed border-purple-500/40 hover:border-purple-500/70 bg-purple-500/5 rounded-xl flex flex-col items-center justify-center gap-2 text-purple-300 transition-all"
            >
              <Camera className="w-8 h-8 text-purple-400" />
              <span className="text-xs font-bold">Tomar Foto con Celular</span>
            </button>
          )}
        </div>

        {/* Firma Digital Cliente */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5 text-cyan-400" /> Firma de Conformidad Cliente
            </span>
            {firmaDone && <span className="text-[10px] text-emerald-400 font-bold">✓ Firmado</span>}
          </div>

          {!firmaDone ? (
            <button
              onClick={handleSign}
              className="w-full py-4 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Dibujar Firma del Cliente en Pantalla</span>
            </button>
          ) : (
            <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 text-center text-xs text-emerald-300 font-bold">
              ✓ Firma digital registrada en el celular
            </div>
          )}
        </div>

        {/* Costo Prestador & Observaciones */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <div>
            <label className="text-xs font-bold text-purple-300 block mb-1">💵 Mi Costo / Mano de Obra ($)</label>
            <input
              type="number"
              value={costoPrestador}
              onChange={e => setCostoPrestador(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">💬 Observaciones de Campo</label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Ej. Se colocó silicona y se entregó remito firmado..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Submit */}
        <button
          onClick={handleSubmitTrabajo}
          disabled={completed}
          className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl transition-all ${
            completed
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
          }`}
        >
          {completed ? 'Trabajo ya Realizado' : '✅ Marcar Trabajo Realizado'}
        </button>
      </div>
    </div>
  );
};
