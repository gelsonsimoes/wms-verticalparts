import React from 'react';
import { Bell, Search, Menu, LogOut, Settings, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header({ toggleSidebar }) {
  const { currentUser } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[var(--vp-border)] px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left Section: Menu Toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-[var(--vp-text-label)] hover:bg-[var(--vp-bg-alt)] rounded-sm transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden rounded-lg bg-black p-1 shadow-sm">
            <img 
              src="/img/logo amarelosvg.svg" 
              alt="VP" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/Favicon.svg'; }}
            />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-[var(--vp-text-data)]">
            VerticalParts WMS
          </span>
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--vp-text-label)]" />
          <input
            type="text"
            placeholder="Buscar pedido, produto, carga..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm bg-[var(--vp-bg-main)] focus:border-[var(--vp-primary)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Section: Status, Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-sm border border-green-200">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sistema Online</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-[var(--vp-text-label)] hover:bg-[var(--vp-bg-alt)] rounded-sm transition-colors relative group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--vp-border)]" />

        {/* User Menu */}
        <div className="flex items-center gap-3 group relative">
          <div className="hidden sm:text-right">
            <p className="text-xs font-black text-[var(--vp-text-data)] uppercase">{currentUser?.nome || 'Convidado'}</p>
            <p className="text-[10px] font-bold text-[var(--vp-text-label)] uppercase tracking-widest leading-none mt-0.5">{currentUser?.role === 'gestor' ? 'Supervisor' : currentUser?.role || 'Usuário'}</p>
          </div>
          <div className="w-8 h-8 bg-[var(--vp-primary)] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#F2C94C] transition-colors shadow-sm">
            <span className="text-xs font-black text-black">
              {currentUser?.nome?.substring(0, 2).toUpperCase() || 'VP'}
            </span>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white border border-[var(--vp-border)] rounded-sm shadow-xl overflow-hidden min-w-[180px]">
            <button className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-[var(--vp-text-data)] hover:bg-[var(--vp-bg-alt)] flex items-center gap-2 transition-colors">
              <User size={14} /> Perfil
            </button>
            <button className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-[var(--vp-text-data)] hover:bg-[var(--vp-bg-alt)] flex items-center gap-2 transition-colors">
              <Settings size={14} /> Configurações
            </button>
            <div className="h-px bg-[var(--vp-border)]" />
            <button className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
