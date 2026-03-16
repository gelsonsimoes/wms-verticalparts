import React, { useState, useId } from 'react';
import {
  RefreshCw,
  ArrowLeftRight,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Link2,
  CheckSquare,
  Zap,
  X,
  Filter,
  Package,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── STATUS CONFIG ──────────────────────────────────────────────────
const STATUS_CFG = {
  'Aguardando':        { color: 'text-slate-600  bg-slate-100  dark:bg-slate-800  dark:text-slate-400',  dot: 'bg-slate-400',          icon: Clock },
  'Planejado':         { color: 'text-blue-700   bg-blue-100   dark:bg-blue-900/30  dark:text-blue-400', dot: 'bg-blue-500',           icon: CheckSquare },
  'Origem Realizada':  { color: 'text-amber-700  bg-amber-100  dark:bg-amber-900/30 dark:text-amber-400',dot: 'bg-amber-400',          icon: ArrowRight },
  'Destino Iniciado':  { color: 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500',     icon: Loader2 },
  'Pendente':          { color: 'text-red-700    bg-red-100    dark:bg-red-900/30   dark:text-red-400',  dot: 'bg-red-500 animate-pulse', icon: AlertCircle },
  'Finalizado':        { color: 'text-green-700  bg-green-100  dark:bg-green-900/30 dark:text-green-400',dot: 'bg-green-500',          icon: CheckCircle2 },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  const Icon = cfg.icon || Clock;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {status}
    </span>
  );
}

// ─── MOCK DATA ──────────────────────────────────────────────────────
const INITIAL = [
  { id: 1, origemEnd: 'R1_PP1_CL001_N004', tipoOrigem: 'Pulmão',   destEnd: 'R1_PP1_CL001_N001', tipoDest: 'Picking',   setorOrig: 'SETOR-A', setorDest: 'SETOR-A', produto: 'VEPEL-BPI-174FX — Barreira de Proteção Infravermelha', qtd: 48, status: 'Planejado',        lote: 'LT-0241' },
  { id: 2, origemEnd: 'R1_PP2_CL003_N005', tipoOrigem: 'Pulmão',   destEnd: 'R1_PP2_CL003_N001', tipoDest: 'Picking',   setorOrig: 'SETOR-B', setorDest: 'SETOR-B', produto: 'VPER-ESS-NY-27MM — Escova de Segurança (Nylon)', qtd: 12, status: 'Origem Realizada', lote: 'LT-0238' },
  { id: 3, origemEnd: 'R2_PP1_CL002_N003', tipoOrigem: 'Reserva',  destEnd: 'R2_PP1_CL002_N001', tipoDest: 'Picking',   setorOrig: 'SETOR-C', setorDest: 'SETOR-C', produto: 'VPER-PAL-INO-1000 — Pallet de Aço Inox (1000mm)', qtd: 60, status: 'Finalizado',        lote: 'LT-0233' },
  { id: 4, origemEnd: 'R1_PP1_CL004_N006', tipoOrigem: 'Pulmão',   destEnd: 'R1_PP1_CL004_N001', tipoDest: 'Picking',   setorOrig: 'SETOR-A', setorDest: 'SETOR-A', produto: 'VPER-INC-ESQ — InnerCap (Esquerdo)', qtd: 24, status: 'Pendente',          lote: '' },
  { id: 5, origemEnd: 'R1_PP1_CL002_N005', tipoOrigem: 'Pulmão',   destEnd: 'R1_PP1_CL002_N002', tipoDest: 'Flow Rack', setorOrig: 'SETOR-D', setorDest: 'SETOR-D', produto: 'VPER-LUM-LED-VRD-24V — Luminária em LED Verde 24V', qtd: 36, status: 'Destino Iniciado',   lote: 'LT-0228' },
];

const TIPO_REGIAO = ['Pulmão', 'Picking', 'Reserva', 'Flow Rack', 'Bloqueado', 'Expedição'];
const SETORES     = ['SETOR-A', 'SETOR-B', 'SETOR-C', 'SETOR-D', 'SETOR-E'];

// ─── MODAL CADASTRAR / ALTERAR ──────────────────────────────────────
function CadastrarModal({ item, onClose, onSave }) {
  const isEdit = !!item;
  const [form, setForm] = useState(item || {
    origemEnd: '', tipoOrigem: 'Pulmão', destEnd: '', tipoDest: 'Picking',
    setorOrig: 'SETOR-A', setorDest: 'SETOR-A', produto: '', qtd: '',
    confirmarQtde: false, status: 'Aguardando',
  });
  const replId = useId();
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.origemEnd && form.destEnd && form.produto && form.qtd;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden">
        <div className={cn('px-7 py-5 flex items-center justify-between', isEdit ? 'bg-amber-600' : 'bg-secondary')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              {isEdit ? <Pencil className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Cat. 4 — Movimentação</p>
              <h2 className={cn('text-base font-black uppercase', isEdit ? 'text-white' : 'text-primary')}>
                {isEdit ? 'Alterar Remanejamento' : 'Cadastrar Remanejamento'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          {/* Origem */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-3">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Origem (Pulmão)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label htmlFor={`${replId}-origem-end`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Endereço Origem *</label>
                <input
                  id={`${replId}-origem-end`}
                  value={form.origemEnd}
                  onChange={e => f('origemEnd', e.target.value)}
                  placeholder="Ex: R1_PP1_A1"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${replId}-tipo-origem`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo Região Origem</label>
                <select
                  id={`${replId}-tipo-origem`}
                  value={form.tipoOrigem}
                  onChange={e => f('tipoOrigem', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                >
                  {TIPO_REGIAO.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${replId}-setor-orig`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Setor Origem</label>
                <select
                  id={`${replId}-setor-orig`}
                  value={form.setorOrig}
                  onChange={e => f('setorOrig', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                >
                  {SETORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/40 rounded-2xl space-y-3">
            <p className="text-[9px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Destino (Picking)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label htmlFor={`${replId}-dest-end`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Endereço Destino *</label>
                <input id={`${replId}-dest-end`} value={form.destEnd} onChange={e => f('destEnd', e.target.value)} placeholder="Ex: R1_PP1_A1"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${replId}-tipo-dest`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo Região Destino</label>
                <select id={`${replId}-tipo-dest`} value={form.tipoDest} onChange={e => f('tipoDest', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all">
                  {TIPO_REGIAO.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${replId}-setor-dest`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Setor Destino</label>
                <select id={`${replId}-setor-dest`} value={form.setorDest} onChange={e => f('setorDest', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all">
                  {SETORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Produto + Qtde */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label htmlFor={`${replId}-prod-name`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Produto (SKU ou Descrição) *</label>
              <input id={`${replId}-prod-name`} value={form.produto} onChange={e => f('produto', e.target.value)} placeholder="Ex: VP-FR4429-X — Pastilha de Freio"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${replId}-prod-qtd`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qtde *</label>
              <input id={`${replId}-prod-qtd`} type="number" min={1} value={form.qtd} onChange={e => f('qtd', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all text-center" />
            </div>
          </div>

          {/* Confirmar Qtde */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-secondary/5 transition-all group">
            <button
              type="button"
              role="checkbox"
              aria-checked={form.confirmarQtde}
              onClick={() => f('confirmarQtde', !form.confirmarQtde)}
              className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                form.confirmarQtde ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600 group-hover:border-secondary'
              )}
            >
              {form.confirmarQtde && <CheckSquare className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Confirmar Quantidade — Requer bipagem no coletor para validar qtde física</span>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button disabled={!valid} onClick={() => { onSave(form); onClose(); }}
              className={cn('flex-1 py-3 rounded-2xl text-sm font-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 uppercase tracking-wider',
                isEdit ? 'bg-amber-600 text-white' : 'bg-secondary text-primary'
              )}>
              {isEdit ? <><Pencil className="w-4 h-4" />Salvar Alteração</> : <><Plus className="w-4 h-4" />Cadastrar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL REMANEJAR (EMERGENCIAL) ──────────────────────────────────
function RemanejArModal({ item, onClose, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const timeoutRef1 = React.useRef();
  const timeoutRef2 = React.useRef();

  const handleConfirm = () => {
    setConfirming(true);
    timeoutRef1.current = setTimeout(() => { setDone(true); }, 1500);
    timeoutRef2.current = setTimeout(() => { onConfirm(item.id); onClose(); }, 2300);
  };

  React.useEffect(() => () => {
    clearTimeout(timeoutRef1.current);
    clearTimeout(timeoutRef2.current);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-amber-200 dark:border-amber-900/60 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Movimentação Emergencial</p>
              <h2 className="text-base font-black text-white uppercase">Remanejar via Web</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
              O remanejamento emergencial executa a movimentação direto no sistema, <strong>sem uso do coletor de dados</strong>. A operação será registrada com usuário, data e hora para auditoria.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { l: 'Produto',         v: item.produto },
              { l: 'Endereço Origem', v: `${item.origemEnd} (${item.tipoOrigem})` },
              { l: 'Endereço Destino',v: `${item.destEnd} (${item.tipoDest})` },
              { l: 'Quantidade',      v: `${item.qtd} un.` },
              { l: 'Operador Web',    v: 'danilo.supervisor — 22/02/2026 18:10' },
            ].map(f => (
              <div key={f.l} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.l}</span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 max-w-[220px] text-right">{f.v}</span>
              </div>
            ))}
          </div>

          {done && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
              <p className="text-sm font-black text-green-700">Movimentação registrada com sucesso!</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleConfirm} disabled={confirming}
              className="flex-1 py-3 rounded-2xl bg-amber-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
              {confirming ? <><Loader2 className="w-4 h-4 animate-spin" />Executando...</> : <><Zap className="w-4 h-4" />Confirmar Remanejamento</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function StockReplenishment() {
  const [items, setItems]             = useState(INITIAL);
  const [selectedId, setSelectedId]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSearch, setFilterSearch] = useState('');
  const [showCadastrar, setShowCadastrar] = useState(false);
  const [showAlterar, setShowAlterar]    = useState(false);
  const [showRemanejar, setShowRemanejar]= useState(false);
  const [finalizing, setFinalizing]     = useState(false);
  const [formando, setFormando]         = useState(false);
  const [toast, setToast]               = useState(null);
  const replId = useId();

  const finalTimeoutRef = React.useRef();
  const formTimeoutRef = React.useRef();
  const toastTimeoutRef = React.useRef();

  React.useEffect(() => () => {
    clearTimeout(finalTimeoutRef.current);
    clearTimeout(formTimeoutRef.current);
    clearTimeout(toastTimeoutRef.current);
  }, []);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const selected = items.find(i => i.id === selectedId);

  const filtered = items.filter(i => {
    if (filterStatus !== 'Todos' && i.status !== filterStatus) return false;
    if (filterSearch && !i.produto.toLowerCase().includes(filterSearch.toLowerCase())
      && !i.origemEnd.toLowerCase().includes(filterSearch.toLowerCase())
      && !i.destEnd.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const handleSave = (form) => {
    if (showAlterar && selected) {
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { ...form, id: prev.length + 1, lote: '', qtd: Number(form.qtd) }]);
    }
    setSelectedId(null);
  };

  const handleExcluir = () => {
    if (!selected) return;
    setItems(prev => prev.filter(i => i.id !== selected.id));
    setSelectedId(null);
  };

  const handleFinalizar = () => {
    if (!selected) return;
    setFinalizing(true);
    finalTimeoutRef.current = setTimeout(() => {
      setItems(prev => prev.map(i => i.id === selectedId ? { ...i, status: 'Planejado' } : i));
      setFinalizing(false);
      showToast('Planejamento finalizado com sucesso!');
    }, 1800);
  };

  const handleFormarLote = () => {
    setFormando(true);
    formTimeoutRef.current = setTimeout(() => {
      setFormando(false);
      showToast('Lotes formados com sucesso!');
    }, 1600);
  };

  const handleRemanejado = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'Finalizado' } : i));
    setSelectedId(null);
  };

  const kpis = Object.keys(STATUS_CFG).reduce((acc, s) => { acc[s] = items.filter(i => i.status === s).length; return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">
      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300"
          role="status"
        >
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white",
            toast.type === 'success' ? 'bg-green-500 border-green-700' : 
            toast.type === 'error'   ? 'bg-red-500 border-red-700' : 
            'bg-blue-600 border-blue-800'
          )}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notificação</p>
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-secondary to-purple-600" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-purple-700 flex items-center justify-center shadow-lg">
              <ArrowLeftRight className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 4 — Movimentação Interna e Estoque</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">4.4 Remanejar Produtos</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Pulmão → Picking · Transferência planejada para evitar ruptura de separação</p>
            </div>
          </div>
          {/* KPI chips */}
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {Object.entries(STATUS_CFG).map(([key, def]) => (
              kpis[key] > 0 && (
                <button key={key}
                  onClick={() => setFilterStatus(filterStatus === key ? 'Todos' : key)}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all',
                    filterStatus === key ? def.color + ' border-current/30 scale-105 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:scale-105'
                  )}>
                  <div className={cn('w-2 h-2 rounded-full', def.dot)} />{kpis[key]} {key}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">

        {/* Grupo Planejamento */}
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Planejamento</span>
        <button onClick={() => setShowCadastrar(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md">
          <Plus className="w-3.5 h-3.5" />Cadastrar
        </button>
        <button disabled={!selectedId}
          onClick={() => setShowAlterar(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 text-xs font-black uppercase tracking-wider hover:bg-amber-50 disabled:opacity-30 transition-all">
          <Pencil className="w-3.5 h-3.5" />Alterar
        </button>
        <button disabled={!selectedId}
          onClick={handleExcluir}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all">
          <Trash2 className="w-3.5 h-3.5" />Excluir
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Grupo Ações Físicas */}
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ações Físicas</span>
        <button onClick={handleFormarLote} disabled={formando}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md">
          {formando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
          {formando ? 'Formando...' : 'Formar Lotes'}
        </button>
        <button
          disabled={!selectedId}
          onClick={() => showToast('Funcionalidade "Vincular Lotes" em desenvolvimento.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 text-xs font-black uppercase tracking-wider hover:bg-blue-50 disabled:opacity-30 transition-all"
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />Vincular Lotes
        </button>
        <button disabled={!selectedId || finalizing}
          onClick={handleFinalizar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          {finalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {finalizing ? 'Liberando...' : 'Finalizar Planejamento'}
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* BOTÃO ESPECIAL REMANEJAR */}
        <button disabled={!selectedId}
          onClick={() => setShowRemanejar(true)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 shadow-md',
            selectedId
              ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 active:scale-95 animate-pulse hover:animate-none'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-30'
          )}>
          <Zap className="w-3.5 h-3.5" />
          Remanejar (Emergencial)
        </button>
      </div>

      {/* ═══════════ FILTROS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <div className="relative flex items-center">
          <label htmlFor={`${replId}-filter-search`} className="sr-only">Pesquisar produto ou endereço</label>
          <input
            id={`${replId}-filter-search`}
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Produto, endereço origem ou destino..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-64"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" aria-hidden="true" />
        </div>
        <button onClick={() => { setFilterStatus('Todos'); setFilterSearch(''); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" aria-hidden="true" /> Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ═══════════ GRID PRINCIPAL ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              <th scope="col" className="p-4 w-10" />
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">End. Origem</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tipo Origem</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">End. Destino</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tipo Destino</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Setor Orig.</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Setor Dest.</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Produto</th>
              <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Qtd</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Lote</th>
              <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhum remanejamento encontrado. Cadastre um novo ou ajuste os filtros.</td></tr>
            )}
            {filtered.map(item => {
              const isSel = item.id === selectedId;
              return (
                <tr key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all group',
                    item.status === 'Pendente' && 'bg-red-50/40 dark:bg-red-950/10',
                    item.status === 'Finalizado' && 'opacity-60',
                    isSel
                      ? 'bg-secondary/5 dark:bg-secondary/5 border-l-4 border-l-secondary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                  )}>
                  <td className="p-4">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSel ? 'bg-secondary scale-150' : 'bg-transparent')} />
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{item.origemEnd}</code>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',
                      item.tipoOrigem === 'Pulmão' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    )}>{item.tipoOrigem}</span>
                  </td>
                  <td className="p-4">
                    <code className="text-xs font-black text-green-700 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">{item.destEnd}</code>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',
                      item.tipoDest === 'Picking' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    )}>{item.tipoDest}</span>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-500">{item.setorOrig}</td>
                  <td className="p-4 text-xs font-bold text-slate-500">{item.setorDest}</td>
                  <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px]">
                    <span className="truncate block">{item.produto}</span>
                  </td>
                  <td className="p-4 text-xs font-black text-slate-800 dark:text-white tabular-nums text-center">{item.qtd}</td>
                  <td className="p-4">
                    {item.lote ? <code className="text-[9px] font-bold text-slate-500">{item.lote}</code> : <span className="text-[9px] text-slate-300 italic">—</span>}
                  </td>
                  <td className="p-4"><StatusBadge status={item.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAIS */}
      {showCadastrar && <CadastrarModal onClose={() => setShowCadastrar(false)} onSave={handleSave} />}
      {showAlterar && selected && <CadastrarModal item={selected} onClose={() => setShowAlterar(false)} onSave={handleSave} />}
      {showRemanejar && selected && <RemanejArModal item={selected} onClose={() => setShowRemanejar(false)} onConfirm={handleRemanejado} />}
    </div>
  );
}
