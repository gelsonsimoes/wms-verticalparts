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
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STATUS_MAP = {
  livre:       'Livre',
  ocupada:     'Ocupada',
  manutencao:  'Manutenção',
  reservada:   'Reservada',
};

function dbRowToDock(row) {
  const statusLabel = STATUS_MAP[row.status] ?? row.status ?? 'Livre';
  const isOcupada   = row.status === 'ocupada';
  const operacao    = row.tipo === 'recebimento' ? 'Recebimento'
                    : row.tipo === 'expedicao'   ? 'Expedição'
                    : row.tipo ?? null;

  return {
    id:          row.id,
    nome:        row.doca,
    status:      statusLabel,
    operacao:    isOcupada ? operacao : null,
    placa:       row.veiculo_placa  ?? null,
    depositante: row.transportadora ?? null,
    motorista:   row.motorista      ?? null,
    progresso:   0,
    etr:         row.fim_previsto
                   ? calcEtr(row.fim_previsto)
                   : null,
    atrasada:    row.fim_previsto
                   ? new Date(row.fim_previsto) < new Date() && isOcupada
                   : false,
    observacao:  row.observacao ?? null,
  };
}

function calcEtr(fim_previsto) {
  const diff = new Date(fim_previsto) - new Date();
  if (diff <= 0) return 'Atrasado';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const SEED_DOCKS = (warehouseId) => {
  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60000).toISOString();
  const in2h = new Date(now.getTime() + 120 * 60000).toISOString();
  return [
    { warehouse_id: warehouseId, doca: 'DOCA 01', tipo: 'recebimento', status: 'ocupada',    veiculo_placa: 'ABC-1234', motorista: 'José Carlos',     transportadora: 'VerticalParts Matriz',    inicio_em: now.toISOString(), fim_previsto: in1h },
    { warehouse_id: warehouseId, doca: 'DOCA 02', tipo: 'expedicao',   status: 'ocupada',    veiculo_placa: 'XYZ-9876', motorista: 'Carlos Silva',     transportadora: 'VParts Import Export',    inicio_em: now.toISOString(), fim_previsto: in2h },
    { warehouse_id: warehouseId, doca: 'DOCA 03', tipo: null,           status: 'livre',      veiculo_placa: null,       motorista: null,               transportadora: null,                      inicio_em: null,              fim_previsto: null },
    { warehouse_id: warehouseId, doca: 'DOCA 04', tipo: 'recebimento', status: 'ocupada',    veiculo_placa: 'KJH-5522', motorista: 'Antônio Gomes',    transportadora: 'AutoParts Express',       inicio_em: now.toISOString(), fim_previsto: in1h },
    { warehouse_id: warehouseId, doca: 'DOCA 05', tipo: 'expedicao',   status: 'ocupada',    veiculo_placa: 'BRA-2E19', motorista: 'Paulo Mendes',     transportadora: 'Logística Global',        inicio_em: now.toISOString(), fim_previsto: in2h },
    { warehouse_id: warehouseId, doca: 'DOCA 06', tipo: null,           status: 'livre',      veiculo_placa: null,       motorista: null,               transportadora: null,                      inicio_em: null,              fim_previsto: null },
    { warehouse_id: warehouseId, doca: 'DOCA 07', tipo: null,           status: 'manutencao', veiculo_placa: null,       motorista: null,               transportadora: null,                      inicio_em: null,              fim_previsto: null },
    { warehouse_id: warehouseId, doca: 'DOCA 08', tipo: null,           status: 'livre',      veiculo_placa: null,       motorista: null,               transportadora: null,                      inicio_em: null,              fim_previsto: null },
  ];
};

