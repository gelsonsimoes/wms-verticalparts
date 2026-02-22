import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  RefreshCcw, 
  ArrowDownCircle, 
  Trash2, 
  Plus,
  Save, 
  X, 
  Database, 
  Zap,
  Info,
  ChevronRight,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== COMPONENTE PRINCIPAL ======

export default function WeighingStation() {
  const [activeScale, setActiveScale] = useState('Balança Toledo Ind. 12');
  const [currentWeight, setCurrentWeight] = useState(0.000);
  const [theoreticalWeight, setTheoreticalWeight] = useState(12.500);
  const [accumulatedWeight, setAccumulatedWeight] = useState(0.000);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState(null);

  // Simulação de oscilação de peso real
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCapturing) {
        const noise = (Math.random() - 0.5) * 0.005;
        setCurrentWeight(prev => Math.max(0, parseFloat((prev + noise).toFixed(3))));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCapturing]);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simula tempo de estabilização da balança
    setTimeout(() => {
      const stableWeight = (Math.random() * 2 + 10.5).toFixed(3);
      setCurrentWeight(parseFloat(stableWeight));
      setIsCapturing(false);
      setLastCapture(stableWeight);
    }, 800);
  };

  const handleAdd = () => {
    setAccumulatedWeight(prev => parseFloat((prev + currentWeight).toFixed(3)));
  };

  const handleZero = () => {
    setCurrentWeight(0.000);
    setAccumulatedWeight(0.000);
    setLastCapture(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* ====== HEADER: TERMINAL INFO ====== */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-3xl bg-primary text-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Scale className="w-8 h-8" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estação de Pesagem Operacional</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                 Lote: <span className="text-primary">VEPEL-BPI-174FX-2026</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Comunicação</p>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                 <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">verticalPerts Connector: ON</span>
              </div>
           </div>
           <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecionar Balança Ativa</label>
              <select 
                value={activeScale}
                onChange={(e) => setActiveScale(e.target.value)}
                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-black uppercase text-slate-700 dark:text-slate-300 outline-none focus:border-primary transition-all shadow-sm"
              >
                 <option>Balança Toledo Ind. 12</option>
                 <option>Balança Filizola F-3000</option>
                 <option>Plataforma Coleta Doca 04</option>
              </select>
           </div>
        </div>
      </div>

      {/* ====== CENTRAL: DISPLAYS DIGITAIS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Display: Peso Real — LCD Industrial */}
        <div className="lg:col-span-2 relative group">
           {/* Glow amarelo por trás do display */}
           <div className="absolute inset-0 bg-primary/30 rounded-[48px] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
           <div className="relative bg-slate-950 border-4 border-slate-800 rounded-[56px] h-[300px] flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-black/60">
              {/* Tarja superior preto/amarelo — identidade VP */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
              {/* Scanlines decorativas — efeito LCD real */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)'}} />
              
              <div className="flex flex-col items-center text-center">
                 <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.5em] mb-4">PESO DA BALANÇA</p>
                 <div className="flex items-baseline gap-3">
                    <span className={cn(
                      "font-black tracking-tighter transition-all duration-300 tabular-nums",
                      "text-[110px] leading-none",
                      isCapturing
                        ? "text-primary/40 animate-pulse"
                        : "text-primary drop-shadow-[0_0_20px_rgba(255,205,0,0.6)]"
                    )}>
                       {currentWeight.toFixed(3).replace('.', ',')}
                    </span>
                    <span className="text-3xl font-black text-primary/50 mb-2">KG</span>
                 </div>
              </div>

              {/* Status Visual */}
              <div className="absolute bottom-7 flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-700">
                 <div className={cn("w-2 h-2 rounded-full", isCapturing ? "bg-amber-400 animate-pulse" : "bg-green-400 shadow-lg shadow-green-400/50")} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {isCapturing ? 'ESTABILIZANDO...' : 'PESO ESTÁVEL'}
                 </span>
              </div>
           </div>
        </div>

        {/* Secondary Display: Peso Teórico / Acumulado — LCD escuro */}
        <div className="space-y-4">
           {/* Painel Teórico vs Acumulado */}
           <div className="bg-slate-950 border-2 border-slate-800 rounded-[40px] p-7 flex flex-col justify-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
              <p className="text-[9px] font-black text-primary/50 uppercase tracking-[0.3em] mb-1">PESO TEÓRICO (FICHA)</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-primary/80 tabular-nums drop-shadow-[0_0_8px_rgba(255,205,0,0.3)]">{theoreticalWeight.toFixed(3).replace('.', ',')}</span>
                 <span className="text-base font-black text-primary/40">KG</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                 <p className="text-[9px] font-black text-primary/50 uppercase tracking-[0.3em] mb-1">PESO ACUMULADO (LOTE)</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary tabular-nums drop-shadow-[0_0_12px_rgba(255,205,0,0.5)]">{accumulatedWeight.toFixed(3).replace('.', ',')}</span>
                    <span className="text-xs font-black text-primary/40">KG</span>
                 </div>
              </div>
           </div>

           {/* Painel Scanner / Polling */}
           <div className="bg-secondary border-2 border-primary/20 rounded-[40px] p-7 flex flex-col justify-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/60" />
              <div className="flex items-center gap-3 mb-3">
                 <Zap className="w-5 h-5 text-primary" />
                 <h4 className="text-sm font-black tracking-[0.15em] uppercase text-primary">Scanner Ativo</h4>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                 Aguardando leitura de próximo volume para pesagem individual.
              </p>
              <div className="mt-5 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-primary/10">
                 <RefreshCcw className="w-4 h-4 text-primary/70" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 line-clamp-1">Polling: Toledo IPX-8</span>
              </div>
           </div>
        </div>
      </div>

      {/* ====== CONTROLES INFERIORES: BOTOEIRAS TOUCH ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <button 
           onClick={handleCapture}
           disabled={isCapturing}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50"
         >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group">
               <ArrowDownCircle className="w-6 h-6 text-primary group-hover:animate-bounce" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capturar Peso</span>
         </button>

         <button 
           onClick={handleAdd}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-secondary hover:bg-secondary/5 transition-all shadow-lg shadow-black/5 active:scale-95"
         >
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
               <Plus className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Adicionar Peso</span>
         </button>

         <button 
           onClick={handleZero}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-danger hover:bg-danger/5 transition-all shadow-lg shadow-black/5 active:scale-95"
         >
            <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
               <Trash2 className="w-6 h-6 text-danger" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Zerar Peso</span>
         </button>

         <button className="h-28 bg-secondary text-primary rounded-[32px] flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-secondary/20 active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Save className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Salvar Pesagem</span>
         </button>
      </div>

    </div>
  );
}
