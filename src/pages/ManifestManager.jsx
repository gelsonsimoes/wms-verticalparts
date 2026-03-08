import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Truck,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  Scale,
  Layers,
  ClipboardList,
  ArrowRight,
  BadgeCheck,
  TriangleAlert,
  Hash,
  Weight,
  Box,
  Building2,
  Clock,
  Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ===== DADOS MOCK =====
const COLETAS = [
  {
    id: 'COL-2026-0041',
    onda: 'WV-2026-014',
    placa: 'ABC-1D23',
    doca: 'DOCA-02',
    pesoTotal: 3248.5,
    cubagem: 12.4,
    status: 'Aguardando Pesagem',
    pesagemOk: false,
    transportadora: 'TBM Logística',
    nfs: [
      { numero: '001.245', destinatario: 'Cliente MG Ltda',       valor: 12500.00, volumes: 4, peso: 980.0 },
      { numero: '001.246', destinatario: 'Distribuidora Sul S/A', valor:  8700.00, volumes: 2, peso: 1248.5 },
      { numero: '001.247', destinatario: 'Auto Peças Nortão',     valor:  3200.00, volumes: 1, peso: 1020.0 },
    ],
  },
  {
    id: 'COL-2026-0042',
    onda: 'WV-2026-015',
    placa: 'DEF-4E56',
    doca: 'DOCA-01',
    pesoTotal: 1820.0,
    cubagem: 6.8,
    status: 'Carregamento OK',
    pesagemOk: true,
    transportadora: 'Rápido São Paulo',
    nfs: [
      { numero: '001.248', destinatario: 'Mega Auto Centro-Oeste', valor: 21000.00, volumes: 8, peso: 1820.0 },
    ],
  },
  {
    id: 'COL-2026-0043',
    onda: 'WV-2026-013',
    placa: 'GHI-7F89',
    doca: 'DOCA-04',
    pesoTotal: 5100.0,
    cubagem: 19.7,
    status: 'Aguardando Pesagem',
    pesagemOk: false,
    transportadora: 'VPC Express',
    nfs: [
      { numero: '001.240', destinatario: 'Rede Peças SP',         valor: 44200.00, volumes: 16, peso: 3200.0 },
      { numero: '001.241', destinatario: 'Grupo Freios Brasil',   valor: 19800.00, volumes:  7, peso: 1900.0 },
    ],
  },
];

const MANIFESTOS = [
  { id: 'MDF-2026-0128', coleta: 'COL-2026-0038', placa: 'STU-5L67', doca: 'DOCA-03', emissao: '22/02/2026 07:45', transportadora: 'JSL Logística', pesoTotal: 4200.0, nfs: 3, status: 'Emitido' },
  { id: 'MDF-2026-0127', coleta: 'COL-2026-0037', placa: 'MNO-5H67', doca: 'DOCA-01', emissao: '21/02/2026 16:20', transportadora: 'Tegma',          pesoTotal: 1850.0, nfs: 1, status: 'Emitido' },
  { id: 'MDF-2026-0126', coleta: 'COL-2026-0035', placa: 'PQR-1K34', doca: 'DOCA-02', emissao: '21/02/2026 14:10', transportadora: 'TBM Logística',  pesoTotal: 6700.0, nfs: 5, status: 'Cancelado' },
];

const STATUS_BADGE = {
  'Aguardando Pesagem': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Carregamento OK':    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Processado':         'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-300',
  'Emitido':            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Cancelado':          'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-300',
};

