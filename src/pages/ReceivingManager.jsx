import React, { useState, useEffect, useRef } from 'react';
import { 
  PackageSearch, 
  Filter, 
  Calendar, 
  FileText, 
  Boxes, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RotateCcw, 
  BarChart3, 
  ChevronRight, 
  Barcode, 
  Hash, 
  X, 
  Save, 
  Lock, 
  Zap,
  MoreVertical,
  ClipboardList,
  History,
  AlertTriangle,
  Camera,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======

const MOCK_RECEIVING = [
  { id: 'OR-55920', depositante: 'VerticalParts Matriz', tipo: 'Compra Nacional', status: 'Pendente', data: '22/02/2026', totalItens: 45, conferidos: 0 },
  { id: 'OR-55921', depositante: 'VerticalParts Matriz', tipo: 'Devolução Cliente', status: 'Aguardando Alocação', data: '22/02/2026', totalItens: 12, conferidos: 12 },
  { id: 'OR-55925', depositante: 'VParts Import Export', tipo: 'Importação Direta', status: 'Pendente', data: '21/02/2026', totalItens: 120, conferidos: 45 },
  { id: 'OR-55890', depositante: 'VerticalParts Matriz', tipo: 'Compra Nacional', status: 'Finalizada', data: '20/02/2026', totalItens: 88, conferidos: 88 },
];

const STATUS_COLORS = {
  'Pendente': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'Aguardando Alocação': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Finalizada': 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
};

// ====== SUB-COMPONENTE: TOOLBAR BUTTON ======

const ToolbarButton = ({ label, icon: Icon, onClick, color = "slate", disabled = false, badge }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all min-w-[90px] group relative",
      disabled ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50" : 
      color === "secondary" ? "border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary hover:text-primary hover:border-secondary" :
      "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10"
    )}
  >
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors group-hover:bg-white/10">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight whitespace-nowrap">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
        {badge}
      </span>
    )}
  </button>
);

// ====== COMPONENTE PRINCIPAL ======

