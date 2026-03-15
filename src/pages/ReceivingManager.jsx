import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Barcode, 
  Hash, 
  X, 
  Zap,
  ClipboardList,
  AlertTriangle,
  Camera,
  Search,
  Tag
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}



const STATUS_COLORS = {
  'Pendente': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'Aguardando Alocação': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Finalizada': 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
};


// ====== SUB-COMPONENTE: TOOLBAR BUTTON ======

const ToolbarButton = ({ label, icon: IconComponent, onClick, color = "slate", disabled = false, badge }) => (
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
      <IconComponent className="w-5 h-5" />
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
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('1 dia');
  const [selectedOR, setSelectedOR] = useState(null);
  const [showBlindModal, setShowBlindModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [ordens, setOrdens] = useState([
    { id: 'OR-55920', depositante: 'VerticalParts Matriz', tipo: 'Compra Nacional', status: 'Pendente', data: '22/02/2026', totalItens: 45, conferidos: 0, nf: 'NF-78901' },
    { id: 'OR-55921', depositante: 'VerticalParts Matriz', tipo: 'Devolução Cliente', status: 'Aguardando Alocação', data: '22/02/2026', totalItens: 12, conferidos: 12, nf: 'NF-78845' },
    { id: 'OR-55925', depositante: 'VParts Import Export', tipo: 'Importação Direta', status: 'Pendente', data: '21/02/2026', totalItens: 120, conferidos: 45, nf: 'NF-79100' },
    { id: 'OR-55890', depositante: 'VerticalParts Matriz', tipo: 'Compra Nacional', status: 'Finalizada', data: '20/02/2026', totalItens: 88, conferidos: 88, nf: 'NF-78500' },
  ]);
  const [showNFModal, setShowNFModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [, setScanLog] = useState([]);
  
  // Blind Check State
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lastScan, setLastScan] = useState(null);
  const [damageType, setDamageType] = useState(null); // radio de tipo de dano
  const scanInputRef = useRef(null);

  // Quantidades mockadas estáveis (evita flutuação a cada render)
  const mockQtys = useMemo(() => [8, 14, 3, 20, 11], []);

  useEffect(() => {
    if (showBlindModal && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [showBlindModal]);

  // Escape — Modal Conferência Cega
  useEffect(() => {
    if (!showBlindModal) return;
    const fn = (e) => { if (e.key === 'Escape') setShowBlindModal(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [showBlindModal]);

  // Escape — Modal Avaria
  useEffect(() => {
    if (!showDamageModal) return;
    const fn = (e) => { if (e.key === 'Escape') setShowDamageModal(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [showDamageModal]);

  // Escape — Modal NF
  useEffect(() => {
    if (!showNFModal) return;
    const fn = (e) => { if (e.key === 'Escape') setShowNFModal(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [showNFModal]);

  // Escape — Modal Produtos
  useEffect(() => {
    if (!showProductsModal) return;
    const fn = (e) => { if (e.key === 'Escape') setShowProductsModal(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [showProductsModal]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!barcode) return;
    
    // Simulação de bipagem
    setLastScan({ sku: 'VEPEL-BPI-174FX', desc: 'Kit de Pastilhas de Freio - VParts', barcode });
    setBarcode('');
    if (scanInputRef.current) scanInputRef.current.focus();

    // Atualiza progresso da OR — limita ao máximo de totalItens
    setOrdens(prev => prev.map(o =>
      o.id === selectedOR && o.conferidos < o.totalItens
        ? { ...o, conferidos: Math.min(o.conferidos + quantity, o.totalItens) }
        : o
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ====== HEADER & MASTER FILTERS ====== */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <PackageSearch className="w-8 h-8 text-secondary" /> 2.4 Gerenciar Recebimento
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Chão de fábrica: Conferência cega e alocação dinâmica</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
            {['Todos', 'Pendente', 'Aguardando Alocação', 'Finalizada'].map((s) => (
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
              <ToolbarButton label="Nota Fiscal" icon={FileText} disabled={!selectedOR}
                onClick={() => setShowNFModal(true)} />
              <ToolbarButton label="Produtos" icon={Boxes} disabled={!selectedOR}
                onClick={() => setShowProductsModal(true)} />
              <ToolbarButton label="Etiquetas" icon={Tag} color="secondary" disabled={!selectedOR}
                onClick={() => {
                  const or = ordens.find(o => o.id === selectedOR);
                  alert(`Enviando lote de etiquetas da OR ${selectedOR} (${or?.totalItens} itens) para a impressora térmica...`);
                }} />
              <ToolbarButton label="Gerar Picking" icon={Zap} disabled={!selectedOR}
                onClick={() => {
                  const or = ordens.find(o => o.id === selectedOR);
                  if (or?.status !== 'Aguardando Alocação') {
                    alert('Finalize a conferência antes de gerar picking.');
                    return;
                  }
                  alert('Picking gerado for ' + selectedOR + '! Acesse 2.10 Separar Pedidos.');
                }} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Conferência */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Conferência</p>
            <div className="flex gap-3">
              <ToolbarButton label="Conferência Cega" icon={Barcode} color="secondary"
                disabled={!selectedOR || ordens.find(o=>o.id===selectedOR)?.status === 'Finalizada'}
                onClick={() => setShowBlindModal(true)} />

              <ToolbarButton label="Recontagem" icon={RotateCcw}
                disabled={!selectedOR}
                onClick={() => {
                  setOrdens(prev => prev.map(o => o.id === selectedOR ? {...o, conferidos: 0} : o));
                  setScanLog([]);
                  alert('Recontagem iniciada. Conferidos resetados para 0.');
                }} />

              <ToolbarButton label="Divergência" icon={AlertTriangle} badge="!"
                disabled={!selectedOR}
                onClick={() => {
                  const or = ordens.find(o => o.id === selectedOR);
                  const diff = or ? or.totalItens - or.conferidos : 0;
                  if (diff === 0) alert('Nenhuma divergência! Todos os itens conferidos.');
                  else alert(`Divergência: ${diff} item(ns) ainda não conferido(s) em ${selectedOR}.`);
                }} />

              <ToolbarButton label="Finalizar" icon={CheckCircle2} color="secondary"
                disabled={!selectedOR || ordens.find(o=>o.id===selectedOR)?.status !== 'Pendente'}
                onClick={() => {
                  const or = ordens.find(o => o.id === selectedOR);
                  if (!or) return;
                  if (or.conferidos < or.totalItens) {
                    const confirmar = window.confirm(`Ainda há ${or.totalItens - or.conferidos} item(ns) não conferido(s). Finalizar com divergência?`);
                    if (!confirmar) return;
                  }
                  setOrdens(prev => prev.map(o => o.id === selectedOR
                    ? {...o, status: 'Aguardando Alocação', conferidos: o.totalItens}
                    : o
                  ));
                  alert(selectedOR + ' finalizada! Status: Aguardando Alocação.');
                }} />
            </div>
          </div>

          <div className="w-px h-24 bg-slate-100 dark:bg-slate-800 mt-6" />

          {/* Grupo Alocação */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grupo Alocação</p>
            <div className="flex gap-3">
              <ToolbarButton label="Gerar Alocação" icon={Truck}
                disabled={!selectedOR || ordens.find(o=>o.id===selectedOR)?.status !== 'Aguardando Alocação'}
                onClick={() => {
                  alert('Mapa de alocação gerado para ' + selectedOR + '!\nAcesse 2.6 Gerar Mapa de Alocação para confirmar os endereços.');
                }} />

              <ToolbarButton label="Confirmar" icon={CheckCircle2}
                disabled={!selectedOR || ordens.find(o=>o.id===selectedOR)?.status !== 'Aguardando Alocação'}
                onClick={() => {
                  setOrdens(prev => prev.map(o => o.id === selectedOR
                    ? {...o, status: 'Finalizada'}
                    : o
                  ));
                  setSelectedOR(null);
                  alert('Alocação confirmada! OR movida para Finalizada e estoque atualizado.');
                }} />

              <ToolbarButton label="Estornar" icon={RotateCcw}
                disabled={!selectedOR || ordens.find(o=>o.id===selectedOR)?.status === 'Pendente'}
                onClick={() => {
                  const confirmar = window.confirm('Estornar alocação de ' + selectedOR + '? A OR voltará para Pendente.');
                  if (!confirmar) return;
                  setOrdens(prev => prev.map(o => o.id === selectedOR
                    ? {...o, status: 'Pendente', conferidos: 0}
                    : o
                  ));
                  alert('Alocação estornada. OR voltou para Pendente.');
                }} />
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
                <th scope="col" className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">O.R. / Recebimento</th>
                <th scope="col" className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Depositante</th>
                <th scope="col" className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo de Entrada</th>
                <th scope="col" className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                <th scope="col" className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th scope="col" className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {ordens.filter(or => or.status === filterStatus || filterStatus === 'Todos').map((or) => (
                <tr 
                  key={or.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedOR(or.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOR(or.id); } }}
                  aria-pressed={selectedOR === or.id}
                  className={cn(
                    "group cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset",
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
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blind-modal-title"
            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
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
                  <h2 id="blind-modal-title" className="text-xl font-black tracking-tight uppercase">Execução de Conferência Cega</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">O.R. Selecionada: <span className="text-secondary">{selectedOR}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowBlindModal(false)}
                aria-label="Fechar conferência cega"
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-danger transition-all hover:scale-110"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* SCANNER INPUT AREA */}
              <form onSubmit={handleScan} className="space-y-4">
                <label htmlFor="blind-scan-input" className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Aguardando Bipagem de Produto...</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none" aria-hidden="true">
                    <Search className="w-6 h-6 text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    id="blind-scan-input"
                    ref={scanInputRef}
                    type="text" 
                    placeholder="ESCANEIE O CÓDIGO DE BARRAS / SKU"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[24px] py-8 pl-16 pr-8 text-2xl font-black text-secondary placeholder:text-slate-300 focus:border-secondary focus:bg-white outline-none transition-all shadow-inner tracking-widest uppercase"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2" aria-hidden="true">
                     <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 tracking-tighter shadow-sm border border-slate-300/50">USB / BT SCANNER READY</span>
                  </div>
                </div>
              </form>

              {/* QUANTITY & ACTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label htmlFor="blind-qty-input" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade Contada</label>
                   <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q-1))}
                        aria-label="Diminuir quantidade"
                        className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                      >-</button>
                      <input 
                        id="blind-qty-input"
                        type="number" 
                        value={quantity}
                        min={1}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-center text-xl font-black text-primary outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(q => q+1)}
                        aria-label="Aumentar quantidade"
                        className="w-16 h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                      >+</button>
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
                    <button
                      type="button"
                      onClick={() => setLastScan(null)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                    >Ignorar</button>
                    <button
                      type="button"
                      onClick={() => {
                        // já foi processado no handleScan; apenas descarta o feedback
                        setLastScan(null);
                        if (scanInputRef.current) scanInputRef.current.focus();
                      }}
                      className="px-8 py-3 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 transition-all"
                    >Confirmar (1)</button>
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
                onClick={() => {
                  // Finaliza a conferência da OR selecionada e fecha o modal
                  const or = ordens.find(o => o.id === selectedOR);
                  if (or && or.status === 'Pendente') {
                    setOrdens(prev => prev.map(o => o.id === selectedOR
                      ? { ...o, status: 'Aguardando Alocação', conferidos: o.totalItens }
                      : o
                    ));
                  }
                  setShowBlindModal(false);
                }}
                className="px-10 py-3 bg-secondary text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Finalizar Conferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: DETALHE DE AVARIA ====== */}
      {showDamageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in zoom-in-95 duration-200">
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="damage-modal-title"
             className="bg-white dark:bg-slate-800 w-full max-w-lg p-8 rounded-[40px] shadow-2xl relative border-t-8 border-danger"
           >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center" aria-hidden="true">
                    <AlertTriangle className="w-6 h-6 text-danger" />
                 </div>
                 <h2 id="damage-modal-title" className="text-xl font-black uppercase tracking-tight">Registro de Avaria</h2>
              </div>

              <div className="space-y-6">
                 <div>
                    <p id="damage-type-label" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Dano / Defeito</p>
                    <div
                      role="radiogroup"
                      aria-labelledby="damage-type-label"
                      className="grid grid-cols-2 gap-3 mt-2"
                    >
                       {['Caixa Amassada', 'Produto Rasgado', 'Item Molhado', 'Lacre Violado', 'Outros'].map((d) => (
                         <button
                           key={d}
                           type="button"
                           role="radio"
                           aria-checked={damageType === d}
                           onClick={() => setDamageType(d)}
                           className={`p-4 rounded-xl border-2 text-xs font-bold text-left transition-all ${
                             damageType === d
                               ? 'border-danger bg-danger/10 text-danger'
                               : 'border-slate-100 hover:border-danger hover:bg-danger/5 text-slate-600'
                           }`}
                         >{d}</button>
                       ))}
                    </div>
                 </div>

                 <button
                   type="button"
                   aria-label="Anexar foto da avaria"
                   className="w-full p-10 border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center space-y-3 hover:border-secondary/30 transition-all cursor-pointer group"
                 >
                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-secondary/10 flex items-center justify-center transition-all" aria-hidden="true">
                       <Camera className="w-8 h-8 text-slate-300 group-hover:text-secondary" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase">Anexar Foto da Avaria</p>
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button onClick={() => { setShowDamageModal(false); setDamageType(null); }} className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Descartar</button>
                 <button onClick={() => { setShowDamageModal(false); setDamageType(null); }} className="py-4 bg-danger text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger/20">Salvar Avaria</button>
              </div>
           </div>
        </div>
      )}

      {showNFModal && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
      onClick={() => setShowNFModal(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nf-modal-title"
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl border-t-4 border-secondary"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="nf-modal-title" className="text-lg font-black mb-2">Nota Fiscal Vinculada</h2>
        <p className="text-xs text-slate-400 mb-6">O.R.: <strong>{selectedOR}</strong></p>
        {(() => {
          const or = ordens.find(o => o.id === selectedOR);
          return (
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Número NF</span>
                <span className="font-black text-secondary">{or?.nf || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Depositante</span>
                <span className="font-black">{or?.depositante}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Tipo de Entrada</span>
                <span className="font-black">{or?.tipo}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Total de Itens</span>
                <span className="font-black">{or?.totalItens} SKUs</span>
              </div>
            </div>
          );
        })()}
        <button onClick={() => setShowNFModal(false)}
          className="w-full mt-6 py-3 bg-secondary text-primary rounded-2xl text-xs font-black uppercase tracking-widest">
          Fechar
        </button>
      </div>
    </div>
  )}

  {showProductsModal && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
      onClick={() => setShowProductsModal(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="products-modal-title"
        className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] p-8 shadow-2xl border-t-4 border-secondary"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="products-modal-title" className="text-lg font-black mb-2">Produtos da O.R.</h2>
        <p className="text-xs text-slate-400 mb-6">O.R.: <strong>{selectedOR}</strong></p>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {['VEPEL-BPI-174FX','VPER-ESS-NY-27MM','VPER-PAL-INO-1000','VPER-LUM-LED-VRD-24V','VPER-PNT-AL-22D'].map((sku, i) => (
            <div key={sku} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-black text-secondary">{sku}</p>
                <p className="text-[10px] text-slate-400">Peça para elevador · Lote VP-{2026+i}</p>
              </div>
              <span className="text-xs font-black bg-white border border-slate-200 px-2 py-1 rounded-lg">
                {mockQtys[i]} un
              </span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowProductsModal(false)}
          className="w-full mt-6 py-3 bg-secondary text-primary rounded-2xl text-xs font-black uppercase tracking-widest">
          Fechar
        </button>
      </div>
    </div>
  )}
    </div>
  );
}
