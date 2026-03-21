import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Truck, CheckSquare, DoorOpen, AlertCircle, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs) { return twMerge(clsx(inputs)); }

function getTurno(entrada_em) {
  if (!entrada_em) return 'Noite';
  const h = new Date(entrada_em).getHours();
  if (h >= 6  && h < 14) return 'Manhã';
  if (h >= 14 && h < 22) return 'Tarde';
  return 'Noite';
}

function fmtHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function dbRowToMov(row) {
  return {
    id:     row.id,
    placa:  row.placa       ?? '—',
    trans:  row.transportadora ?? '—',
    mot:    row.motorista   ?? '—',
    tipo:   row.tipo        === 'entrada' ? 'Entrada' : row.tipo === 'saida' ? 'Saída' : (row.tipo ?? '—'),
    doca:   row.doca_destino ?? 'Aguardando',
    hora:   fmtHora(row.entrada_em),
    status: row.status      ?? '—',
    entrada_em: row.entrada_em,
  };
}

const SEED_PORTARIA = (warehouseId) => {
  const now = new Date().toISOString();
  return [
    { warehouse_id: warehouseId, tipo: 'entrada', placa: 'GHK-9U88', motorista: 'José Carlos', transportadora: 'Expresso ABC',       documento: 'NF-10234', doca_destino: 'DOCA 01', status: 'No Pátio',   entrada_em: now },
    { warehouse_id: warehouseId, tipo: 'saida',   placa: 'RTY-1B23', motorista: 'Carlos Silva', transportadora: 'Logística Total',    documento: 'NF-10235', doca_destino: 'DOCA 02', status: 'Carregando', entrada_em: now },
    { warehouse_id: warehouseId, tipo: 'entrada', placa: 'JHG-4T56', motorista: 'Antônio',      transportadora: 'VerticalParts Frota',documento: null,       doca_destino: null,       status: 'Triagem',    entrada_em: now },
  ];
};

export default function GateManager() {
  const [movements,  setMovements]  = useState([]);
  const [dockStatus, setDockStatus] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [turno,      setTurno]      = useState('Todos os Turnos');
  const [toast,      setToast]      = useState(null);
  const { warehouseId } = useApp();

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('portaria')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('entrada_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar portaria:', error);
      showToast('Erro ao carregar registros de portaria.', 'error');
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      const seeds = SEED_PORTARIA(warehouseId);
      const { data: inserted, error: seedErr } = await supabase
        .from('portaria')
        .insert(seeds)
        .select();
      if (seedErr) {
        console.error('Erro ao inserir seeds portaria:', seedErr);
      } else if (inserted) {
        setMovements(inserted.map(dbRowToMov));
        buildDockStatus(inserted.map(dbRowToMov));
      }
    } else {
      const movs = data.map(dbRowToMov);
      setMovements(movs);
      buildDockStatus(movs);
    }
    setLoading(false);
  }, [warehouseId]);

  function buildDockStatus(movs) {
    // Derive dock status cards from movement data
    const docaMap = {};
    movs.forEach(m => {
      if (!m.doca || m.doca === 'Aguardando') return;
      if (!docaMap[m.doca]) {
        docaMap[m.doca] = { name: m.doca, status: 'Ocupada', vehicle: m.placa, time: '—' };
      }
    });
    // Add some free docks so there's always a few shown
    const occupied = Object.values(docaMap);
    const allDocas = ['DOCA 01','DOCA 02','DOCA 03','DOCA 04'];
    const cards = allDocas.map((name, i) => {
      const found = occupied.find(d => d.name === name);
      return found ?? { id: i + 1, name, status: 'Livre', vehicle: '-', time: '-' };
    });
    setDockStatus(cards);
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!warehouseId) return;
    const channel = supabase
      .channel('portaria_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portaria', filter: `warehouse_id=eq.${warehouseId}` },
        () => fetchData()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [warehouseId, fetchData]);

  const filteredMovements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movements.filter(mov => {
      const matchSearch = !q ||
        mov.placa.toLowerCase().includes(q) ||
        mov.mot.toLowerCase().includes(q)   ||
        mov.trans.toLowerCase().includes(q);
      const matchTurno = turno === 'Todos os Turnos' || getTurno(mov.entrada_em) === turno;
      return matchSearch && matchTurno;
    });
  }, [search, turno, movements]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de Portaria</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de Entradas e Saídas (Pátio e Docas)</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black rounded-[2rem] border border-red-200 text-sm hover:scale-105 transition-transform active:scale-95 shadow-sm"
          >
            <DoorOpen className="w-4 h-4" aria-hidden="true" /> Liberar Saída
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20"
          >
            <Truck className="w-4 h-4" aria-hidden="true" /> Registrar Entrada
          </button>
        </div>
      </div>

      {/* Cards de Status das Docas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dockStatus.map((doca, i) => (
          <div
            key={doca.name ?? i}
            className={cn(
              'rounded-[2rem] p-5 shadow-sm border',
              doca.status === 'Ocupada' ? 'bg-white border-red-200' : 'bg-white border-green-200'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{doca.name}</h3>
              <div
                className={cn('w-3 h-3 rounded-full animate-pulse', doca.status === 'Ocupada' ? 'bg-red-500' : 'bg-green-500')}
                aria-label={doca.status === 'Ocupada' ? 'Doca ocupada' : 'Doca livre'}
              />
            </div>
            {doca.status === 'Ocupada' ? (
              <div>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono tracking-wider">{doca.vehicle}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" /> Tempo Operação: {doca.time}
                </p>
              </div>
            ) : (
              <div className="py-2.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Livre para operação</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Painel de Movimentos */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar Placa, Motorista, Transp..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={turno}
            onChange={e => setTurno(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-none rounded-[2rem] text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Todos os Turnos</option>
            <option>Manhã</option>
            <option>Tarde</option>
            <option>Noite</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" aria-hidden="true" /> Filtros
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Nenhum movimento para "{search || turno}"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Placa Veículo</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Transportadora</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Motorista</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo Mov.</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Doca/Destino</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Hora</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status Interno</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map(mov => (
                  <tr key={mov.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-black text-slate-900">
                      <span className="bg-white border-2 border-slate-900 rounded-sm px-2 py-0.5 tracking-widest shadow-sm font-mono">
                        {mov.placa}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">{mov.trans}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600 flex items-center gap-2">
                      <CheckSquare className="w-3 h-3 text-green-500" aria-hidden="true" /> {mov.mot}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'font-black text-[11px] uppercase tracking-widest px-2 py-1 rounded-[1rem]',
                        mov.tipo === 'Entrada' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                      )}>
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-black text-slate-800">{mov.doca}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500 font-mono">{mov.hora}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full',
                        mov.status === 'No Pátio'   && 'bg-yellow-100 text-yellow-700',
                        mov.status === 'Carregando' && 'bg-blue-100 text-blue-700',
                        mov.status === 'Triagem'    && 'bg-orange-100 text-orange-700',
                        mov.status === 'Liberado'   && 'bg-green-100 text-green-700',
                      )}>
                        {mov.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
