import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  RefreshCcw, 
  ArrowDownCircle, 
  Trash2, 
  Plus,
  Save, 
  Zap,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Package
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function WeighingStation() {
  const { serialDevices } = useApp();
  // State
  const [mode, setMode] = useState('OUTBOUND'); // INBOUND or OUTBOUND
  const [activeScale, setActiveScale] = useState('');
  const [searchSku, setSearchSku] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(0.000);
  const [theoreticalWeight, setTheoreticalWeight] = useState(0.000);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Scales from context
  const scales = serialDevices.filter(d => d.tipo === 'balanca');

  useEffect(() => {
    if (scales.length > 0 && !activeScale) {
      setActiveScale(scales[0].nome);
    }
  }, [scales, activeScale]);

  // Fetch products for search autocomplete (simulated or real)
  const fetchProducts = async (term) => {
    if (term.length < 2) return;
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .ilike('sku', `%${term}%`)
        .limit(5);
      
      if (!error) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchSku) fetchProducts(searchSku);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchSku]);

  // Validation Engine
  useEffect(() => {
    if (selectedProduct && currentWeight > 0) {
      const target = selectedProduct.peso_bruto || 0;
      const diff = Math.abs(currentWeight - target);
      const tolerance = 0.010; // 10g tolerance for environmental factors

      if (diff <= tolerance) {
        setIsValidated(true);
        setIsBlocked(false);
      } else {
        setIsValidated(false);
        setIsBlocked(true);
      }
    } else {
      setIsValidated(false);
      setIsBlocked(false);
    }
  }, [currentWeight, selectedProduct]);

  const handleProductSelect = (p) => {
    setSelectedProduct(p);
    setTheoreticalWeight(p.peso_bruto || 0);
    setSearchSku(p.sku);
    setProducts([]);
  };

  const handleCapture = () => {
    if (!selectedProduct) {
      alert('Selecione um produto primeiro.');
      return;
    }
    setIsCapturing(true);
    // Simulate scale stabilization
    setTimeout(() => {
      // Logic: For demo, let's simulate a nearly perfect weight or a mismatch
      const shouldMatch = Math.random() > 0.3;
      const target = selectedProduct.peso_bruto || 10.00;
      const weight = shouldMatch ? target : target + (Math.random() - 0.5) * 0.5;
      
      setCurrentWeight(parseFloat(weight.toFixed(3)));
      setIsCapturing(false);
    }, 1200);
  };

  const handleZero = () => {
    setCurrentWeight(0.000);
    setIsBlocked(false);
    setIsValidated(false);
  };

  const handleSave = () => {
    if (isBlocked) {
      alert('PROCESSO BLOQUEADO: O peso capturado não confere com o cadastro do SKU. Corrija o produto ou a carga física.');
      return;
    }
    if (!isValidated) {
      alert('Capture um peso válido antes de salvar.');
      return;
    }
    alert(`Sucesso! Pesagem de ${selectedProduct.sku} confirmada e registrada com ${currentWeight} KG.`);
    // Reset after success
    setSelectedProduct(null);
    setSearchSku('');
    setCurrentWeight(0);
    setIsValidated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* ====== HEADER: TERMINAL INFO & MODE ====== */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
           <div className={cn(
             "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-colors",
             mode === 'INBOUND' ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-primary text-secondary shadow-primary/20"
           )}>
              <Scale className="w-8 h-8" aria-hidden="true" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2.3 Estação de Pesagem Interna (Max 100kg)</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                 Modo: <span className={mode === 'INBOUND' ? "text-blue-500" : "text-primary"}>{mode === 'INBOUND' ? 'RECEBIMENTO' : 'EXPEDIÇÃO / CHECK'}</span>
              </h1>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Mode Toggle */}
           <button 
             onClick={() => setMode(m => m === 'INBOUND' ? 'OUTBOUND' : 'INBOUND')}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-all group"
           >
              <ArrowRightLeft className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Trocar Operação</span>
           </button>

           <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Balança</p>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                 <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{activeScale || 'OFFLINE'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* ====== SEARCH & PRODUCT INFO ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search Panel */}
        <div className="lg:col-span-2 relative">
          <div className="bg-white dark:bg-slate-900 h-full rounded-[40px] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Identificar Produto / SKU</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <input 
                type="text"
                placeholder="DIGITE O SKU OU ESCANEIE O BARCODE"
                value={searchSku}
                onChange={(e) => setSearchSku(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[28px] py-7 pl-16 pr-8 text-2xl font-black text-primary placeholder:text-slate-300 focus:border-primary focus:bg-white outline-none transition-all shadow-inner tracking-widest uppercase"
              />
              {isLoadingProducts && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <RefreshCcw className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Autocomplete Results */}
            {products.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-[110%] mx-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[32px] overflow-hidden shadow-2xl py-2 animate-in slide-in-from-top-2">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProductSelect(p)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{p.sku}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{p.descricao}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Peso Master</p>
                      <p className="text-xs font-black text-primary">{p.peso_bruto ? p.peso_bruto.toFixed(3) : 'N/D'} KG</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Product Card */}
            {selectedProduct && (
              <div className="mt-8 p-6 bg-primary/5 rounded-[32px] border-2 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-primary/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Sku Master Ativo</p>
                    <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">{selectedProduct.sku}</h4>
                    <p className="text-xs font-medium text-slate-500">{selectedProduct.descricao}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-primary/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidade</p>
                    <p className="text-sm font-black text-primary uppercase">{selectedProduct.unidade || 'PC'}</p>
                  </div>
                  <div className="text-center px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-primary/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Variação Bal.</p>
                    <p className="text-sm font-black text-green-600">± 10g</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Status Panel */}
        <div className="flex flex-col gap-4">
          <div className={cn(
            "flex-1 rounded-[40px] border-4 p-8 flex flex-col items-center justify-center text-center transition-all duration-500",
            !selectedProduct ? "bg-slate-100 border-slate-200 opacity-60 dark:bg-slate-900 dark:border-slate-800" :
            isBlocked ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/50" :
            isValidated ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/30 dark:border-green-900/50" :
            "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50"
          )}>
            {!selectedProduct ? (
              <>
                <Search className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aguardando Produto</p>
              </>
            ) : isBlocked ? (
              <>
                <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/30 animate-bounce">
                  <Lock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black uppercase mb-2">BLOQUEADO</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Divergência Crítica detectada.<br/>O peso não confere!</p>
                <div className="mt-6 px-4 py-2 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-tighter">Erro: {Math.abs(currentWeight - theoreticalWeight).toFixed(3)} KG</div>
              </>
            ) : isValidated ? (
              <>
                <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black uppercase mb-2">VALIDADO</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest">Peso dentro da tolerância master.<br/>Liberação autorizada.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30 animate-pulse">
                  <RefreshCcw className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black uppercase mb-2">EM ANÁLISE</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest">Aguardando captura estável<br/>da balança serial.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ====== DIGITAL DISPLAYS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main LCD Display */}
        <div className="lg:col-span-2 relative group">
           <div className={cn(
             "absolute inset-0 rounded-[48px] blur-3xl opacity-40 transition-all duration-1000",
             isBlocked ? "bg-red-500/30" : isValidated ? "bg-green-500/30" : "bg-primary/30"
           )} />
           <div className="relative bg-slate-950 border-4 border-slate-800 rounded-[56px] h-[280px] flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div className={cn(
                "absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-all duration-500",
                isBlocked ? "from-red-600 via-red-400 to-red-600" : 
                isValidated ? "from-green-600 via-green-400 to-green-600" :
                "from-primary via-secondary to-primary"
              )} />
              
              <div className="flex flex-col items-center text-center">
                 <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.5em] mb-4">PESO EM TEMPO REAL</p>
                 <div className="flex items-baseline gap-3">
                    <span className={cn(
                      "font-black tracking-tighter transition-all duration-300 tabular-nums",
                      "text-[100px] leading-none",
                      isCapturing ? "text-primary/40 animate-pulse" : 
                      isBlocked ? "text-red-500" :
                      isValidated ? "text-green-500" : "text-primary"
                    )}>
                       {currentWeight.toFixed(3).replace('.', ',')}
                    </span>
                    <span className="text-3xl font-black text-slate-600 mb-2">KG</span>
                 </div>
              </div>

              <div className="absolute bottom-7 flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
                 <div className={cn("w-2 h-2 rounded-full", isCapturing ? "bg-amber-400 animate-pulse" : "bg-green-400 shadow-lg")} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Estabilidade: {isCapturing ? 'Lendo...' : '100%'}
                 </span>
              </div>
           </div>
        </div>

        {/* Info Displays */}
        <div className="space-y-4">
           {/* Master Weight Display */}
           <div className="bg-slate-950 border-2 border-slate-800 rounded-[40px] p-7 flex flex-col justify-center shadow-xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/40" />
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-primary/50 uppercase tracking-[0.3em] mb-1">PESO MASTER (SISTEMA)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary/80 tabular-nums">{theoreticalWeight.toFixed(3).replace('.', ',')}</span>
                    <span className="text-base font-black text-primary/40">KG</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">PRODUTOS CAPTURADOS</p>
                      <p className="text-2xl font-black text-white">01 <span className="text-xs text-slate-500">volumes</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-secondary tracking-widest">
                    <Zap className="w-3 h-3" />
                    Auto-save pronto
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* ====== ACTION CONTROLS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <button 
           onClick={handleCapture}
           disabled={isCapturing || !selectedProduct}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
         >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group">
               <ArrowDownCircle className="w-6 h-6 text-primary group-hover:animate-bounce" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capturar Peso</span>
         </button>

         <button 
           onClick={() => alert('Scanner de Volume Ativo. Bipe a etiqueta do volume...')}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-500/5 transition-all shadow-lg active:scale-95"
         >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
               <Zap className="w-6 h-6 text-blue-500" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ler Etiqueta</span>
         </button>

         <button 
           onClick={handleZero}
           className="h-28 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-danger hover:bg-danger/5 transition-all shadow-lg active:scale-95"
         >
            <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
               <Trash2 className="w-6 h-6 text-danger" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Zerar Balança</span>
         </button>

         <button 
           onClick={handleSave}
           disabled={!isValidated || isBlocked}
           className={cn(
             "h-28 rounded-[32px] flex flex-col items-center justify-center gap-2 transition-all shadow-xl active:scale-95",
             isBlocked ? "bg-red-600 cursor-not-allowed opacity-80" : 
             !isValidated ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400" :
             "bg-secondary text-primary hover:scale-[1.02] shadow-secondary/20"
           )}
         >
            <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
               {isBlocked ? <Lock className="w-6 h-6" /> : <Save className="w-6 h-6" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {isBlocked ? 'BLOQUEADO' : 'Salvar Pesagem'}
            </span>
         </button>
      </div>

    </div>
  );
}
