import React, { useState } from 'react';
import { 
  Settings2, 
  Database, 
  Share2, 
  FolderTree, 
  Cpu, 
  Search, 
  Check, 
  CheckCircle2,
  X, 
  Save, 
  Printer, 
  Globe, 
  Zap,
  Info,
  Building2,
  FileJson,
  Layout
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== SUB-COMPONENTES ======

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2.5 px-6 py-4 border-b-2 transition-all font-black text-[10px] tracking-[0.15em] uppercase",
      active 
        ? "border-secondary text-secondary bg-secondary/5" 
        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-secondary" : "text-slate-300")} />
    {label}
  </button>
);

const ConfigSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4 mb-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, children, description }) => (
  <div className="space-y-1.5 flex-1 min-w-[200px]">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {children}
    {description && <p className="text-[9px] text-slate-400 font-medium ml-1 italic">{description}</p>}
  </div>
);

// ====== COMPONENTE PRINCIPAL ======

export default function GeneralSettings() {
  const [activeTab, setActiveTab] = useState('geral');
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [config, setConfig] = useState({
    proprietario: 'VerticalParts Brasil LTDA',
    ambiente: 'Produção',
    ativo: true,
    importarPreCadastro: true,
    integrarFiscal: true,
    layoutExport: 'REST - Modelo verticalPerts WMS',
    dirImport: 'C:\\vparts\\data\\in',
    dirExport: 'C:\\vparts\\data\\out\\nfe',
    dirError: 'C:\\vparts\\data\\err',
    tnsName: 'https://api-prod-01.verticalparts.com:8443',
    printer: 'Zebra ZD220 (DOCA-01)'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Configurações salvas com sucesso!');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* ====== HEADER ====== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-secondary" /> Configuração Geral do Sistema
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Ambiente de segurança e parâmetros globais do WMS</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Gravando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* ====== TABS NAVIGATION ====== */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex overflow-hidden shadow-sm">
        <TabButton active={activeTab === 'geral'} label="Dados Gerais" icon={Layout} onClick={() => setActiveTab('geral')} />
        <TabButton active={activeTab === 'integracao'} label="Integração" icon={Share2} onClick={() => setActiveTab('integracao')} />
        <TabButton active={activeTab === 'diretorios'} label="Diretórios" icon={FolderTree} onClick={() => setActiveTab('diretorios')} />
        <TabButton active={activeTab === 'hardware'} label="Conexão e Hardware" icon={Cpu} onClick={() => setActiveTab('hardware')} />
      </div>

      {/* ====== TAB CONTENT ====== */}
      <div className="space-y-6">
        
        {/* TAB: DADOS GERAIS */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <ConfigSection title="Identificação Corporativa" icon={Building2}>
              <div className="flex flex-col gap-4">
                <Field label="Proprietário" description="Entidade master detentora da licença verticalPerts">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.proprietario}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all"
                      readOnly
                    />
                    <button className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Field label="Ambiente Logístico">
                    <select 
                      value={config.ambiente}
                      onChange={(e) => setConfig({...config, ambiente: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all"
                    >
                      <option>Homologação</option>
                      <option>Produção</option>
                      <option>Treinamento</option>
                    </select>
                  </Field>

                  <div className="flex items-center gap-3 pt-4 ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.ativo} 
                        onChange={(e) => setConfig({...config, ativo: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secondary"></div>
                    </label>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Sistema Ativo</span>
                  </div>
                </div>
              </div>
            </ConfigSection>

            <div className="bg-primary text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Settings2 className="w-48 h-48" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Monitoramento de Núcleo</h4>
                  <p className="text-white/60 text-xs font-medium max-w-[200px]">Status operacional dos serviços de background do verticalPerts WMS.</p>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                     <p className="text-[8px] font-black text-white/50 uppercase mb-1">Worker de Etiquetas</p>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-black">ONLINE</span>
                     </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                     <p className="text-[8px] font-black text-white/50 uppercase mb-1">Motor de ETL</p>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-black">ONLINE</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* TAB: INTEGRAÇÃO */}
        {activeTab === 'integracao'}
        {activeTab === 'integracao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <ConfigSection title="Bloco de Entrada (Inbound)" icon={Share2}>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <input 
                    type="checkbox" 
                    checked={config.importarPreCadastro}
                    onChange={(e) => setConfig({...config, importarPreCadastro: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-secondary focus:ring-secondary" 
                  />
                  <div>
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase">Importar produtos como pré-cadastro</label>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1 italic">Novos itens não identificados no ERP serão criados com status de espera para revisão do supervisor.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <input 
                    type="checkbox" 
                    checked={config.integrarFiscal}
                    onChange={(e) => setConfig({...config, integrarFiscal: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-secondary focus:ring-secondary" 
                  />
                  <div>
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase">Integrar com Módulo Fiscal (NFS-e/NF-e)</label>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1 italic">Validações obrigatórias de CFOP e CEST durante o recebimento e saída.</p>
                  </div>
                </div>
              </div>
            </ConfigSection>

            <ConfigSection title="Exportação Automática" icon={FileJson}>
              <div className="flex flex-col gap-4">
                 <Field label="Layout de Saída Default" description="Formato base para sincronização de notas de saída com transportadoras.">
                    <select 
                      value={config.layoutExport}
                      onChange={(e) => setConfig({...config, layoutExport: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all"
                    >
                      <option>REST - Modelo verticalPerts WMS</option>
                      <option>Banco de Dados (ODBC/SQL)</option>
                      <option>TXT - Layout EDI Nacional</option>
                      <option>XML - Padrão SEFAZ</option>
                    </select>
                 </Field>

                 <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-center gap-3">
                    <Info className="w-5 h-5 text-secondary shrink-0" />
                    <p className="text-[9px] font-black text-secondary leading-normal">AS EXPORTAÇÕES OCORRERÃO IMEDIATAMENTE APÓS A FINALIZAÇÃO DO CHECKPOINT NA DOCA DE EXPEDIÇÃO.</p>
                 </div>
              </div>
            </ConfigSection>
          </div>
        )}

        {/* TAB: DIRETÓRIOS */}
        {activeTab === 'diretorios' && (
          <div className="max-w-3xl animate-in fade-in duration-500">
            <ConfigSection title="Caminhos de Processamento ETL" icon={FolderTree}>
              <div className="space-y-6 pt-2">
                <Field label="Diretório de Importação" description="Monitoramento constante de arquivos TXT/XML vindos do ERP.">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.dirImport}
                      onChange={(e) => setConfig({...config, dirImport: e.target.value})}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all font-mono"
                    />
                    <button className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs">Alterar</button>
                  </div>
                </Field>

                <Field label="Diretório de Exportação NF-e" description="Pasta onde o sistema salvará as NFs prontas para emissão/envio.">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.dirExport}
                      onChange={(e) => setConfig({...config, dirExport: e.target.value})}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all font-mono"
                    />
                    <button className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs">Alterar</button>
                  </div>
                </Field>

                <Field label="Diretório de Erro" description="Logs e arquivos corrompidos identificados no ETL.">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.dirError}
                      onChange={(e) => setConfig({...config, dirError: e.target.value})}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all font-mono"
                    />
                    <button className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs">Alterar</button>
                  </div>
                </Field>
              </div>
            </ConfigSection>
          </div>
        )}

        {/* TAB: CONEXÃO E HARDWARE */}
        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <ConfigSection title="Servidor Base e API" icon={Globe}>
               <div className="space-y-4 pt-2">
                  <Field label="TNS Name / API URL" description="Endpoint principal de comunicação do verticalPerts WMS.">
                    <input 
                      type="text" 
                      value={config.tnsName}
                      onChange={(e) => setConfig({...config, tnsName: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-secondary outline-none transition-all font-mono"
                    />
                  </Field>
                  <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/10 rounded-xl">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-[10px] font-black text-success uppercase">Conexão Estabelecida com Cluster Prod-01</span>
                  </div>
               </div>
            </ConfigSection>

            <ConfigSection title="Impressão e Localhost" icon={Printer}>
               <div className="flex flex-col gap-6 pt-2">
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center text-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Printer className="w-8 h-8 text-secondary" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Impressora Ativa para a Sessão</p>
                        <p className="text-[11px] font-mono font-bold text-slate-400 mt-1">{config.printer}</p>
                     </div>
                     <button 
                       onClick={() => setShowConnectorModal(true)}
                       className="px-6 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10"
                     >
                       verticalPerts WMS Connector
                     </button>
                  </div>
               </div>
            </ConfigSection>
          </div>
        )}
      </div>

      {/* ====== MODAL CONNECTOR ====== */}
      {showConnectorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping opacity-20" />
                 <Cpu className="w-10 h-10 text-primary relative z-10" />
              </div>

              <div>
                <h3 className="text-xl font-black tracking-tight uppercase text-primary">WMS Connector</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full inline-block">v4.2.0 • Local Engine</p>
              </div>

              <div className="w-full space-y-3">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-left ml-2">Impressoras Locais Detectadas</p>
                 <div className="space-y-2">
                    {[
                      { name: 'Zebra ZD220 (DOCA-01)', type: 'Térmica (Etiquetas)' },
                      { name: 'HP LaserJet CD-MG (AD-02)', type: 'Laser (Relatórios)' },
                      { name: 'Xerox CD-MG-RECEP', type: 'Multifuncional' }
                    ].map((p, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setConfig({...config, printer: p.name}); setShowConnectorModal(false); }}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all hover:scale-[1.02]",
                          config.printer === p.name ? "border-secondary bg-secondary/5" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <Printer className={cn("w-5 h-5", config.printer === p.name ? "text-secondary" : "text-slate-300")} />
                            <div>
                               <p className="text-xs font-black">{p.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{p.type}</p>
                            </div>
                         </div>
                         {config.printer === p.name && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => setShowConnectorModal(false)}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Conectar & Validar Porta LPT1/USB
              </button>

              <button onClick={() => setShowConnectorModal(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-danger hover:underline transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
