import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  LayoutDashboard,
  X,
  Package,
  Clock,
  ChevronRight,
  AlertCircle,
  Zap
} from 'lucide-react';

// Design System / Utils
const cn = (...classes) => classes.filter(Boolean).join(' ');

const INITIAL_TASKS = [
  { 
    id: 'ALOC-1029', 
    sku: 'VPER-PNT-AL-22D-202X145-CT', 
    desc: 'Pente de Alumínio - 22 Dentes (202x145mm)',
    qtd: 2, 
    enderecoSugerido: 'R1_PP1_CL001_N001',
    prioridade: 'Alta',
    tempoEspera: '15 min',
    status: 'ground' 
  },
  { 
    id: 'ALOC-1030', 
    sku: 'VPER-ESS-NY-27MM', 
    desc: 'Escova de Segurança (Nylon - Base 27mm)',
    qtd: 10, 
    enderecoSugerido: 'R2_PP3_CL005_N002',
    prioridade: 'Normal',
    tempoEspera: '5 min',
    status: 'ground' 
  },
  { 
    id: 'ALOC-1031', 
    sku: 'VPER-PAL-INO-1000', 
    desc: 'Pallet de Aço Inox (1000mm)',
    qtd: 5, 
    enderecoSugerido: 'R3_PP1_CL001_N001',
    prioridade: 'Alta',
    tempoEspera: '22 min',
    status: 'moving' 
  },
  { 
    id: 'ALOC-1032', 
    sku: 'VPER-LUM-LED-VRD-24V', 
    desc: 'Luminária em LED Verde 24V',
    qtd: 12, 
    enderecoSugerido: 'R1_PP2_CL012_N001',
    prioridade: 'Urgente',
    tempoEspera: '2 min',
    status: 'ground' 
  },
  { 
    id: 'ALOC-1035', 
    sku: 'VPER-INC-ESQ', 
    desc: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS',
    qtd: 8, 
    enderecoSugerido: 'R1_PP1_CL001_N004',
    prioridade: 'Normal',
    tempoEspera: '10 min',
    status: 'moving' 
  }
];

const COLUMNS = {
  ground: { 
    title: 'No Chão (Doca)', 
    subtitle: 'Aguardando Início',
    color: 'border-slate-200 bg-slate-100/50 text-slate-600',
    accent: 'bg-slate-400'
  },
  moving: { 
    title: 'Em Movimentação', 
    subtitle: 'Operador em Trânsito',
    color: 'border-primary/30 bg-primary/10 text-primary',
    accent: 'bg-primary'
  },
  allocated: { 
    title: 'Alocado (Concluído)', 
    subtitle: 'Confirmação Final', 
    color: 'border-green-500/30 bg-green-500/10 text-green-600',
    accent: 'bg-green-500'
  }
};

