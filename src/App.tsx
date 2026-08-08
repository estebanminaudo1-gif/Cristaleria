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
import { NewSiniestroModal } from './views/NewSiniestroModal';
import { EmailIngestModal } from './views/EmailIngestModal';

const MainAppContent: React.FC = () => {
  const { kpis } = useSiniestros();
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
              token={selectedVidrieroToken || 'tok_lolo_1120'}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'audit' && <ExcelAuditView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 glass-panel mt-auto">
        Mercado de Cristales © 2026 • Sistema de Gestión de Siniestros & Operaciones de Campo (v1.0 MVP)
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
