import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { movimentoEstoqueService } from '../services/movimentoEstoqueService';
import { produtosService } from '../services/produtosService';
import {
  BookOpen,
  Package,
  MapPin,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Calendar,
  Layers,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── TIPO CONFIG ─────────────────────────────────────────────────────
const TIPO_CFG = {
  'Entrada':       { color: 'text-green-700  bg-green-100  dark:bg-green-900/30  dark:text-green-400',  icon: ArrowUpCircle,   dot: 'bg-green-500' },
  'Saída':         { color: 'text-red-700    bg-red-100    dark:bg-red-900/30    dark:text-red-400',    icon: ArrowDownCircle, dot: 'bg-red-500'   },
  'Ajuste':        { color: 'text-amber-700  bg-amber-100  dark:bg-amber-900/30  dark:text-amber-400',  icon: RefreshCw,       dot: 'bg-amber-400' },
  'Transferência': { color: 'text-blue-700   bg-blue-100   dark:bg-blue-900/30   dark:text-blue-400',   icon: Layers,          dot: 'bg-blue-500'  },
};
function TipoBadge({ tipo }) {
  const cfg = TIPO_CFG[tipo] || {};
  const Icon = cfg.icon || Minus;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <Icon className="w-3 h-3" aria-hidden="true" />{tipo}
    </span>
  );
}

