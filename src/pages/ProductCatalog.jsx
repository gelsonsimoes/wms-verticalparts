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
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── ENUMS ────────────────────────────────────────────────────────────
const TIPOS    = ['Peça', 'Conjunto', 'Serviço', 'Embalagem', 'Consumível'];
const FAMILIAS = ['Motor', 'Freio', 'Cabine', 'Contrapeso', 'Guia de Corrediça', 'Painel Elétrico', 'Porta', 'Cabos e Cintas', 'Escada Rolante', 'Segurança', 'Sinalização', 'Outros'];
const MARCAS   = ['Atlas Schindler', 'Otis', 'ThyssenKrupp', 'Kone', 'Mitsubishi', 'Hidra', 'Genérico', 'Importado'];
const UNIDADES = ['PC', 'UN', 'KG', 'MT', 'M2', 'M3', 'LT', 'CX', 'PAR', 'JG', 'KIT', 'RL', 'SC', 'BD', 'FD', 'GL', 'TB', 'PT'];
const REGRAS_EXP = [
  { value: 'FIFO', label: 'FIFO — First In, First Out', desc: 'Expede o lote mais antigo primeiro.' },
  { value: 'LIFO', label: 'LIFO — Last In, First Out',  desc: 'Expede o lote mais recente primeiro.' },
  { value: 'LOC',  label: 'Sequência de Locais',        desc: 'Expede conforme a posição física do endereço (rua → coluna → nível).' },
];
const APRESEN  = ['1x1 (Unitário)', '6x1', '12x1', '24x1', 'Caixa Master'];

// ─── GERADOR EAN-13 simples ──────────────────────────────────────────
function gerarEAN13() {
  const digits = [7, 8, 9]; // prefixo Brasil
  for (let i = 0; i < 9; i++) digits.push(Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  digits.push((10 - (sum % 10)) % 10);
  return digits.join('');
}

// ─── DADOS MOCK ───────────────────────────────────────────────────────
const PRODUTOS_INIT = [
  {
    id: 'P001', codigo: 'VEPEL-BPI-174FX', descricao: 'Barreira de Proteção Infravermelha (174 Feixes)',
    tipo: 'Peça', familia: 'Segurança', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Barreira de segurança infravermelha com 174 feixes para portas de elevadores.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP1_CL001_N001',
    embalagens: [
      { id:'e1', barcode:'7891234560001', apresentacao:'1x1 (Unitário)', fator:1,  lastro:10, camada:5, pesoBruto:2.500 },
    ],
  },
  {
    id: 'P002', codigo: 'VPER-ESS-NY-27MM', descricao: 'Escova de Segurança (Nylon - Base 27mm)',
    tipo: 'Peça', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Escova de segurança em nylon com base de 27mm para degraus de escada rolante.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP2_CL010_N001',
    embalagens: [
      { id:'e3', barcode:'7891234560010', apresentacao:'1x1 (Unitário)', fator:1, lastro:5, camada:3, pesoBruto:1.200 },
    ],
  },
  {
    id: 'P003', codigo: 'VPER-PAL-INO-1000', descricao: 'Pallet de Aço Inox (1000mm)',
    tipo: 'Conjunto', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Degrau (Pallet) completo em aço inox para escadas rolantes de 1000mm.',
    regraExpedicao: 'LOC', locaisPreferidos: 'R2_PP1_CL001_N001',
    embalagens: [
      { id:'e4', barcode:'7891234560020', apresentacao:'1x1 (Unitário)', fator:1, lastro:1, camada:1, pesoBruto:15.200 },
    ],
  },
  {
    id: 'P004', codigo: 'VPER-INC-ESQ', descricao: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS',
    tipo: 'Peça', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Capa interna esquerda para acabamento de escadas rolantes.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP3_CL005_N002',
    embalagens: [
      { id:'e5', barcode:'7891234560030', apresentacao:'1x1 (Unitário)', fator:1, lastro:10, camada:10, pesoBruto:0.450 },
    ],
  },
  {
    id: 'P005', codigo: 'VPER-LUM-LED-VRD-24V', descricao: 'Luminária em LED Verde 24V',
    tipo: 'Peça', familia: 'Sinalização', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Luminária indicativa de LED verde 24V para sinalização de poço ou cabine.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP1_CL002_N005',
    embalagens: [
      { id:'e6', barcode:'7891234560040', apresentacao:'1x1 (Unitário)', fator:1, lastro:20, camada:5, pesoBruto:0.150 },
    ],
  },
];

import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

// ─── INPUT HELPER ─────────────────────────────────────────────────────
// Gera um id único por instância (React 18+) e vincula label→input
function Field({ label, children, className }) {
  const id = useId();
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {React.cloneElement(React.Children.only(children), { id })}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const selectCls = inputCls + " appearance-none cursor-pointer";

// ─── COMPONENTE DE AJUDA (TOOLTIP) ────────────────────────────
const HelpTip = ({ text, position = 'top' }) => (
  <div className="group relative inline-block ml-1.5 focus:outline-none shrink-0" tabIndex="0">
    <Info className="w-3 h-3 text-slate-400 hover:text-secondary cursor-help transition-colors" />
    <div className={cn(
      "absolute hidden group-hover:block z-[100] w-48 p-2.5 text-[10px] font-bold leading-tight text-white bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 pointer-events-none",
      position === 'top' ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : "top-full left-1/2 -translate-x-1/2 mt-2"
    )}>
      {text}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 border-4",
        position === 'top' 
          ? "top-full border-t-slate-900 border-x-transparent border-b-transparent" 
          : "bottom-full border-b-slate-900 border-x-transparent border-t-transparent"
      )} />
    </div>
  </div>
);

