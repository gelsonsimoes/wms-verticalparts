import React, { useState } from 'react';
import { 
  Waves, 
  Settings2, 
  Filter, 
  LayoutGrid, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Truck, 
  Navigation, 
  Warehouse, 
  Box, 
  Package, 
  ChevronRight,
  Monitor,
  Check,
  AlertCircle,
  Play
} from 'lucide-react';

const MOCK_COLMEIAS = [
  { id: 'COL-01', status: 'Disponível', ocupacao: 0 },
  { id: 'COL-02', status: 'Parcial', ocupacao: 45 },
  { id: 'COL-03', status: 'Disponível', ocupacao: 0 },
  { id: 'COL-04', status: 'Disponível', ocupacao: 0 },
  { id: 'COL-05', status: 'Ocupada', ocupacao: 100 },
];

const MOCK_PEDIDOS = [
  { id: 'PED-1001', nf: 'NF-5544', depositante: 'Danilo (Supervisor)', rota: 'SP - Interior', pecas: 12 },
  { id: 'PED-1002', nf: 'NF-5545', depositante: 'Matheus (Expedição)', rota: 'RJ - Capital', pecas: 5 },
  { id: 'PED-1003', nf: 'NF-5546', depositante: 'Thiago (Logística)', rota: 'MG - BH', pecas: 8 },
  { id: 'PED-1004', nf: 'NF-5547', depositante: 'VerticalParts Oficial', rota: 'SP - Capital', pecas: 22 },
];

