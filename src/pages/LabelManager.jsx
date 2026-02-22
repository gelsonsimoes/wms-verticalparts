import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
    Tag, Search, ChevronLeft, ChevronRight, Filter,
    CheckCircle2, XCircle, Copy, Edit2, Trash2, Power,
    Download, Upload, X, Save, FileCode, AlertTriangle,
    Sparkles, ShieldCheck
} from 'lucide-react';

// ========== TIPOS DE ETIQUETA ==========
const TIPOS_ETIQUETA = ['Embalagem', 'Volume de Expedição', 'Mensagem de Produto', 'Endereço', 'Recebimento', 'Colmeia', 'Crachá', 'Nota Fiscal'];

// ========== MODELOS POR TIPO ==========
const MODELOS = {
    'Embalagem': ['embalagem_padrao.jrxml', 'embalagem_grande.jrxml', 'embalagem_pequena.jrxml'],
    'Volume de Expedição': ['volume_expedicao.jrxml', 'volume_palete.jrxml'],
    'Mensagem de Produto': ['mensagem_produto.jrxml', 'mensagem_lote.jrxml'],
    'Endereço': ['endereco.jrxml', 'endereco_colmeia.jrxml'],
    'Recebimento': ['recebimento.jrxml', 'recebimento_nf.jrxml'],
    'Colmeia': ['colmeia.jrxml'],
    'Crachá': ['cracha_50x80.jrxml'],
    'Nota Fiscal': ['nota_fiscal.jrxml'],
};

