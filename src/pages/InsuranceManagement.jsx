import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Link2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Search,
  ChevronRight,
  X,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Toast Component ───────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300" role="status">
      <div className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl text-white",
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error'   ? 'bg-red-600' :
        'bg-blue-600'
      )}>
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />}
        <p className="text-sm font-bold">{toast.message}</p>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Static policies (no dedicated DB table) ───────────────────
const STATIC_POLICIES = [
  { id: 1, numero: 'AP-2026-98821', seguradora: 'Porto Seguro S.A.', inicio: '01/01/2026', termino: '01/01/2027', cobertura: 5000000, status: 'Vigente' },
  { id: 2, numero: 'AP-2025-44102', seguradora: 'Allianz Global',    inicio: '15/05/2025', termino: '15/05/2026', cobertura: 2500000, status: 'Vigente' },
  { id: 3, numero: 'AP-2024-11200', seguradora: 'Mapfre Seguros',    inicio: '10/02/2024', termino: '10/02/2025', cobertura: 1200000, status: 'Vencida' },
];

const STATIC_DEPOSITANTS = [
  { id: 1, nome: 'VerticalParts Matriz', cnpj: '12.345.678/0001-99', valorEstoque: 1500000, coberto: true  },
  { id: 2, nome: 'VParts Import Export', cnpj: '98.765.432/0001-11', valorEstoque: 2200000, coberto: true  },
  { id: 3, nome: 'AutoParts Express',    cnpj: '45.123.789/0001-22', valorEstoque:  800000, coberto: false },
];

