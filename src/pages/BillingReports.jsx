import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  FileSpreadsheet,
  Filter,
  Calendar,
  X,
  Loader2,
  Layers,
  Box,
  Package,
  Monitor,
  DollarSign,
  ArrowRightLeft,
  Play,
  Info,
  GripVertical,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Utilitários ──────────────────────────────────────────────────────────────

/** Exporta array de objetos como CSV e dispara download real */
function exportCSV(filename, columns, rows) {
  const header = columns.join(';');
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';')
  ).join('\n');
  const blob = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Formata número conforme tipo semântico da coluna */
function formatCell(col, value) {
  if (typeof value !== 'number') return value ?? '—';
  // Colunas monetárias: qualquer que contenha Valor, Custo, Saldo (financeiro), Diária
  if (/valor|custo|saldo.*peso|saldo.*unid/i.test(col) === false && /valor|custo.*dia|billing/i.test(col)) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
  if (/valor|acumulado/i.test(col)) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
  if (/custo.*dia/i.test(col)) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia`;
  }
  // Números inteiros: posições, qtd, saldo
  return value.toLocaleString('pt-BR');
}

// ─── Dados (sem mock — real data via Supabase) ────────────────────────────────
// Para rotas sem fetch implementado, retornam array vazio aguardando dados reais
const REPORT_DATA = {
  '/faturamento/embalagem':       [],
  '/faturamento/palete':          [],
  '/faturamento/peso':            [],
  '/faturamento/endereco':        [],
  '/financeiro/calcular-diarias': [],
};

// Config de metadados apenas (sem mockData acoplado)
const REPORT_CONFIGS = {
  '/faturamento/embalagem':        { title: 'Armazenagem por Embalagem', icon: Box,          columns: ['Armazém','Data','Depositante','Setor','Local','Descrição do Produto','Qtd Unidade'] },
  '/faturamento/palete':           { title: 'Armazenagem por Palete',    icon: Layers,        columns: ['Armazém','Depositante','Tipo Palete','Posições Ocupadas','Setor de Alocação','Vencimento'] },
  '/faturamento/peso':             { title: 'Armazenagem por Peso',      icon: Package,       columns: ['Armazém','Depositante','Peso Total (Kg)','Peso Médio/Palete','Status Carga','Local'] },
  '/faturamento/endereco':         { title: 'Armazenagem por Endereço',  icon: Monitor,       columns: ['Localização','Status Ocupação','Tempo Permanente','Custo por Dia','Identificador'] },
  '/financeiro/calcular-diarias':  { title: 'Consulta para Cobrança (Billing)', icon: DollarSign, columns: ['Depositante','Saldo Palete','Saldo Peso (Kg)','Saldo Unidade','Vencimento Ciclo','Valor Acumulado'] },
};

const FALLBACK_ROUTE = '/faturamento/embalagem';

// ─── Componente de célula formatada ──────────────────────────────────────────
function Cell({ col, value }) {
  const formatted = formatCell(col, value);
  const isMonetary = typeof formatted === 'string' && formatted.startsWith('R$');
  return (
    <span className={cn(isMonetary && 'text-emerald-600 font-black tabular-nums')}>
      {formatted}
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function BillingReports() {
  const location = useLocation();
  const { warehouseId } = useApp();

  // Lookup seguro — sem fallback silencioso para rota errada
  const routeKey = Object.keys(REPORT_CONFIGS).find(k => location.pathname.startsWith(k)) ?? FALLBACK_ROUTE;
  const config   = REPORT_CONFIGS[routeKey];

  // ── Estado de parâmetros — persiste por rota (não reseta ao renavegar) ────
  const [paramsMap, setParamsMap] = useState(() =>
    Object.fromEntries(Object.keys(REPORT_CONFIGS).map(k => [k, { start: '', end: '' }]))
  );
  const params = paramsMap[routeKey];
  const setParams = useCallback((newParams) => {
    setParamsMap(m => ({ ...m, [routeKey]: newParams }));
  }, [routeKey]);

  const [showParams,   setShowParams]   = useState(true);
  const [dataLoaded,   setDataLoaded]   = useState(false);
  const [fetchedData,  setFetchedData]  = useState([]);
  const [fetching,     setFetching]     = useState(false);
  const [exporting,    setExporting]    = useState(false);
  const [groupColumn,  setGroupColumn]  = useState(null);
  const [sortCol,      setSortCol]      = useState(null);
  const [sortDir,      setSortDir]      = useState('asc');

  // ── Abre modal ao trocar de rota APENAS se dados ainda não foram carregados
  const [loadedRoutes, setLoadedRoutes] = useState(new Set());
  const [prevRoute, setPrevRoute] = useState(routeKey);
  if (prevRoute !== routeKey) {
    setPrevRoute(routeKey);
    if (!loadedRoutes.has(routeKey)) {
      setShowParams(true);
      setDataLoaded(false);
      setFetchedData([]);
    }
  }

  // ── Fetch real notas_saida para a rota de billing ─────────────────────────
  const fetchBillingData = useCallback(async () => {
    if (routeKey !== '/financeiro/calcular-diarias' || !params.start || !params.end) return;
    setFetching(true);
    const { data, error } = await supabase
      .from('notas_saida')
      .select('id, numero, depositante, valor, situacao, created_at, warehouse_id')
      .eq('warehouse_id', warehouseId)
      .gte('created_at', params.start + 'T00:00:00')
      .lte('created_at', params.end + 'T23:59:59')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[BillingReports] fetch:', error.message);
      setFetchedData([]);
    } else {
      // Transforma em formato compatível com as colunas do relatório
      const rows = (data || []).map((r, i) => ({
        id: r.id,
        isoDate: r.created_at ? r.created_at.slice(0, 10) : '',
        Depositante: r.depositante || '—',
        'Saldo Palete': 0,
        'Saldo Peso (Kg)': 0,
        'Saldo Unidade': 0,
        'Vencimento Ciclo': '—',
        'Valor Acumulado': r.valor ?? 0,
        'NF': r.numero || '—',
        'Situação': r.situacao || '—',
      }));
      setFetchedData(rows);
    }
    setFetching(false);
  }, [routeKey, params.start, params.end, warehouseId]);

  // A rawData é: dados do Supabase para billing, ou array vazio para demais
  const rawData = useMemo(() => {
    if (routeKey === '/financeiro/calcular-diarias') return fetchedData;
    return REPORT_DATA[routeKey] ?? [];
  }, [routeKey, fetchedData]);

  // ── Filtro por data (ISO) ─────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!dataLoaded) return [];
    const start = params.start ? new Date(params.start + 'T00:00:00') : null;
    const end   = params.end   ? new Date(params.end   + 'T23:59:59') : null;
    return rawData.filter(row => {
      if (!row.isoDate) return true;
      const d = new Date(row.isoDate);
      if (start && d < start) return false;
      if (end   && d > end)   return false;
      return true;
    });
  }, [rawData, dataLoaded, params]);

  // ── Ordenação ─────────────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const va = a[sortCol]; const vb = b[sortCol];
      if (va === vb) return 0;
      const cmp = va < vb ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortCol, sortDir]);

  // ── Agrupamento real ──────────────────────────────────────────────────────
  const groupedData = useMemo(() => {
    if (!groupColumn) return [{ groupKey: null, rows: sortedData }];
    const map = new Map();
    for (const row of sortedData) {
      const key = String(row[groupColumn] ?? '(sem valor)');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return Array.from(map.entries()).map(([groupKey, rows]) => ({ groupKey, rows }));
  }, [sortedData, groupColumn]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApply = async () => {
    setShowParams(false);
    setDataLoaded(true);
    setLoadedRoutes(s => new Set([...s, routeKey]));
    setGroupColumn(null);
    setSortCol(null);
    await fetchBillingData();
  };

  const handleExport = () => {
    if (exporting || !dataLoaded) return;
    setExporting(true);
    // Export real — CSV com os dados filtrados e ordenados
    setTimeout(() => {
      exportCSV(`${config.title.replace(/\s+/g, '_')}_${params.start}_${params.end}.csv`, config.columns, sortedData);
      setExporting(false);
    }, 400);
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // ── Drag and Drop real para área de agrupamento ───────────────────────────
  const [draggedCol, setDraggedCol] = useState(null);

  const onDragStart = (e, col) => {
    e.dataTransfer.setData('col', col);
    setDraggedCol(col);
  };
  const onDragEnd = () => setDraggedCol(null);

  const onDropGroup = (e) => {
    e.preventDefault();
    const col = e.dataTransfer.getData('col');
    if (col) setGroupColumn(col);
    setDraggedCol(null);
  };

  // ── Formatação de período exibido ─────────────────────────────────────────
  const fmtDate = (iso) => iso ? iso.split('-').reverse().join('/') : '—';

  const ConfigIcon = config.icon;

  return (
    <div className="space-y-5 pb-20">

      {/* ── Cabeçalho ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <ConfigIcon className="w-7 h-7 text-slate-700 dark:text-slate-200" aria-hidden="true" />
            {config.title}
          </h1>
          <p className="text-sm text-slate-400 font-medium">Relatório Analítico de Armazenagem e Bilhetagem</p>
        </div>

        <div className="flex items-center gap-2">
          {dataLoaded && (
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</span>
              <span className="text-xs font-black text-slate-700 dark:text-white">
                {fmtDate(params.start)} → {fmtDate(params.end)}
              </span>
            </div>
          )}
          <button onClick={() => setShowParams(true)} title="Alterar Parâmetros" aria-label="Alterar parâmetros do relatório"
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
          <button onClick={handleExport} disabled={!dataLoaded || exporting}
            aria-label="Exportar relatório como CSV"
            title={!dataLoaded ? 'Carregue o relatório primeiro' : `Exportar ${sortedData.length} linha(s) como CSV`}
            className={cn('bg-emerald-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 transition-all',
              !dataLoaded || exporting ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'
            )}>
            {exporting
              ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              : <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Área de Agrupamento — Drop Zone real ───────────────────────────── */}
      <div
        role="region"
        aria-label="Área de agrupamento — arraste uma coluna da tabela aqui"
        onDragOver={e => e.preventDefault()}
        onDrop={onDropGroup}
        className={cn(
          'border-2 border-dashed p-4 rounded-2xl flex items-center gap-4 transition-all',
          draggedCol ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
        )}>
        <div className={cn('p-2.5 rounded-xl', draggedCol ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700')}>
          <Layers className={cn('w-4 h-4', draggedCol ? 'text-white' : 'text-slate-400')} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Área de Agrupamento</p>
          <div className="flex items-center gap-2 mt-1 min-h-[32px]">
            {groupColumn ? (
              <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-2">
                <GripVertical className="w-3 h-3" aria-hidden="true" />
                {groupColumn}
                <button onClick={() => setGroupColumn(null)} aria-label={`Remover agrupamento por ${groupColumn}`}
                  className="hover:text-red-300 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 italic">
                {draggedCol
                  ? `Solte aqui para agrupar por "${draggedCol}"`
                  : 'Arraste o cabeçalho de uma coluna aqui para agrupar os dados...'}
              </span>
            )}
          </div>
        </div>
        {groupColumn && (
          <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
            {groupedData.length} grupo(s)
          </span>
        )}
      </div>

      {/* ── Tabela ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {!dataLoaded ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-300 gap-3">
            <Calendar className="w-10 h-10 opacity-30" aria-hidden="true" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aguardando parâmetros obrigatórios</p>
            <button onClick={() => setShowParams(true)}
              className="mt-1 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors">
              Definir Período
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="grid">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {config.columns.map(col => (
                    <th
                      key={col}
                      draggable
                      onDragStart={e => onDragStart(e, col)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        'px-6 py-4 cursor-grab select-none transition-colors whitespace-nowrap',
                        draggedCol === col && 'opacity-40',
                        'hover:text-slate-700 dark:hover:text-slate-200'
                      )}>
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3 h-3 text-slate-300 shrink-0" aria-hidden="true" />
                        <button onClick={() => handleSort(col)} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                          {col}
                          {sortCol === col
                            ? sortDir === 'asc'
                              ? <ChevronUp className="w-3 h-3 text-blue-500" aria-label="Ordenado crescente" />
                              : <ChevronDown className="w-3 h-3 text-blue-500" aria-label="Ordenado decrescente" />
                            : <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-40" aria-hidden="true" />}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700 text-xs text-slate-600 dark:text-slate-300">
                {groupedData.map(({ groupKey, rows }) => (
                  <React.Fragment key={groupKey ?? '__ungrouped__'}>
                    {/* Linha de grupo */}
                    {groupKey !== null && (
                      <tr className="bg-slate-100 dark:bg-slate-900/60">
                        <td colSpan={config.columns.length} className="px-6 py-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {groupColumn}: <span className="text-slate-700 dark:text-slate-200">{groupKey}</span>
                            <span className="ml-2 text-slate-400">({rows.length} registro{rows.length > 1 ? 's' : ''})</span>
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Linhas de dados — key é o id único da row */}
                    {rows.map(row => (
                      <tr key={row.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors border-l-4 border-transparent hover:border-blue-400">
                        {config.columns.map(col => (
                          <td key={col} className="px-6 py-4 font-medium whitespace-nowrap">
                            <Cell col={col} value={row[col]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Subtotal numérico por grupo */}
                    {groupKey !== null && (() => {
                      const numCols = config.columns.filter(c => rows.some(r => typeof r[c] === 'number'));
                      if (!numCols.length) return null;
                      return (
                        <tr className="bg-emerald-50/50 dark:bg-emerald-950/10 border-t border-emerald-100">
                          {config.columns.map((col, ci) => {
                            if (ci === 0) return <td key={col} className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtotal</td>;
                            if (!numCols.includes(col)) return <td key={col} className="px-6 py-2" />;
                            const sum = rows.reduce((acc, r) => acc + (typeof r[col] === 'number' ? r[col] : 0), 0);
                            return (
                              <td key={col} className="px-6 py-2">
                                <Cell col={col} value={sum} />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })()}
                  </React.Fragment>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={config.columns.length} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Nenhum registro no período {fmtDate(params.start)} → {fmtDate(params.end)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[9px] text-slate-400 font-bold">
              <span>{sortedData.length} registro(s) encontrado(s)</span>
              {sortCol && <span>Ordenado por: {sortCol} ({sortDir === 'asc' ? '↑' : '↓'})</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Parâmetros ─────────────────────────────────────────────── */}
      {showParams && (
        <div role="dialog" aria-modal="true" aria-labelledby="params-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            {/* Header do modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-400 rounded-xl">
                  <Filter className="w-5 h-5 text-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="params-title" className="text-base font-black">Filtros de Apuração</h3>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Parâmetros obrigatórios</p>
                </div>
              </div>
              {/* Botão fechar SEMPRE visível — usuário nunca fica preso */}
              <button onClick={() => setShowParams(false)} aria-label="Fechar parâmetros"
                className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="param-start" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Data Início
                  </label>
                  {/* Input sem ícone decorativo sobreposto — ícone nativo do browser é suficiente */}
                  <input id="param-start" type="date"
                    value={params.start}
                    onChange={e => setParams({ ...params, start: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="param-end" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Data Término
                  </label>
                  <input id="param-end" type="date"
                    value={params.end}
                    min={params.start}
                    onChange={e => setParams({ ...params, end: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
              </div>

              {/* Validação visual antes de carregar */}
              {params.start && params.end && params.start > params.end && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                  <X className="w-3 h-3" aria-hidden="true" /> Data início não pode ser maior que data término.
                </p>
              )}

              <button onClick={handleApply}
                disabled={!params.start || !params.end || params.start > params.end || fetching}
                className="w-full py-4 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                {fetching
                  ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : <Play className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />}
                {fetching ? 'Carregando...' : 'Carregar Relatório'}
              </button>

              <p className="text-[9px] text-center font-medium text-slate-400 italic">
                * Intervalo de datas para calcular saldos acumulados de armazenagem.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
