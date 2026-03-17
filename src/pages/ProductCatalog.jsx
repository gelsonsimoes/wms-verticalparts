import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import {
  Package,
  Search,
  Plus,
  Save,
  Trash2,
  ChevronRight,
  Barcode,
  RefreshCw,
  Box,
  Tag,
  Layers,
  Settings,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Info,
  ShieldAlert,
  Ruler,
  Weight,
  Grid3X3,
  ArrowUpDown,
  Copy,
  Check,
  Upload,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Eye,
  EyeOff,
  BarChart3,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logActivity } from '../services/activityLogger';
import { useApp } from '../hooks/useApp';
import { cn } from '../utils/cn';
import Tooltip from '../components/ui/Tooltip';
import { 
  TIPOS, 
  FAMILIAS, 
  MARCAS, 
  UNIDADES, 
  REGRAS_EXP, 
  APRESEN 
} from '../mock/productCatalogData';

// ─── GERADOR EAN-13 simples ──────────────────────────────────────────
function gerarEAN13() {
  const digits = [7, 8, 9]; // prefixo Brasil
  for (let i = 0; i < 9; i++) digits.push(Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  digits.push((10 - (sum % 10)) % 10);
  return digits.join('');
}

// ─── INPUT HELPER ─────────────────────────────────────────────────────
function Field({ label, children, className, tooltip }) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
        {tooltip && <Tooltip text={tooltip}><Info className="w-3 h-3 text-slate-300" /></Tooltip>}
      </label>
      {React.cloneElement(React.Children.only(children), { id })}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[var(--vp-primary)] rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
const selectCls = cn(inputCls, "appearance-none cursor-pointer pr-10");

// ─── ABA DADOS DO PRODUTO ─────────────────────────────────────────────
// ─── ABA DADOS DO PRODUTO ─────────────────────────────────────────────
function TabDados({ prod, onChange }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Field label="Código SKU" tooltip="Identificador único Omie" className="md:col-span-1">
          <input 
            value={prod.codigo} 
            onChange={e => onChange('codigo', e.target.value.toUpperCase())}
            className={inputCls} 
            placeholder="Ex: 4001003534" 
          />
        </Field>
        <Field label="Unidade" className="md:col-span-1">
          <select 
            value={prod.unidade || 'PC'} 
            onChange={e => onChange('unidade', e.target.value)} 
            className={selectCls}
          >
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Tipo" className="md:col-span-1">
          <select 
            value={prod.tipo} 
            onChange={e => onChange('tipo', e.target.value)} 
            className={selectCls}
          >
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Família" className="md:col-span-1">
          <select 
            value={prod.familia} 
            onChange={e => onChange('familia', e.target.value)} 
            className={selectCls}
          >
            {FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>

        <Field label="Descrição Completa" className="md:col-span-4" tooltip="Nome do produto para etiquetas">
          <input 
            value={prod.descricao} 
            onChange={e => onChange('descricao', e.target.value)}
            className={inputCls} 
            placeholder="Ex: Barreira de Proteção Infravermelha..." 
          />
        </Field>

        <Field label="NCM" className="md:col-span-1">
          <input 
            value={prod.ncm || ''} 
            onChange={e => onChange('ncm', e.target.value)}
            className={cn(inputCls, "font-mono")} 
            placeholder="Ex: 7318.19.00" 
            maxLength={13} 
          />
        </Field>
        <Field label="Marca" className="md:col-span-1">
          <select 
            value={prod.marca} 
            onChange={e => onChange('marca', e.target.value)} 
            className={selectCls}
          >
            {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Local Estoque Omie" className="md:col-span-2" tooltip="Local de referência no ERP">
          <input 
            value={prod.local_estoque || ''} 
            onChange={e => onChange('local_estoque', e.target.value)}
            className={inputCls} 
            placeholder="Ex: VERTICAL CD CENTRAL" 
          />
        </Field>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <Ruler className="w-4 h-4 text-[var(--vp-primary)]" />
          <h3 className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest">Dimensões e Volumetria</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <Field label="Peso Bruto (kg)" className={cn(!prod.peso_bruto && "ring-2 ring-red-500/10 rounded-xl")}>
            <div className="relative">
              <input 
                type="number" step="0.001" 
                value={prod.peso_bruto || ''} 
                onChange={e => onChange('peso_bruto', +e.target.value)}
                className={cn(inputCls, !prod.peso_bruto && "border-red-200 focus:border-red-500")} 
                placeholder="0.000" 
              />
              {!prod.peso_bruto && <AlertCircle className="w-3.5 h-3.5 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />}
            </div>
          </Field>
          <Field label="Peso Líquido (kg)">
            <input type="number" step="0.001" value={prod.peso_liquido || ''} onChange={e => onChange('peso_liquido', +e.target.value)} className={inputCls} placeholder="0.000" />
          </Field>
          <Field label="Altura (cm)">
            <input type="number" step="0.1" value={prod.altura || ''} onChange={e => onChange('altura', +e.target.value)} className={inputCls} placeholder="0.0" />
          </Field>
          <Field label="Largura (cm)">
            <input type="number" step="0.1" value={prod.largura || ''} onChange={e => onChange('largura', +e.target.value)} className={inputCls} placeholder="0.0" />
          </Field>
          <Field label="Prod. (cm)">
            <input type="number" step="0.1" value={prod.profundidade || ''} onChange={e => onChange('profundidade', +e.target.value)} className={inputCls} placeholder="0.0" />
          </Field>
        </div>
        {prod.altura > 0 && prod.largura > 0 && prod.profundidade > 0 && (
          <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900 rounded-lg text-white shadow-lg">
            <Grid3X3 className="w-4 h-4 text-[var(--vp-primary)]" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Cubagem:</span>
            <span className="text-sm font-black text-[var(--vp-primary)] tracking-tight">
              {((prod.altura * prod.largura * prod.profundidade) / 1000000).toFixed(4)} m³
            </span>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <Field label="Observações Técnicas / Internas">
          <textarea 
            value={prod.observacao} 
            onChange={e => onChange('observacao', e.target.value)} 
            rows={3}
            className={cn(inputCls, "resize-none leading-relaxed")} 
            placeholder="Detalhes adicionais importantes para a operação..." 
          />
        </Field>
      </div>

      <div className={cn(
        'p-6 rounded-2xl border-2 transition-all flex items-start gap-4',
        prod.movimentaEstoque 
          ? 'bg-green-50/30 border-green-100 dark:bg-green-950/10 dark:border-green-900/40' 
          : 'bg-amber-50/30 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40'
      )}>
        <button
          onClick={() => onChange('movimentaEstoque', !prod.movimentaEstoque)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg',
            prod.movimentaEstoque ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
          )}
          aria-label="Alternar movimentação de estoque"
        >
          {prod.movimentaEstoque ? <Check className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
        </button>
        <div>
          <h4 className={cn('text-sm font-black uppercase tracking-tight', prod.movimentaEstoque ? 'text-green-700' : 'text-amber-700')}>
            {prod.movimentaEstoque ? 'Item com Estoque Físico' : 'Item do Tipo Serviço'}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {prod.movimentaEstoque 
              ? 'Este SKU será endereçado, conferido e auditado no armazém.' 
              : 'Este item não gera ocupação física no armazém (ex: mão de obra, taxas).'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ABA EMBALAGENS ───────────────────────────────────────────────────
function TabEmbalagens({ prod, onChange }) {
  const [copied, setCopied] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const handleCopy = (bc) => {
    navigator.clipboard.writeText(bc);
    setCopied(bc);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveRow = () => {
    if (!editRow.barcode) return;
    const embs = [...(prod.embalagens || [])];
    const existingIdx = embs.findIndex(e => e.id === editRow.id);
    
    if (existingIdx === -1) {
      const newEmb = { ...editRow, id: 'emb_' + crypto.randomUUID() };
      embs.push(newEmb);
    } else {
      embs[existingIdx] = editRow;
    }
    
    onChange('embalagens', embs);
    setEditRow(null);
  };

  const removeRow = (id) => onChange('embalagens', (prod.embalagens || []).filter(e => e.id !== id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Configuração de Volume</h3>
        {!editRow && (
          <button 
            onClick={() => setEditRow({ id: 'temp_' + Date.now(), barcode: '', apresentacao: APRESEN[0], fator: 1, lastro: 1, camada: 1, pesoBruto: 0 })}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--vp-primary)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />Nova Embalagem
          </button>
        )}
      </div>

      {editRow && (
        <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-[var(--vp-primary)]" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Editor de Unidade Logística</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Cód. de Barras (EAN)" className="md:col-span-2">
              <div className="flex gap-2">
                <input 
                  value={editRow.barcode} 
                  onChange={e => setEditRow({ ...editRow, barcode: e.target.value })}
                  className={cn(inputCls, "font-mono tracking-widest bg-slate-800 border-slate-700 text-white")} 
                />
                <button 
                  onClick={() => setEditRow({...editRow, barcode: gerarEAN13()})}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Gerar
                </button>
              </div>
            </Field>
            <Field label="Apresentação">
              <select 
                value={editRow.apresentacao} 
                onChange={e => setEditRow({ ...editRow, apresentacao: e.target.value })}
                className={cn(selectCls, "bg-slate-800 border-slate-700 text-white")}
              >
                {APRESEN.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Fator Conversão">
              <input type="number" value={editRow.fator} onChange={e => setEditRow({...editRow, fator: +e.target.value})} className={cn(inputCls, "bg-slate-800 border-slate-700 text-white")} />
            </Field>
            <Field label="Peso Bruto">
              <input type="number" step="0.001" value={editRow.pesoBruto} onChange={e => setEditRow({...editRow, pesoBruto: +e.target.value})} className={cn(inputCls, "bg-slate-800 border-slate-700 text-white")} />
            </Field>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 md:col-span-1 flex flex-col justify-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Paletização Estimada</p>
               <p className="text-2xl font-black text-[var(--vp-primary)]">{editRow.lastro * editRow.camada * editRow.fator} <span className="text-xs text-white/40">un / palete</span></p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button onClick={() => setEditRow(null)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
            <button onClick={saveRow} className="px-10 py-3 bg-[var(--vp-primary)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-105 active:scale-95 transition-all shadow-lg">Confirmar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(prod.embalagens || []).map(emb => (
          <div key={emb.id} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl group transition-all hover:border-[var(--vp-primary)] shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[var(--vp-primary)] group-hover:text-black transition-all">
                <Barcode className="w-5 h-5" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditRow(emb)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeRow(emb.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{emb.apresentacao}</p>
            <p className="text-lg font-black tracking-tight mb-3">Fator: {emb.fator}x</p>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <code className="text-xs font-bold text-slate-500 tracking-widest">{emb.barcode}</code>
               <button onClick={() => handleCopy(emb.barcode)} className="text-slate-300 hover:text-[var(--vp-primary)]">
                 {copied === emb.barcode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABA REGRAS DE NEGÓCIO ────────────────────────────────────────────
function TabRegras({ prod, onChange }) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
               <ArrowUpDown className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
               <h3 className="text-lg font-black uppercase tracking-tight">Algoritmo de Picking</h3>
               <p className="text-xs text-slate-400 font-medium">Define a prioridade de saída do item no armazém.</p>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGRAS_EXP.map(r => (
               <button 
                 key={r.value}
                 onClick={() => onChange('regraExpedicao', r.value)}
                 className={cn(
                   "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                   prod.regraExpedicao === r.value 
                     ? "border-[var(--vp-primary)] bg-[var(--vp-primary)]/5" 
                     : "border-slate-100 hover:border-slate-200"
                 )}
               >
                 {prod.regraExpedicao === r.value && (
                   <CheckCircle2 className="w-5 h-5 text-[var(--vp-primary)] absolute top-4 right-4" />
                 )}
                 <p className={cn("text-xs font-black uppercase tracking-[0.1em] mb-2", prod.regraExpedicao === r.value ? "text-slate-900" : "text-slate-400")}>{r.value}</p>
                 <p className="text-sm font-black mb-1">{r.label}</p>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{r.desc}</p>
               </button>
            ))}
         </div>
      </div>

      <div className="p-8 bg-amber-50/50 dark:bg-amber-950/10 border-2 border-amber-100 dark:border-amber-900/40 rounded-3xl flex items-start gap-6">
         <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
         <div>
            <h4 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-2">Protocolo VerticalParts (Qualidade)</h4>
            <p className="text-xs text-amber-700/80 font-medium leading-relaxed max-w-2xl">
               Seguindo o padrão de segurança VerticalCD 2025, o catálogo <strong>ignora campos de validade temporal</strong> por serem itens de hardware/elevador. 
               O controle de integridade é realizado integralmente via formulário de <strong>Avarias, Descrese de Lote e Quarentena Técnica</strong>.
            </p>
         </div>
      </div>
    </div>
  );
}

// ─── ABA ESTOQUE & DELTA ──────────────────────────────────────────────
function TabEstoque({ prod, onChange }) {
  const cards = [
    { label: 'Saldo ERP (Omie)', value: prod.estoque_erp, icon: FileSpreadsheet, color: 'text-blue-500', field: 'estoque_erp' },
    { label: 'Saldo WMS', value: prod.estoque_wms || 0, icon: Package, color: 'text-[var(--vp-primary)]', editable: false },
    { label: 'Inventário Real', value: prod.estoque_real, icon: Eye, color: 'text-green-500', field: 'estoque_real' },
    { label: 'Gatilho Mínimo', value: prod.estoque_minimo, icon: AlertCircle, color: 'text-red-500', field: 'estoque_minimo' },
  ];

  const delta = prod.estoque_erp != null ? prod.estoque_erp - (prod.estoque_real ?? (prod.estoque_wms || 0)) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <c.icon className={cn("w-4 h-4", c.color)} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{c.label}</p>
            </div>
            {c.editable !== false ? (
              <input 
                type="number" 
                value={c.value ?? ''} 
                onChange={e => onChange(c.field, e.target.value === '' ? null : +e.target.value)}
                className="w-full text-3xl font-black text-center bg-transparent focus:text-[var(--vp-primary)] outline-none transition-colors"
                placeholder="—"
              />
            ) : (
              <p className="text-3xl font-black text-center text-slate-800 dark:text-white">{c.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className={cn(
        "p-10 rounded-3xl border-2 flex flex-col md:flex-row items-center gap-8 text-center md:text-left shadow-lg",
        delta === null ? "bg-slate-50 border-slate-100" :
        delta === 0 ? "bg-green-500/5 border-green-500/20" :
        delta > 0 ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"
      )}>
        <div className={cn(
          "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-xl",
          delta === null ? "bg-slate-200" :
          delta === 0 ? "bg-green-500" : delta > 0 ? "bg-red-500" : "bg-amber-500"
        )}>
           {delta === null ? <Minus className="text-slate-400" /> :
            delta === 0 ? <Check className="text-white w-8 h-8" /> :
            delta > 0 ? <TrendingDown className="text-white w-8 h-8" /> : <TrendingUp className="text-white w-8 h-8" />}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-black tracking-tight mb-2">
            Status da Acuracidade: {delta === 0 ? 'Equilibrado' : delta != null ? 'Com Divergência' : 'Aguardando Dados'}
          </h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {delta === 0 && 'O estoque físico no armazém reflete exatamente o que consta no ERP Omie.'}
            {delta > 0 && `Existe uma quebra de ${delta} unidade(s). O sistema Omie apresenta saldo superior ao físico.`}
            {delta < 0 && `Sobras detectadas (${Math.abs(delta)} un). O armazém possui mais itens do que o registrado no Omie.`}
            {delta === null && 'Preencha o Saldo ERP para ativar o monitoramento de delta.'}
          </p>
        </div>
        {delta != null && (
          <div className="px-8 py-4 bg-slate-900 rounded-2xl text-[var(--vp-primary)] text-3xl font-black shrink-0">
             {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAPEAMENTO COLUNAS OMIE ─────────────────────────────────────────
const OMIE_COL = {
  1: 'codigo_integracao', 2: 'codigo', 3: 'descricao', 4: 'ncm',
  6: 'ean', 7: 'preco_venda', 8: 'unidade', 9: 'familia',
  10: 'estoque_minimo', 11: 'estoque_erp', 12: 'preco_custo',
  15: 'local_estoque', 16: 'peso_liquido', 17: 'peso_bruto',
  18: 'altura', 19: 'largura', 20: 'profundidade',
  21: 'marca', 24: 'dias_crossdocking', 34: 'descricao_detalhada', 37: 'observacao',
};

// ─── COMPONENTE ROOT ─────────────────────────────────────────────────
export default function ProductCatalog() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useApp();
  const _logUser = () => currentUser?.nome || currentUser?.usuario || 'OPERADOR';
  const savedTimeoutRef = useRef(null);

  const [produtos, setProdutos] = useState([]);
  const [, setFetching] = useState(true);
  const [selectedId, setSelectedId]   = useState(null);
  const [search,     setSearch]       = useState('');
  const [activeTab,  setActiveTab]    = useState(0);
  const [saved,      setSaved]        = useState(false);
  const [isNew,      setIsNew]        = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { total, ok, errors[] }
  const fileInputRef = useRef(null);

  // 1. Carregar produtos do Supabase
  const fetchProducts = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('sku', { ascending: true });
      
      if (error) throw error;
      
      // Adaptar campos se necessário (ex: codigo -> sku)
      const adapted = (data || []).map(p => ({
        ...p,
        codigo: p.sku, // Linkar com o UI existente que usa 'codigo'
        movimentaEstoque: p.movimenta_estoque,
        regraExpedicao: p.regra_expedicao
      }));

      setProdutos(adapted);

      // Lógica de deep-link (se vier da busca global)
      const skuParam = searchParams.get('sku');
      if (skuParam) {
        setSearch(skuParam);
        const find = adapted.find(p => p.sku === skuParam);
        if (find) setSelectedId(find.id);
      } else if (adapted.length > 0 && !selectedId) {
        setSelectedId(adapted[0].id);
      }
    } catch (err) {
      console.error('[ProductCatalog] Fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sincroniza busca se o parâmetro da URL mudar
  useEffect(() => {
    const sku = searchParams.get('sku');
    if (sku) {
      setSearch(sku);
      const find = produtos.find(p => p.sku === sku);
      if (find) setSelectedId(find.id);
    }
  }, [searchParams, produtos]);

  useEffect(() => () => { if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current); }, []);

  const TABS = [
    { label: 'Dados do Produto', icon: Package },
    { label: 'Embalagens',       icon: Box     },
    { label: 'Regras de Negócio',icon: Settings },
    { label: 'Estoque & Delta',  icon: BarChart3 },
  ];

  const filtered = useMemo(() =>
    produtos.filter(p =>
      (p.codigo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.descricao || '').toLowerCase().includes(search.toLowerCase())
    ), [produtos, search]);

  const selected = useMemo(() => produtos.find(p => p.id === selectedId), [produtos, selectedId]);

  const updateField = (field, value) => {
    setProdutos(ps => ps.map(p => p.id === selectedId ? { ...p, [field]: value } : p));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaved(false);
    
    try {
      // Prepara o payload completo agora que o banco terá as colunas
      const payload = {
        sku: (selected.codigo || '').trim().toUpperCase(),
        descricao: (selected.descricao || '').trim(),
        unidade: selected.unidade || 'PC',
        tipo: selected.tipo,
        familia: selected.familia,
        marca: selected.marca,
        ncm: selected.ncm || null,
        peso_bruto: selected.peso_bruto || null,
        peso_liquido: selected.peso_liquido || null,
        altura: selected.altura || null,
        largura: selected.largura || null,
        profundidade: selected.profundidade || null,
        local_estoque: selected.local_estoque || null,
        dias_crossdocking: selected.dias_crossdocking || null,
        estoque_erp: selected.estoque_erp ?? null,
        estoque_wms: selected.estoque_wms ?? 0,
        estoque_real: selected.estoque_real ?? null,
        estoque_minimo: selected.estoque_minimo ?? null,
        preco_venda: selected.preco_venda || null,
        preco_custo: selected.preco_custo || null,
        codigo_integracao: selected.codigo_integracao || null,
        movimenta_estoque: selected.movimentaEstoque,
        regra_expedicao: selected.regraExpedicao,
        observacao: selected.observacao,
        embalagens: selected.embalagens || []
      };

      if (!payload.sku || !payload.descricao || !payload.peso_bruto) {
        alert('SKU, Descrição e Peso Bruto são obrigatórios para conferência.');
        return;
      }

      console.log('[ProductCatalog] Saving payload:', payload);

      const { error } = await supabase
        .from('produtos')
        .upsert(payload, { onConflict: 'sku' });

      if (error) throw error;

      setSaved(true);
      setIsNew(false);
      logActivity({
        userName: _logUser(),
        action: isNew ? 'CRIOU' : 'ATUALIZOU',
        entity: 'produto',
        entityId: payload.sku,
        entityName: payload.sku,
        description: `Produto "${payload.sku} — ${payload.descricao}" ${isNew ? 'cadastrado' : 'atualizado'}.`,
        details: { descricao: payload.descricao, tipo: payload.tipo, familia: payload.familia },
      });
      await fetchProducts(); // Recarrega a lista do banco

      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[ProductCatalog] Save error:', err);
      alert(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`);
    }
  };

  // ─── IMPORTAR PLANILHA OMIE ─────────────────────────────
  const handleImportOmie = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input
    try {
      const XLSX = (await import('xlsx')).default;
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets['Omie_Produtos'] || wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Pula as 3 primeiras linhas (instrução, cabeçalho, limites)
      const dataRows = rows.slice(3).filter(r => r && r[2]); // só linhas com código
      const imported = [];
      const errors = [];
      for (let i = 0; i < dataRows.length; i++) {
        const r = dataRows[i];
        const sku = String(r[2] || '').trim();
        const desc = String(r[3] || '').trim();
        if (!sku || !desc) { errors.push(`Linha ${i+4}: SKU ou Descrição vazio`); continue; }
        imported.push({
          id: 'imp_' + Date.now() + '_' + i,
          codigo: sku, sku, descricao: desc,
          ncm: String(r[4] || ''),
          unidade: String(r[8] || 'PC').toUpperCase(),
          familia: String(r[9] || FAMILIAS[0]),
          marca: String(r[21] || MARCAS[0]),
          tipo: TIPOS[0],
          movimentaEstoque: true,
          regraExpedicao: 'FIFO',
          observacao: String(r[37] || r[34] || ''),
          estoque_minimo: r[10] ? +r[10] : null,
          estoque_erp: r[11] ? +r[11] : null,
          estoque_wms: 0,
          estoque_real: null,
          preco_venda: r[7] ? +r[7] : null,
          preco_custo: r[12] ? +r[12] : null,
          local_estoque: String(r[15] || ''),
          peso_liquido: r[16] ? +r[16] : null,
          peso_bruto: r[17] ? +r[17] : null,
          altura: r[18] ? +r[18] : null,
          largura: r[19] ? +r[19] : null,
          profundidade: r[20] ? +r[20] : null,
          dias_crossdocking: r[24] ? +r[24] : null,
          codigo_integracao: String(r[1] || ''),
          embalagens: r[6] ? [{ id: 'e_' + i, barcode: String(r[6]), apresentacao: '1x1 (Unitário)', fator: 1, lastro: 1, camada: 1, pesoBruto: r[17] ? +r[17] : 0 }] : [],
        });
      }
      setProdutos(prev => {
        const skuMap = new Map(prev.map(p => [p.codigo, p]));
        imported.forEach(p => skuMap.set(p.codigo, { ...skuMap.get(p.codigo), ...p }));
        return [...skuMap.values()];
      });
      if (imported.length > 0) setSelectedId(imported[0].id);
      setImportStatus({ total: dataRows.length, ok: imported.length, errors });
      setTimeout(() => setImportStatus(null), 10000);
    } catch (err) {
      console.error('[Import]', err);
      alert('Erro ao ler planilha: ' + err.message);
    }
  };

  const handleNew = () => {
    const novo = {
      id: 'temp_' + Date.now(),
      codigo: '', sku: '', descricao: '',
      tipo: TIPOS[0], familia: FAMILIAS[0], marca: MARCAS[0],
      unidade: 'PC', ncm: '',
      movimentaEstoque: true, observacao: '',
      regraExpedicao: 'FIFO', locaisPreferidos: '',
      peso_bruto: null, peso_liquido: null,
      altura: null, largura: null, profundidade: null,
      local_estoque: '', dias_crossdocking: 0,
      estoque_erp: null, estoque_wms: 0, estoque_real: null, estoque_minimo: null,
      preco_venda: null, preco_custo: null, codigo_integracao: '',
      embalagens: [],
    };
    setProdutos(ps => [novo, ...ps]);
    setSelectedId(novo.id);
    setActiveTab(0);
    setIsNew(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm(`Excluir o produto "${selected?.descricao || selected?.codigo}"? Esta ação não pode ser desfeita.`)) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('sku', selected.sku);

      if (error) throw error;

      logActivity({
        userName: _logUser(),
        action: 'EXCLUIU',
        entity: 'produto',
        entityId: selected.sku,
        entityName: selected.sku,
        description: `Produto "${selected.sku} — ${selected.descricao}" excluído permanentemente.`,
        level: 'WARNING',
      });

      const remaining = produtos.filter(p => p.id !== selectedId);
      setProdutos(remaining);
      setSelectedId(remaining[0]?.id || null);
      setIsNew(false);
      fetchProducts();
    } catch (err) {
      console.error('[ProductCatalog] Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* ══ HEADER ══ */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-amber-500 to-secondary" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">7. CADASTRAR — Gestão de Mestre</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">7.5 Cadastro de Produtos</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Hardware de Elevadores · Componentes Críticos · Unidades Logísticas</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative group">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black hover:border-secondary hover:text-secondary transition-all">
                <Upload className="w-4 h-4" />Importar Omie
              </button>
              <div className="absolute hidden group-hover:block z-[100] top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 text-[10px] font-bold text-white bg-slate-900 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-200">
                Suba a planilha do Omie (aba Omie_Produtos) para atualizar códigos e estoque ERP.
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-b-slate-900 border-x-transparent border-t-transparent" />
              </div>
            </div>
            <button onClick={handleNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-primary rounded-2xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
              <Plus className="w-4 h-4" />Novo Produto
            </button>
          </div>
        </div>
        {/* Status da importação */}
        {importStatus && (
          <div className="mt-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              Importação concluída! {importStatus.ok} de {importStatus.total} produtos importados.
              {importStatus.errors.length > 0 && ` (${importStatus.errors.length} com erros)`}
            </p>
          </div>
        )}
      </div>

      {/* ══ LAYOUT MASTER-DETAIL ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* MASTER — Lista lateral */}
        <div className="w-72 shrink-0 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col">
          {/* Busca */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Código ou Descrição..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all" />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 ml-1">{filtered.length} produto(s)</p>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(p => {
              const isSel = p.id === selectedId;
              return (
                <button key={p.id} onClick={() => { setSelectedId(p.id); setActiveTab(0); }}
                  className={cn('w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-all flex items-start gap-3',
                    isSel ? 'bg-secondary/10 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                  )}>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    isSel ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800'
                  )}>
                    <Package className={cn('w-4 h-4', isSel ? 'text-primary' : 'text-slate-400')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[10px] font-black font-mono truncate', isSel ? 'text-secondary' : 'text-slate-500')}>{p.codigo || '(sem código)'}</p>
                    <p className={cn('text-xs font-bold truncate leading-snug mt-0.5', isSel ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>{p.descricao || '(sem descrição)'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{p.tipo}</span>
                      {!p.movimentaEstoque && <span className="text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold">Serviço</span>}
                      {p.estoque_erp != null && <span className="text-[8px] font-black text-slate-400">ERP: {p.estoque_erp}</span>}
                    </div>
                  </div>
                  {isSel && <ChevronRight className="w-4 h-4 text-secondary shrink-0 mt-2" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* DETAIL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Sub-header do produto */}
              <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center gap-4 shrink-0">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isNew ? 'Novo Produto' : 'Editando'}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{selected.descricao || '(sem descrição)'}</p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {saved && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 animate-in fade-in duration-300">
                      <CheckCircle2 className="w-4 h-4" />Salvo!
                    </div>
                  )}
                  <button onClick={handleDelete} disabled={!selectedId || isNew}
                    className="flex items-center gap-1.5 px-3 py-2 border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-black transition-all disabled:opacity-30">
                    <Trash2 className="w-3.5 h-3.5" />Excluir
                  </button>
                  <button onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
                    <Save className="w-3.5 h-3.5" />Salvar Produto
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 flex gap-1 shrink-0">
                {TABS.map((t, i) => (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={cn('flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all -mb-[2px]',
                      activeTab === i ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    )}>
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                    {t.label === 'Embalagens' && (
                      <span className={cn('text-[8px] font-black px-1.5 py-0.5 rounded-full',
                        activeTab === i ? 'bg-secondary/20 text-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      )}>{selected.embalagens.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Conteúdo da aba */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 0 && <TabDados   prod={selected} onChange={updateField} />}
                {activeTab === 1 && <TabEmbalagens prod={selected} onChange={updateField} />}
                {activeTab === 2 && <TabRegras  prod={selected} onChange={updateField} />}
                {activeTab === 3 && <TabEstoque prod={selected} onChange={updateField} />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-400">Selecione um produto à esquerda</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportOmie} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />
    </div>
  );
}