export default function AllocationKanban() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [confirmModal, setConfirmModal] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
  };

  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    if (newStatus === 'allocated') {
      setConfirmModal(task);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
    setDraggedTaskId(null);
  };

  const handleConfirm = () => {
    setTasks(prev => prev.filter(t => t.id !== confirmModal.id));
    setConfirmModal(null);
  };

  return (
    <div className="min-h-screen bg-white text-[var(--vp-text)] p-4 font-sans selection:bg-primary/30">
      
      {/* HEADER - D365 STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-[var(--vp-border)]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-black rounded-sm border border-black shadow-inner">
            <LayoutDashboard className="w-4 h-4 text-[var(--vp-primary)]" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-black uppercase">
              1.9 Kanban de Alocação
            </h1>
            <p className="text-[10px] text-[var(--vp-text-label)] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-[var(--vp-primary)]" /> VPARMZ - CD Central Guarulhos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[var(--vp-bg-alt)] px-4 py-1.5 border border-[var(--vp-border)] rounded-sm flex items-center gap-3 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Ativo:</span>
            <span className="text-sm font-black text-black leading-none">{tasks.length}</span>
          </div>
          <button className="btn-primary px-4 py-2 flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <Zap size={14} className="fill-current" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* KANBAN BOARD - HIGH DENSITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
        {Object.entries(COLUMNS).map(([status, config]) => (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className={cn(
               "flex flex-col bg-[var(--vp-bg-alt)] border border-[var(--vp-border)] rounded-sm transition-all duration-200 min-h-0",
               draggedTaskId && "border-[var(--vp-primary)]"
            )}
          >
            <div className="p-3 flex items-center justify-between border-b border-[var(--vp-border)] bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", config.accent)} />
                <h2 className="text-[11px] font-black uppercase tracking-wider text-black">
                  {config.title}
                </h2>
              </div>
              <span className="bg-white px-2 py-0.5 rounded-sm text-[10px] font-black border border-[var(--vp-border)] text-gray-500">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar">
              {tasks.filter(t => t.status === status).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragEnd={onDragEnd}
                  className={cn(
                    "bg-white border border-[var(--vp-border)] rounded-sm p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--vp-primary)] transition-colors relative",
                    draggedTaskId === task.id && "opacity-30 grayscale"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge-tech badge-info">
                        {task.id}
                      </span>
                      {task.prioridade === 'Urgente' && (
                        <span className="badge-tech badge-error">
                          Urgente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                       <Clock className="w-3 h-3" />
                       <span className="text-[10px] font-bold">{task.tempoEspera}</span>
                    </div>
                  </div>

                  <h3 className="text-[11px] font-black text-black mb-1 font-mono tracking-tight uppercase">
                    {task.sku}
                  </h3>
                  <p className="text-[10px] text-[var(--vp-text-label)] font-medium line-clamp-1 truncate mb-3 border-l-2 border-gray-100 pl-2">
                    {task.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-[var(--vp-bg-alt)] p-2 border border-[var(--vp-border)] rounded-sm">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Volume</span>
                       <span className="text-[11px] font-black text-black">{task.qtd} UN</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Destino</span>
                       <span className="text-[10px] font-black text-[var(--vp-primary)] font-mono">{task.enderecoSugerido}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                       Status: <span className="text-gray-600">Posicionado</span>
                    </span>
                    <button className="text-[9px] font-black text-[var(--vp-primary)] uppercase flex items-center gap-1 hover:underline">
                       Detalhes <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="flex flex-col items-center justify-center h-20 border border-dashed border-[var(--vp-border)] rounded-sm opacity-50 bg-white/50">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Vazio</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL - D365 STYLE */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setConfirmModal(null)} />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[var(--vp-border)] rounded-sm w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="bg-[var(--vp-bg-alt)] px-6 py-4 border-b border-[var(--vp-border)] flex items-center justify-between">
                <h2 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-green-600" /> Confirmar Alocação Final
                </h2>
                <button onClick={() => setConfirmModal(null)} className="text-gray-400 hover:text-black transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">SKU</p>
                      <p className="text-xs font-black text-black font-mono">{confirmModal.sku}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Quantidade</p>
                      <p className="text-xs font-black text-black">{confirmModal.qtd} UN</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                     <MapPin size={12} className="text-[var(--vp-primary)]" /> Confirmar Endereço Físico
                  </label>
                  <input 
                     autoFocus
                     defaultValue={confirmModal.enderecoSugerido}
                     className="w-full bg-[var(--vp-bg-alt)] border border-[var(--vp-border)] rounded-sm px-4 py-3 text-lg font-black font-mono text-black focus:border-[var(--vp-primary)] focus:ring-1 focus:ring-[var(--vp-primary)] outline-none transition-all uppercase"
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-end">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="btn-secondary px-6 py-2 text-[11px] uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirm}
                  className="btn-primary px-6 py-2 text-[11px] uppercase tracking-wider flex items-center gap-2"
                >
                  <Zap size={14} className="fill-current" /> Finalizar Guarda
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
