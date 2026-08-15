import React, { useState, useEffect } from 'react';
import { useSiniestros } from '../context/SiniestrosContext';
import { Shield, Plus, Mail, Search, UserCheck, LogOut } from 'lucide-react';
import type { Role } from '../types';

interface HeaderProps {
  onOpenNewModal: () => void;
  onOpenEmailModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExecuteSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewModal,
  onOpenEmailModal,
  searchQuery,
  setSearchQuery,
  onExecuteSearch
}) => {
  const { activeRole, setActiveRole, user, logout, isDemoMode } = useSiniestros();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(localQuery);
    if (onExecuteSearch) {
      onExecuteSearch(localQuery);
    }
  };

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

        {/* Global Search Form */}
        <div className="flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-0.5 rounded focus:outline-none"
              title="Buscar (Presioná Enter o hacé clic aquí)"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Buscar por Siniestro, Cliente, Póliza, Domicilio o Factura..."
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </form>
        </div>

        {/* Action Controls */}
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