export default function ReceivingManager() {
  const [filterStatus, setFilterStatus] = useState('Pendente');
  const [filterPeriod, setFilterPeriod] = useState('1 dia');
  const [selectedOR, setSelectedOR] = useState(null);
  const [showBlindModal, setShowBlindModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  
  // Blind Check State
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lastScan, setLastScan] = useState(null);
  const scanInputRef = useRef(null);

  useEffect(() => {
    if (showBlindModal && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [showBlindModal]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!barcode) return;
    
    // Simulação de bipagem
    setLastScan({ sku: 'VEPEL-BPI-174FX', desc: 'Kit de Pastilhas de Freio - VParts', barcode });
    setBarcode('');
    if (scanInputRef.current) scanInputRef.current.focus();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ====== HEADER & MASTER FILTERS ====== */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <PackageSearch className="w-8 h-8 text-secondary" /> Gerenciador de Recebimento
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Chão de fábrica: Conferência cega e alocação dinâmica</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
            {['Pendente', 'Aguardando Alocação', 'Finalizada'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                  filterStatus === s 
                    ? "bg-secondary text-primary shadow-lg shadow-black/10" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm gap-2">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            {['1 dia', '3 dias', '7 dias'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all",
                  filterPeriod === p ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====== TOOLBAR: AÇÕES RÁPIDAS ====== */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm overflow-x-auto">
        <div className="flex items-start gap-8 min-w-max">
          
          {/* Grupo Controle */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Controle</p>
            <div className="flex gap-3">
              <ToolbarButton label="Nota Fiscal" icon={FileText} disabled={!selectedOR} />
              <ToolbarButton label="Produtos" icon={Boxes} disabled={!selectedOR} />
              <ToolbarButton label="Gerar Picking" icon={Zap} disabled={!selectedOR} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Conferência */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Conferência</p>
            <div className="flex gap-3">
              <ToolbarButton 
                label="Conferência Cega" 
                icon={Barcode} 
                color="secondary" 
                disabled={!selectedOR || filterStatus === 'Finalizada'} 
                onClick={() => setShowBlindModal(true)}
              />
              <ToolbarButton label="Recontagem" icon={RotateCcw} disabled={!selectedOR} />
              <ToolbarButton label="Divergência" icon={AlertTriangle} disabled={!selectedOR} badge="!" />
              <ToolbarButton label="Finalizar" icon={CheckCircle2} color="secondary" disabled={!selectedOR} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Alocação */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Alocação</p>
            <div className="flex gap-3">
              <ToolbarButton label="Gerar Alocação" icon={Truck} disabled={!selectedOR} />
              <ToolbarButton label="Confirmar" icon={CheckCircle2} disabled={!selectedOR} />
              <ToolbarButton label="Estornar" icon={RotateCcw} disabled={!selectedOR} />
            </div>
          </div>

        </div>
      </div>

      {/* ====== MASTER GRID ====== */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">O.R. / Recebimento</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Depositante</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo de Entrada</th>
                <th className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                <th className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {MOCK_RECEIVING.filter(or => or.status === filterStatus || filterStatus === 'Todos').map((or) => (
                <tr 
                  key={or.id}
                  onClick={() => setSelectedOR(or.id)}
                  className={cn(
                    "group cursor-pointer transition-all",
                    selectedOR === or.id ? "bg-secondary/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  )}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                        selectedOR === or.id ? "bg-secondary text-primary border-secondary" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                      )}>
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{or.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{or.depositante}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-wider">{or.tipo}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{or.data}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      STATUS_COLORS[or.status]
                    )}>
                      {or.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1 w-32 mx-auto">
                      <div className="flex justify-between text-[8px] font-black text-slate-400">
                        <span>{or.conferidos} / {or.totalItens}</span>
                        <span>{Math.round((or.conferidos/or.totalItens)*100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary transition-all" 
                          style={{ width: `${(or.conferidos/or.totalItens)*100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== MODAL: CONFERÊNCIA CEGA ====== */}
      {showBlindModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-3 bg-secondary" />
            
            {/* Header Modal */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border-2 border-secondary/20 relative">
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center animate-pulse">
                     <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <Barcode className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight uppercase">Execução de Conferência Cega</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">O.R. Selecionada: <span className="text-secondary">{selectedOR}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowBlindModal(false)}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-danger transition-all hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* SCANNER INPUT AREA */}
              <form onSubmit={handleScan} className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Aguardando Bipagem de Produto...</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    ref={scanInputRef}
                    type="text" 
                    placeholder="ESCANEIE O CÓDIGO DE BARRAS / SKU"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[24px] py-8 pl-16 pr-8 text-2xl font-black text-secondary placeholder:text-slate-300 focus:border-secondary focus:bg-white outline-none transition-all shadow-inner tracking-widest uppercase"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 tracking-tighter shadow-sm border border-slate-300/50">USB / BT SCANNER READY</span>
                  </div>
                </div>
              </form>

              {/* QUANTITY & ACTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade Contada</label>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all">-</button>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="flex-1 h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-center text-xl font-black text-primary outline-none focus:border-primary"
                      />
                      <button onClick={() => setQuantity(q => q+1)} className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all">+</button>
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium italic mt-1 ml-1">Padrão: Conferência por Unidade (Bip=1)</p>
                </div>

                <div className="flex flex-col justify-end gap-2">
                   <button 
                     onClick={() => setShowDamageModal(true)}
                     className="w-full h-16 border-2 border-danger/20 bg-danger/5 text-danger rounded-2xl flex items-center justify-center gap-3 hover:bg-danger hover:text-white transition-all group"
                   >
                     <AlertCircle className="w-5 h-5 group-hover:animate-bounce" />
                     <span className="text-xs font-black uppercase tracking-widest">Informar Avaria / Dano</span>
                   </button>
                </div>
              </div>

              {/* LAST SCAN FEEDBACK */}
              {lastScan && (
                <div className="bg-primary text-white rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                    <CheckCircle2 className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Hash className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">Último Item Bipado!</p>
                      <h4 className="text-lg font-black tracking-tight mt-1">{lastScan.sku}</h4>
                      <p className="text-xs font-medium text-white/70">{lastScan.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <button onClick={() => setLastScan(null)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Ignorar</button>
                    <button className="px-8 py-3 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 transition-all">Confirmar (1)</button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Modal */}
            <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowBlindModal(false)}
                className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Suspender
              </button>
              <button 
                className="px-10 py-3 bg-secondary text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Finalizar Conferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: DETALHE DE AVARIA ====== */}
      {showDamageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-slate-800 w-full max-w-lg p-8 rounded-[40px] shadow-2xl relative border-t-8 border-danger">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-danger" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Registro de Avaria</h3>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Dano / Defeito</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                       {['Caixa Amassada', 'Produto Rasgado', 'Item Molhado', 'Lacre Violado', 'Outros'].map((d) => (
                         <button key={d} className="p-4 rounded-xl border-2 border-slate-100 hover:border-danger hover:bg-danger/5 text-xs font-bold text-slate-600 transition-all text-left">{d}</button>
                       ))}
                    </div>
                 </div>

                 <div className="p-10 border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center space-y-3 hover:border-secondary/30 transition-all cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-secondary/10 flex items-center justify-center transition-all">
                       <Camera className="w-8 h-8 text-slate-300 group-hover:text-secondary" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase">Anexar Foto da Avaria</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button onClick={() => setShowDamageModal(false)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Descartar</button>
                 <button onClick={() => setShowDamageModal(false)} className="py-4 bg-danger text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger/20">Salvar Avaria</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