export default function WavePickingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    config: 'Colmeia',
    transportadora: '',
    rota: '',
    depositante: '',
    tituloOnda: '',
    pedidosPorOnda: 20,
    ondasFormar: 1,
    doca: '',
    colmeiasSelecionadas: []
  });

  const [counters, setCounters] = useState({
    pedidosDisponiveis: 145,
    pecasDisponiveis: 1240,
    pedidosSelecionados: 0,
    pecasSelecionadas: 0
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleApplyFilters = () => {
    // Simulação de aplicação de filtros
    setCounters(prev => ({
      ...prev,
      pedidosSelecionados: 45,
      pecasSelecionadas: 380
    }));
  };

  const renderStepIndicators = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-xl ${
              step >= s ? 'bg-secondary text-primary shadow-secondary/20' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s ? <Check className="w-6 h-6" /> : s}
            </div>
            <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
              step >= s ? 'text-primary' : 'text-slate-400'
            }`}>
              {s === 1 ? 'Configuração' : s === 2 ? 'Parametrização' : 'Resumo'}
            </span>
          </div>
          {s < 3 && (
            <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
              step > s ? 'bg-secondary' : 'bg-slate-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCounters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Pedidos Disponíveis', value: counters.pedidosDisponiveis, icon: FileText, color: 'text-slate-400', bg: 'bg-white dark:bg-slate-800' },
        { label: 'Peças Disponíveis', value: counters.pecasDisponiveis, icon: Box, color: 'text-slate-400', bg: 'bg-white dark:bg-slate-800' },
        { label: 'Pedidos Selecionados', value: counters.pedidosSelecionados, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-primary shadow-xl shadow-primary/20' },
        { label: 'Peças Selecionadas', value: counters.pecasSelecionadas, icon: Package, color: 'text-secondary', bg: 'bg-primary shadow-xl shadow-primary/20' },
      ].map((card, i) => (
        <div key={i} className={`${card.bg} p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center transition-all hover:scale-[1.02]`}>
          <card.icon className={`w-6 h-6 mb-3 ${card.color}`} />
          <span className={`text-2xl font-black ${card.bg.includes('bg-primary') ? 'text-white' : 'text-primary dark:text-white'} italic`}>
            {card.value}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${card.bg.includes('bg-primary') ? 'text-white/40' : 'text-slate-400'}`}>
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
            <Waves className="w-8 h-8 text-secondary animate-pulse" /> Assistente de Formação de Onda
          </h1>
          <p className="text-sm text-slate-500 font-medium italic mt-1">Otimize a expedição agrupando pedidos de forma estratégica</p>
        </div>
        <div className="bg-secondary/10 px-6 py-4 rounded-2xl border border-secondary/20">
          <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Cérebro WMS</span>
        </div>
      </div>

      {/* COUNTERS */}
      {renderCounters()}

      {/* WIZARD CONTAINER */}
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {renderStepIndicators()}

        <form className="max-w-4xl mx-auto min-h-[400px]">
          {/* STEP 1: FILTROS E CONFIGURAÇÃO */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-secondary" /> Configuração da Onda
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all"
                    value={formData.config}
                    onChange={(e) => setFormData({...formData, config: e.target.value})}
                  >
                    <option>Fluxo de Packing</option>
                    <option>Fluxo de Colmeia</option>
                    <option>Crossdocking Direto</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Truck className="w-4 h-4 text-secondary" /> Transportadora
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all">
                    <option>Todas as Transportadoras</option>
                    <option>Correios SEDEX</option>
                    <option>Jadlog</option>
                    <option>Total Express</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-secondary" /> Rota
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all">
                    <option>Todas as Rotas</option>
                    <option>Capital - Próximo</option>
                    <option>Interior - Norte</option>
                    <option>Nordeste - Hub</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-secondary" /> Depositante
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all">
                    <option>Todos os Responsáveis</option>
                    <option>Danilo</option>
                    <option>Matheus</option>
                    <option>Thiago</option>
                  </select>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-50 dark:border-slate-900 flex justify-center">
                <button 
                  type="button"
                  onClick={handleApplyFilters}
                  className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Filter className="w-5 h-5 text-secondary" /> Aplicar Filtros Analíticos
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PARAMETRIZAÇÃO */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Título da Onda</label>
                  <input 
                    type="text" 
                    placeholder="Ex: ONDA-MANHA-SP"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Pedidos por Onda</label>
                  <input 
                    type="number" 
                    defaultValue={20}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Qtde Ondas</label>
                  <input 
                    type="number" 
                    defaultValue={1}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest italic flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-secondary" /> Seleção de Colmeias
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" />
                    <div className="w-6 h-6 border-2 border-slate-300 rounded-lg flex items-center justify-center transition-all group-hover:border-secondary">
                      <Check className="w-4 h-4 text-secondary opacity-0" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">Listar apenas 100% disponíveis</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {MOCK_COLMEIAS.map(c => (
                    <div key={c.id} className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      c.status === 'Ocupada' ? 'opacity-40 cursor-not-allowed bg-slate-200 border-transparent' : 'bg-white hover:border-secondary border-slate-100 shadow-sm'
                    }`}>
                      <span className="text-[10px] font-black">{c.id}</span>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${c.ocupacao}%` }} />
                      </div>
                      <span className={`text-[8px] font-black uppercase ${c.status === 'Ocupada' ? 'text-danger' : 'text-success'}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESUMO E GERAÇÃO */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-primary p-8 rounded-[3rem] shadow-xl border-b-8 border-secondary overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white italic">Confirmar Formação de Onda</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Verifique os pedidos selecionados e selecione a doca</p>
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-secondary">Selecionar Doca de Saída</label>
                    <select className="w-full bg-white/10 text-white border-2 border-white/10 p-4 rounded-2xl font-bold outline-none focus:border-secondary">
                      <option>Selecione a Doca...</option>
                      <option>DOCA 01 - NORTE</option>
                      <option>DOCA 02 - SUL</option>
                      <option>DOCA RÁPIDA - EXPRESSO</option>
                    </select>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-8 py-4">idPedido</th>
                      <th className="px-8 py-4">Nota Fiscal</th>
                      <th className="px-8 py-4">Depositante</th>
                      <th className="px-8 py-4">Rota</th>
                      <th className="px-8 py-4 text-right">Peças</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    {MOCK_PEDIDOS.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                        <td className="px-8 py-4 font-black text-primary">{p.id}</td>
                        <td className="px-8 py-4 font-black text-secondary">{p.nf}</td>
                        <td className="px-8 py-4">{p.depositante}</td>
                        <td className="px-8 py-4 italic">{p.rota}</td>
                        <td className="px-8 py-4 text-right font-black">{p.pecas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>

        {/* BOTTOM NAV */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              step === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-primary'
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> Voltar Passo
          </button>
          
          <div className="flex gap-4">
            <button className="px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-danger hover:bg-danger/10 transition-all">
              Cancelar
            </button>
            {step < 3 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-primary text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Próximo Passo <ChevronRight className="w-4 h-4 text-secondary" />
              </button>
            ) : (
              <button 
                type="button"
                className="bg-secondary text-primary px-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" /> Formar Onda de Expedição
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
