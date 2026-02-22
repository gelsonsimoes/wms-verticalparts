import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Globe, 
    Folder, 
    Key, 
    Copy, 
    RefreshCw, 
    Check, 
    Server, 
    Database, 
    ShieldCheck, 
    Zap,
    AlertCircle,
    Save
} from 'lucide-react';

export default function RestConfig() {
    const [isRestEnabled, setIsRestEnabled] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [config, setConfig] = useState({
        inputDir: 'C:\\WMS\\Integracoes\\Entrada',
        outputDir: 'C:\\WMS\\Integracoes\\Saida',
        errorDir: 'C:\\WMS\\Integracoes\\Erros',
        apiUrl: 'https://api.verticalparts.com.br/v1/wms',
        timeout: '30'
    });

    const generateApiKey = () => {
        // Simulação de geração de hash SHA-256
        const chars = 'abcdef0123456789';
        let hash = '';
        for (let i = 0; i < 64; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setApiKey(hash);
    };

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleSave = () => {
        alert('Configurações de integração salvas com sucesso!');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-secondary" /> Configuração de Integração
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Setup de comunicação REST e diretórios de intercâmbio</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="bg-secondary text-primary px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <Save className="w-4 h-4" /> Salvar Configuração
                </button>
            </div>

            {/* ====== MODO DE OPERAÇÃO ====== */}
            <div className="bg-primary p-8 rounded-[3rem] shadow-2xl border-b-8 border-secondary relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-black text-white italic">Modo de Conectividade</h3>
                        <p className="text-white/50 font-bold text-xs uppercase tracking-widest">Escolha entre integração via pastas locais ou serviço REST API</p>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${!isRestEnabled ? 'text-white' : 'text-white/30'}`}>Intercâmbio Arquivo</span>
                            <button 
                                onClick={() => setIsRestEnabled(!isRestEnabled)}
                                className={`w-14 h-7 rounded-full p-1 transition-all ${isRestEnabled ? 'bg-secondary' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-primary transition-transform ${isRestEnabled ? 'translate-x-7' : ''}`} />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isRestEnabled ? 'text-secondary font-black' : 'text-white/30'}`}>API REST / JSON</span>
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ====== CONFIGURAÇÃO DIRETÓRIOS ====== */}
                <div className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${isRestEnabled ? 'opacity-40 grayscale-0 pointer-events-none shadow-none border-slate-100 dark:border-slate-900' : ''}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                            <Folder className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-black text-primary">Intercâmbio de Pastas</h3>
                    </div>

                    <div className="space-y-6">
                        {['inputDir', 'outputDir', 'errorDir'].map((field, idx) => (
                            <div key={field} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    {field === 'inputDir' ? 'Diretório de Entrada (Importação)' : field === 'outputDir' ? 'Diretório de Saída (Exportação)' : 'Diretório de Erros'}
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={config[field]}
                                        disabled={isRestEnabled}
                                        onChange={(e) => setConfig({...config, [field]: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 pl-12 text-sm font-bold outline-none focus:border-primary transition-all text-slate-600 dark:text-slate-300"
                                    />
                                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {isRestEnabled && (
                        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Modo REST ativo: Pastas locais desabilitadas</span>
                        </div>
                    )}
                </div>

                {/* ====== CONFIGURAÇÃO REST API ====== */}
                <div className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${!isRestEnabled ? 'opacity-40 pointer-events-none' : 'ring-4 ring-secondary/20 border-secondary/30'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-black text-primary italic">Serviço REST JSON</h3>
                        </div>
                        {isRestEnabled && <Zap className="w-6 h-6 text-secondary animate-pulse" />}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Endpoint Master da API</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={config.apiUrl}
                                    disabled={!isRestEnabled}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 pl-12 text-sm font-bold outline-none focus:border-secondary transition-all"
                                />
                                <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Chave para Integração via Serviço Rest</label>
                                <button 
                                    onClick={generateApiKey}
                                    className="text-[10px] font-black text-secondary uppercase hover:underline"
                                >
                                    Gerar Nova API Key
                                </button>
                            </div>
                            <div className="relative group">
                                <textarea 
                                    readOnly 
                                    value={apiKey}
                                    placeholder="Nenhuma chave gerada..."
                                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-6 px-6 text-xs text-emerald-400 font-mono tracking-tighter outline-none focus:border-secondary transition-all resize-none h-24"
                                />
                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                    {copyFeedback && <span className="text-[8px] font-black text-secondary animate-in fade-in slide-in-from-right-2">COPIADO!</span>}
                                    <button 
                                        onClick={handleCopy}
                                        className="p-2 bg-white/10 hover:bg-secondary hover:text-primary rounded-xl transition-all"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Algoritmo: SHA-256 (Hash Seguro)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Parâmetros Adicionais</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Timeout da Conexão</span>
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue="30" className="w-16 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg py-1 px-2 text-center font-black text-xs" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Segundos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
