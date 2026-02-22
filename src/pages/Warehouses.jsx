import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    Warehouse, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Settings,
    Truck, MapPin, Grid3X3, Layers, Box, Wrench, Package, Printer,
    ToggleLeft, ToggleRight, Filter, CheckCircle2, XCircle, AlertCircle, Zap
} from 'lucide-react';

// ========== MAIN COMPONENT ==========
export default function Warehouses() {
    const {
        warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
        warehouseDocks, docksCrud,
        warehouseLocations, locationsCrud, generateLocations,
        warehouseColmeias, colmeiasCrud,
        warehouseBancadas, bancadasCrud,
        warehouseBuffers, buffersCrud,
        warehouseServicos, servicosCrud,
        warehousePacking, packingCrud,
    } = useApp();

    // === Main state ===
    const [formData, setFormData] = useState({ id: '', codigoInterno: '', nome: '', entidade: '', ativo: true });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState(null);
    const [showConfig, setShowConfig] = useState(false);
    const itemsPerPage = 5;

    // === Filtered & paginated ===
    const filtered = useMemo(() => warehouses.filter(w =>
        w.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toString().includes(searchTerm)
    ), [warehouses, searchTerm]);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = useMemo(() => {
        const s = (currentPage - 1) * itemsPerPage;
        return filtered.slice(s, s + itemsPerPage);
    }, [filtered, currentPage]);

    // === CRUD Handlers ===
    const handleSelect = (wh) => {
        setSelectedId(wh.id);
        setFormData({ id: wh.id, codigoInterno: wh.codigoInterno || '', nome: wh.nome || wh.name || '', entidade: wh.entidade || '', ativo: wh.ativo !== false });
        setIsEditing(true);
        if (!activeTab) setActiveTab('doca');
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.nome.trim()) return;
        if (isEditing) {
            updateWarehouse(formData.id, { codigoInterno: formData.codigoInterno, nome: formData.nome, entidade: formData.entidade, ativo: formData.ativo });
            setIsEditing(false);
        } else {
            addWarehouse({ codigoInterno: formData.codigoInterno, nome: formData.nome, entidade: formData.entidade, ativo: formData.ativo, addresses: 0, occupation: 0 });
        }
        handleClear();
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('Deseja realmente excluir este armazém?')) {
            deleteWarehouse(selectedId);
            handleClear();
        }
    };

    const handleClear = () => {
        setFormData({ id: '', codigoInterno: '', nome: '', entidade: '', ativo: true });
        setIsEditing(false);
        setSelectedId(null);
    };

    // === Tab definitions ===
    const tabs = [
        { key: 'doca', label: 'Doca / Rua Expedição', icon: Truck },
        { key: 'armazenagem', label: 'Locais de Armazenagem', icon: MapPin },
        { key: 'colmeia', label: 'Colmeia', icon: Grid3X3 },
        { key: 'bancada', label: 'Bancada', icon: Layers },
        { key: 'buffer', label: 'Buffer', icon: Box },
        { key: 'servico', label: 'Serviço', icon: Wrench },
        { key: 'packing', label: 'Packing', icon: Package },
    ];

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Cadastro de Armazém</h1>
                    <p className="text-sm text-slate-500 font-medium">Gerencie armazéns e seus componentes logísticos</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {warehouses.length} armazéns</span>
                </div>
            </div>

            {/* ========= TOP SECTION: Form + DataGrid ========= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* FORM */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
                                <Warehouse className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="text-base font-black italic">{isEditing ? 'Alterar Armazém' : 'Novo Armazém'}</h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Id Armazém</label>
                                <input type="text" value={formData.id} disabled placeholder="Auto" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Interno</label>
                                <input required type="text" value={formData.codigoInterno} onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value.toUpperCase() })} placeholder="Ex: CD01" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Armazém</label>
                                <input required type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value.toUpperCase() })} placeholder="Ex: CD PRINCIPAL MG" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entidade do Armazém</label>
                                <input type="text" value={formData.entidade} onChange={(e) => setFormData({ ...formData, entidade: e.target.value })} placeholder="Ex: VerticalParts Matriz" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setFormData({ ...formData, ativo: !formData.ativo })} className="text-2xl">
                                    {formData.ativo ? <ToggleRight className="w-8 h-8 text-success" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                                </button>
                                <span className={`text-xs font-black uppercase tracking-widest ${formData.ativo ? 'text-success' : 'text-slate-400'}`}>{formData.ativo ? 'Ativo' : 'Inativo'}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {isEditing ? (
                                    <>
                                        <button type="button" onClick={handleClear} className="py-3 bg-slate-100 dark:bg-slate-900 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">Cancelar</button>
                                        <button type="submit" className="py-3 bg-warning text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning/90 transition-all shadow-lg shadow-warning/20 flex items-center justify-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>
                                    </>
                                ) : (
                                    <button type="submit" className="col-span-2 py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Cadastrar</button>
                                )}
                            </div>
                            {isEditing && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={handleDelete} className="py-3 bg-danger/10 text-danger font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                                    <button type="button" onClick={() => setShowConfig(!showConfig)} className="py-3 bg-slate-100 dark:bg-slate-900 text-slate-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary hover:text-primary transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Config</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* DATAGRID */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative flex-1 max-w-xs">
                                <input type="text" placeholder="Procurar armazém..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 w-12">ID</th>
                                        <th className="px-4 py-4">Código</th>
                                        <th className="px-4 py-4">Armazém</th>
                                        <th className="px-4 py-4">Entidade</th>
                                        <th className="px-4 py-4 text-center">Ativo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginated.length > 0 ? paginated.map((wh) => (
                                        <tr key={wh.id} onClick={() => handleSelect(wh)} className={`cursor-pointer transition-all duration-200 ${selectedId === wh.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                            <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{wh.id}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs font-bold bg-secondary/5 text-secondary">{wh.codigoInterno || '-'}</td>
                                            <td className="px-4 py-3.5 font-black text-xs tracking-tight uppercase">{wh.nome || wh.name}</td>
                                            <td className="px-4 py-3.5 text-xs text-slate-500">{wh.entidade || '-'}</td>
                                            <td className="px-4 py-3.5 text-center">{wh.ativo !== false ? <CheckCircle2 className="w-4 h-4 text-success mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhum armazém</span></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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

            {/* ========= TAB PANEL (shown when warehouse is selected) ========= */}
            {selectedId && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-secondary text-primary shadow-lg shadow-black/10' : 'text-slate-500 hover:bg-primary/10 hover:text-secondary'}`}>
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'doca' && <DocaTab warehouseId={selectedId} docks={warehouseDocks} crud={docksCrud} />}
                        {activeTab === 'armazenagem' && <ArmazenagemTab warehouseId={selectedId} locations={warehouseLocations} crud={locationsCrud} generateLocations={generateLocations} />}
                        {activeTab === 'colmeia' && <ColmeiaTab warehouseId={selectedId} colmeias={warehouseColmeias} crud={colmeiasCrud} />}
                        {activeTab === 'bancada' && <SimpleSubTab warehouseId={selectedId} items={warehouseBancadas} crud={bancadasCrud} title="Bancadas" />}
                        {activeTab === 'buffer' && <SimpleSubTab warehouseId={selectedId} items={warehouseBuffers} crud={buffersCrud} title="Buffers" />}
                        {activeTab === 'servico' && <ServicoTab warehouseId={selectedId} servicos={warehouseServicos} crud={servicosCrud} />}
                        {activeTab === 'packing' && <SimpleSubTab warehouseId={selectedId} items={warehousePacking} crud={packingCrud} title="Packing" />}
                    </div>
                </div>
            )}
        </div>
    );
}