const DockCard = ({ dock, onClick }) => {
  const isLivre    = dock.status === 'Livre';
  const isAtrasada = dock.atrasada;

  return (
    <div
      onClick={() => !isLivre && onClick(dock)}
      className={cn(
        "relative overflow-hidden rounded-[32px] border-2 transition-all p-6 group",
        isLivre ? "cursor-default" : "cursor-pointer",
        isLivre
          ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
          : isAtrasada
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
              <p className="text-xs font-black text-white">{dock.placa ?? '—'}</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Operação</p>
              <p className="text-xs font-black text-yellow-400 uppercase">{dock.operacao ?? '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Depositante</p>
            <p className="text-xs font-bold text-slate-300 truncate">{dock.depositante ?? '—'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">ETR</p>
              <span className="text-[10px] font-black text-white">{dock.etr ?? '—'}</span>
            </div>
          </div>

          {dock.etr && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ETR: <span className="text-slate-200 font-black">{dock.etr}</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DockActivities() {
  const [filter,       setFilter]       = useState('Todas');
  const [selectedDock, setSelectedDock] = useState(null);
  const [docks,        setDocks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const { isTvMode, setIsTvMode, warehouseId } = useApp();
  const drawerRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDocks = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('docas_atividades')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('doca');

    if (error) {
      console.error('Erro ao buscar docas:', error);
      showToast('Erro ao carregar docas.', 'error');
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      // Seed demo data
      const seeds = SEED_DOCKS(warehouseId);
      const { data: inserted, error: seedErr } = await supabase
        .from('docas_atividades')
        .insert(seeds)
        .select();
      if (seedErr) {
        console.error('Erro ao inserir seeds:', seedErr);
      } else if (inserted) {
        setDocks(inserted.map(dbRowToDock));
      }
    } else {
      setDocks(data.map(dbRowToDock));
    }
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => {
    fetchDocks();
  }, [fetchDocks]);

  // Realtime subscription
  useEffect(() => {
    if (!warehouseId) return;
    const channel = supabase
      .channel('docas_atividades_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'docas_atividades', filter: `warehouse_id=eq.${warehouseId}` },
        () => fetchDocks()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [warehouseId, fetchDocks]);

  // Fechar drawer com Escape
  const closeDrawer = useCallback(() => setSelectedDock(null), []);
  useEffect(() => {
    if (!selectedDock) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    if (drawerRef.current) drawerRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedDock, closeDrawer]);

  const stats = useMemo(() => ({
    total:    docks.length,
    livres:   docks.filter(d => d.status === 'Livre').length,
    ocupadas: docks.filter(d => d.status === 'Ocupada').length,
    atrasadas: docks.filter(d => d.atrasada).length,
  }), [docks]);

  const filteredDocks = useMemo(() => {
    if (filter === 'Livres')   return docks.filter(d => d.status === 'Livre');
    if (filter === 'Ocupadas') return docks.filter(d => d.status === 'Ocupada');
    if (filter === 'Atrasadas') return docks.filter(d => d.atrasada);
    return docks;
  }, [filter, docks]);

  return (
    <div className={cn(
      "min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 relative overflow-hidden",
      isTvMode && "p-12 scale-110 origin-top"
    )}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" aria-hidden="true" />

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-3",
          toast.type === 'error' ? "bg-red-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700"
        )}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

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

      {loading ? (
        <div className="flex items-center justify-center py-24 relative z-10">
          <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredDocks.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center gap-3 text-slate-500">
              <AlertCircle className="w-10 h-10" />
              <p className="text-sm font-bold uppercase tracking-widest">Nenhuma doca encontrada</p>
            </div>
          ) : (
            filteredDocks.map(dock => (
              <DockCard key={dock.id} dock={dock} onClick={setSelectedDock} />
            ))
          )}
        </div>
      )}

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
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedDock.placa ?? '—'} · {selectedDock.operacao ?? '—'}</p>
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
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div className="bg-slate-800/30 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Motorista</span>
                  <span className="text-xs font-black text-white">{selectedDock.motorista ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transportadora</span>
                  <span className="text-xs font-bold text-slate-300">{selectedDock.depositante ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Placa</span>
                  <span className="text-xs font-black text-white font-mono">{selectedDock.placa ?? '—'}</span>
                </div>
                {selectedDock.etr && (
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ETR</span>
                    <span className="text-xs font-black text-yellow-400">{selectedDock.etr}</span>
                  </div>
                )}
                {selectedDock.observacao && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Observação</p>
                    <p className="text-xs text-slate-300">{selectedDock.observacao}</p>
                  </div>
                )}
              </div>
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
