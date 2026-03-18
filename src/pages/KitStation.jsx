import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Package, Layers, Search, Plus, Trash2, CheckCircle2,
  XCircle, Barcode, X, Zap, Hash, DollarSign, ClipboardCheck,
  AlertCircle, Scissors, RefreshCcw, RefreshCw,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ── Receitas demo para seed inicial ──────────────────────────
const SEED_RECIPES = [
  {
    kit_sku: 'VP-KIT-FREIO-COMP',
    descricao: 'Kit Completo de Freio Performance',
    valor_kit: 485.00,
    itens: [
      { sku: 'VP-FR4429-X', descricao: 'Pastilha de Freio Cerâmica',   qtd_exigida: 4 },
      { sku: 'VP-DF882-M',  descricao: 'Disco de Freio Ventilado',     qtd_exigida: 2 },
      { sku: 'VP-FL1',      descricao: 'Fluido de Freio DOT4 500mL',   qtd_exigida: 1 },
    ],
  },
  {
    kit_sku: 'VP-KIT-FILTROS-STD',
    descricao: 'Kit Filtros Standard (Revisão 10K)',
    valor_kit: 210.00,
    itens: [
      { sku: 'VP-FL1',    descricao: 'Filtro de Óleo VP-FL1',         qtd_exigida: 1 },
      { sku: 'VP-AIR-02', descricao: 'Filtro de Ar Esportivo',        qtd_exigida: 1 },
      { sku: 'VP-WPR-99', descricao: 'Palheta Limpador Silicone 24"', qtd_exigida: 2 },
    ],
  },
];

// ── SKU Map para autocomplete do scanner (local, sem tabela) ──
const SKU_MAP = {
  'VP-FR4429-X':       'Pastilha de Freio Cerâmica',
  'VP-DF882-M':        'Disco de Freio Ventilado',
  'VP-FL1':            'Fluido de Freio DOT4 / Filtro de Óleo',
  'VP-AIR-02':         'Filtro de Ar Esportivo',
  'VP-WPR-99':         'Palheta Limpador Silicone 24"',
  'VEPEL-BPI-174FX':   'Barreira de Proteção Infravermelha',
  'VPER-PAL-INO-1000': 'Pallet de Aço Inox (1000mm)',
};

