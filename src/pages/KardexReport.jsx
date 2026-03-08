import React, { useState, useMemo, useEffect } from 'react';
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

// ─── Converte 'dd/mm/yyyy' → 'yyyy-mm-dd' para comparação com input[type=date]
function brToIso(dataBr) {
  if (!dataBr) return '';
  const [d, m, y] = dataBr.split('/');
  return `${y}-${m}-${d}`;
}

// ─── MOCK DATA — PRODUTO ─────────────────────────────────────────────
const MOVIMENTOS_PRODUTO = [
  { id:'M001', data:'20/02/2026', cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira',   depositante:'Atacado BR Peças',  saldoInicial:30, qtdEntrada:48, qtdSaida:0,  saldoFinal:78,  tipo:'Entrada',       nrOp:'REC-0541', docFiscal:'NF 000.541', situacao:'Com Movimentação' },
  { id:'M002', data:'20/02/2026', cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira',   depositante:'Atacado BR Peças',  saldoInicial:78, qtdEntrada:0,  qtdSaida:12, saldoFinal:66,  tipo:'Saída',         nrOp:'SEP-0892', docFiscal:'OV 000.892', situacao:'Com Movimentação' },
  { id:'M003', data:'21/02/2026', cod:'VP-DC2210-F', desc:'Disco de Freio Ventilado',       depositante:'Grupo Freios Sul',  saldoInicial:0,  qtdEntrada:12, qtdSaida:0,  saldoFinal:12,  tipo:'Entrada',       nrOp:'REC-0512', docFiscal:'NF 000.512', situacao:'Com Movimentação' },
  { id:'M004', data:'21/02/2026', cod:'VP-FO1122-M', desc:'Filtro de Óleo Premium',         depositante:'Rede Filtros SP',   saldoInicial:60, qtdEntrada:0,  qtdSaida:20, saldoFinal:40,  tipo:'Saída',         nrOp:'SEP-0905', docFiscal:'OV 000.905', situacao:'Com Movimentação' },
  { id:'M005', data:'21/02/2026', cod:'VP-LB0091-A', desc:'Fluido de Freio DOT 4 500ml',   depositante:'Química Total',     saldoInicial:36, qtdEntrada:0,  qtdSaida:0,  saldoFinal:36,  tipo:'Ajuste',        nrOp:'AJ-0022',  docFiscal:'AI 000.022',  situacao:'Com Movimentação' },
  { id:'M006', data:'22/02/2026', cod:'VP-FA3311-K', desc:'Filtro de Ar Esportivo',         depositante:'SportAuto Brasil',  saldoInicial:24, qtdEntrada:0,  qtdSaida:10, saldoFinal:14,  tipo:'Saída',         nrOp:'SEP-0920', docFiscal:'OV 000.920', situacao:'Com Movimentação' },
  { id:'M007', data:'22/02/2026', cod:'VP-PA1023-J', desc:'Palheta Dianteira KIT',          depositante:'Wiper Parts',       saldoInicial:18, qtdEntrada:30, qtdSaida:0,  saldoFinal:48,  tipo:'Entrada',       nrOp:'REC-0545', docFiscal:'NF 000.545', situacao:'Com Movimentação' },
  { id:'M008', data:'22/02/2026', cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira',   depositante:'Atacado BR Peças',  saldoInicial:66, qtdEntrada:0,  qtdSaida:18, saldoFinal:48,  tipo:'Transferência', nrOp:'REM-0061', docFiscal:'—',           situacao:'Com Movimentação' },
  { id:'M009', data:'22/02/2026', cod:'VP-SK0099-Z', desc:'Sensor de ABS Dianteiro',        depositante:'ElectroParts',      saldoInicial:0,  qtdEntrada:0,  qtdSaida:0,  saldoFinal:0,   tipo:'Ajuste',        nrOp:'—',        docFiscal:'—',           situacao:'Sem Movimentação' },
];

// ─── MOCK DATA — ENDEREÇO ─────────────────────────────────────────────
const MOVIMENTOS_ENDERECO = [
  { id:'E001', data:'20/02/2026', endereco:'R1_PP1_D4', regiao:'Pulmão Setor A',  cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira', depositante:'Atacado BR Peças', entradas:48, saidas:0,  saldoFinal:78, tipo:'Entrada',       nrOp:'REC-0541', docFiscal:'NF 000.541' },
  { id:'E002', data:'20/02/2026', endereco:'R1_PP1_D4', regiao:'Pulmão Setor A',  cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira', depositante:'Atacado BR Peças', entradas:0,  saidas:12, saldoFinal:66, tipo:'Saída',         nrOp:'SEP-0892', docFiscal:'OV 000.892' },
  { id:'E003', data:'21/02/2026', endereco:'R2_PP3_D3', regiao:'Pulmão Setor B',  cod:'VP-DC2210-F', desc:'Disco de Freio Ventilado',    depositante:'Grupo Freios Sul', entradas:12, saidas:0,  saldoFinal:12, tipo:'Entrada',       nrOp:'REC-0512', docFiscal:'NF 000.512' },
  { id:'E004', data:'21/02/2026', endereco:'R1_PP2_C2', regiao:'Picking Setor C', cod:'VP-FO1122-M', desc:'Filtro de Óleo Premium',      depositante:'Rede Filtros SP',  entradas:0,  saidas:20, saldoFinal:40, tipo:'Saída',         nrOp:'SEP-0905', docFiscal:'OV 000.905' },
  { id:'E005', data:'22/02/2026', endereco:'R2_PP4_D1', regiao:'Pulmão Setor D',  cod:'VP-LB0091-A', desc:'Fluido de Freio DOT 4',      depositante:'Química Total',    entradas:0,  saidas:0,  saldoFinal:36, tipo:'Ajuste',        nrOp:'AJ-0022',  docFiscal:'AI 000.022' },
  { id:'E006', data:'22/02/2026', endereco:'R1_PP1_A1', regiao:'Picking Setor A', cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira', depositante:'Atacado BR Peças', entradas:18, saidas:0,  saldoFinal:18, tipo:'Transferência', nrOp:'REM-0061', docFiscal:'—' },
];

// ─── EXPORTAÇÃO CSV / EXCEL ────────────────────────────────────────
function exportCSV(data, filename, headers, rowMapper) {
  const rows = [headers.join(';'), ...data.map(r => rowMapper(r).join(';'))];
  const csv  = '\uFEFF' + rows.join('\r\n');          // BOM UTF-8
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── PAINEL DETALHES ──────────────────────────────────────────────
function PainelDetalhes({ item, onClose, mode }) {
  const isProd = mode === 'produto';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-secondary/40 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-secondary" aria-hidden="true" />
          <div>
            <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Detalhes da Movimentação</p>
            <p className="text-xs font-black text-white uppercase">{isProd ? item.cod : item.endereco}</p>
          </div>
        </div>
        {/* Botão fechar com aria-label acessível */}
        <button
          onClick={onClose}
          aria-label="Fechar painel de detalhes"
          className="text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Nº Operação',    v: item.nrOp },
            { l: 'Tipo',           v: null },
            { l: 'Doc. Fiscal',    v: item.docFiscal },
            { l: 'Data',           v: item.data },
            { l: 'Depositante',    v: item.depositante },
            isProd
              ? { l: 'Saldo Final', v: `${item.saldoFinal} un.` }
              : { l: 'Endereço',    v: item.endereco },
          ].map((f, i) => f && (
            <div key={i} className={cn('p-3 bg-slate-50 dark:bg-slate-800 rounded-xl', i === 1 && 'col-span-2')}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
              {f.v === null ? <div className="mt-1"><TipoBadge tipo={item.tipo} /></div> : <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{f.v}</p>}
            </div>
          ))}
        </div>

        {/* Saldos */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Fluxo de Quantidade</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase">Saldo Inicial</p>
              <p className="text-base font-black text-slate-700 dark:text-slate-300">{isProd ? item.saldoInicial : (item.saldoFinal - (item.entradas || 0) + (item.saidas || 0))}</p>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[9px] font-black text-green-500">+{isProd ? item.qtdEntrada : (item.entradas || 0)}</span>
              <span className="text-[9px] font-black text-red-500">-{isProd ? item.qtdSaida : (item.saidas || 0)}</span>
            </div>
            <div className="flex-1 text-center p-2 bg-secondary/10 rounded-lg border-2 border-secondary/30">
              <p className="text-[8px] font-black text-secondary uppercase">Saldo Final</p>
              <p className="text-base font-black text-slate-800 dark:text-white">{item.saldoFinal}</p>
            </div>
          </div>
        </div>

        {/* Produto */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Produto</p>
          <p className="text-[10px] font-black text-secondary">{item.cod}</p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── ABA 1: KARDEX POR PRODUTO ────────────────────────────────────
function KardexProduto() {
  const DEFAULT_INI = '2026-02-20';
  const DEFAULT_FIM = '2026-02-22';

  const [search,      setSearch]      = useState('');
  const [situacao,    setSituacao]    = useState('Todos');
  const [dataIni,     setDataIni]     = useState(DEFAULT_INI);
  const [dataFim,     setDataFim]     = useState(DEFAULT_FIM);
  const [showDate,    setShowDate]    = useState(false);
  const [groupBy,     setGroupBy]     = useState(null);  // null | 'cod' | 'data'
  const [collapsed,   setCollapsed]   = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  // Fechar popup de data com Escape
  useEffect(() => {
    if (!showDate) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDate(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDate]);

  // Filtro inclui período: converte 'dd/mm/yyyy' → 'yyyy-mm-dd' para comparação lexicográfica
  const filtered = useMemo(() => MOVIMENTOS_PRODUTO.filter(m => {
    if (situacao !== 'Todos' && m.situacao !== situacao) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.cod.toLowerCase().includes(q) && !m.desc.toLowerCase().includes(q)) return false;
    }
    const dataIso = brToIso(m.data);
    if (dataIni && dataIso < dataIni) return false;
    if (dataFim && dataIso > dataFim) return false;
    return true;
  }), [search, situacao, dataIni, dataFim]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return filtered.reduce((acc, m) => {
      const key = groupBy === 'cod' ? `${m.cod} — ${m.desc}` : m.data;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const kpiEntradas = filtered.reduce((s, m) => s + m.qtdEntrada, 0);
  const kpiSaidas   = filtered.reduce((s, m) => s + m.qtdSaida, 0);
  const kpiSkus     = new Set(filtered.map(m => m.cod)).size;

  const handleExport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    exportCSV(
      filtered,
      `kardex_produto_${dateStr}.xls`,
      ['Data','Cód. Produto','Descrição','Depositante','Tipo','Saldo Inicial','Qtd. Entrada','Qtd. Saída','Saldo Final','Nº Operação','Doc. Fiscal'],
      m => [m.data, m.cod, m.desc, m.depositante, m.tipo, m.saldoInicial, m.qtdEntrada, m.qtdSaida, m.saldoFinal, m.nrOp, m.docFiscal]
    );
  };

  const toggleCollapse = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const COLS = ['Data', 'Estado', 'Cód. Produto', 'Descrição', 'Depositante', 'Saldo Inicial', 'Qtde Entrada', 'Qtde Saída', 'Saldo Final'];

  const RowComp = ({ m }) => {
    const isSel = selectedRow?.id === m.id;
    return (
      <tr
        onClick={() => setSelectedRow(isSel ? null : m)}
        className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all group text-xs',
          isSel ? 'bg-secondary/5 border-l-4 border-l-secondary dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
        )}
      >
        <td className="p-3 font-bold text-slate-500 whitespace-nowrap">{m.data}</td>
        <td className="p-3"><TipoBadge tipo={m.tipo} /></td>
        <td className="p-3"><code className="font-black text-secondary text-[11px]">{m.cod}</code></td>
        <td className="p-3 font-medium text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{m.desc}</td>
        <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{m.depositante}</td>
        <td className="p-3 text-center font-bold text-slate-500 tabular-nums">{m.saldoInicial}</td>
        <td className="p-3 text-center">
          <span className={cn('font-black tabular-nums', m.qtdEntrada > 0 ? 'text-green-600' : 'text-slate-300 dark:text-slate-600')}>
            {m.qtdEntrada > 0 ? `+${m.qtdEntrada}` : '—'}
          </span>
        </td>
        <td className="p-3 text-center">
          <span className={cn('font-black tabular-nums', m.qtdSaida > 0 ? 'text-red-600' : 'text-slate-300 dark:text-slate-600')}>
            {m.qtdSaida > 0 ? `-${m.qtdSaida}` : '—'}
          </span>
        </td>
        <td className="p-3 text-center font-black text-slate-800 dark:text-white tabular-nums">{m.saldoFinal}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'SKUs no Período', v: kpiSkus,     icon: Package,      c: 'text-secondary' },
          { l: 'Total Entradas',  v: kpiEntradas, icon: TrendingUp,   c: 'text-green-600' },
          { l: 'Total Saídas',    v: kpiSaidas,   icon: TrendingDown, c: 'text-red-600' },
        ].map(k => (
          <div key={k.l} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 shadow-sm">
            <k.icon className={cn('w-8 h-8', k.c)} aria-hidden="true" />
            <div>
              <p className={cn('text-2xl font-black', k.c)}>{k.v}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />

        {/* Busca */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" aria-hidden="true" />
          <label htmlFor="search-produto" className="sr-only">Buscar por produto ou código</label>
          <input
            id="search-produto"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Produto ou código..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-52"
          />
        </div>

        {/* Situação */}
        <div className="relative flex items-center">
          <label htmlFor="situacao-produto" className="sr-only">Filtrar por situação</label>
          <select
            id="situacao-produto"
            value={situacao}
            onChange={e => setSituacao(e.target.value)}
            className="pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
          >
            {['Todos','Com Movimentação','Sem Movimentação'].map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Período */}
        <div className="relative">
          <button
            onClick={() => setShowDate(!showDate)}
            aria-expanded={showDate}
            aria-haspopup="dialog"
            aria-label={`Filtrar período: ${dataIni} até ${dataFim}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-secondary transition-all"
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />{dataIni} → {dataFim}
          </button>
          {showDate && (
            <div
              role="dialog"
              aria-label="Selecionar período"
              className="absolute top-10 left-0 z-30 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex gap-3 items-end"
            >
              <div className="space-y-1">
                <label htmlFor="data-ini-produto" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</label>
                <input
                  id="data-ini-produto"
                  type="date"
                  value={dataIni}
                  onChange={e => setDataIni(e.target.value)}
                  autoFocus
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary w-38"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="data-fim-produto" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Final</label>
                <input
                  id="data-fim-produto"
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary w-38"
                />
              </div>
              <button onClick={() => setShowDate(false)} className="px-3 py-1.5 bg-secondary text-primary text-xs font-black rounded-xl hover:opacity-90">OK</button>
            </div>
          )}
        </div>

        {/* Agrupar */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agrupar:</span>
          {[{ v: 'cod', l: 'Produto' }, { v: 'data', l: 'Data' }].map(g => (
            <button
              key={g.v}
              onClick={() => setGroupBy(groupBy === g.v ? null : g.v)}
              aria-pressed={groupBy === g.v}
              className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                groupBy === g.v ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}
            >{g.l}</button>
          ))}
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          aria-label="Exportar dados filtrados para Excel"
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider shadow-md"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />Excel
        </button>

        {/* Limpar — reseta busca, situação E datas */}
        <button
          onClick={() => { setSearch(''); setSituacao('Todos'); setDataIni(DEFAULT_INI); setDataFim(DEFAULT_FIM); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" /> Limpar
        </button>
      </div>

      {/* Grid + Detalhe */}
      <div className={cn('flex gap-4', selectedRow && 'items-start')}>
        {/* Grid */}
        <div className={cn('bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-auto shadow-sm transition-all', selectedRow ? 'flex-1' : 'w-full')}>
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {COLS.map(h => (
                  <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!grouped && filtered.map(m => <RowComp key={m.id} m={m} />)}
              {grouped && Object.entries(grouped).map(([key, rows]) => (
                <React.Fragment key={key}>
                  <tr onClick={() => toggleCollapse(key)}
                    className="bg-slate-100 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all border-t border-slate-200 dark:border-slate-700">
                    <td colSpan={COLS.length} className="p-3">
                      <div className="flex items-center gap-2">
                        {collapsed[key] ? <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{key}</span>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{rows.length} reg.</span>
                        <span className="text-[9px] text-green-600 font-bold ml-2">+{rows.reduce((s, r) => s + r.qtdEntrada, 0)} entradas</span>
                        <span className="text-[9px] text-red-600 font-bold ml-1">-{rows.reduce((s, r) => s + r.qtdSaida, 0)} saídas</span>
                      </div>
                    </td>
                  </tr>
                  {!collapsed[key] && rows.map(m => <RowComp key={m.id} m={m} />)}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={COLS.length} className="p-10 text-center text-slate-400 text-xs">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Painel Detalhe */}
        {selectedRow && (
          <div className="w-72 shrink-0">
            <PainelDetalhes item={selectedRow} onClose={() => setSelectedRow(null)} mode="produto" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABA 2: KARDEX POR ENDEREÇO ────────────────────────────────────
function KardexEndereco() {
  const DEFAULT_INI = '2026-02-20';
  const DEFAULT_FIM = '2026-02-22';

  const [search,      setSearch]      = useState('');
  const [groupBy,     setGroupBy]     = useState(null);
  const [collapsed,   setCollapsed]   = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDate,    setShowDate]    = useState(false);
  const [dataIni,     setDataIni]     = useState(DEFAULT_INI);
  const [dataFim,     setDataFim]     = useState(DEFAULT_FIM);

  // Fechar popup de data com Escape
  useEffect(() => {
    if (!showDate) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDate(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDate]);

  // Filtro inclui período
  const filtered = useMemo(() => MOVIMENTOS_ENDERECO.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.endereco.toLowerCase().includes(q) && !m.cod.toLowerCase().includes(q) && !m.regiao.toLowerCase().includes(q)) return false;
    }
    const dataIso = brToIso(m.data);
    if (dataIni && dataIso < dataIni) return false;
    if (dataFim && dataIso > dataFim) return false;
    return true;
  }), [search, dataIni, dataFim]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return filtered.reduce((acc, m) => {
      const key = groupBy === 'endereco' ? `${m.endereco} — ${m.regiao}` : m.data;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const toggleCollapse = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const handleExport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    exportCSV(
      filtered,
      `kardex_endereco_${dateStr}.xls`,
      ['Data','Endereço','Região','Cód. Produto','Descrição','Depositante','Tipo','Entradas','Saídas','Saldo Final','Nº Operação','Doc. Fiscal'],
      m => [m.data, m.endereco, m.regiao, m.cod, m.desc, m.depositante, m.tipo, m.entradas, m.saidas, m.saldoFinal, m.nrOp, m.docFiscal]
    );
  };

  const kpiEnderecos = new Set(filtered.map(m => m.endereco)).size;
  const kpiEntradas  = filtered.reduce((s, m) => s + m.entradas, 0);
  const kpiSaidas    = filtered.reduce((s, m) => s + m.saidas, 0);

  const COLS2 = ['Data', 'Endereço', 'Região', 'Cód. Produto', 'Descrição', 'Depositante', 'Tipo', 'Entradas', 'Saídas', 'Saldo Final'];

  const Row2 = ({ m }) => {
    const isSel = selectedRow?.id === m.id;
    return (
      <tr
        onClick={() => setSelectedRow(isSel ? null : m)}
        className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all text-xs',
          isSel ? 'bg-secondary/5 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
        )}
      >
        <td className="p-3 font-bold text-slate-500 whitespace-nowrap">{m.data}</td>
        <td className="p-3"><code className="font-black text-blue-600 text-[11px] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{m.endereco}</code></td>
        <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{m.regiao}</td>
        <td className="p-3"><code className="font-black text-secondary text-[11px]">{m.cod}</code></td>
        <td className="p-3 font-medium text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{m.desc}</td>
        <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{m.depositante}</td>
        <td className="p-3"><TipoBadge tipo={m.tipo} /></td>
        <td className="p-3 text-center font-black tabular-nums text-green-600">{m.entradas > 0 ? `+${m.entradas}` : '—'}</td>
        <td className="p-3 text-center font-black tabular-nums text-red-600">{m.saidas > 0 ? `-${m.saidas}` : '—'}</td>
        <td className="p-3 text-center font-black text-slate-800 dark:text-white tabular-nums">{m.saldoFinal}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'Endereços no Período', v: kpiEnderecos, icon: MapPin,       c: 'text-blue-600' },
          { l: 'Total Entradas',        v: kpiEntradas,  icon: TrendingUp,   c: 'text-green-600' },
          { l: 'Total Saídas',          v: kpiSaidas,    icon: TrendingDown, c: 'text-red-600' },
        ].map(k => (
          <div key={k.l} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 shadow-sm">
            <k.icon className={cn('w-8 h-8', k.c)} aria-hidden="true" />
            <div>
              <p className={cn('text-2xl font-black', k.c)}>{k.v}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" aria-hidden="true" />
          <label htmlFor="search-endereco" className="sr-only">Buscar por endereço, código ou região</label>
          <input
            id="search-endereco"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Endereço, código ou região..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-56"
          />
        </div>

        {/* Período */}
        <div className="relative">
          <button
            onClick={() => setShowDate(!showDate)}
            aria-expanded={showDate}
            aria-haspopup="dialog"
            aria-label={`Filtrar período: ${dataIni} até ${dataFim}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-secondary transition-all"
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />{dataIni} → {dataFim}
          </button>
          {showDate && (
            <div
              role="dialog"
              aria-label="Selecionar período"
              className="absolute top-10 left-0 z-30 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex gap-3 items-end"
            >
              <div className="space-y-1">
                <label htmlFor="data-ini-endereco" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</label>
                <input
                  id="data-ini-endereco"
                  type="date"
                  value={dataIni}
                  onChange={e => setDataIni(e.target.value)}
                  autoFocus
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="data-fim-endereco" className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data Final</label>
                <input
                  id="data-fim-endereco"
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary"
                />
              </div>
              <button onClick={() => setShowDate(false)} className="px-3 py-1.5 bg-secondary text-primary text-xs font-black rounded-xl hover:opacity-90">OK</button>
            </div>
          )}
        </div>

        {/* Agrupar */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agrupar:</span>
          {[{ v: 'endereco', l: 'Endereço' }, { v: 'data', l: 'Data' }].map(g => (
            <button
              key={g.v}
              onClick={() => setGroupBy(groupBy === g.v ? null : g.v)}
              aria-pressed={groupBy === g.v}
              className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                groupBy === g.v ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}
            >{g.l}</button>
          ))}
        </div>

        <button
          onClick={handleExport}
          aria-label="Exportar dados filtrados para Excel"
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider shadow-md"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />Excel
        </button>

        {/* Limpar — reseta busca E datas */}
        <button
          onClick={() => { setSearch(''); setDataIni(DEFAULT_INI); setDataFim(DEFAULT_FIM); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" /> Limpar
        </button>
      </div>

      {/* Grid + Detalhe */}
      <div className={cn('flex gap-4', selectedRow && 'items-start')}>
        <div className={cn('bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-auto shadow-sm transition-all', selectedRow ? 'flex-1' : 'w-full')}>
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {COLS2.map(h => (
                  <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!grouped && filtered.map(m => <Row2 key={m.id} m={m} />)}
              {grouped && Object.entries(grouped).map(([key, rows]) => (
                <React.Fragment key={key}>
                  <tr onClick={() => toggleCollapse(key)}
                    className="bg-slate-100 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all border-t border-slate-200 dark:border-slate-700">
                    <td colSpan={COLS2.length} className="p-3">
                      <div className="flex items-center gap-2">
                        {collapsed[key] ? <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{key}</span>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{rows.length} reg.</span>
                        <span className="text-[9px] text-green-600 font-bold ml-2">+{rows.reduce((s, r) => s + r.entradas, 0)}</span>
                        <span className="text-[9px] text-red-600 font-bold ml-1">-{rows.reduce((s, r) => s + r.saidas, 0)}</span>
                      </div>
                    </td>
                  </tr>
                  {!collapsed[key] && rows.map(m => <Row2 key={m.id} m={m} />)}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={COLS2.length} className="p-10 text-center text-slate-400 text-xs">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedRow && (
          <div className="w-72 shrink-0">
            <PainelDetalhes item={selectedRow} onClose={() => setSelectedRow(null)} mode="endereco" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE RAIZ ───────────────────────────────────────────────
export default function KardexReport() {
  const [tab, setTab] = useState(0);
  const TABS = [
    { label: 'Kardex por Produto',  icon: Package, desc: 'Histórico do SKU' },
    { label: 'Kardex por Endereço', icon: MapPin,  desc: 'Histórico da prateleira' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

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
          <button
            key={i}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={cn('flex-1 flex items-center gap-3 px-5 py-3 rounded-xl transition-all',
              tab === i
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg scale-[1.01]'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <t.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wide">{t.label}</p>
              <p className={cn('text-[9px] font-medium', tab === i ? 'text-white/60' : 'text-slate-400')}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CONTEÚDO DA ABA */}
      {tab === 0 && <KardexProduto />}
      {tab === 1 && <KardexEndereco />}
    </div>
  );
}