// ========== DOCA TAB ==========
function DocaTab({ warehouseId, docks, crud }) {
    const items = docks.filter(d => d.warehouseId === warehouseId);
    const [form, setForm] = useState({ codigo: '', descricao: '', tipo: 'Recebimento' });
    const [editId, setEditId] = useState(null);
    const [showPrint, setShowPrint] = useState(false);

    const handleSave = () => {
        if (!form.descricao.trim()) return;
        if (editId) { crud.update(editId, form); setEditId(null); }
        else { crud.add({ ...form, warehouseId, ativo: true }); }
        setForm({ codigo: '', descricao: '', tipo: 'Recebimento' });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest">Doca / Rua de Expedição</h3>
                <button onClick={() => setShowPrint(!showPrint)} className="flex items-center gap-2 px-4 py-2 bg-secondary/5 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all"><Printer className="w-3.5 h-3.5" /> Impressos</button>
            </div>

            {showPrint && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {['Modelo 1', 'Modelo 3', 'Modelo 7', 'Modelo 8'].map(m => (
                        <button key={m} className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-secondary hover:border-primary transition-all flex items-center justify-center gap-2"><Printer className="w-3 h-3" />{m}</button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="Código" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value.toUpperCase() })} placeholder="Descrição" className="md:col-span-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <button onClick={handleSave} className="py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" /> {editId ? 'Alterar' : 'Adicionar'}</button>
            </div>

            <SubGrid items={items} columns={['codigo', 'descricao', 'tipo']} headers={['Código', 'Descrição', 'Tipo']} onEdit={(item) => { setEditId(item.id); setForm({ codigo: item.codigo, descricao: item.descricao, tipo: item.tipo }); }} onDelete={(id) => crud.remove(id)} />
        </div>
    );
}

// ========== ARMAZENAGEM TAB ==========
function ArmazenagemTab({ warehouseId, locations, crud, generateLocations }) {
    const items = locations.filter(l => l.warehouseId === warehouseId);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showGenerate, setShowGenerate] = useState(false);
    const [genConfig, setGenConfig] = useState({ ruaInicio: 1, ruaFim: 2, predioInicio: 1, predioFim: 1, andarInicio: 1, andarFim: 3, aptoInicio: 1, aptoFim: 5, peso: 500, cubagem: 1.2 });
    const [showBulk, setShowBulk] = useState(false);
    const [bulkData, setBulkData] = useState({ peso: '', cubagem: '' });

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleGenerate = () => {
        const count = generateLocations(warehouseId, genConfig);
        alert(`${count} locais gerados com sucesso!`);
        setShowGenerate(false);
    };

    const handleBulkUpdate = () => {
        const data = {};
        if (bulkData.peso) data.peso = Number(bulkData.peso);
        if (bulkData.cubagem) data.cubagem = Number(bulkData.cubagem);
        crud.bulkUpdate(selectedIds, data);
        setSelectedIds([]);
        setShowBulk(false);
        setBulkData({ peso: '', cubagem: '' });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest">Locais de Armazenagem</h3>
                <div className="flex items-center gap-2">
                    <button disabled={selectedIds.length < 2} onClick={() => setShowBulk(true)} className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning border border-warning/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-warning hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Edit2 className="w-3.5 h-3.5" /> Alterar em Bloco ({selectedIds.length})</button>
                    <button onClick={() => setShowGenerate(!showGenerate)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-lg shadow-black/10"><Zap className="w-3.5 h-3.5" /> Gerar Locais</button>
                </div>
            </div>

            {/* Bulk Update Panel */}
            {showBulk && (
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-2xl space-y-3">
                    <p className="text-xs font-black text-warning uppercase tracking-widest">Alterar em Bloco — {selectedIds.length} registros selecionados</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="number" value={bulkData.peso} onChange={e => setBulkData({ ...bulkData, peso: e.target.value })} placeholder="Novo Peso (kg)" className="bg-white dark:bg-slate-800 border-2 border-warning/30 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-warning outline-none" />
                        <input type="number" step="0.1" value={bulkData.cubagem} onChange={e => setBulkData({ ...bulkData, cubagem: e.target.value })} placeholder="Nova Cubagem (m³)" className="bg-white dark:bg-slate-800 border-2 border-warning/30 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-warning outline-none" />
                        <button onClick={handleBulkUpdate} className="py-2.5 bg-warning text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning/90 transition-all">Aplicar</button>
                    </div>
                </div>
            )}

            {/* Generate Locations Panel */}
            {showGenerate && (
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-2xl space-y-3">
                    <p className="text-xs font-black text-secondary uppercase tracking-widest">Gerar Locais — Definir Intervalo</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'Rua De', key: 'ruaInicio' }, { label: 'Rua Até', key: 'ruaFim' },
                            { label: 'Prédio De', key: 'predioInicio' }, { label: 'Prédio Até', key: 'predioFim' },
                            { label: 'Andar De', key: 'andarInicio' }, { label: 'Andar Até', key: 'andarFim' },
                            { label: 'Apto De', key: 'aptoInicio' }, { label: 'Apto Até', key: 'aptoFim' },
                            { label: 'Peso (kg)', key: 'peso' }, { label: 'Cubagem (m³)', key: 'cubagem' },
                        ].map(f => (
                            <div key={f.key} className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                                <input type="number" step={f.key === 'cubagem' ? 0.1 : 1} value={genConfig[f.key]} onChange={e => setGenConfig({ ...genConfig, [f.key]: Number(e.target.value) })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-bold focus:border-primary outline-none" />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGenerate} className="w-full py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> Gerar</button>
                </div>
            )}

            {/* Locations Grid */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <th className="px-3 py-3 w-8"><input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={() => setSelectedIds(selectedIds.length === items.length ? [] : items.map(i => i.id))} className="rounded" /></th>
                            <th className="px-3 py-3">Rua</th>
                            <th className="px-3 py-3">Prédio</th>
                            <th className="px-3 py-3">Andar</th>
                            <th className="px-3 py-3">Apto</th>
                            <th className="px-3 py-3">Peso</th>
                            <th className="px-3 py-3">Cubagem</th>
                            <th className="px-3 py-3 text-center">Ativo</th>
                            <th className="px-3 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {items.length > 0 ? items.slice(0, 20).map(loc => (
                            <tr key={loc.id} className={`transition-all ${selectedIds.includes(loc.id) ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(loc.id)} onChange={() => toggleSelect(loc.id)} className="rounded" /></td>
                                <td className="px-3 py-2.5 font-mono text-xs font-bold">{loc.rua}</td>
                                <td className="px-3 py-2.5 font-mono text-xs font-bold">{loc.predio}</td>
                                <td className="px-3 py-2.5 font-mono text-xs font-bold">{loc.andar}</td>
                                <td className="px-3 py-2.5 font-mono text-xs font-bold">{loc.apto}</td>
                                <td className="px-3 py-2.5 text-xs font-bold">{loc.peso} kg</td>
                                <td className="px-3 py-2.5 text-xs font-bold">{loc.cubagem} m³</td>
                                <td className="px-3 py-2.5 text-center">{loc.ativo ? <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 mx-auto" />}</td>
                                <td className="px-3 py-2.5 text-right"><button onClick={() => crud.remove(loc.id)} className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all"><Trash2 className="w-3 h-3" /></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="9" className="px-4 py-12 text-center opacity-30 text-xs font-black uppercase tracking-widest">Nenhum local cadastrado</td></tr>
                        )}
                    </tbody>
                </table>
                {items.length > 20 && <div className="p-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-t border-slate-100">Mostrando 20 de {items.length} locais</div>}
            </div>
        </div>
    );
}

// ========== COLMEIA TAB ==========
function ColmeiaTab({ warehouseId, colmeias, crud }) {
    const items = colmeias.filter(c => c.warehouseId === warehouseId);
    const [form, setForm] = useState({ codigo: '', descricao: '', capacidade: '' });
    const [showPrint, setShowPrint] = useState(false);

    const handleSave = () => {
        if (!form.descricao.trim()) return;
        crud.add({ ...form, capacidade: Number(form.capacidade) || 0, warehouseId, ativo: true });
        setForm({ codigo: '', descricao: '', capacidade: '' });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest">Colmeia</h3>
                <button onClick={() => setShowPrint(!showPrint)} className="flex items-center gap-2 px-4 py-2 bg-secondary/5 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all"><Printer className="w-3.5 h-3.5" /> Impressos</button>
            </div>

            {showPrint && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {['Modelo 1', 'Modelo 3', 'Modelo 7', 'Modelo 8'].map(m => (
                        <button key={m} className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-secondary hover:border-primary transition-all flex items-center justify-center gap-2"><Printer className="w-3 h-3" />{m}</button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="Código" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value.toUpperCase() })} placeholder="Descrição" className="md:col-span-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <button onClick={handleSave} className="py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</button>
            </div>

            <SubGrid items={items} columns={['codigo', 'descricao', 'capacidade']} headers={['Código', 'Descrição', 'Capacidade']} onDelete={(id) => crud.remove(id)} />
        </div>
    );
}

// ========== SERVIÇO TAB ==========
function ServicoTab({ warehouseId, servicos, crud }) {
    const items = servicos.filter(s => s.warehouseId === warehouseId);
    const [form, setForm] = useState({ codigo: '', descricao: '' });

    const handleSave = () => {
        if (!form.descricao.trim()) return;
        crud.add({ ...form, warehouseId, ativo: true });
        setForm({ codigo: '', descricao: '' });
    };

    const toggleAtivo = (item) => {
        crud.update(item.id, { ativo: !item.ativo });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest">Endereços de Serviço</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="Código (ex: SRV-LIMP)" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value.toUpperCase() })} placeholder="Descrição (ex: LIMPEZA)" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <button onClick={handleSave} className="py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</button>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {items.length > 0 ? items.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                                <td className="px-4 py-3 font-mono text-xs font-bold">{item.codigo}</td>
                                <td className="px-4 py-3 text-xs font-black uppercase">{item.descricao}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.ativo ? 'bg-success/10 text-success border border-success/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                        {item.ativo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {item.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => toggleAtivo(item)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${item.ativo ? 'bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20' : 'bg-success/10 text-success hover:bg-success hover:text-white border border-success/20'}`}>
                                            {item.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button onClick={() => crud.remove(item.id)} className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="px-4 py-12 text-center opacity-30 text-xs font-black uppercase tracking-widest">Nenhum serviço cadastrado</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ========== SIMPLE SUB TAB (Bancada, Buffer, Packing) ==========
function SimpleSubTab({ warehouseId, items: allItems, crud, title }) {
    const items = allItems.filter(i => i.warehouseId === warehouseId);
    const [form, setForm] = useState({ codigo: '', descricao: '' });

    const handleSave = () => {
        if (!form.descricao.trim()) return;
        crud.add({ ...form, warehouseId, ativo: true });
        setForm({ codigo: '', descricao: '' });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="Código" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value.toUpperCase() })} placeholder="Descrição" className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300" />
                <button onClick={handleSave} className="py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</button>
            </div>
            <SubGrid items={items} columns={['codigo', 'descricao']} headers={['Código', 'Descrição']} onDelete={(id) => crud.remove(id)} />
        </div>
    );
}

// ========== REUSABLE SUBGRID ==========
function SubGrid({ items, columns, headers, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        {headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                        <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                            {columns.map(col => (
                                <td key={col} className="px-4 py-3 text-xs font-bold uppercase">{String(item[col] ?? '-')}</td>
                            ))}
                            <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onEdit && <button onClick={() => onEdit(item)} className="p-1.5 bg-warning/10 text-warning hover:bg-warning hover:text-white rounded-lg transition-all border border-warning/20"><Edit2 className="w-3 h-3" /></button>}
                                    {onDelete && <button onClick={() => onDelete(item.id)} className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all border border-danger/20"><Trash2 className="w-3 h-3" /></button>}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center opacity-30 text-xs font-black uppercase tracking-widest">Nenhum registro</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
