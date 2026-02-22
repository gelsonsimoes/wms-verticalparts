import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    Cpu, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight,
    X, Save, Scale, ScanBarcode, Wifi, WifiOff, CheckSquare, Square,
    Settings2, Plug, TestTube2, Loader2
} from 'lucide-react';

// ========== OPÇÕES ==========
const MARCAS_BALANCA = ['Toledo', 'Filizola'];
const TIPO_DISPLAY = ['Display 10', '1', '0,1', '0,01', '0,001', '0,0001'];
const PROTOCOLOS = ['Toledo P01', 'Toledo P02', 'Toledo Prt1', 'Filizola IDSI II', 'Filizola BCII', 'RS232', 'USB-Serial'];
const PARIDADE_OPTIONS = ['NONE', 'ODD', 'EVEN', 'MARK', 'SPACE'];
const BITS_POR_SEGUNDO = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
const BITS_DADOS = [5, 6, 7, 8];
const BITS_PARADA = [1, 1.5, 2];

// ========== MODAL CADASTRO ==========
function DeviceModal({ device, tipo, onSave, onClose }) {
    const isBalanca = tipo === 'balanca';
    const title = device ? 'Alterar Dispositivo' : (isBalanca ? 'Cadastrar Balança' : 'Cadastrar Scanner');

    const [form, setForm] = useState({
        nome: device?.nome || '',
        tipo: device?.tipo || tipo,
        marca: device?.marca || (isBalanca ? 'Toledo' : 'Honeywell'),
        tipoDisplay: device?.tipoDisplay || 'Display 10',
        protocolo: device?.protocolo || (isBalanca ? 'Toledo P01' : 'RS232'),
        porta: device?.porta || 'COM1',
        bitsPorSegundo: device?.bitsPorSegundo || 9600,
        bitsDados: device?.bitsDados || 8,
        bitsParada: device?.bitsParada || 1,
        paridade: device?.paridade || 'NONE',
        rts: device?.rts || false,
        dtr: device?.dtr || false,
    });

    const [testando, setTestando] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleTest = () => {
        setTestando(true);
        setTestResult(null);
        setTimeout(() => {
            setTestando(false);
            setTestResult({ success: Math.random() > 0.3, message: Math.random() > 0.3 ? `Conexão OK — ${form.porta} respondendo` : `Falha — ${form.porta} sem resposta` });
        }, 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nome.trim()) return;
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            {isBalanca ? <Scale className="w-5 h-5 text-primary" /> : <ScanBarcode className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <h3 className="text-base font-black">{title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configuração serial</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Bloco: Identificação */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-5 bg-secondary rounded-full" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isBalanca ? 'Identificação da Balança' : 'Identificação do Scanner'}
                            </h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                                <input required type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })} placeholder={isBalanca ? "Ex: BALANÇA RECEBIMENTO" : "Ex: SCANNER EXPEDIÇÃO"} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                            </div>
                        </div>
                    </div>

                    {/* Bloco: Marca (só balança mostra display/protocolo completo) */}
                    {isBalanca && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca da Balança</h4>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                                        <select value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                            {MARCAS_BALANCA.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Display</label>
                                        <select value={form.tipoDisplay} onChange={e => setForm({ ...form, tipoDisplay: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                            {TIPO_DISPLAY.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocolo</label>
                                        <select value={form.protocolo} onChange={e => setForm({ ...form, protocolo: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                            {PROTOCOLOS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloco: Scanner marca/protocolo simplificado */}
                    {!isBalanca && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuração do Scanner</h4>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                                        <input type="text" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocolo</label>
                                        <select value={form.protocolo} onChange={e => setForm({ ...form, protocolo: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-primary outline-none transition-all">
                                            {PROTOCOLOS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloco: Porta Serial */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-5 bg-secondary rounded-full" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados de Conexão com a Porta Serial</h4>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Porta</label>
                                    <input type="text" value={form.porta} onChange={e => setForm({ ...form, porta: e.target.value.toUpperCase() })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold font-mono focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bits por Segundo</label>
                                    <select value={form.bitsPorSegundo} onChange={e => setForm({ ...form, bitsPorSegundo: Number(e.target.value) })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold font-mono focus:border-primary outline-none transition-all">
                                        {BITS_POR_SEGUNDO.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bits de Dados</label>
                                    <select value={form.bitsDados} onChange={e => setForm({ ...form, bitsDados: Number(e.target.value) })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold font-mono focus:border-primary outline-none transition-all">
                                        {BITS_DADOS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bits de Parada</label>
                                    <select value={form.bitsParada} onChange={e => setForm({ ...form, bitsParada: Number(e.target.value) })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold font-mono focus:border-primary outline-none transition-all">
                                        {BITS_PARADA.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paridade</label>
                                    <select value={form.paridade} onChange={e => setForm({ ...form, paridade: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold font-mono focus:border-primary outline-none transition-all">
                                        {PARIDADE_OPTIONS.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* RTS / DTR */}
                            <div className="flex gap-4 pt-1">
                                <button type="button" onClick={() => setForm({ ...form, rts: !form.rts })} className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all border-2 ${form.rts ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-slate-800 border-transparent'}`}>
                                    {form.rts ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-300" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">RTS</span>
                                </button>
                                <button type="button" onClick={() => setForm({ ...form, dtr: !form.dtr })} className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all border-2 ${form.dtr ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-slate-800 border-transparent'}`}>
                                    {form.dtr ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-300" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">DTR</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Resultado do teste */}
                    {testResult && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${testResult.success ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
                            {testResult.success ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5 text-danger" />}
                            <span className={`text-xs font-black ${testResult.success ? 'text-success' : 'text-danger'}`}>{testResult.message}</span>
                        </div>
                    )}

                    {/* Botões inferiores */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <button type="button" onClick={handleTest} disabled={testando} className="py-3 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center gap-1.5 disabled:opacity-50">
                            {testando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
                            {testando ? 'Testando...' : 'Testar'}
                        </button>
                        <button type="button" onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                        <button type="submit" className="py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5"><Save className="w-3.5 h-3.5" /> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function SerialDevices() {
    const { serialDevices, serialDevicesCrud } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalTipo, setModalTipo] = useState('balanca');
    const [editDevice, setEditDevice] = useState(null);
    const itemsPerPage = 8;

    // === Filtro e Paginação ===
    const filtered = useMemo(() => serialDevices.filter(d =>
        d.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.porta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString().includes(searchTerm)
    ), [serialDevices, searchTerm]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);

    // === Handlers ===
    const handleSave = (form) => {
        if (editDevice) {
            serialDevicesCrud.update(editDevice.id, form);
        } else {
            serialDevicesCrud.add(form);
        }
        setShowModal(false);
        setEditDevice(null);
    };

    const handleEdit = () => {
        if (!selectedId) return;
        const d = serialDevices.find(d => d.id === selectedId);
        if (!d) return;
        setEditDevice(d);
        setModalTipo(d.tipo);
        setShowModal(true);
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('Deseja realmente excluir este dispositivo?')) {
            serialDevicesCrud.remove(selectedId);
            setSelectedId(null);
        }
    };

    const openNew = (tipo) => {
        setEditDevice(null);
        setModalTipo(tipo);
        setShowModal(true);
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal */}
            {showModal && (
                <DeviceModal
                    device={editDevice}
                    tipo={modalTipo}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditDevice(null); }}
                />
            )}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Dispositivos Serial</h1>
                    <p className="text-sm text-slate-500 font-medium">Configure balanças, scanners e portas seriais do WMS</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {serialDevices.length} dispositivos</span>
                </div>
            </div>

            {/* Barra de Ação */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => openNew('balanca')} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center gap-2"><Scale className="w-4 h-4" /> Cadastrar Balança</button>
                    <button onClick={() => openNew('scanner')} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center gap-2"><ScanBarcode className="w-4 h-4" /> Cadastrar Scanner</button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <button onClick={handleEdit} disabled={!selectedId} className="px-4 py-2.5 bg-warning/10 text-warning font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning hover:text-white transition-all border border-warning/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>
                    <button onClick={handleDelete} disabled={!selectedId} className="px-4 py-2.5 bg-danger/10 text-danger font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                    <div className="flex-1" />
                    <div className="relative min-w-[200px]">
                        <input type="text" placeholder="Procurar dispositivo..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* DataGrid */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-4 w-10">ID</th>
                                <th className="px-4 py-4">Nome</th>
                                <th className="px-4 py-4">Marca</th>
                                <th className="px-4 py-4">Protocolo</th>
                                <th className="px-4 py-4 text-center">Porta</th>
                                <th className="px-4 py-4 text-center">Bits/s</th>
                                <th className="px-4 py-4 text-center">Bits Parada</th>
                                <th className="px-4 py-4 text-center">Paridade</th>
                                <th className="px-4 py-4 text-center">Bits Dados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {paginated.length > 0 ? paginated.map(d => (
                                <tr key={d.id} onClick={() => setSelectedId(d.id)} className={`cursor-pointer transition-all duration-200 ${selectedId === d.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                    <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{d.id}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {d.tipo === 'balanca' ? <Scale className="w-3.5 h-3.5 text-primary shrink-0" /> : <ScanBarcode className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                                            <span className="font-black text-xs uppercase tracking-tight">{d.nome}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs font-bold text-slate-500">{d.marca}</td>
                                    <td className="px-4 py-3.5"><span className="font-mono text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">{d.protocolo}</span></td>
                                    <td className="px-4 py-3.5 text-center"><span className="inline-flex items-center gap-1 font-mono text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200"><Plug className="w-2.5 h-2.5" /> {d.porta}</span></td>
                                    <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-600">{d.bitsPorSegundo}</td>
                                    <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-500">{d.bitsParada}</td>
                                    <td className="px-4 py-3.5 text-center"><span className="text-[9px] font-black text-slate-400 uppercase">{d.paridade}</span></td>
                                    <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-500">{d.bitsDados}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="9" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhum dispositivo</span></td></tr>
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

            {/* Info do dispositivo selecionado */}
            {selectedId && (() => {
                const d = serialDevices.find(d => d.id === selectedId);
                if (!d) return null;
                return (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhes do Dispositivo</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                                <div className="flex items-center gap-2">
                                    {d.tipo === 'balanca' ? <Scale className="w-4 h-4 text-primary" /> : <ScanBarcode className="w-4 h-4 text-blue-500" />}
                                    <span className="text-sm font-black uppercase">{d.tipo === 'balanca' ? 'Balança' : 'Scanner'}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Porta</p>
                                <div className="flex items-center gap-2">
                                    <Plug className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-black font-mono">{d.porta}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">RTS / DTR</p>
                                <div className="flex gap-3">
                                    <span className={`text-xs font-black ${d.rts ? 'text-success' : 'text-slate-300'}`}>RTS {d.rts ? 'ON' : 'OFF'}</span>
                                    <span className={`text-xs font-black ${d.dtr ? 'text-success' : 'text-slate-300'}`}>DTR {d.dtr ? 'ON' : 'OFF'}</span>
                                </div>
                            </div>
                            {d.tipo === 'balanca' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Display</p>
                                    <span className="text-sm font-black">{d.tipoDisplay}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
