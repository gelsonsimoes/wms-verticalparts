import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart2,
  Search,
  Filter,
  Download,
  FileText,
  ToggleLeft,
  ToggleRight,
  Package,
  MapPin,
  Calendar,
  ChevronDown,
  X,
  TrendingUp,
  Star,
  Layers,
  Boxes,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Scissors,
} from 'lucide-react';
import { cn } from '../utils/cn';



// ─── CORES ABC ──────────────────────────────────────────────────────
const ABC_CFG = {
  A: { color: '#16a34a', light: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  label: 'Alta saída',  icon: TrendingUp },
  B: { color: '#2563eb', light: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',   label: 'Média saída', icon: Star },
  C: { color: '#9333ea', light: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Baixa saída', icon: Layers },
};

// ─── ESTADO DO PRODUTO ───────────────────────────────────────────────
const ESTADO_CFG = {
  'Bom':                 { color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',   icon: CheckCircle2, dot: 'bg-green-500' },
  'Avariado':            { color: 'text-red-700   bg-red-100   dark:bg-red-900/30   dark:text-red-400',     icon: AlertTriangle,dot: 'bg-red-500'   },
  'Desmembrado/Truncado':{ color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',   icon: Scissors,     dot: 'bg-amber-400' },
};

// ─── MOCK — CURVA ABC ─────────────────────────────────────────────
const MOCK_ABC = [
  { cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira',  local:'R1_PP1_D4', visitas:320, abc:'A' },
  { cod:'VP-FO1122-M', desc:'Filtro de Óleo Premium',        local:'R1_PP2_C2', visitas:290, abc:'A' },
  { cod:'VP-DC2210-F', desc:'Disco de Freio Ventilado',      local:'R2_PP3_D3', visitas:248, abc:'A' },
  { cod:'VP-PA1023-J', desc:'Palheta Dianteira KIT',         local:'R2_PP3_D5', visitas:185, abc:'B' },
  { cod:'VP-LB0091-A', desc:'Fluido de Freio DOT 4',         local:'R2_PP4_D1', visitas:160, abc:'B' },
  { cod:'VP-FA3311-K', desc:'Filtro de Ar Esportivo',        local:'R3_PP5_D4', visitas:140, abc:'B' },
  { cod:'VP-SF0881-R', desc:'Sensor de Farol LED',           local:'R3_PP5_D2', visitas:55,  abc:'C' },
  { cod:'VP-AM1201-B', desc:'Amortecedor Dianteiro',         local:'R1_PP1_C1', visitas:42,  abc:'C' },
  { cod:'VP-SK0099-Z', desc:'Sensor de ABS Dianteiro',       local:'R1_PP1_B3', visitas:30,  abc:'C' },
  { cod:'VP-PH9901-D', desc:'Pedaleira Esportiva',           local:'R1_PP1_A2', visitas:18,  abc:'C' },
];

const MOCK_ABC_LOCAL = [
  { local:'R1_PP1_D4', regiao:'Picking A',  visitas:540, abc:'A' },
  { local:'R1_PP2_C2', regiao:'Picking C',  visitas:480, abc:'A' },
  { local:'R2_PP3_D3', regiao:'Pulmão B',   visitas:390, abc:'A' },
  { local:'R2_PP3_D5', regiao:'Pulmão B',   visitas:260, abc:'B' },
  { local:'R2_PP4_D1', regiao:'Pulmão D',   visitas:210, abc:'B' },
  { local:'R3_PP5_D4', regiao:'Pulmão A',   visitas:180, abc:'B' },
  { local:'R3_PP5_D2', regiao:'Pulmão E',   visitas:80,  abc:'C' },
  { local:'R1_PP1_C1', regiao:'Pulmão F',   visitas:60,  abc:'C' },
  { local:'R1_PP1_B3', regiao:'Pulmão G',   visitas:45,  abc:'C' },
];

// ─── MOCK — ESTOQUE SINTÉTICO ────────────────────────────────────────
const INITIAL_ESTOQUE = [
  { id:1, cod:'VP-FR4429-X', desc:'Pastilha de Freio Dianteira',  depositante:'Atacado BR Peças',  estado:'Bom',                  local:'R1_PP1_D4', lote:'LT-0241', estoqueTotal:78,  disponivel:78  },
  { id:2, cod:'VP-DC2210-F', desc:'Disco de Freio Ventilado',      depositante:'Grupo Freios Sul',  estado:'Bloqueado',            local:'R2_PP3_D3', lote:'LT-0238', estoqueTotal:12,  disponivel:0   },
  { id:3, cod:'VP-FO1122-M', desc:'Filtro de Óleo Premium',         depositante:'Rede Filtros SP',   estado:'Bom',                  local:'R1_PP2_C2', lote:'LT-0233', estoqueTotal:40,  disponivel:40  },
  { id:4, cod:'VP-LB0091-A', desc:'Fluido de Freio DOT 4 500ml',   depositante:'Química Total',     estado:'Bom',                  local:'R2_PP4_D1', lote:'LT-0228', estoqueTotal:36,  disponivel:36  },
  { id:5, cod:'VP-FA3311-K', desc:'Filtro de Ar Esportivo',         depositante:'SportAuto Brasil',  estado:'Avariado',             local:'R3_PP5_D4', lote:'LT-0220', estoqueTotal:24,  disponivel:0   },
  { id:6, cod:'VP-PA1023-J', desc:'Palheta Dianteira KIT',          depositante:'Wiper Parts',       estado:'Bom',                  local:'R2_PP3_D5', lote:'LT-0215', estoqueTotal:48,  disponivel:48  },
  { id:7, cod:'VP-AM1201-B', desc:'Amortecedor Dianteiro',          depositante:'Shock Distribuidora',estado:'Desmembrado/Truncado', local:'R1_PP1_C1', lote:'LT-0204', estoqueTotal:8,   disponivel:5   },
  { id:8, cod:'VP-SK0099-Z', desc:'Sensor de ABS Dianteiro',        depositante:'ElectroParts',      estado:'Bom',                  local:'R1_PP1_B3', lote:'LT-0200', estoqueTotal:15,  disponivel:15  },
  { id:9, cod:'VP-SF0881-R', desc:'Sensor de Farol LED',            depositante:'LuxAuto Peças',     estado:'Avariado',             local:'R3_PP5_D2', lote:'LT-0196', estoqueTotal:5,   disponivel:0   },
  { id:10,cod:'VP-PH9901-D', desc:'Pedaleira Esportiva',            depositante:'Acessórios TOP',    estado:'Bom',                  local:'R1_PP1_A2', lote:'LT-0190', estoqueTotal:20,  disponivel:20  },
];

// ─── GRÁFICO DE ROSCA SVG PURO ───────────────────────────────────────
function DonutChart({ data, label }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 100, cy = 100, r = 75, stroke = 30;
  const circumference = 2 * Math.PI * r;

  const chartData = data.reduce(({ items, acc }, d) => {
    const pct    = d.value / total;
    const dash   = circumference * pct;
    const gap    = circumference - dash;
    const offset = circumference * (1 - acc) - circumference * 0.25;
    return { items: [...items, { ...d, dash, gap, offset, pct }], acc: acc + pct };
  }, { items: [], acc: 0 }).items;

  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-52 h-52 drop-shadow-xl">
        {/* fundo */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-slate-800" />

        {chartData.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color}
            strokeWidth={hovered === i ? stroke + 6 : stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-width 0.2s', cursor: 'pointer', filter: hovered === i ? `drop-shadow(0 0 6px ${s.color}88)` : 'none' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Centro */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="900" fill="currentColor" className="text-slate-800 dark:text-white">
          {hovered !== null ? `${Math.round(chartData[hovered].pct * 100)}%` : total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="700">
          {hovered !== null ? chartData[hovered].label : label}
        </text>
      </svg>

      {/* Legenda */}
      <div className="flex gap-4 mt-2">
        {chartData.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 cursor-pointer" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <div>
              <p className="text-[9px] font-black text-slate-700 dark:text-slate-300">{s.label}</p>
              <p className="text-[8px] text-slate-400">{s.value} · {Math.round(s.pct * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXPORTAR CSV ──────────────────────────────────────────────────
function exportCSV(rows, filename, headers, mapper) {
  const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => mapper(r).join(';'))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── ABA 1: CURVA ABC DE VISITAÇÃO ───────────────────────────────────
function CurvaABC() {
  const [mes,      setMes]      = useState('2026-02');
  const [visaoProd,setVisaoProd]= useState(true); // true=produto, false=local
  const [busca,    setBusca]    = useState('');
  const [pdfMsg,   setPdfMsg]   = useState(false);

  const rawData = visaoProd ? MOCK_ABC : MOCK_ABC_LOCAL;
  const filtered = useMemo(() => rawData.filter(item => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    if (visaoProd) return item.cod.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    return item.local.toLowerCase().includes(q) || item.regiao.toLowerCase().includes(q);
  }), [rawData, busca, visaoProd]);

  const kpiTotals = { A: 0, B: 0, C: 0 };
  filtered.forEach(r => { kpiTotals[r.abc] = (kpiTotals[r.abc] || 0) + 1; });

  const donutData = ['A','B','C'].map(k => ({
    label: `Curva ${k} — ${ABC_CFG[k].label}`,
    value: kpiTotals[k] || 0,
    color: ABC_CFG[k].color,
  }));

  const handlePDF = () => {
    setPdfMsg(true);
    exportCSV(
      filtered, 'curva_abc.xls',
      visaoProd ? ['Código','Descrição','Local','Qtde Visitas','Classificação ABC'] : ['Local','Região','Qtde Visitas','Classificação ABC'],
      visaoProd ? r => [r.cod, r.desc, r.local, r.visitas, r.abc] : r => [r.local, r.regiao, r.visitas, r.abc]
    );
    setTimeout(() => setPdfMsg(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
        </div>

        {/* Toggle visão */}
        <button onClick={() => { setVisaoProd(v => !v); setBusca(''); }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-400 hover:border-secondary transition-all">
          {visaoProd ? <><Package className="w-3.5 h-3.5" />Visão por Produto<ToggleLeft className="w-4 h-4 text-slate-400" /></> : <><MapPin className="w-3.5 h-3.5" />Visão por Local<ToggleRight className="w-4 h-4 text-secondary" /></>}
        </button>

        <div className="relative flex items-center">
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder={visaoProd ? 'Produto ou código...' : 'Endereço ou região...'}
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-52" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" />
        </div>

        <button onClick={handlePDF}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md uppercase tracking-wider">
          <Download className="w-3.5 h-3.5" />Gerar Relatório (Excel)
        </button>
        {pdfMsg && <span className="text-[10px] text-green-600 font-black animate-pulse">✓ Download iniciado!</span>}
      </div>

      {/* KPIs + Donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribuição ABC</p>
          <DonutChart data={donutData} label={visaoProd ? 'SKUs' : 'Locais'} />
        </div>

        {/* KPIs laterais */}
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          {['A','B','C'].map(k => {
            const cfg = ABC_CFG[k];
            const Icon = cfg.icon;
            const count = kpiTotals[k] || 0;
            const total = Object.values(kpiTotals).reduce((s, v) => s + v, 0);
            const items = filtered.filter(r => r.abc === k);
            const totalVisits = items.reduce((s, r) => s + r.visitas, 0);
            return (
              <div key={k} className="bg-white dark:bg-slate-900 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 p-4 shadow-sm flex flex-col items-center text-center col-span-1">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: cfg.color + '20', border: `2px solid ${cfg.color}` }}>
                  <span className="text-xl font-black" style={{ color: cfg.color }}>{k}</span>
                </div>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{count}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{visaoProd ? 'SKUs' : 'Locais'}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">{cfg.label}</p>
                <p className="text-[9px] text-slate-400 mt-1">{totalVisits.toLocaleString('pt-BR')} visitas</p>
                <div className="w-full mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: cfg.color }} />
                </div>
                <p className="text-[8px] text-slate-400 mt-0.5">{total > 0 ? Math.round((count / total) * 100) : 0}% do mix</p>
              </div>
            );
          })}

          {/* Resumo da visão */}
          <div className="col-span-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Visão: {visaoProd ? 'Por Produto' : 'Por Local'} · {mes}</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xl font-black text-slate-800 dark:text-white">{filtered.reduce((s, r) => s + r.visitas, 0).toLocaleString('pt-BR')}</p>
                <p className="text-[9px] text-slate-400">Total de Visitas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-800 dark:text-white">{filtered.length}</p>
                <p className="text-[9px] text-slate-400">Itens no filtro</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-green-600">{Math.round((filtered.filter(r => r.abc === 'A').reduce((s, r) => s + r.visitas, 0) / Math.max(filtered.reduce((s, r) => s + r.visitas, 0), 1)) * 100)}%</p>
                <p className="text-[9px] text-slate-400">Giro Curva A</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {(visaoProd
                ? ['Código Produto', 'Descrição', 'Local', 'Qtde Visitas', 'Classificação ABC']
                : ['Local / Endereço', 'Região', 'Qtde Visitas', 'Classificação ABC']
              ).map(h => <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const cfg = ABC_CFG[item.abc];
              const Icon = cfg.icon;
              return (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-l-4" style={{ borderLeftColor: item.abc === 'A' ? '#16a34a' : item.abc === 'B' ? '#2563eb' : '#9333ea' }}>
                  {visaoProd ? (
                    <>
                      <td className="p-3"><code className="text-xs font-black text-secondary">{item.cod}</code></td>
                      <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-400">{item.desc}</td>
                      <td className="p-3"><code className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{item.local}</code></td>
                    </>
                  ) : (
                    <>
                      <td className="p-3"><code className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{item.local}</code></td>
                      <td className="p-3 text-xs font-medium text-slate-500">{item.regiao}</td>
                    </>
                  )}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-sm font-black tabular-nums text-slate-800 dark:text-white">{item.visitas.toLocaleString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', cfg.light)}>
                      <Icon className="w-3 h-3" /> Curva {item.abc} — {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-xs">Nenhum resultado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ABA 2: ESTOQUE SINTÉTICO ─────────────────────────────────────
function EstoqueSintetico() {
  const [estoqueData, setEstoqueData] = useState(INITIAL_ESTOQUE);
  const [buscaDep,    setBuscaDep]    = useState('');
  const [buscaProd,   setBuscaProd]   = useState('');
  const [filterEstado,setFilterEstado]= useState('Todos');
  const [pdfMsg,      setPdfMsg]      = useState(false);

  const filtered = useMemo(() => estoqueData.filter(r => {
    if (filterEstado !== 'Todos' && r.estado !== filterEstado) return false;
    if (buscaDep  && !r.depositante.toLowerCase().includes(buscaDep.toLowerCase()))  return false;
    if (buscaProd && !r.cod.toLowerCase().includes(buscaProd.toLowerCase()) && !r.desc.toLowerCase().includes(buscaProd.toLowerCase())) return false;
    return true;
  }), [estoqueData, filterEstado, buscaDep, buscaProd]);

  const kpiTotal = estoqueData.reduce((s, r) => s + r.estoqueTotal, 0);
  const kpiDisp  = estoqueData.reduce((s, r) => s + r.disponivel, 0);
  const kpiAvar  = estoqueData.filter(r => r.estado === 'Avariado').length;

  const handleChangeEstado = (id, novoEstado) => {
    setEstoqueData(prev => prev.map(r => r.id === id
      ? { ...r, estado: novoEstado, disponivel: novoEstado === 'Avariado' ? 0 : r.estoqueTotal }
      : r
    ));
  };

  const handleExport = () => {
    setPdfMsg(true);
    exportCSV(
      filtered, 'estoque_sintetico.xls',
      ['Código','Descrição','Depositante','Estado','Local','Lote','Estoque Total','Disponível'],
      r => [r.cod, r.desc, r.depositante, r.estado, r.local, r.lote, r.estoqueTotal, r.disponivel]
    );
    setTimeout(() => setPdfMsg(false), 3000);
  };



  return (
    <div className="space-y-4">
      {/* KPI bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'Estoque Total',       v: kpiTotal, icon: Boxes,         c: 'text-secondary', bg: 'from-slate-700 to-slate-800' },
          { l: 'Qtde Disponível',     v: kpiDisp,  icon: CheckCircle2,  c: 'text-white',     bg: 'from-emerald-700 to-emerald-600' },
          { l: 'Itens com Avaria',    v: kpiAvar,  icon: AlertTriangle, c: 'text-white',     bg: 'from-red-700 to-red-600' },
        ].map(k => (
          <div key={k.l} className={cn('rounded-2xl bg-gradient-to-br p-4 flex items-center gap-4 shadow-md', k.bg)}>
            <k.icon className={cn('w-8 h-8 shrink-0', k.c)} />
            <div>
              <p className="text-2xl font-black text-white">{k.v.toLocaleString('pt-BR')}</p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{k.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="relative flex items-center">
          <input value={buscaDep} onChange={e => setBuscaDep(e.target.value)} placeholder="Depositante..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-44" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" />
        </div>
        <div className="relative flex items-center">
          <input value={buscaProd} onChange={e => setBuscaProd(e.target.value)} placeholder="Produto ou código..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-44" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" />
        </div>
        <div className="flex gap-1.5">
          {['Todos','Bom','Avariado','Desmembrado/Truncado'].map(s => (
            <button key={s} onClick={() => setFilterEstado(s)}
              className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all',
                filterEstado === s ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}>{s === 'Desmembrado/Truncado' ? 'Desmembrado' : s}</button>
          ))}
        </div>

        <button onClick={handleExport}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />Gerar Relatório (Excel)
        </button>
        {pdfMsg && <span className="text-[10px] text-green-600 font-black animate-pulse">✓ Download iniciado!</span>}
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['Cód. Produto','Descrição','Depositante','Estado','Local','Lote','Estoque Total','Qtde Disponível'].map(h => (
                <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const estCfg = ESTADO_CFG[row.estado] || ESTADO_CFG['Bom'];
              return (
                <tr key={row.id}
                  className={cn('border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-l-4',
                    row.estado === 'Avariado'             ? 'border-l-red-500   bg-red-50/20   dark:bg-red-950/10'
                    : row.estado === 'Desmembrado/Truncado' ? 'border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-l-transparent'
                  )}>
                  <td className="p-3"><code className="text-xs font-black text-secondary">{row.cod}</code></td>
                  <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[180px]"><span className="truncate block">{row.desc}</span></td>
                  <td className="p-3 text-xs font-medium text-slate-500 whitespace-nowrap">{row.depositante}</td>
                  <td className="p-3">
                    {/* Dropdown de estado por linha */}
                    <div className="relative">
                      <select value={row.estado} onChange={e => handleChangeEstado(row.id, e.target.value)}
                        className={cn('appearance-none pr-6 pl-2.5 py-1.5 rounded-xl text-[10px] font-black border-2 outline-none cursor-pointer transition-all', estCfg.color, 'border-current/20')}>
                        {Object.keys(ESTADO_CFG).map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="p-3"><code className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{row.local}</code></td>
                  <td className="p-3"><code className="text-[10px] font-black text-purple-600">{row.lote}</code></td>
                  <td className="p-3 text-center">
                    <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{row.estoqueTotal}</span>
                    <span className="text-[9px] text-slate-400 ml-1">un.</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn('text-sm font-black tabular-nums', row.disponivel === 0 ? 'text-red-600' : 'text-green-600')}>{row.disponivel}</span>
                    <span className="text-[9px] text-slate-400 ml-1">un.</span>
                    {row.disponivel < row.estoqueTotal && row.disponivel > 0 && (
                      <span className="block text-[8px] text-amber-500 font-bold">{row.estoqueTotal - row.disponivel} bloqueado</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-xs">Nenhum resultado com os filtros aplicados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function StockAnalysis({ initialTab = 0 }) {
  const [tab, setTab] = useState(initialTab);
  const TABS = [
    { label: 'Curva ABC de Visitação', icon: PieIcon,   desc: 'Classificação A · B · C de giro e visitas' },
    { label: 'Estoque Sintético',       icon: BarChart2, desc: 'Por estado: Bom · Avariado · Desmembrado' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-blue-500 to-purple-600" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-700 flex items-center justify-center shadow-lg">
            <PieIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 7 — Consultas, Relatórios e Faturamento</p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Análise de Estoque e Curva ABC</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Distribuição inteligente de produtos · Posição do estoque físico · Exportação analítica</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-2 shadow-sm flex gap-2">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={cn('flex-1 flex items-center gap-3 px-5 py-3 rounded-xl transition-all',
              tab === i
                ? i === 0
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg scale-[1.01]'
                  : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg scale-[1.01]'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}>
            <t.icon className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wide">{t.label}</p>
              <p className={cn('text-[9px] font-medium', tab === i ? 'text-white/60' : 'text-slate-400')}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === 0 && <CurvaABC />}
      {tab === 1 && <EstoqueSintetico />}
    </div>
  );
}
