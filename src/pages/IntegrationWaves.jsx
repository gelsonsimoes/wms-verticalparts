import React, { useState } from 'react';
import {
  Share2,
  Waves,
  Plus,
  Save,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Workflow,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
const INITIAL_INTEGRATIONS = [
  { id: 1, description: 'Exportação de Estoque Omie', fileName: 'estoque_omie_{date}',    format: 'JSON', periodicity: 'Diário',  time: '02:00', active: true  },
  { id: 2, description: 'Relatório Fiscal Mensal',    fileName: 'fiscal_mensal_{month}',  format: 'XML',  periodicity: 'Mensal',  time: '23:00', active: true  },
  { id: 3, description: 'Integração Courier Loggi',   fileName: 'loggi_expedicao',         format: 'CSV',  periodicity: 'Semanal', time: '18:30', active: false },
];

const FORMAT_OPTIONS = ['Excel xlsx', 'Separado por Vírgula csv', 'Pipe psv', 'TXT', 'XML', 'JSON'];
const PERIOD_OPTIONS = ['Diário', 'Semanal', 'Mensal'];

export default function IntegrationWaves() {
  const [activeTab,    setActiveTab]    = useState('integration'); // 'integration' | 'waves'
  const [integrations] = useState(INITIAL_INTEGRATIONS);
  const [waveSaved,    setWaveSaved]    = useState(false);

  // Wave Config State
  const [waveConfig, setWaveConfig] = useState({
    minWeight:      100,
    maxWeight:      1500,
    maxItems:       50,
    maxSkus:        20,
    groupNf:        true,
    allowBreak:     false,
    useOutputCheck: true,
  });

  const handleSaveWaves = () => {
    // ⚠️ INTEGRAÇÃO NECESSÁRIA: PUT /api/waves/config
    setWaveSaved(true);
    setTimeout(() => setWaveSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 pt-10 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
            <Workflow className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">9.6 Integrar Ondas (Arquivo)</h1>
            <p className="text-slate-500 font-medium text-sm">Integração de Dados &amp; Regras de Formação de Ondas</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'integration'}
            onClick={() => setActiveTab('integration')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200',
              activeTab === 'integration'
                ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            Integração
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'waves'}
            onClick={() => setActiveTab('waves')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200',
              activeTab === 'waves'
                ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Waves className="w-4 h-4" aria-hidden="true" />
            Ondas
          </button>
        </div>
      </div>

      {/* Feedback de salvamento de onda */}
      {waveSaved && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center gap-3 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs font-black animate-in fade-in duration-300"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          Configurações de Onda salvas com sucesso!
          <button onClick={() => setWaveSaved(false)} aria-label="Fechar aviso" className="ml-auto text-green-400/60 hover:text-green-400 transition-colors">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'integration' ? (
          <IntegrationView integrations={integrations} />
        ) : (
          <WavesView config={waveConfig} setConfig={setWaveConfig} onSave={handleSaveWaves} />
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function IntegrationView({ integrations }) {
  const [etlSaved, setEtlSaved] = useState(false);

  const handleSaveEtl = () => {
    // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/integrations/etl
    setEtlSaved(true);
    setTimeout(() => setEtlSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: GRID */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" aria-hidden="true" />
            Exportações Ativas
          </h2>
          {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: modal de criação de exportação */}
          <button
            aria-label="Criar nova exportação"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Nova Exportação
          </button>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição</th>
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Formato</th>
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Periodicidade</th>
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Hora</th>
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {integrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Nenhuma exportação cadastrada
                  </td>
                </tr>
              ) : (
                integrations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">{item.description}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-800 text-primary rounded text-[10px] font-black border border-primary/20">
                        {item.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">{item.periodicity}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{item.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px]', item.active ? 'bg-green-500 shadow-green-500/50' : 'bg-slate-600 shadow-slate-600/50')} aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{item.active ? 'Ativo' : 'Pausado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Sempre visíveis (opacidade reduzida), aumentam no hover — acessível em touch */}
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label={`Adicionar integração em ${item.description}`}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-all"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Excluir exportação ${item.description}`}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5" aria-hidden="true">
            <Share2 className="w-32 h-32 text-primary" />
          </div>

          <h2 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            Configurar ETL
            <div className="h-px flex-1 bg-slate-800 ml-2" aria-hidden="true" />
          </h2>

          {etlSaved && (
            <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-black animate-in fade-in duration-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Configuração salva!
            </div>
          )}

          <div className="space-y-4">
            {/* Campo: Descrição */}
            <div className="space-y-1.5">
              <label htmlFor="etl-description" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Descrição
              </label>
              <input
                id="etl-description"
                type="text"
                placeholder="Ex: Exportação Diária Webhook"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-slate-200 placeholder:text-slate-700"
              />
            </div>

            {/* Campo: Nomenclatura */}
            <div className="space-y-1.5">
              <label htmlFor="etl-filename" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Nomenclatura do Arquivo
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" aria-hidden="true" />
                <input
                  id="etl-filename"
                  type="text"
                  placeholder="relatorio_{timestamp}"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-slate-200 placeholder:text-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Campo: Formatação */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="etl-format" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Formatação
                </label>
                {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: controlar via estado quando API disponível */}
                <select
                  id="etl-format"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-slate-200 appearance-none cursor-pointer"
                >
                  {FORMAT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Agendamento */}
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 space-y-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-primary" aria-hidden="true" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Agendamento</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="etl-periodicity" className="text-[9px] font-bold text-slate-600 uppercase ml-1">
                    Periodicidade
                  </label>
                  <select
                    id="etl-periodicity"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-slate-400 appearance-none cursor-pointer"
                  >
                    {PERIOD_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="etl-time" className="text-[9px] font-bold text-slate-600 uppercase ml-1">
                    Hora Execução
                  </label>
                  <input
                    id="etl-time"
                    type="time"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveEtl}
              aria-label="Salvar configuração de exportação ETL"
              className="w-full mt-4 bg-primary text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
            >
              <Save className="w-4 h-4" aria-hidden="true" /> Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de toggle acessível reutilizável
function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-primary/30 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all', checked ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-600')}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black text-white uppercase tracking-tight">{label}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{description}</p>
        </div>
      </div>
      {/* role=switch + aria-checked = toggle semântico operável por teclado (espaço/enter) */}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn(
          'w-12 h-6 rounded-full relative transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          checked ? 'bg-primary' : 'bg-slate-700'
        )}
      >
        <span className="sr-only">{checked ? 'Ativado' : 'Desativado'}</span>
        <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg', checked ? 'left-7' : 'left-1')} />
      </button>
    </div>
  );
}

function WavesView({ config, setConfig, onSave }) {
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

      {/* INTRO CARD */}
      <div className="bg-gradient-to-br from-primary/10 via-slate-900 to-slate-950 border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-48 h-48 bg-primary/5 rounded-full blur-3xl transition-all group-hover:bg-primary/10" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-slate-950 flex items-center justify-center shrink-0 shadow-xl shadow-primary/20">
            <Waves className="w-8 h-8" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Algoritmo de Separação</h2>
            <p className="text-slate-400 text-sm font-medium max-w-lg">
              As ondas (Waves) otimizam a produtividade agrupando pedidos por características físicas,
              evitando que os operadores percorram o armazém desnecessariamente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PARÂMETROS NUMÉRICOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            Limites Matemáticos
            <div className="h-px flex-1 bg-slate-800" aria-hidden="true" />
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="wave-min-weight" className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Peso Mínimo (kg)
              </label>
              <div className="relative">
                <Database className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" aria-hidden="true" />
                <input
                  id="wave-min-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  max="99999"
                  value={config.minWeight}
                  onChange={(e) => updateConfig('minWeight', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-lg font-black text-primary focus:outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="wave-max-weight" className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Peso Máximo (kg)
              </label>
              <div className="relative">
                <Database className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" aria-hidden="true" />
                <input
                  id="wave-max-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  max="99999"
                  value={config.maxWeight}
                  onChange={(e) => updateConfig('maxWeight', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-lg font-black text-primary focus:outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label htmlFor="wave-max-items" className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Número Máx Peças
              </label>
              <input
                id="wave-max-items"
                type="number"
                min="1"
                step="1"
                max="9999"
                value={config.maxItems}
                onChange={(e) => updateConfig('maxItems', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-lg font-black text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="wave-max-skus" className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Máximo SKUs
              </label>
              <input
                id="wave-max-skus"
                type="number"
                min="1"
                step="1"
                max="9999"
                value={config.maxSkus}
                onChange={(e) => updateConfig('maxSkus', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-lg font-black text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* COMPORTAMENTO */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl border-l-4 border-l-primary/30">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            Configuração de Fluxo
            <div className="h-px flex-1 bg-slate-800" aria-hidden="true" />
          </h3>

          <div className="space-y-6 flex-1">
            <Toggle
              checked={config.groupNf}
              onChange={() => updateConfig('groupNf', !config.groupNf)}
              label="Agrupar NF na Formação"
              description="Prioriza remessa por documento"
              icon={FileText}
            />
            <Toggle
              checked={config.allowBreak}
              onChange={() => updateConfig('allowBreak', !config.allowBreak)}
              label="Permitir Quebra de Local"
              description="Divide ordem em múltiplos setores"
              icon={Workflow}
            />
            <Toggle
              checked={config.useOutputCheck}
              onChange={() => updateConfig('useOutputCheck', !config.useOutputCheck)}
              label="Conferência de Saída"
              description="Exige validação final (Checking)"
              icon={CheckCircle2}
            />
          </div>

          <button
            onClick={onSave}
            aria-label="Aplicar regras de formação de onda"
            className="w-full mt-10 bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-primary/5 uppercase text-xs tracking-[0.2em]"
          >
            <Save className="w-5 h-5" aria-hidden="true" /> Aplicar Regras de Onda
          </button>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-primary animate-pulse shrink-0" aria-hidden="true" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          As alterações nestas configurações afetam o processamento de pedidos em tempo real. Recomenda-se realizar testes em ambiente de homologação.
        </p>
      </div>
    </div>
  );
}
