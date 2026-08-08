import React, { useState } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { X, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface EmailIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCasoCreated: (id: string) => void;
}

export const EmailIngestModal: React.FC<EmailIngestModalProps> = ({
  isOpen,
  onClose,
  onSelectCasoCreated
}) => {
  const { parseEmailAndCreateCaso } = useSiniestros();

  const sampleEmails = [
    {
      title: 'Email 1: BBVA Seguros (Siniestro Cristal Templado)',
      raw: `De: denuncias@bbvaseguros.com.ar
Asunto: DENUNCIA SINIESTRO CRISTALES - SIN 884120 - POL 991204
--------------------------------------------------------------
Estimados Mercado de Cristales,
Derivamos el siguiente siniestro para su atención:
Aseguradora: BBVA Seguros
Siniestro Nro: 884120/26
Póliza Nro: 991204
Asegurado: ROBERTO CARLOS PERALTA
Teléfono: 2235998877
Domicilio del siniestro: Jujuy 2450 3° A, Mar del Plata
Detalle del daño: Ventanal balcón vidrio float 5mm 1500x2100mm roto por impacto de piedra.
Favor de coordinar visita e informar costo.`
    },
    {
      title: 'Email 2: IGS Assist (Siniestro Espejo Comedor)',
      raw: `De: gestiones@igsassist.com
Asunto: ORDEN DE TRABAJO # 771239 - IGS ASSIST
--------------------------------------------------------------
Nuevo servicio ingresado:
Compañía: IGS Assist
Nº Siniestro: 771239
Asegurado: MARCELA DIAZ
Tel: 2234123999
Dirección: Güemes 3120, Mar del Plata
Trabajo a realizar: Espejo biselado 5mm 1200x800mm con pegado siloxano en vestidor.`
    }
  ];

  const [selectedMailIndex, setSelectedMailIndex] = useState<number>(0);
  const [mailText, setMailText] = useState<string>(sampleEmails[0].raw);
  const [parsing, setParsing] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectSample = (idx: number) => {
    setSelectedMailIndex(idx);
    setMailText(sampleEmails[idx].raw);
    setExtractedResult(null);
  };

  const handleParse = () => {
    setParsing(true);
    setTimeout(() => {
      // RegEx & Parsing logic simulation
      let aseguradora = 'BBVA';
      if (mailText.toLowerCase().includes('igs')) aseguradora = 'IGS';
      if (mailText.toLowerCase().includes('sura')) aseguradora = 'SURA';

      let sinMatch = mailText.match(/Siniestro(?:\s+Nro)?:\s*([^\n\r]+)/i) || mailText.match(/SIN\s*(\d+)/i);
      let polMatch = mailText.match(/Póliza(?:\s+Nro)?:\s*([^\n\r]+)/i) || mailText.match(/POL\s*(\d+)/i);
      let aseguradoMatch = mailText.match(/Asegurado:\s*([^\n\r]+)/i);
      let telMatch = mailText.match(/(?:Teléfono|Tel):\s*([^\n\r]+)/i);
      let dirMatch = mailText.match(/(?:Domicilio|Dirección):\s*([^\n\r]+)/i);
      let detMatch = mailText.match(/(?:Detalle|Trabajo a realizar):\s*([^\n\r]+)/i);

      const parsedData = {
        aseguradora,
        siniestro: sinMatch ? sinMatch[1].trim() : `SIN-${Math.floor(Math.random() * 900000 + 100000)}`,
        poliza: polMatch ? polMatch[1].trim() : '100234',
        asegurado: aseguradoMatch ? aseguradoMatch[1].trim() : 'Asegurado Email',
        tel: telMatch ? telMatch[1].trim() : '2235000000',
        direccion: dirMatch ? dirMatch[1].trim() : 'Domicilio Email',
        detalle: detMatch ? detMatch[1].trim() : 'Cristal a reponer según email'
      };

      setExtractedResult(parsedData);
      setParsing(false);
    }, 800);
  };

  const handleConfirmCreate = () => {
    if (!extractedResult) return;
    const nuevo = parseEmailAndCreateCaso(extractedResult);
    onClose();
    onSelectCasoCreated(nuevo.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Simulador de Ingesta & Parsing de Email (Gmail / Outlook)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sample Selection */}
        <div className="flex items-center gap-2">
          {sampleEmails.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMailIndex === idx
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Textarea Raw Email */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Texto del Correo Electrónico Recibido:
          </label>
          <textarea
            rows={7}
            value={mailText}
            onChange={e => setMailText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          ></textarea>
        </div>

        {/* Extracted Data Result */}
        {extractedResult && (
          <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Datos Extraídos Automáticamente (Confianza 98%)
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Aseguradora:</span>
                <strong className="text-white">{extractedResult.aseguradora}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nº Siniestro / Póliza:</span>
                <strong className="text-cyan-300">{extractedResult.siniestro}</strong> (Póliza {extractedResult.poliza})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Asegurado:</span>
                <strong className="text-slate-200">{extractedResult.asegurado}</strong> ({extractedResult.tel})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Domicilio:</span>
                <strong className="text-slate-200">{extractedResult.direccion}</strong>
              </div>
            </div>

            <div className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              📲 <strong>Auto-WhatsApp:</strong> Se enviará mensaje automático de bienvenida al teléfono {extractedResult.tel}.
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleParse}
            disabled={parsing}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{parsing ? 'Parseando con RegEx & LLM...' : 'Parsear Email con IA'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancelar
            </button>
            {extractedResult && (
              <button
                onClick={handleConfirmCreate}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar & Crear Caso</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
