import React, { useState } from 'react';
import {
  FileText,
  Send,
  Search,
  XCircle,
  Hash,
  Printer,
  RotateCcw,
  Download,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  AlertOctagon,
  ChevronDown,
  X,
  Filter,
  Calendar,
  Building2,
  RefreshCw,
  Info,
  Copy,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── STATUS SEFAZ ───────────────────────────────────────────────────
const SEFAZ_STATUS = {
  'Autorizada':   { label: 'Autorizada',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   dot: 'bg-green-500',   icon: CheckCircle2 },
  'Pendente':     { label: 'Pendente',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   dot: 'bg-amber-400 animate-pulse', icon: Clock },
  'Rejeitada':    { label: 'Rejeitada',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',           dot: 'bg-red-500',     icon: AlertOctagon },
  'Cancelada':    { label: 'Cancelada',    color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',      dot: 'bg-slate-400',   icon: Ban },
  'Inutilizada':  { label: 'Inutilizada',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500', icon: Hash },
};

// ─── MOCK DATA ──────────────────────────────────────────────────────
const MOCK_NFES = [
  { id: 1, serie: '001', numero: '000.241', chave: '35260200000000000100550010000002411000002410', depositante: 'VerticalParts Matriz', emissao: '22/02/2026 07:10', valor: 12500.00, status: 'Autorizada',  rejeicao: null },
  { id: 2, serie: '001', numero: '000.242', chave: '35260200000000000100550010000002421000002421', depositante: 'Filial BH',           emissao: '22/02/2026 08:30', valor:  8700.00, status: 'Pendente',    rejeicao: null },
  { id: 3, serie: '001', numero: '000.243', chave: '35260200000000000100550010000002431000002431', depositante: 'Cliente Externo MG',  emissao: '22/02/2026 09:15', valor: 33000.00, status: 'Rejeitada',   rejeicao: { codigo: '539', descricao: 'Duplicidade de NF-e — Chave de Acesso já autorizada na SEFAZ para este CNPJ/Série/Número.', protocolo: 'PRE-202602220915001', ts: '22/02/2026 09:16:42' } },
  { id: 4, serie: '001', numero: '000.244', chave: '35260200000000000100550010000002441000002441', depositante: 'Atacado Norte',       emissao: '22/02/2026 10:00', valor:  3200.00, status: 'Cancelada',   rejeicao: null },
  { id: 5, serie: '001', numero: '000.240', chave: '35260200000000000100550010000002401000002401', depositante: 'VerticalParts Matriz', emissao: '21/02/2026 14:00', valor: 21000.00, status: 'Autorizada',  rejeicao: null },
  { id: 6, serie: '001', numero: '000.239', chave: '35260200000000000100550010000002391000002391', depositante: 'Rede Peças SP',        emissao: '21/02/2026 11:30', valor: 44200.00, status: 'Rejeitada',   rejeicao: { codigo: '204', descricao: 'Rejeição: Duplicidade de NF, o número da NF já foi utilizado. Verifique a série e numeração informadas.', protocolo: 'PRE-202602211130044', ts: '21/02/2026 11:32:05' } },
  { id: 7, serie: '002', numero: '000.015', chave: '35260200000000000100550020000000151000000151', depositante: 'Grupo Freios Brasil',   emissao: '20/02/2026 16:45', valor: 19800.00, status: 'Inutilizada', rejeicao: null },
  { id: 8, serie: '001', numero: '000.238', chave: '35260200000000000100550010000002381000002381', depositante: 'Filial BH',            emissao: '20/02/2026 08:00', valor:  5500.00, status: 'Autorizada',  rejeicao: null },
];

const DEPOSITANTES = ['Todos', 'VerticalParts Matriz', 'Filial BH', 'Cliente Externo MG', 'Atacado Norte', 'Rede Peças SP', 'Grupo Freios Brasil'];

// ─── MODAL LOG DE REJEIÇÃO ──────────────────────────────────────────
function RejeicaoModal({ nfe, onClose }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(nfe.chave).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-red-200 dark:border-red-900/60 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-danger px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">SEFAZ — Log de Erro</p>
              <h2 className="text-base font-black text-white uppercase">NF-e Rejeitada</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Série', value: nfe.serie },
              { label: 'Nº Nota Fiscal', value: nfe.numero },
              { label: 'Cód. Rejeição', value: nfe.rejeicao.codigo },
            ].map(f => (
              <div key={f.label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Mensagem da SEFAZ */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl space-y-2">
            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Mensagem da SEFAZ</p>
            <p className="text-sm font-bold text-red-800 dark:text-red-300 leading-relaxed">{nfe.rejeicao.descricao}</p>
          </div>

          {/* Chave + protocolo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chave de Acesso</p>
              <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-secondary uppercase tracking-wider transition-all">
                <Copy className="w-3 h-3" />{copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <code className="block text-[9px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl break-all leading-relaxed">
              {nfe.chave}
            </code>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-slate-400">Protocolo: <span className="font-black text-slate-600 dark:text-slate-300">{nfe.rejeicao.protocolo}</span></span>
            <span className="font-bold text-slate-400">{nfe.rejeicao.ts}</span>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Fechar</button>
            <button className="flex-1 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />Retransmitir NF-e
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL INUTILIZAR ───────────────────────────────────────────────
function InutilizarModal({ onClose }) {
  const [form, setForm] = useState({ serie: '001', numInicio: '', numFim: '', motivo: '' });
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-purple-700 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">SEFAZ</p>
              <h2 className="text-base font-black text-white uppercase">Inutilizar Numeração</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Esta operação é irreversível. A numeração inutilizada não poderá ser reutilizada.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Série', key: 'serie', placeholder: '001' },
              { label: 'Nº Início', key: 'numInicio', placeholder: '000.250' },
              { label: 'Nº Fim', key: 'numFim', placeholder: '000.255' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo da Inutilização *</label>
            <textarea value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} rows={3}
              placeholder="Descreva o motivo da inutilização da faixa de numeração..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:border-secondary transition-all resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
              <Hash className="w-4 h-4" />Inutilizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function NFeControl() {
  const [nfes, setNfes] = useState(MOCK_NFES);
  const [selectedId, setSelectedId] = useState(null);
  const [rejeicaoNfe, setRejeicaoNfe] = useState(null);
  const [showInutilizarModal, setShowInutilizarModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDepositante, setFilterDepositante] = useState('Todos');
  const [filterInicio, setFilterInicio] = useState('');
  const [filterFim, setFilterFim] = useState('');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showDepDrop, setShowDepDrop] = useState(false);
  const [transmitting, setTransmitting] = useState(false);

  const selected = nfes.find(n => n.id === selectedId);

  const filtered = nfes.filter(n => {
    if (filterStatus !== 'Todos' && n.status !== filterStatus) return false;
    if (filterDepositante !== 'Todos' && n.depositante !== filterDepositante) return false;
    return true;
  });

  // KPIs
  const counts = Object.keys(SEFAZ_STATUS).reduce((acc, s) => {
    acc[s] = nfes.filter(n => n.status === s).length;
    return acc;
  }, {});

  const handleTransmitir = () => {
    const pendentes = nfes.filter(n => n.status === 'Pendente');
    if (!pendentes.length) { alert('Nenhuma NF-e pendente para transmissão.'); return; }
    setTransmitting(true);
    setTimeout(() => {
      setNfes(prev => prev.map(n => n.status === 'Pendente' ? { ...n, status: 'Autorizada' } : n));
      setTransmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-secondary to-green-500" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-secondary flex items-center justify-center shadow-lg relative">
              <FileText className="w-7 h-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Módulo Fiscal — Cat. 6</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Controle de NF-e</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Transmissão, Impressão e Inutilização de Notas Fiscais Eletrônicas — SEFAZ</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {Object.entries(SEFAZ_STATUS).map(([key, def]) => (
              <button key={key}
                onClick={() => setFilterStatus(filterStatus === key ? 'Todos' : key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                  filterStatus === key ? def.color + " border-current/30 scale-105 shadow-md" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:scale-105"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", def.dot)} />
                {counts[key]} {def.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ FILTROS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros:</span>

        {/* Período */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input type="date" value={filterInicio} onChange={e => setFilterInicio(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
          <span className="text-slate-400 text-xs">até</span>
          <input type="date" value={filterFim} onChange={e => setFilterFim(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
        </div>

        {/* Depositante */}
        <div className="relative">
          <button onClick={() => setShowDepDrop(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:border-secondary transition-all">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{filterDepositante}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
          {showDepDrop && (
            <div className="absolute top-full mt-1 left-0 w-52 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-hidden animate-in fade-in duration-150">
              {DEPOSITANTES.map(d => (
                <button key={d} onClick={() => { setFilterDepositante(d); setShowDepDrop(false); }}
                  className={cn("w-full text-left px-4 py-2.5 text-xs font-bold border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors",
                    filterDepositante === d ? "bg-secondary text-primary" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}>
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status SEFAZ */}
        <div className="relative">
          <button onClick={() => setShowStatusDrop(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:border-secondary transition-all">
            <span>Status: {filterStatus}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showStatusDrop && (
            <div className="absolute top-full mt-1 left-0 w-40 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-hidden animate-in fade-in duration-150">
              {['Todos', ...Object.keys(SEFAZ_STATUS)].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setShowStatusDrop(false); }}
                  className={cn("w-full text-left px-4 py-2.5 text-xs font-bold border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors",
                    filterStatus === s ? "bg-secondary text-primary" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => { setFilterStatus('Todos'); setFilterDepositante('Todos'); setFilterInicio(''); setFilterFim(''); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-400 hover:text-danger transition-all">
          <X className="w-3.5 h-3.5" /> Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
      </div>

      {/* ═══════════ TOOLBAR DE AÇÕES ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">

        {/* Grupo Ações */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Ações</span>
          <button onClick={handleTransmitir} disabled={transmitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50">
            {transmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {transmitting ? 'Transmitindo...' : 'Transmitir NF-e'}
          </button>
          <button disabled={!selectedId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-blue-50 hover:text-blue-700 disabled:opacity-30 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Consultar Status
          </button>
          <button disabled={!selectedId || (selected && selected.status !== 'Autorizada')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-danger text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all">
            <XCircle className="w-3.5 h-3.5" /> Cancelar NF-e
          </button>
          <button onClick={() => setShowInutilizarModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-purple-600 text-xs font-black uppercase tracking-wider hover:bg-purple-50 transition-all">
            <Hash className="w-3.5 h-3.5" /> Inutilizar Numeração
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Grupo Impressão */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Impressão</span>
          <button disabled={!selectedId || (selected && selected.status !== 'Autorizada')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all">
            <Printer className="w-3.5 h-3.5" /> Imprimir DANFE
          </button>
          <button disabled={!selectedId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Voltar NF Impressa
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Grupo Exportação */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Exportar</span>
          <button disabled={!selectedId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-green-50 hover:text-green-700 disabled:opacity-30 transition-all">
            <Download className="w-3.5 h-3.5" /> Download XML
          </button>
          <button disabled={!selectedId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition-all">
            <FileDown className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* ═══════════ GRID PRINCIPAL ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['', 'Série', 'Nº Nota Fiscal', 'Chave de Acesso', 'Depositante', 'Data Emissão', 'Valor Total', 'Status SEFAZ', ''].map((h, i) => (
                <th key={i} className={cn("p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest", (i === 0 || i === 8) && 'w-8')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma NF-e encontrada com os filtros aplicados.</td></tr>
            )}
            {filtered.map(nfe => {
              const isSelected = nfe.id === selectedId;
              const statusDef = SEFAZ_STATUS[nfe.status];
              const isRejeitada = nfe.status === 'Rejeitada';
              return (
                <tr key={nfe.id}
                  onClick={() => setSelectedId(nfe.id === selectedId ? null : nfe.id)}
                  className={cn(
                    "border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all duration-150 group",
                    isRejeitada && "bg-red-50/50 dark:bg-red-950/10",
                    isSelected ? "bg-secondary/5 dark:bg-primary/5 border-l-4 border-l-secondary" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"
                  )}
                >
                  <td className="p-4 text-center">
                    <div className={cn("w-2 h-2 rounded-full mx-auto", isSelected ? "bg-secondary scale-150" : "bg-transparent")} />
                  </td>
                  <td className="p-4 text-center">
                    <code className="text-xs font-black text-slate-700 dark:text-slate-300">{nfe.serie}</code>
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/10 rounded-lg">{nfe.numero}</code>
                  </td>
                  <td className="p-4 max-w-[180px]">
                    <code className="text-[9px] font-mono text-slate-500 truncate block">{nfe.chave}</code>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{nfe.depositante}</td>
                  <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{nfe.emissao}</td>
                  <td className="p-4 text-xs font-black text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap">
                    {nfe.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap", statusDef.color)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", statusDef.dot)} />
                      {statusDef.label}
                    </span>
                  </td>
                  {/* Ícone de alerta para rejeitadas */}
                  <td className="p-4 text-center">
                    {isRejeitada && (
                      <button
                        onClick={e => { e.stopPropagation(); setRejeicaoNfe(nfe); }}
                        title="Ver motivo da rejeição"
                        className="group/alert w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-danger hover:scale-110 transition-all mx-auto"
                      >
                        <AlertTriangle className="w-4 h-4 text-danger group-hover/alert:text-white" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAIS */}
      {rejeicaoNfe && <RejeicaoModal nfe={rejeicaoNfe} onClose={() => setRejeicaoNfe(null)} />}
      {showInutilizarModal && <InutilizarModal onClose={() => setShowInutilizarModal(false)} />}
    </div>
  );
}
