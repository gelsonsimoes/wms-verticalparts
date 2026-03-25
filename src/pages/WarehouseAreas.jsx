import React, { useState, useMemo, useId, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    MapPin,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';

export default function WarehouseAreas() {
    const { warehouseAreas, addWarehouseArea, updateWarehouseArea, deleteWarehouseArea } = useApp();

    // Form State
    const [formData, setFormData] = useState({ id: '', name: '', rua: '', portaPalete: '', nivel: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const itemsPerPage = 8;
    const fieldId = useId();

    // Toast System
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const showToast = (message, type = 'success') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ message, type });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    };

    // Build endereco from parts
    const buildEndereco = (rua, portaPalete, nivel) => {
        if (!rua && !portaPalete && !nivel) return '';
        return `${rua || ''}_${portaPalete || ''}_${nivel || ''}`.toUpperCase();
    };

    // Parse endereco into parts
    const parseEndereco = (endereco) => {
        if (!endereco) return { rua: '', portaPalete: '', nivel: '' };
        const parts = endereco.split('_');
        return {
            rua: parts[0] || '',
            portaPalete: parts[1] || '',
            nivel: parts[2] || ''
        };
    };

    // Filtered data — proteção contra null/undefined em todos os campos
    const filteredAreas = useMemo(() => {
        const safeSearch = String(searchTerm || '').toLowerCase();
        return warehouseAreas.filter(area =>
            String(area?.name || '').toLowerCase().includes(safeSearch) ||
            String(area?.id || '').toLowerCase().includes(safeSearch) ||
            String(area?.endereco || '').toLowerCase().includes(safeSearch)
        );
    }, [warehouseAreas, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    const paginatedAreas = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAreas.slice(start, start + itemsPerPage);
    }, [filteredAreas, currentPage]);

    const handleSelect = (area) => {
        setSelectedId(area.id);
        const parts = parseEndereco(area.endereco);
        setFormData({ id: area.id, name: area.name, rua: parts.rua, portaPalete: parts.portaPalete, nivel: parts.nivel });
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const endereco = buildEndereco(formData.rua, formData.portaPalete, formData.nivel);

        if (isEditing) {
            updateWarehouseArea(formData.id, { name: formData.name, endereco });
            setIsEditing(false);
            showToast('Área atualizada com sucesso!', 'success');
        } else {
            addWarehouseArea({ name: formData.name, endereco });
            showToast('Nova área cadastrada com sucesso!', 'success');
        }

        setFormData({ id: '', name: '', rua: '', portaPalete: '', nivel: '' });
        setSelectedId(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Deseja realmente excluir esta área?')) {
            deleteWarehouseArea(id);
            showToast('Área excluída com sucesso!', 'info');
            if (selectedId === id) {
                setFormData({ id: '', name: '', rua: '', portaPalete: '', nivel: '' });
                setIsEditing(false);
                setSelectedId(null);
            }
        }
    };

    const handleClear = () => {
        setFormData({ id: '', name: '', rua: '', portaPalete: '', nivel: '' });
        setIsEditing(false);
        setSelectedId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">7.6 Cadastro de Área</h1>
                    <p className="text-sm text-slate-500 font-medium">Gerencie o agrupamento de setores e endereçamento no Armazém VerticalParts</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total de Áreas: {warehouseAreas.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                                <Layers className="w-5 h-5 text-primary" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg font-black italic">{isEditing ? 'Alterar Área' : 'Nova Área'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Id Área */}
                            <div className="space-y-2">
                                <label htmlFor={`${fieldId}-id`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Id Área</label>
                                <input
                                    id={`${fieldId}-id`}
                                    type="text"
                                    value={formData.id}
                                    disabled
                                    placeholder="Auto-gerado"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 font-bold text-slate-400 cursor-not-allowed outline-none"
                                />
                            </div>

                            {/* Área do Armazém */}
                            <div className="space-y-2">
                                <label htmlFor={`${fieldId}-name`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área do Armazém</label>
                                <input
                                    id={`${fieldId}-name`}
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    placeholder="Ex: RECEBIMENTO..."
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3.5 px-5 font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            {/* Endereço Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 ml-1">
                                    <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço (Rua_PortaPalete_Nível)</label>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    {/* Rua */}
                                    <div className="space-y-1">
                                        <label htmlFor={`${fieldId}-rua`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua</label>
                                        <input
                                            id={`${fieldId}-rua`}
                                            type="text"
                                            value={formData.rua}
                                            onChange={(e) => setFormData({ ...formData, rua: e.target.value.toUpperCase() })}
                                            placeholder="Ex: R1"
                                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    {/* Porta Palete */}
                                    <div className="space-y-1">
                                        <label htmlFor={`${fieldId}-pp`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Porta Palete</label>
                                        <input
                                            id={`${fieldId}-pp`}
                                            type="text"
                                            value={formData.portaPalete}
                                            onChange={(e) => setFormData({ ...formData, portaPalete: e.target.value.toUpperCase() })}
                                            placeholder="Ex: PP1"
                                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    {/* Nível */}
                                    <div className="space-y-1">
                                        <label htmlFor={`${fieldId}-nivel`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível</label>
                                        <input
                                            id={`${fieldId}-nivel`}
                                            type="text"
                                            value={formData.nivel}
                                            onChange={(e) => setFormData({ ...formData, nivel: e.target.value.toUpperCase() })}
                                            placeholder="Ex: N001"
                                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    {/* Preview do endereço */}
                                    {(formData.rua || formData.portaPalete || formData.nivel) && (
                                        <div className="bg-secondary text-primary px-4 py-2.5 rounded-xl text-center">
                                            <span className="text-[9px] font-black uppercase tracking-widest block opacity-60 mb-0.5">Endereço formatado</span>
                                            <span className="font-black text-sm tracking-wider">
                                                {buildEndereco(formData.rua, formData.portaPalete, formData.nivel)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-2">
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 font-black rounded-2xl text-xs tracking-widest uppercase hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="py-4 bg-warning text-white font-black rounded-2xl text-xs tracking-widest uppercase hover:bg-warning/90 transition-all shadow-lg shadow-warning/20 flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" aria-hidden="true" /> Alterar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-secondary text-primary font-black rounded-2xl text-xs tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" aria-hidden="true" /> Cadastrar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* DataGrid Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative w-full sm:w-64">
                                <label htmlFor={`${fieldId}-search`} className="sr-only">Pesquisar áreas</label>
                                <input
                                    id={`${fieldId}-search`}
                                    type="text"
                                    placeholder="Procurar área ou endereço..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Filtro removido pois não possui funcionalidade implementada */}
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white dark:bg-slate-800 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th scope="col" className="px-6 py-5 w-20 text-center">idArea</th>
                                        <th scope="col" className="px-6 py-5">Área do Armazém</th>
                                        <th scope="col" className="px-6 py-5">Endereço</th>
                                        <th scope="col" className="px-6 py-5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedAreas.length > 0 ? (
                                        paginatedAreas.map((area) => (
                                            <tr
                                                key={area.id}
                                                onClick={() => handleSelect(area)}
                                                className={`group cursor-pointer transition-all duration-300 ${selectedId === area.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                            >
                                                <td className="px-6 py-5 font-mono text-sm font-black text-secondary">
                                                    #{area.id}
                                                </td>
                                                <td className="px-6 py-5 font-black text-sm tracking-tight text-slate-700 dark:text-slate-200 uppercase">
                                                    {area.name}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {area.endereco ? (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                                                            <span className="font-mono text-xs font-black bg-secondary/5 text-secondary px-3 py-1.5 rounded-lg border border-secondary/10 tracking-wider">
                                                                {area.endereco}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-300 italic">Sem endereço</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSelect(area); }}
                                                            aria-label={`Editar área ${area.name}`}
                                                            className="p-2.5 bg-warning/10 text-warning hover:bg-warning hover:text-white rounded-xl transition-all border border-warning/20 shadow-sm"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }}
                                                            aria-label={`Excluir área ${area.name}`}
                                                            className="p-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all border border-danger/20 shadow-sm"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center opacity-30">
                                                <div className="flex flex-col items-center gap-4">
                                                    <LayoutGrid className="w-12 h-12" aria-hidden="true" />
                                                    <p className="text-sm font-black uppercase tracking-widest">Nenhuma área encontrada</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Mostrando {paginatedAreas.length} de {filteredAreas.length} registros
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    aria-label="Página anterior"
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-secondary hover:text-primary hover:border-secondary active:scale-90"
                                >
                                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        aria-label={`Página ${i + 1}`}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all active:scale-90 ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg shadow-black/10' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-secondary hover:text-secondary'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    aria-label="Próxima página"
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-secondary hover:text-primary hover:border-secondary active:scale-90"
                                >
                                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300"
                    role="status"
                >
                    <div className={`
                        flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4
                        ${toast.type === 'success' ? 'bg-green-500 border-green-700' :
                          toast.type === 'error'   ? 'bg-red-500 border-red-700' :
                          'bg-blue-600 border-blue-800'}
                        text-white
                    `}>
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notificação</p>
                            <p className="text-sm font-bold">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
