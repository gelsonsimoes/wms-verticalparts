import React, { useState, useId, useEffect } from 'react';
import { 
  Waves, Settings2, Filter, LayoutGrid, CheckCircle2, 
  ArrowLeft, FileText, Truck, Navigation, Warehouse, 
  Box, Package, ChevronRight, Check, Play
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function WavePickingWizard() {
  const wizardId = useId();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Armazenam os dados reais retornados do banco (ou mock inteligente em memória)
  const [, setAllProducts] = useState([]);
  const [dynamicOrders, setDynamicOrders] = useState([]);

  const [formData, setFormData] = useState({
    config: 'Fluxo de Packing',
    transportadora: 'Todas as Transportadoras',
    rota: 'Todas as Rotas',
    depositante: 'Todos os Responsáveis',
    tituloOnda: '',
    pedidosPorOnda: 20,
    ondasFormar: 1,
    doca: '',
    colmeiasSelecionadas: []
  });

  const [counters, setCounters] = useState({
    pedidosDisponiveis: 0,
    pecasDisponiveis: 0,
    pedidosSelecionados: 0,
    pecasSelecionadas: 0
  });

  // Colmeias para efeito de simulação visual (Poderia vir do banco tabela `colmeias` futuramente)
  const [colmeias] = useState([
    { id: 'COL-01', status: 'Disponível', ocupacao: 0 },
    { id: 'COL-02', status: 'Parcial', ocupacao: 45 },
    { id: 'COL-03', status: 'Disponível', ocupacao: 0 },
    { id: 'COL-04', status: 'Disponível', ocupacao: 0 },
    { id: 'COL-05', status: 'Ocupada', ocupacao: 100 },
  ]);

  // Carrega produtos do banco na montagem para simular os "Pedidos"
  useEffect(() => {
    async function loadData() {
      try {
        const { data: prods } = await supabase.from('produtos').select('*');
        if (prods && prods.length > 0) {
          setAllProducts(prods);
          
          // Como não temos tabela de `pedidos_venda` no banco, 
          // Agrupamos e criamos pedidos fake em memória baseados nos produtos pra "Formar Onda"
          const fakeOrders = Array.from({ length: 15 }).map((_, i) => {
             // Sorteia de 1 a 3 produtos aleatórios para este pedido
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            for (let j = 0; j < numItems; j++) {
              const randProd = prods[Math.floor(Math.random() * prods.length)];
              items.push({
                ...randProd,
                qtd: Math.floor(Math.random() * 5) + 1 // 1 a 5 peças
              });
            }

            const totalPecas = items.reduce((acc, curr) => acc + curr.qtd, 0);

            return {
              id: `PED-${1000 + i}`,
              nf: `NF-55${40 + i}`,
              depositante: ['Danilo', 'Matheus', 'Thiago', 'VerticalParts'][Math.floor(Math.random() * 4)],
              rota: ['SP - Interior', 'RJ - Capital', 'MG - BH', 'SP - Capital'][Math.floor(Math.random() * 4)],
              transportadora: ['Correios SEDEX', 'Jadlog', 'Total Express'][Math.floor(Math.random() * 3)],
              pecas: totalPecas,
              items, // Itens que compõem este pedido
              selected: false // Campo de controle pro WIZARD
            };
          });

          setDynamicOrders(fakeOrders);
          
          // Inicializa contadores totais
          const sumPedidos = fakeOrders.length;
          const sumPecas = fakeOrders.reduce((acc, ord) => acc + ord.pecas, 0);
          setCounters({ pedidosDisponiveis: sumPedidos, pecasDisponiveis: sumPecas, pedidosSelecionados: 0, pecasSelecionadas: 0 });
        }
      } catch (err) {
        console.error('Falha ao carregar produtos/criar mock de pedidos', err);
      }
    }
    loadData();
  }, []);

  // Recalculo dos totals sempre que selecionamos pedidos (Checkbox)
  useEffect(() => {
    const selectedOrders = dynamicOrders.filter(o => o.selected);
    const sumPeds = selectedOrders.length;
    const sumPieces = selectedOrders.reduce((acc, obj) => acc + obj.pecas, 0);
    setCounters(prev => ({
      ...prev,
      pedidosSelecionados: sumPeds,
      pecasSelecionadas: sumPieces
    }));
  }, [dynamicOrders]);

  const handleApplyFilters = () => {
    if (dynamicOrders.length === 0) return;

    let filtered = [...dynamicOrders];
    
    // Aplicação dos filtros visuais 
    if (formData.transportadora !== 'Todas as Transportadoras') {
      filtered = filtered.filter(o => o.transportadora.includes(formData.transportadora));
    }
    if (formData.rota !== 'Todas as Rotas') {
      filtered = filtered.filter(o => o.rota.includes(formData.rota));
    }
    if (formData.depositante !== 'Todos os Responsáveis') {
      filtered = filtered.filter(o => o.depositante.includes(formData.depositante.split(' ')[0]));
    }

    // Se aplicou filtro, pré-seleciona eles para a Onda (E desce o resto)
    const newOrd = dynamicOrders.map(o => ({
      ...o,
      selected: filtered.some(f => f.id === o.id)
    }));
    setDynamicOrders(newOrd);
  };

  const handleCreateWave = async () => {
    // VALIDAÇÕES
    if (!formData.tituloOnda.trim()) {
      alert('Por favor, informe um título para a onda antes de criar.');
      return;
    }
    if (counters.pedidosSelecionados === 0) {
      alert('Nenhum pedido foi selecionado. Aplique filtros ou selecione manualmente.');
      return;
    }
    if (!formData.doca || formData.doca === 'Selecione a Doca...') {
      alert('Selecione uma doca de saída.');
      return;
    }
    
    // Quando escolhe colmeia, valida no mínimo
    if (formData.config === 'Fluxo de Colmeia' && formData.colmeiasSelecionadas.length === 0) {
       alert('No fluxo de colmeia é obrigatório selecionar ao menos uma colmeia no passo 2.');
       return;
    }

    setLoading(true);

    try {
      // Cria a tarefa "Pai" (como se fosse a Onda gerando TAREFAS de picking baseadas nos itens)
      const { data: t, error: tErr } = await supabase.from('tarefas').insert({ 
        tipo: 'separacao', 
        prioridade: 'Alta', 
        status: 'pendente' 
      }).select().single();

      if (tErr) throw tErr;

      // Montar todos os ITENS em bulk
      const selecoes = dynamicOrders.filter(o => o.selected);
      const insertItensPayload = [];
      
      let sequenciaGlobal = 1;
      for (const ped of selecoes) {
        for (const item of ped.items) {
           insertItensPayload.push({
             tarefa_id: t.id,
             produto_id: item.id,
             sku: item.sku,
             descricao: `[${ped.id}] ${item.descricao}`, 
             sequencia: sequenciaGlobal++,
             quantidade_esperada: item.qtd,
             endereco_id: 'R1_PP1_A01' // Mock. Na vida real leria da alocação de estoque.
           });
        }
      }

      const { error: iErr } = await supabase.from('itens_tarefa').insert(insertItensPayload);

      if (iErr) throw iErr;

      alert(`✅ Sucesso! Onda "${formData.tituloOnda}" gerada na doca "${formData.doca}"!\nForam gerados ${counters.pecasSelecionadas} itens na tarefa #${t.id} vinculados a ${counters.pedidosSelecionados} pedidos! A separação (Picking) via APK já pode processar nesta doca!`);
      
      handleCancel(); // Reseta para nova onda
    } catch (e) {
      console.error('Erro geral ao criar onda:', e);
      alert('Erro ao persistir onda no banco de dados Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (counters.pedidosSelecionados === 0) {
        alert('Você não tem nenhum pedido na Onda... Volte ao passo 1 e aplique um grupo válido de pedidos.');
        return;
      }
      if (!formData.tituloOnda.trim()) {
        alert('Dê um título para essa Onda!');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const toggleColmeiaSelection = (id) => {
    setFormData(prev => ({
      ...prev,
      colmeiasSelecionadas: prev.colmeiasSelecionadas.includes(id)
        ? prev.colmeiasSelecionadas.filter(i => i !== id)
        : [...prev.colmeiasSelecionadas, id]
    }));
  };

  const toggleOrderSelection = (id) => {
    setDynamicOrders(prev => prev.map(o => o.id === id ? { ...o, selected: !o.selected } : o));
  };

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar o progresso desse Wizard de Onda?')) {
       setStep(1);
       setFormData(prev => ({
         ...prev,
         tituloOnda: '',
         doca: '',
         colmeiasSelecionadas: []
       }));
       // Desmarcar todos os pedidos
       setDynamicOrders(prev => prev.map(o => ({ ...o, selected: false })));
    }
  };

  const renderStepIndicators = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-xl ${
              step >= s ? 'bg-secondary text-primary shadow-secondary/20' : 'bg-slate-100 text-slate-400'
            }`} aria-current={step === s ? 'step' : undefined}>
              {step > s ? <Check className="w-6 h-6" aria-hidden="true" /> : s}
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
          <card.icon className={`w-6 h-6 mb-3 ${card.color}`} aria-hidden="true" />
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
            <Waves className="w-8 h-8 text-secondary animate-pulse" aria-hidden="true" /> Assistente de Formação de Onda
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
                  <label htmlFor={`${wizardId}-config`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-secondary" aria-hidden="true" /> Configuração da Onda
                  </label>
                  <select 
                    id={`${wizardId}-config`}
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
                  <label htmlFor={`${wizardId}-transp`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Truck className="w-4 h-4 text-secondary" aria-hidden="true" /> Transportadora
                  </label>
                  <select 
                    id={`${wizardId}-transp`}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all"
                    value={formData.transportadora}
                    onChange={(e) => setFormData({...formData, transportadora: e.target.value})}
                  >
                    <option>Todas as Transportadoras</option>
                    <option>Correios SEDEX</option>
                    <option>Jadlog</option>
                    <option>Total Express</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label htmlFor={`${wizardId}-rota`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-secondary" aria-hidden="true" /> Rota
                  </label>
                  <select 
                    id={`${wizardId}-rota`}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all"
                    value={formData.rota}
                    onChange={(e) => setFormData({...formData, rota: e.target.value})}
                  >
                    <option>Todas as Rotas</option>
                    <option>SP - Capital</option>
                    <option>SP - Interior</option>
                    <option>RJ - Capital</option>
                    <option>MG - BH</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label htmlFor={`${wizardId}-dep`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-secondary" aria-hidden="true" /> Depositante
                  </label>
                  <select 
                    id={`${wizardId}-dep`}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all"
                    value={formData.depositante}
                    onChange={(e) => setFormData({...formData, depositante: e.target.value})}
                  >
                    <option>Todos os Responsáveis</option>
                    <option>Danilo</option>
                    <option>Matheus</option>
                    <option>Thiago</option>
                    <option>VerticalParts</option>
                  </select>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-50 dark:border-slate-900 flex justify-center">
                <button 
                  type="button"
                  onClick={handleApplyFilters}
                  className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Filter className="w-5 h-5 text-secondary" aria-hidden="true" /> Aplicar Limites na Fila de Pedidos
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PARAMETRIZAÇÃO */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label htmlFor={`${wizardId}-titulo`} className="text-[10px] font-black uppercase tracking-widest text-primary">Título da Onda *</label>
                  <input 
                    id={`${wizardId}-titulo`}
                    type="text" 
                    placeholder="Ex: ONDA-MANHA-SP"
                    value={formData.tituloOnda}
                    onChange={(e) => setFormData({...formData, tituloOnda: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor={`${wizardId}-ped-onda`} className="text-[10px] font-black uppercase tracking-widest text-primary">Pedidos Exibição P/ Tela</label>
                  <input 
                    id={`${wizardId}-ped-onda`}
                    type="number" 
                    value={formData.pedidosPorOnda}
                    onChange={(e) => setFormData({...formData, pedidosPorOnda: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor={`${wizardId}-qtd-onda`} className="text-[10px] font-black uppercase tracking-widest text-primary">Qtde Lotes / Fatias</label>
                  <input 
                    id={`${wizardId}-qtd-onda`}
                    type="number" 
                    value={formData.ondasFormar}
                    onChange={(e) => setFormData({...formData, ondasFormar: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl font-bold outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {formData.config === 'Fluxo de Colmeia' && (
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest italic flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-secondary" aria-hidden="true" /> Seleção de Colmeias *
                    </h3>
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={() => setFilterAvailable(!filterAvailable)}
                      onKeyDown={(e) => { if(e.key === ' ' || e.key === 'Enter') setFilterAvailable(!filterAvailable) }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${filterAvailable ? 'bg-secondary border-secondary' : 'border-slate-300 group-hover:border-secondary'}`}>
                        {filterAvailable && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">Listar apenas 100% disponíveis</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {(filterAvailable ? colmeias.filter(c => c.status === 'Disponível') : colmeias).map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => c.status !== 'Ocupada' && toggleColmeiaSelection(c.id)}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          c.status === 'Ocupada' ? 'opacity-40 cursor-not-allowed bg-slate-200 border-transparent' : 
                          formData.colmeiasSelecionadas.includes(c.id) ? 'bg-secondary/20 border-secondary shadow-lg scale-[1.05]' : 'bg-white hover:border-secondary border-slate-100 shadow-sm'
                        }`}
                      >
                        <span className="text-[10px] font-black">{c.id}</span>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${c.ocupacao}%` }} />
                        </div>
                        <span className={`text-[8px] font-black uppercase ${c.status === 'Ocupada' ? 'text-danger' : 'text-success'}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: RESUMO E GERAÇÃO */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-primary p-8 rounded-[3rem] shadow-xl border-b-8 border-secondary overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white italic">Confirmar Seleção de Pedidos e Config</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{formData.tituloOnda} • {counters.pedidosSelecionados} Pedidos</p>
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <label htmlFor={`${wizardId}-doca-resumo`} className="text-[9px] font-black uppercase tracking-widest text-secondary">Selecionar Doca de Saída *</label>
                    <select 
                      id={`${wizardId}-doca-resumo`}
                      className="w-full bg-white/10 text-white border-2 border-white/10 p-4 rounded-2xl font-bold outline-none focus:border-secondary transition-all [&>option]:bg-primary [&>option]:text-white"
                      value={formData.doca}
                      onChange={(e) => setFormData({...formData, doca: e.target.value})}
                    >
                      <option>Selecione a Doca...</option>
                      <option>DOCA 01 - NORTE</option>
                      <option>DOCA 02 - SUL</option>
                      <option>DOCA RÁPIDA - EXPRESSO</option>
                    </select>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th scope="col" className="px-6 py-4 w-10 text-center">In</th>
                      <th scope="col" className="px-6 py-4">idPedido (Mock)</th>
                      <th scope="col" className="px-6 py-4">Status Transp. / Info</th>
                      <th scope="col" className="px-6 py-4 text-right">Peças</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    {dynamicOrders.map(p => (
                      <tr 
                        key={p.id} 
                        className={`transition-all cursor-pointer ${p.selected ? 'bg-secondary/5 dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                        onClick={() => toggleOrderSelection(p.id)}
                      >
                         <td className="px-6 py-4 text-center">
                            <div className={`w-4 h-4 rounded-full border-2 mx-auto flex flex-col justify-center items-center ${p.selected ? 'bg-secondary border-secondary' : 'border-slate-300'}`}>
                               {p.selected && <Check className="w-3 h-3 text-primary stroke-[4]" />}
                            </div>
                         </td>
                        <td className="px-6 py-4">
                           <div className="font-black text-primary">{p.id}</div>
                           <div className="text-[9px] text-slate-400 mt-0.5">{p.nf} • {p.depositante}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-secondary">{p.transportadora}</div>
                           <div className="italic text-slate-500">{p.rota}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-sm">{p.pecas}</td>
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
            disabled={step === 1 || loading}
            className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              step === 1 || loading ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-primary active:scale-95'
            }`}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" /> Voltar Passo
          </button>
          
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-danger hover:bg-danger/10 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancelar/Reset
            </button>
            {step < 3 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-primary text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Próximo Passo <ChevronRight className="w-4 h-4 text-secondary" aria-hidden="true" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleCreateWave}
                disabled={loading || counters.pedidosSelecionados === 0}
                className="bg-secondary text-primary px-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                   <span className="flex items-center gap-2">Gravando no DB... <Box className="w-5 h-5 animate-bounce" /></span>
                ) : (
                  <>
                     <Play className="w-5 h-5 fill-current" aria-hidden="true" /> Formar Onda & Mandar MOCK pro APK
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
