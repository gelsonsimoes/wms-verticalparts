import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  GripVertical,
  MapPin,
  CheckCircle2,
  X,
  Package,
  Clock,
  ChevronRight,
  Zap,
  Plus,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

// ─── Utils ───────────────────────────────────────────────────────────────────
function cn(...inputs) { return twMerge(clsx(inputs)); }

// Padrão válido de endereço
const ADDRESS_REGEX = /^[A-Z0-9_]+$/;

function formatElapsed(isoTimestamp) {
  if (!isoTimestamp) return '—';
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  if (diffMs < 0) return '0 min';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h${mins % 60}m`;
}

// ─── Constantes de Domínio ────────────────────────────────────────────────────
const PRIORIDADES = ['Urgente', 'Alta', 'Normal'];

const COLUMNS = {
  ground:    { title: 'No Chão (Doca)',      subtitle: 'Aguardando Início',     accent: 'bg-slate-400',   border: 'border-slate-300',   headerBg: 'bg-slate-50' },
  moving:    { title: 'Em Movimentação',     subtitle: 'Operador em Trânsito',  accent: 'bg-yellow-400',  border: 'border-yellow-300',  headerBg: 'bg-yellow-50' },
  allocated: { title: 'Alocado (Concluído)', subtitle: 'Confirmação Final',     accent: 'bg-green-500',   border: 'border-green-300',   headerBg: 'bg-green-50' },
};

const mapStatusToKanban = (status) => {
  if (status === 'pendente')     return 'ground';
  if (status === 'em_andamento') return 'moving';
  if (status === 'concluida')    return 'allocated';
  return 'ground';
};

const mapKanbanToStatus = (status) => {
  if (status === 'ground')    return 'pendente';
  if (status === 'moving')    return 'em_andamento';
  if (status === 'allocated') return 'concluida';
  return 'pendente';
};

const PRIORITY_CFG = {
  Urgente: { cls: 'bg-red-100 text-red-700 border border-red-200',    icon: <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" /> },
  Alta:    { cls: 'bg-amber-100 text-amber-700 border border-amber-200', icon: <TrendingUp className="w-2.5 h-2.5" aria-hidden="true" /> },
  Normal:  { cls: 'bg-slate-100 text-slate-500 border border-slate-200', icon: null },
};

// ─── Badge de Prioridade ──────────────────────────────────────────────────────
function PrioridadeBadge({ prioridade }) {
  const cfg = PRIORITY_CFG[prioridade] || PRIORITY_CFG.Normal;
  if (prioridade === 'Normal') return null;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide', cfg.cls)}>
      {cfg.icon} {prioridade}
    </span>
  );
}

// ─── Componentes Auxiliares ───────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
  </div>
);

const inputCls = (errors, field) => cn(
  'w-full border rounded-sm px-3 py-2 text-xs font-bold outline-none transition-all bg-gray-50',
  errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30'
);

// ─── Modal de Nova Tarefa ─────────────────────────────────────────────────────
function NovaTarefaModal({ warehouseId, onClose, onSave }) {
  const [form, setForm] = useState({
    sku: '', desc: '', qtd: 1, enderecoSugerido: '', prioridade: 'Normal',
  });
  const [errors, setErrors] = useState({});
  const skuRef = useRef(null);
  useEffect(() => { skuRef.current?.focus(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.sku.trim())  errs.sku  = 'SKU obrigatório';
    if (!form.desc.trim()) errs.desc = 'Descrição obrigatória';
    if (form.qtd < 1)      errs.qtd  = 'Mínimo 1 unidade';
    if (!ADDRESS_REGEX.test(form.enderecoSugerido.trim().toUpperCase()))
      errs.enderecoSugerido = 'Formato inválido. Use ex: PP1_A01';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      // 1. Buscar o ID do produto pelo SKU
      let { data: prod } = await supabase
        .from('produtos')
        .select('id')
        .eq('sku', form.sku.trim().toUpperCase())
        .single();

      // Se não existe, cria um básico para não travar o fluxo
      if (!prod) {
        const { data: newProd } = await supabase
          .from('produtos')
          .insert({
            sku: form.sku.trim().toUpperCase(),
            descricao: form.desc.trim(),
            unidade: 'UN'
          })
          .select()
          .single();
        prod = newProd;
      }

      // 2. Criar a Tarefa
      const { data: tarefa, error: tErr } = await supabase
        .from('tarefas')
        .insert({
          tipo:         'alocacao',
          prioridade:   form.prioridade,
          status:       'pendente',
          warehouse_id: warehouseId,
        })
        .select()
        .single();

      if (tErr) throw tErr;

      // 3. Criar o Item da Tarefa
      const { error: iErr } = await supabase
        .from('itens_tarefa')
        .insert({
          tarefa_id:           tarefa.id,
          produto_id:          prod.id,
          sku:                 form.sku.trim().toUpperCase(),
          descricao:           form.desc.trim(),
          sequencia:           1,
          quantidade_esperada: Number(form.qtd),
          endereco_id:         form.enderecoSugerido.trim().toUpperCase(),
        });

      if (iErr) throw iErr;

      onSave();
      onClose();
    } catch (err) {
      console.error('[Kanban] Error creating task:', err);
      setErrors({ sku: `Erro: ${err.message || 'Falha na comunicação com o banco.'}` });
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="nova-tarefa-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white border border-gray-200 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden">

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="nova-tarefa-title" className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
            <Plus size={14} className="text-yellow-500" aria-hidden="true" /> Nova Tarefa de Alocação
          </h2>
          <button onClick={onClose} aria-label="Fechar modal" className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="SKU" error={errors.sku}>
            <input
              ref={skuRef}
              value={form.sku}
              onChange={async e => {
                const val = e.target.value.toUpperCase();
                setForm(f => ({ ...f, sku: val }));
                if (val.length > 3) {
                  const { data } = await supabase.from('produtos').select('descricao').eq('sku', val).single();
                  if (data) setForm(f => ({ ...f, desc: data.descricao }));
                }
              }}
              className={inputCls(errors, 'sku')}
              placeholder="VPER-XXX-YYY"
            />
          </Field>
          <Field label="Descrição do Produto" error={errors.desc}>
            <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={inputCls(errors, 'desc')} placeholder="Nome completo do produto" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantidade (UN)" error={errors.qtd}>
              <input type="number" min="1" value={form.qtd} onChange={e => setForm(f => ({ ...f, qtd: parseInt(e.target.value) || 1 }))} className={inputCls(errors, 'qtd')} />
            </Field>
            <Field label="Prioridade">
              <select value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))} className={inputCls(errors, 'prioridade')}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Endereço Sugerido (Ex: PP1_A01)" error={errors.enderecoSugerido}>
            <input
              value={form.enderecoSugerido}
              onChange={e => setForm(f => ({ ...f, enderecoSugerido: e.target.value.toUpperCase() }))}
              className={cn(inputCls(errors, 'enderecoSugerido'), 'font-mono tracking-wider')}
              placeholder="Ex: PP1_A01"
            />
          </Field>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-end border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider bg-yellow-400 hover:bg-yellow-300 text-black rounded-sm flex items-center gap-2 transition-colors">
            <Plus size={13} aria-hidden="true" /> Criar Tarefa
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal de Detalhes ────────────────────────────────────────────────────────
function DetalhesModal({ task, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="detalhes-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white border border-gray-200 rounded-sm w-full max-w-md shadow-2xl overflow-hidden">

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="detalhes-title" className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
            <Info size={14} aria-hidden="true" /> Detalhes — {task.id}
          </h2>
          <button onClick={onClose} aria-label="Fechar detalhes" className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'SKU',          value: task.sku,              mono: true },
              { label: 'Prioridade',   value: task.prioridade },
              { label: 'Status',       value: COLUMNS[task.status]?.title || task.status },
              { label: 'Volume',       value: `${task.qtd} UN` },
              { label: 'Destino',      value: task.enderecoSugerido, mono: true },
              { label: 'Tempo Espera', value: formatElapsed(task.createdAt) },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={cn('text-xs font-black text-black', mono && 'font-mono')}>{value}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Descrição</p>
            <p className="text-xs font-medium text-gray-600">{task.desc}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal de Confirmação de Alocação ─────────────────────────────────────────
function ConfirmModal({ task, tasks, onClose, onConfirm }) {
  const [endereco, setEndereco] = useState(task.enderecoSugerido);
  const [addrError, setAddrError] = useState('');

  const handleConfirm = () => {
    const val = endereco.trim().toUpperCase();
    if (!ADDRESS_REGEX.test(val)) {
      setAddrError('Formato inválido. Padrão: PP1_A01');
      return;
    }
    const ocupado = tasks.find(t => t.id !== task.id && t.status === 'allocated' && t.enderecoSugerido === val);
    if (ocupado) {
      setAddrError(`Endereço já ocupado por ${ocupado.id}`);
      return;
    }
    setAddrError('');
    onConfirm(task.id, val);
  };

  const isValid = ADDRESS_REGEX.test(endereco.trim().toUpperCase());

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white border border-gray-200 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden">

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="confirm-title" className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" aria-hidden="true" /> Confirmar Alocação Final
          </h2>
          <button onClick={onClose} aria-label="Cancelar alocação" className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">SKU</p>
              <p className="text-xs font-black text-black font-mono">{task.sku}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Quantidade</p>
              <p className="text-xs font-black text-black">{task.qtd} UN</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Prioridade</p>
              <PrioridadeBadge prioridade={task.prioridade} />
              {task.prioridade === 'Normal' && <span className="text-xs font-bold text-gray-500">Normal</span>}
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Tempo Aguardando</p>
              <p className="text-xs font-black text-amber-600">{formatElapsed(task.createdAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Descrição</p>
              <p className="text-xs font-medium text-gray-600">{task.desc}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="field-endereco" className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
              <MapPin size={12} className="text-yellow-500" aria-hidden="true" /> Confirmar Endereço Físico
            </label>
            <input
              id="field-endereco"
              autoFocus
              value={endereco}
              onChange={e => { setEndereco(e.target.value.toUpperCase()); setAddrError(''); }}
              className={cn(
                'w-full border rounded-sm px-4 py-3 text-lg font-black font-mono text-black outline-none transition-all uppercase tracking-widest',
                addrError
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : isValid
                  ? 'border-green-400 bg-green-50 focus:border-green-500'
                  : 'border-gray-200 bg-gray-50 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30'
              )}
              placeholder="Ex: PP1_A01"
              aria-invalid={!!addrError}
              aria-describedby={addrError ? 'addr-error' : undefined}
            />
            {addrError && (
              <p id="addr-error" className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />{addrError}
              </p>
            )}
            {isValid && !addrError && (
              <p className="text-[9px] text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Endereço válido
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-end border-t border-gray-100">
          <button onClick={onClose} className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider bg-yellow-400 hover:bg-yellow-300 text-black rounded-sm flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-yellow-500 outline-none">
            <Zap size={14} aria-hidden="true" /> Finalizar Guarda
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AllocationKanban() {
  const { warehouseId } = useApp();
  const [searchParams] = useSearchParams();
  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [confirmModal,   setConfirmModal]   = useState(null);
  const [detalhesModal,  setDetalhesModal]  = useState(null);
  const [novaTarefaOpen, setNovaTarefaOpen] = useState(false);
  const [draggedTaskId,  setDraggedTaskId]  = useState(null);

  // Re-render a cada 30s para atualizar tempos de espera
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`
          id, status, prioridade, created_at,
          itens:itens_tarefa (
            quantidade_esperada,
            endereco_id,
            sku,
            descricao
          )
        `)
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data.map(t => ({
        id:               t.id,
        sku:              t.itens?.[0]?.sku || 'N/A',
        desc:             t.itens?.[0]?.descricao || 'Sem descrição',
        qtd:              t.itens?.[0]?.quantidade_esperada || 0,
        enderecoSugerido: t.itens?.[0]?.endereco_id || 'N/A',
        prioridade:       t.prioridade,
        status:           mapStatusToKanban(t.status),
        createdAt:        t.created_at,
      }));
      setTasks(mapped);

      // Auto-abrir detalhes se vier via busca global
      const taskId = searchParams.get('id');
      if (taskId) {
        const found = mapped.find(item => String(item.id) === taskId);
        if (found) setDetalhesModal(found);
      }
    } catch (err) {
      console.error('[Kanban] Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, searchParams]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' },     fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_tarefa' }, fetchTasks)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };
  const onDragEnd = () => setDraggedTaskId(null);

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (newStatus === 'allocated') {
      setConfirmModal(task);
    } else {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: mapKanbanToStatus(newStatus) })
        .eq('id', taskId);
      if (error) console.error('[Kanban] Error updating status:', error);
    }
    setDraggedTaskId(null);
  };

  const handleConfirm = async (taskId, enderecoFinal) => {
    try {
      await supabase
        .from('itens_tarefa')
        .update({ endereco_id: enderecoFinal })
        .eq('tarefa_id', taskId);

      const { error } = await supabase
        .from('tarefas')
        .update({ status: 'concluida' })
        .eq('id', taskId);

      if (error) throw error;
      setConfirmModal(null);
      fetchTasks();
    } catch (err) {
      console.error('[Kanban] Error confirming task:', err);
    }
  };

  const pendingCount   = tasks.filter(t => t.status !== 'allocated').length;
  const completedCount = tasks.filter(t => t.status === 'allocated').length;

  const actionGroups = [
    [
      { label: 'Nova Tarefa', icon: Plus,       primary: true, onClick: () => setNovaTarefaOpen(true) },
      { label: 'Atualizar',   icon: RefreshCw,               onClick: fetchTasks, disabled: loading },
    ],
  ];

  return (
    <EnterprisePageBase
      title="2.9 Kanban de Alocação"
      breadcrumbItems={[{ label: 'OPERAR', path: '/operacao' }]}
      actionGroups={actionGroups}
    >
      {/* KPIs */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-50 px-4 py-1.5 border border-gray-200 rounded-sm flex items-center gap-3 shadow-sm">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pendentes:</span>
          <span className="text-sm font-black text-black leading-none">{pendingCount}</span>
        </div>
        <div className="bg-green-50 px-4 py-1.5 border border-green-200 rounded-sm flex items-center gap-3 shadow-sm">
          <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Concluídos:</span>
          <span className="text-sm font-black text-green-700 leading-none">{completedCount}</span>
        </div>
        {loading && (
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Carregando...</span>
        )}
      </div>

      {/* ── Kanban Board ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-260px)] min-h-[500px] select-none">
        {Object.entries(COLUMNS).map(([status, config]) => {
          const colTasks   = tasks.filter(t => t.status === status);
          const isDragTarget = !!draggedTaskId;

          return (
            <div
              key={status}
              role="region"
              aria-label={`Coluna: ${config.title}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onDrop(e, status)}
              className={cn(
                'flex flex-col border rounded-sm transition-all duration-200 min-h-0 bg-gray-50',
                config.border,
                isDragTarget && status !== 'ground' && 'ring-2 ring-yellow-400/50'
              )}
            >
              {/* Header da coluna */}
              <div className={cn('p-3 flex items-center justify-between border-b shrink-0', config.border, config.headerBg)}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', config.accent)} aria-hidden="true" />
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-black">{config.title}</h2>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{config.subtitle}</p>
                  </div>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-sm text-[10px] font-black border border-gray-200 text-gray-500">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                  {colTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable={status !== 'allocated'}
                      onDragStart={e => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        'bg-white border border-gray-200 rounded-sm p-3 shadow-sm hover:border-yellow-400 transition-colors relative',
                        status !== 'allocated' && 'cursor-grab active:cursor-grabbing',
                        draggedTaskId === task.id && 'opacity-30 grayscale'
                      )}
                      aria-label={`Tarefa ${task.id}: ${task.sku}`}
                    >
                      {/* Linha 1: ID + badges + tempo */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-[9px] font-black uppercase tracking-tight">
                            {task.id}
                          </span>
                          <PrioridadeBadge prioridade={task.prioridade} />
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 shrink-0">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span className="text-[10px] font-bold" title={`Criado em ${new Date(task.createdAt).toLocaleString('pt-BR')}`}>
                            {formatElapsed(task.createdAt)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[11px] font-black text-black mb-1 font-mono tracking-tight uppercase">
                        {task.sku}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-3 border-l-2 border-gray-100 pl-2">
                        {task.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 border border-gray-100 rounded-sm">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Volume</span>
                          <span className="text-[11px] font-black text-black">{task.qtd} UN</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Destino</span>
                          <span className="text-[10px] font-black text-yellow-600 font-mono">{task.enderecoSugerido}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Status: <span className="text-gray-600">{COLUMNS[task.status]?.title || task.status}</span>
                        </span>
                        <button
                          onClick={() => setDetalhesModal(task)}
                          aria-label={`Ver detalhes de ${task.id}`}
                          className="text-[9px] font-black text-yellow-600 uppercase flex items-center gap-1 hover:underline focus-visible:ring-1 focus-visible:ring-yellow-400 outline-none rounded"
                        >
                          Detalhes <ChevronRight className="w-2.5 h-2.5" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-20 border border-dashed border-gray-200 rounded-sm opacity-50 bg-white/50">
                    <Package className="w-5 h-5 text-gray-300 mb-1" aria-hidden="true" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                      {isDragTarget && status !== 'ground' ? 'Solte aqui' : 'Vazio'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modais ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {novaTarefaOpen && (
          <NovaTarefaModal key="nova" warehouseId={warehouseId} onClose={() => setNovaTarefaOpen(false)} onSave={fetchTasks} />
        )}
        {confirmModal && (
          <ConfirmModal key="confirm" task={confirmModal} tasks={tasks} onClose={() => setConfirmModal(null)} onConfirm={handleConfirm} />
        )}
        {detalhesModal && (
          <DetalhesModal key="detalhes" task={detalhesModal} onClose={() => setDetalhesModal(null)} />
        )}
      </AnimatePresence>
    </EnterprisePageBase>
  );
}
