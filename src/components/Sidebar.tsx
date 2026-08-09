import React from 'react';
import { LayoutDashboard, FileText, Receipt, Smartphone, Bell, History, Bot } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, alertCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard 360°', icon: LayoutDashboard },
    { id: 'siniestros', label: 'Bandeja de Siniestros', icon: FileText },
    { id: 'asistente', label: 'Asistente IA n8n', icon: Bot },
    { id: 'billing', label: 'Facturación & Retenciones', icon: Receipt },
    { id: 'vidriero', label: 'Simulador Vidriero PWA', icon: Smartphone },
    { id: 'audit', label: 'Auditoría & Planilla Excel', icon: History }
  ];

  return (
    <aside className="w-full md:w-64 glass-panel border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
          Navegación Principal
        </div>

        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'siniestros' && alertCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SLA Alert Widget */}
      <div className="p-3 glass-card rounded-xl border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
          <Bell className="w-3.5 h-3.5" />
          <span>Motor de SLA Activo</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Reglas de escalamiento automático por WhatsApp & Email habilitadas para casos +24h sin atención.
        </p>
      </div>
    </aside>
  );
};
