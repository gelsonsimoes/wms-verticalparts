import React, { useState } from 'react';
import {
  Package,
  Layers,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Barcode,
  X,
  ChevronRight,
  Zap,
  Hash,
  DollarSign,
  ClipboardCheck,
  AlertCircle,
  Scissors,
  RefreshCcw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ===== RECEITAS DE KITS MOCK =====
const KIT_RECIPES = {
  'VP-KIT-FREIO-COMP': {
    desc: 'Kit Completo de Freio Performance',
    valorKit: 485.00,
    componentes: [
      { sku: 'VP-FR4429-X', desc: 'Pastilha de Freio Cerâmica', qtdExigida: 4 },
      { sku: 'VP-DF882-M', desc: 'Disco de Freio Ventilado', qtdExigida: 2 },
      { sku: 'VP-FL1', desc: 'Fluido de Freio DOT4 500mL', qtdExigida: 1 },
    ],
  },
  'VP-KIT-FILTROS-STD': {
    desc: 'Kit Filtros Standard (Revisão 10K)',
    valorKit: 210.00,
    componentes: [
      { sku: 'VP-FL1', desc: 'Filtro de Óleo VP-FL1', qtdExigida: 1 },
      { sku: 'VP-AIR-02', desc: 'Filtro de Ar Esportivo', qtdExigida: 1 },
      { sku: 'VP-WPR-99', desc: 'Palheta Limpador Silicone 24"', qtdExigida: 2 },
    ],
  },
};

// ===== MODAL DE BIPAGEM DE COMPONENTE =====
function ScannerModal({ onClose, onAdd, mode }) {
  const [code, setCode] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  // SKU lookup mock
  const SKU_MAP = {
    'VP-FR4429-X': 'Pastilha de Freio Cerâmica',
    'VP-DF882-M': 'Disco de Freio Ventilado',
    'VP-FL1': mode === 'assembly' ? 'Fluido de Freio DOT4 500mL' : 'Filtro de Óleo VP-FL1',
    'VP-AIR-02': 'Filtro de Ar Esportivo',
    'VP-WPR-99': 'Palheta Limpador Silicone 24"',
    'VEPEL-BPI-174FX': 'Barreira de Proteção Infravermelha',
    'VPER-PAL-INO-1000': 'Pallet de Aço Inox (1000mm)',
  };

  const handleAdd = () => {
    if (!code.trim()) { setError('Informe o código de barras ou SKU.'); return; }
    const desc = SKU_MAP[code.trim().toUpperCase()] || `Produto ${code.trim()}`;
    onAdd({ sku: code.trim().toUpperCase(), desc, qty: parseInt(qty) || 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Barcode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                {mode === 'assembly' ? 'Montagem' : 'Desmontagem'}
              </p>
              <h2 className="text-base font-black text-primary uppercase tracking-tight">Adicionar Componente</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Bipe o código de barras do produto ou insira o SKU manualmente. Use o campo de quantidade para lançamentos em lote.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Barras / SKU</label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Bipe ou digite o código..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Quick SKUs */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atalhos Rápidos</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SKU_MAP).slice(0, 5).map(s => (
                <button key={s} onClick={() => setCode(s)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-secondary hover:text-primary transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span className="text-xs font-bold text-danger">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">
              Cancelar
            </button>
            <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== PAINEL DE ABA (Montagem ou Desmontagem) =====
function KitPanel({ mode }) {
  const isAssembly = mode === 'assembly';

  const [codigoServico, setCodigoServico] = useState('');
  const [kitSku, setKitSku] = useState('');
  const [kitDesc, setKitDesc] = useState('');
  const [valorKit, setValorKit] = useState('');
  const [qtdKits, setQtdKits] = useState(1);
  const [componentes, setComponentes] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recipe, setRecipe] = useState(null);

  // Lookup recipe ao digitar kit SKU
  const handleKitSearch = () => {
    const found = KIT_RECIPES[kitSku.toUpperCase()];
    if (found) {
      setRecipe(found);
      setKitDesc(found.desc);
      setValorKit(found.valorKit.toFixed(2));
      if (isAssembly) {
        // Pré-carrega componentes da receita com qtd inserida = 0
        setComponentes(found.componentes.map(c => ({ ...c, qtdInserida: 0, id: Math.random() })));
      }
    } else {
      setRecipe(null);
      if (!isAssembly) {
        setComponentes([]);
      }
    }
  };

  const handleAddComponent = ({ sku, desc, qty }) => {
    setComponentes(prev => {
      const idx = prev.findIndex(c => c.sku === sku);
      if (idx >= 0) {
        // Incrementa qtd inserida na receita
        return prev.map((c, i) => i === idx ? { ...c, qtdInserida: (c.qtdInserida || 0) + qty } : c);
      }
      // Novo componente (sem receita ou desmontagem)
      return [...prev, { id: Math.random(), sku, desc, qtdExigida: qty, qtdInserida: qty }];
    });
  };

  const handleRemove = (id) => {
    setComponentes(prev => prev.filter(c => c.id !== id));
  };

  const allOk = componentes.length > 0 && componentes.every(c =>
    (c.qtdInserida || 0) >= (c.qtdExigida || c.qtdInserida || 1)
  );

  const handleConsolidate = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setComponentes([]);
      setKitSku('');
      setKitDesc('');
      setValorKit('');
      setCodigoServico('');
      setQtdKits(1);
      setRecipe(null);
    }, 2500);
  };

  const totalValor = (parseFloat(valorKit) || 0) * qtdKits;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Success banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-sm font-black text-green-700 dark:text-green-300 uppercase tracking-wide">
            {isAssembly ? `Kit ${kitSku} consolidado com sucesso!` : `Desmontagem concluída — componentes liberados no estoque!`}
          </span>
        </div>
      )}

      {/* === CABEÇALHO DE INPUTS === */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
          {isAssembly ? '⚙️ Parâmetros do Kit a Montar' : '✂️ Parâmetros do Kit a Desmontar'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Código Serviço */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Código Serviço
            </label>
            <input
              value={codigoServico}
              onChange={e => setCodigoServico(e.target.value)}
              placeholder="SRV-001..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Produto Kit */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Package className="w-3 h-3" /> {isAssembly ? 'SKU do Kit Final' : 'SKU do Kit a Desmontar'}
            </label>
            <div className="relative">
              <input
                value={kitSku}
                onChange={e => setKitSku(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleKitSearch()}
                placeholder="VP-KIT-..."
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
              />
              <button onClick={handleKitSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
            <input
              value={kitDesc}
              onChange={e => setKitDesc(e.target.value)}
              placeholder="Ex: Kit Freio Completo..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Valor por Kit */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Valor por Kit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
              <input
                type="number"
                value={valorKit}
                onChange={e => setValorKit(e.target.value)}
                placeholder="0,00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          {/* Quantidade */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isAssembly ? 'Qtd a Montar' : 'Qtd a Desmontar'}
            </label>
            <input
              type="number"
              min="1"
              value={qtdKits}
              onChange={e => setQtdKits(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Total + atalhos */}
        {(parseFloat(valorKit) > 0 || recipe) && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {recipe && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-[10px] font-black text-green-700 dark:text-green-400">Receita: {recipe.componentes.length} componentes</span>
                </div>
              )}
            </div>
            {parseFloat(valorKit) > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total:</span>
                <span className="text-sm font-black text-secondary">
                  R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === TOOLBAR DE COMPONENTES === */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <Barcode className="w-4 h-4" />
          {isAssembly ? 'Adicionar Componente' : 'Bipar Componente do Kit'}
        </button>

        <button
          disabled={componentes.length === 0}
          onClick={() => setComponentes([])}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-danger text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all"
        >
          <RefreshCcw className="w-4 h-4" /> Limpar Tudo
        </button>

        <div className="flex-1" />

        {/* Badge de status */}
        {componentes.length > 0 && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
            allOk
              ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
              : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
          )}>
            {allOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {allOk ? 'Todos prontos — pode consolidar!' : `${componentes.filter(c => (c.qtdInserida || 0) < (c.qtdExigida || 1)).length} pendente(s)`}
          </div>
        )}
      </div>

      {/* === GRID DE COMPONENTES === */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {isAssembly ? 'Componentes em Montagem' : 'Componentes a Separar'}
            </h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{componentes.length} itens</span>
        </div>

        {componentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-300 dark:text-slate-700">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Barcode className="w-8 h-8" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">
              {isAssembly ? 'Bipe os componentes para iniciar a montagem' : 'Bipe o kit para iniciar a desmontagem'}
            </p>
            <p className="text-xs font-medium text-slate-400">
              {recipe ? 'Receita carregada. Clique em "Adicionar Componente" para bipar.' : 'Pesquise um SKU de kit ou bipe diretamente.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isAssembly ? 'Qtd Exigida (Receita)' : 'Qtd no Kit'}
                </th>
                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Inserida</th>
                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {componentes.map((comp) => {
                const ok = (comp.qtdInserida || 0) >= (comp.qtdExigida || 1);
                const over = (comp.qtdInserida || 0) > (comp.qtdExigida || Infinity);
                return (
                  <tr key={comp.id} className={cn(
                    "border-t border-slate-100 dark:border-slate-800 transition-all",
                    ok && !over && "bg-green-50/50 dark:bg-green-900/10",
                    over && "bg-amber-50/50 dark:bg-amber-900/10",
                  )}>
                    <td className="p-4">
                      <code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/5 rounded-lg">{comp.sku}</code>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px]">
                      <span className="line-clamp-2">{comp.desc}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-base font-black text-slate-700 dark:text-slate-200">{comp.qtdExigida}</span>
                      <span className="text-[10px] text-slate-400 ml-1">un</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={cn(
                          "text-base font-black tabular-nums",
                          ok && !over ? "text-green-600" : over ? "text-amber-600" : "text-danger"
                        )}>
                          {comp.qtdInserida || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">un</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {ok && !over ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-[9px] font-black text-green-600 uppercase tracking-wider">OK</span>
                        </div>
                      ) : over ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Excesso</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pendente</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleRemove(comp.id)} className="text-slate-300 hover:text-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* === BOTÃO CONSOLIDAR === */}
      <div className="flex justify-end">
        <button
          disabled={!allOk || !kitSku}
          onClick={handleConsolidate}
          className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl",
            allOk && kitSku
              ? "bg-secondary text-primary hover:opacity-90 active:scale-95 shadow-black/20 animate-pulse"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
          )}
        >
          <ClipboardCheck className="w-5 h-5" />
          {isAssembly ? 'Consolidar Montagem' : 'Confirmar Desmontagem'}
          {allOk && kitSku && <Zap className="w-4 h-4 text-primary/60" />}
        </button>
      </div>

      {showScanner && (
        <ScannerModal
          mode={mode}
          onClose={() => setShowScanner(false)}
          onAdd={handleAddComponent}
        />
      )}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function KitStation() {
  const [activeTab, setActiveTab] = useState('assembly');

  const tabs = [
    { id: 'assembly', label: 'Montagem de Kit', icon: Package, color: 'text-secondary' },
    { id: 'disassembly', label: 'Desmontagem de Kit', icon: Scissors, color: 'text-danger' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center shadow-lg shadow-black/20">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Scissors className="w-3.5 h-3.5 text-secondary" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operacional — Kits & Conjuntos</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Estação de Kits
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Montagem e Desmontagem de Conjuntos Comerciais</p>
        </div>

        {/* Indicador de aba ativa */}
        <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className={cn("w-2 h-2 rounded-full", activeTab === 'assembly' ? "bg-secondary" : "bg-danger")} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {activeTab === 'assembly' ? 'Modo Montagem' : 'Modo Desmontagem'}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-2 flex gap-2 shadow-sm w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
              activeTab === tab.id
                ? tab.id === 'assembly'
                  ? "bg-secondary text-primary shadow-lg shadow-black/10"
                  : "bg-danger text-white shadow-lg shadow-danger/20"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DA ABA */}
      <KitPanel key={activeTab} mode={activeTab} />
    </div>
  );
}
