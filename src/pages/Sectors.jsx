import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    Layers, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight,
    Filter, CheckCircle2, XCircle, Shield, Users, MapPin, Package,
    Building2, X, Lock, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';

// ========== SUPERVISOR AUTH MODAL ==========
function SupervisorModal({ onConfirm, onCancel, message }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const firstInputRef = useRef(null);

    // Foca o primeiro campo ao abrir + fecha com Escape
    useEffect(() => {
        firstInputRef.current?.focus();
        const fn = (e) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [onCancel]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (user.trim() && pass.trim()) onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onCancel}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="supervisor-modal-title"
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center border border-danger/20" aria-hidden="true">
                        <Lock className="w-6 h-6 text-danger" />
                    </div>
                    <div>
                        <h3 id="supervisor-modal-title" className="text-base font-black">Autorização de Supervisor</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ação restrita</p>
                    </div>
                </div>

                {message && <div className="flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl" role="alert"><AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" aria-hidden="true" /><p className="text-xs text-danger font-bold">{message}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="sup-user" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Supervisor</label>
                        <input
                            ref={firstInputRef}
                            id="sup-user"
                            required type="text" value={user} onChange={e => setUser(e.target.value)}
                            placeholder="Login do supervisor"
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-danger focus:ring-4 focus:ring-danger/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="sup-pass" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                        <input
                            id="sup-pass"
                            required type="password" value={pass} onChange={e => setPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-danger focus:ring-4 focus:ring-danger/10 outline-none transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={onCancel} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                        <button type="submit" className="py-3 bg-danger text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger/90 transition-all shadow-lg shadow-danger/20 flex items-center justify-center gap-2"><Shield className="w-3.5 h-3.5" aria-hidden="true" /> Autorizar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ========== LINKING MODAL ==========
function LinkingModal({ title, icon: Icon, items, _columns, _headers, onClose, onAdd, onRemove }) {
    const [newVal, setNewVal] = useState('');
    const inputId = `linking-input-${title.toLowerCase().replace(/\s+/g, '-')}`;

    // Fecha com Escape
    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="linking-modal-title"
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center" aria-hidden="true"><Icon className="w-5 h-5 text-primary" /></div>
                        <h3 id="linking-modal-title" className="text-base font-black">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={`Fechar modal de ${title.toLowerCase()}`}
                        className="p-2 text-slate-400 hover:text-danger transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                        <label htmlFor={inputId} className="sr-only">Adicionar {title.toLowerCase()}</label>
                        <input
                            id={inputId}
                            type="text" value={newVal}
                            onChange={e => setNewVal(e.target.value.toUpperCase())}
                            placeholder={`Adicionar ${title.toLowerCase()}...`}
                            className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all"
                        />
                        <button
                            onClick={() => { if (newVal.trim()) { onAdd(newVal); setNewVal(''); } }}
                            aria-label={`Adicionar ${title.toLowerCase()}`}
                            className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {items.length > 0 ? (
                        <div className="space-y-2">
                            {items.map((item, i) => {
                                const itemKey = typeof item === 'object'
                                    ? (item.cnpj || item.id || JSON.stringify(item))
                                    : item;
                                return (
                                    <div key={`${itemKey}-${i}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                        <span className="text-xs font-bold uppercase">{typeof item === 'object' ? Object.values(item).join(' — ') : item}</span>
                                        <button
                                            onClick={() => onRemove(i)}
                                            aria-label={`Remover ${typeof item === 'object' ? Object.values(item).join(' ') : item}`}
                                            className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center opacity-30"><p className="text-xs font-black uppercase tracking-widest">Nenhum vínculo</p></div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{items.length} registros vinculados</p>
                </div>
            </div>
        </div>
    );
}

// ========== MAIN COMPONENT ==========
export default function Sectors() {
    const { sectors, sectorsCrud, inventory } = useApp();

    const [formData, setFormData] = useState({ id: '', setor: '', tipoSetor: 'Armazenagem', tipoLocal: 'Porta Palete', codigoIntegracao: '', ativo: true, usoExclusivoCaixa: false });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [showSupervisor, setShowSupervisor] = useState(false);
    const [supervisorAction, setSupervisorAction] = useState(null);
    const [supervisorMessage, setSupervisorMessage] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const itemsPerPage = 8;

    const tipoSetorOptions = ['Armazenagem', 'Expedição', 'Recebimento', 'Serviço', 'Picking', 'Packing'];
    const tipoLocalOptions = ['Porta Palete', 'Colmeia', 'Bancada', 'Buffer', 'Drive-in', 'Bloco', 'Mezanino'];

    // === Filter & Paginate ===
    const filtered = useMemo(() => {
        return sectors.filter(s => {
            const matchSearch = s.setor.toLowerCase().includes(searchTerm.toLowerCase()) || s.codigoIntegracao?.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toString().includes(searchTerm);
            const matchStatus = statusFilter === 'Todos' || (statusFilter === 'Ativado' && s.ativo) || (statusFilter === 'Desativado' && !s.ativo);
            return matchSearch && matchStatus;
        });
    }, [sectors, searchTerm, statusFilter]);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = useMemo(() => {
        const s = (currentPage - 1) * itemsPerPage;
        return filtered.slice(s, s + itemsPerPage);
    }, [filtered, currentPage]);

    const selectedSector = sectors.find(s => s.id === selectedId);

    // === Handlers ===
    const handleSelect = (s) => {
        setSelectedId(s.id);
        setFormData({ id: s.id, setor: s.setor, tipoSetor: s.tipoSetor, tipoLocal: s.tipoLocal, codigoIntegracao: s.codigoIntegracao || '', ativo: s.ativo, usoExclusivoCaixa: s.usoExclusivoCaixa || false });
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.setor.trim()) return;
        if (isEditing) {
            sectorsCrud.update(formData.id, { setor: formData.setor, tipoSetor: formData.tipoSetor, tipoLocal: formData.tipoLocal, codigoIntegracao: formData.codigoIntegracao, usoExclusivoCaixa: formData.usoExclusivoCaixa });
        } else {
            sectorsCrud.add({ setor: formData.setor, tipoSetor: formData.tipoSetor, tipoLocal: formData.tipoLocal, codigoIntegracao: formData.codigoIntegracao, ativo: true, usoExclusivoCaixa: formData.usoExclusivoCaixa, depositantes: [], enderecos: [], produtos: [], usuarios: [] });
        }
        handleClear();
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('Deseja realmente excluir este setor?')) { sectorsCrud.remove(selectedId); handleClear(); }
    };

    const handleClear = () => {
        setFormData({ id: '', setor: '', tipoSetor: 'Armazenagem', tipoLocal: 'Porta Palete', codigoIntegracao: '', ativo: true, usoExclusivoCaixa: false });
        setIsEditing(false);
        setSelectedId(null);
    };

    const requestDeactivate = () => {
        if (!selectedId) return;
        const sector = sectors.find(s => s.id === selectedId);
        if (sector?.usoExclusivoCaixa) {
            const hasStock = inventory.some(i => sector.enderecos?.includes(i.localizacao) && (i.systemStock || 0) > 0);
            if (hasStock) {
                alert('Não é possível desativar: há estoque nos locais com "Uso Exclusivo Caixa de Movimentação".');
                return;
            }
        }
        setSupervisorMessage('Esta ação requer autorização de supervisor para desativar o setor.');
        setSupervisorAction('deactivate');
        setShowSupervisor(true);
    };

    const requestActivate = () => {
        if (!selectedId) return;
        sectorsCrud.update(selectedId, { ativo: true });
        setFormData(prev => ({ ...prev, ativo: true }));
    };

    const handleSupervisorConfirm = () => {
        if (supervisorAction === 'deactivate') {
            sectorsCrud.update(selectedId, { ativo: false });
            setFormData(prev => ({ ...prev, ativo: false }));
        }
        setShowSupervisor(false);
        setSupervisorAction(null);
    };

    // === Linking Handlers ===
    const handleAddLink = (field, value) => {
        if (!selectedId) return;
        const sector = sectors.find(s => s.id === selectedId);
        if (!sector) return;
        const arr = [...(sector[field] || [])];
        if (field === 'depositantes') arr.push({ cnpj: value, razaoSocial: value });
        else arr.push(value);
        sectorsCrud.update(selectedId, { [field]: arr });
    };

    const handleRemoveLink = (field, index) => {
        if (!selectedId) return;
        const sector = sectors.find(s => s.id === selectedId);
        if (!sector) return;
        const arr = [...(sector[field] || [])];
        arr.splice(index, 1);
        sectorsCrud.update(selectedId, { [field]: arr });
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Supervisor Modal */}
            {showSupervisor && <SupervisorModal message={supervisorMessage} onConfirm={handleSupervisorConfirm} onCancel={() => setShowSupervisor(false)} />}

            {/* Linking Modals */}
            {activeModal === 'depositantes' && selectedSector && (
                <LinkingModal title="Depositantes" icon={Building2} items={selectedSector.depositantes || []} onClose={() => setActiveModal(null)} onAdd={(v) => handleAddLink('depositantes', v)} onRemove={(i) => handleRemoveLink('depositantes', i)} />
            )}
            {activeModal === 'enderecos' && selectedSector && (
                <LinkingModal title="Endereços" icon={MapPin} items={selectedSector.enderecos || []} onClose={() => setActiveModal(null)} onAdd={(v) => handleAddLink('enderecos', v)} onRemove={(i) => handleRemoveLink('enderecos', i)} />
            )}
            {activeModal === 'produtos' && selectedSector && (
                <LinkingModal title="Produtos" icon={Package} items={selectedSector.produtos || []} onClose={() => setActiveModal(null)} onAdd={(v) => handleAddLink('produtos', v)} onRemove={(i) => handleRemoveLink('produtos', i)} />
            )}
            {activeModal === 'usuarios' && selectedSector && (
                <LinkingModal title="Usuários" icon={Users} items={selectedSector.usuarios || []} onClose={() => setActiveModal(null)} onAdd={(v) => handleAddLink('usuarios', v)} onRemove={(i) => handleRemoveLink('usuarios', i)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">7.7 Configurar Setores</h1>
                    <p className="text-sm text-slate-500 font-medium">Configure setores, tipos e vinculações do armazém</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {sectors.length} setores</span>
                </div>
            </div>

            {/* TOP: Form + DataGrid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* FORM */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center"><Layers className="w-4 h-4 text-primary" /></div>
                            <h2 className="text-base font-black italic">{isEditing ? 'Alterar Setor' : 'Novo Setor'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="form-id-setor" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Id Setor</label>
                                <input id="form-id-setor" type="text" value={formData.id} disabled placeholder="Auto" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="form-setor-nome" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Setor</label>
                                <input id="form-setor-nome" required type="text" value={formData.setor} onChange={e => setFormData({ ...formData, setor: e.target.value.toUpperCase() })} placeholder="Ex: PEÇAS AUTOMOTIVAS" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label htmlFor="form-tipo-setor" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Setor</label>
                                    <select id="form-tipo-setor" value={formData.tipoSetor} onChange={e => setFormData({ ...formData, tipoSetor: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                        {tipoSetorOptions.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="form-tipo-local" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo do Local</label>
                                    <select id="form-tipo-local" value={formData.tipoLocal} onChange={e => setFormData({ ...formData, tipoLocal: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                        {tipoLocalOptions.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="form-cod-integracao" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Integração</label>
                                <input id="form-cod-integracao" type="text" value={formData.codigoIntegracao} onChange={e => setFormData({ ...formData, codigoIntegracao: e.target.value.toUpperCase() })} placeholder="Ex: INT-001" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.usoExclusivoCaixa}
                                    aria-label={formData.usoExclusivoCaixa ? 'Desativar uso exclusivo caixa de movimentação' : 'Ativar uso exclusivo caixa de movimentação'}
                                    onClick={() => setFormData({ ...formData, usoExclusivoCaixa: !formData.usoExclusivoCaixa })}
                                >
                                    {formData.usoExclusivoCaixa
                                        ? <ToggleRight className="w-7 h-7 text-warning" aria-hidden="true" />
                                        : <ToggleLeft className="w-7 h-7 text-slate-400" aria-hidden="true" />}
                                </button>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${formData.usoExclusivoCaixa ? 'text-warning' : 'text-slate-400'}`}>Uso Exclusivo Caixa de Movimentação</span>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-2 pt-2">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={handleClear} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                                            <button type="submit" className="py-3 bg-warning text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning/90 transition-all shadow-lg shadow-warning/20 flex items-center justify-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button type="button" onClick={handleDelete} className="py-2.5 bg-danger/10 text-danger font-black rounded-xl text-[9px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Excluir</button>
                                            {selectedSector?.ativo ? (
                                                <button type="button" onClick={requestDeactivate} className="py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-[9px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-slate-200 flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Desativar</button>
                                            ) : (
                                                <button type="button" onClick={requestActivate} className="py-2.5 bg-success/10 text-success font-black rounded-xl text-[9px] tracking-widest uppercase hover:bg-success hover:text-white transition-all border border-success/20 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ativar</button>
                                            )}
                                            <button type="button" onClick={() => { setSupervisorMessage('Alteração de parâmetros exclusivos requer autorização.'); setSupervisorAction(null); setShowSupervisor(true); }} className="py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-[9px] tracking-widest uppercase hover:bg-secondary hover:text-primary transition-all border border-slate-200 flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Parâm.</button>
                                        </div>
                                    </>
                                ) : (
                                    <button type="submit" className="w-full py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Cadastrar</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* DATAGRID */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
                        {/* Search + Filter */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative flex-1 min-w-[200px] max-w-xs">
                                <input type="text" placeholder="Procurar setor..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pr-9 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exibir:</span>
                                {['Todos', 'Ativado', 'Desativado'].map(s => (
                                    <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-secondary text-primary shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-secondary'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th scope="col" className="px-4 py-4 w-12">ID</th>
                                        <th scope="col" className="px-4 py-4">Setor</th>
                                        <th scope="col" className="px-4 py-4">Tipo Setor</th>
                                        <th scope="col" className="px-4 py-4">Tipo Local</th>
                                        <th scope="col" className="px-4 py-4">Cód. Integração</th>
                                        <th scope="col" className="px-4 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginated.length > 0 ? paginated.map(s => (
                                        <tr key={s.id} onClick={() => handleSelect(s)} className={`cursor-pointer transition-all duration-200 ${selectedId === s.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                            <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{s.id}</td>
                                            <td className="px-4 py-3.5 font-black text-xs uppercase tracking-tight">{s.setor}</td>
                                            <td className="px-4 py-3.5 text-xs font-bold text-slate-500">{s.tipoSetor}</td>
                                            <td className="px-4 py-3.5 text-xs font-bold text-slate-500">{s.tipoLocal}</td>
                                            <td className="px-4 py-3.5"><span className="font-mono text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">{s.codigoIntegracao || '-'}</span></td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.ativo ? 'bg-success/10 text-success border border-success/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                    {s.ativo ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                                    {s.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhum setor encontrado</span></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    aria-label="Página anterior"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-secondary'}`}>{i + 1}</button>
                                ))}
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    aria-label="Próxima página"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LINKING BUTTONS (visible when sector selected) */}
            {selectedId && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vinculações do Setor</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { key: 'depositantes', label: 'Depositantes', icon: Building2, count: selectedSector?.depositantes?.length || 0 },
                            { key: 'enderecos', label: 'Endereços', icon: MapPin, count: selectedSector?.enderecos?.length || 0 },
                            { key: 'produtos', label: 'Produtos', icon: Package, count: selectedSector?.produtos?.length || 0 },
                            { key: 'usuarios', label: 'Usuários', icon: Users, count: selectedSector?.usuarios?.length || 0 },
                        ].map(link => (
                            <button key={link.key} onClick={() => setActiveModal(link.key)} className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:shadow-lg transition-all">
                                    <link.icon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest">{link.label}</p>
                                    <p className="text-lg font-black text-secondary mt-1">{link.count}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
