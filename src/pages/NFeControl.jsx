import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Eye, Download, XOctagon, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

// Mapeamento situacao DB → label legível
const SITUACAO_LABEL = {
  'aguardando_sep':      'Aguardando Sep.',
  'em_separacao':        'Em Separação',
  'aguardando_conf':     'Aguardando Conf.',
  'em_conferencia':      'Em Conferência',
  'aguardando_pesagem':  'Aguard. Pesagem',
  'em_pesagem':          'Em Pesagem',
  'aguardando_expedicao':'Aguard. Expedição',
  'expedida':            'Expedida',
  'cancelada':           'Cancelada',
};

// Mapeamento de situação para classes de badge
const STATUS_BADGE = {
  'expedida':            'bg-green-100 text-green-700',
  'em_separacao':        'bg-blue-100 text-blue-700',
  'aguardando_sep':      'bg-yellow-100 text-yellow-700',
  'aguardando_conf':     'bg-yellow-100 text-yellow-700',
  'em_conferencia':      'bg-blue-100 text-blue-700',
  'aguardando_pesagem':  'bg-orange-100 text-orange-700',
  'em_pesagem':          'bg-orange-100 text-orange-700',
  'aguardando_expedicao':'bg-purple-100 text-purple-700',
  'cancelada':           'bg-slate-200 text-slate-600',
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NFeControl() {
  const { warehouseId } = useApp();

  const [notas,      setNotas]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast,      setToast]      = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!warehouseId) return;

    async function loadNotas() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notas_saida')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false });

      if (error) {
        setToast({ message: 'Erro ao carregar NF-es: ' + error.message, color: 'bg-red-500 text-white' });
      } else {
        setNotas(data ?? []);
      }
      setLoading(false);
    }

    loadNotas();
  }, [warehouseId]);

  // KPIs calculados a partir dos dados reais
  const total      = notas.length;
  const expedidas  = notas.filter(n => n.situacao === 'expedida').length;
  const pendentes  = notas.filter(n =>
    ['aguardando_sep', 'em_separacao', 'aguardando_conf', 'em_conferencia',
     'aguardando_pesagem', 'em_pesagem', 'aguardando_expedicao'].includes(n.situacao)
  ).length;
  const canceladas = notas.filter(n => n.situacao === 'cancelada').length;

  // Filtro funcional
  const filteredNotas = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return notas;
    return notas.filter(n =>
      (n.nf ?? '').toLowerCase().includes(q) ||
      (n.serie ?? '').toLowerCase().includes(q) ||
      (n.cliente ?? '').toLowerCase().includes(q)
    );
  }, [searchTerm, notas]);

  const formatData = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const formatValor = (v) => {
    if (v == null) return '—';
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div role="alert" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${toast.color} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Fechar notificação" className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">5.1 Gerenciar NF-e</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Autorização e Controle SEFAZ</p>
        </div>
      </div>

      {/* KPI Cards — calculados dinamicamente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-full" aria-hidden="true"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
            <h2 className="text-xl font-black text-slate-900">{loading ? '…' : total}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full" aria-hidden="true"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expedidas</p>
            <h2 className="text-xl font-black text-slate-900">{loading ? '…' : expedidas}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full" aria-hidden="true"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <h2 className="text-xl font-black text-slate-900">{loading ? '…' : pendentes}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full" aria-hidden="true"><XOctagon className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canceladas</p>
            <h2 className="text-xl font-black text-slate-900">{loading ? '…' : String(canceladas).padStart(2, '0')}</h2>
          </div>
        </div>
      </div>

      {/* Painel da tabela */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">

        {/* Barra de busca e filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="search-nfe" className="sr-only">Buscar NF-e por número, série ou cliente</label>
            <input
              id="search-nfe"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por Número NF, Série, Cliente..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button
            onClick={() => setToast({ message: 'Filtros avançados — funcionalidade em desenvolvimento.', color: 'bg-amber-500 text-white' })}
            aria-label="Abrir filtros avançados de NF-e"
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            <Filter className="w-4 h-4" aria-hidden="true" /> Filtros
          </button>
        </div>

        {/* Estado de carregamento */}
        {loading && (
          <p className="text-center text-sm text-slate-400 font-medium py-10">Carregando NF-es...</p>
        )}

        {/* Estado vazio */}
        {!loading && notas.length === 0 && (
          <p className="text-center text-sm text-slate-400 font-medium py-10">
            Nenhuma NF-e encontrada para este armazém.
          </p>
        )}

        {/* Feedback quando busca não retorna resultados */}
        {!loading && notas.length > 0 && filteredNotas.length === 0 && (
          <p className="text-center text-sm text-slate-400 font-medium py-10">
            Nenhuma NF-e encontrada para "<strong>{searchTerm}</strong>".
          </p>
        )}

        {/* Tabela */}
        {!loading && filteredNotas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">NF / Série</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor Total</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Situação</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotas.map(nfe => (
                  <tr key={nfe.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-black text-slate-900">
                      {nfe.nf ?? '—'} <span className="text-slate-400 font-bold ml-1">/{nfe.serie ?? '—'}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600 truncate max-w-[180px]">{nfe.cliente ?? '—'}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-900 tabular-nums">{formatValor(nfe.valor)}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">{formatData(nfe.data_referencia ?? nfe.created_at)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[nfe.situacao] ?? 'bg-slate-100 text-slate-500'}`}>
                        {SITUACAO_LABEL[nfe.situacao] ?? nfe.situacao ?? '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label={`Visualizar NF-e ${nfe.nf}`}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Download da NF-e ${nfe.nf}`}
                          className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                        >
                          <Download className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Cancelar NF-e ${nfe.nf}`}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <XOctagon className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
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
