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
    sku: 'VPEL-PP-AD-800X2100-BGE', 
    desc: 'Porta de Pavimento Automática 800x2100 - Bege',
    qtd: 2, 
    enderecoSugerido: 'R1_PP1_CL001_N001',
    prioridade: 'Alta',
    tempoEspera: '15 min',
    status: 'ground' 
  },
  { 
    id: 'ALOC-1030', 
    sku: 'VEPEL-BPI-174FX', 
    desc: 'Barreira de Proteção Infravermelha (174 Feixes)',
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
    sku: 'VPER-ESS-NY-27MM', 
    desc: 'Escova de Segurança (Nylon - Base 27mm)',
    qtd: 12, 
    enderecoSugerido: 'R1_PP2_CL012_N001',
    prioridade: 'Urgente',
    tempoEspera: '2 min',
    status: 'ground' 
  },
  { 
    id: 'ALOC-1035', 
    sku: 'VPER-INC-ESQ', 
    desc: 'InnerCap (Esquerdo) - Acabamento Lateral',
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-8 font-poppins selection:bg-primary/30 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase italic">
              1.9 Kanban de Alocação
            </h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary" /> Gestão de Fluxo de Guarda em Tempo Real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex flex-col items-center min-w-[100px] shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ativo</span>
            <span className="text-2xl font-black text-primary leading-none">{tasks.length}</span>
          </div>
          <div className="bg-primary hover:brightness-110 active:scale-95 transition-all text-black px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(255,205,0,0.2)] cursor-pointer group">
            <span className="text-xs font-black uppercase tracking-widest">Nova Tarefa</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)] min-h-[600px]">
        {Object.entries(COLUMNS).map(([status, config]) => (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className={cn(
               "flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 min-h-0 relative",
               config.color,
               draggedTaskId && "ring-4 ring-primary/10 scale-[1.01]"
            )}
          >
            {/* Column Glow Effect */}
            <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 rounded-[2.3rem]", status === 'moving' ? "bg-primary/5 opacity-100" : "bg-slate-100/50")} />

            <div className="relative z-10 p-6 flex items-center justify-between border-b border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", config.accent.replace('bg-', 'text-'))} />
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                    {config.title}
                  </h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest">{config.subtitle}</p>
                </div>
              </div>
              <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black border border-slate-200 shadow-sm">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="relative z-10 flex-1 p-5 overflow-y-auto space-y-5 scrollbar-none">
              <AnimatePresence mode="popLayout">
                {tasks.filter(t => t.status === status).map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onDragEnd={onDragEnd}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "group bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-lg cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                      draggedTaskId === task.id && "opacity-40 scale-95 grayscale"
                    )}
                  >
                    {/* Card Accent Glow */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="bg-primary/10 text-primary border border-primary/20 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                          {task.id}
                        </span>
                        {task.prioridade === 'Urgente' && (
                          <span className="bg-red-500/10 text-red-600 border border-red-500/20 font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 w-fit mt-1">
                            <AlertCircle className="w-2 h-2" /> Urgente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Aguardando</span>
                            <span className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                               <Clock className="w-2.5 h-2.5" /> {task.tempoEspera}
                            </span>
                         </div>
                         <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors ml-1" />
                      </div>
                    </div>

                    <div className="mb-4 relative z-10">
                      <h3 className="text-sm font-black text-slate-900 mb-1 tracking-tight leading-none">
                        {task.sku}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold line-clamp-2 uppercase tracking-tight">
                        {task.desc}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative z-10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</span>
                        </div>
                        <span className="text-base font-black text-slate-900">{task.qtd} UN</span>
                      </div>
                      
                      <div className="h-px bg-slate-200" />
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                           <MapPin className="w-3 h-3" /> Endereço Sugerido
                        </span>
                        <span className="text-sm font-black font-mono text-slate-900 bg-white py-2 px-3 rounded-lg border border-slate-200 block text-center">
                          {task.enderecoSugerido}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo Estável</span>
                      </div>
                      <div className="text-[9px] font-black text-primary uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                         Ver Detalhes <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-[2rem] opacity-50">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Package className="w-6 h-6 text-slate-400" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sem Tarefas Pendentes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CONFIRMAÇÃO — Light Glassmorphism */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setConfirmModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              className="relative bg-white border-2 border-primary/40 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="h-3 w-full bg-primary" />
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                   <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-inner">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                   </div>
                   <button 
                     onClick={() => setConfirmModal(null)}
                     className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-slate-200"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase italic">Confirmar Alocação Final</h2>
                <p className="text-slate-500 text-sm font-bold mb-8 uppercase tracking-widest">
                  Valide a posição física da guarda para o item <span className="text-primary italic">{confirmModal.id}</span>
                </p>

                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 mb-10 space-y-8">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">SKU VerticalParts</p>
                          <p className="text-xl font-black text-slate-900 truncate font-mono">{confirmModal.sku}</p>
                      </div>
                      <div className="text-right bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Diferencial</p>
                          <p className="text-2xl font-black text-slate-900 leading-none">{confirmModal.qtd} <span className="text-xs uppercase ml-1">UN</span></p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> Endereço Destino Confirmado
                        </label>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                           <AlertCircle className="w-3 h-3" /> Campo Requerido
                        </span>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                        <input 
                           autoFocus
                           autoComplete="off"
                           defaultValue={confirmModal.enderecoSugerido}
                           className="w-full bg-white border-2 border-primary/30 rounded-3xl pl-16 pr-8 py-6 text-2xl font-black font-mono text-primary focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-lg uppercase"
                        />
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-6 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-[0.3em] transition-all border border-slate-200"
                  >
                    Voltar / Cancelar
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="flex-[1.5] py-6 bg-primary text-black font-black hover:brightness-110 active:scale-[0.98] rounded-3xl text-sm uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_rgba(255,205,0,0.3)] flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5 fill-current" /> Finalizar Guarda
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
