import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PackageSearch,
  Calendar,
  FileText,
  Boxes,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  RotateCcw,
  Barcode,
  Hash,
  X,
  Zap,
  ClipboardList,
  AlertTriangle,
  Camera,
  Search,
  Tag,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const STATUS_COLORS = {
  'Pendente':             'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'Aguardando Alocação':  'bg-blue-100  text-blue-700  dark:bg-blue-500/10  dark:text-blue-400',
  'Finalizada':           'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
};

const TIPO_OPTS = ['Compra Nacional','Devolução Cliente','Importação Direta','Transferência'];

// ─── TOAST ────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  return (
    <div role="alert" onClick={onClose}
      className={cn(
        'fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300 cursor-pointer',
        type === 'erro' ? 'bg-red-50 text-red-700 border-red-200' :
        type === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-green-50 text-green-700 border-green-200'
      )}>
      {type === 'erro' ? <XCircle className="w-4 h-4" /> :
       type === 'warn' ? <AlertTriangle className="w-4 h-4" /> :
       <CheckCircle2 className="w-4 h-4" />}
      {msg}
    </div>
  );
}

// ─── MODAL CONFIRM ────────────────────────────────────────────────────
function ModalConfirm({ title, body, confirmLabel, confirmClass, onClose, onConfirm }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true"
        className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 w-full max-w-sm shadow-2xl p-6 space-y-4">
        <p className="text-sm font-black text-slate-800 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500">{body}</p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-500">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className={cn('flex-1 py-2.5 text-white rounded-xl text-xs font-black', confirmClass)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TOOLBAR BUTTON ───────────────────────────────────────────────────
const ToolbarButton = ({ label, icon: IconComponent, onClick, color = 'slate', disabled = false, badge }) => (
  <button onClick={onClick} disabled={disabled}
    className={cn(
      'flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all min-w-[90px] group relative',
      disabled ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50' :
      color === 'secondary' ? 'border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary hover:text-primary hover:border-secondary' :
      'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10'
    )}>
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors group-hover:bg-white/10">
      <IconComponent className="w-5 h-5" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight whitespace-nowrap">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">{badge}</span>
    )}
  </button>
);