// ========== MODAL COPIAR ETIQUETA ==========
function CopyLabelModal({ onSave, onClose }) {
    const [step, setStep] = useState(1);
    const [tipoSelecionado, setTipoSelecionado] = useState('');
    const [modeloSelecionado, setModeloSelecionado] = useState('');
    const [descricao, setDescricao] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [erroValidacao, setErroValidacao] = useState('');
    const fileRef = useRef(null);

    const modelos = tipoSelecionado ? (MODELOS[tipoSelecionado] || []) : [];

    const handleBaixarModelo = () => {
        if (!modeloSelecionado) return;
        // Simulação de download — gera um arquivo .jrxml fictício
        const conteudo = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Modelo: ${modeloSelecionado} -->\n<!-- Tipo: ${tipoSelecionado} -->\n<!-- VerticalParts WMS - Template de Etiqueta -->\n<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"\n  name="${modeloSelecionado.replace('.jrxml', '')}"\n  pageWidth="283" pageHeight="226">\n  <!-- Edite este template conforme necessário -->\n</jasperReport>`;
        const blob = new Blob([conteudo], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = modeloSelecionado;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErroValidacao('');

        // Validação: deve ser .jrxml
        if (!file.name.endsWith('.jrxml')) {
            setErroValidacao('O arquivo deve ser no formato .jrxml');
            setArquivo(null);
            return;
        }

        // Validação: nome do arquivo deve conter referência ao tipo
        const tipoKey = tipoSelecionado.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
        const nomeArquivo = file.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Validação simplificada — aceita qualquer .jrxml (na prática, verificaria o conteúdo XML)
        setArquivo(file);
    };

    const handleSalvar = () => {
        if (!descricao.trim() || !tipoSelecionado) return;
        onSave({
            descricao: descricao.toUpperCase(),
            tipoEtiqueta: tipoSelecionado,
            personalizada: true,
            ativo: true,
            sistema: false,
            arquivo: arquivo?.name || modeloSelecionado,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Copy className="w-5 h-5 text-primary" /></div>
                        <div>
                            <h3 className="text-base font-black">Copiar Etiqueta</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passo {step} de 2</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* PASSO 1: Selecionar Modelo e Tipo */}
                    {step === 1 && (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Tipo de Etiqueta</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {TIPOS_ETIQUETA.map(tipo => (
                                            <button key={tipo} onClick={() => { setTipoSelecionado(tipo); setModeloSelecionado(''); }} className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all border-2 ${tipoSelecionado === tipo ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200'}`}>
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {tipoSelecionado && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Modelo Base</h4>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                                        {modelos.map(m => (
                                            <button key={m} onClick={() => setModeloSelecionado(m)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${modeloSelecionado === m ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200'}`}>
                                                <FileCode className={`w-4 h-4 ${modeloSelecionado === m ? 'text-primary' : 'text-slate-300'}`} />
                                                <span className="text-xs font-bold font-mono">{m}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modeloSelecionado && (
                                <div className="flex gap-3">
                                    <button onClick={handleBaixarModelo} className="flex-1 py-3 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center gap-2"><Download className="w-3.5 h-3.5" /> Baixar Modelo</button>
                                    <button onClick={() => setStep(2)} className="flex-1 py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">Próximo →</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* PASSO 2: Upload e Descrição */}
                    {step === 2 && (
                        <>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <Tag className="w-4 h-4 text-blue-500 shrink-0" />
                                <p className="text-[10px] font-bold text-blue-600">Tipo: <strong>{tipoSelecionado}</strong> | Modelo: <strong className="font-mono">{modeloSelecionado}</strong></p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição da Etiqueta</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <input required type="text" value={descricao} onChange={e => setDescricao(e.target.value.toUpperCase())} placeholder="Ex: EMBALAGEM VERTICALPARTS CUSTOM" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Arquivo .jrxml Modificado</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                    <input ref={fileRef} type="file" accept=".jrxml" onChange={handleFileSelect} className="hidden" />
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Selecionar</button>
                                        <span className="text-xs font-bold text-slate-500 truncate">{arquivo ? arquivo.name : 'Nenhum arquivo selecionado'}</span>
                                    </div>
                                    {erroValidacao && (
                                        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl"><AlertTriangle className="w-4 h-4 text-danger shrink-0" /><p className="text-xs font-bold text-danger">{erroValidacao}</p></div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <button onClick={() => setStep(1)} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">← Voltar</button>
                                <button onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                                <button onClick={handleSalvar} disabled={!descricao.trim()} className="py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 disabled:opacity-40"><Save className="w-3.5 h-3.5" /> Salvar</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function LabelManager() {
    const { labels, labelsCrud } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const itemsPerPage = 8;

    const selectedLabel = labels.find(l => l.id === selectedId);

    // === Filtro e Paginação ===
    const filtered = useMemo(() => labels.filter(l => {
        const matchSearch = l.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || l.tipoEtiqueta?.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.toString().includes(searchTerm);
        const matchStatus = statusFilter === 'Todos' || (statusFilter === 'Ativado' && l.ativo) || (statusFilter === 'Desativado' && !l.ativo);
        return matchSearch && matchStatus;
    }), [labels, searchTerm, statusFilter]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);

    // === Handlers ===
    const handleCopySave = (data) => {
        labelsCrud.add(data);
        setShowCopyModal(false);
    };

    const handleToggleAtivo = () => {
        if (!selectedId || !selectedLabel) return;
        labelsCrud.update(selectedId, { ativo: !selectedLabel.ativo });
    };

    const handleDelete = () => {
        if (!selectedId || !selectedLabel) return;
        if (selectedLabel.sistema) {
            alert('Etiquetas padrão do sistema não podem ser excluídas. Utilize "Desativar" para desabilitá-la.');
            return;
        }
        if (window.confirm('Deseja realmente excluir esta etiqueta?')) {
            labelsCrud.remove(selectedId);
            setSelectedId(null);
        }
    };

    const handleEdit = () => {
        if (!selectedId || !selectedLabel) return;
        if (selectedLabel.sistema) {
            alert('Etiquetas padrão do sistema não podem ser editadas. Utilize "Copiar Etiqueta" para criar uma versão personalizada.');
            return;
        }
        const novaDesc = prompt('Nova descrição da etiqueta:', selectedLabel.descricao);
        if (novaDesc && novaDesc.trim()) {
            labelsCrud.update(selectedId, { descricao: novaDesc.toUpperCase() });
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal */}
            {showCopyModal && <CopyLabelModal onSave={handleCopySave} onClose={() => setShowCopyModal(false)} />}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Gerenciador de Etiquetas</h1>
                    <p className="text-sm text-slate-500 font-medium">Gerencie templates de etiquetas do WMS VerticalParts</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {labels.length} etiquetas</span>
                </div>
            </div>

            {/* Barra de Ação */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setShowCopyModal(true)} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center gap-2"><Copy className="w-4 h-4" /> Copiar Etiqueta</button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <button onClick={handleEdit} disabled={!selectedId} className="px-4 py-2.5 bg-warning/10 text-warning font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-warning hover:text-white transition-all border border-warning/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>
                    <button onClick={handleToggleAtivo} disabled={!selectedId} className={`px-4 py-2.5 font-black rounded-xl text-[10px] tracking-widest uppercase transition-all border disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 ${selectedLabel?.ativo ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-danger hover:text-white hover:border-danger' : 'bg-success/10 text-success border-success/20 hover:bg-success hover:text-white'}`}>
                        <Power className="w-3.5 h-3.5" /> {selectedLabel?.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={handleDelete} disabled={!selectedId} className="px-4 py-2.5 bg-danger/10 text-danger font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger hover:text-white transition-all border border-danger/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                    <div className="flex-1" />
                    <div className="relative min-w-[200px]">
                        <input type="text" placeholder="Procurar etiqueta..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Filtro de Status + DataGrid */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Filtro */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exibir:</span>
                    {['Todos', 'Ativado', 'Desativado'].map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-secondary text-primary shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-secondary'}`}>{s}</button>
                    ))}
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-4 w-12">ID</th>
                                <th className="px-4 py-4">Descrição</th>
                                <th className="px-4 py-4">Tipo Etiqueta</th>
                                <th className="px-4 py-4 text-center">Personalizada</th>
                                <th className="px-4 py-4 text-center">Ativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {paginated.length > 0 ? paginated.map(l => (
                                <tr key={l.id} onClick={() => setSelectedId(l.id)} className={`cursor-pointer transition-all duration-200 ${selectedId === l.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                                    <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{l.id}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {l.sistema && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Etiqueta padrão do sistema" />}
                                            <span className="font-black text-xs uppercase tracking-tight">{l.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5"><span className="font-mono text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">{l.tipoEtiqueta}</span></td>
                                    <td className="px-4 py-3.5 text-center">
                                        {l.personalizada ? <Sparkles className="w-4 h-4 text-warning mx-auto" title="Personalizada" /> : <span className="text-slate-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${l.ativo ? 'bg-success/10 text-success border border-success/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                            {l.ativo ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                            {l.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="px-4 py-16 text-center opacity-30"><span className="text-xs font-black uppercase tracking-widest">Nenhuma etiqueta encontrada</span></td></tr>
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

            {/* Detalhes do selecionado */}
            {selectedId && selectedLabel && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhes da Etiqueta</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                            <span className="text-sm font-black">{selectedLabel.tipoEtiqueta}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Arquivo</p>
                            <div className="flex items-center gap-2">
                                <FileCode className="w-3.5 h-3.5 text-secondary" />
                                <span className="text-xs font-bold font-mono truncate">{selectedLabel.arquivo}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Origem</p>
                            <span className={`inline-flex items-center gap-1.5 text-sm font-black ${selectedLabel.sistema ? 'text-blue-500' : 'text-warning'}`}>
                                {selectedLabel.sistema ? <><ShieldCheck className="w-4 h-4" /> Sistema</> : <><Sparkles className="w-4 h-4" /> Personalizada</>}
                            </span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Proteção</p>
                            {selectedLabel.sistema ? (
                                <p className="text-[10px] font-bold text-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Não pode ser excluída/editada</p>
                            ) : (
                                <p className="text-[10px] font-bold text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Editável e removível</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
