import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Package,
    Search,
    Scan,
    ChevronRight,
    CheckCircle2,
    Printer,
    QrCode,
    Box,
    Truck,
    ArrowRight,
    ShieldCheck,
    Zap
} from 'lucide-react';

export default function PackingStation() {
    const [showLabel, setShowLabel] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Order, 2: Double Check, 3: Finished

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Estação de Embalagem (Packing)</h1>
                    <p className="text-sm text-slate-500">Double Check de itens e fechamento de volumes</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Estação</span>
                        <span className="text-sm font-bold">PACK-01 (Norte)</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-success animate-pulse" />
                    </div>
                </div>
            </div>

            {step === 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-6 shadow-xl shadow-primary/5 border-b-8 border-b-primary/10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                            <Package className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Pronto para iniciar novo volume?</h2>
                        <p className="text-slate-500 max-w-sm mx-auto text-sm">Bipe a etiqueta de picking ou digite o número do pedido abaixo para iniciar a conferência.</p>
                    </div>
                    <div className="max-w-md mx-auto relative group">
                        <input
                            type="text"
                            placeholder="Digite SO #8842 para testar..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-5 px-14 text-lg font-black tracking-widest focus:ring-4 focus:ring-primary/10 transition-all text-center outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
                        />
                        <Scan className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                        <button onClick={() => setStep(2)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-xl hover:scale-105 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-black uppercase">SO #8842 - Conferência</h3>
                                    <p className="text-xs text-slate-400 font-bold">Cliente: Distribuidora Veloz</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black leading-none">0<span className="text-slate-300 mx-1">/</span>12</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Conferidos</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <Box className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Produto Peça #{i}00X</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">PN: VP-PART-{i}23</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg">FALTAM 4</span>
                                            <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-primary hover:bg-primary hover:text-white transition-all">
                                                <Scan className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
                                <h3 className="text-xl font-black leading-tight mb-2">Double Check Ativado</h3>
                                <p className="text-xs opacity-80 leading-relaxed font-bold">O sistema não permite o fechamento do volume se houver divergências com o pedido original Omie.</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Box className="w-32 h-32" />
                            </div>
                        </div>

                        <button
                            onClick={() => { setShowLabel(true); setStep(3); }}
                            className="w-full bg-success hover:bg-success/90 text-white font-black py-5 rounded-3xl shadow-xl shadow-success/20 transition-all flex flex-col items-center gap-1 group"
                        >
                            <div className="flex items-center gap-2">
                                FECHAR VOLUME <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
                            </div>
                            <span className="text-[10px] opacity-80 uppercase tracking-widest font-black">Gerar Etiqueta de Embarque</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border-4 border-success/5">
                        <CheckCircle2 className="w-12 h-12 text-success" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Volume Fechado!</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">Pedido SO #8842 sincronizado com status 'Pronto para Embarque' no Omie.</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <button onClick={() => setShowLabel(true)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                            <Printer className="w-5 h-5" /> REIMPRIMIR
                        </button>
                        <button onClick={() => setStep(1)} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                            PRÓXIMO PEDIDO <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {showLabel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowLabel(false)}></div>
                    <div className="bg-white p-10 rounded-[40px] shadow-2xl relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
                        <div className="border-[6px] border-black p-6 space-y-6 text-black font-sans uppercase">
                            <div className="flex justify-between items-center border-b-4 border-black pb-4">
                                <div className="font-black italic text-3xl">V-PARTS</div>
                                <div className="text-right">
                                    <p className="text-xs font-black">Transporte</p>
                                    <p className="text-lg font-black leading-none">JADLOG</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black mb-1">Destinatário</p>
                                    <p className="text-xs font-bold leading-tight">Distribuidora Veloz<br />Av. das Américas, 2000<br />Rio de Janeiro - RJ</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black mb-1">Pedido ERP</p>
                                    <p className="text-2xl font-black">#8842</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center py-6 border-y-4 border-black border-dashed">
                                <QrCode className="w-40 h-40" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-full h-20 bg-black flex items-center justify-center text-white text-3xl font-black tracking-[0.6em]">
                                    VOLUME 01/04
                                </div>
                                <p className="text-[10px] font-black mt-2 tracking-widest">VerticalParts WMS - High Accuracy Logistics</p>
                            </div>
                        </div>
                        <button onClick={() => setShowLabel(false)} className="mt-8 w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-colors shadow-lg">
                            ENVIAR PARA IMPRESSORA (ZPL)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