// ===== MODAL NFs =====
function NFModal({ coleta, onClose }) {
  const totalNFs = coleta.nfs.reduce(
    (a, n) => ({ valor: a.valor + n.valor, volumes: a.volumes + n.volumes, peso: a.peso + n.peso }),
    { valor: 0, volumes: 0, peso: 0 }
  );
  const closeBtnRef = useRef(null);
  const titleId = 'nf-modal-title';

  // Foca o botão fechar ao abrir; fecha com Escape
  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Coleta {coleta.id}</p>
              <h2 id={titleId} className="text-base font-black text-primary uppercase">Notas Fiscais Vinculadas</h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Fechar modal de notas fiscais"
            className="text-primary/50 hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cabeçalho da coleta */}
        <div className="px-7 pt-5 pb-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-4 text-xs">
            {[
              { label: 'Placa',          value: coleta.placa },
              { label: 'Transportadora', value: coleta.transportadora },
              { label: 'Doca',           value: coleta.doca },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{f.label}</p>
                <p className="font-black text-slate-900 dark:text-white">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                {['Nº NF', 'Destinatário', 'Volumes', 'Peso (Kg)', 'Valor (R$)'].map(h => (
                  <th key={h} scope="col" className="p-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coleta.nfs.map(nf => (
                <tr key={nf.numero} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4"><code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/10 rounded-lg">{nf.numero}</code></td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{nf.destinatario}</td>
                  <td className="p-4 text-center text-xs font-black text-slate-700 dark:text-slate-300">{nf.volumes}</td>
                  <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{nf.peso.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                  <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">
                    {nf.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-secondary/5">
                <td className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest" colSpan={2}>Totais ({coleta.nfs.length} NFs)</td>
                <td className="p-4 text-center text-sm font-black text-secondary">{totalNFs.volumes}</td>
                <td className="p-4 text-sm font-black text-secondary tabular-nums">{totalNFs.peso.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                <td className="p-4 text-sm font-black text-secondary tabular-nums">
                  {totalNFs.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL BLOQUEIO — PESAGEM PENDENTE =====
function WeighingBlockModal({ coleta, onClose }) {
  const btnRef  = useRef(null);
  const titleId = 'weighing-modal-title';

  // Foca o botão "Entendido" ao abrir; fecha com Escape
  useEffect(() => {
    btnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-amber-300 dark:border-amber-700 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-amber-500 px-7 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">Operação Bloqueada</p>
            <h2 id={titleId} className="text-xl font-black text-white uppercase">Pesagem Pendente</h2>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-black text-amber-800 dark:text-amber-300">
                Coleta <strong>{coleta.id}</strong> — Veículo <strong>{coleta.placa}</strong>
              </p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                O manifesto de carga <strong>não pode ser emitido</strong> sem a confirmação da 2ª Pesagem (Peso Bruto) na Balança Rodoviária. Realize a pesagem antes de processar a coleta.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Scale className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Acesse: <strong className="text-secondary">Operacional → Pesagem Rodoviária</strong> para realizar a pesagem do veículo {coleta.placa}.
            </p>
          </div>
          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== ABA COLETAS EM ANDAMENTO =====
function ColetasTab() {
  const [coletas,           setColetas]           = useState(COLETAS);
  const [selectedId,        setSelectedId]        = useState(null);
  const [showNFModal,       setShowNFModal]       = useState(false);
  const [showBlockModal,    setShowBlockModal]    = useState(false);
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  // processedIds: controla quais coletas já foram processadas nesta sessão
  const [processedIds,      setProcessedIds]      = useState([]);

  const selected      = coletas.find(c => c.id === selectedId);
  const isProcessed   = selectedId ? processedIds.includes(selectedId) : false;

  // Ref do contêiner do dropdown para detectar clique fora
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!showPrintDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPrintDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showPrintDropdown]);

  const handleProcessar = () => {
    if (!selected) return;
    if (!selected.pesagemOk) { setShowBlockModal(true); return; }
    setColetas(prev => prev.map(c => c.id === selectedId ? { ...c, status: 'Processado' } : c));
    setProcessedIds(prev => [...prev, selectedId]);
  };

  const handleRowSelect = (id) => setSelectedId(prev => prev === id ? null : id);

  const printOptions = [
    { label: 'Manifesto de Carga — Modelo 1', icon: FileText },
    { label: 'Manifesto de Carga — Modelo 2', icon: FileText },
    { label: 'Minuta de Embarque',            icon: ClipboardList },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3.5 flex flex-wrap items-center gap-2 shadow-sm">

        {/* Botão Processar — estilo reflete pesagemOk, desabilitado se já processado */}
        <button
          disabled={!selectedId || isProcessed}
          onClick={handleProcessar}
          aria-label="Processar coleta selecionada"
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md disabled:opacity-30 disabled:cursor-not-allowed',
            selected?.pesagemOk && !isProcessed
              ? 'bg-secondary text-primary hover:opacity-90 shadow-black/10'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          )}
        >
          <BadgeCheck className="w-4 h-4" aria-hidden="true" />
          {isProcessed ? 'Já Processada' : 'Processar Coleta'}
        </button>

        <button
          disabled={!selectedId}
          onClick={() => setShowNFModal(true)}
          aria-label="Ver notas fiscais da coleta selecionada"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
        >
          <FileText className="w-4 h-4" aria-hidden="true" /> Notas Fiscais
        </button>

        {/* Dropdown Impressos — fecha ao clicar fora */}
        <div className="relative" ref={dropdownRef}>
          <button
            disabled={!selectedId}
            onClick={() => setShowPrintDropdown(p => !p)}
            aria-haspopup="menu"
            aria-expanded={showPrintDropdown}
            aria-label="Abrir opções de impressão"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
          >
            <Printer className="w-4 h-4" aria-hidden="true" /> Impressos <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {showPrintDropdown && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {printOptions.map(opt => (
                <button
                  key={opt.label}
                  role="menuitem"
                  onClick={() => { setShowPrintDropdown(false); alert(`Gerando PDF: ${opt.label}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                >
                  <opt.icon className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" /> {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{coletas.length} coletas</span>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {[
                { label: '',                 abbr: 'Seleção' },
                { label: 'Nº Coleta' },
                { label: 'Onda de Separação' },
                { label: 'Placa' },
                { label: 'Doca' },
                { label: 'Peso Total (Kg)' },
                { label: 'Cubagem (m³)' },
                { label: 'Pesagem' },
                { label: 'Status' },
              ].map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn('p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest', h.label === '' && 'w-8')}
                >
                  {h.label || <span className="sr-only">{h.abbr}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coletas.map(c => {
              const isSelected  = c.id === selectedId;
              const isProc      = processedIds.includes(c.id);
              return (
                <tr
                  key={c.id}
                  role="row"
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => handleRowSelect(c.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowSelect(c.id); } }}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                    isSelected ? 'bg-secondary/5 dark:bg-primary/5 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent',
                    isProc && 'opacity-60'
                  )}
                >
                  <td className="p-4 text-center">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSelected ? 'bg-secondary scale-150' : 'bg-transparent')} aria-hidden="true" />
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/10 rounded-lg">{c.id}</code>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{c.onda}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <code className="text-xs font-black text-slate-700 dark:text-slate-300">{c.placa}</code>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-black text-slate-600 dark:text-slate-400">{c.doca}</td>
                  <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{c.pesoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                  <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{c.cubagem.toFixed(1)}</td>
                  <td className="p-4 text-center">
                    {c.pesagemOk
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" aria-label="Pesagem confirmada" />
                      : <TriangleAlert className="w-5 h-5 text-amber-500 mx-auto" aria-label="Pesagem pendente" />
                    }
                  </td>
                  <td className="p-4">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', STATUS_BADGE[c.status])}>
                      {isProc ? 'Processado' : c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Painel de detalhe selecionado */}
      {selected && (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-5 shadow-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-4 h-4 text-secondary" aria-hidden="true" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {selected.id} — {selected.transportadora}
            </h3>
            {!selected.pesagemOk && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <Scale className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">2ª Pesagem Pendente — bloqueia manifesto</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'NFs Vinculadas',  value: selected.nfs.length },
              { label: 'Total Volumes',   value: selected.nfs.reduce((a, n) => a + n.volumes, 0) },
              { label: 'Peso Total (Kg)', value: selected.pesoTotal.toLocaleString('pt-BR') },
              { label: 'Cubagem (m³)',    value: selected.cubagem.toFixed(1) },
            ].map(f => (
              <div key={f.label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                <p className="text-lg font-black text-secondary">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNFModal    && selected && <NFModal           coleta={selected} onClose={() => setShowNFModal(false)} />}
      {showBlockModal && selected && <WeighingBlockModal coleta={selected} onClose={() => setShowBlockModal(false)} />}
    </div>
  );
}

// ===== ABA MANIFESTOS GERADOS =====
function ManifestosTab() {
  const [selectedId, setSelectedId] = useState(null);
  const handleRowSelect = (id) => setSelectedId(prev => prev === id ? null : id);

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-secondary" aria-hidden="true" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Manifestos de Carga Emitidos</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{MANIFESTOS.length} manifestos</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              {[
                { label: '',             abbr: 'Seleção' },
                { label: 'Nº Manifesto' },
                { label: 'Coleta' },
                { label: 'Placa' },
                { label: 'Doca' },
                { label: 'Transportadora' },
                { label: 'Emissão' },
                { label: 'Peso (Kg)' },
                { label: 'NFs' },
                { label: 'Status' },
              ].map((h, i) => (
                <th key={i} scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {h.label || <span className="sr-only">{h.abbr}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MANIFESTOS.map(m => {
              const isSelected = m.id === selectedId;
              return (
                <tr
                  key={m.id}
                  role="row"
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => handleRowSelect(m.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowSelect(m.id); } }}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                    isSelected ? 'bg-secondary/5 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                  )}
                >
                  <td className="p-4 text-center">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSelected ? 'bg-secondary scale-150' : 'bg-transparent')} aria-hidden="true" />
                  </td>
                  <td className="p-4"><code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/10 rounded-lg">{m.id}</code></td>
                  <td className="p-4 text-[10px] font-bold text-slate-500">{m.coleta}</td>
                  <td className="p-4"><code className="text-xs font-black text-slate-700 dark:text-slate-300">{m.placa}</code></td>
                  <td className="p-4 text-xs font-black text-slate-600 dark:text-slate-400">{m.doca}</td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{m.transportadora}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <Clock className="w-3 h-3" aria-hidden="true" />{m.emissao}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{m.pesoTotal.toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-center text-xs font-black text-slate-600">{m.nfs}</td>
                  <td className="p-4">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', STATUS_BADGE[m.status])}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function ManifestManager() {
  const [activeTab, setActiveTab] = useState('coletas');

  const tabs = [
    { id: 'coletas',    label: 'Coletas em Andamento', icon: Truck,         count: COLETAS.length },
    { id: 'manifestos', label: 'Manifestos Gerados',   icon: ClipboardList, count: MANIFESTOS.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center shadow-lg shadow-black/20 relative">
          <Truck className="w-7 h-7 text-primary" aria-hidden="true" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center" aria-hidden="true">
            <FileText className="w-3.5 h-3.5 text-secondary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expedição &amp; Transporte</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">3.5 Gerenciar Manifestos</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Consolidação de NFs, geração de manifesto e controle de saída de veículos</p>
        </div>

        {/* KPIs */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-center px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
            <p className="text-xl font-black text-amber-600">{COLETAS.filter(c => !c.pesagemOk).length}</p>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Aguard. Pesagem</p>
          </div>
          <div className="text-center px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <p className="text-xl font-black text-green-600">{COLETAS.filter(c => c.pesagemOk).length}</p>
            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-0.5">Prontos para Emit.</p>
          </div>
          <div className="text-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xl font-black text-secondary">{MANIFESTOS.filter(m => m.status === 'Emitido').length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Manifestos Emitidos</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-1.5 flex gap-1.5 shadow-sm w-fit"
        role="tablist"
        aria-label="Seções do gerenciador de manifesto"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200',
              activeTab === tab.id
                ? 'bg-secondary text-primary shadow-lg shadow-black/10'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-black',
              activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
      >
        {activeTab === 'coletas' ? <ColetasTab /> : <ManifestosTab />}
      </div>
    </div>
  );
}
