import React, { useState } from 'react';
import { SiniestrosProvider, useSiniestros } from './context/SiniestrosContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { SiniestrosListView } from './views/SiniestrosListView';
import { SiniestroDetailView } from './views/SiniestroDetailView';
import { VidrieroMobileView } from './views/VidrieroMobileView';
import { BillingView } from './views/BillingView';
import { ExcelAuditView } from './views/ExcelAuditView';
import { InternalAssistantView } from './views/InternalAssistantView';
import { LoginView } from './views/LoginView';
import { SetupConfigView } from './views/SetupConfigView';
import { NewSiniestroModal } from './views/NewSiniestroModal';
import { EmailIngestModal } from './views/EmailIngestModal';
import { AlertCircle, X, CloudCheck, HardDrive, ShieldAlert, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    kpis,
    error,
    clearError,
    unauthorizedError,
    clearUnauthorizedError,
    isCloudConnected,
    user,
    profile,
    authLoading,
    isSetupRequired,
    isDemoMode
  } = useSiniestros();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);
  const [selectedVidrieroToken, setSelectedVidrieroToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleOpenCaso = (id: string) => {
    setSelectedCasoId(id);
    setCurrentTab('detail');
  };

  const handleOpenVidrieroPWA = (token: string) => {
    setSelectedVidrieroToken(token);
    setCurrentTab('vidriero');
  };

  // 1. Si Supabase no está configurado y el modo demo no está activo, mostrar pantalla de configuración
  if (isSetupRequired) {
    return <SetupConfigView />;
  }

  // 2. Estado de Carga mientras Supabase restaura la sesión enviada por el Magic Link
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white font-sans text-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-white">Verificando sesión...</h2>
          <p className="text-xs text-slate-400">Procesando enlace mágico y consultando perfil de usuario en Supabase.</p>
        </div>
      </div>
    );
  }

  // 3. Si Supabase está conectado y el usuario no está autenticado o no tiene perfil válido, mostrar LoginView
  if (isCloudConnected && (!user || !profile)) {
    return (
      <LoginView
        unauthorizedMessage={unauthorizedError}
        onClearUnauthorizedMessage={clearUnauthorizedError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onSelectVidrieroToken={handleOpenVidrieroPWA}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-500/20 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 gap-6">
        {/* Sidebar Navigation */}
        {currentTab !== 'vidriero' && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            alertCount={kpis.demoradosMas48h}
          />
        )}

        {/* Dynamic View Display */}
        <main className="flex-1 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectCaso={handleOpenCaso}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onOpenEmailModal={() => setIsEmailModalOpen(true)}
              onOpenVidrieroPWA={handleOpenVidrieroPWA}
            />
          )}

          {currentTab === 'siniestros' && (
            <SiniestrosListView
              onSelectCaso={handleOpenCaso}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {currentTab === 'asistente' && <InternalAssistantView />}

          {currentTab === 'detail' && selectedCasoId && (
            <SiniestroDetailView
              casoId={selectedCasoId}
              onBack={() => setCurrentTab('siniestros')}
              onOpenVidrieroPWA={handleOpenVidrieroPWA}
            />
          )}

          {currentTab === 'billing' && <BillingView />}

          {currentTab === 'vidriero' && (
            <VidrieroMobileView
              token={selectedVidrieroToken || 'tok_demo'}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'audit' && <ExcelAuditView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 glass-panel mt-auto gap-2">
        <div>
          Mercado de Cristales © 2026 • Sistema de Gestión de Siniestros & Operaciones
        </div>

        <div className="flex items-center gap-2">
          {isCloudConnected ? (
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold text-[11px]">
              <CloudCheck className="w-3.5 h-3.5" /> Supabase Cloud Autenticado ({profile?.role || 'Autenticado'})
            </span>
          ) : isDemoMode ? (
            <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold text-[11px]" title="Modo Demo habilitado por VITE_ENABLE_DEMO_MODE=true">
              <HardDrive className="w-3.5 h-3.5" /> Modo Demo (Datos Sanitizados)
            </span>
          ) : (
            <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5" /> Configuración Pendiente
            </span>
          )}
        </div>
      </footer>

      {/* Modals */}
      <NewSiniestroModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <EmailIngestModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSelectCasoCreated={handleOpenCaso}
      />
    </div>
  );
};

export function App() {
  return (
    <SiniestrosProvider>
      <MainAppContent />
    </SiniestrosProvider>
  );
}

export default App;
