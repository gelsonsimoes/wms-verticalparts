import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Building,
  FileText,
  Package,
  RotateCcw,
  Link2,
  Link2Off,
  Upload,
  Download,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Search,
  Copy,
  ChevronRight,
  FileCheck,
  Layers,
  Info,
  ChevronDown,
  ScanLine,
  Filter,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── MOCK DATA ────────────────────────────────────────────────────
const REMESSAS = [
  { id: 1, nf: '000.541', serie: '1', chave: '35260200000000000100550010000005411', depositante: 'Atacado BR Peças', emissao: '10/02/2026', valor: 48500.00, itens: 12, cobertura: 'Pendente', coberturaQtd: 0, totalQtd: 12 },
  { id: 2, nf: '000.512', serie: '1', chave: '35260200000000000100550010000005121', depositante: 'Grupo Freios Sul',  emissao: '08/02/2026', valor: 22100.00, itens: 6,  cobertura: 'Parcial',  coberturaQtd: 4, totalQtd: 6 },
  { id: 3, nf: '000.498', serie: '1', chave: '35260200000000000100550010000004981', depositante: 'Rede Filtros SP',   emissao: '05/02/2026', valor: 11750.00, itens: 8,  cobertura: 'Coberta',  coberturaQtd: 8, totalQtd: 8 },
  { id: 4, nf: '000.480', serie: '1', chave: '35260200000000000100550010000004801', depositante: 'Moto Peças RS',     emissao: '02/02/2026', valor: 6200.00,  itens: 3,  cobertura: 'Pendente', coberturaQtd: 0, totalQtd: 3 },
  { id: 5, nf: '000.461', serie: '1', chave: '35260200000000000100550010000004611', depositante: 'Auto Center BH',    emissao: '30/01/2026', valor: 33900.00, itens: 10, cobertura: 'Parcial',  coberturaQtd: 2, totalQtd: 10 },
];

const PRODUTOS = [
  { id: 1, sku: 'VP-FR4429-X', desc: 'Pastilha de Freio Dianteira',  depositante: 'Atacado BR Peças', qtdFisica: 48, qtdCoberta: 0,  nfRemessa: '000.541', lote: 'LT-0241', status: 'Descoberto' },
  { id: 2, sku: 'VP-DC2210-F', desc: 'Disco de Freio Ventilado',       depositante: 'Grupo Freios Sul',  qtdFisica: 12, qtdCoberta: 8,  nfRemessa: '000.512', lote: 'LT-0238', status: 'Parcial' },
  { id: 3, sku: 'VP-FO1122-M', desc: 'Filtro de Óleo Premium',         depositante: 'Rede Filtros SP',   qtdFisica: 60, qtdCoberta: 60, nfRemessa: '000.498', lote: 'LT-0233', status: 'Coberto' },
  { id: 4, sku: 'VP-FA3311-K', desc: 'Filtro de Ar Esportivo',         depositante: 'Moto Peças RS',     qtdFisica: 24, qtdCoberta: 0,  nfRemessa: '000.480', lote: 'LT-0230', status: 'Descoberto' },
  { id: 5, sku: 'VP-LB0091-A', desc: 'Fluido de Freio DOT 4 500ml',    depositante: 'Auto Center BH',    qtdFisica: 36, qtdCoberta: 20, nfRemessa: '000.461', lote: 'LT-0228', status: 'Parcial' },
];

const RETORNOS = [
  { id: 1, nfRetorno: '000.088', nfRemessa: '000.498', depositante: 'Rede Filtros SP',   tipo: 'Retorno Simbólico', dtRegistro: '15/02/2026', valor: 11750.00, status: 'Validado' },
  { id: 2, nfRetorno: '000.075', nfRemessa: '000.512', depositante: 'Grupo Freios Sul',   tipo: 'Retorno Simbólico', dtRegistro: '12/02/2026', valor: 14733.00, status: 'Em Análise' },
  { id: 3, nfRetorno: '000.061', nfRemessa: '000.459', depositante: 'Auto Center BH',    tipo: 'Simbólico Parcial',  dtRegistro: '01/02/2026', valor: 8100.00,  status: 'Validado' },
];

