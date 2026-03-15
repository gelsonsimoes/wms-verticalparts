import React, { useState, useMemo, useEffect, useId, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    Shield, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight,
    CheckSquare, Square, Smartphone, Monitor, Globe, Warehouse, Activity,
    Users, X, Save
} from 'lucide-react';

// ========== MODAL DE SELEÇÃO MÚLTIPLA ==========
function MultiSelectModal({ title, icon: Icon, allOptions, selected, onSave, onClose }) {
    const [current, setCurrent] = useState([...selected]);
    const modalId = useId();
    const closeBtnRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        closeBtnRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const toggle = (item) => {
        setCurrent(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby={`${modalId}-title`}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[75vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 id={`${modalId}-title`} className="text-base font-black">{title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{current.length} selecionados</p>
                        </div>
                    </div>
                    <button 
                        ref={closeBtnRef}
                        onClick={onClose} 
                        aria-label="Fechar modal"
                        className="p-2 text-slate-400 hover:text-danger transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-1.5">
                    {allOptions.map(opt => (
                        <button 
                            key={opt} 
                            role="checkbox"
                            aria-checked={current.includes(opt)}
                            onClick={() => toggle(opt)} 
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all focus:ring-2 focus:ring-primary outline-none ${current.includes(opt) ? 'bg-primary/10 border-2 border-primary' : 'bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-slate-200'}`}
                        >
                            {current.includes(opt) ? (
                                <CheckSquare className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                            ) : (
                                <Square className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                            )}
                            <span className="text-xs font-bold uppercase">{opt}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={() => onSave(current)} className="flex-1 py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" aria-hidden="true" /> Salvar</button>
                </div>
            </div>
        </div>
    );
}

// ========== OPÇÕES DE MENUS ==========
const COLETOR_OPTIONS = ['Recebimento', 'Separação', 'Inventário', 'Expedição', 'Transferência', 'Conferência', 'Ressuprimento'];
const ENTERPRISE_OPTIONS = ['Dashboard', 'Cadastros', 'Relatórios', 'Segurança', 'Configurações', 'Integração', 'Financeiro'];
const WEB_OPTIONS = ['WMS Web Completo', 'WMS Web Básico', 'WMS Web Consulta', 'WMS Web Relatórios'];
const DEPOSITO_OPTIONS = ['Entrada', 'Saída', 'Transferência', 'Ajuste', 'Bloqueio', 'Desbloqueio'];
const ATIVIDADE_OPTIONS = ['Separação da Onda', 'Conferência', 'Expedição', 'Auditoria', 'Recontagem', 'Endereçamento', 'Cross-docking'];

// ========== COMPONENTE PRINCIPAL ==========
export default function UserGroups() {
    const { userGroups, userGroupsCrud, users } = useApp();

    const [formData, setFormData] = useState({ id: '', grupo: '', ativaExportacoes: false, permitirDownload: false });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeModal, setActiveModal] = useState(null);
    const itemsPerPage = 6;

    const selectedGroup = userGroups.find(g => g.id === selectedId);

    // === Filtro e Paginação ===
    const filtered = useMemo(() => userGroups.filter(g =>
        g.grupo.toLowerCase().includes(searchTerm.toLowerCase()) || g.id.toString().includes(searchTerm)
    ), [userGroups, searchTerm]);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);

    // === Handlers ===
    const handleSelect = (g) => {
        setSelectedId(g.id);
        setFormData({ id: g.id, grupo: g.grupo, ativaExportacoes: g.ativaExportacoes, permitirDownload: g.permitirDownload });
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.grupo.trim()) return;
        if (isEditing) {
            userGroupsCrud.update(formData.id, { grupo: formData.grupo, ativaExportacoes: formData.ativaExportacoes, permitirDownload: formData.permitirDownload });
        } else {
            userGroupsCrud.add({ grupo: formData.grupo, ativaExportacoes: formData.ativaExportacoes, permitirDownload: formData.permitirDownload, coletor: [], enterprise: [], web: [], operacaoDeposito: [], atividades: [], usuarios: [] });
        }
        handleClear();
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('Deseja realmente excluir este grupo?')) { userGroupsCrud.remove(selectedId); handleClear(); }
    };

    const handleClear = () => {
        setFormData({ id: '', grupo: '', ativaExportacoes: false, permitirDownload: false });
        setIsEditing(false);
        setSelectedId(null);
    };

    const handleSavePermissions = (field, values) => {
        if (!selectedId) return;
        userGroupsCrud.update(selectedId, { [field]: values });
        setActiveModal(null);
    };

    const handleSaveUsers = (values) => {
        if (!selectedId) return;
        userGroupsCrud.update(selectedId, { usuarios: values });
        setActiveModal(null);
    };

    // === Botões de Permissão ===
    const permissionButtons = [
        { key: 'coletor', label: 'Coletor', icon: Smartphone, options: COLETOR_OPTIONS, color: 'bg-blue-500' },
        { key: 'enterprise', label: 'Enterprise', icon: Monitor, options: ENTERPRISE_OPTIONS, color: 'bg-purple-500' },
        { key: 'web', label: 'Web', icon: Globe, options: WEB_OPTIONS, color: 'bg-green-500' },
        { key: 'operacaoDeposito', label: 'Oper. Depósito', icon: Warehouse, options: DEPOSITO_OPTIONS, color: 'bg-orange-500' },
        { key: 'atividades', label: 'Atividade', icon: Activity, options: ATIVIDADE_OPTIONS, color: 'bg-red-500' },
        { key: 'usuarios', label: 'Usuário', icon: Users, options: users.map(u => u.usuario), color: 'bg-secondary' },
    ];

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modais */}
            {activeModal && selectedGroup && activeModal !== 'usuarios' && (
                <MultiSelectModal
                    title={permissionButtons.find(p => p.key === activeModal)?.label}
                    icon={permissionButtons.find(p => p.key === activeModal)?.icon}
                    allOptions={permissionButtons.find(p => p.key === activeModal)?.options || []}
                    selected={selectedGroup[activeModal] || []}
                    onSave={(vals) => handleSavePermissions(activeModal, vals)}
                    onClose={() => setActiveModal(null)}
                />
            )}
            {activeModal === 'usuarios' && selectedGroup && (
                <MultiSelectModal
                    title="Vincular Usuários"
                    icon={Users}
                    allOptions={users.map(u => u.usuario)}
                    selected={selectedGroup.usuarios || []}
                    onSave={handleSaveUsers}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">11.2 Definir Grupos de Acesso — Grupo de Usuário</h1>
                    <p className="text-sm text-slate-500 font-medium">Configure grupos de acesso e permissões do WMS</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {userGroups.length} grupos</span>
                </div>
            </div>

            {/* FORM + DATAGRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* FORMULÁRIO */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center"><Shield className="w-4 h-4 text-primary" aria-hidden="true" /></div>
                            <h2 className="text-base font-black italic">{isEditing ? 'Alterar Grupo' : 'Novo Grupo'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="id-grupo" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Id Grupo</label>
                                <input id="id-grupo" type="text" value={formData.id} disabled placeholder="Auto" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="nome-grupo" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Grupo</label>
                                <input id="nome-grupo" required type="text" value={formData.grupo} onChange={e => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })} placeholder="Ex: ADMINISTRADORES" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-2">
                                <button 
                                    type="button" 
                                    role="checkbox"
                                    aria-checked={formData.ativaExportacoes}
                                    onClick={() => setFormData({ ...formData, ativaExportacoes: !formData.ativaExportacoes })} 
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 outline-none focus:ring-2 focus:ring-primary ${formData.ativaExportacoes ? 'bg-primary/10 border-primary' : 'bg-slate-50 dark:bg-slate-900 border-transparent'}`}
                                >
                                    {formData.ativaExportacoes ? (
                                        <CheckSquare className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                                    )}
                                    <span className="text-[9px] font-black uppercase tracking-widest">Ativa exportações através das abas</span>
                                </button>
                                <button 
                                    type="button" 
                                    role="checkbox"
                                    aria-checked={formData.permitirDownload}
                                    onClick={() => setFormData({ ...formData, permitirDownload: !formData.permitirDownload })} 
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 outline-none focus:ring-2 focus:ring-primary ${formData.permitirDownload ? 'bg-primary/10 border-primary' : 'bg-slate-50 dark:bg-slate-900 border-transparent'}`}
                                >
                                    {formData.permitirDownload ? (
                                        <CheckSquare className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                                    )}
                                    <span className="text-[9px] font-black uppercase tracking-widest">Permitir Download de Arquivos</span>
                                </button>
                            </div>

                            {/* Botões de ação */}
                            <div className="space-y-2 pt-2">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={handleClear} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                                            <button type="submit" aria-label="Alterar grupo" className="py-3 bg-warning text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning/90 transition-all shadow-lg shadow-warning/20 flex items-center justify-center gap-1.5"><Edit2 className="w-3.5 h-3.5" aria-hidden="true" /> Alterar</button>
                                        </div>
                                        <button type="button" onClick={handleDelete} aria-label="Excluir grupo" className="w-full py-2.5 bg-danger/10 text-danger font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Excluir</button>
                                    </>
                                ) : (
                                    <button type="submit" aria-label="Cadastrar novo grupo" className="w-full py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" aria-hidden="true" /> Cadastrar</button>
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
                                <label htmlFor="search-groups" className="sr-only">Pesquisar grupos</label>
                                <input 
                                    id="search-groups" 
                                    type="text" 
                                    placeholder="Procurar grupo..." 
                                    value={searchTerm} 
                                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" 
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th scope="col" className="px-4 py-4 w-12">ID</th>
                                        <th scope="col" className="px-4 py-4">Grupo</th>
                                        <th scope="col" className="px-4 py-4 text-center">Exportações</th>
                                        <th scope="col" className="px-4 py-4 text-center">Download</th>
                                        <th scope="col" className="px-4 py-4 text-center">Usuários</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginated.length > 0 ? paginated.map(g => (
                                        <tr key={g.id} onClick={() => handleSelect(g)} className={`cursor-pointer transition-all duration-200 ${selectedId === g.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                            <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{g.id}</td>
                                            <td className="px-4 py-3.5 font-black text-xs uppercase tracking-tight">{g.grupo}</td>
                                            <td className="px-4 py-3.5 text-center">
                                                {g.ativaExportacoes ? (
                                                    <CheckSquare className="w-4 h-4 text-success mx-auto" aria-hidden="true" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-300 mx-auto" aria-hidden="true" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                {g.permitirDownload ? (
                                                    <CheckSquare className="w-4 h-4 text-success mx-auto" aria-hidden="true" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-300 mx-auto" aria-hidden="true" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center"><span className="inline-flex items-center justify-center w-6 h-6 bg-secondary/10 text-secondary rounded-full text-[10px] font-black">{g.usuarios?.length || 0}</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhum grupo</span></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(p => p - 1)} 
                                    aria-label="Página anterior"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all outline-none focus:ring-2 focus:ring-secondary"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        aria-label={`Página ${i + 1}`}
                                        className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all outline-none focus:ring-2 focus:ring-secondary ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-secondary'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    disabled={currentPage >= totalPages} 
                                    onClick={() => setCurrentPage(p => p + 1)} 
                                    aria-label="Próxima página"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all outline-none focus:ring-2 focus:ring-secondary"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAINEL DE PERMISSÕES (visível ao selecionar grupo) */}
            {selectedId && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Permissões e Vinculações do Grupo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {permissionButtons.map(perm => (
                            <button 
                                key={perm.key} 
                                onClick={() => setActiveModal(perm.key)} 
                                aria-label={`Gerenciar permissões de ${perm.label}`}
                                className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary group"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${perm.color} shadow-lg transition-all`}>
                                    <perm.icon className="w-5 h-5 text-white" aria-hidden="true" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest">{perm.label}</p>
                                    <p className="text-base font-black text-secondary mt-1">{(selectedGroup?.[perm.key] || []).length}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
