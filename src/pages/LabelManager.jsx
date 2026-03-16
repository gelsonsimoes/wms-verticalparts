import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
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
    'Embalagem':            ['embalagem_padrao.jrxml', 'embalagem_grande.jrxml', 'embalagem_pequena.jrxml'],
    'Volume de Expedição':  ['volume_expedicao.jrxml', 'volume_palete.jrxml'],
    'Mensagem de Produto':  ['mensagem_produto.jrxml', 'mensagem_lote.jrxml'],
    'Endereço':             ['endereco.jrxml', 'endereco_colmeia.jrxml'],
    'Recebimento':          ['recebimento.jrxml', 'recebimento_nf.jrxml'],
    'Colmeia':              ['colmeia.jrxml'],
    'Crachá':               ['cracha_50x80.jrxml'],
    'Nota Fiscal':          ['nota_fiscal.jrxml'],
};

// ========== MODAL COPIAR ETIQUETA ==========
function CopyLabelModal({ onSave, onClose }) {
    const [step, setStep] = useState(1);
    const [tipoSelecionado,  setTipoSelecionado]  = useState('');
    const [modeloSelecionado, setModeloSelecionado] = useState('');
    const [descricao,        setDescricao]         = useState('');
    const [arquivo,          setArquivo]           = useState(null);
    const [erroValidacao,    setErroValidacao]     = useState('');
    const [saveError,        setSaveError]         = useState('');
    const fileRef = useRef(null);
    const firstFocusRef = useRef(null);

    const modelos = tipoSelecionado ? (MODELOS[tipoSelecionado] || []) : [];

    // Mover foco para o primeiro elemento ao abrir; fechar com Escape
    useEffect(() => {
        firstFocusRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleBaixarModelo = () => {
        if (!modeloSelecionado) return;
        const conteudo = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Modelo: ${modeloSelecionado} -->\n<!-- Tipo: ${tipoSelecionado} -->\n<!-- VerticalParts WMS - Template de Etiqueta -->\n<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"\n  name="${modeloSelecionado.replace('.jrxml', '')}"\n  pageWidth="283" pageHeight="226">\n  <!-- Edite este template conforme necessário -->\n</jasperReport>`;
        const blob = new Blob([conteudo], { type: 'application/xml' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = modeloSelecionado; a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErroValidacao('');
        if (!file.name.endsWith('.jrxml')) {
            setErroValidacao('O arquivo deve ser no formato .jrxml');
            setArquivo(null);
            if (fileRef.current) fileRef.current.value = '';
            return;
        }
        setArquivo(file);
    };

    const handleLimparArquivo = () => {
        setArquivo(null);
        setErroValidacao('');
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSalvar = () => {
        if (!descricao.trim() || !tipoSelecionado) return;
        setSaveError('');
        try {
            onSave({
                descricao: descricao.toUpperCase(),
                tipoEtiqueta: tipoSelecionado,
                personalizada: true,
                ativo: true,
                sistema: false,
                arquivo: arquivo?.name || modeloSelecionado,
            });
        } catch {
            setSaveError('Ocorreu um erro ao salvar a etiqueta. Tente novamente.');
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="copy-modal-title"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <Copy className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 id="copy-modal-title" className="text-base font-black">Copiar Etiqueta</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passo {step} de 2</p>
                        </div>
                    </div>
                    <button
                        ref={firstFocusRef}
                        onClick={onClose}
                        aria-label="Fechar modal de copiar etiqueta"
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* PASSO 1: Selecionar Modelo e Tipo */}
                    {step === 1 && (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" aria-hidden="true" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Tipo de Etiqueta</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="listbox" aria-label="Tipos de etiqueta">
                                        {TIPOS_ETIQUETA.map(tipo => (
                                            <button
                                                key={tipo}
                                                role="option"
                                                aria-selected={tipoSelecionado === tipo}
                                                onClick={() => { setTipoSelecionado(tipo); setModeloSelecionado(''); }}
                                                className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all border-2 ${tipoSelecionado === tipo ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200'}`}
                                            >
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {tipoSelecionado && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-5 bg-secondary rounded-full" aria-hidden="true" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Modelo Base</h4>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                                        {modelos.map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setModeloSelecionado(m)}
                                                aria-pressed={modeloSelecionado === m}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${modeloSelecionado === m ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200'}`}
                                            >
                                                <FileCode className={`w-4 h-4 ${modeloSelecionado === m ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true" />
                                                <span className="text-xs font-bold font-mono">{m}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modeloSelecionado && (
                                <div className="flex gap-3">
                                    <button onClick={handleBaixarModelo} className="flex-1 py-3 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center gap-2">
                                        <Download className="w-3.5 h-3.5" aria-hidden="true" /> Baixar Modelo
                                    </button>
                                    <button onClick={() => setStep(2)} className="flex-1 py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                                        Próximo →
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* PASSO 2: Upload e Descrição */}
                    {step === 2 && (
                        <>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <Tag className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
                                <p className="text-[10px] font-bold text-blue-600">Tipo: <strong>{tipoSelecionado}</strong> | Modelo: <strong className="font-mono">{modeloSelecionado}</strong></p>
                            </div>

                            {/* Descrição */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" aria-hidden="true" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição da Etiqueta</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <label htmlFor="modal-descricao" className="sr-only">Descrição da etiqueta</label>
                                    <input
                                        id="modal-descricao"
                                        required
                                        type="text"
                                        value={descricao}
                                        onChange={e => setDescricao(e.target.value.toUpperCase())}
                                        placeholder="Ex: EMBALAGEM VERTICALPARTS CUSTOM"
                                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Upload */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-5 bg-secondary rounded-full" aria-hidden="true" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Arquivo .jrxml Modificado</h4>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                    {/* Input file oculto */}
                                    <label htmlFor="modal-jrxml-file" className="sr-only">Selecionar arquivo .jrxml</label>
                                    <input
                                        id="modal-jrxml-file"
                                        ref={fileRef}
                                        type="file"
                                        accept=".jrxml"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            aria-label="Selecionar arquivo .jrxml do computador"
                                            className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center gap-2"
                                        >
                                            <Upload className="w-3.5 h-3.5" aria-hidden="true" /> Selecionar
                                        </button>
                                        <span className="text-xs font-bold text-slate-500 truncate flex-1">
                                            {arquivo ? arquivo.name : 'Nenhum arquivo selecionado'}
                                        </span>
                                        {/* Botão limpar arquivo */}
                                        {arquivo && (
                                            <button
                                                type="button"
                                                onClick={handleLimparArquivo}
                                                aria-label="Remover arquivo selecionado"
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                    {erroValidacao && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                                            <p className="text-xs font-bold text-red-600">{erroValidacao}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Erro de salvamento */}
                            {saveError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                                    <p className="text-xs font-bold text-red-600">{saveError}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <button onClick={() => setStep(1)} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">← Voltar</button>
                                <button onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                                <button
                                    onClick={handleSalvar}
                                    disabled={!descricao.trim()}
                                    className="py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 disabled:opacity-40"
                                >
                                    <Save className="w-3.5 h-3.5" aria-hidden="true" /> Salvar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ========== MINI-MODAL DE EDIÇÃO INLINE ==========
function EditDescModal({ label, onSave, onClose }) {
    const [valor, setValor] = useState(label.descricao);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSave = () => {
        if (!valor.trim()) return;
        onSave(valor.trim().toUpperCase());
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[95] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h3 id="edit-modal-title" className="text-sm font-black uppercase tracking-tight">Alterar Descrição</h3>
                    <button onClick={onClose} aria-label="Fechar modal de edição" className="text-slate-400 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
                <div>
                    <label htmlFor="edit-desc-input" className="sr-only">Nova descrição da etiqueta</label>
                    <input
                        id="edit-desc-input"
                        ref={inputRef}
                        type="text"
                        value={valor}
                        onChange={e => setValor(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold bg-slate-50 dark:bg-slate-900 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!valor.trim()}
                        className="flex-1 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                        <Save className="w-3.5 h-3.5" aria-hidden="true" /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function LabelManager() {
    const { labels, labelsCrud } = useApp();

    const [searchTerm,    setSearchTerm]    = useState('');
    const [statusFilter,  setStatusFilter]  = useState('Todos');
    const [selectedId,    setSelectedId]    = useState(null);
    const [currentPage,   setCurrentPage]   = useState(1);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [editLabel,     setEditLabel]     = useState(null); // label sendo editada no mini-modal
    const itemsPerPage = 8;

    const selectedLabel = labels.find(l => l.id === selectedId);

    // === Filtro e Paginação ===
    const filtered = useMemo(() => labels.filter(l => {
        const matchSearch  = l.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
            || l.tipoEtiqueta?.toLowerCase().includes(searchTerm.toLowerCase())
            || l.id.toString().includes(searchTerm);
        const matchStatus = statusFilter === 'Todos'
            || (statusFilter === 'Ativado'    &&  l.ativo)
            || (statusFilter === 'Desativado' && !l.ativo);
        return matchSearch && matchStatus;
    }), [labels, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

    // Ajusta página atual quando o filtro reduz o total de páginas
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(prev => Math.min(prev, totalPages));
    }, [totalPages]);

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

    // Abre mini-modal de edição (substitui prompt)
    const handleEdit = () => {
        if (!selectedId || !selectedLabel) return;
        if (selectedLabel.sistema) {
            alert('Etiquetas padrão do sistema não podem ser editadas. Utilize "Copiar Etiqueta" para criar uma versão personalizada.');
            return;
        }
        setEditLabel(selectedLabel);
    };

    const handleEditSave = (novaDesc) => {
        labelsCrud.update(selectedId, { descricao: novaDesc });
        setEditLabel(null);
    };

    const handleRowSelect = (id) => setSelectedId(prev => prev === id ? null : id);

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modais */}
            {showCopyModal && <CopyLabelModal onSave={handleCopySave} onClose={() => setShowCopyModal(false)} />}
            {editLabel    && <EditDescModal  label={editLabel} onSave={handleEditSave} onClose={() => setEditLabel(null)} />}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">7.8 Gestor de Etiquetas</h1>
                    <p className="text-sm text-slate-500 font-medium">Gerencie templates de etiquetas do WMS VerticalParts</p>
                </div>
                <div className="bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total: {labels.length} etiquetas</span>
                </div>
            </div>

            {/* Barra de Ação */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setShowCopyModal(true)} className="px-4 py-2.5 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center gap-2">
                        <Copy className="w-4 h-4" aria-hidden="true" /> Copiar Etiqueta
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                    <button
                        onClick={handleEdit}
                        disabled={!selectedId}
                        aria-label="Alterar descrição da etiqueta selecionada"
                        className="px-4 py-2.5 bg-amber-50 text-amber-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-amber-600 hover:text-white transition-all border border-amber-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" /> Alterar
                    </button>
                    <button
                        onClick={handleToggleAtivo}
                        disabled={!selectedId}
                        aria-label={selectedLabel?.ativo ? 'Desativar etiqueta selecionada' : 'Ativar etiqueta selecionada'}
                        className={`px-4 py-2.5 font-black rounded-xl text-[10px] tracking-widest uppercase transition-all border disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 ${
                            selectedLabel?.ativo
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-600 hover:text-white hover:border-red-600'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white'
                        }`}
                    >
                        <Power className="w-3.5 h-3.5" aria-hidden="true" /> {selectedLabel?.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!selectedId}
                        aria-label="Excluir etiqueta selecionada"
                        className="px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all border border-red-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Excluir
                    </button>
                    <div className="flex-1" />
                    <div className="relative min-w-[200px]">
                        <label htmlFor="search-label" className="sr-only">Buscar etiqueta por descrição, tipo ou ID</label>
                        <input
                            id="search-label"
                            type="text"
                            placeholder="Procurar etiqueta..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-primary transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    </div>
                </div>
            </div>

            {/* Filtro de Status + DataGrid */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Filtro */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                    <Filter className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exibir:</span>
                    {['Todos', 'Ativado', 'Desativado'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                            aria-pressed={statusFilter === s}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-secondary text-primary shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-secondary'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[8px] uppercase font-black tracking-[0.15em] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th scope="col" className="px-4 py-4 w-12">ID</th>
                                <th scope="col" className="px-4 py-4">Descrição</th>
                                <th scope="col" className="px-4 py-4">Tipo Etiqueta</th>
                                <th scope="col" className="px-4 py-4 text-center">Personalizada</th>
                                <th scope="col" className="px-4 py-4 text-center">Ativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {paginated.length > 0 ? paginated.map(l => (
                                <tr
                                    key={l.id}
                                    role="row"
                                    tabIndex={0}
                                    aria-selected={selectedId === l.id}
                                    onClick={() => handleRowSelect(l.id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowSelect(l.id); } }}
                                    className={`cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedId === l.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    <td className="px-4 py-3.5 font-mono text-xs font-black text-secondary">#{l.id}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {l.sistema && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-label="Etiqueta padrão do sistema" />}
                                            <span className="font-black text-xs uppercase tracking-tight">{l.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="font-mono text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">{l.tipoEtiqueta}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {l.personalizada
                                            ? <Sparkles className="w-4 h-4 text-amber-500 mx-auto" aria-label="Personalizada" />
                                            : <span className="text-slate-300 text-xs" aria-label="Padrão">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${l.ativo ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                            {l.ativo
                                                ? <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                                                : <XCircle    className="w-2.5 h-2.5" aria-hidden="true" />
                                            }
                                            {l.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-16 text-center opacity-30">
                                        <span className="text-xs font-black uppercase tracking-widest">Nenhuma etiqueta encontrada</span>
                                    </td>
                                </tr>
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
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-secondary hover:text-primary transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                aria-label={`Ir para página ${i + 1}`}
                                aria-current={currentPage === i + 1 ? 'page' : undefined}
                                className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-secondary'}`}
                            >
                                {i + 1}
                            </button>
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
                                <FileCode className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                                <span className="text-xs font-bold font-mono truncate">{selectedLabel.arquivo}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Origem</p>
                            <span className={`inline-flex items-center gap-1.5 text-sm font-black ${selectedLabel.sistema ? 'text-blue-500' : 'text-amber-600'}`}>
                                {selectedLabel.sistema
                                    ? <><ShieldCheck className="w-4 h-4" aria-hidden="true" /> Sistema</>
                                    : <><Sparkles   className="w-4 h-4" aria-hidden="true" /> Personalizada</>
                                }
                            </span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Proteção</p>
                            {selectedLabel.sistema ? (
                                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Não pode ser excluída/editada
                                </p>
                            ) : (
                                <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Editável e removível
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
