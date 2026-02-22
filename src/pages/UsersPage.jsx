import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    User, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight,
    Printer, X, Building2, Shield, Users
} from 'lucide-react';

// ========== MODAL DE VINCULAÇÃO ==========
function LinkModal({ title, icon: Icon, items, onClose, onAdd, onRemove }) {
    const [newVal, setNewVal] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                        <h3 className="text-base font-black">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                        <input type="text" value={newVal} onChange={e => setNewVal(e.target.value.toUpperCase())} placeholder={`Adicionar ${title.toLowerCase()}...`} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all" />
                        <button onClick={() => { if (newVal.trim()) { onAdd(newVal); setNewVal(''); } }} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {items.length > 0 ? (
                        <div className="space-y-2">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                    <span className="text-xs font-bold uppercase">{typeof item === 'object' ? `${item.cnpj} — ${item.razaoSocial}` : item}</span>
                                    <button onClick={() => onRemove(i)} className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center opacity-30"><p className="text-xs font-black uppercase tracking-widest">Nenhum vínculo</p></div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{items.length} registros vinculados</p>
                </div>
            </div>
        </div>
    );
}

// ========== MODAL IMPRESSÃO CRACHÁ ==========
function BadgeModal({ user, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Printer className="w-5 h-5 text-primary" /></div>
                        <h3 className="text-base font-black">Crachá 50×80mm</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* Preview do Crachá */}
                <div className="p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="bg-white border-2 border-secondary rounded-2xl shadow-xl overflow-hidden" style={{ width: '302px', height: '189px' }}>
                        <div className="bg-secondary h-12 flex items-center justify-center">
                            <span className="text-primary font-black text-sm tracking-widest">VERTICALPARTS</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center h-[calc(100%-48px)]">
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                <User className="w-7 h-7 text-slate-400" />
                            </div>
                            <p className="text-sm font-black uppercase text-center">{user?.nomeUsuario}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.departamento} • {user?.nivel}</p>
                            <div className="mt-2 px-3 py-1 bg-primary/20 rounded-full">
                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">ID: {user?.id} | {user?.usuario}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Fechar</button>
                    <button onClick={() => window.print()} className="flex-1 py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
                </div>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function UsersPage() {
    const { users, usersCrud, userGroups } = useApp();

    const nivelOptions = ['Administrador', 'Supervisor', 'Operador', 'Consulta'];
    const [formData, setFormData] = useState({ id: '', usuario: '', nomeUsuario: '', nivel: 'Operador', departamento: '', entidade: 'VerticalParts Matriz' });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeModal, setActiveModal] = useState(null);
    const [showBadge, setShowBadge] = useState(false);
    const itemsPerPage = 8;

    const selectedUser = users.find(u => u.id === selectedId);

    // === Filtro e Paginação ===
    const filtered = useMemo(() => users.filter(u =>
        u.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nomeUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toString().includes(searchTerm)
    ), [users, searchTerm]);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);

    // === Handlers ===
    const handleSelect = (u) => {
        setSelectedId(u.id);
        setFormData({ id: u.id, usuario: u.usuario, nomeUsuario: u.nomeUsuario, nivel: u.nivel, departamento: u.departamento, entidade: u.entidade || 'VerticalParts Matriz' });
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.usuario.trim() || !formData.nomeUsuario.trim()) return;
        if (isEditing) {
            usersCrud.update(formData.id, { usuario: formData.usuario, nomeUsuario: formData.nomeUsuario, nivel: formData.nivel, departamento: formData.departamento, entidade: formData.entidade });
        } else {
            usersCrud.add({ usuario: formData.usuario, nomeUsuario: formData.nomeUsuario, nivel: formData.nivel, departamento: formData.departamento, entidade: formData.entidade, grupos: [], depositantes: [] });
        }
        handleClear();
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('Deseja realmente excluir este usuário?')) { usersCrud.remove(selectedId); handleClear(); }
    };

    const handleClear = () => {
        setFormData({ id: '', usuario: '', nomeUsuario: '', nivel: 'Operador', departamento: '', entidade: 'VerticalParts Matriz' });
        setIsEditing(false);
        setSelectedId(null);
    };

    const handleAddLink = (field, value) => {
        if (!selectedId) return;
        const user = users.find(u => u.id === selectedId);
        if (!user) return;
        const arr = [...(user[field] || [])];
        if (field === 'depositantes') arr.push({ cnpj: value, razaoSocial: value });
        else arr.push(value);
        usersCrud.update(selectedId, { [field]: arr });
    };

    const handleRemoveLink = (field, index) => {
        if (!selectedId) return;
        const user = users.find(u => u.id === selectedId);
        if (!user) return;
        const arr = [...(user[field] || [])];
        arr.splice(index, 1);
        usersCrud.update(selectedId, { [field]: arr });
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modais */}
            {activeModal === 'grupos' && selectedUser && (
                <LinkModal title="Grupo de Usuários" icon={Shield} items={selectedUser.grupos || []} onClose={() => setActiveModal(null)} onAdd={v => handleAddLink('grupos', v)} onRemove={i => handleRemoveLink('grupos', i)} />
            )}
            {activeModal === 'depositantes' && selectedUser && (
                <LinkModal title="Depositantes" icon={Building2} items={selectedUser.depositantes || []} onClose={() => setActiveModal(null)} onAdd={v => handleAddLink('depositantes', v)} onRemove={i => handleRemoveLink('depositantes', i)} />
            )}
            {showBadge && selectedUser && <BadgeModal user={selectedUser} onClose={() => setShowBadge(false)} />}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Gestão de Usuários</h1>
                    <p className="text-sm text-slate-500 font-medium">Cadastre e gerencie os usuários do WMS VerticalParts</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {users.length} usuários</span>
                </div>
            </div>

            {/* FORM + DATAGRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* FORMULÁRIO */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                            <h2 className="text-base font-black italic">{isEditing ? 'Alterar Usuário' : 'Novo Usuário'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Id Usuário</label>
                                <input type="text" value={formData.id} disabled placeholder="Auto" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário (Login)</label>
                                <input required type="text" value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value.toLowerCase() })} placeholder="Ex: joao.silva" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Usuário</label>
                                <input required type="text" value={formData.nomeUsuario} onChange={e => setFormData({ ...formData, nomeUsuario: e.target.value })} placeholder="Ex: Danilo" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível</label>
                                    <select value={formData.nivel} onChange={e => setFormData({ ...formData, nivel: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                        {nivelOptions.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                                    <input type="text" value={formData.departamento} onChange={e => setFormData({ ...formData, departamento: e.target.value })} placeholder="Ex: Logística" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entidade</label>
                                <input type="text" value={formData.entidade} onChange={e => setFormData({ ...formData, entidade: e.target.value })} placeholder="VerticalParts Matriz" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>

                            {/* Botões */}
                            <div className="space-y-2 pt-2">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={handleClear} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                                            <button type="submit" className="py-3 bg-warning text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning/90 transition-all shadow-lg shadow-warning/20 flex items-center justify-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={handleDelete} className="py-2.5 bg-danger/10 text-danger font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                                            <button type="button" onClick={() => setShowBadge(true)} className="py-2.5 bg-secondary/10 text-secondary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary hover:text-primary transition-all border border-secondary/20 flex items-center justify-center gap-1.5"><Printer className="w-3.5 h-3.5" /> Impressos</button>
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
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative max-w-xs">
                                <input type="text" placeholder="Procurar usuário..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 w-12">ID</th>
                                        <th className="px-4 py-4">Usuário</th>
                                        <th className="px-4 py-4">Nome</th>
                                        <th className="px-4 py-4">Nível</th>
                                        <th className="px-4 py-4">Depto</th>
                                        <th className="px-4 py-4">Entidade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginated.length > 0 ? paginated.map(u => (
                                        <tr key={u.id} onClick={() => handleSelect(u)} className={`cursor-pointer transition-all duration-200 ${selectedId === u.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                            <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{u.id}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs font-bold">{u.usuario}</td>
                                            <td className="px-4 py-3.5 font-black text-xs uppercase tracking-tight">{u.nomeUsuario}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.nivel === 'Administrador' ? 'bg-danger/10 text-danger border border-danger/20' : u.nivel === 'Supervisor' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{u.nivel}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs font-bold text-slate-500">{u.departamento}</td>
                                            <td className="px-4 py-3.5 text-xs text-slate-500">{u.entidade}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhum usuário</span></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
                            <div className="flex items-center gap-1.5">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-secondary'}`}>{i + 1}</button>
                                ))}
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VINCULAÇÕES (visível ao selecionar usuário) */}
            {selectedId && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vinculações do Usuário</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setActiveModal('grupos')} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all"><Shield className="w-6 h-6 text-primary" /></div>
                            <div className="text-left flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest">Grupo de Usuários</p>
                                <p className="text-xs text-slate-500 mt-0.5">Vincula o usuário aos grupos de permissão</p>
                                <p className="text-lg font-black text-secondary mt-1">{selectedUser?.grupos?.length || 0} <span className="text-[9px] text-slate-400">grupos vinculados</span></p>
                            </div>
                        </button>

                        <button onClick={() => setActiveModal('depositantes')} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all"><Building2 className="w-6 h-6 text-primary" /></div>
                            <div className="text-left flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest">Depositante</p>
                                <p className="text-xs text-slate-500 mt-0.5">Restringe visão às notas dos depositantes vinculados</p>
                                <p className="text-lg font-black text-secondary mt-1">{selectedUser?.depositantes?.length || 0} <span className="text-[9px] text-slate-400">depositantes vinculados</span></p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
