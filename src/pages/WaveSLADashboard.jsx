import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  TrendingUp,
  History,
  Activity,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';
import { Monitor, Tv, Eye } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA: ONDAS COM SLAs ======
const MOCK_WAVES = [
  { 
    id: 'WAVE-2024-001', 
    titulo: 'Expedição SP - Rota Norte', 
    status: 'Em Execução',
    reabastecimento: true, // true = Pendente (X pulsante)
    etapas: {
      gerada: { time: '00:05:12', status: 'verde' },
      liberada: { time: '00:12:45', status: 'verde' },
      separacao: { time: '01:45:00', status: 'vermelho' }, // Atrasado
      conferencia: { time: '00:30:22', status: 'amarelo' }, // Atenção
      pesagem: { time: '--:--:--', status: 'cinza' },
      coleta: { time: '--:--:--', status: 'cinza' }
    }
  },
  { 
    id: 'WAVE-2024-002', 
    titulo: 'E-commerce - Prioritário', 
    status: 'Em Execução',
    reabastecimento: false, // false = OK (Check verde)
    etapas: {
      gerada: { time: '00:02:10', status: 'verde' },
      liberada: { time: '00:05:00', status: 'verde' },
      separacao: { time: '00:20:15', status: 'verde' },
      conferencia: { time: '00:05:30', status: 'verde' },
      pesagem: { time: '00:02:45', status: 'verde' },
      coleta: { time: '00:00:15', status: 'verde' }
    }
  },
  { 
    id: 'WAVE-2024-003', 
    titulo: 'Abastecimento Filial RJ', 
    status: 'Em Execução',
    reabastecimento: true,
    etapas: {
      gerada: { time: '00:08:40', status: 'verde' },
      liberada: { time: '00:45:12', status: 'vermelho' },
      separacao: { time: '--:--:--', status: 'cinza' },
      conferencia: { time: '--:--:--', status: 'cinza' },
      pesagem: { time: '--:--:--', status: 'cinza' },
      coleta: { time: '--:--:--', status: 'cinza' }
    }
  },
  { 
    id: 'WAVE-2023-998', 
    titulo: 'Carga Fechada - MG', 
    status: 'Processada',
    reabastecimento: false,
    etapas: {
      gerada: { time: '00:04:00', status: 'verde' },
      liberada: { time: '00:10:00', status: 'verde' },
      separacao: { time: '01:10:00', status: 'verde' },
      conferencia: { time: '00:45:00', status: 'verde' },
      pesagem: { time: '00:15:00', status: 'verde' },
      coleta: { time: '00:30:00', status: 'verde' }
    }
  }
];

const SLA_COLORS = {
  verde: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  amarelo: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  vermelho: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  cinza: 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700'
};

const SLALabel = ({ label, data }) => (
  <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <div className={cn(
      "w-full py-2 px-3 rounded-xl border-2 text-[11px] font-mono font-black text-center transition-all",
      SLA_COLORS[data.status]
    )}>
      {data.time}
    </div>
  </div>
);

