import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  X,
  MoreVertical,
  Timer,
  LayoutDashboard,
  DoorOpen,
  Monitor,
  Tv
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======
const MOCK_DOCKS = [
  { id: 1, nome: 'Doca 01', status: 'Livre', operacao: null, placa: null, depositante: null, progresso: 0, etr: null },
  { id: 2, nome: 'Doca 02', status: 'Ocupada', operacao: 'Recebimento', placa: 'ABC-1234', depositante: 'VerticalParts Matriz', progresso: 65, etr: '15 min', atrasada: false },
  { id: 3, nome: 'Doca 03', status: 'Ocupada', operacao: 'Expedição', placa: 'XYZ-9876', depositante: 'VParts Import Export', progresso: 85, etr: '5 min', atrasada: false },
  { id: 4, nome: 'Doca 04', status: 'Livre', operacao: null, placa: null, depositante: null, progresso: 0, etr: null },
  { id: 5, nome: 'Doca 05', status: 'Ocupada', operacao: 'Recebimento', placa: 'KJH-5522', depositante: 'AutoParts Express', progresso: 30, etr: '45 min', atrasada: true },
  { id: 6, nome: 'Doca 06', status: 'Ocupada', operacao: 'Expedição', placa: 'BRA-2E19', depositante: 'Logística Global', progresso: 10, etr: '1h 20m', atrasada: false },
  { id: 7, nome: 'Doca 07', status: 'Livre', operacao: null, placa: null, depositante: null, progresso: 0, etr: null },
  { id: 8, nome: 'Doca 08', status: 'Livre', operacao: null, placa: null, depositante: null, progresso: 0, etr: null },
];

const MOCK_DOCK_DETAILS = {
  2: [
    { sku: 'VP-FR4429', desc: 'Pastilha de Freio', qtd: 200, status: 'Conferido' },
    { sku: 'VP-DF882-M', desc: 'Disco de Freio', qtd: 50, status: 'Em Conferência' },
    { sku: 'VPER-ESS-NY', desc: 'Escova Nylon', qtd: 120, status: 'Pendente' },
  ],
  3: [
    { sku: 'VP-WPR-99', desc: 'Palheta Silicone', qtd: 100, status: 'Carregado' },
    { sku: 'VP-OIL-5W30', desc: 'Óleo Sintético', qtd: 24, status: 'Aguardando' },
  ],
  5: [
    { sku: 'VP-LMP-H7', desc: 'Lâmpada H7 Super White', qtd: 500, status: 'Atrasado' },
  ],
  6: [
    { sku: 'VP-BTT-60A', desc: 'Bateria 60Ah Slim', qtd: 15, status: 'Iniciando' },
  ]
};

