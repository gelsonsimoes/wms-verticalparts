import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Unlock,
  Scissors,
  ClipboardList,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Package,
  MapPin,
  Hash,
  Info,
  ChevronRight,
  Clock,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── STATUS CONFIG ──────────────────────────────────────────────────
const STATUS_CFG = {
  'Liberado': { color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500', icon: ShieldCheck },
  'Bloqueado': { color: 'text-red-700   bg-red-100   dark:bg-red-900/30   dark:text-red-400',  dot: 'bg-red-500',   icon: ShieldAlert },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {status}
    </span>
  );
}

// ─── MOCK DATA ──────────────────────────────────────────────────────
const INITIAL_LOTES = [
  { id: 1, lote: 'LT-0241',   local: 'R1_PP1_CL001_N004', codigo: 'VEPEL-BPI-174FX', descricao: 'Barreira de Proteção Infravermelha',    qtdUnit: 48, status: 'Liberado',  parent: null,      motivo: null,          entrada: '10/02/2026' },
  { id: 2, lote: 'LT-0238',   local: 'R1_PP2_CL003_N005', codigo: 'VPER-ESS-NY-27MM', descricao: 'Escova de Segurança (Nylon)',       qtdUnit: 12, status: 'Bloqueado', parent: null,      motivo: 'Peça aguardando inspeção de qualidade', entrada: '08/02/2026' },
  { id: 3, lote: 'LT-0233',   local: 'R2_PP1_CL002_N003', codigo: 'VPER-PAL-INO-1000', descricao: 'Pallet de Aço Inox (1000mm)',         qtdUnit: 60, status: 'Liberado',  parent: null,      motivo: null,          entrada: '05/02/2026' },
  { id: 4, lote: 'LT-0228',   local: 'R1_PP1_CL002_N005', codigo: 'VPER-LUM-LED-VRD-24V', descricao: 'Luminária em LED Verde 24V',   qtdUnit: 36, status: 'Liberado',  parent: null,      motivo: null,          entrada: '02/02/2026' },
  { id: 5, lote: 'LT-0220',   local: 'R1_PP1_CL004_N006', codigo: 'VPER-INC-ESQ', descricao: 'InnerCap (Esquerdo)',         qtdUnit: 24, status: 'Bloqueado', parent: null,      motivo: 'Embalagem danificada — aguardando retorno ao fornecedor', entrada: '30/01/2026' },
  { id: 6, lote: 'LT-0215',   local: 'R1_PP1_CL001_N005', codigo: 'VEPEL-BTI-JX02-CCS', descricao: 'Botoeira de Inspeção - Mod. JX02',         qtdUnit: 18, status: 'Liberado',  parent: null,      motivo: null,          entrada: '28/01/2026' },
  { id: 7, lote: 'LT-0233-A', local: 'R2_PP1_CL002_N002', codigo: 'VPER-PAL-INO-1000', descricao: 'Pallet de Aço Inox (1000mm)',         qtdUnit: 20, status: 'Liberado',  parent: 'LT-0233', motivo: null,          entrada: '05/02/2026' },
];

const HISTORICO = {
  'LT-0241': [
    { data: '10/02/2026 08:10', evento: 'Entrada no armazém', detalhe: 'Recebido via NF 000.541 — Atacado BR Peças', tipo: 'entrada' },
    { data: '12/02/2026 14:30', evento: 'Alocação de endereço', detalhe: 'Endereço R1_PP1_CL001_N004 — SETOR-A', tipo: 'mov' },
    { data: '15/02/2026 09:00', evento: 'Remanejamento planejado', detalhe: 'Movimentação para zona de Picking solicitada', tipo: 'plan' },
  ],
  'LT-0238': [
    { data: '08/02/2026 07:55', evento: 'Entrada no armazém', detalhe: 'Recebido via NF 000.512 — Grupo Freios Sul', tipo: 'entrada' },
    { data: '09/02/2026 11:20', evento: 'Bloqueio de qualidade', detalhe: 'Peça bloqueada para inspeção', tipo: 'block' },
  ],
  'LT-0233': [
    { data: '05/02/2026 10:00', evento: 'Entrada no armazém', detalhe: 'Recebido via NF 000.498 — Rede Filtros SP', tipo: 'entrada' },
    { data: '06/02/2026 08:30', evento: 'Alocação de endereço', detalhe: 'Endereço R2_PP1_CL002_N003', tipo: 'mov' },
    { data: '14/02/2026 15:10', evento: 'Fracionamento de lote', detalhe: 'Lote LT-0233-A criado com 20 un. → R2_PP1_CL002_N002', tipo: 'split' },
  ],
};