// ─── Exportação CSV/Excel ─────────────────────────────────────────
function exportCSV(data, filename, headers, rowMapper) {
  const rows = [headers.join(';'), ...data.map(r => rowMapper(r).join(';'))];
  const csv  = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Painel Detalhes ──────────────────────────────────────────────
function PainelDetalhes({ item, onClose }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-secondary/40 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-secondary" aria-hidden="true" />
          <div>
            <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Detalhes da Movimentação</p>
            <p className="text-xs font-black text-white uppercase">{item.sku ?? item.endereco_id ?? '—'}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Fechar painel de detalhes" className="text-white/40 hover:text-white transition-colors">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Tipo',       v: null },
            { l: 'SKU',        v: item.sku ?? '—' },
            { l: 'Endereço',   v: item.endereco_id ?? '—' },
            { l: 'Data',       v: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '—' },
          ].map((f, i) => f && (
            <div key={i} className={cn('p-3 bg-slate-50 dark:bg-slate-800 rounded-xl', i === 0 && 'col-span-2')}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
              {f.v === null ? <div className="mt-1"><TipoBadge tipo={item.tipo_movimento} /></div> : <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{f.v}</p>}
            </div>
          ))}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Fluxo de Quantidade</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase">Saldo Anterior</p>
              <p className="text-base font-black text-slate-700 dark:text-slate-300">{item.saldo_anterior ?? 0}</p>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[9px] font-black text-green-500">+{item.qtd_entrada ?? 0}</span>
              <span className="text-[9px] font-black text-red-500">-{item.qtd_saida ?? 0}</span>
            </div>
            <div className="flex-1 text-center p-2 bg-secondary/10 rounded-lg border-2 border-secondary/30">
              <p className="text-[8px] font-black text-secondary uppercase">Saldo Final</p>
              <p className="text-base font-black text-slate-800 dark:text-white">{item.saldo_final ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Produto</p>
          <p className="text-[10px] font-black text-secondary">{item.sku ?? '—'}</p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.descricao ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── ABA 1: KARDEX POR PRODUTO ────────────────────────────────────
function KardexProduto({ movimentos, loading }) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [search,      setSearch]      = useState('');
  const [situacao,    setSituacao]    = useState('Todos');
  const [dataIni,     setDataIni]     = useState(thirtyAgo);
  const [dataFim,     setDataFim]     = useState(today);
  const [showDate,    setShowDate]    = useState(false);
  const [groupBy,     setGroupBy]     = useState(null);
  const [collapsed,   setCollapsed]   = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (!showDate) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDate(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDate]);

  const filtered = useMemo(() => movimentos.filter(m => {
    const semMov = (m.qtd_entrada ?? 0) === 0 && (m.qtd_saida ?? 0) === 0;
    if (situacao === 'Com Movimentação' && semMov) return false;
    if (situacao === 'Sem Movimentação' && !semMov) return false;
    if (search) {
      const q = search.toLowerCase();
      const sku = (m.sku ?? '').toLowerCase();
      const desc = (m.descricao ?? '').toLowerCase();
      if (!sku.includes(q) && !desc.includes(q)) return false;
    }
    if (m.created_at) {
      const iso = m.created_at.slice(0, 10);
      if (dataIni && iso < dataIni) return false;
      if (dataFim && iso > dataFim) return false;
    }
    return true;
  }), [movimentos, search, situacao, dataIni, dataFim]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return filtered.reduce((acc, m) => {
      const key = groupBy === 'cod'
        ? `${m.sku ?? '—'} — ${m.descricao ?? '—'}`
        : (m.created_at ? m.created_at.slice(0, 10) : '—');
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const kpiEntradas = filtered.reduce((s, m) => s + (m.qtd_entrada ?? 0), 0);
  const kpiSaidas   = filtered.reduce((s, m) => s + (m.qtd_saida ?? 0), 0);
  const kpiSkus     = new Set(filtered.map(m => m.sku).filter(Boolean)).size;

  const handleExport = () => {
    exportCSV(
      filtered,
      `kardex_produto_${new Date().toISOString().slice(0, 10)}.xls`,
      ['Data','SKU','Descrição','Tipo','Saldo Anterior','Qtd Entrada','Qtd Saída','Saldo Final','Endereço'],
      m => [
        m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—',
        m.sku ?? '—', m.descricao ?? '—', m.tipo_movimento ?? '—',
        m.saldo_anterior ?? 0, m.qtd_entrada ?? 0, m.qtd_saida ?? 0,
        m.saldo_final ?? 0, m.endereco_id ?? '—',
      ]
    );
  };

  const toggleCollapse = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const COLS = ['Data', 'Tipo', 'SKU', 'Descrição', 'Saldo Ant.', 'Entrada', 'Saída', 'Saldo Final'];

  const RowComp = ({ m }) => {
    const isSel = selectedRow?.id === m.id;
    return (
      <tr
        onClick={() => setSelectedRow(isSel ? null : m)}
        className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all text-xs',
          isSel ? 'bg-secondary/5 border-l-4 border-l-secondary dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
        )}
      >
        <td className="p-3 font-bold text-slate-500 whitespace-nowrap">{m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—'}</td>
        <td className="p-3"><TipoBadge tipo={m.tipo_movimento ?? '—'} /></td>
        <td className="p-3"><code className="font-black text-secondary text-[11px]">{m.sku ?? '—'}</code></td>
        <td className="p-3 font-medium text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{m.descricao ?? '—'}</td>
        <td className="p-3 text-center font-bold text-slate-500 tabular-nums">{m.saldo_anterior ?? 0}</td>
        <td className="p-3 text-center">
          <span className={cn('font-black tabular-nums', (m.qtd_entrada ?? 0) > 0 ? 'text-green-600' : 'text-slate-300 dark:text-slate-600')}>
            {(m.qtd_entrada ?? 0) > 0 ? `+${m.qtd_entrada}` : '—'}
          </span>
        </td>
        <td className="p-3 text-center">
          <span className={cn('font-black tabular-nums', (m.qtd_saida ?? 0) > 0 ? 'text-red-600' : 'text-slate-300 dark:text-slate-600')}>
            {(m.qtd_saida ?? 0) > 0 ? `-${m.qtd_saida}` : '—'}
          </span>
        </td>
        <td className="p-3 text-center font-black text-slate-800 dark:text-white tabular-nums">{m.saldo_final ?? 0}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'SKUs no Período', v: kpiSkus,     icon: Package,      c: 'text-secondary' },
          { l: 'Total Entradas',  v: kpiEntradas, icon: TrendingUp,   c: 'text-green-600' },
          { l: 'Total Saídas',    v: kpiSaidas,   icon: TrendingDown, c: 'text-red-600' },
        ].map(k => (
          <div key={k.l} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 shadow-sm">
            <k.icon className={cn('w-8 h-8', k.c)} aria-hidden="true" />
            <div>
              <p className={cn('text-2xl font-black', k.c)}>{loading ? '—' : k.v}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <div className="relative flex items-center">
          <label htmlFor="search-produto" className="sr-only">Buscar por produto ou código</label>
          <input id="search-produto" value={search} onChange={e => setSearch(e.target.value)} placeholder="Produto ou código..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-52" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" aria-hidden="true" />
        </div>
        <div className="relative flex items-center">
          <label htmlFor="situacao-produto" className="sr-only">Filtrar por situação</label>
          <select id="situacao-produto" value={situacao} onChange={e => setSituacao(e.target.value)}
            className="pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all appearance-none cursor-pointer">
            {['Todos','Com Movimentação','Sem Movimentação'].map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" aria-hidden="true" />
        </div>
        <div className="relative">
          <button onClick={() => setShowDate(!showDate)} aria-expanded={showDate} aria-haspopup="dialog"
            aria-label={`Período: ${dataIni} até ${dataFim}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-secondary transition-all">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />{dataIni} → {dataFim}
          </button>
          {showDate && (
            <div role="dialog" aria-label="Selecionar período"
              className="absolute top-10 left-0 z-30 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex gap-3 items-end">
              <div className="space-y-1">
                <label htmlFor="data-ini-produto" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</label>
                <input id="data-ini-produto" type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} autoFocus
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary w-38" />
              </div>
              <div className="space-y-1">
                <label htmlFor="data-fim-produto" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Final</label>
                <input id="data-fim-produto" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary w-38" />
              </div>
              <button onClick={() => setShowDate(false)} className="px-3 py-1.5 bg-secondary text-primary text-xs font-black rounded-xl hover:opacity-90">OK</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agrupar:</span>
          {[{ v: 'cod', l: 'Produto' }, { v: 'data', l: 'Data' }].map(g => (
            <button key={g.v} onClick={() => setGroupBy(groupBy === g.v ? null : g.v)} aria-pressed={groupBy === g.v}
              className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                groupBy === g.v ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}>{g.l}</button>
          ))}
        </div>
        <button onClick={handleExport} aria-label="Exportar para Excel"
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider shadow-md">
          <Download className="w-3.5 h-3.5" aria-hidden="true" />Excel
        </button>
        <button onClick={() => { setSearch(''); setSituacao('Todos'); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" aria-hidden="true" /> Limpar
        </button>
      </div>

      <div className={cn('flex gap-4', selectedRow && 'items-start')}>
        <div className={cn('bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-auto shadow-sm transition-all', selectedRow ? 'flex-1' : 'w-full')}>
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {COLS.map(h => <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLS.length} className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary" /></td></tr>
              ) : !grouped ? (
                filtered.length === 0
                  ? <tr><td colSpan={COLS.length} className="p-10 text-center text-slate-400 text-xs">Nenhum registro encontrado.</td></tr>
                  : filtered.map(m => <RowComp key={m.id} m={m} />)
              ) : (
                Object.entries(grouped).map(([key, rows]) => (
                  <React.Fragment key={key}>
                    <tr onClick={() => toggleCollapse(key)}
                      className="bg-slate-100 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all border-t border-slate-200 dark:border-slate-700">
                      <td colSpan={COLS.length} className="p-3">
                        <div className="flex items-center gap-2">
                          {collapsed[key] ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{key}</span>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{rows.length} reg.</span>
                          <span className="text-[9px] text-green-600 font-bold ml-2">+{rows.reduce((s, r) => s + (r.qtd_entrada ?? 0), 0)}</span>
                          <span className="text-[9px] text-red-600 font-bold ml-1">-{rows.reduce((s, r) => s + (r.qtd_saida ?? 0), 0)}</span>
                        </div>
                      </td>
                    </tr>
                    {!collapsed[key] && rows.map(m => <RowComp key={m.id} m={m} />)}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {selectedRow && (
          <div className="w-72 shrink-0">
            <PainelDetalhes item={selectedRow} onClose={() => setSelectedRow(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABA 2: KARDEX POR ENDEREÇO ────────────────────────────────────
function KardexEndereco({ movimentos, loading }) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [search,      setSearch]      = useState('');
  const [groupBy,     setGroupBy]     = useState(null);
  const [collapsed,   setCollapsed]   = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDate,    setShowDate]    = useState(false);
  const [dataIni,     setDataIni]     = useState(thirtyAgo);
  const [dataFim,     setDataFim]     = useState(today);

  useEffect(() => {
    if (!showDate) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDate(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDate]);

  const filtered = useMemo(() => movimentos.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      const end = (m.endereco_id ?? '').toLowerCase();
      const sku = (m.sku ?? '').toLowerCase();
      if (!end.includes(q) && !sku.includes(q)) return false;
    }
    if (m.created_at) {
      const iso = m.created_at.slice(0, 10);
      if (dataIni && iso < dataIni) return false;
      if (dataFim && iso > dataFim) return false;
    }
    return true;
  }), [movimentos, search, dataIni, dataFim]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return filtered.reduce((acc, m) => {
      const key = groupBy === 'endereco'
        ? (m.endereco_id ?? '—')
        : (m.created_at ? m.created_at.slice(0, 10) : '—');
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const toggleCollapse = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const kpiEnderecos = new Set(filtered.map(m => m.endereco_id).filter(Boolean)).size;
  const kpiEntradas  = filtered.reduce((s, m) => s + (m.qtd_entrada ?? 0), 0);
  const kpiSaidas    = filtered.reduce((s, m) => s + (m.qtd_saida ?? 0), 0);

  const handleExport = () => {
    exportCSV(
      filtered,
      `kardex_endereco_${new Date().toISOString().slice(0, 10)}.xls`,
      ['Data','Endereço','SKU','Descrição','Tipo','Entradas','Saídas','Saldo Final'],
      m => [
        m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—',
        m.endereco_id ?? '—', m.sku ?? '—', m.descricao ?? '—',
        m.tipo_movimento ?? '—', m.qtd_entrada ?? 0, m.qtd_saida ?? 0, m.saldo_final ?? 0,
      ]
    );
  };

  const COLS2 = ['Data', 'Endereço', 'SKU', 'Descrição', 'Tipo', 'Entradas', 'Saídas', 'Saldo Final'];

  const Row2 = ({ m }) => {
    const isSel = selectedRow?.id === m.id;
    return (
      <tr onClick={() => setSelectedRow(isSel ? null : m)}
        className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all text-xs',
          isSel ? 'bg-secondary/5 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
        )}>
        <td className="p-3 font-bold text-slate-500 whitespace-nowrap">{m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—'}</td>
        <td className="p-3"><code className="font-black text-blue-600 text-[11px] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{m.endereco_id ?? '—'}</code></td>
        <td className="p-3"><code className="font-black text-secondary text-[11px]">{m.sku ?? '—'}</code></td>
        <td className="p-3 font-medium text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{m.descricao ?? '—'}</td>
        <td className="p-3"><TipoBadge tipo={m.tipo_movimento ?? '—'} /></td>
        <td className="p-3 text-center font-black tabular-nums text-green-600">{(m.qtd_entrada ?? 0) > 0 ? `+${m.qtd_entrada}` : '—'}</td>
        <td className="p-3 text-center font-black tabular-nums text-red-600">{(m.qtd_saida ?? 0) > 0 ? `-${m.qtd_saida}` : '—'}</td>
        <td className="p-3 text-center font-black text-slate-800 dark:text-white tabular-nums">{m.saldo_final ?? 0}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'Endereços no Período', v: kpiEnderecos, icon: MapPin,       c: 'text-blue-600' },
          { l: 'Total Entradas',        v: kpiEntradas,  icon: TrendingUp,   c: 'text-green-600' },
          { l: 'Total Saídas',          v: kpiSaidas,    icon: TrendingDown, c: 'text-red-600' },
        ].map(k => (
          <div key={k.l} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 shadow-sm">
            <k.icon className={cn('w-8 h-8', k.c)} aria-hidden="true" />
            <div>
              <p className={cn('text-2xl font-black', k.c)}>{loading ? '—' : k.v}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <div className="relative flex items-center">
          <label htmlFor="search-endereco" className="sr-only">Buscar por endereço ou código</label>
          <input id="search-endereco" value={search} onChange={e => setSearch(e.target.value)} placeholder="Endereço ou código..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-56" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" aria-hidden="true" />
        </div>
        <div className="relative">
          <button onClick={() => setShowDate(!showDate)} aria-expanded={showDate} aria-haspopup="dialog"
            aria-label={`Período: ${dataIni} até ${dataFim}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-secondary transition-all">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />{dataIni} → {dataFim}
          </button>
          {showDate && (
            <div role="dialog" aria-label="Selecionar período"
              className="absolute top-10 left-0 z-30 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex gap-3 items-end">
              <div className="space-y-1">
                <label htmlFor="data-ini-endereco" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</label>
                <input id="data-ini-endereco" type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} autoFocus
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary" />
              </div>
              <div className="space-y-1">
                <label htmlFor="data-fim-endereco" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Final</label>
                <input id="data-fim-endereco" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary" />
              </div>
              <button onClick={() => setShowDate(false)} className="px-3 py-1.5 bg-secondary text-primary text-xs font-black rounded-xl hover:opacity-90">OK</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agrupar:</span>
          {[{ v: 'endereco', l: 'Endereço' }, { v: 'data', l: 'Data' }].map(g => (
            <button key={g.v} onClick={() => setGroupBy(groupBy === g.v ? null : g.v)} aria-pressed={groupBy === g.v}
              className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                groupBy === g.v ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}>{g.l}</button>
          ))}
        </div>
        <button onClick={handleExport} aria-label="Exportar para Excel"
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider shadow-md">
          <Download className="w-3.5 h-3.5" aria-hidden="true" />Excel
        </button>
        <button onClick={() => { setSearch(''); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" aria-hidden="true" /> Limpar
        </button>
      </div>

      <div className={cn('flex gap-4', selectedRow && 'items-start')}>
        <div className={cn('bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-auto shadow-sm transition-all', selectedRow ? 'flex-1' : 'w-full')}>
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {COLS2.map(h => <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLS2.length} className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary" /></td></tr>
              ) : !grouped ? (
                filtered.length === 0
                  ? <tr><td colSpan={COLS2.length} className="p-10 text-center text-slate-400 text-xs">Nenhum registro encontrado.</td></tr>
                  : filtered.map(m => <Row2 key={m.id} m={m} />)
              ) : (
                Object.entries(grouped).map(([key, rows]) => (
                  <React.Fragment key={key}>
                    <tr onClick={() => toggleCollapse(key)}
                      className="bg-slate-100 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all border-t border-slate-200 dark:border-slate-700">
                      <td colSpan={COLS2.length} className="p-3">
                        <div className="flex items-center gap-2">
                          {collapsed[key] ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{key}</span>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{rows.length} reg.</span>
                          <span className="text-[9px] text-green-600 font-bold ml-2">+{rows.reduce((s, r) => s + (r.qtd_entrada ?? 0), 0)}</span>
                          <span className="text-[9px] text-red-600 font-bold ml-1">-{rows.reduce((s, r) => s + (r.qtd_saida ?? 0), 0)}</span>
                        </div>
                      </td>
                    </tr>
                    {!collapsed[key] && rows.map(m => <Row2 key={m.id} m={m} />)}
                  </React.Fragment>
                ))
              )}
              {!loading && filtered.length === 0 && !grouped && null}
            </tbody>
          </table>
        </div>
        {selectedRow && (
          <div className="w-72 shrink-0">
            <PainelDetalhes item={selectedRow} onClose={() => setSelectedRow(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE RAIZ ───────────────────────────────────────────────
export default function KardexReport() {
  const { warehouseId } = useApp();
  const [tab,       setTab]       = useState(0);
  const [movimentos, setMovimentos] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchMovimentos = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    try {
      const { data, error } = await movimentoEstoqueService.getByWarehouse(warehouseId);

      if (error) throw error;

      if (!data || data.length === 0) {
        // seed: busca produtos para criar movimentos demo
        const { data: prods } = await produtosService.listSeed(5);

        const tipos = ['Entrada', 'Saída', 'Ajuste', 'Transferência', 'Entrada'];
        if (prods && prods.length > 0) {
          const seeds = prods.map((p, i) => ({
            warehouse_id:   warehouseId,
            produto_id:     p.id,
            sku:            p.sku,
            descricao:      p.descricao,
            tipo_movimento: tipos[i % tipos.length],
            qtd_entrada:    tipos[i % tipos.length] === 'Entrada' ? Math.floor(Math.random() * 50) + 10 : 0,
            qtd_saida:      tipos[i % tipos.length] === 'Saída'   ? Math.floor(Math.random() * 20) + 5  : 0,
            saldo_anterior: Math.floor(Math.random() * 60) + 10,
            saldo_final:    Math.floor(Math.random() * 80) + 20,
            endereco_id:    `R${i + 1}_PP1_CL001_N001`,
          }));
          const { error: seedErr } = await movimentoEstoqueService.insertMany(seeds);
          if (seedErr) throw seedErr;
          return fetchMovimentos();
        }
      }

      setMovimentos(data || []);
    } catch (err) {
      showToast(`Erro ao carregar Kardex: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [warehouseId, showToast]);

  useEffect(() => { fetchMovimentos(); }, [fetchMovimentos]);

  const TABS = [
    { label: 'Kardex por Produto',  icon: Package, desc: 'Histórico do SKU' },
    { label: 'Kardex por Endereço', icon: MapPin,  desc: 'Histórico da prateleira' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white ${
            toast.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <p className="text-sm font-bold">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 hover:bg-black/10 p-1 rounded-full" aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-secondary to-emerald-600" aria-hidden="true" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-emerald-700 flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 7 — Consultas, Relatórios e Faturamento</p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">4.2 Consultar Kardex</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Rastreabilidade completa · Entradas · Saídas · Saldos · Exportação Excel</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-2 shadow-sm flex gap-2" role="tablist">
        {TABS.map((t, i) => (
          <button key={i} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
            className={cn('flex-1 flex items-center gap-3 px-5 py-3 rounded-xl transition-all',
              tab === i
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg scale-[1.01]'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}>
            <t.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wide">{t.label}</p>
              <p className={cn('text-[9px] font-medium', tab === i ? 'text-white/60' : 'text-slate-400')}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {tab === 0 && <KardexProduto movimentos={movimentos} loading={loading} />}
      {tab === 1 && <KardexEndereco movimentos={movimentos} loading={loading} />}
    </div>
  );
}
