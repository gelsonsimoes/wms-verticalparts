import React, { useState, useEffect, useRef } from 'react';
import { 
  PackageSearch, 
  ArrowDownLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Save, 
  Search,
  AlertCircle,
  X,
  Lock,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const INITIAL_ITEMS = [
  { 
    id: '1', 
    ean: 'VPER-PNT-AL-22D-202X145-CT', 
    produto: 'Pente de Alumínio - 22 Dentes (202x145mm)', 
    qtdNF: 10, 
    qtdConferida: 0, 
    lote: '-', 
    validade: '-', 
    status: 'Pendente' 
  },
  { 
    id: '2', 
    ean: 'VEPEL-BTI-JX02-CCS', 
    produto: 'Botoeira de Inspeção - Mod. JX02', 
    qtdNF: 5, 
    qtdConferida: 0, 
    lote: '-', 
    validade: '-', 
    status: 'Pendente' 
  },
  { 
    id: '3', 
    ean: 'VPER-LUM-LED-VRD-24V', 
    produto: 'Luminária em LED Verde 24V', 
    qtdNF: 12, 
    qtdConferida: 0, 
    lote: '-', 
    validade: '-', 
    status: 'Pendente' 
  },
];

export default function ConferirRecebimento() {
  const [isStarted, setIsStarted] = useState(false);
  const [recebimentoId, setRecebimentoId] = useState('REC-2024-0892');
  const [nfe, setNfe] = useState('');
  const [items, setItems] = useState(INITIAL_ITEMS);
  
  const [scannedProduct, setScannedProduct] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageType, setDamageType] = useState('');
  
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorPassword, setSupervisorPassword] = useState('');
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const productInputRef = useRef(null);

  useEffect(() => {
    if (isStarted && productInputRef.current) {
      productInputRef.current.focus();
    }
  }, [isStarted]);

  const handleStart = () => {
    if (!nfe) return;
    setIsStarted(true);
  };

  const handleConfirmItem = (e) => {
    e.preventDefault();
    if (!scannedProduct || !currentQty) return;

    const itemIndex = items.findIndex(i => i.ean === scannedProduct || i.id === scannedProduct);
    
    if (itemIndex === -1) {
      alert("Produto não encontrado nesta NF-e.");
      return;
    }

    const item = items[itemIndex];
    const newQty = parseInt(currentQty);
    const totalConferida = item.qtdConferida + newQty;

    const performUpdate = () => {
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...item,
        qtdConferida: totalConferida,
        lote: lote || '-',
        validade: validade || '-',
        status: totalConferida === item.qtdNF ? 'Concluído' : totalConferida > item.qtdNF ? 'Divergente' : 'Pendente'
      };
      setItems(updatedItems);
      resetPanel();
    };

    if (totalConferida !== item.qtdNF) {
      setPendingUpdate(() => performUpdate);
      setIsSupervisorModalOpen(true);
    } else {
      performUpdate();
    }
  };

  const resetPanel = () => {
    setScannedProduct('');
    setCurrentQty('');
    setLote('');
    setValidade('');
    setIsDamaged(false);
    setDamageType('');
    if (productInputRef.current) productInputRef.current.focus();
  };

  const handleSupervisorApproval = () => {
    if (supervisorPassword === '1234') {
      if (pendingUpdate) pendingUpdate();
      setIsSupervisorModalOpen(false);
      setSupervisorPassword('');
      setPendingUpdate(null);
    } else {
      alert("Senha incorreta.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight border-l-4 border-primary pl-4">Conferir Recebimento</h1>
          <p className="text-sm text-slate-500">Conferência física de itens via leitor de código de barras</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Operação</span>
            <span className="text-sm font-bold text-slate-700 dark:text-white">{recebimentoId}</span>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={nfe} onChange={(e) => setNfe(e.target.value)}
              disabled={isStarted}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 min-w-[240px]"
            >
              <option value="">Selecione a NF-e...</option>
              <option value="NF-10293">NF-10293 - FORNECEDOR ABC LTDA</option>
              <option value="NF-88271">NF-88271 - LOGISTICA XYZ S.A</option>
            </select>
            <button 
              onClick={handleStart}
              disabled={isStarted || !nfe}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:grayscale disabled:opacity-50",
                isStarted ? "bg-slate-200 text-slate-500" : "bg-primary text-slate-950"
              )}
            >
              Iniciar
            </button>
          </div>
        </div>
      </div>

      {/* 2. PAINEL DE OPERAÇÃO */}
      <div className={cn(
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm transition-all duration-500",
        !isStarted && "opacity-50 pointer-events-none grayscale"
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <div className="relative">
              <PackageSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input 
                ref={productInputRef}
                value={scannedProduct}
                onChange={(e) => setScannedProduct(e.target.value)}
                placeholder="Bipe o Produto..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary rounded-2xl pl-14 pr-6 py-5 text-2xl font-black outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quantidade</label>
            <input 
              type="number" value={currentQty} onChange={(e) => setCurrentQty(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lote</label>
            <input 
              value={lote} onChange={(e) => setLote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Validade</label>
            <input 
              type="date" value={validade} onChange={(e) => setValidade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-primary/20 font-sans"
            />
          </div>
          <div className="lg:col-span-3 flex items-center justify-center pt-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span className={cn("text-xs font-bold uppercase transition-colors", isDamaged ? "text-danger" : "text-slate-400")}>Avaria?</span>
              <div 
                onClick={() => setIsDamaged(!isDamaged)}
                className={cn("w-12 h-6 rounded-full relative transition-all", isDamaged ? "bg-danger" : "bg-slate-200 dark:bg-slate-700")}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all transform", isDamaged ? "translate-x-7" : "translate-x-1")} />
              </div>
            </label>
          </div>

          {isDamaged && (
            <div className="lg:col-span-12 animate-in slide-in-from-top-2">
              <select 
                value={damageType} onChange={(e) => setDamageType(e.target.value)}
                className="w-full bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm font-bold text-danger outline-none"
              >
                <option value="">Tipo de Avaria...</option>
                <option value="Embalagem Danificada">Embalagem Danificada</option>
                <option value="Produto Quebrado">Produto Quebrado</option>
                <option value="Produto Molhado">Produto Molhado</option>
                <option value="Validade Vencida">Validade Vencida</option>
              </select>
            </div>
          )}

          <div className="lg:col-span-12 flex gap-3 mt-2">
            <button 
              onClick={handleConfirmItem}
              className="flex-1 bg-primary text-slate-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Confirmar Conferência
            </button>
            <button className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 p-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRID DE ITENS */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Itens da Nota Fiscal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/20">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">NF-e</th>
                <th className="px-6 py-4 text-center">Bipado</th>
                <th className="px-6 py-4 text-center">Dif.</th>
                <th className="px-6 py-4">Lote / Validade</th>
                <th className="px-6 py-4 text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {items.map((item) => {
                const dif = item.qtdConferida - item.qtdNF;
                const isDivergent = item.status === 'Divergente';
                return (
                  <tr key={item.id} className={cn("group transition-colors", isDivergent && "bg-danger/5")}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.produto}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter">{item.ean}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{item.qtdNF}</td>
                    <td className="px-6 py-4 text-center text-sm font-black text-slate-900 dark:text-white">{item.qtdConferida}</td>
                    <td className={cn(
                      "px-6 py-4 text-center text-xs font-black",
                      dif === 0 ? "text-slate-300" : dif > 0 ? "text-primary" : "text-danger"
                    )}>
                      {dif > 0 ? `+${dif}` : dif}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                      {item.lote} / {item.validade}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {isDivergent && <Lock className="w-3 h-3 text-danger animate-pulse" />}
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          item.status === 'Concluído' ? "bg-success/10 border-success/20 text-success" :
                          item.status === 'Divergente' ? "bg-danger/10 border-danger/20 text-danger" :
                          "bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-8 flex justify-end z-40">
        <button 
          disabled={!isStarted}
          className="bg-primary text-slate-900 px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:grayscale"
        >
          Finalizar Carga
        </button>
      </div>

      {/* MODAL SUPERVISOR */}
      {isSupervisorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center">
                <Lock className="text-danger w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Aprovação Necessária</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Divergência Detectada</p>
              </div>
              <input 
                type="password" placeholder="Senha Supervisor"
                value={supervisorPassword} onChange={(e) => setSupervisorPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-black outline-none focus:ring-2 focus:ring-danger/20"
              />
              <div className="flex w-full gap-3 mt-2">
                <button onClick={() => setIsSupervisorModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Sair</button>
                <button onClick={handleSupervisorApproval} className="flex-1 bg-danger text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-danger/20">Liberar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