const HIST_TIPO = {
  'entrada': { color: 'text-green-600',  icon: Plus,       dotColor: 'bg-green-500' },
  'mov':     { color: 'text-blue-600',   icon: MapPin,     dotColor: 'bg-blue-500' },
  'block':   { color: 'text-red-600',    icon: Lock,       dotColor: 'bg-red-500' },
  'split':   { color: 'text-purple-600', icon: Scissors,   dotColor: 'bg-purple-500' },
  'plan':    { color: 'text-amber-600',  icon: ClipboardList, dotColor: 'bg-amber-400' },
};

// ─── MODAL BLOQUEAR / DESBLOQUEAR ──────────────────────────────────
function BloqueioModal({ lote, modo, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const isBlock = modo === 'bloquear';

  const handle = () => {
    setLoading(true);
    setTimeout(() => { onConfirm(lote.id, motivo); onClose(); }, 1400);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className={cn('px-7 py-5 flex items-center justify-between', isBlock ? 'bg-gradient-to-r from-red-700 to-red-600' : 'bg-gradient-to-r from-green-700 to-green-600')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              {isBlock ? <Lock className="w-5 h-5 text-white" /> : <Unlock className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Gerenciador de Lote</p>
              <h2 className="text-base font-black text-white uppercase">{isBlock ? 'Bloquear Lote' : 'Desbloquear Lote'}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          {/* Info do lote */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            {[
              { l: 'Lote',     v: lote.lote },
              { l: 'Produto',  v: `${lote.codigo} — ${lote.descricao}` },
              { l: 'Local',    v: lote.local },
              { l: 'Qtde',     v: `${lote.qtdUnit} un.` },
              { l: 'Status atual', v: null },
            ].map(f => (
              <div key={f.l} className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.l}</span>
                {f.v ? <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.v}</span> : <StatusBadge status={lote.status} />}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Motivo da Ocorrência {isBlock && '*'}
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder={isBlock
                ? 'Ex: Peça aguardando inspeção de qualidade; Embalagem com avaria...'
                : 'Ex: Inspeção concluída — aprovada para uso; Fornecedor homologado...'
              }
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:border-secondary transition-all resize-none"
            />
            {isBlock && !motivo && (
              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Informe o motivo para bloquear o lote.</p>
            )}
          </div>

          {!isBlock && lote.motivo && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl">
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Motivo do bloqueio anterior</p>
              <p className="text-xs font-medium text-red-700 dark:text-red-400">{lote.motivo}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handle} disabled={(isBlock && !motivo) || loading}
              className={cn('flex-1 py-3 rounded-2xl text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 uppercase tracking-wider',
                isBlock ? 'bg-red-600' : 'bg-green-600'
              )}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Processando...</>
                : isBlock ? <><Lock className="w-4 h-4" />Confirmar Bloqueio</> : <><Unlock className="w-4 h-4" />Confirmar Desbloqueio</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DIVIDIR LOTE (FRACIONAMENTO) ────────────────────────────
function DividirModal({ lote, onClose, onConfirm }) {
  const [novaQtd, setNovaQtd]     = useState('');
  const [novoLocal, setNovoLocal] = useState('');
  const [loading, setLoading]     = useState(false);
  const [preview, setPreview]     = useState(false);

  const qtdNum    = Number(novaQtd);
  const restante  = lote.qtdUnit - qtdNum;
  const loteFNum  = lote.lote + '-F' + String(Date.now()).slice(-3);
  const valid     = qtdNum > 0 && qtdNum < lote.qtdUnit && novoLocal;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { onConfirm(lote.id, qtdNum, novoLocal, loteFNum); onClose(); }, 1600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Fracionamento de Lote</p>
              <h2 className="text-base font-black text-white uppercase">Dividir Lote</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          {/* Lote pai */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/40 rounded-2xl">
            <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Lote Pai (Origem)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: 'Lote',    v: lote.lote },
                { l: 'Produto', v: lote.codigo },
                { l: 'Qtd Atual', v: `${lote.qtdUnit} un.` },
              ].map(f => (
                <div key={f.l} className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{f.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nova Quantidade (Lote Filho) *</label>
              <input type="number" min={1} max={lote.qtdUnit - 1} value={novaQtd} onChange={e => { setNovaQtd(e.target.value); setPreview(false); }}
                placeholder="Ex: 20"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-center outline-none focus:border-purple-500 transition-all" />
              {qtdNum >= lote.qtdUnit && novaQtd && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Qtde deve ser menor que {lote.qtdUnit}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Endereço Destino (Lote Filho) *</label>
              <input value={novoLocal} onChange={e => setNovoLocal(e.target.value)} placeholder="Ex: R1_PP1_C2"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition-all" />
            </div>
          </div>

          {/* Preview do fracionamento */}
          {valid && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resultado do Fracionamento</p>
              <div className="flex items-center gap-3">
                {/* Pai atualizado */}
                <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">🏷️ Lote Pai</p>
                  <code className="text-xs font-black text-slate-800 dark:text-white block">{lote.lote}</code>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-[9px] text-slate-400 line-through">{lote.qtdUnit} un.</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-black text-blue-600">{restante} un.</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">{lote.local}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-purple-600" />
                </div>
                {/* Filho gerado */}
                <div className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mb-1">✨ Lote Filho (Novo)</p>
                  <code className="text-xs font-black text-purple-700 dark:text-purple-400 block">{loteFNum}</code>
                  <p className="text-sm font-black text-purple-700 dark:text-purple-400 mt-1">{qtdNum} un.</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{novoLocal || '—'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleConfirm} disabled={!valid || loading}
              className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fracionando...</> : <><Scissors className="w-4 h-4" />Fracionar Lote</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GAVETA LATERAL — HISTÓRICO DO LOTE ─────────────────────────────
function HistoricoDrawer({ lote, onClose }) {
  const hist = HISTORICO[lote.lote] || [];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-[420px] bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Rastreabilidade</p>
              <h2 className="text-sm font-black text-white uppercase">Histórico do Lote</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: 'Lote',    v: lote.lote },
              { l: 'Produto', v: lote.codigo },
              { l: 'Qtde',    v: `${lote.qtdUnit} un.` },
            ].map(f => (
              <div key={f.l} className="text-center p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
                <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">{f.v}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-3 text-center">{lote.descricao}</p>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          {hist.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Nenhum evento registrado para este lote.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-6">
                {hist.map((ev, i) => {
                  const t = HIST_TIPO[ev.tipo] || HIST_TIPO['mov'];
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 shadow-sm z-10', t.dotColor)}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={cn('text-xs font-black', t.color)}>{ev.evento}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">{ev.detalhe}</p>
                        <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{ev.data}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* Entrada no sistema */}
                <div className="flex gap-4 relative opacity-50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900 z-10">
                    <Hash className="w-3.5 h-3.5 text-white dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-500">Lote gerado no sistema</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{lote.entrada}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function LotManager() {
  const [lotes, setLotes]           = useState(INITIAL_LOTES);
  const [selectedId, setSelectedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSearch, setFilterSearch] = useState('');
  const [modal, setModal]           = useState(null); // 'bloquear'|'desbloquear'|'dividir'|'historico'

  const selected = lotes.find(l => l.id === selectedId);
  const filtered = lotes.filter(l => {
    if (filterStatus !== 'Todos' && l.status !== filterStatus) return false;
    const q = filterSearch.toLowerCase();
    if (q && !l.lote.toLowerCase().includes(q) && !l.codigo.toLowerCase().includes(q) && !l.descricao.toLowerCase().includes(q)) return false;
    return true;
  });

  const kpiLib  = lotes.filter(l => l.status === 'Liberado').length;
  const kpiBlk  = lotes.filter(l => l.status === 'Bloqueado').length;
  const kpiFilhos = lotes.filter(l => l.parent).length;

  const handleBloqueio = (id, motivo) => {
    setLotes(prev => prev.map(l => l.id === id
      ? { ...l, status: l.status === 'Bloqueado' ? 'Liberado' : 'Bloqueado', motivo: motivo || null }
      : l
    ));
    setSelectedId(null);
  };

  const handleDividir = (paiId, novaQtd, novoLocal, filhoLote) => {
    setLotes(prev => {
      const pai = prev.find(l => l.id === paiId);
      const filho = {
        id: Date.now(),
        lote: filhoLote,
        local: novoLocal,
        codigo: pai.codigo,
        descricao: pai.descricao,
        qtdUnit: novaQtd,
        status: 'Liberado',
        parent: pai.lote,
        motivo: null,
        entrada: new Date().toLocaleDateString('pt-BR'),
      };
      return [
        ...prev.map(l => l.id === paiId ? { ...l, qtdUnit: l.qtdUnit - novaQtd } : l),
        filho,
      ];
    });
    setSelectedId(null);
  };

  const closeCan = () => setModal(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-secondary to-purple-600" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-purple-700 flex items-center justify-center shadow-lg">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 4 — Movimentação Interna e Estoque</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerenciador de Lote e Fracionamento</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Rastreabilidade completa · Bloqueio de qualidade · Divisão de lotes</p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="flex gap-3 md:ml-auto">
            {[
              { label: 'Liberados',    count: kpiLib,    color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500', filter: 'Liberado' },
              { label: 'Bloqueados',   count: kpiBlk,    color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',         dot: 'bg-red-500',   filter: 'Bloqueado' },
              { label: 'Lotes Filhos', count: kpiFilhos, color: 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500', filter: null },
            ].map(k => (
              <button key={k.label}
                onClick={() => k.filter && setFilterStatus(filterStatus === k.filter ? 'Todos' : k.filter)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-current/20 transition-all',
                  k.color,
                  filterStatus === k.filter ? 'scale-105 shadow-md' : k.filter ? 'hover:scale-105' : 'cursor-default'
                )}>
                <div className={cn('w-2.5 h-2.5 rounded-full', k.dot)} />
                <div>
                  <p className="text-lg font-black leading-none">{k.count}</p>
                  <p className="text-[8px] uppercase tracking-wider leading-none opacity-70">{k.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button disabled={!selectedId || selected?.status === 'Bloqueado'}
          onClick={() => setModal('bloquear')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Lock className="w-3.5 h-3.5" />Bloquear Lote
        </button>
        <button disabled={!selectedId || selected?.status === 'Liberado'}
          onClick={() => setModal('desbloquear')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Unlock className="w-3.5 h-3.5" />Desbloquear Lote
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button disabled={!selectedId}
          onClick={() => setModal('dividir')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Scissors className="w-3.5 h-3.5" />Dividir Lote (Fracionar)
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button disabled={!selectedId}
          onClick={() => setModal('historico')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <ClipboardList className="w-3.5 h-3.5" />Histórico do Lote
        </button>

        <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {selectedId ? `Lote ${selected?.lote} selecionado` : 'Nenhum lote selecionado'}
        </span>
      </div>

      {/* ═══════════ FILTROS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
            placeholder="Lote, código ou descrição..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-64" />
        </div>
        <div className="flex gap-1.5">
          {['Todos', 'Liberado', 'Bloqueado'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all',
                filterStatus === s
                  ? s === 'Bloqueado' ? 'bg-red-600 text-white' : s === 'Liberado' ? 'bg-green-600 text-white' : 'bg-secondary text-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}>{s}</button>
          ))}
        </div>
        <button onClick={() => { setFilterStatus('Todos'); setFilterSearch(''); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" /> Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400">{filtered.length} lote{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ═══════════ GRID PRINCIPAL ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['', 'Lote', 'Local / Endereço', 'Cód. Produto', 'Descrição', 'Qtde Unitária', 'Lote Pai', 'Status'].map((h, i) => (
                <th key={i} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhum lote encontrado com os filtros aplicados.</td></tr>
            )}
            {filtered.map(item => {
              const isSel = item.id === selectedId;
              return (
                <tr key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all',
                    item.status === 'Bloqueado' && 'bg-red-50/30 dark:bg-red-950/10',
                    item.parent && 'bg-purple-50/20 dark:bg-purple-950/10',
                    isSel
                      ? 'border-l-4 border-l-secondary bg-secondary/5 dark:bg-secondary/5'
                      : 'border-l-4 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}>
                  <td className="p-4">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSel ? 'bg-secondary scale-150' : 'bg-transparent')} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-black text-slate-800 dark:text-white">{item.lote}</code>
                      {item.parent && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md uppercase tracking-wider">Filho</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{item.local}</code>
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-black text-secondary">{item.codigo}</code>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px]">
                    <span className="truncate block">{item.descricao}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-black text-slate-800 dark:text-white tabular-nums">{item.qtdUnit}</span>
                    <span className="text-[9px] text-slate-400 font-bold ml-1">un.</span>
                  </td>
                  <td className="p-4">
                    {item.parent
                      ? <div className="flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 text-purple-500" /><code className="text-[10px] font-bold text-purple-600">{item.parent}</code></div>
                      : <span className="text-[9px] text-slate-300 dark:text-slate-600">—</span>
                    }
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <StatusBadge status={item.status} />
                      {item.status === 'Bloqueado' && item.motivo && (
                        <p className="text-[9px] text-red-500 font-medium max-w-[180px] leading-tight">{item.motivo.slice(0, 40)}...</p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAIS & GAVETA */}
      {modal === 'bloquear'    && selected && <BloqueioModal lote={selected} modo="bloquear"    onClose={closeCan} onConfirm={handleBloqueio} />}
      {modal === 'desbloquear' && selected && <BloqueioModal lote={selected} modo="desbloquear" onClose={closeCan} onConfirm={handleBloqueio} />}
      {modal === 'dividir'     && selected && <DividirModal  lote={selected}                   onClose={closeCan} onConfirm={handleDividir} />}
      {modal === 'historico'   && selected && <HistoricoDrawer lote={selected}                 onClose={closeCan} />}
    </div>
  );
}