export default function InsuranceManagement() {
  const { warehouseId } = useApp();
  const [selectedId, setSelectedId]       = useState(STATIC_POLICIES[0].id);
  const [showBondModal, setShowBondModal] = useState(false);
  const [filterQuery, setFilterQuery]    = useState('');
  const [realStockValue, setRealStockValue] = useState(null);
  const [loadingStock, setLoadingStock]  = useState(true);

  // Toast
  const [toast, setToast]  = useState(null);
  const toastRef = useRef(null);
  const showToast = (message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  // Coberturas toggle state
  const [coberturas, setCoberturas] = useState(() =>
    Object.fromEntries(STATIC_DEPOSITANTS.map(d => [d.id, d.coberto]))
  );
  const toggleCobertura = (id) => setCoberturas(prev => ({ ...prev, [id]: !prev[id] }));

  // ─── Load real stock value from notas_saida ───────────────────
  useEffect(() => {
    if (!warehouseId) return;
    setLoadingStock(true);
    supabase
      .from('notas_saida')
      .select('valor')
      .eq('warehouse_id', warehouseId)
      .neq('situacao', 'Canceladas')
      .then(({ data, error }) => {
        if (error) { showToast('Erro ao calcular estoque vinculado: ' + error.message, 'error'); setLoadingStock(false); return; }
        const total = (data || []).reduce((sum, row) => {
          const v = parseFloat((row.valor || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          return sum + v;
        }, 0);
        setRealStockValue(total > 0 ? total : null);
        setLoadingStock(false);
      });
  }, [warehouseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPolicies = useMemo(() =>
    STATIC_POLICIES.filter(p =>
      filterQuery === '' || p.numero.toLowerCase().includes(filterQuery.toLowerCase())
    ), [filterQuery]
  );

  const selectedPolicy = useMemo(() =>
    STATIC_POLICIES.find(p => p.id === selectedId) || STATIC_POLICIES[0],
    [selectedId]
  );

  // Use real stock if available, otherwise fallback to sum of depositants
  const estoqueVinculado = useMemo(() => {
    if (realStockValue !== null) return realStockValue;
    return STATIC_DEPOSITANTS
      .filter(d => coberturas[d.id])
      .reduce((s, d) => s + d.valorEstoque, 0);
  }, [realStockValue, coberturas]);

  const analysisData = useMemo(() => {
    const isOver  = estoqueVinculado > selectedPolicy.cobertura;
    const balance = selectedPolicy.cobertura - estoqueVinculado;
    return {
      isOver,
      balance:   Math.abs(balance),
      progress:  Math.min((estoqueVinculado / selectedPolicy.cobertura) * 100, 100),
      chartData: [
        { name: 'Cobertura',    valor: selectedPolicy.cobertura },
        { name: 'Estoque Real', valor: estoqueVinculado },
      ],
    };
  }, [selectedPolicy, estoqueVinculado]);

  const handleConfirmBond = () => {
    setShowBondModal(false);
    showToast('Vínculos de cobertura salvos!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">2.20 Gestão de Seguros</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Compliance de Cobertura de Estoque de Terceiros</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => showToast('Funcionalidade "Cadastrar Apólice" em desenvolvimento.')}
            aria-label="Cadastrar nova apólice"
            className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Cadastrar Apólice
          </button>
          <button
            onClick={() => showToast('Funcionalidade "Renovar Seguro" em desenvolvimento.')}
            aria-label="Renovar seguro"
            className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Renovar Seguro
          </button>
          <button
            onClick={() => setShowBondModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Link2 className="w-4 h-4" aria-hidden="true" /> Vincular Contratos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* POLICIES LIST */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Histórico de Apólices Ativas</h3>
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Buscar Nº..."
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  aria-label="Buscar apólice por número"
                  className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-lg py-1.5 pr-8 pl-3 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" aria-hidden="true" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-850/50">
                    <th scope="col" className="p-4 text-left   text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Apólice / Seguradora</th>
                    <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Vigência</th>
                    <th scope="col" className="p-4 text-right  text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Cobertura</th>
                    <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPolicies.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        'cursor-pointer transition-all group',
                        selectedId === p.id ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      )}
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{p.numero}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{p.seguradora}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          <span>{p.inicio}</span>
                          <ChevronRight className="w-3 h-3 opacity-30" aria-hidden="true" />
                          <span>{p.termino}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {p.cobertura.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          'px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest',
                          p.status === 'Vigente' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ANALYSIS PANEL */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm space-y-8 sticky top-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Análise de Cobertura Real</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPolicy.numero}</span>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 flex justify-between items-center group overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Segurado (Apólice)</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedPolicy.cobertura.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-slate-200 dark:text-slate-800 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 flex justify-between items-center group overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                    Valor do Estoque Vinculado
                    {loadingStock && <span className="ml-2 text-[8px] text-slate-400">(carregando...)</span>}
                    {!loadingStock && realStockValue !== null && <span className="ml-2 text-[8px] text-green-500">● ao vivo</span>}
                  </p>
                  <p className="text-xl font-black text-primary">
                    {estoqueVinculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <Building2 className="w-12 h-12 text-primary/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>

              <div className={cn(
                'p-6 rounded-[24px] border flex justify-between items-center group overflow-hidden relative transition-all',
                analysisData.isOver
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-green-500/5 border-green-500/20'
              )}>
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                    {analysisData.isOver ? 'Déficit de Cobertura' : 'Saldo de Segurança'}
                  </p>
                  <p className={cn('text-xl font-black', analysisData.isOver ? 'text-red-500' : 'text-green-500')}>
                    {analysisData.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                {analysisData.isOver ? (
                  <AlertTriangle className="w-12 h-12 text-red-500/20 absolute -right-4 -bottom-4 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-12 h-12 text-green-500/20 absolute -right-4 -bottom-4 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* PROGRESS */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilização do Limite</p>
                <span className={cn('text-xs font-black', analysisData.isOver ? 'text-red-500' : 'text-slate-900 dark:text-white')}>
                  {analysisData.progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    analysisData.isOver
                      ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]'
                  )}
                  style={{ width: `${analysisData.progress}%` }}
                />
              </div>
            </div>

            {/* CHART */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#33415510' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                    {analysisData.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#64748b' : entry.valor > analysisData.chartData[0].valor ? '#ef4444' : '#eab308'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* BOND MODAL */}
      {showBondModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bond-modal-title"
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-3 bg-primary" aria-hidden="true" />

            <div className="p-8 md:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center border-4 border-slate-800 shadow-xl">
                    <Link2 className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="bond-modal-title" className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
                      Vincular Contratos / Depositantes
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Definir Escopo de Cobertura da Apólice</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBondModal(false)}
                  aria-label="Fechar modal de vínculos"
                  className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 hover:scale-110 transition-all"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto px-2">
                {STATIC_DEPOSITANTS.map(d => {
                  const isCoberto = coberturas[d.id];
                  return (
                    <div
                      key={d.id}
                      className="bg-slate-50 dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                          isCoberto ? 'bg-green-500/10 text-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        )}>
                          <Building2 className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{d.nome}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{d.cnpj}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none text-center">Valor em Estoque</p>
                          <p className="text-xs font-black dark:text-slate-300">
                            {d.valorEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <button
                          role="switch"
                          aria-checked={isCoberto}
                          aria-label={`Cobertura de seguro — ${d.nome}`}
                          onClick={() => toggleCobertura(d.id)}
                          className={cn(
                            'flex items-center h-6 w-11 rounded-full p-1 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            isCoberto ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                          )}
                        >
                          <div className={cn(
                            'h-4 w-4 rounded-full bg-secondary transition-transform duration-300',
                            isCoberto ? 'translate-x-5' : 'translate-x-0'
                          )} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBondModal(false)}
                  className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmBond}
                  className="flex-[2] py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Confirmar Vínculos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