// ─── MODAL NOVA OR ────────────────────────────────────────────────────
function ModalNovaOR({ onClose, onSalvar, salvando }) {
  const [form, setForm] = useState({
    depositante: '', tipo: 'Compra Nacional', nf: '',
    total_itens: 1, data_entrada: new Date().toISOString().slice(0,10),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true"
        className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm font-black">Nova Ordem de Recebimento</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depositante *</label>
              <input value={form.depositante} onChange={e => set('depositante', e.target.value)}
                placeholder="Nome do depositante"
                className="w-full border-2 border-slate-200 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
                className="w-full border-2 border-slate-200 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800">
                {TIPO_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº NF</label>
              <input value={form.nf} onChange={e => set('nf', e.target.value)}
                placeholder="NF-00000"
                className="w-full border-2 border-slate-200 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</label>
              <input type="number" min={1} value={form.total_itens} onChange={e => set('total_itens', parseInt(e.target.value) || 1)}
                className="w-full border-2 border-slate-200 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Entrada</label>
              <input type="date" value={form.data_entrada} onChange={e => set('data_entrada', e.target.value)}
                className="w-full border-2 border-slate-200 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={salvando}
              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-500 disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={() => {
              if (!form.depositante) { alert('Informe o depositante.'); return; }
              onSalvar(form);
            }} disabled={salvando}
              className="flex-1 py-2.5 bg-secondary text-primary rounded-xl text-xs font-black hover:bg-secondary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
              {salvando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {salvando ? 'Salvando...' : 'Criar O.R.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function ReceivingManager() {
  const { warehouseId } = useApp();

  const [ordens,       setOrdens]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('1 dia');
  const [selectedOR,   setSelectedOR]   = useState(null);
  const [salvando,     setSalvando]     = useState(false);

  const [showBlindModal,    setShowBlindModal]    = useState(false);
  const [showDamageModal,   setShowDamageModal]   = useState(false);
  const [showNFModal,       setShowNFModal]       = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showNovaOR,        setShowNovaOR]        = useState(false);
  const [confirmModal,      setConfirmModal]      = useState(null);
  const [toast,             setToast]             = useState(null);

  const [barcode,    setBarcode]   = useState('');
  const [quantity,   setQuantity]  = useState(1);
  const [lastScan,   setLastScan]  = useState(null);
  const [damageType, setDamageType] = useState(null);
  const [, setScanLog] = useState([]);

  const scanInputRef = useRef(null);
  const toastRef     = useRef(null);

  const mockQtys = useMemo(() => [8, 14, 3, 20, 11], []);

  // ── Toast ────────────────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };
  useEffect(() => () => clearTimeout(toastRef.current), []);

  // ── Supabase fetch ───────────────────────────────────────────────
  const fetchOrdens = async () => {
    if (!warehouseId) return;
    const { data, error } = await supabase
      .from('ordens_recebimento')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false });
    if (error) { console.error('ordens_recebimento:', error); setLoading(false); return; }
    setOrdens(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!warehouseId) return;
    fetchOrdens();
    const channel = supabase
      .channel('or-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_recebimento', filter: `warehouse_id=eq.${warehouseId}` },
        () => fetchOrdens())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [warehouseId]);

  // ── Foco no scan input ───────────────────────────────────────────
  useEffect(() => {
    if (showBlindModal && scanInputRef.current) scanInputRef.current.focus();
  }, [showBlindModal]);

  // ── Escape handlers ──────────────────────────────────────────────
  useEffect(() => {
    const fn = e => {
      if (e.key !== 'Escape') return;
      if (showBlindModal)    { setShowBlindModal(false);    return; }
      if (showDamageModal)   { setShowDamageModal(false);   return; }
      if (showNFModal)       { setShowNFModal(false);       return; }
      if (showProductsModal) { setShowProductsModal(false); return; }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [showBlindModal, showDamageModal, showNFModal, showProductsModal]);

  // ── Scan (bipagem) ───────────────────────────────────────────────
  const handleScan = (e) => {
    e.preventDefault();
    if (!barcode) return;
    setLastScan({ sku: 'VEPEL-BPI-174FX', desc: 'Kit de Pastilhas de Freio - VParts', barcode });
    setBarcode('');
    if (scanInputRef.current) scanInputRef.current.focus();
    setOrdens(prev => prev.map(o =>
      o.id === selectedOR && o.conferidos < o.total_itens
        ? { ...o, conferidos: Math.min(o.conferidos + quantity, o.total_itens) }
        : o
    ));
  };

  // ── Ações status (persistência) ──────────────────────────────────
  const updateStatus = async (id, status, extra = {}) => {
    const { error } = await supabase.from('ordens_recebimento').update({ status, ...extra }).eq('id', id);
    if (error) { showToast('Erro ao atualizar status.', 'erro'); return false; }
    setOrdens(prev => prev.map(o => o.id === id ? { ...o, status, ...extra } : o));
    return true;
  };

  const handleFinalizar = async () => {
    const or = ordens.find(o => o.id === selectedOR);
    if (!or) return;
    if (or.conferidos < or.total_itens) {
      setConfirmModal({
        title: 'Finalizar com divergência?',
        body: `Ainda há ${or.total_itens - or.conferidos} item(ns) não conferido(s) em ${or.codigo}. Finalizar assim mesmo?`,
        confirmLabel: 'Finalizar',
        confirmClass: 'bg-amber-500 hover:bg-amber-600',
        onConfirm: async () => {
          setConfirmModal(null);
          const ok = await updateStatus(selectedOR, 'Aguardando Alocação', { conferidos: or.total_itens });
          if (ok) showToast(`${or.codigo} finalizada! Status: Aguardando Alocação.`);
        },
      });
    } else {
      const ok = await updateStatus(selectedOR, 'Aguardando Alocação');
      if (ok) showToast(`${or.codigo} finalizada! Status: Aguardando Alocação.`);
    }
  };

  const handleConfirmar = async () => {
    const or = ordens.find(o => o.id === selectedOR);
    const ok = await updateStatus(selectedOR, 'Finalizada');
    if (ok) { setSelectedOR(null); showToast(`Alocação confirmada! ${or?.codigo} → Finalizada. Estoque atualizado.`); }
  };

  const handleEstornar = () => {
    const or = ordens.find(o => o.id === selectedOR);
    setConfirmModal({
      title: 'Estornar alocação?',
      body: `Estornar a alocação de ${or?.codigo}? A OR voltará para Pendente.`,
      confirmLabel: 'Estornar',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        setConfirmModal(null);
        const ok = await updateStatus(selectedOR, 'Pendente', { conferidos: 0 });
        if (ok) showToast(`Alocação estornada. ${or?.codigo} voltou para Pendente.`, 'warn');
      },
    });
  };

  const handleRecontagem = async () => {
    const or = ordens.find(o => o.id === selectedOR);
    const ok = await updateStatus(selectedOR, or.status, { conferidos: 0 });
    if (ok) { setScanLog([]); showToast('Recontagem iniciada. Conferidos resetados para 0.', 'warn'); }
  };

  const handleDivergencia = () => {
    const or = ordens.find(o => o.id === selectedOR);
    const diff = or ? or.total_itens - or.conferidos : 0;
    if (diff === 0) showToast('Nenhuma divergência! Todos os itens conferidos.');
    else showToast(`Divergência: ${diff} item(ns) não conferido(s) em ${or?.codigo}.`, 'warn');
  };

  const handleFinalizarConferencia = async () => {
    const or = ordens.find(o => o.id === selectedOR);
    if (or && or.status === 'Pendente') {
      const ok = await updateStatus(selectedOR, 'Aguardando Alocação', { conferidos: or.total_itens });
      if (ok) showToast(`${or.codigo} → Aguardando Alocação.`);
    }
    setShowBlindModal(false);
  };

  // ── Criar nova OR ────────────────────────────────────────────────
  const handleSalvarOR = async (form) => {
    setSalvando(true);
    const codigo = 'OR-' + Date.now().toString().slice(-5);
    const { data, error } = await supabase
      .from('ordens_recebimento')
      .insert([{ ...form, warehouse_id: warehouseId, codigo, conferidos: 0, status: 'Pendente' }])
      .select()
      .single();
    setSalvando(false);
    if (error) { showToast('Erro ao criar O.R.', 'erro'); return; }
    setOrdens(prev => [data, ...prev]);
    setShowNovaOR(false);
    showToast(`O.R. ${data.codigo} criada com sucesso!`);
  };

  // ── Filtros ──────────────────────────────────────────────────────
  const filtradas = useMemo(() =>
    ordens.filter(or => filterStatus === 'Todos' || or.status === filterStatus),
    [ordens, filterStatus]);

  const selectedOrObj = ordens.find(o => o.id === selectedOR);
  const isSelectedPendente    = selectedOrObj?.status === 'Pendente';
  const isSelectedAguardando  = selectedOrObj?.status === 'Aguardando Alocação';
  const isSelectedFinalizada  = selectedOrObj?.status === 'Finalizada';

  const actionGroups = [[
    { label: 'Nova O.R.', icon: Plus, primary: true, onClick: () => setShowNovaOR(true) },
    { label: 'Etiquetas', icon: Tag, onClick: () => {
      if (!selectedOR) { showToast('Selecione uma O.R. primeiro.', 'warn'); return; }
      showToast(`Etiquetas da ${selectedOrObj?.codigo} (${selectedOrObj?.total_itens} itens) enviadas para impressora.`);
    }, disabled: !selectedOR },
    { label: 'Gerar Picking', icon: Zap, onClick: () => {
      if (!selectedOR) { showToast('Selecione uma O.R. primeiro.', 'warn'); return; }
      if (!isSelectedAguardando) { showToast('Finalize a conferência antes de gerar picking.', 'warn'); return; }
      showToast(`Picking gerado para ${selectedOrObj?.codigo}! Acesse 2.10 Separar Pedidos.`);
    }, disabled: !selectedOR || !isSelectedAguardando },
  ]];

  return (
    <EnterprisePageBase
      title="2.4 Gerenciar Recebimento"
      breadcrumbItems={[{ label: 'Entrada e Recebimento' }]}
      actionGroups={actionGroups}
    >
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Confirm modal ── */}
      {confirmModal && (
        <ModalConfirm
          title={confirmModal.title}
          body={confirmModal.body}
          confirmLabel={confirmModal.confirmLabel}
          confirmClass={confirmModal.confirmClass}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}

      {/* ── Nova OR modal ── */}
      {showNovaOR && <ModalNovaOR onClose={() => setShowNovaOR(false)} onSalvar={handleSalvarOR} salvando={salvando} />}

      {/* ── KPIs ── */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pendentes',          val: ordens.filter(o => o.status === 'Pendente').length,            color: 'text-amber-500' },
          { label: 'Aguard. Alocação',   val: ordens.filter(o => o.status === 'Aguardando Alocação').length, color: 'text-blue-500'  },
          { label: 'Finalizadas',        val: ordens.filter(o => o.status === 'Finalizada').length,          color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="text-center bg-white dark:bg-slate-800 border border-slate-100 rounded-2xl px-5 py-3 min-w-[80px]">
            <p className={cn('text-2xl font-black', k.color)}>{k.val}</p>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
          </div>
        ))}
        <p className="text-xs text-slate-500 font-medium self-center ml-1">
          Conferência cega e alocação dinâmica de chão de fábrica
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
          {['Todos', 'Pendente', 'Aguardando Alocação', 'Finalizada'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all',
                filterStatus === s
                  ? 'bg-secondary text-primary shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              )}>
              {s}
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 p-1.5 rounded-2xl flex items-center shadow-sm gap-2">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          {['1 dia', '3 dias', '7 dias'].map(p => (
            <button key={p} onClick={() => setFilterPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all',
                filterPeriod === p ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'
              )}>
              {p}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[10px] text-slate-400 font-medium">{filtradas.length} ordens</div>
      </div>

      {/* ── TOOLBAR: AÇÕES RÁPIDAS ── */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm overflow-x-auto">
        <div className="flex items-start gap-8 min-w-max">
          {/* Grupo Controle */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Controle</p>
            <div className="flex gap-3">
              <ToolbarButton label="Nota Fiscal" icon={FileText} disabled={!selectedOR} onClick={() => setShowNFModal(true)} />
              <ToolbarButton label="Produtos"    icon={Boxes}    disabled={!selectedOR} onClick={() => setShowProductsModal(true)} />
              <ToolbarButton label="Etiquetas"   icon={Tag}      color="secondary" disabled={!selectedOR}
                onClick={() => showToast(`Etiquetas de ${selectedOrObj?.codigo} enviadas para impressora.`)} />
              <ToolbarButton label="Gerar Picking" icon={Zap} disabled={!selectedOR || !isSelectedAguardando}
                onClick={() => showToast(`Picking gerado para ${selectedOrObj?.codigo}! Acesse 2.10.`)} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Conferência */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Conferência</p>
            <div className="flex gap-3">
              <ToolbarButton label="Conferência Cega" icon={Barcode} color="secondary"
                disabled={!selectedOR || isSelectedFinalizada}
                onClick={() => setShowBlindModal(true)} />
              <ToolbarButton label="Recontagem" icon={RotateCcw} disabled={!selectedOR} onClick={handleRecontagem} />
              <ToolbarButton label="Divergência" icon={AlertTriangle} badge="!" disabled={!selectedOR} onClick={handleDivergencia} />
              <ToolbarButton label="Finalizar" icon={CheckCircle2} color="secondary"
                disabled={!selectedOR || !isSelectedPendente}
                onClick={handleFinalizar} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Alocação */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Alocação</p>
            <div className="flex gap-3">
              <ToolbarButton label="Gerar Alocação" icon={Truck}
                disabled={!selectedOR || !isSelectedAguardando}
                onClick={() => showToast(`Mapa de alocação gerado para ${selectedOrObj?.codigo}! Acesse 2.6.`)} />
              <ToolbarButton label="Confirmar" icon={CheckCircle2}
                disabled={!selectedOR || !isSelectedAguardando}
                onClick={handleConfirmar} />
              <ToolbarButton label="Estornar" icon={RotateCcw}
                disabled={!selectedOR || isSelectedPendente}
                onClick={handleEstornar} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MASTER GRID ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-secondary animate-spin" />
          <span className="ml-2 text-sm text-slate-400 font-bold">Carregando ordens...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  {['O.R. / Recebimento','Depositante','Tipo de Entrada','Data','Status','Progresso'].map(h => (
                    <th key={h} scope="col"
                      className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtradas.map(or => (
                  <tr key={or.id}
                    role="button" tabIndex={0}
                    onClick={() => setSelectedOR(or.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOR(or.id); } }}
                    aria-pressed={selectedOR === or.id}
                    className={cn(
                      'group cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset',
                      selectedOR === or.id ? 'bg-secondary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    )}>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center border transition-all',
                          selectedOR === or.id ? 'bg-secondary text-primary border-secondary' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        )}>
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{or.codigo}</span>
                      </div>
                    </td>
                    <td className="p-6"><span className="text-xs font-bold text-slate-600 dark:text-slate-400">{or.depositante}</span></td>
                    <td className="p-6"><span className="text-xs font-black text-primary uppercase tracking-wider">{or.tipo}</span></td>
                    <td className="p-6 text-center">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {or.data_entrada ? String(or.data_entrada).split('-').reverse().join('/') : '—'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest', STATUS_COLORS[or.status])}>
                        {or.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 w-32 mx-auto">
                        <div className="flex justify-between text-[8px] font-black text-slate-400">
                          <span>{or.conferidos} / {or.total_itens}</span>
                          <span>{or.total_itens > 0 ? Math.round((or.conferidos / or.total_itens) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary transition-all"
                            style={{ width: `${or.total_itens > 0 ? (or.conferidos / or.total_itens) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <PackageSearch className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-xs font-bold mb-1">Nenhuma ordem de recebimento encontrada.</p>
                      <button onClick={() => setShowNovaOR(true)}
                        className="mt-2 text-xs text-secondary font-black hover:underline">
                        + Criar primeira O.R.
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFERÊNCIA CEGA ── */}
      {showBlindModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div role="dialog" aria-modal="true" aria-labelledby="blind-modal-title"
            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-3 bg-secondary" />
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border-2 border-secondary/20 relative">
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <Barcode className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h2 id="blind-modal-title" className="text-xl font-black tracking-tight uppercase">Conferência Cega</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    O.R.: <span className="text-secondary">{selectedOrObj?.codigo}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBlindModal(false)} aria-label="Fechar"
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-red-500 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              <form onSubmit={handleScan} className="space-y-4">
                <label htmlFor="blind-scan-input" className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Aguardando Bipagem de Produto...
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-secondary" />
                  </div>
                  <input id="blind-scan-input" ref={scanInputRef} type="text"
                    placeholder="ESCANEIE O CÓDIGO DE BARRAS / SKU"
                    value={barcode} onChange={e => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[24px] py-8 pl-16 pr-8 text-2xl font-black text-secondary placeholder:text-slate-300 focus:border-secondary focus:bg-white outline-none transition-all shadow-inner tracking-widest uppercase"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 tracking-tighter shadow-sm border border-slate-300/50">
                      USB / BT SCANNER READY
                    </span>
                  </div>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="blind-qty-input" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade Contada</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Diminuir"
                      className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center">-</button>
                    <input id="blind-qty-input" type="number" value={quantity} min={1}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 rounded-2xl text-center text-xl font-black text-primary outline-none focus:border-primary" />
                    <button type="button" onClick={() => setQuantity(q => q + 1)} aria-label="Aumentar"
                      className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center">+</button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic mt-1 ml-1">Padrão: Conferência por Unidade (Bip=1)</p>
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <button onClick={() => setShowDamageModal(true)}
                    className="w-full h-16 border-2 border-red-200 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all group">
                    <AlertCircle className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-widest">Informar Avaria / Dano</span>
                  </button>
                </div>
              </div>

              {lastScan && (
                <div className="bg-primary text-white rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Hash className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">Último Item Bipado!</p>
                      <h4 className="text-lg font-black tracking-tight mt-1">{lastScan.sku}</h4>
                      <p className="text-xs font-medium text-white/70">{lastScan.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <button type="button" onClick={() => setLastScan(null)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                      Ignorar
                    </button>
                    <button type="button" onClick={() => { setLastScan(null); if (scanInputRef.current) scanInputRef.current.focus(); }}
                      className="px-8 py-3 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                      Confirmar (1)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowBlindModal(false)}
                className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Suspender
              </button>
              <button onClick={handleFinalizarConferencia}
                className="px-10 py-3 bg-secondary text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />Finalizar Conferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AVARIA ── */}
      {showDamageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div role="dialog" aria-modal="true"
            className="bg-white dark:bg-slate-800 w-full max-w-lg p-8 rounded-[40px] shadow-2xl border-t-8 border-red-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Registro de Avaria</h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Dano</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Caixa Amassada','Produto Rasgado','Item Molhado','Lacre Violado','Outros'].map(d => (
                    <button key={d} type="button" onClick={() => setDamageType(d)}
                      className={cn('p-4 rounded-xl border-2 text-xs font-bold text-left transition-all',
                        damageType === d ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 hover:border-red-300 text-slate-600'
                      )}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button"
                className="w-full p-10 border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:border-secondary/30 transition-all">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase">Anexar Foto da Avaria</p>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => { setShowDamageModal(false); setDamageType(null); }}
                className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Descartar
              </button>
              <button onClick={() => {
                setShowDamageModal(false); setDamageType(null);
                showToast('Avaria registrada com sucesso.', 'warn');
              }} className="py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Salvar Avaria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NOTA FISCAL ── */}
      {showNFModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setShowNFModal(false)}>
          <div role="dialog" aria-modal="true"
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl border-t-4 border-secondary"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black mb-2">Nota Fiscal Vinculada</h2>
            <p className="text-xs text-slate-400 mb-6">O.R.: <strong>{selectedOrObj?.codigo}</strong></p>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              {[
                { label: 'Número NF',      val: selectedOrObj?.nf || '—' },
                { label: 'Depositante',    val: selectedOrObj?.depositante },
                { label: 'Tipo de Entrada',val: selectedOrObj?.tipo },
                { label: 'Total de Itens', val: `${selectedOrObj?.total_itens} SKUs` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">{label}</span>
                  <span className="font-black text-secondary">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowNFModal(false)}
              className="w-full mt-6 py-3 bg-secondary text-primary rounded-2xl text-xs font-black uppercase tracking-widest">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: PRODUTOS ── */}
      {showProductsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setShowProductsModal(false)}>
          <div role="dialog" aria-modal="true"
            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] p-8 shadow-2xl border-t-4 border-secondary"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black mb-2">Produtos da O.R.</h2>
            <p className="text-xs text-slate-400 mb-6">O.R.: <strong>{selectedOrObj?.codigo}</strong></p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {['VEPEL-BPI-174FX','VPER-ESS-NY-27MM','VPER-PAL-INO-1000','VPER-LUM-LED-VRD-24V','VPER-PNT-AL-22D'].map((sku, i) => (
                <div key={sku} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-black text-secondary">{sku}</p>
                    <p className="text-[10px] text-slate-400">Peça para elevador · Lote VP-{2026 + i}</p>
                  </div>
                  <span className="text-xs font-black bg-white border border-slate-200 px-2 py-1 rounded-lg">{mockQtys[i]} un</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowProductsModal(false)}
              className="w-full mt-6 py-3 bg-secondary text-primary rounded-2xl text-xs font-black uppercase tracking-widest">
              Fechar
            </button>
          </div>
        </div>
      )}

    </EnterprisePageBase>
  );
}
