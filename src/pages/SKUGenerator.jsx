import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, Info, Copy, CheckCircle, QrCode, Trash2, 
  Settings, Layers, ChevronRight, Package, Scale, 
  Search, ShieldCheck, AlertCircle, RefreshCw, Save,
  Maximize2, FileText, Download, Printer, Sparkles, Loader2, Check, MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QRCodeCanvas } from 'qrcode.react';
import copy from 'copy-to-clipboard';
import { VP_TYPES, CATEGORIES, ATTRIBUTE_FIELDS, COMPATIBILITY } from '../constants/skuConstants';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function SKUGenerator() {
  const [vpType, setVpType] = useState('');
  const [category, setCategory] = useState('');
  const [attributes, setAttributes] = useState({});
  const [selectedCompatibility, setSelectedCompatibility] = useState([]);
  const [manualSku, setManualSku] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [chatHistory, setChatHistory] = useState([]);

  // Auto-generate SKU
  const generatedSku = useMemo(() => {
    const activeCatValue = manualCategory || category;
    if (!vpType || !activeCatValue) return '';

    const parts = [vpType, activeCatValue];
    
    // Convert attributes to parts
    const attrValues = [];
    const catObj = CATEGORIES.find(c => c.value === activeCatValue);
    
    if (catObj && catObj.attributes) {
      catObj.attributes.forEach(attrKey => {
        if (attributes[attrKey]) {
          attrValues.push(attributes[attrKey].toString().toUpperCase());
        }
      });
    }

    if (attrValues.length > 0) {
      if (['PTC', 'ROC', 'PORTA'].includes(activeCatValue)) {
        parts.push(attrValues.join('X'));
      } else {
        parts.push(attrValues.join('-'));
      }
    }

    if (selectedCompatibility.length > 0) {
      const compCodes = selectedCompatibility.map(c => c === 'GERAL' ? 'GER' : c);
      parts.push(compCodes.join('-'));
    }

    return parts.join('-').replace(/-+/g, '-');
  }, [vpType, category, attributes, selectedCompatibility, manualCategory]);

  useEffect(() => {
    setManualSku(generatedSku);
  }, [generatedSku]);

  const handleCopy = () => {
    copy(manualSku);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('sku-qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `SKU_${manualSku || 'QR'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setVpType('');
    setCategory('');
    setAttributes({});
    setSelectedCompatibility([]);
    setManualSku('');
    setShowQRCode(false);
    setStep(1);
    setManualReference('');
    setAdditionalDetails('');
    setManualCategory('');
    setGeneratedDescription('');
    setChatHistory([]);
  };

  const generateAIDescription = async () => {
    if (!additionalDetails) return;
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api_ia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpType,
          category: manualCategory || category,
          attributes,
          selectedCompatibility,
          manualReference,
          additionalDetails,
          manualSku,
          history: chatHistory
        })
      });
      const data = await response.json();
      if (data.description) {
        setGeneratedDescription(data.description);
        setChatHistory(prev => [
          ...prev, 
          { role: 'user', content: additionalDetails },
          { role: 'assistant', content: data.description }
        ]);
        setAdditionalDetails('');
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
      alert("Falha ao conversar com a IA. Certifique-se que o motor api_ia.php está presente.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clearAIDescription = () => {
    setGeneratedDescription('');
    setChatHistory([]);
  };

  const handleCompatibilityToggle = (value) => {
    setSelectedCompatibility(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleAttributeChange = (key, value) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const activeCategory = CATEGORIES.find(c => c.value === category);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col gap-6 print:bg-white print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              7.9 Gerador de SKU
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Padronização técnica conforme I.T. 600 · VerticalParts Engenharia
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={resetForm} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 transition-all shadow-sm">
             <Trash2 className="w-5 h-5" />
           </button>
           <button className="px-6 py-3 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 active:scale-95">
             <Save className="w-4 h-4" />
             Salvar Produto
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 print:hidden">
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black">1</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Identificador VP</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VP_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => { setVpType(type.value); setStep(2); }}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                    vpType === type.value ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  )}
                >
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{type.label}</span>
                  <p className="text-[10px] text-slate-500 leading-tight">{type.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={cn("bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm", !vpType && "opacity-40 grayscale pointer-events-none")}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-black">2</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Categoria e Atributos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <select value={category} onChange={e => { setCategory(e.target.value); setAttributes({}); }} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-amber-400">
                  <option value="">Selecione...</option>
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-700">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Não encontrou a categoria?</p>
                   <input 
                     value={manualCategory}
                     onChange={e => { setManualCategory(e.target.value.toUpperCase()); if (e.target.value) setCategory(''); }}
                     placeholder="Ex: FIX - Fixador"
                     className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                   />
                </div>
              </div>
              <div className="md:col-span-7 space-y-4">
                {category && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCategory?.attributes?.map(attrKey => {
                      const field = ATTRIBUTE_FIELDS[attrKey];
                      return field && (
                        <div key={attrKey} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{field.label}</label>
                          {field.type === 'select' ? (
                            <select value={attributes[attrKey] || ''} onChange={e => handleAttributeChange(attrKey, e.target.value)} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-black">
                              <option value="">Selecione...</option>
                              {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <input value={attributes[attrKey] || ''} onChange={e => handleAttributeChange(attrKey, e.target.value)} placeholder={field.placeholder} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-black" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={cn("bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-20", !category && !manualCategory && "opacity-40 grayscale pointer-events-none")}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-black">3</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Compatibilidade</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {COMPATIBILITY.map(brand => (
                <button key={brand.value} onClick={() => handleCompatibilityToggle(brand.value)} className={cn("px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all", selectedCompatibility.includes(brand.value) ? "border-orange-400 bg-orange-50 text-orange-600" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400")}>
                  {brand.label}
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3 h-3" /> Referência Complementar</label>
               <textarea value={manualReference} onChange={e => setManualReference(e.target.value)} placeholder="Ex: Ref.: CCO - XIZI / AK13" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold min-h-[80px]" />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit print:col-span-12">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-4 border-slate-800 print:bg-white print:text-black">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">SKU Gerado</p>
             <div className="relative group">
               <input value={manualSku} onChange={e => setManualSku(e.target.value.toUpperCase())} className="w-full bg-transparent text-2xl font-black font-mono tracking-tighter text-amber-400 outline-none pr-10" placeholder="AGUARDANDO..." />
               <button onClick={handleCopy} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg">
                 {isCopied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-500" />}
               </button>
             </div>
             <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Validação I.T. 600</span>
                  <div className="flex items-center gap-1.5 mt-1">
                     <ShieldCheck className={cn("w-3.5 h-3.5", manualSku ? "text-green-500" : "text-slate-700")} />
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", manualSku ? "text-slate-300" : "text-slate-700")}>{manualSku ? "VÁLIDO" : "PENDENTE"}</span>
                  </div>
                </div>
                <button onClick={() => setShowQRCode(!showQRCode)} disabled={!manualSku} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg", showQRCode ? "bg-amber-400 text-black" : "bg-slate-800 text-slate-400 disabled:opacity-30")}>
                  <QrCode className="w-6 h-6" />
                </button>
             </div>
          </div>

          {showQRCode && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center gap-6 border-2 border-amber-300 shadow-xl animate-in zoom-in-95">
               <QRCodeCanvas id="sku-qr-code" value={manualSku || 'PENDENTE'} size={200} level="H" includeMargin={true} />
               <div className="flex gap-2 w-full">
                 <button onClick={handlePrint} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Imprimir</button>
                 <button onClick={downloadQRCode} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download</button>
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Técnica</h3>
               {generatedDescription && <button onClick={clearAIDescription} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><RefreshCw className="w-3.5 h-3.5" /></button>}
             </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info className="w-3 h-3" /> {generatedDescription ? "Refinar Descrição (Modo Chat)" : "Detalhes Adicionais (IA)"}</label>
                    <textarea 
                      value={additionalDetails} 
                      onChange={e => setAdditionalDetails(e.target.value)} 
                      placeholder={generatedDescription ? "Peça um ajuste ou mais detalhes..." : "Fale com o assistente do WMS (ex: 'Olá' ou 'Gerar rolamento')..."} 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl p-3 text-[11px] font-medium min-h-[60px] outline-none focus:border-amber-400" 
                    />
                 </div>
                 <button onClick={generateAIDescription} disabled={isGeneratingAI || !additionalDetails} className="w-full py-4 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                   {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedDescription ? <MessageSquare className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                   {isGeneratingAI ? 'IA Processando...' : generatedDescription ? 'Refinar com IA' : 'Conversar com IA'}
                 </button>
                 <div className="relative group/desc">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
                       {isGeneratingAI ? (
                         <div className="flex flex-col items-center justify-center py-8 gap-3 animate-pulse text-center">
                            <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA redigindo descrição...</p>
                         </div>
                       ) : generatedDescription ? (
                         <textarea value={generatedDescription} onChange={e => setGeneratedDescription(e.target.value)} className="w-full bg-transparent text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed outline-none min-h-[180px] resize-none border-none focus:ring-0" />
                       ) : (
                         <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            <strong className="text-slate-900 dark:text-white not-italic uppercase block mb-1">
                              {manualCategory || activeCategory?.label || 'Componente'} ({manualCategory || activeCategory?.value || 'CAT'})
                            </strong>
                            Produto técnico padronizado para {manualSku?.startsWith('VPEL') ? 'ELEVADORES' : 'ESCADA ROLANTE'}.
                         </div>
                       )}
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-200 mt-20">
         <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WMS VerticalParts v4.3.2 · Engine de Padronização</span>
         </div>
      </div>
    </div>
  );
}
