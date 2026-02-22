import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, Search, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Companies() {
    const { companies, addCompany } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', cnpj: '', omieKey: '', status: 'Ativo' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addCompany(formData);
        setShowModal(false);
        setFormData({ name: '', cnpj: '', omieKey: '', status: 'Ativo' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Cadastro de Empresas</h1>
                    <p className="text-sm text-slate-500">Gerencie as entidades e integrações Omie ERP</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    ADICIONAR EMPRESA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                    <div key={company.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${company.status === 'Ativo' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {company.status}
                            </span>
                        </div>
                        <h3 className="font-black text-lg mb-1">{company.name}</h3>
                        <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">CNPJ: {company.cnpj}</p>

                        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
                            <ShieldCheck className="w-4 h-4 text-success" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Integração Omie: Conectada</span>
                        </div>

                        <button className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary/10 transition-colors flex items-center justify-center gap-2">
                            CONFIGURAR API <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                        <h2 className="text-xl font-black mb-6">Nova Empresa</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Razão Social</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CNPJ</label>
                                <input
                                    required
                                    placeholder="00.000.000/0000-00"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.cnpj}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">App Key (Omie)</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.omieKey}
                                    onChange={e => setFormData({ ...formData, omieKey: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                >
                                    SALVAR
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
