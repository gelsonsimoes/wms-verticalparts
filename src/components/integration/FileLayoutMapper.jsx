import React, { useState } from 'react';
import { 
    UploadCloud, 
    Check, 
    X, 
    Save, 
    Table, 
    ArrowRight, 
    FileText,
    Eye,
    AlertCircle,
    Download,
    History,
    FileSearch
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import mappingService from '../../services/mappingService';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const WMS_FIELDS = [
  { id: 'sku', label: 'SKU (Código do Produto)', required: true },
  { id: 'quantity', label: 'Quantidade', required: true },
  { id: 'description', label: 'Descrição', required: false },
  { id: 'nfe', label: 'Nota Fiscal', required: false },
  { id: 'batch', label: 'Lote', required: false },
  { id: 'expiry', label: 'Validade', required: false },
  { id: 'price', label: 'Preço Unitário', required: false },
];

const MOCK_PREVIEW_DATA = [
    { sku: 'VP-990-X', quantity: '42', description: 'Amortecedor Hidráulico', nfe: '00192', price: 'R$ 450,00' },
    { sku: 'VP-112-B', quantity: '10', description: 'Filtro de Óleo Premium', nfe: '00193', price: 'R$ 89,90' },
    { sku: 'VP-445-Z', quantity: '5', description: 'Pastilha de Freio Cerâmica', nfe: '00194', price: 'R$ 210,00' },
];

export default function FileLayoutMapper() {
    const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Success
    const [fileName, setFileName] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [mappings, setMappings] = useState({});
    const [detectedColumns, setDetectedColumns] = useState(['Coluna A', 'Coluna B', 'Coluna C', 'Coluna D', 'Coluna E']);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleUpload = () => {
        setFileName("layout_vendas_omie.csv");
        setStep(2);
    };

    const handleMappingChange = (fieldId, columnValue) => {
        setMappings(prev => ({ ...prev, [fieldId]: columnValue }));
    };

    const handleSave = () => {
        const template = {
            name: templateName || `Layout ${fileName}`,
            mappings,
            fileName,
            wmsFields: WMS_FIELDS.length
        };
        mappingService.saveTemplate(template);
        setStep(3);
    };

    const isReadyToSave = WMS_FIELDS.filter(f => f.required).every(f => mappings[f.id] && mappings[f.id] !== 'ignore');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header & Steps */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black italic">Ferramenta de Automação de Layouts (ETL)</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure como o WMS deve ler seus arquivos externos</p>
                </div>
                <div className="flex items-center gap-3">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[10px] transition-all",
                                step >= s ? "bg-secondary text-primary shadow-lg shadow-secondary/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                            )}>{s}</div>
                            {s < 3 && <div className="w-6 h-1 bg-slate-100 dark:bg-slate-900 rounded-full" />}
                        </div>
                    ))}
                </div>
            </div>

            {step === 1 && (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm border-b-8 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-8 group">
                    <div className="w-24 h-24 bg-primary text-secondary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500 relative">
                        <UploadCloud className="w-10 h-10" />
                        <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black italic text-primary">Carregar Arquivo Modelo</h3>
                        <p className="max-w-md text-sm text-slate-500 font-medium">Extrairemos o cabeçalho do arquivo para que você possa associar os campos sem precisar de programação.</p>
                    </div>
                    <button 
                        onClick={handleUpload}
                        className="py-4 px-12 bg-secondary text-primary font-black rounded-2xl text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/20 flex items-center gap-3"
                    >
                        <FileSearch className="w-5 h-5" /> Selecionar Arquivo CSV/Excel
                    </button>
                    <div className="flex gap-6 opacity-40">
                         <div className="flex items-center gap-2 text-[8px] font-black uppercase">CSV Standard</div>
                         <div className="flex items-center gap-2 text-[8px] font-black uppercase">XLSX v4.x</div>
                         <div className="flex items-center gap-2 text-[8px] font-black uppercase">TXT Delimited</div>
                    </div>

                    {/* Meus Templates */}
                    <div className="w-full max-w-2xl mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> Meus Templates Salvos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mappingService.getTemplates().length > 0 ? (
                                mappingService.getTemplates().map(t => (
                                    <div key={t.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-primary">{t.name}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{t.fileName} • {t.date}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => mappingService.deleteTemplate(t.id)}
                                            className="p-2 text-slate-300 hover:text-danger hover:bg-danger/5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">Nenhum template salvo ainda.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Mapping List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-all">
                                         <Table className="w-5 h-5 text-secondary" />
                                     </div>
                                     <div>
                                         <h4 className="text-sm font-black italic">Associação de Colunas</h4>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layout Detectado: {fileName}</p>
                                     </div>
                                </div>
                                <span className="text-[9px] font-black bg-danger/10 text-danger px-2 py-1 rounded-lg border border-danger/20 uppercase animate-pulse">Campos Obrigatórios Pendentes: {WMS_FIELDS.filter(f => f.required && (!mappings[f.id] || mappings[f.id] === 'ignore')).length}</span>
                            </div>
                            <div className="p-0 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-8 py-5">Campo Interno (WMS)</th>
                                            <th className="px-8 py-5 text-center"><ArrowRight className="w-4 h-4 mx-auto opacity-30" /></th>
                                            <th className="px-8 py-5">Coluna Vinculada (Arquivo)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {WMS_FIELDS.map(field => (
                                            <tr key={field.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                                            field.required ? "bg-danger animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                                                        )} />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-primary group-hover:translate-x-1 transition-transform">{field.label}</span>
                                                            {field.required && <span className="text-[8px] font-black text-danger uppercase">Obrigatório</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <select 
                                                        className={cn(
                                                            "w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl px-5 py-3 text-xs font-black outline-none transition-all cursor-pointer appearance-none",
                                                            mappings[field.id] && mappings[field.id] !== 'ignore' 
                                                                ? "border-secondary text-primary shadow-lg shadow-secondary/5" 
                                                                : "border-slate-200 dark:border-slate-700 text-slate-400"
                                                        )}
                                                        value={mappings[field.id] || "ignore"}
                                                        onChange={(e) => handleMappingChange(field.id, e.target.value)}
                                                    >
                                                        <option value="ignore">-- Ignorar esta coluna --</option>
                                                        {detectedColumns.map(col => (
                                                            <option key={col} value={col}>{col} (Ex: Value...)</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Preview & Save Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-primary rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4">Ações do Mapeamento</h4>
                                    <button
                                        disabled={!isReadyToSave}
                                        onClick={handleSave}
                                        className={cn(
                                            "w-full py-5 font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl",
                                            isReadyToSave 
                                                ? "bg-secondary text-primary hover:scale-105 active:scale-95 shadow-secondary/20" 
                                                : "bg-white/10 text-white/20 cursor-not-allowed"
                                        )}
                                    >
                                        <Save className="w-5 h-5 text-secondary group-hover:animate-bounce" /> Salvar Layout
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Nome do Template</p>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Omie Vendas v1.0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-secondary transition-all"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                    />
                                </div>

                                <button 
                                    onClick={() => setShowPreviewModal(true)}
                                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10"
                                >
                                    <Eye className="w-5 h-5 text-secondary" /> Testar (Preview)
                                </button>

                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <History className="w-4 h-4 text-secondary" />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/60 leading-tight">
                                            Última alteração: <br/> <span className="text-white">Não salvo</span>
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                                        <p className="text-[9px] font-medium text-white/50 italic">
                                            Dica: Certifique-se de que o separador do seu CSV seja o ';' para evitar erros de parser.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm border-b-8 border-slate-100">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                               <FileText className="w-4 h-4" /> Resumo do Destino
                           </h4>
                           <div className="space-y-6">
                               <div className="flex justify-between items-center group/item">
                                   <div className="flex flex-col">
                                       <span className="text-[9px] font-black text-slate-400 uppercase">Documento</span>
                                       <span className="font-bold text-sm">Pedido de Venda (EDI)</span>
                                   </div>
                                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:text-secondary transition-colors">
                                       <ArrowRight className="w-4 h-4" />
                                   </div>
                               </div>
                               <div className="flex justify-between items-center group/item">
                                   <div className="flex flex-col">
                                       <span className="text-[9px] font-black text-slate-400 uppercase">Aderência</span>
                                       <span className="font-bold text-sm">{Math.round((Object.keys(mappings).length / WMS_FIELDS.length) * 100)}% Mapeado</span>
                                   </div>
                                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:text-secondary transition-colors">
                                       <Check className="w-4 h-4" />
                                   </div>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white dark:bg-slate-800 p-16 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-10 border-b-8 border-success/30 animate-in zoom-in duration-700 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className="relative">
                            <div className="w-36 h-36 bg-success text-white rounded-[3rem] flex items-center justify-center shadow-3xl shadow-success/40 scale-110 relative z-10 border-4 border-white dark:border-slate-800">
                                <Check className="w-20 h-20 stroke-[4]" />
                            </div>
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-secondary text-primary rounded-[2.5rem] flex items-center justify-center font-black animate-bounce shadow-2xl text-2xl">
                               🚀
                            </div>
                            <div className="absolute inset-0 bg-success/20 rounded-full blur-3xl animate-pulse" />
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-4xl font-black italic text-primary leading-tight">Layout Configurado <br/> com Sucesso!</h3>
                            <p className="max-w-md text-sm text-slate-500 font-black uppercase tracking-widest opacity-60">Os novos arquivos serão processados automaticamente</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setStep(1)}
                                className="py-5 px-12 bg-slate-100 dark:bg-slate-900 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-800"
                            >
                                Sair do Mapeador
                            </button>
                            <button 
                                className="py-5 px-12 bg-primary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 group"
                            >
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> Baixar Template v1.0
                            </button>
                        </div>
                    </div>
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] shadow-3xl relative overflow-hidden flex flex-col border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="p-10 border-b-8 border-secondary bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl">
                                    <Eye className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tight">Simulação de Dados (ETL)</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Visualizando 3 primeiras linhas do mapeamento atual</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="p-3 bg-white/10 hover:bg-danger text-white rounded-2xl transition-all">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="p-10 overflow-x-auto">
                            <table className="w-full text-left order-collapse bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] overflow-hidden">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">SKU (Mapeado)</th>
                                        <th className="px-8 py-5">Qtd</th>
                                        <th className="px-8 py-5">Descrição</th>
                                        <th className="px-8 py-5">Nota Fiscal</th>
                                        <th className="px-8 py-5 text-right">Preço</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {MOCK_PREVIEW_DATA.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-secondary rounded-full" />
                                                    <span className="font-black text-primary dark:text-white uppercase">{row.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">{row.quantity} UN</td>
                                            <td className="px-8 py-6 italic opacity-70">{row.description}</td>
                                            <td className="px-8 py-6">
                                                <span className="bg-slate-200 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 font-mono text-[10px]">
                                                    NFe-{row.nfe}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-secondary">{row.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-8 p-6 bg-info/5 rounded-2xl border border-info/20 flex items-center gap-4 animate-pulse">
                                <AlertCircle className="w-6 h-6 text-info" />
                                <p className="text-xs font-bold text-info italic">
                                    Importante: Estes dados são temporários para validação de layout. Nenhuma alteração real de estoque foi efetuada.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setShowPreviewModal(false)}
                                className="py-4 px-12 bg-primary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                            >
                                Voltar ao Mapeamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