// ════════════════════════════════════════════════════════════
// MODAL DE BIPAGEM DE COMPONENTE
// ════════════════════════════════════════════════════════════
function ScannerModal({ onClose, onAdd, mode, recipe }) {
  const [code,  setCode]  = useState('');
  const [qty,   setQty]   = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleAdd = () => {
    if (!code.trim()) { setError('Informe o código de barras ou SKU.'); return; }
    const upper = code.trim().toUpperCase();
    const desc  = SKU_MAP[upper] || `Produto ${upper}`;

    if (mode === 'assembly' && recipe) {
      const naReceita = recipe.itens.some(c => c.sku.toUpperCase() === upper);
      if (!naReceita) {
        setError(`SKU "${upper}" não pertence à receita deste kit.`);
        return;
      }
    }
    onAdd({ sku: upper, desc, qty: parseInt(qty) || 1 });
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="scanner-modal-title"
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Barcode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                {mode === 'assembly' ? 'Montagem' : 'Desmontagem'}
              </p>
              <h2 id="scanner-modal-title" className="text-base font-black text-primary uppercase tracking-tight">
                Adicionar Componente
              </h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-primary/50 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Bipe o código de barras ou insira o SKU manualmente.
          </p>

          <div className="space-y-2">
            <label htmlFor="scanner-code" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Código de Barras / SKU
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="scanner-code" autoFocus type="text" value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Bipe ou digite o código..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="scanner-qty" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
            <input
              id="scanner-qty" type="number" min="1" value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atalhos Rápidos</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SKU_MAP).slice(0, 5).map(s => (
                <button key={s} onClick={() => setCode(s)} aria-label={`Preencher código ${s}`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-secondary hover:text-primary transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-600">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">
              Cancelar
            </button>
            <button onClick={handleAdd}
              className="flex-1 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAINEL DE KIT (Montagem ou Desmontagem)
// ════════════════════════════════════════════════════════════
function KitPanel({ mode, warehouseId }) {
  const isAssembly = mode === 'assembly';

  const [recipes,        setRecipes]        = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [codigoServico,  setCodigoServico]  = useState('');
  const [kitSku,         setKitSku]         = useState('');
  const [kitDesc,        setKitDesc]        = useState('');
  const [valorKit,       setValorKit]       = useState('');
  const [qtdKits,        setQtdKits]        = useState(1);
  const [componentes,    setComponentes]    = useState([]);
  const [showScanner,    setShowScanner]    = useState(false);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [recipe,         setRecipe]         = useState(null);

  const timeoutRef = useRef(null);
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // ── Fetch + seed receitas ──────────────────────────────────
  const fetchRecipes = useCallback(async () => {
    if (!warehouseId) return;
    setRecipesLoading(true);
    try {
      const { data } = await supabase
        .from('kits_receitas')
        .select('id, kit_sku, descricao, valor_kit, kits_receitas_itens(sku, descricao, qtd_exigida)')
        .eq('warehouse_id', warehouseId);

      if (!data || data.length === 0) {
        // Seed
        for (const r of SEED_RECIPES) {
          const { data: inserted } = await supabase
            .from('kits_receitas')
            .insert({ warehouse_id: warehouseId, kit_sku: r.kit_sku, descricao: r.descricao, valor_kit: r.valor_kit })
            .select('id')
            .single();
          if (inserted) {
            await supabase.from('kits_receitas_itens').insert(
              r.itens.map(i => ({ receita_id: inserted.id, sku: i.sku, descricao: i.descricao, qtd_exigida: i.qtd_exigida }))
            );
          }
        }
        // Refetch após seed
        const { data: fresh } = await supabase
          .from('kits_receitas')
          .select('id, kit_sku, descricao, valor_kit, kits_receitas_itens(sku, descricao, qtd_exigida)')
          .eq('warehouse_id', warehouseId);
        setRecipes(fresh ?? []);
      } else {
        setRecipes(data);
      }
    } finally {
      setRecipesLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  // ── Busca receita pelo SKU digitado ───────────────────────
  const handleKitSearch = () => {
    const found = recipes.find(r => r.kit_sku.toUpperCase() === kitSku.toUpperCase());
    if (found) {
      setRecipe(found);
      setKitDesc(found.descricao);
      setValorKit(found.valor_kit?.toFixed(2) ?? '');
      if (isAssembly) {
        setComponentes(
          (found.kits_receitas_itens ?? []).map(c => ({
            ...c, qtdExigida: c.qtd_exigida, qtdInserida: 0, id: crypto.randomUUID(),
          }))
        );
      }
    } else {
      setRecipe(null);
      if (!isAssembly) setComponentes([]);
    }
  };

  const handleAddComponent = ({ sku, desc, qty }) => {
    setComponentes(prev => {
      const idx = prev.findIndex(c => c.sku === sku);
      if (idx >= 0)
        return prev.map((c, i) => i === idx ? { ...c, qtdInserida: (c.qtdInserida || 0) + qty } : c);
      return [...prev, { id: crypto.randomUUID(), sku, descricao: desc, qtdExigida: qty, qtdInserida: qty }];
    });
  };

  const handleRemove = (id) => setComponentes(prev => prev.filter(c => c.id !== id));

  const handleClearAll = () => {
    if (componentes.length === 0) return;
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    setComponentes([]);
    setShowClearModal(false);
  };

  // ── Gravar ordem no Supabase ───────────────────────────────
  const handleConsolidate = async () => {
    if (!kitSku || componentes.length === 0 || !warehouseId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const osId = codigoServico || `OS-${Date.now()}`;
      const { data: ordem, error: orErr } = await supabase
        .from('ordens_kit')
        .insert({
          warehouse_id:   warehouseId,
          tipo:           isAssembly ? 'Montagem' : 'Desmontagem',
          codigo_servico: osId,
          kit_sku:        kitSku.toUpperCase(),
          kit_desc:       kitDesc || `Kit ${kitSku}`,
          qtd_kits:       qtdKits,
          valor_kit:      parseFloat(valorKit) || 0,
          status:         'Concluído',
        })
        .select('id')
        .single();

      if (orErr) throw orErr;

      await supabase.from('ordens_kit_componentes').insert(
        componentes.map(c => ({
          ordem_id:    ordem.id,
          sku:         c.sku,
          descricao:   c.descricao,
          qtd_exigida: c.qtdExigida || 0,
          qtd_inserida: (c.qtdInserida || 0) * qtdKits,
        }))
      );

      if (!codigoServico) setCodigoServico(osId);
      setShowSuccess(true);
      setSaving(false);

      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        setComponentes([]);
        setKitSku('');
        setKitDesc('');
        setValorKit('');
        setCodigoServico('');
        setQtdKits(1);
        setRecipe(null);
      }, 3000);
    } catch (err) {
      console.error('handleConsolidate:', err);
      setSaveError('Erro ao gravar: ' + (err.message ?? 'tente novamente.'));
      setSaving(false);
    }
  };

  const allOk = componentes.length > 0 && componentes.every(c =>
    isAssembly ? (c.qtdInserida || 0) >= c.qtdExigida : (c.qtdInserida || 0) > 0
  );
  const totalValor = (parseFloat(valorKit) || 0) * qtdKits;

  if (recipesLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-bold uppercase tracking-widest">Carregando receitas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Erro de gravação */}
      {saveError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {saveError}
          <button onClick={() => setSaveError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Banner de sucesso */}
      {showSuccess && (
        <div role="status" aria-live="polite"
          className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-sm font-black text-green-700 uppercase tracking-wide">
            {isAssembly ? `Kit ${kitSku} consolidado com sucesso!` : `Desmontagem concluída — componentes liberados!`}
          </span>
        </div>
      )}

      {/* === PARÂMETROS DO KIT === */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
          {isAssembly ? '⚙️ Parâmetros do Kit a Montar' : '✂️ Parâmetros do Kit a Desmontar'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          <div className="space-y-1.5">
            <label htmlFor="kit-codigo-servico" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Código Serviço
            </label>
            <input id="kit-codigo-servico" value={codigoServico} onChange={e => setCodigoServico(e.target.value)}
              placeholder="SRV-001..." className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kit-sku" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Package className="w-3 h-3" /> {isAssembly ? 'SKU do Kit Final' : 'SKU a Desmontar'}
            </label>
            <div className="relative">
              <input id="kit-sku" value={kitSku} onChange={e => setKitSku(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleKitSearch()}
                placeholder="VP-KIT-..."
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                list="kit-sku-list"
              />
              <datalist id="kit-sku-list">
                {recipes.map(r => <option key={r.id} value={r.kit_sku}>{r.descricao}</option>)}
              </datalist>
              <button onClick={handleKitSearch} aria-label="Buscar receita"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label htmlFor="kit-desc" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
            <input id="kit-desc" value={kitDesc} onChange={e => setKitDesc(e.target.value)}
              placeholder="Ex: Kit Freio Completo..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kit-valor" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Valor por Kit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
              <input id="kit-valor" type="number" min="0" step="0.01" value={valorKit}
                onChange={e => setValorKit(e.target.value)} placeholder="0,00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kit-qtd" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isAssembly ? 'Qtd a Montar' : 'Qtd a Desmontar'}
            </label>
            <input id="kit-qtd" type="number" min="1" step="1" value={qtdKits}
              onChange={e => setQtdKits(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all" />
          </div>
        </div>

        {(parseFloat(valorKit) > 0 || recipe) && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {recipe && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-[10px] font-black text-green-700">
                    Receita: {(recipe.kits_receitas_itens ?? []).length} componentes
                  </span>
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

      {/* === TOOLBAR === */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/10">
          <Barcode className="w-4 h-4" />
          {isAssembly ? 'Adicionar Componente' : 'Bipar Componente do Kit'}
        </button>

        <button disabled={componentes.length === 0} onClick={handleClearAll}
          aria-label="Limpar todos os componentes"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-red-600 text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all">
          <RefreshCcw className="w-4 h-4" /> Limpar Tudo
        </button>

        <div className="flex-1" />

        {componentes.length > 0 && (
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all',
            allOk
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          )}>
            {allOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {allOk
              ? 'Todos prontos — pode consolidar!'
              : `${componentes.filter(c => isAssembly ? (c.qtdInserida || 0) < c.qtdExigida : (c.qtdInserida || 0) === 0).length} pendente(s)`
            }
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
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{componentes.length} itens</span>
            {componentes.length > 0 && (
              <div className="flex items-center gap-3 ml-2">
                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden" role="progressbar"
                  aria-valuemin={0} aria-valuemax={componentes.length}
                  aria-valuenow={componentes.filter(c => isAssembly ? (c.qtdInserida || 0) >= c.qtdExigida : (c.qtdInserida || 0) > 0).length}>
                  <div className="h-full bg-secondary transition-all duration-700 rounded-full" style={{
                    width: `${Math.round(componentes.filter(c =>
                      isAssembly ? (c.qtdInserida || 0) >= c.qtdExigida : (c.qtdInserida || 0) > 0
                    ).length / componentes.length * 100)}%`
                  }} />
                </div>
                <span className="text-[10px] font-black text-slate-400">
                  {componentes.filter(c => isAssembly ? (c.qtdInserida || 0) >= c.qtdExigida : (c.qtdInserida || 0) > 0).length}/{componentes.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {componentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-300">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Barcode className="w-8 h-8" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">
              {isAssembly ? 'Bipe os componentes para iniciar a montagem' : 'Bipe o kit para iniciar a desmontagem'}
            </p>
            <p className="text-xs font-medium text-slate-400">
              {recipe ? 'Receita carregada. Clique em "Adicionar Componente".' : 'Pesquise um SKU de kit ou bipe diretamente.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th scope="col" className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isAssembly ? 'Qtd Exigida' : 'Qtd no Kit'}
                </th>
                <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Inserida</th>
                <th scope="col" className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th scope="col" className="p-4 w-10"><span className="sr-only">Remover</span></th>
              </tr>
            </thead>
            <tbody>
              {componentes.map((comp) => {
                const ok   = isAssembly ? (comp.qtdInserida || 0) >= comp.qtdExigida : (comp.qtdInserida || 0) > 0;
                const over = isAssembly && (comp.qtdInserida || 0) > comp.qtdExigida;
                return (
                  <tr key={comp.id} className={cn(
                    'border-t border-slate-100 dark:border-slate-800 transition-all',
                    ok && !over && 'bg-green-50/50',
                    over && 'bg-amber-50/50',
                  )}>
                    <td className="p-4">
                      <code className="text-xs font-black text-secondary px-2 py-0.5 bg-secondary/5 rounded-lg">{comp.sku}</code>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px]">
                      <span className="line-clamp-2">{comp.descricao}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-base font-black text-slate-700">{comp.qtdExigida}</span>
                      <span className="text-[10px] text-slate-400 ml-1">un</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={cn('text-base font-black tabular-nums',
                          ok && !over ? 'text-green-600' : over ? 'text-amber-600' : 'text-red-600')}>
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
                          <XCircle className="w-5 h-5 text-slate-300" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pendente</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleRemove(comp.id)} aria-label={`Remover ${comp.sku}`}
                        className="text-slate-300 hover:text-red-600 transition-colors">
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
          disabled={!allOk || !kitSku || saving}
          onClick={handleConsolidate}
          aria-label={isAssembly ? 'Consolidar montagem' : 'Confirmar desmontagem'}
          className={cn(
            'flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl',
            allOk && kitSku && !saving
              ? 'bg-secondary text-primary hover:opacity-90 active:scale-95 shadow-black/20 animate-pulse'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
          )}
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
          {saving ? 'Gravando...' : isAssembly ? 'Consolidar Montagem' : 'Confirmar Desmontagem'}
          {allOk && kitSku && !saving && <Zap className="w-4 h-4 text-primary/60" />}
        </button>
      </div>

      {/* === MODAL SCANNER === */}
      {showScanner && (
        <ScannerModal mode={mode} recipe={recipe} onClose={() => setShowScanner(false)} onAdd={handleAddComponent} />
      )}

      {/* === MODAL LIMPAR CONFIRMAÇÃO === */}
      {showClearModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div role="dialog" aria-modal="true" aria-labelledby="clear-modal-title"
            className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <RefreshCcw className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 id="clear-modal-title" className="text-lg font-black">Limpar Componentes?</h2>
              <p className="text-xs text-slate-500 mt-1">Todos os {componentes.length} componentes serão removidos. Esta ação não pode ser desfeita.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowClearModal(false)}
                className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">
                Cancelar
              </button>
              <button onClick={confirmClearAll}
                className="py-3 bg-red-600 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-red-700 transition-all">
                Sim, Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function KitStation() {
  const { warehouseId } = useApp();
  const [activeTab, setActiveTab] = useState('assembly');

  const tabs = [
    { id: 'assembly',    label: 'Montagem de Kit',    icon: Package,  },
    { id: 'disassembly', label: 'Desmontagem de Kit', icon: Scissors, },
  ];

  const actionGroups = [[
    { label: 'Montar Kit',    icon: Package,  onClick: () => setActiveTab('assembly'),    primary: activeTab === 'assembly' },
    { label: 'Desmontar Kit', icon: Scissors, onClick: () => setActiveTab('disassembly'), primary: activeTab === 'disassembly' },
  ]];

  return (
    <EnterprisePageBase
      title="2.14 Estação de Kits"
      subtitle="Montagem e Desmontagem de Conjuntos Comerciais"
      icon={Package}
      actionGroups={actionGroups}
    >
      <div className="space-y-6 pb-10">

        {/* TABS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-2 flex gap-2 shadow-sm w-fit" role="tablist">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} role="tab" aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200',
                  isActive
                    ? tab.id === 'assembly'
                      ? 'bg-secondary text-primary shadow-lg shadow-black/10'
                      : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}>
                <Icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PAINEL */}
        <KitPanel key={activeTab} mode={activeTab} warehouseId={warehouseId} />
      </div>
    </EnterprisePageBase>
  );
}