const DockCard = ({ dock, onClick }) => {
  const isLivre    = dock.status === 'Livre';
  const isAtrasada = dock.atrasada;

  return (
    <div
      onClick={() => !isLivre && onClick(dock)}
      className={cn(
        "relative overflow-hidden rounded-[32px] border-2 transition-all p-6 group",
        // cursor-pointer apenas quando há ação real (doca ocupada)
        isLivre ? "cursor-default" : "cursor-pointer",
        isLivre
          ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
          : isAtrasada
            // danger → red-500 (token 'danger' não está definido no CSS)
            ? "bg-red-500/5 border-red-500/30 hover:bg-red-500/10 shadow-lg shadow-red-500/10"
            : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">{dock.nome}</h3>
          <p className={cn(
            "text-[9px] font-black uppercase tracking-widest mt-1",
            isLivre ? "text-green-500" : isAtrasada ? "text-red-400" : "text-amber-500"
          )}>
            {isLivre ? '● Disponível para Operação' : isAtrasada ? '⚠️ Alerta de Atraso' : '● Em Atividade'}
          </p>
        </div>
        {!isLivre && (
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            {/* primary → yellow-400 (#FFD700 do design system) */}
            {dock.operacao === 'Recebimento'
              ? <ArrowDownLeft className="text-yellow-400 w-5 h-5" aria-hidden="true" />
              : <ArrowUpRight  className="text-blue-400 w-5 h-5"   aria-hidden="true" />}
          </div>
        )}
      </div>

      {isLivre ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 opacity-40 group-hover:opacity-100 transition-all">
          <DoorOpen className="w-12 h-12 text-green-500/50" aria-hidden="true" />
          <p className="text-xs font-black text-green-500 uppercase tracking-widest">
            DOCA LIVRE<br/><span className="text-[10px]">Aguardando Veículo</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Veículo</p>
              <p className="text-xs font-black text-white">{dock.placa}</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Operação</p>
              {/* primary → yellow-400 */}
              <p className="text-xs font-black text-yellow-400 uppercase">{dock.operacao}</p>
            </div>
          </div>

          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Depositante</p>
            <p className="text-xs font-bold text-slate-300 truncate">{dock.depositante}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Progresso</p>
              <span className="text-[10px] font-black text-white">{dock.progresso}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={cn(
                  "h-full transition-all duration-1000",
                  // danger → red-500 / primary → yellow-400
                  isAtrasada ? "bg-red-500" : "bg-yellow-400"
                )}
                style={{ width: `${dock.progresso}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ETR: <span className="text-slate-200 font-black">{dock.etr}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DockActivities() {
  const [filter,      setFilter]      = useState('Todas');
  const [selectedDock, setSelectedDock] = useState(null);
  const { isTvMode, setIsTvMode }     = useApp();
  const drawerRef = useRef(null);

  // Fechar drawer com Escape
  const closeDrawer = useCallback(() => setSelectedDock(null), []);
  useEffect(() => {
    if (!selectedDock) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    // Mover foco para o drawer ao abrir
    if (drawerRef.current) drawerRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedDock, closeDrawer]);

  const stats = useMemo(() => ({
    total: MOCK_DOCKS.length,
    livres: MOCK_DOCKS.filter(d => d.status === 'Livre').length,
    ocupadas: MOCK_DOCKS.filter(d => d.status === 'Ocupada').length,
    atrasadas: MOCK_DOCKS.filter(d => d.atrasada).length,
  }), []);

  const filteredDocks = useMemo(() => {
    if (filter === 'Livres') return MOCK_DOCKS.filter(d => d.status === 'Livre');
    if (filter === 'Ocupadas') return MOCK_DOCKS.filter(d => d.status === 'Ocupada');
    if (filter === 'Atrasadas') return MOCK_DOCKS.filter(d => d.atrasada);
    return MOCK_DOCKS;
  }, [filter]);

  return (
    <div className={cn(
      "min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 relative overflow-hidden",
      isTvMode && "p-12 scale-110 origin-top"
    )}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" aria-hidden="true" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
           <div className="flex items-center gap-4 mb-2">
               <div className={cn(
                 "p-3 bg-yellow-400/10 rounded-2xl border border-yellow-400/20",
                 isTvMode && "p-6"
               )}>
                  <LayoutDashboard className={cn("text-yellow-400", isTvMode ? "w-14 h-14" : "w-8 h-8")} aria-hidden="true" />
               </div>
              <div>
                 <h1 className={cn(
                   "font-black uppercase tracking-tight text-white leading-none",
                   isTvMode ? "text-6xl" : "text-2xl"
                 )}>Painel de Atividades nas Docas</h1>
                 <p className={cn(
                   "font-black text-slate-500 uppercase tracking-[0.3em] mt-2",
                   isTvMode ? "text-2xl" : "text-[10px]"
                 )}>Monitoramento de Fluxo em Tempo Real — Galpão V1</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            aria-pressed={isTvMode}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
              // danger → red-600 / primary → yellow-400
              // animate-pulse removido: distrai operadores em ambiente industrial
              isTvMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
            )}
          >
            {isTvMode ? <Monitor className="w-4 h-4" aria-hidden="true" /> : <Tv className="w-4 h-4" aria-hidden="true" />}
            {isTvMode ? "Sair do Modo TV" : "Modo TV"}
          </button>

          <div className="flex flex-wrap gap-3">
             <button onClick={() => setFilter('Todas')} className={cn("px-5 py-3 rounded-2xl border-2 transition-all text-xs font-black", filter === 'Todas' ? "bg-slate-900 border-primary text-white" : "bg-slate-900/50 border-slate-800 text-slate-500")}>Total {stats.total}</button>
             <button onClick={() => setFilter('Livres')} className={cn("px-5 py-3 rounded-2xl border-2 transition-all text-xs font-black", filter === 'Livres' ? "bg-green-500/10 border-green-500 text-green-500" : "bg-slate-900/50 border-slate-800 text-slate-500")}>Livres {stats.livres}</button>
             <button onClick={() => setFilter('Ocupadas')} className={cn("px-5 py-3 rounded-2xl border-2 transition-all text-xs font-black", filter === 'Ocupadas' ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-slate-900/50 border-slate-800 text-slate-500")}>Ativas {stats.ocupadas}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {filteredDocks.map(dock => (
          <DockCard key={dock.id} dock={dock} onClick={setSelectedDock} />
        ))}
      </div>

      {/* Drawer de detalhe da doca */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-dock-titulo"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-900 border-l-2 border-slate-800 z-[100] shadow-2xl transition-transform duration-500 transform flex flex-col outline-none",
          selectedDock ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedDock && (
          <>
            <div className="p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl border border-yellow-400/20 flex items-center justify-center">
                     {selectedDock.operacao === 'Recebimento'
                       ? <ArrowDownLeft className="text-yellow-400 w-7 h-7" aria-hidden="true" />
                       : <ArrowUpRight  className="text-blue-400 w-7 h-7"   aria-hidden="true" />}
                  </div>
                  <div>
                     <h2 id="drawer-dock-titulo" className="text-xl font-black uppercase tracking-tight text-white">{selectedDock.nome}</h2>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedDock.placa} · {selectedDock.operacao}</p>
                  </div>
               </div>
               <button
                 onClick={closeDrawer}
                 aria-label="Fechar detalhes da doca"
                 className="p-2 hover:text-red-400 transition-colors"
               >
                 <X className="w-6 h-6" aria-hidden="true" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {MOCK_DOCK_DETAILS[selectedDock.id]?.map((item) => (
                 <div key={item.sku} className="bg-slate-800/30 p-4 rounded-2xl flex justify-between">
                    <div>
                       <p className="text-xs font-black text-white">{item.sku}</p>
                       <p className="text-[9px] text-slate-500">{item.desc}</p>
                    </div>
                    <p className="text-xs font-black text-yellow-400">{item.qtd} pçs</p>
                 </div>
               ))}
            </div>
          </>
        )}
      </div>
      {selectedDock && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
