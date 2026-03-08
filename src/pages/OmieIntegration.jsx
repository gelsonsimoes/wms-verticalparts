import React, { useState, useRef, useEffect } from 'react';
import {
    Cloud,
    RefreshCw,
    ArrowRightLeft,
    Database,
    Activity,
    ShieldCheck,
    Server,
    Link2,
} from 'lucide-react';

// ─── Mapa de classes estáticas por cor — Tailwind não processa template strings ─────
const STAT_COLOR_CLASSES = {
    primary: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-green-100 border-green-200 text-green-600',
};

export default function OmieIntegration() {
    const [isSyncing, setIsSyncing] = useState(false);

    // Estado individual para cada toggle de conectividade
    const [reservaEstoque, setReservaEstoque] = useState(true);
    const [webhooks,       setWebhooks]       = useState(true);

    // Timeout ref para limpeza e prevenção de memory leak
    const syncTimeoutRef = useRef(null);
    useEffect(() => {
        return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
    }, []);

    const handleSync = () => {
        if (isSyncing) return;
        setIsSyncing(true);
        syncTimeoutRef.current = setTimeout(() => setIsSyncing(false), 2000);
    };

    const handleRegerarChaves = () => {
        if (window.confirm('Tem certeza que deseja regenerar as chaves de acesso API? As chaves atuais serão invalidadas imediatamente.')) {
            alert('Chaves de acesso API regeneradas com sucesso. Atualize as integrações dependentes.');
        }
    };

    const stats = [
        { label: 'Pedidos Sincronizados (Hoje)', value: '142',   icon: ArrowRightLeft, color: 'primary' },
        { label: 'Atualizações de Estoque',       value: '1.240', icon: Database,       color: 'success' },
        { label: 'Status da Conexão',             value: 'Online', icon: ShieldCheck,   color: 'success' },
        { label: 'Latência Omie Cloud',           value: '45ms',  icon: Activity,       color: 'primary' },
    ];

    // Toggle acessível como componente interno
    function Toggle({ id, checked, onChange, label, description }) {
        return (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                    <label htmlFor={id} className="text-sm font-bold cursor-pointer">{label}</label>
                    <span className="text-[10px] text-slate-400 font-bold">{description}</span>
                </div>
                <button
                    id={id}
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange(!checked)}
                    aria-label={label}
                    className={`relative w-12 h-6 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                    <span
                        className={`block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`}
                        aria-hidden="true"
                    />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Cloud className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">9.3 Conectar Omie ERP</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">VerticalParts API Bridge v2.4</p>
                    </div>
                </div>

                {/* Botão de sincronização — desabilitado durante sync para evitar múltiplos timeouts */}
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    aria-label={isSyncing ? 'Sincronizando...' : 'Forçar sincronização total'}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                        aria-hidden="true"
                    />
                    {isSyncing ? 'SINCRONIZANDO...' : 'FORÇAR SINCRONIZAÇÃO TOTAL'}
                </button>
            </div>

            {/* Cards de estatísticas — classes estáticas (Tailwind não processa template strings) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => {
                    const colorCls = STAT_COLOR_CLASSES[s.color] ?? STAT_COLOR_CLASSES.primary;
                    return (
                        <div key={s.label} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className={`p-3 rounded-xl border mb-4 inline-block ${colorCls}`}>
                                <s.icon className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-2xl font-black">{s.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Live API Log */}
                <div
                    className="bg-slate-900 rounded-3xl p-8 text-slate-300 font-mono text-xs space-y-2 border-4 border-slate-800 shadow-2xl relative overflow-hidden group"
                    aria-label="Log de atividade da API Omie (somente leitura)"
                    role="log"
                    aria-live="off"
                >
                    <div className="absolute top-4 right-4 text-slate-700 uppercase font-black text-[10px] tracking-tighter" aria-hidden="true">Live API Log</div>
                    <p className="text-green-500">[21:04:12] AUTH_SUCCESS: Conectado à conta VerticalParts (AppKey: ...90)</p>
                    <p>[21:04:15] POLLING: Buscando pedidos emitidos no módulo de faturamento...</p>
                    <p className="text-primary">[21:04:18] SYNC_COMPLETE: 12 novos pedidos importados para Separação.</p>
                    <p>[21:05:01] HEARTBEAT_OK: 200 OK from omie.com.br/api/v1/geral</p>
                    <p className="text-amber-400 animate-pulse">[21:05:30] RETRYING: Tentativa de conexão redundante (Região AWS-SA-EAST-1)...</p>
                    <p>[21:05:31] RECONNECTED: Switch automático para endpoint backup efetuado.</p>
                    <div className="absolute left-0 bottom-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" aria-hidden="true" />
                </div>

                {/* Configurações de Conectividade */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Server className="w-4 h-4" aria-hidden="true" /> Configurações de Conectividade
                        </h2>

                        <div className="space-y-4">
                            <Toggle
                                id="toggle-reserva-estoque"
                                checked={reservaEstoque}
                                onChange={setReservaEstoque}
                                label="Reserva de Estoque On-line"
                                description="Bloquear saldo no ERP ao iniciar separação"
                            />
                            <Toggle
                                id="toggle-webhooks"
                                checked={webhooks}
                                onChange={setWebhooks}
                                label="Webhooks de Faturamento"
                                description="Receber notificações de NFe em tempo real"
                            />
                        </div>
                    </div>

                    {/* Botão Regerar Chaves — com confirmação antes da ação */}
                    <button
                        onClick={handleRegerarChaves}
                        aria-label="Regenerar chaves de acesso API da integração Omie"
                        className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                    >
                        <Link2 className="w-5 h-5" aria-hidden="true" /> REGERAR CHAVES DE ACESSO API
                    </button>
                </div>
            </div>
        </div>
    );
}
