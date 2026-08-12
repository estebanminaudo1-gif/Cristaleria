import React from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { Shield, Plus, Mail, Smartphone, Search, UserCheck, LogOut } from 'lucide-react';
import type { Role } from '../types';

interface HeaderProps {
  onOpenNewModal: () => void;
  onOpenEmailModal: () => void;
  onSelectVidrieroToken: (token: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewModal,
  onOpenEmailModal,
  onSelectVidrieroToken,
  searchQuery,
  setSearchQuery
}) => {
  const { activeRole, setActiveRole, casos, user, logout, isDemoMode } = useSiniestros();

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-800 px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              MERCADO DE CRISTALES
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                v1.0 MVP
              </span>
            </h1>
            <p className="text-xs text-slate-400">Sistema de Gestión de Siniestros & Operaciones</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Siniestro, Cliente, Póliza, Domicilio o Factura..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Email Parsing Simulation */}
          <button
            onClick={onOpenEmailModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all"
            title="Simular ingesta de mail de aseguradora"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Parsear Email</span>
          </button>

          {/* Vidriero PWA Simulator */}
          <button
            onClick={() => {
              const casoLolo = casos.find(c => c.prestadorAsignado === 'Lolo') || casos[0];
              onSelectVidrieroToken(casoLolo?.magicToken || 'tok_demo');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium rounded-lg shadow-md shadow-purple-500/20 transition-all"
            title="Simular acceso de Vidriero desde WhatsApp"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver PWA Vidriero</span>
          </button>

          {/* New Claim */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Caso</span>
          </button>

          {/* Role Switcher - Solamente visible en Modo Demo / Desarrollo */}
          {isDemoMode && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 ml-1" title="Selector de Rol activo solo en Modo Demo">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={activeRole || 'OPERATOR'}
                onChange={e => setActiveRole(e.target.value as Role)}
                className="bg-transparent text-xs text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value="ADMIN" className="bg-slate-900 text-slate-200">Rol Demo: Admin</option>
                <option value="SUPERVISOR" className="bg-slate-900 text-slate-200">Rol Demo: Supervisor</option>
                <option value="OPERATOR" className="bg-slate-900 text-slate-200">Rol Demo: Operador</option>
                <option value="FINANCE" className="bg-slate-900 text-slate-200">Rol Demo: Finanzas</option>
                <option value="PRESTADOR" className="bg-slate-900 text-slate-200">Rol Demo: Vidriero (PWA)</option>
              </select>
            </div>
          )}

          {/* Logout Button */}
          {user && (
            <button
              onClick={logout}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs flex items-center gap-1 transition-all"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