export default function WaveSLADashboard() {
  const [filter, setFilter] = useState('Todas');
  const [waves, setWaves] = useState(MOCK_WAVES);
  const { isTvMode, setIsTvMode } = useApp();

  const filteredWaves = waves.filter(w => {
    if (filter === 'Todas') return true;
    if (filter === 'Em Alerta') {
      return w.reabastecimento || Object.values(w.etapas).some(e => e.status === 'vermelho' || e.status === 'amarelo');
    }
    return true;
  });

  return (
    <div className={cn(
      "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20",
      isTvMode && "p-10 scale-110 origin-top"
    )}>
      {/* ====== HEADER ====== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "font-black tracking-tight flex items-center gap-3",
            isTvMode ? "text-6xl mb-4" : "text-2xl"
          )}>
            <Activity className={cn("text-secondary", isTvMode ? "w-16 h-16" : "w-8 h-8")} /> Acompanhamento de Ondas (SLA)
          </h1>
          <p className={cn("text-slate-500 font-medium italic", isTvMode ? "text-2xl" : "text-sm")}>
            Monitoramento tático de gargalos e tempos de processo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-secondary transition-colors" />
            <select 
              className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 py-3 pl-11 pr-8 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-secondary transition-all appearance-none cursor-pointer shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Todas">Todas as Ondas</option>
              <option value="Em Alerta">Em Alerta (SLA/Reabast.)</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
              isTvMode 
                ? "bg-danger text-white hover:bg-red-600 animate-pulse" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {isTvMode ? <Monitor className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            {isTvMode ? "Sair do Modo TV" : "Modo TV"}
          </button>

          <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center shadow-sm">
             <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                Live
             </div>
          </div>
        </div>
      </div>

      {/* ALERTAS VISUAIS MODO TV */}
      {isTvMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           <div className="bg-danger p-10 rounded-[40px] shadow-2xl flex items-center gap-8 border-8 border-white">
              <AlertTriangle className="w-24 h-24 text-white animate-bounce" />
              <div>
                <p className="text-white text-5xl font-black italic uppercase leading-tight">3 Ondas Críticas</p>
                <p className="text-white/80 text-2xl font-bold uppercase tracking-widest">Atraso na Separação</p>
              </div>
           </div>
           <div className="bg-warning p-10 rounded-[40px] shadow-2xl flex items-center gap-8 border-8 border-white">
              <Zap className="w-24 h-24 text-primary animate-pulse" />
              <div>
                <p className="text-primary text-5xl font-black italic uppercase leading-tight">5 Reabastecimentos</p>
                <p className="text-primary/60 text-2xl font-bold uppercase tracking-widest">Pendentes no Chão</p>
              </div>
           </div>
        </div>
      )}

      {/* ====== ANALYTICS CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ondas em Separação', value: '12', icon: ShoppingCart, color: 'primary' },
          { label: 'Média de SLA (Etapas)', value: '18m', icon: Clock, color: 'secondary' },
          { label: 'Ondas em Alerta', value: '03', icon: AlertTriangle, color: 'danger' },
          { label: 'Reabast. Pendentes', value: '05', icon: Zap, color: 'warning' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}/10 border border-${card.color}/20`}>
              <card.icon className={`w-6 h-6 text-${card.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ====== MONITORING GRID ====== */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">Identificação</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Reabast.</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de SLA / Etapas</th>
                <th className="p-6 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredWaves.map((wave) => (
                <tr key={wave.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-primary font-mono tracking-tight">{wave.id}</span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate max-w-[150px]">{wave.titulo}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block w-fit mt-1",
                        wave.status === 'Em Execução' ? 'bg-secondary/10 text-secondary' : 'bg-green-100 text-green-700'
                      )}>
                        {wave.status}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      {wave.reabastecimento ? (
                        <div className="flex flex-col items-center gap-1 group/alert">
                          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-2 border-red-200 dark:border-red-800 text-red-600 animate-pulse transition-transform hover:scale-110">
                            <XCircle className="w-6 h-6" />
                          </div>
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">Pendente</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 group/ok">
                          <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <span className="text-[8px] font-black text-green-400 uppercase tracking-widest opacity-50">OK</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-4 py-2">
                      <SLALabel label="Gerada" data={wave.etapas.gerada} />
                      <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
                      <SLALabel label="Liberada" data={wave.etapas.liberada} />
                      <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
                      <SLALabel label="Separação" data={wave.etapas.separacao} />
                      <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
                      <SLALabel label="Conferência" data={wave.etapas.conferencia} />
                      <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
                      <SLALabel label="Pesagem" data={wave.etapas.pesagem} />
                      <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
                      <SLALabel label="Coleta" data={wave.etapas.coleta} />
                    </div>
                  </td>

                  <td className="p-6 text-right">
                    <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-secondary hover:border-secondary transition-all shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ====== FOOTER / LEGEND ====== */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Legenda SLA:</span>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                <span className="text-[10px] font-bold text-slate-500">Normal</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                <span className="text-[10px] font-bold text-slate-500">Atenção</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                <span className="text-[10px] font-bold text-slate-500">Atrasado</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-500">Pendente</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
