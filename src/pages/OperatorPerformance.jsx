import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart2,
  Clock,
  Package,
  CheckSquare,
  Search,
  Filter,
  Download,
  ChevronDown,
  Calendar,
  User,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  X,
  AlertTriangle,
  Award,
  Timer,
  Boxes,
  Activity,
} from 'lucide-react';
import { cn } from '../utils/cn';



// ─── TIPOS DE ATIVIDADE ──────────────────────────────────────────────
const TIPOS = ['Todos', 'Alocação', 'Separação de Onda', 'Conferência de Entrada', 'Conferência de Saída', 'Packing'];

// ─── CORES DE AVATAR ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-rose-500',  'bg-amber-500',  'bg-cyan-500',
  'bg-indigo-500','bg-teal-500',
];
// Hash determinístico do nome → cor sempre consistente independente da ordem de renderização
function avatarIdx(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return Math.abs(hash) % AVATAR_COLORS.length;
}
function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

// ─── MOCK DATA ────────────────────────────────────────────────────────
// Gera registros realistas: tempoTotal em segundos
const RAW = [
  // Separação de Onda
  { id:'R01', operador:'João Silva',     data:'20/02/2026', hIni:'08:10', hFim:'09:02', tempo:3120, volumes:22, itens:38, tipo:'Separação de Onda' },
  { id:'R02', operador:'Carla Matos',    data:'20/02/2026', hIni:'08:15', hFim:'09:42', tempo:5220, volumes:18, itens:30, tipo:'Separação de Onda' },
  { id:'R03', operador:'Pedro Ferreira', data:'20/02/2026', hIni:'08:00', hFim:'08:40', tempo:2400, volumes:28, itens:52, tipo:'Separação de Onda' },
  { id:'R04', operador:'João Silva',     data:'21/02/2026', hIni:'09:00', hFim:'10:10', tempo:4200, volumes:20, itens:36, tipo:'Separação de Onda' },
  { id:'R05', operador:'Ana Lúcia',      data:'21/02/2026', hIni:'09:30', hFim:'11:45', tempo:8100, volumes:15, itens:25, tipo:'Separação de Onda' },
  { id:'R06', operador:'Marcos Paulo',   data:'22/02/2026', hIni:'07:45', hFim:'08:30', tempo:2700, volumes:30, itens:60, tipo:'Separação de Onda' },
  // Packing
  { id:'P01', operador:'Fernanda Reis',  data:'20/02/2026', hIni:'06:30', hFim:'08:58', tempo:8880, volumes:28, itens:28, tipo:'Packing' },
  { id:'P02', operador:'Roberto Lins',   data:'20/02/2026', hIni:'07:00', hFim:'08:20', tempo:4800, volumes:20, itens:20, tipo:'Packing' },
  { id:'P03', operador:'Sílvia Cunha',   data:'21/02/2026', hIni:'07:15', hFim:'09:30', tempo:8100, volumes:24, itens:24, tipo:'Packing' },
  { id:'P04', operador:'Carla Matos',    data:'22/02/2026', hIni:'08:00', hFim:'09:00', tempo:3600, volumes:32, itens:32, tipo:'Packing' },
  // Conferência de Entrada
  { id:'C01', operador:'Pedro Ferreira', data:'20/02/2026', hIni:'10:00', hFim:'11:10', tempo:4200, volumes:40, itens:80, tipo:'Conferência de Entrada' },
  { id:'C02', operador:'Ana Lúcia',      data:'20/02/2026', hIni:'10:30', hFim:'13:00', tempo:9000, volumes:35, itens:60, tipo:'Conferência de Entrada' },
  { id:'C03', operador:'João Silva',     data:'21/02/2026', hIni:'11:00', hFim:'11:50', tempo:3000, volumes:45, itens:90, tipo:'Conferência de Entrada' },
  // Conferência de Saída
  { id:'S01', operador:'Marcos Paulo',   data:'21/02/2026', hIni:'14:00', hFim:'14:45', tempo:2700, volumes:18, itens:36, tipo:'Conferência de Saída' },
  { id:'S02', operador:'Roberto Lins',   data:'22/02/2026', hIni:'15:00', hFim:'16:40', tempo:6000, volumes:12, itens:24, tipo:'Conferência de Saída' },
  // Alocação
  { id:'A01', operador:'Sílvia Cunha',   data:'20/02/2026', hIni:'13:00', hFim:'13:45', tempo:2700, volumes:50, itens:50, tipo:'Alocação' },
  { id:'A02', operador:'Fernanda Reis',  data:'21/02/2026', hIni:'14:00', hFim:'15:20', tempo:4800, volumes:40, itens:40, tipo:'Alocação' },
  { id:'A03', operador:'Pedro Ferreira', data:'22/02/2026', hIni:'13:30', hFim:'14:00', tempo:1800, volumes:60, itens:60, tipo:'Alocação' },
];