// ─── ABA DADOS DO PRODUTO ─────────────────────────────────────────────
function TabDados({ prod, onChange }) {
  return (
    <div className="space-y-5">
      {/* Identificação */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label={<span className="flex items-center">Código do Produto (SKU) <HelpTip text="Identificador único no ERP Omie. Sincronizado automaticamente." /></span>}>
          <input value={prod.codigo} onChange={e => onChange('codigo', e.target.value)}
            className={inputCls} placeholder="Ex: 4001003534" />
        </Field>
        <Field label={<span className="flex items-center">Unidade <HelpTip text="Unidade de medida principal (PC, UN, KG). Vem do Omie." /></span>}>
          <select value={prod.unidade || 'PC'} onChange={e => onChange('unidade', e.target.value)} className={selectCls}>
            {UNIDADES.map(u => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Tipo">
          <select value={prod.tipo} onChange={e => onChange('tipo', e.target.value)} className={selectCls}>
            {TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label={<span className="flex items-center">Descrição <HelpTip text="Nome completo do produto para etiquetas e conferência." /></span>} className="col-span-2 md:col-span-3">
          <input value={prod.descricao} onChange={e => onChange('descricao', e.target.value)}
            className={inputCls} placeholder="Descrição completa do produto..." />
        </Field>
        <Field label={<span className="flex items-center">Código NCM <HelpTip text="Campo fiscal obrigatório. Importado automaticamente do cadastro Omie." /></span>}>
          <input value={prod.ncm || ''} onChange={e => onChange('ncm', e.target.value)}
            className={inputCls + " font-mono"} placeholder="Ex: 7318.19.00" maxLength={13} />
        </Field>
        <Field label="Família">
          <select value={prod.familia} onChange={e => onChange('familia', e.target.value)} className={selectCls}>
            {FAMILIAS.map(f => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Marca">
          <select value={prod.marca} onChange={e => onChange('marca', e.target.value)} className={selectCls}>
            {MARCAS.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </div>

      {/* Dimensões e Peso */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5" />Dimensões e Peso
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label={
            <span className="flex items-center gap-1.5 ring-offset-2 ring-primary/20">
              Peso Bruto (kg) *
              {!prod.peso_bruto && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
            </span>
          }>
            <input 
              type="number" 
              min="0" 
              step="0.001" 
              value={prod.peso_bruto || ''} 
              onChange={e => onChange('peso_bruto', +e.target.value)}
              className={cn(inputCls, !prod.peso_bruto && "border-red-400 focus:border-red-500")} 
              placeholder="0.000" 
              required
            />
          </Field>
          <Field label="Peso Líquido (kg)">
            <input type="number" min="0" step="0.001" value={prod.peso_liquido || ''} onChange={e => onChange('peso_liquido', +e.target.value)}
              className={inputCls} placeholder="0.000" />
          </Field>
          <Field label="Altura (cm)">
            <input type="number" min="0" step="0.1" value={prod.altura || ''} onChange={e => onChange('altura', +e.target.value)}
              className={inputCls} placeholder="0.0" />
          </Field>
          <Field label="Largura (cm)">
            <input type="number" min="0" step="0.1" value={prod.largura || ''} onChange={e => onChange('largura', +e.target.value)}
              className={inputCls} placeholder="0.0" />
          </Field>
          <Field label="Profundidade (cm)">
            <input type="number" min="0" step="0.1" value={prod.profundidade || ''} onChange={e => onChange('profundidade', +e.target.value)}
              className={inputCls} placeholder="0.0" />
          </Field>
        </div>
        {(prod.altura > 0 && prod.largura > 0 && prod.profundidade > 0) && (
          <div className="mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 flex items-center gap-2">
            <Grid3X3 className="w-3.5 h-3.5 shrink-0" />
            Cubagem: <strong className="text-secondary">{((prod.altura * prod.largura * prod.profundidade) / 1000000).toFixed(4)} m³</strong>
          </div>
        )}
      </div>

      {/* Local de Estoque + Crossdocking */}
      <div className="grid grid-cols-2 gap-4">
        <Field label={<span className="flex items-center">Local de Estoque (Omie) <HelpTip text="Endereço de referência no Omie. Serve como guia para alocação no WMS." /></span>}>
          <input value={prod.local_estoque || ''} onChange={e => onChange('local_estoque', e.target.value)}
            className={inputCls} placeholder="Ex: VERTICAL MP - Estoque Próprio" />
        </Field>
        <Field label={<span className="flex items-center">Dias de Crossdocking <HelpTip text="Tempo máximo permitido na área de transbordo (Recebimento → Expedição Direta)." /></span>}>
          <input type="number" min="0" value={prod.dias_crossdocking || 0} onChange={e => onChange('dias_crossdocking', +e.target.value)}
            className={inputCls} />
        </Field>
      </div>

      {/* Observações */}
      <Field label="Observações">
        <textarea value={prod.observacao} onChange={e => onChange('observacao', e.target.value)} rows={2}
          className={inputCls + " resize-none"} placeholder="Detalhes adicionais, especificações técnicas..." />
      </Field>

      {/* Movimenta Estoque */}
      <div className={cn('border-2 rounded-2xl p-4 flex items-start gap-4 transition-all',
        prod.movimentaEstoque ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800/50' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50'
      )}>
        <button
          role="checkbox"
          aria-checked={prod.movimentaEstoque}
          aria-label={prod.movimentaEstoque ? 'Movimenta estoque físico — clique para desativar' : 'Não movimenta estoque — clique para ativar'}
          onClick={() => onChange('movimentaEstoque', !prod.movimentaEstoque)}
          className={cn('w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
            prod.movimentaEstoque ? 'bg-green-600 border-green-600' : 'border-amber-400 bg-white dark:bg-slate-800'
          )}
        >
          {prod.movimentaEstoque && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
        </button>
        <div>
          <p className={cn('text-sm font-black flex items-center', prod.movimentaEstoque ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400')}>
            Movimenta Estoque Físico
            <HelpTip text="Define se o item gera saldo físico no armazém ou se é apenas um serviço não estocável." />
          </p>
          {prod.movimentaEstoque
            ? <p className="text-[10px] text-green-600 dark:text-green-500 mt-0.5 font-medium">Este item é uma <strong>peça / produto físico</strong> — entra e sai do estoque do armazém.</p>
            : <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5 font-medium">Este item é um <strong>serviço</strong> — não gera movimentação ou endereçamento físico.</p>
          }
        </div>
      </div>

      {/* Nota de Negócio */}
      <div className="flex items-start gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-medium">
          <strong className="text-slate-600 dark:text-slate-300">Regra VerticalParts:</strong> Este sistema não utiliza data de validade/vencimento. O controle de qualidade opera via <strong className="text-slate-600 dark:text-slate-300">Avarias e Desmembramento de Peças</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── ABA EMBALAGENS ───────────────────────────────────────────────────
function TabEmbalagens({ prod, onChange }) {
  const [copied, setCopied] = useState(null);
  const [newRow, setNewRow] = useState(false);
  const [editRow, setEditRow] = useState(null); // { barcode, apresentacao, fator, lastro, camada, pesoBruto }

  const emptyRow = () => ({ id: 'emb_' + crypto.randomUUID(), barcode:'', apresentacao: APRESEN[0], fator:1, lastro:1, camada:1, pesoBruto:0 });

  const startNew = () => { setEditRow(emptyRow()); setNewRow(true); };

  const gerarBarcode = () => {
    // Garante unicidade: gera até encontrar um EAN que não exista nas embalagens do produto
    let bc;
    const existentes = new Set(prod.embalagens.map(e => e.barcode));
    let tentativas = 0;
    do { bc = gerarEAN13(); tentativas++; } while (existentes.has(bc) && tentativas < 20);
    setEditRow(r => ({ ...r, barcode: bc }));
  };

  const copyBarcode = (bc) => {
    navigator.clipboard?.writeText(bc).catch(() => {});
    setCopied(bc);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveRow = () => {
    // Validação dos campos obrigatórios e limites lógicos
    if (!editRow.barcode) return;
    if (editRow.fator    < 1) return;
    if (editRow.lastro   < 1) return;
    if (editRow.camada   < 1) return;
    if (editRow.pesoBruto < 0) return;
    const embs = [...prod.embalagens];
    if (newRow) {
      embs.push(editRow);
    } else {
      const idx = embs.findIndex(e => e.id === editRow.id);
      if (idx >= 0) embs[idx] = editRow;
    }
    onChange('embalagens', embs);
    setEditRow(null);
    setNewRow(false);
  };

  const removeRow = (id) => onChange('embalagens', prod.embalagens.filter(e => e.id !== id));

  const startEdit = (emb) => { setEditRow({ ...emb }); setNewRow(false); };

  const cancelEdit = () => { setEditRow(null); setNewRow(false); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5" />{prod.embalagens.length} embalagem(ns) cadastrada(s)
        </p>
        {!editRow && (
          <button onClick={startNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
            <Plus className="w-3.5 h-3.5" />Nova Embalagem
          </button>
        )}
      </div>

      {/* Editor inline */}
      {editRow && (
        <div className="bg-secondary/5 border-2 border-secondary/30 rounded-2xl p-5 space-y-4">
          <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{newRow ? '➕ Nova Embalagem' : '✏️ Editando Embalagem'}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Código de Barras */}
            <Field label="Código de Barras (EAN)" className="col-span-2 md:col-span-2">
              <div className="flex gap-2">
                <input value={editRow.barcode} onChange={e => setEditRow(r => ({ ...r, barcode: e.target.value }))}
                  className={inputCls + " font-mono tracking-widest"} placeholder="Ex: 7891234560001" maxLength={14} />
                <button
                  onClick={gerarBarcode}
                  aria-label="Gerar código de barras EAN-13 automático"
                  className="shrink-0 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Barcode className="w-4 h-4" aria-hidden="true" />Gerar
                </button>
              </div>
            </Field>
            <Field label="Apresentação">
              <select value={editRow.apresentacao} onChange={e => setEditRow(r => ({ ...r, apresentacao: e.target.value }))} className={selectCls}>
                {APRESEN.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Fator de Conversão">
              <input type="number" min="1" value={editRow.fator} onChange={e => setEditRow(r => ({ ...r, fator: +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Lastro (Qtde/Camada)">
              <input type="number" min="1" value={editRow.lastro} onChange={e => setEditRow(r => ({ ...r, lastro: +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Camadas">
              <input type="number" min="1" value={editRow.camada} onChange={e => setEditRow(r => ({ ...r, camada: +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Peso Bruto (kg)">
              <input type="number" min="0" step="0.001" value={editRow.pesoBruto} onChange={e => setEditRow(r => ({ ...r, pesoBruto: +e.target.value }))} className={inputCls} />
            </Field>
          </div>
          {/* Qtde por Palete (calculado) */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-3 text-[10px] font-bold text-slate-500">
            <Grid3X3 className="w-3.5 h-3.5 shrink-0" />
            Palete completo: <strong className="text-secondary text-sm">{editRow.lastro * editRow.camada * editRow.fator}</strong> un · {(editRow.lastro * editRow.camada)} cx/palete · {editRow.camada} camada(s) de {editRow.lastro} caixa(s)
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={cancelEdit} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-black hover:border-slate-400 transition-all">Cancelar</button>
            <button
              onClick={saveRow}
              disabled={!editRow.barcode || editRow.fator < 1 || editRow.lastro < 1 || editRow.camada < 1 || editRow.pesoBruto < 0}
              className="px-5 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />Salvar Embalagem
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {prod.embalagens.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {['Cód. de Barras','Apresentação','Fator','Lastro','Camadas','Peso Bruto','Cx/Palete','Ações'].map(h => (
                  <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prod.embalagens.map(emb => (
                <tr key={emb.id} className={cn('border-t border-slate-100 dark:border-slate-800 hover:bg-secondary/5 transition-all group',
                  editRow?.id === emb.id && !newRow ? 'bg-secondary/10' : ''
                )}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <code className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest">{emb.barcode}</code>
                      <button
                        onClick={() => copyBarcode(emb.barcode)}
                        aria-label={copied === emb.barcode ? 'Código copiado!' : `Copiar código de barras ${emb.barcode}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copied === emb.barcode
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
                          : <Copy        className="w-3.5 h-3.5 text-slate-400 hover:text-secondary" aria-hidden="true" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-black bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">{emb.apresentacao}</span>
                  </td>
                  <td className="p-3 text-center text-xs font-black text-slate-600 dark:text-slate-400">{emb.fator}x</td>
                  <td className="p-3 text-center text-xs font-black text-slate-600 dark:text-slate-400">{emb.lastro}</td>
                  <td className="p-3 text-center text-xs font-black text-slate-600 dark:text-slate-400">{emb.camada}</td>
                  <td className="p-3 text-right">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{emb.pesoBruto.toLocaleString('pt-BR', { minimumFractionDigits:3 })} kg</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xs font-black text-secondary">{emb.lastro * emb.camada * emb.fator} un</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(emb)}
                        aria-label={`Editar embalagem ${emb.apresentacao} (${emb.barcode})`}
                        className="p-1.5 hover:bg-secondary/10 rounded-lg transition-all text-slate-400 hover:text-secondary"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => removeRow(emb.id)}
                        aria-label={`Excluir embalagem ${emb.apresentacao} (${emb.barcode})`}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !editRow && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Nenhuma embalagem cadastrada</p>
            <p className="text-[10px] text-slate-300 mt-1">Clique em "Nova Embalagem" para adicionar caixas ou paletes.</p>
          </div>
        )
      )}
    </div>
  );
}

// ─── ABA REGRAS DE NEGÓCIO ────────────────────────────────────────────
function TabRegras({ prod, onChange }) {
  const regra = REGRAS_EXP.find(r => r.value === prod.regraExpedicao) || REGRAS_EXP[0];

  return (
    <div className="space-y-5">
      {/* Regra de Expedição */}
      <div className="space-y-3">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" />Regra de Expedição
          <HelpTip text="Define qual lote sairá primeiro no Picking: o mais antigo (FIFO) ou o mais novo (LIFO)." />
        </label>
        <div className="space-y-2">
          {REGRAS_EXP.map(r => (
            <label
              key={r.value}
              className={cn('flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                r.value === prod.regraExpedicao
                  ? 'border-secondary/60 bg-secondary/5'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              )}
            >
              {/* Radio nativo oculto — garante acessibilidade por teclado e leitores de tela */}
              <input
                type="radio"
                name="regraExpedicao"
                value={r.value}
                checked={prod.regraExpedicao === r.value}
                onChange={() => onChange('regraExpedicao', r.value)}
                className="sr-only"
              />
              <div
                aria-hidden="true"
                className={cn('w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all',
                  r.value === prod.regraExpedicao ? 'border-secondary bg-secondary' : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {r.value === prod.regraExpedicao && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className={cn('text-sm font-black', r.value === prod.regraExpedicao ? 'text-secondary' : 'text-slate-700 dark:text-slate-300')}>{r.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Locais Preferenciais */}
      {prod.regraExpedicao === 'LOC' && (
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Locais Preferidos (separados por vírgula)</label>
          <input value={prod.locaisPreferidos || ''} onChange={e => onChange('locaisPreferidos', e.target.value)}
            className={inputCls} placeholder="Ex: R1_PP1_CL001_N001" />
        </div>
      )}

      {/* Aviso regra VerticalParts */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-700 dark:text-amber-400">Regra de Negócio VerticalParts</p>
          <p className="text-[10px] text-amber-600/90 dark:text-amber-500/80 font-medium mt-0.5">
            Este sistema <strong>não utiliza campos de Data de Validade/Vencimento</strong>. O controle de qualidade é feito exclusivamente através do módulo de <strong>Avarias e Desmembramento de Peças</strong> (Cat. 4 → Controle de Avarias).
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── BADGE DE DELTA ───────────────────────────────────────────────────
function DeltaBadge({ erp, wms, real }) {
  const base = real != null ? real : wms;
  if (erp == null || base == null) return <span className="text-[9px] text-slate-300 font-bold">—</span>;
  const delta = erp - base;
  if (delta === 0) return <span className="flex items-center gap-0.5 text-[10px] font-black text-green-600"><CheckCircle2 className="w-3 h-3" />OK</span>;
  if (delta > 0) return <span className="flex items-center gap-0.5 text-[10px] font-black text-red-500"><TrendingDown className="w-3 h-3" />+{delta}</span>;
  return <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-500"><TrendingUp className="w-3 h-3" />{delta}</span>;
}

// ─── ABA ESTOQUE & DELTA ──────────────────────────────────────────────
function TabEstoque({ prod, onChange }) {
  const estoqueErp = prod.estoque_erp ?? null;
  const estoqueWms = prod.estoque_wms ?? 0;
  const estoqueReal = prod.estoque_real ?? null;
  const base = estoqueReal != null ? estoqueReal : estoqueWms;
  const delta = estoqueErp != null ? estoqueErp - base : null;

  const cards = [
    { label: 'Estoque ERP (Omie)', value: estoqueErp, icon: FileSpreadsheet, color: 'blue', editable: true, field: 'estoque_erp' },
    { label: 'Estoque WMS', value: estoqueWms, icon: Package, color: 'secondary', editable: false },
    { label: 'Estoque Real', value: estoqueReal, icon: Eye, color: 'emerald', editable: true, field: 'estoque_real' },
    { label: 'Estoque Mínimo', value: prod.estoque_minimo, icon: AlertCircle, color: 'amber', editable: true, field: 'estoque_minimo' },
  ];

  return (
    <div className="space-y-5">
      {/* Cards de estoque */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <c.icon className="w-3.5 h-3.5" />{c.label}
            </p>
            {c.editable ? (
              <input type="number" min="0" value={c.value ?? ''} onChange={e => onChange(c.field, e.target.value === '' ? null : +e.target.value)}
                className={inputCls + " text-lg font-black text-center"} placeholder="—" />
            ) : (
              <p className="text-2xl font-black text-slate-700 dark:text-slate-200 text-center">{c.value ?? '—'}</p>
            )}
          </div>
        ))}
      </div>

      {/* Delta visual */}
      <div className={cn('border-2 rounded-2xl p-5 flex items-center gap-4',
        delta === null ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' :
        delta === 0 ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800/50' :
        delta > 0 ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800/50' :
        'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50'
      )}>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
          delta === null ? 'bg-slate-200 dark:bg-slate-800' :
          delta === 0 ? 'bg-green-600' : delta > 0 ? 'bg-red-500' : 'bg-amber-500'
        )}>
          {delta === null ? <Minus className="w-5 h-5 text-slate-400" /> :
           delta === 0 ? <Check className="w-5 h-5 text-white" /> :
           delta > 0 ? <TrendingDown className="w-5 h-5 text-white" /> :
           <TrendingUp className="w-5 h-5 text-white" />}
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 dark:text-white flex items-center">
            Delta ERP vs {estoqueReal != null ? 'Real' : 'WMS'}: {delta != null ? (delta > 0 ? `+${delta}` : delta) : 'Sem dados'}
            <HelpTip text="Discrepância entre o saldo do Omie e o saldo físico atual. 0 indica estoque perfeito." />
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {delta === null && 'Preencha o Estoque ERP para ver a discrepância.'}
            {delta === 0 && '✅ Estoque bateu! Sem divergência entre ERP e armazém.'}
            {delta > 0 && `⚠️ O Omie diz ter ${delta} unidade(s) a MAIS que o ${estoqueReal != null ? 'inventário real' : 'WMS'}. Possível perda, furto ou entrada sem registro.`}
            {delta < 0 && `⚠️ O Omie diz ter ${Math.abs(delta)} unidade(s) a MENOS que o ${estoqueReal != null ? 'inventário real' : 'WMS'}. Possível entrada não faturada ou erro no ERP.`}
          </p>
        </div>
      </div>

      {/* Alerta estoque mínimo */}
      {prod.estoque_minimo > 0 && estoqueErp != null && estoqueErp <= prod.estoque_minimo && (
        <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-black text-red-700 dark:text-red-400">
            ⚠️ Estoque abaixo do mínimo! Atual: {estoqueErp} · Mínimo: {prod.estoque_minimo}
          </p>
        </div>
      )}
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
  const savedTimeoutRef = useRef(null);

  const [produtos, setProdutos] = useState([]);
  const [loading, setFetching] = useState(true);
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

  useEffect(() => { fetchProducts(); }, []);

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
      await fetchProducts(); // Recarrega a lista do banco
      
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[ProductCatalog] Save error:', err);
      // Mostra o erro detalhado para o usuário ajudar a identificar colunas faltando
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
    if (!selectedId || produtos.length <= 1) return;
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('sku', selected.sku);

      if (error) throw error;

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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">7.4 Cadastro e Segurança</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">7.4 Catálogo de Produtos</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Peças de elevador · Conjuntos · Embalagens · Regras de expedição</p>
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Código ou Descrição..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all" />
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
                      {p.estoque_erp != null && <DeltaBadge erp={p.estoque_erp} wms={p.estoque_wms} real={p.estoque_real} />}
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
                  <button onClick={handleDelete} disabled={produtos.length <= 1}
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
    </div>
  );
}
