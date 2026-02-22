import React, { useState } from 'react';
import {
    Cloud,
    RefreshCw,
    ArrowRightLeft,
    Database,
    Activity,
    ShieldCheck,
    Server,
    Terminal,
    LogOut,
    Settings,
    Link2
} from 'lucide-react';

export default function OmieIntegration() {
    const [isSyncing, setIsSyncing] = useState(false);

    const stats = [
        { label: 'Pedidos Sincronizados (Hoje)', value: '142', icon: ArrowRightLeft, color: 'primary' },
        { label: 'Atualizações de Estoque', value: '1.240', icon: Database, color: 'success' },
        { label: 'Status da Conexão', value: 'Online', icon: ShieldCheck, color: 'success' },
        { label: 'Latência Omie Cloud', value: '45ms', icon: Activity, color: 'primary' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Cloud className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Middleware Omie ERP</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">VerticalParts API Bridge v2.4</p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all group"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    FORÇAR SINCRONIZAÇÃO TOTAL
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className={`p-3 rounded-xl bg-${s.color}/10 border border-${s.color}/20 mb-4 inline-block`}>
                            <s.icon className={`w-5 h-5 text-${s.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-black">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-3xl p-8 text-slate-300 font-mono text-xs space-y-2 border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-slate-700 uppercase font-black text-[10px] tracking-tighter">Live API Log</div>
                    <p className="text-success">[21:04:12] AUTH_SUCCESS: Conectado à conta VerticalParts (AppKey: ...90)</p>
                    <p>[21:04:15] POLLING: Buscando pedidos emitidos no módulo de faturamento...</p>
                    <p className="text-primary">[21:04:18] SYNC_COMPLETE: 12 novos pedidos importados para Separação.</p>
                    <p>[21:05:01] HEARTBEAT_OK: 200 OK from omie.com.br/api/v1/geral</p>
                    <p className="text-warning animate-pulse">[21:05:30] RETRYING: Tentativa de conexão redundante (Região AWS-SA-EAST-1)...</p>
                    <p>[21:05:31] RECONNECTED: Switch automático para endpoint backup efetuado.</p>
                    <div className="absolute left-0 bottom-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left"></div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Server className="w-4 h-4" /> Configurações de Conectividade
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Reserva de Estoque On-line</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Bloquear saldo no ERP ao iniciar separação</span>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                                    <div className="absolute right-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Webhooks de Faturamento</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Receber notificações de NFe em tempo real</span>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                                    <div className="absolute right-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
                        <Link2 className="w-5 h-5" /> REGERAR CHAVES DE ACESSO API
                    </button>
                </div>
            </div>
        </div>
    );
}