const TAB_STATUS_CFG = {
  'Pendente':   { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',  dot: 'bg-red-500' },
  'Parcial':    { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
  'Coberta':    { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  'Descoberto': { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',  dot: 'bg-red-500' },
  'Coberto':    { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  'Validado':   { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  'Em Análise': { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
};

function StatusBadge({ status }) {
  const cfg = TAB_STATUS_CFG[status] || {};
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {status}
    </span>
  );
}

// ─── MODAL DE VINCULAÇÃO DE RETORNO SIMBÓLICO ──────────────────────
function VincularModal({ remessa, onClose, onVincular }) {
  const [chaveRetorno, setChaveRetorno] = useState('');
  const [step, setStep] = useState('input'); // input | confirmar
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const isValid = chaveRetorno.replace(/\D/g, '').length === 44;

  // Auto-focus no input ao abrir + fecha com Escape
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(remessa.chave).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Armazém Geral — Fiscal</p>
              <h2 className="text-base font-black text-white uppercase">Vincular Retorno Simbólico</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          {/* NF de Remessa (origem) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> NF-e de Remessa (Origem da Obrigação)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Série', value: remessa.serie },
                { label: 'Nº NF', value: remessa.nf },
                { label: 'Emissão', value: remessa.emissao },
              ].map(f => (
                <div key={f.label} className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.label}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <code className="text-[9px] text-slate-500 font-mono truncate flex-1 mr-2">{remessa.chave}</code>
              <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-secondary shrink-0">
                <Copy className="w-3 h-3" />{copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Input da chave de retorno */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5" />
              Chave de Acesso da NF-e de Retorno Simbólico (44 dígitos) *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                value={chaveRetorno}
                onChange={e => setChaveRetorno(e.target.value)}
                placeholder="Ex: 35260200000000000100550010000000881..."
                maxLength={50}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none focus:border-secondary transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <span className="text-[9px] font-black text-slate-400">{chaveRetorno.replace(/\D/g, '').length}/44</span>
                }
              </div>
            </div>
            {!isValid && chaveRetorno.length > 5 && (
              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Chave incompleta — insira todos os 44 dígitos.
              </p>
            )}
          </div>

          {isValid && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs font-bold text-green-700 dark:text-green-400">Chave reconhecida. Pronto para vinculação fiscal.</p>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              O retorno simbólico não movimenta fisicamente o estoque. Apenas registra a cobertura fiscal para fins de "<strong>Conta e Ordem de Terceiros</strong>" junto à SEFAZ.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button
              disabled={!isValid}
              onClick={() => { onVincular(remessa.id, chaveRetorno); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Link2 className="w-4 h-4" />Vincular Cobertura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function GeneralWarehouseFiscal() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRemessa, setSelectedRemessa] = useState(null);
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [remessas, setRemessas] = useState(REMESSAS);
  const [consistindo, setConsistindo] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const fileRef   = useRef(null);
  const [uploadFeedback,  setUploadFeedback]  = useState(null); // { name } | null
  const [consistFeedback, setConsistFeedback] = useState(null); // { ok, msg } | null

  const TABS = [
    { label: 'NF-es Aguardando Cobertura',   icon: FileText,  count: remessas.filter(r => r.cobertura !== 'Coberta').length },
    { label: 'Produtos Aguardando Cobertura', icon: Package,   count: PRODUTOS.filter(p => p.status !== 'Coberto').length },
    { label: 'Consulta de Retorno',          icon: RotateCcw, count: RETORNOS.length },
  ];

  const handleVincular = (remessaId, chave) => {
    setRemessas(prev => prev.map(r => r.id === remessaId
      ? { ...r, cobertura: 'Coberta', coberturaQtd: r.totalQtd }
      : r
    ));
    setSelectedRemessa(null);
  };

  const handleConsistir = () => {
    setConsistindo(true);
    // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/fiscal/consistir
    setTimeout(() => {
      setConsistindo(false);
      const pendentes = remessas.filter(r => r.cobertura !== 'Coberta').length;
      setConsistFeedback({
        ok: pendentes === 0,
        msg: pendentes === 0
          ? 'Todos os lotes estão cobertos fiscalmente.'
          : `${pendentes} lote(s) com cobertura pendente ou parcial.`
      });
      setTimeout(() => setConsistFeedback(null), 4000);
    }, 2200);
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/fiscal/coverage/import (FormData)
    setUploadFeedback({ name: file.name });
    setTimeout(() => setUploadFeedback(null), 4000);
    // Limpa o input para permitir reenvio do mesmo arquivo
    e.target.value = '';
  }, []);

  const remessasFiltradas = filterStatus === 'Todos' ? remessas : remessas.filter(r => r.cobertura === filterStatus);

  // KPI summary
  const kpiPendente  = remessas.filter(r => r.cobertura === 'Pendente').length;
  const kpiParcial   = remessas.filter(r => r.cobertura === 'Parcial').length;
  const kpiCoberta   = remessas.filter(r => r.cobertura === 'Coberta').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-secondary to-blue-600" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Building className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Módulo Fiscal — Cat. 6</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">5.4 Controlar Armazém Geral</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Conciliação Fiscal — Conta e Ordem de Terceiros</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="flex gap-3 md:ml-auto">
            {[
              { label: 'Sem Cobertura', count: kpiPendente, color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
              { label: 'Cobertura Parcial', count: kpiParcial,  color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
              { label: 'Totalmente Coberta', count: kpiCoberta,  color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
            ].map(k => (
              <div key={k.label} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-current/20', k.color)}>
                <div className={cn('w-2.5 h-2.5 rounded-full', k.dot)} />
                <div>
                  <p className="text-lg font-black leading-none">{k.count}</p>
                  <p className="text-[8px] uppercase tracking-wider leading-none opacity-70">{k.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <input type="file" ref={fileRef} accept=".xml" className="hidden" onChange={handleFileChange} />
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md">
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />Importar Cobertura Fiscal (XML)
        </button>
        {/* Feedback inline do arquivo selecionado */}
        {uploadFeedback && (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
            "{uploadFeedback.name}" recebido — aguardando processamento.
          </span>
        )}
        {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: GET ou POST /api/fiscal/export */}
        <button
          disabled
          title="Exportação em desenvolvimento"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-3.5 h-3.5" aria-hidden="true" />Exportar Retorno Referenciado
        </button>
        <button onClick={handleConsistir} disabled={consistindo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md">
          {consistindo
            ? <><CheckSquare className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" /> Consistindo...</>
            : <><CheckSquare className="w-3.5 h-3.5" aria-hidden="true" /> Consistir Lotes Faturados vs Conferidos</>
          }
        </button>
        {/* Banner de resultado da consistência */}
        {consistFeedback && (
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
            consistFeedback.ok
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            {consistFeedback.msg}
          </span>
        )}
      </div>

      {/* ═══════════ TABS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Tab Headers */}
        <div className="flex border-b-2 border-slate-100 dark:border-slate-800">
          {TABS.map((tab) => (
            <button key={tab.label} onClick={() => setActiveTab(TABS.indexOf(tab))}
              className={cn(
                'flex items-center gap-2.5 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px',
                activeTab === TABS.indexOf(tab)
                  ? 'border-b-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-b-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}>
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black',
                  activeTab === TABS.indexOf(tab) ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                )}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── ABA 1: NF-es Aguardando Cobertura ─── */}
        {activeTab === 0 && (
          <div className="flex divide-x-2 divide-slate-100 dark:divide-slate-800 min-h-[480px]">
            {/* LEFT — Grid de Remessas */}
            <div className="flex-1 p-5 space-y-3 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Remessas Disponíveis</h3>
                  <p className="text-[10px] text-slate-400 font-medium">NF-es de entrada com estoque aguardando cobertura fiscal</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  {['Todos', 'Pendente', 'Parcial', 'Coberta'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all',
                        filterStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {remessasFiltradas.map(r => {
                const isSelected = selectedRemessa?.id === r.id;
                const pct = (r.coberturaQtd / r.totalQtd) * 100;
                return (
                  <div key={r.id} onClick={() => setSelectedRemessa(isSelected ? null : r)}
                    className={cn(
                      'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 group',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-100 dark:shadow-none'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-black text-blue-600">NF {r.nf}</code>
                          <span className="text-[9px] font-bold text-slate-400">Série {r.serie}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">{r.depositante}</p>
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[200px] mt-0.5">{r.chave}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          {r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">{r.emissao} · {r.itens} itens</p>
                        <StatusBadge status={r.cobertura} />
                      </div>
                    </div>
                    {/* Barra de progresso de cobertura */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cobertura Fiscal</span>
                        <span className="text-[9px] font-black text-slate-600 dark:text-slate-300">{r.coberturaQtd}/{r.totalQtd} itens</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-500',
                          pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-red-400'
                        )} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Painel de vinculação */}
            <div className="w-80 p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Vincular Cobertura Fiscal</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Selecione uma remessa ao lado para associar a NF-e de Retorno Simbólico</p>
              </div>

              {!selectedRemessa ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Link2Off className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Nenhuma Remessa Selecionada</p>
                    <p className="text-[10px] text-slate-400 mt-1">Clique em uma NF-e de remessa para vinculá-la a um retorno simbólico.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-4">
                  {/* Detalhes da selecionada */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 space-y-3">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Remessa Selecionada</p>
                    <div className="space-y-1.5">
                      {[
                        { l: 'NF', v: `${selectedRemessa.nf} — Série ${selectedRemessa.serie}` },
                        { l: 'Depositante', v: selectedRemessa.depositante },
                        { l: 'Emissão', v: selectedRemessa.emissao },
                        { l: 'Valor', v: selectedRemessa.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
                        { l: 'Status', v: null },
                      ].map(f => (
                        <div key={f.l} className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{f.l}</span>
                          {f.v
                            ? <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{f.v}</span>
                            : <StatusBadge status={selectedRemessa.cobertura} />
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRemessa.cobertura === 'Coberta' ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-green-700 dark:text-green-400">Cobertura Completa</p>
                        <p className="text-[10px] text-green-600/80 dark:text-green-500/80">Todos os itens desta NF-e têm retorno simbólico vinculado.</p>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowVincularModal(true)}
                      className="w-full py-4 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
                      <Link2 className="w-4 h-4" />
                      Vincular Retorno Simbólico
                    </button>
                  )}

                  <button onClick={() => setSelectedRemessa(null)}
                    className="w-full py-2.5 rounded-xl text-xs font-black text-slate-400 hover:text-slate-600 transition-all">
                    Limpar seleção
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── ABA 2: Produtos Aguardando Cobertura ─── */}
        {activeTab === 1 && (
          <div className="p-0 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                  {['SKU', 'Descrição', 'Lote', 'NF Remessa', 'Depositante', 'Qtd Física', 'Qtd Coberta', 'Descoberto', 'Status'].map((h) => (
                    <th key={h} scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUTOS.map(p => {
                  const descoberto = p.qtdFisica - p.qtdCoberta;
                  return (
                    <tr key={p.id} className={cn(
                      'border-t border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      p.status === 'Descoberto' && 'bg-red-50/40 dark:bg-red-950/10'
                    )}>
                      <td className="p-4"><code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/10 rounded-lg">{p.sku}</code></td>
                      <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300">{p.desc}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">{p.lote}</td>
                      <td className="p-4"><code className="text-xs font-bold text-blue-600">{p.nfRemessa}</code></td>
                      <td className="p-4 text-xs text-slate-500">{p.depositante}</td>
                      <td className="p-4 text-xs font-black text-slate-800 dark:text-white tabular-nums text-center">{p.qtdFisica}</td>
                      <td className="p-4 text-xs font-black text-green-600 tabular-nums text-center">{p.qtdCoberta}</td>
                      <td className="p-4 text-xs font-black tabular-nums text-center">
                        <span className={cn('px-2 py-0.5 rounded-lg', descoberto > 0 ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-slate-400')}>
                          {descoberto}
                        </span>
                      </td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── ABA 3: Consulta de Retorno de Armazenagem ─── */}
        {activeTab === 2 && (
          <div className="p-0 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                  {['NF Retorno', 'NF Remessa (Ref.)', 'Tipo', 'Depositante', 'Data Registro', 'Valor', 'Status'].map((h) => (
                    <th key={h} scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RETORNOS.map(r => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4"><code className="text-sm font-black text-blue-600">NF {r.nfRetorno}</code></td>
                    <td className="p-4"><code className="text-xs font-bold text-slate-500">{r.nfRemessa}</code></td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 uppercase tracking-wider whitespace-nowrap">
                        <Layers className="w-3 h-3" />{r.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{r.depositante}</td>
                    <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.dtRegistro}</td>
                    <td className="p-4 text-xs font-black text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
                      {r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showVincularModal && selectedRemessa && (
        <VincularModal remessa={selectedRemessa} onClose={() => setShowVincularModal(false)} onVincular={handleVincular} />
      )}
    </div>
  );
}
