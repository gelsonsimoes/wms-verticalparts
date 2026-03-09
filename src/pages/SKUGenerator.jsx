import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, Info, Copy, CheckCircle, QrCode, Trash2, 
  Settings, Layers, ChevronRight, Package, Scale, 
  Search, ShieldCheck, AlertCircle, RefreshCw, Save,
  Maximize2, FileText, Download, Printer, Sparkles, Loader2, Check
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
      // Special logic for some categories (e.g. dimensions X separator)
      if (['PTC', 'ROC', 'PORTA'].includes(activeCatValue)) {
        parts.push(attrValues.join('X'));
      } else {
        parts.push(attrValues.join('-'));
      }
    }

    // Add compatibility
    if (selectedCompatibility.length > 0) {
      // Use GER instead of GERAL if that's what's selected
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
  };

  const generateAIDescription = async () => {
    if (!manualSku) return;
    
    setIsGeneratingAI(true);
    try {
      const response = await fetch('http://72.61.37.129:3001/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpType,
          category: manualCategory || category,
          attributes,
          selectedCompatibility,
          manualReference,
          additionalDetails
        })
      });

      const data = await response.json();
      if (data.description) {
        setGeneratedDescription(data.description);
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
    } finally {
      setIsGeneratingAI(false);
    }
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
           <button 
             onClick={resetForm}
             className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 transition-all shadow-sm"
             title="Limpar formulário"
           >
             <Trash2 className="w-5 h-5" />
           </button>
           <button 
             className="px-6 py-3 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 active:scale-95"
           >
             <Save className="w-4 h-4" />
             Salvar Produto
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 flex flex-col gap-6 print:hidden">
          
          {/* Step 1: VP Type */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Settings className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black">1</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Identificador VP</h2>
              <div className="group relative ml-auto">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700">
                   Define a natureza do produto conforme a política de inventário da empresa.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VP_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => { setVpType(type.value); setStep(2); }}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                    vpType === type.value 
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10 ring-4 ring-amber-400/10" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{type.label}</span>
                    {vpType === type.value && <CheckCircle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight pr-4">{type.description}</p>
                  <div className="absolute bottom-[-10px] right-[-10px] opacity-0 group-hover:opacity-10 transition-opacity">
                    <ChevronRight className="w-12 h-12" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Category & Attributes */}
          <section className={cn(
            "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all duration-500",
            !vpType && "opacity-40 grayscale pointer-events-none"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-black">2</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Categoria e Atributos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Category Selector */}
              <div className="md:col-span-5 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Tipo de Componente
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select 
                    value={category} 
                    onChange={e => { setCategory(e.target.value); setAttributes({}); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-amber-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label} ({cat.value})</option>
                    ))}
                  </select>
                </div>
                
                {/* Custom Category Tag */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Não encontrou a categoria?</p>
                   <div className="relative">
                      <input 
                        value={manualCategory}
                        onChange={e => {
                          const val = e.target.value.toUpperCase();
                          setManualCategory(val);
                          if (val) setCategory(''); // Clear dropdown if typing manual
                        }}
                        placeholder="Ex: FIX - Fixador"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-purple-400"
                      />
                   </div>
                </div>
              </div>

              {/* Dynamic Attributes */}
              <div className="md:col-span-7 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Características Técnicas
                </label>
                
                {!category ? (
                   <div className="h-full min-h-[160px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Aguardando seleção de categoria</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    {activeCategory?.attributes?.map(attrKey => {
                      const field = ATTRIBUTE_FIELDS[attrKey];
                      if (!field) return null;

                      if (field.type === 'select') {
                        return (
                          <div key={attrKey} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">{field.label}</label>
                            <select 
                              value={attributes[attrKey] || ''}
                              onChange={e => handleAttributeChange(attrKey, e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-black outline-none focus:border-amber-400 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Selecione...</option>
                              {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      return (
                        <div key={attrKey} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">{field.label}</label>
                          <input 
                            value={attributes[attrKey] || ''}
                            onChange={e => handleAttributeChange(attrKey, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs font-black outline-none focus:border-amber-400 transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 3: Compatibility */}
          <section className={cn(
            "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-20",
            !category && "opacity-40 grayscale pointer-events-none"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-black">3</div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Compatibilidade e Outras Marcas</h2>
              <div className="group relative ml-auto">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700">
                   Selecione as marcas/modelos compatíveis. O SKU será estendido com estes códigos.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {COMPATIBILITY.map(brand => (
                <button
                  key={brand.value}
                  onClick={() => handleCompatibilityToggle(brand.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                    selectedCompatibility.includes(brand.value)
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-600"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:border-slate-300"
                  )}
                >
                  {brand.label}
                </button>
              ))}
              
              <div className="p-1 px-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 max-w-[150px]">
                 <Search className="w-3 h-3 text-slate-400" />
                 <input 
                   placeholder="Outra Ref..."
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.target.value) {
                       handleCompatibilityToggle(e.target.value.toUpperCase());
                       e.target.value = '';
                     }
                   }}
                   className="bg-transparent text-[10px] font-bold text-slate-600 outline-none w-full"
                 />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Referência Complementar (Ref.:)
               </label>
               <textarea 
                 value={manualReference}
                 onChange={e => setManualReference(e.target.value)}
                 placeholder="Ex: Ref.: CCO - XIZI / AK13"
                 className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-400 min-h-[80px]"
               />
               <p className="text-[9px] text-slate-400">Este texto aparecerá na descrição, mas não será incluído no SKU.</p>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit print:col-span-12 print:static">
          
          {/* Real-time SKU Display */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden border-4 border-slate-800 print:bg-white print:text-black print:shadow-none print:border-none print:p-4">
             <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden">
               <Zap className="w-24 h-24 text-amber-500" />
             </div>
             
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 print:text-slate-400">SKU Gerado</p>
             
             <div className="relative group">
               <input 
                 value={manualSku}
                 onChange={e => setManualSku(e.target.value.toUpperCase())}
                 className="w-full bg-transparent text-2xl md:text-3xl font-black font-mono tracking-tighter text-amber-400 outline-none pr-10 print:text-black print:text-xl"
                 placeholder="AGUARDANDO..."
               />
               <button 
                 onClick={handleCopy}
                 className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors print:hidden"
                 title="Copiar SKU"
               >
                 {isCopied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-500" />}
               </button>
             </div>
             
             <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6 print:border-slate-100 print:mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase print:text-slate-400">Validação I.T. 600</span>
                  <div className="flex items-center gap-1.5 mt-1">
                     <ShieldCheck className={cn("w-3.5 h-3.5", manualSku ? "text-green-500" : "text-slate-700")} />
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", manualSku ? "text-slate-300 print:text-black" : "text-slate-700")}>
                        {manualSku ? "VÁLIDO" : "PENDENTE"}
                     </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setShowQRCode(!showQRCode); if (!showQRCode) setStep(3); }}
                  disabled={!manualSku}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg print:hidden",
                    showQRCode 
                      ? "bg-amber-400 text-black" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:grayscale"
                  )}
                  title="Gerar QR Code"
                >
                  <QrCode className="w-6 h-6" />
                </button>
             </div>
          </div>

          {/* QR Code Output */}
          {showQRCode && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col items-center gap-6 border-2 border-amber-300 dark:border-amber-900 shadow-xl animate-in zoom-in-95 duration-300 print:border-none print:shadow-none print:p-2">
               <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm print:border-none">
                 <QRCodeCanvas 
                   id="sku-qr-code"
                   value={manualSku || 'PENDENTE'} 
                   size={200}
                   level="H"
                   includeMargin={true}
                 />
               </div>
               <div className="flex gap-2 w-full print:hidden">
                 <button 
                   onClick={handlePrint}
                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 flex items-center justify-center gap-2"
                 >
                   <Printer className="w-4 h-4" />
                   Imprimir
                 </button>
                 <button 
                   onClick={downloadQRCode}
                   className="flex-1 py-3 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center justify-center gap-2"
                 >
                   <Download className="w-4 h-4" />
                   Download
                 </button>
               </div>
               <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-black print:hidden">
                  Aponte a câmera para ler o SKU
               </p>
            </div>
          )}

          {/* Description Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Técnica</h3>
               <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                 <RefreshCw className="w-3.5 h-3.5" />
               </button>
             </div>
             
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Info className="w-3 h-3" /> Detalhes Adicionais (IA)
                    </label>
                    <textarea 
                      value={additionalDetails}
                      onChange={e => setAdditionalDetails(e.target.value)}
                      placeholder="Fale mais sobre este item: aplicação, particularidades..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] font-medium outline-none focus:border-amber-400 min-h-[60px]"
                    />
                 </div>

                 <button 
                   onClick={generateAIDescription}
                   disabled={!manualSku || isGeneratingAI}
                   className="w-full py-4 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                 >
                   {isGeneratingAI ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <Sparkles className="w-4 h-4 text-amber-400" />
                   )}
                   {isGeneratingAI ? 'Gerando...' : 'Gerar Descrição com IA'}
                 </button>

                 <div className="relative group/desc">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
                      {generatedDescription ? (
                        <textarea 
                          value={generatedDescription}
                          onChange={e => setGeneratedDescription(e.target.value)}
                          className="w-full bg-transparent text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed outline-none min-h-[180px] resize-none"
                        />
                      ) : (
                        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                           <strong className="text-slate-900 dark:text-white not-italic uppercase block mb-1">
                             {activeCategory?.label || 'Componente'} ({activeCategory?.value || 'CAT'})
                           </strong>
                           Produto técnico padronizado para {manualSku?.startsWith('VPEL') ? 'ELEVADORES' : 'ESCADA ROLANTE'}. 
                           Possui características de {Object.entries(attributes).map(([k, v]) => `${ATTRIBUTE_FIELDS[k]?.label}: ${v}`).join(', ')}.
                           Compatível com sistemas {selectedCompatibility.join(' / ') || 'Multimarcas'}.
                           {manualReference && <span className="block mt-2 font-bold text-slate-500">{manualReference}</span>}
                        </div>
                      )}
                    </div>
                    {generatedDescription && (
                      <button 
                        onClick={() => { copy(generatedDescription); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
                        className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 opacity-0 group-hover/desc:opacity-100 transition-opacity"
                        title="Copiar texto gerado"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    )}
                 </div>
                 
                 {!generatedDescription && (
                    <p className="text-[9px] text-slate-400 text-center italic">
                       A visualização acima é um resumo. Use o botão de IA para uma descrição completa e técnica.
                    </p>
                 )}
              </div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 mt-20">
         <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WMS VerticalParts v4.2 · Engine de Padronização</span>
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>Sincronizado</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
         </div>
      </div>
    </div>
  );
}