function fmtTempo(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`;
  return `${m}m ${ss.toString().padStart(2,'0')}s`;
}

function exportCSV(data, filename) {
  const headers = ['Operador','Data','Hora Início','Hora Fim','Tipo','Tempo (s)','Tempo Formatado','Volumes','Itens'];
  const rows = [headers.join(';'), ...data.map(r =>
    [r.operador, r.data, r.hIni, r.hFim, r.tipo, r.tempo, fmtTempo(r.tempo), r.volumes, r.itens].join(';')
  )];
  const csv = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── HOOK DE ORDENAÇÃO ───────────────────────────────────────────────────────
function useSort(data) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const toggle = useCallback((k) => {
    setSortKey(prev => {
      if (prev === k) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return k; }
      setSortDir('asc'); return k;
    });
  }, []);

  const sorted = useMemo(() => {
    if (!sortKey) return [...data];
    return [...data].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, toggle, sortKey, sortDir };
}

const SortIcon = ({ sortKey, sortDir, k }) => {
  if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-30 ml-1 inline" />;
  return sortDir === 'asc'
    ? <TrendingUp className="w-3 h-3 text-secondary ml-1 inline" />
    : <TrendingDown className="w-3 h-3 text-secondary ml-1 inline" />;
};

const ThBtn = ({ k, label, sortKey, sortDir, toggle }) => {
  const sorted_ = sortKey === k ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <th
      scope="col"
      aria-sort={sorted_}
      className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-secondary transition-colors"
      onClick={() => toggle(k)}
    >
      {label}<SortIcon sortKey={sortKey} sortDir={sortDir} k={k} />
    </th>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────
export default function OperatorPerformance() {
  const [dataIni,   setDataIni]   = useState('2026-02-20');
  const [dataFim,   setDataFim]   = useState('2026-02-22');
  const [busca,     setBusca]     = useState('');
  const [tipoAtiv,  setTipoAtiv]  = useState('Todos');
  const [showAll,   setShowAll]   = useState(false);

  // ── Filtros (inclui filtragem por data: converte dd/mm/aaaa → yyyy-mm-dd para comparação) ──
  const filtered = useMemo(() => RAW.filter(r => {
    if (tipoAtiv !== 'Todos' && r.tipo !== tipoAtiv) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!r.operador.toLowerCase().includes(q)) return false;
    }
    // Converte data do registro de "dd/mm/aaaa" para "aaaa-mm-dd" para comparação ISO
    const dataISO = r.data.split('/').reverse().join('-');
    if (dataIni && dataISO < dataIni) return false;
    if (dataFim && dataISO > dataFim) return false;
    return true;
  }), [tipoAtiv, busca, dataIni, dataFim]);

  // ── Média de tempo por tipo ──
  const mediaTempos = useMemo(() => {
    const grupos = {};
    filtered.forEach(r => {
      if (!grupos[r.tipo]) grupos[r.tipo] = { soma: 0, n: 0 };
      grupos[r.tipo].soma += r.tempo; grupos[r.tipo].n++;
    });
    const out = {};
    Object.entries(grupos).forEach(([k, v]) => { out[k] = v.soma / v.n; });
    return out;
  }, [filtered]);

  const globalMedia = filtered.length ? filtered.reduce((s, r) => s + r.tempo, 0) / filtered.length : 0;
  const VERDE_THRESH   = 0.85; // abaixo de 85% da média → verde
  const LARANJA_THRESH = 1.25; // acima de 125% da média → laranja
  const VERMELHO_THRESH= 1.6;  // acima de 160% → vermelho

  function rowColor(row) {
    const media = mediaTempos[row.tipo] || globalMedia;
    const ratio = row.tempo / media;
    if (ratio <= VERDE_THRESH)    return 'green';
    if (ratio >= VERMELHO_THRESH) return 'red';
    if (ratio >= LARANJA_THRESH)  return 'orange';
    return 'neutral';
  }
  function rowColorClass(c) {
    if (c === 'green')   return 'bg-green-50  dark:bg-green-950/20  border-l-green-500';
    if (c === 'orange')  return 'bg-amber-50  dark:bg-amber-950/20  border-l-amber-500';
    if (c === 'red')     return 'bg-red-50    dark:bg-red-950/20    border-l-red-500';
    return 'border-l-transparent';
  }

  // ── Ranking por operador ──
  const ranking = useMemo(() => {
    const mp = {};
    filtered.forEach(r => {
      if (!mp[r.operador]) mp[r.operador] = { nome: r.operador, tarefas: 0, tempoTotal: 0, volumes: 0, itens: 0 };
      mp[r.operador].tarefas++;
      mp[r.operador].tempoTotal += r.tempo;
      mp[r.operador].volumes    += r.volumes;
      mp[r.operador].itens      += r.itens;
    });
    return Object.values(mp).map(o => ({ ...o, tempoMedio: o.tempoTotal / o.tarefas }))
      .sort((a, b) => a.tempoMedio - b.tempoMedio);
  }, [filtered]);

  // KPIs
  const kpiTarefas  = filtered.length;
  const kpiTempoMed = globalMedia;
  const kpiVolumes  = filtered.reduce((s, r) => s + r.volumes, 0);

  const { sorted, toggle, sortKey, sortDir } = useSort(filtered);



  const displayRows = showAll ? sorted : sorted.slice(0, 15);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-secondary to-violet-600" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-700 flex items-center justify-center shadow-lg shrink-0">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 7 — Consultas, Relatórios e Faturamento</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">8.3 Performance e Produtividade dos Operadores</h1>
            <p className="text-xs text-slate-400 font-medium">Dashboard de RH/Logística · Tempo médio · Volumes · Comparativo entre operadores</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-96px)]">

        {/* ══════ PAINEL LATERAL DE FILTROS ══════ */}
        <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col p-5 gap-5 overflow-y-auto">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5"><Filter className="w-3 h-3" />Filtros</p>

            {/* Período */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="data-inicio" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />Data Início
                </label>
                <input id="data-inicio" type="date" value={dataIni} onChange={e => setDataIni(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-violet-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label htmlFor="data-fim" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />Data Fim
                </label>
                <input id="data-fim" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-violet-500 transition-all" />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Busca operador */}
          <div className="space-y-1">
            <label htmlFor="busca-operador" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <User className="w-3 h-3" aria-hidden="true" />Usuário / Operador
            </label>
            <div className="relative">
              <input id="busca-operador" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome..."
                className="w-full pr-8 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-violet-500 transition-all" />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca de operador"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Tipo de atividade */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity className="w-3 h-3" />Tipo de Atividade</label>
            <div className="space-y-1">
              {TIPOS.map(t => (
                <button key={t} onClick={() => setTipoAtiv(t)}
                  className={cn('w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all',
                    tipoAtiv === t
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Legenda de cores */}
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda de Performance</p>
            {[
              { c: 'bg-green-200 dark:bg-green-800',  l: `< ${Math.round(VERDE_THRESH*100)}% da média`, label: 'Acima da média' },
              { c: 'bg-slate-100 dark:bg-slate-800',  l: 'dentro da média',          label: 'Normal' },
              { c: 'bg-amber-200 dark:bg-amber-900/50', l: `> ${Math.round(LARANJA_THRESH*100)}% da média`, label: 'Lentidão' },
              { c: 'bg-red-200 dark:bg-red-900/50',   l: `> ${Math.round(VERMELHO_THRESH*100)}% da média`, label: 'Crítico' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded shrink-0', l.c)} />
                <div>
                  <p className="text-[9px] font-black text-slate-600 dark:text-slate-400">{l.label}</p>
                  <p className="text-[8px] text-slate-400">{l.l}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botão limpar */}
          <button onClick={() => { setBusca(''); setTipoAtiv('Todos'); }}
            className="w-full py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </aside>

        {/* ══════ ÁREA CENTRAL ══════ */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Tarefas Realizadas', value: kpiTarefas, unit: 'tarefas',
                icon: CheckSquare, color: 'from-violet-600 to-violet-700',
                sub: `${new Set(filtered.map(r => r.operador)).size} operadores`,
              },
              {
                label: 'Tempo Médio por Tarefa', value: fmtTempo(Math.round(kpiTempoMed)), unit: '',
                icon: Timer, color: 'from-blue-600 to-blue-700',
                sub: `${filtered.length > 0 ? Math.round(kpiTempoMed) : 0}s brutos`,
              },
              {
                label: 'Volumes Movimentados', value: kpiVolumes.toLocaleString('pt-BR'), unit: 'vols.',
                icon: Boxes, color: 'from-emerald-600 to-emerald-700',
                sub: `${filtered.reduce((s, r) => s + r.itens, 0)} itens (peças)`,
              },
            ].map(k => (
              <div key={k.label} className={cn('rounded-[24px] bg-gradient-to-br text-white p-5 shadow-lg', k.color)}>
                <div className="flex items-start justify-between mb-3">
                  <k.icon className="w-6 h-6 text-white/80" aria-hidden="true" />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest text-right">{k.label}</span>
                </div>
                <p className="text-3xl font-black">{k.value} <span className="text-base font-bold opacity-60">{k.unit}</span></p>
                <p className="text-[10px] text-white/60 font-medium mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* MINI RANKING ─ top operadores */}
          {ranking.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Ranking dos Operadores (pelo Menor Tempo Médio)
                </p>
                <p className="text-[9px] font-bold text-slate-400">{tipoAtiv === 'Todos' ? 'Todas as atividades' : tipoAtiv}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {ranking.map((op, i) => {
                  const ratio = globalMedia > 0 ? op.tempoMedio / globalMedia : 1;
                  const isTop  = i === 0;
                  const perfColor = ratio <= VERDE_THRESH ? 'text-green-600' : ratio >= VERMELHO_THRESH ? 'text-red-600' : ratio >= LARANJA_THRESH ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300';
                  return (
                    <div key={op.nome} className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all',
                      isTop ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30'
                    )}>
                      <div className="relative">
                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-white', AVATAR_COLORS[avatarIdx(op.nome)])}>{initials(op.nome)}</div>
                        {isTop && <div className="absolute -top-1.5 -right-1.5 text-xs">🏆</div>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">{op.nome.split(' ')[0]}</p>
                        <p className={cn('text-sm font-black', perfColor)}>{fmtTempo(Math.round(op.tempoMedio))}</p>
                        <p className="text-[8px] text-slate-400">{op.tarefas} tarefa{op.tarefas > 1 ? 's' : ''} · {op.volumes} vols.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRID DINÂMICO */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Toolbar do grid */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Grade de Dados
                </p>
                <span className="text-[9px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-black px-2 py-0.5 rounded-full">{tipoAtiv}</span>
                <span className="text-[9px] text-slate-400 font-bold">{sorted.length} registros</span>
              </div>
              <button onClick={() => exportCSV(sorted, 'performance_operadores.xls')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md uppercase tracking-wider">
                <Download className="w-3.5 h-3.5" />Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <ThBtn k="operador" label="Nome do Usuário" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="data"     label="Data" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="hIni"     label="Hora Início" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="hFim"     label="Hora Fim" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="tempo"    label="Tempo Total" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="volumes"  label="Qtde Volumes" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <ThBtn k="itens"    label="Qtde Itens" sortKey={sortKey} sortDir={sortDir} toggle={toggle} />
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 && (
                    <tr><td colSpan={10} className="p-10 text-center text-slate-400 text-xs font-medium">Nenhum registro encontrado com os filtros.</td></tr>
                  )}
                  {displayRows.map((row, idx) => {
                    const color  = rowColor(row);
                    const media  = mediaTempos[row.tipo] || globalMedia;
                    const ratio  = media > 0 ? row.tempo / media : 1;
                    const perfLabel = color === 'green'   ? 'Excelente'
                                    : color === 'orange'  ? 'Lentidão'
                                    : color === 'red'     ? 'Crítico'
                                    : 'Normal';
                    const PerfIcon = color === 'green'  ? Zap
                                   : color === 'orange' ? AlertTriangle
                                   : color === 'red'    ? TrendingDown
                                   : Minus;
                    const perfTextColor = color === 'green'  ? 'text-green-600'
                                        : color === 'orange' ? 'text-amber-600'
                                        : color === 'red'    ? 'text-red-600'
                                        : 'text-slate-400';
                    return (
                      <tr key={row.id}
                        className={cn('border-t border-slate-100 dark:border-slate-800 hover:brightness-95 dark:hover:brightness-110 transition-all border-l-4', rowColorClass(color))}>
                        <td className="p-3 text-[10px] font-black text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0', AVATAR_COLORS[avatarIdx(row.operador)])}>
                              {initials(row.operador)}
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.operador}</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs font-bold text-slate-500 whitespace-nowrap">{row.data}</td>
                        <td className="p-3 text-xs font-bold text-slate-600 dark:text-slate-400">{row.hIni}</td>
                        <td className="p-3 text-xs font-bold text-slate-600 dark:text-slate-400">{row.hFim}</td>
                        <td className="p-3">
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white">{fmtTempo(row.tempo)}</p>
                            <p className="text-[9px] text-slate-400">{row.tempo}s</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{row.volumes}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{row.itens}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg whitespace-nowrap">{row.tipo}</span>
                        </td>
                        <td className="p-3">
                          <div className={cn('flex items-center gap-1.5', perfTextColor)}>
                            <PerfIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-[10px] font-black">{perfLabel}</p>
                              <p className="text-[9px] opacity-70">{ratio <= 1 ? `${Math.round((1-ratio)*100)}% mais rápido` : `${Math.round((ratio-1)*100)}% mais lento`}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sorted.length > 15 && (
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  Exibindo {displayRows.length} de {sorted.length} registros
                </span>
                <button onClick={() => setShowAll(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-black text-violet-600 hover:text-violet-800 transition-colors">
                  {showAll ? 'Ver menos' : `Ver todos (${sorted.length})`}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAll && 'rotate-180')} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
