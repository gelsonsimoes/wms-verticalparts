import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package, Search, Plus, Save, Trash2, Upload, Download,
  ChevronRight, Zap, Settings, Box, Layers, Camera,
  Bot, Send, X, CheckCircle2, AlertCircle, Copy, Check,
  RefreshCw, Tag, Ruler, Weight, FileSpreadsheet, Info,
  TrendingUp, TrendingDown, Minus, Building2,
  Image, Barcode, Link2, Wrench, FileText,
  MapPin, ArrowUpDown, Hash, Cable, Eye, EyeOff,
  Printer, QrCode,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { supabase } from '../services/supabaseClient';

function cn(...i) { return twMerge(clsx(i)); }

const inputCls = 'w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400 transition';
const labelCls = 'text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const VP_PREFIXES = [
  { code: 'VPEL',    desc: 'Peças para Elevadores',            group: 'Peças' },
  { code: 'VPER',    desc: 'Peças para Escadas Rolantes',      group: 'Peças' },
  { code: 'VPMP',    desc: 'Matéria-Prima',                    group: 'Materiais' },
  { code: 'VPIN',    desc: 'Insumo de Produção',               group: 'Materiais' },
  { code: 'VPCON',   desc: 'Uso e Consumo',                    group: 'Interno' },
  { code: 'VPAT',    desc: 'Ativo Imobilizado',                group: 'Interno' },
  { code: 'VP-P',    desc: 'Elevador de Passageiros',          group: 'Equipamentos' },
  { code: 'VP-E',    desc: 'Elevador de Carga',                group: 'Equipamentos' },
  { code: 'VP-Y',    desc: 'Elevador Maca',                    group: 'Equipamentos' },
  { code: 'VP-G',    desc: 'Elevador Panorâmico',              group: 'Equipamentos' },
  { code: 'VP-V',    desc: 'Homelift',                         group: 'Equipamentos' },
  { code: 'VP-A',    desc: 'Elevador para Automóveis',         group: 'Equipamentos' },
  { code: 'VP-X',    desc: 'Plataforma',                       group: 'Equipamentos' },
  { code: 'OAK',     desc: 'Escada Rolante Nova (importada)',  group: 'Equipamentos' },
  { code: 'SEQUOIA', desc: 'Esteira Rolante Nova (importada)', group: 'Equipamentos' },
  { code: 'VPESC',   desc: 'Escada Rolante Remanufaturada',    group: 'Remanuf.' },
  { code: 'VPEST',   desc: 'Esteira Rolante Remanufaturada',   group: 'Remanuf.' },
  { code: 'VPMO',    desc: 'Monarch — Peças e Equipamentos (Representada)', group: 'Parceiros' },
  { code: 'VPBT',    desc: 'BST — Peças e Equipamentos (Representada)',     group: 'Parceiros' },
];

const PREFIXES_WITH_NATUREZA = new Set(['VPEL', 'VPER', 'VPMP', 'VPIN', 'VPMO', 'VPBT']);

const NATUREZAS = [
  { code: 'eletrico', label: 'Elétrico',              Icon: Zap      },
  { code: 'porta',    label: 'Porta / Entrada',        Icon: Box      },
  { code: 'corrimao', label: 'Corrimão (Handrail)',    Icon: Layers   },
  { code: 'roldana',  label: 'Roldana / Rolamento',    Icon: Settings },
  { code: 'corrente', label: 'Corrente de Transmissão',Icon: Link2    },
  { code: 'cabo',     label: 'Cabo / Fio',             Icon: Cable    },
  { code: 'mecanico', label: 'Mecânico Geral',         Icon: Wrench   },
  { code: 'outro',    label: 'Outro (manual)',          Icon: Package  },
];

const NATUREZA_FIELDS = {
  eletrico: [
    { key:'tipo_el',    label:'Tipo',              type:'select', sku:true,
      options:[{v:'MOT',l:'Motor'},{v:'BOT',l:'Botoeira'},{v:'SEN',l:'Sensor'},
               {v:'LUM',l:'Luminária'},{v:'CMD',l:'Quadro/Comando'},{v:'INV',l:'Inversor/VVVF'},
               {v:'UPS',l:'Nobreak'},{v:'CEL',l:'Cabo Elétrico'},{v:'CON',l:'Contator'},
               {v:'REL',l:'Relé'},{v:'INT',l:'Interruptor'},{v:'OUT',l:'Outro'}] },
    { key:'potencia',   label:'Potência',          type:'number', placeholder:'1.5', unitSel:['W','kW','CV','VA'], sku:true },
    { key:'tensao',     label:'Tensão (V)',         type:'number', placeholder:'220', unit:'V', sku:true },
    { key:'cor_el',     label:'Tipo de Corrente',  type:'select', sku:false,
      options:[{v:'AC',l:'AC — Alternada'},{v:'DC',l:'DC — Contínua'}] },
    { key:'frequencia', label:'Frequência (Hz)',   type:'number', placeholder:'60', unit:'Hz', sku:true },
    { key:'corrente_a', label:'Corrente (A)',       type:'number', placeholder:'10', unit:'A', sku:false },
    { key:'ip',         label:'Grau Proteção (IP)', type:'text',  placeholder:'IP65', sku:false },
  ],
  porta: [
    { key:'tipo_pt',  label:'Tipo de Porta', type:'select', sku:true,
      options:[{v:'PP',l:'Porta de Pavimento'},{v:'PCB',l:'Porta de Cabina'},
               {v:'PAT',l:'Porta Automática'},{v:'PHL',l:'Porta Horizontal'}] },
    { key:'abertura', label:'Abertura', type:'select', sku:true,
      options:[{v:'AE',l:'Abertura Esquerda'},{v:'AD',l:'Abertura Direita'},
               {v:'AC',l:'Abertura Central'},{v:'AC2',l:'Central 2 Folhas'},{v:'ASL',l:'Automática Lateral'}] },
    { key:'altura',  label:'Altura (mm)',            type:'number', placeholder:'2100', unit:'mm', sku:true },
    { key:'vao',     label:'Vão / Largura Útil (mm)', type:'number', placeholder:'800',  unit:'mm', sku:true },
    { key:'soleira', label:'Largura da Soleira (mm)', type:'number', placeholder:'90',   unit:'mm', sku:true },
    { key:'folhas',  label:'Folhas', type:'select', sku:false,
      options:[{v:'1F',l:'1 Folha'},{v:'2F',l:'2 Folhas'},{v:'3F',l:'3 Folhas'}] },
  ],
  corrimao: [
    { key:'perf_ref', label:'Referência do Perfil', type:'text', placeholder:'VP-1699', sku:true },
    { key:'dim_a', label:'A — Larg. Interna (mm)',  type:'number', placeholder:'39',   unit:'mm', sku:true,  tip:'Espaço interno entre os pés do perfil C' },
    { key:'dim_b', label:'B — Larg. Média (mm)',    type:'number', placeholder:'62',   unit:'mm', sku:true,  tip:'Largura medida no meio do perfil' },
    { key:'dim_c', label:'C — Larg. Externa (mm)',  type:'number', placeholder:'80',   unit:'mm', sku:true,  tip:'Largura máxima externa total' },
    { key:'dim_d', label:'D — Altura Total (mm)',   type:'number', placeholder:'28.5', unit:'mm', sku:false, tip:'Altura total do perfil corrimão' },
    { key:'dim_e', label:'E — Altura Pé Int. (mm)', type:'number', placeholder:'10.6', unit:'mm', sku:false, tip:'Altura interna do pé (abertura do C)' },
    { key:'dim_f', label:'F — Esp. Base (mm)',      type:'number', placeholder:'8.5',  unit:'mm', sku:false, tip:'Espessura da parede inferior' },
    { key:'dim_g', label:'G — Esp. Topo (mm)',      type:'number', placeholder:'9.5',  unit:'mm', sku:false, tip:'Espessura da parede superior (coroa)' },
    { key:'mat_cr', label:'Material', type:'select', sku:false,
      options:[{v:'NP',l:'Neoprene Preto'},{v:'NE',l:'Neoprene Natural'},{v:'TF',l:'TufFlex (Draka)'},
               {v:'NT',l:'NT Termoplástico'},{v:'PVC',l:'PVC'},{v:'PU',l:'Poliuretano'}] },
  ],
  roldana: [
    { key:'tipo_rl', label:'Tipo', type:'select', sku:true,
      options:[{v:'ROL',l:'Roldana'},{v:'RLM',l:'Rolamento'},{v:'BKT',l:'Bucha'}] },
    { key:'de',   label:'Ø Externo (mm)',  type:'number', placeholder:'50', unit:'mm', sku:true,  tip:'Diâmetro externo' },
    { key:'di',   label:'Ø Interno (mm)',  type:'number', placeholder:'20', unit:'mm', sku:true,  tip:'Diâmetro do furo (eixo)' },
    { key:'larg', label:'Largura (mm)',    type:'number', placeholder:'15', unit:'mm', sku:true },
    { key:'mat_rl', label:'Material', type:'select', sku:true,
      options:[{v:'NY',l:'Nylon'},{v:'PU',l:'Poliuretano'},{v:'PP',l:'Polipropileno'},
               {v:'ACO',l:'Aço'},{v:'IN',l:'Inox'},{v:'BR',l:'Bronze'}] },
  ],
  corrente: [
    { key:'tipo_cor', label:'Tipo', type:'select', sku:true,
      options:[{v:'COR',l:'Corrente Simples'},{v:'CORD',l:'Corrente Dupla'},{v:'CORE',l:'Corrente Esteira'}] },
    { key:'passo',    label:'Passo (mm)',   type:'number', placeholder:'25.4', unit:'mm', sku:true },
    { key:'larg_cor', label:'Largura (mm)', type:'number', placeholder:'12',   unit:'mm', sku:true },
    { key:'elos',     label:'Nº de Elos',   type:'number', placeholder:'80',   unit:'el', sku:true },
  ],
  cabo: [
    { key:'tipo_cab', label:'Tipo', type:'select', sku:true,
      options:[{v:'CAB',l:'Cabo de Aço'},{v:'CABS',l:'Cabo de Segurança'},{v:'CABT',l:'Cabo de Tração'},
               {v:'FIOR',l:'Fio Rígido'},{v:'FIOF',l:'Fio Flexível'}] },
    { key:'diam', label:'Diâmetro (mm)',   type:'number', placeholder:'8',   unit:'mm', sku:true },
    { key:'comp', label:'Comprimento (m)', type:'number', placeholder:'100', unit:'m',  sku:false },
    { key:'const_cab', label:'Construção', type:'text', placeholder:'6x19', sku:false, tip:'Ex: 6x19 = 6 pernas x 19 fios' },
  ],
  mecanico: [
    { key:'cat_mec',  label:'Código Categoria (3-4 letras)', type:'text',   placeholder:'GRL', sku:true, tip:'Ex: GRL, SUP, BTN, EBR' },
    { key:'mat_mec',  label:'Material', type:'select', sku:true,
      options:[{v:'ACO',l:'Aço Carbon'},{v:'IN',l:'Inox'},{v:'AL',l:'Alumínio'},{v:'NY',l:'Nylon'},
               {v:'PVC',l:'PVC'},{v:'BR',l:'Borracha'},{v:'PU',l:'Poliuretano'},{v:'CU',l:'Cobre'},{v:'ZN',l:'Zinco'}] },
    { key:'comp_mec', label:'Comprimento (mm)', type:'number', placeholder:'200', unit:'mm', sku:true  },
    { key:'larg_mec', label:'Largura (mm)',      type:'number', placeholder:'50',  unit:'mm', sku:false },
    { key:'alt_mec',  label:'Altura/Esp. (mm)',  type:'number', placeholder:'10',  unit:'mm', sku:false },
  ],
  outro: [
    { key:'cat_out', label:'Código Categoria',  type:'text', placeholder:'GRL', sku:true, tip:'3-4 chars identificando o tipo' },
    { key:'spec1',   label:'Especificação 1',   type:'text', placeholder:'valor principal',   sku:true  },
    { key:'spec2',   label:'Especificação 2',   type:'text', placeholder:'valor secundário',  sku:false },
    { key:'spec3',   label:'Especificação 3',   type:'text', placeholder:'valor terciário',   sku:false },
  ],
};

const MARCAS_COMPAT = [
  { nome:'Geral (todas as marcas)',   abrev:'CCG'   },
  { nome:'Otis',                      abrev:'CCO'   },
  { nome:'TK Elevator (ThyssenKrupp)',abrev:'CCT'   },
  { nome:'Schindler (Atlas)',          abrev:'CCS'   },
  { nome:'KONE',                      abrev:'CCK'   },
  { nome:'Hyundai',                   abrev:'CCH'   },
  { nome:'GMV (Eurodynamic)',          abrev:'CCGM'  },
  { nome:'Villarta',                  abrev:'CCVIL' },
  { nome:'Orona (Orona AMG)',          abrev:'CCORO' },
  { nome:'Daiken',                    abrev:'CCDAI' },
  { nome:'Ortobras',                  abrev:'CCORT' },
  { nome:'Montele',                   abrev:'CCMON' },
  { nome:'Vertline',                  abrev:'CCVER' },
  { nome:'Alfa Elevadores',           abrev:'CCALF' },
];

const CORES_MATERIAL = [
  {code:'IN',l:'Inox'},{code:'BR',l:'Branco'},{code:'PT',l:'Preto'},
  {code:'AM',l:'Amarelo'},{code:'VM',l:'Vermelho'},{code:'AZ',l:'Azul'},
  {code:'CZ',l:'Cinza'},{code:'NY',l:'Nylon'},{code:'AL',l:'Alumínio'},
  {code:'CU',l:'Cobre'},{code:'ZN',l:'Zinco'},{code:'CR',l:'Cromado'},
  {code:'DO',l:'Dourado'},{code:'TR',l:'Transparente'},
];

const FAMILIAS = [
  'Motor','Freio','Cabine','Contrapeso','Guia de Corrediça','Painel Elétrico',
  'Porta de Pavimento','Porta de Cabina','Cabos e Cintas','Escada Rolante',
  'Esteira Rolante','Segurança','Sinalização','Corrimão','Degrau/Pallet',
  'Balaustrada','Pente','Escova de Segurança','Limitador de Velocidade',
  'UCM','Buffer/Amortecedor','Matéria-Prima','Insumo','Uso e Consumo',
  'Ativo Imobilizado','Outros',
];
const UNIDADES   = ['PC','UN','KG','MT','M2','M3','LT','CX','PAR','JG','RL','SC','BD','GL','TB','PT'];
const TIPOS      = ['Peça','Conjunto','Serviço','Embalagem','Consumível','Insumo','Matéria-Prima'];
const REGRAS_EXP = [
  { value:'FIFO', label:'FIFO — First In, First Out',  desc:'Expede o lote mais antigo primeiro.' },
  { value:'LIFO', label:'LIFO — Last In, First Out',   desc:'Expede o lote mais recente primeiro.' },
  { value:'LOC',  label:'Sequência de Locais',         desc:'Expede conforme posição física do endereço.' },
];
const APRESEN = ['1x1 (Unitário)','6x1','12x1','24x1','Caixa Master'];

const OMIE_COL = {
  1:'codigo_integracao', 2:'codigo', 3:'descricao', 4:'ncm',
  6:'ean', 7:'preco_venda', 8:'unidade', 9:'familia',
  10:'estoque_minimo', 11:'estoque_erp', 12:'preco_custo',
  15:'local_estoque', 16:'peso_liquido', 17:'peso_bruto',
  18:'altura', 19:'largura', 20:'profundidade',
  21:'marca', 24:'dias_crossdocking', 34:'descricao_detalhada', 37:'observacao',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function gerarEAN13() {
  const d = [7,8,9];
  for (let i=0; i<9; i++) d.push(Math.floor(Math.random()*10));
  const s = d.reduce((a,v,i)=>a+v*(i%2===0?1:3),0);
  d.push((10-(s%10))%10);
  return d.join('');
}

function buildSKU({ prefixo, natureza, atrib, compat, cor }) {
  if (!prefixo) return '';
  const s = [prefixo];
  if (natureza && atrib) {
    switch (natureza) {
      case 'eletrico': {
        const { tipo_el, potencia, potencia_un, tensao, frequencia } = atrib;
        if (tipo_el) s.push(tipo_el);
        const sp = [];
        if (potencia && potencia_un) sp.push(`${potencia}${potencia_un}`);
        if (tensao) sp.push(`${tensao}V`);
        if (frequencia) sp.push(`${frequencia}HZ`);
        if (sp.length) s.push(sp.join('-'));
        break;
      }
      case 'porta': {
        const { tipo_pt, abertura, altura, vao, soleira } = atrib;
        if (tipo_pt) s.push(tipo_pt);
        if (abertura) s.push(abertura);
        const d = [altura, vao, soleira].filter(Boolean);
        if (d.length) s.push(d.join('X'));
        break;
      }
      case 'corrimao': {
        const { perf_ref, dim_a, dim_b, dim_c } = atrib;
        if (perf_ref) s.push(perf_ref.replace(/^VP-/i,'PERF'));
        const d = [dim_a, dim_b, dim_c].filter(Boolean);
        if (d.length) s.push(d.join('X'));
        break;
      }
      case 'roldana': {
        const { tipo_rl, mat_rl, de, di, larg } = atrib;
        if (tipo_rl) s.push(tipo_rl);
        if (mat_rl) s.push(mat_rl);
        const d = [de, di, larg].filter(Boolean);
        if (d.length) s.push(d.join('X'));
        break;
      }
      case 'corrente': {
        const { tipo_cor, passo, larg_cor, elos } = atrib;
        if (tipo_cor) s.push(tipo_cor);
        const d = [passo, larg_cor].filter(Boolean);
        if (d.length) s.push(d.join('X'));
        if (elos) s.push(`${elos}EL`);
        break;
      }
      case 'cabo': {
        const { tipo_cab, diam } = atrib;
        if (tipo_cab) s.push(tipo_cab);
        if (diam) s.push(`${diam}MM`);
        break;
      }
      case 'mecanico': {
        const { cat_mec, mat_mec, comp_mec } = atrib;
        if (cat_mec) s.push(cat_mec.toUpperCase());
        if (mat_mec) s.push(mat_mec);
        if (comp_mec) s.push(`${comp_mec}MM`);
        break;
      }
      case 'outro': {
        const { cat_out, spec1 } = atrib;
        if (cat_out) s.push(cat_out.toUpperCase());
        if (spec1) s.push(spec1.toUpperCase());
        break;
      }
      default: break;
    }
  }
  if (compat) s.push(compat);
  if (cor) s.push(cor);
  return s.join('-');
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────

function Field({ label, required, tip, children }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className={labelCls}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {tip && <span title={tip}><Info className="w-3 h-3 text-slate-400 cursor-help" /></span>}
      </div>
      {React.cloneElement(children, { id })}
    </div>
  );
}

function Sel({ value, onChange, options, placeholder='— selecione —', id }) {
  return (
    <select id={id} value={value||''} onChange={e=>onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder}</option>
      {options.map(o => {
        const v = typeof o==='string' ? o : (o.v||o.value||o.code);
        const l = typeof o==='string' ? o : (o.l||o.label||o.desc||v);
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function Inp({ value, onChange, placeholder='', type='text', id, readOnly }) {
  return (
    <input
      id={id} type={type} value={value??''} readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(inputCls, readOnly && 'opacity-60 cursor-not-allowed')}
    />
  );
}

// ─── TAB 0 — IDENTIFICAÇÃO + SKU BUILDER ─────────────────────────────────────

function TabIdentificacao({ prod, onChange, onGoToIA }) {
  const at = prod.atributos_tecnicos || {};
  const [showBuilder, setShowBuilder] = useState(!prod.sku);
  const [copied, setCopied] = useState(false);

  const prefixo  = prod.prefixo_vp  || '';
  const natureza = prod.natureza    || '';
  const compat   = (prod.compatibilidade||[])[0] || '';
  const cor      = prod.cor_material || '';

  const generatedSKU = buildSKU({ prefixo, natureza, atrib: at, compat, cor });

  function setAtrib(key, val) {
    onChange('atributos_tecnicos', { ...at, [key]: val });
  }
  function setPrefixo(code) {
    onChange('prefixo_vp', code);
    if (!PREFIXES_WITH_NATUREZA.has(code)) onChange('natureza', '');
  }
  function applyGeneratedSKU() {
    onChange('sku', generatedSKU);
    setShowBuilder(false);
  }
  function copy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(()=>setCopied(false), 1500);
  }

  const fields = natureza ? (NATUREZA_FIELDS[natureza] || []) : [];
  const prefixGroups = [...new Set(VP_PREFIXES.map(p=>p.group))];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── SKU BUILDER ── */}
      <div className="border-2 border-yellow-300 dark:border-yellow-600/40 rounded-sm overflow-hidden">
        <button
          onClick={()=>setShowBuilder(v=>!v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-black uppercase tracking-widest text-yellow-800 dark:text-yellow-300">Gerador de SKU</span>
            {generatedSKU && (
              <span className="bg-yellow-200 dark:bg-yellow-700/60 text-yellow-900 dark:text-yellow-100 text-[10px] font-black px-2 py-0.5 rounded-sm">
                {generatedSKU}
              </span>
            )}
          </div>
          <ChevronRight className={cn('w-4 h-4 text-yellow-600 transition-transform', showBuilder && 'rotate-90')} />
        </button>

        {showBuilder && (
          <div className="p-5 space-y-5 bg-white dark:bg-slate-900">

            {/* STEP 1 */}
            <div>
              <p className={cn(labelCls,'mb-2')}>Passo 1 — Prefixo VP *</p>
              <div className="space-y-2">
                {prefixGroups.map(group => (
                  <div key={group}>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{group}</p>
                    <div className="flex flex-wrap gap-1">
                      {VP_PREFIXES.filter(p=>p.group===group).map(p => (
                        <button key={p.code} onClick={()=>setPrefixo(p.code)} title={p.desc}
                          className={cn(
                            'px-2 py-1 rounded-sm text-[10px] font-black border transition',
                            prefixo===p.code
                              ? 'bg-yellow-400 border-yellow-500 text-slate-900'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-yellow-400'
                          )}>{p.code}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {prefixo && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    <span className="font-black text-yellow-600">{prefixo}</span> — {VP_PREFIXES.find(p=>p.code===prefixo)?.desc}
                  </p>
                )}
              </div>
            </div>

            {/* STEP 2 — natureza */}
            {prefixo && PREFIXES_WITH_NATUREZA.has(prefixo) && (
              <div>
                <p className={cn(labelCls,'mb-2')}>Passo 2 — Natureza do Produto</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {NATUREZAS.map(n => {
                    const { Icon } = n;
                    return (
                      <button key={n.code} onClick={()=>onChange('natureza', natureza===n.code?'':n.code)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[10px] font-black transition',
                          natureza===n.code
                            ? 'bg-slate-900 border-slate-900 text-yellow-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        )}>
                        <Icon className="w-3 h-3 shrink-0" />{n.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3 — campos técnicos */}
            {fields.length > 0 && (
              <div>
                <p className={cn(labelCls,'mb-2')}>Passo 3 — Dados Técnicos</p>
                <div className="grid grid-cols-2 gap-3">
                  {fields.map(f => (
                    <Field key={f.key} label={f.label} tip={f.tip}>
                      {f.type === 'select' ? (
                        <Sel value={at[f.key]||''} onChange={v=>setAtrib(f.key,v)} options={f.options} />
                      ) : f.unitSel ? (
                        <div className="flex gap-1">
                          <Inp type="number" value={at[f.key]||''} onChange={v=>setAtrib(f.key,v)} placeholder={f.placeholder} />
                          <Sel value={at[`${f.key}_un`]||f.unitSel[0]} onChange={v=>setAtrib(`${f.key}_un`,v)} options={f.unitSel} placeholder="" />
                        </div>
                      ) : (
                        <Inp type={f.type} value={at[f.key]||''} onChange={v=>setAtrib(f.key,v)} placeholder={f.placeholder} />
                      )}
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {/* Corrimão diagram */}
            {natureza === 'corrimao' && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-sm p-3 border border-slate-200 dark:border-slate-700">
                <p className={cn(labelCls,'mb-2')}>Referência visual — Seção em C do Corrimão</p>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[
                    {l:'A', tip:'Larg. Interna', v:at.dim_a},
                    {l:'B', tip:'Larg. Média',   v:at.dim_b},
                    {l:'C', tip:'Larg. Externa', v:at.dim_c},
                    {l:'D', tip:'Alt. Total',    v:at.dim_d},
                    {l:'E', tip:'Alt. Pé Int.',  v:at.dim_e},
                    {l:'F', tip:'Esp. Base',     v:at.dim_f},
                    {l:'G', tip:'Esp. Topo',     v:at.dim_g},
                  ].map(x=>(
                    <div key={x.l} className="bg-white dark:bg-slate-900 rounded-sm p-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] font-black text-yellow-600">{x.l}</p>
                      <p className="text-[8px] text-slate-500">{x.tip}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{x.v||'—'}</p>
                      <p className="text-[8px] text-slate-400">mm</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4 — compat + cor */}
            {prefixo && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Compatibilidade — código SKU" tip="Primeira seleção define o CC no SKU. Para múltiplas marcas use a aba Compatibilidade.">
                  <Sel value={compat} onChange={v=>onChange('compatibilidade', v?[v]:[])}
                    options={MARCAS_COMPAT.map(m=>({v:m.abrev, l:`${m.nome}  →  ${m.abrev}`}))} />
                </Field>
                <Field label="Cor / Material Final">
                  <Sel value={cor} onChange={v=>onChange('cor_material',v)}
                    options={CORES_MATERIAL.map(c=>({v:c.code, l:`${c.l} (${c.code})`}))} />
                </Field>
              </div>
            )}

            {/* SKU preview */}
            <div className={cn('rounded-sm border-2 p-4',
              generatedSKU ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800')}>
              <p className={labelCls}>SKU Gerado</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-wider flex-1">
                  {generatedSKU || <span className="text-slate-400 text-sm font-medium italic">Preencha os campos acima...</span>}
                </p>
                {generatedSKU && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={()=>copy(generatedSKU)} title="Copiar"
                      className="p-2 rounded-sm border border-slate-300 hover:border-yellow-400 transition">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button onClick={applyGeneratedSKU}
                      className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-[11px] font-black rounded-sm transition">
                      ✓ Usar este SKU
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CAMPOS PRINCIPAIS ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU / Código VP" required>
          <div className="relative">
            <Inp value={prod.sku||''} onChange={v=>onChange('sku',v)} placeholder="Ex: VPEL-PP-AE-2100X800X90-CCO-IN" />
            {!showBuilder && (
              <button onClick={()=>setShowBuilder(true)} title="Abrir gerador de SKU"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-400 transition">
                <Hash className="w-4 h-4" />
              </button>
            )}
          </div>
        </Field>

        <Field label="Código Antigo (Legado / Omie)" tip="Código anterior do produto. Aparece na lista lateral para todos os usuários.">
          <Inp value={prod.codigo_antigo||''} onChange={v=>onChange('codigo_antigo',v)} placeholder="Ex: VPER-0042, VPKIT-1699a" />
        </Field>

        <Field label="Descrição Resumida" required>
          <Inp value={prod.descricao||''} onChange={v=>onChange('descricao',v)} placeholder="Nome técnico do produto" />
        </Field>

        <Field label="NCM" tip="Nomenclatura Comum do Mercosul — obrigatório para NF-e">
          <Inp value={prod.ncm||''} onChange={v=>onChange('ncm',v)} placeholder="0000.00.00" />
        </Field>

        <Field label="Família">
          <Sel value={prod.familia||''} onChange={v=>onChange('familia',v)} options={FAMILIAS} />
        </Field>

        <Field label="Tipo">
          <Sel value={prod.tipo||''} onChange={v=>onChange('tipo',v)} options={TIPOS} />
        </Field>

        <Field label="Unidade de Medida" required>
          <Sel value={prod.unidade||''} onChange={v=>onChange('unidade',v)} options={UNIDADES} />
        </Field>

        <Field label="Marca / Fabricante Original">
          <Inp value={prod.marca||''} onChange={v=>onChange('marca',v)} placeholder="Ex: Draka EHC, Semperit, BST" />
        </Field>

        <Field label="Part Number (Importação)" tip="Código do fabricante original — válido para importações">
          <Inp value={prod.part_number||''} onChange={v=>onChange('part_number',v)} placeholder="Ex: BST-PP-AE-2100" />
        </Field>

        <Field label="Código Integração Omie" tip="ID numérico gerado pelo Omie ERP">
          <Inp value={prod.codigo_integracao||''} onChange={v=>onChange('codigo_integracao',v)} placeholder="00000000000042" />
        </Field>

        <Field label="Produto Pai — SKU (Hierarquia BOM)" tip="Se este produto é componente/camada de outro, informe o SKU pai (estrutura de produto)">
          <Inp value={prod.produto_pai_sku||''} onChange={v=>onChange('produto_pai_sku',v)} placeholder="Ex: VPIN-INS-EMEN-CORM-ER-PERF1699" />
        </Field>

        <Field label="Local de Estoque Preferencial">
          <Inp value={prod.local_estoque||''} onChange={v=>onChange('local_estoque',v)} placeholder="Ex: A-01-01" />
        </Field>
      </div>

      {/* ── DIMENSÕES & PESO ── */}
      <div>
        <p className={cn(labelCls,'mb-3')}>Dimensões Físicas & Peso</p>
        {/* Ø Externo / Interno — exibido quando natureza é roldana ou rolamento */}
        {(prod.natureza === 'roldana') && (
          <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-sm">
            <div className="col-span-3">
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">
                ⬤ Diâmetros (preenchidos pelo Construtor de SKU)
              </p>
            </div>
            <Field label="Ø Externo (mm)">
              <Inp type="number"
                value={prod.atributos_tecnicos?.de||''}
                onChange={v=>onChange('atributos_tecnicos',{...prod.atributos_tecnicos, de:v})}
                placeholder="50" />
            </Field>
            <Field label="Ø Interno (mm)">
              <Inp type="number"
                value={prod.atributos_tecnicos?.di||''}
                onChange={v=>onChange('atributos_tecnicos',{...prod.atributos_tecnicos, di:v})}
                placeholder="20" />
            </Field>
            <Field label="Largura (mm)">
              <Inp type="number"
                value={prod.atributos_tecnicos?.larg||''}
                onChange={v=>onChange('atributos_tecnicos',{...prod.atributos_tecnicos, larg:v})}
                placeholder="15" />
            </Field>
          </div>
        )}
        <div className="grid grid-cols-5 gap-3">
          {[
            {key:'altura',       label:'Altura (cm)'},
            {key:'largura',      label:'Largura (cm)'},
            {key:'profundidade', label:'Prof. (cm)'},
            {key:'peso_liquido', label:'Peso Líq. (kg)'},
            {key:'peso_bruto',   label:'Peso Bruto (kg)'},
          ].map(f=>(
            <Field key={f.key} label={f.label}>
              <Inp type="number" value={prod[f.key]||''} onChange={v=>onChange(f.key,v)} placeholder="0" />
            </Field>
          ))}
        </div>
      </div>

      {/* ── PREÇOS & LOGÍSTICA ── */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Preço de Custo (R$)">
          <Inp type="number" value={prod.preco_custo||''} onChange={v=>onChange('preco_custo',v)} placeholder="0.00" />
        </Field>
        <Field label="Preço de Venda (R$)">
          <Inp type="number" value={prod.preco_venda||''} onChange={v=>onChange('preco_venda',v)} placeholder="0.00" />
        </Field>
        <Field label="Dias Cross-docking">
          <Inp type="number" value={prod.dias_crossdocking||''} onChange={v=>onChange('dias_crossdocking',v)} placeholder="0" />
        </Field>
      </div>

      {/* ── OBSERVAÇÕES ── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className={labelCls}>Observações</p>
          <button
            onClick={()=>onGoToIA?.()}
            title="Ir para aba de geração de descrição técnica com IA"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-yellow-400 text-white hover:text-slate-900 rounded-sm text-[10px] font-black transition group">
            <Bot className="w-3 h-3 group-hover:animate-pulse" />
            Gerar Descrição com IA
          </button>
        </div>
        <textarea value={prod.observacao||''} onChange={e=>onChange('observacao',e.target.value)}
          rows={2} placeholder="Observações internas, referências, notas de manutenção..."
          className={inputCls} />
        <p className="text-[9px] text-slate-400 mt-0.5">Use o botão acima para gerar a ficha técnica completa com IA (Claude Haiku) na aba "Descrição IA".</p>
      </div>

      {/* ── MOVIMENTA ESTOQUE ── */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={()=>onChange('movimenta_estoque',!prod.movimenta_estoque)}
          className={cn('w-10 h-5 rounded-full transition-colors relative shrink-0',
            prod.movimenta_estoque!==false ? 'bg-yellow-400' : 'bg-slate-300 dark:bg-slate-600')}>
          <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
            prod.movimenta_estoque!==false ? 'left-5' : 'left-0.5')} />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Movimenta Estoque (Picking / Expedição)</span>
      </label>
    </div>
  );
}

// ─── TAB 1 — COMPATIBILIDADE ─────────────────────────────────────────────────

function TabCompatibilidade({ prod, onChange }) {
  const selected = prod.compatibilidade || [];

  function toggle(abrev) {
    const next = selected.includes(abrev)
      ? selected.filter(a=>a!==abrev)
      : [...selected, abrev];
    onChange('compatibilidade', next);
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <p className={cn(labelCls,'mb-1')}>Marcas Compatíveis</p>
        <p className="text-[11px] text-slate-500 mb-4">
          Selecione todas as marcas compatíveis com este produto.
          A <strong>primeira selecionada</strong> é usada no código SKU automático.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MARCAS_COMPAT.map(m => {
            const isSel = selected.includes(m.abrev);
            const isPrimary = selected[0] === m.abrev;
            return (
              <button key={m.abrev} onClick={()=>toggle(m.abrev)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-sm border-2 transition text-left',
                  isSel
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                )}>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">{m.nome}</p>
                  {isPrimary && <p className="text-[9px] text-yellow-600 font-black mt-0.5">★ PRIMÁRIO — aparece no SKU</p>}
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-sm text-[10px] font-black border shrink-0',
                  isSel
                    ? 'bg-yellow-400 border-yellow-500 text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                )}>{m.abrev}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-sm p-4 border border-slate-200 dark:border-slate-700">
          <p className={cn(labelCls,'mb-2')}>Resumo das compatibilidades</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((abrev,i) => (
              <div key={abrev} className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-sm px-2 py-1">
                {i===0 && <span className="text-[9px] text-yellow-600 font-black">SKU:</span>}
                <span className="text-xs font-black text-yellow-800 dark:text-yellow-300">{abrev}</span>
                <span className="text-[10px] text-slate-500 ml-0.5">— {MARCAS_COMPAT.find(m=>m.abrev===abrev)?.nome}</span>
                <button onClick={()=>toggle(abrev)} className="ml-1 text-slate-400 hover:text-red-500 transition">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 2 — FOTOS ───────────────────────────────────────────────────────────

const PHOTO_LABELS = ['Etiqueta do Fabricante','Detalhe Técnico','Dimensões / Desenho','Aplicação em Campo'];

function TabFotos({ prod, onChange }) {
  const fotos = Array.isArray(prod.fotos) ? [...prod.fotos] : ['','','',''];
  while (fotos.length < 4) fotos.push('');

  function setFoto(idx, val) {
    const next = [...fotos];
    next[idx] = val;
    onChange('fotos', next);
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <p className={cn(labelCls,'mb-1')}>Fotos Técnicas do Produto</p>
        <p className="text-[11px] text-slate-500 mb-4">
          Cole a URL pública da imagem. Recomendado: foto da etiqueta do fabricante na posição 1 para rastreabilidade.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {PHOTO_LABELS.map((label, i) => {
          const url = fotos[i] || '';
          return (
            <div key={i} className="border-2 border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <p className={labelCls}>Foto {i+1} — {label}</p>
              </div>

              {url ? (
                <div className="relative group bg-slate-100 dark:bg-slate-900" style={{height:'160px'}}>
                  <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-contain"
                    onError={e=>{ e.target.style.display='none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display='flex'); }} />
                  <div className="hidden w-full h-full absolute inset-0 items-center justify-center text-slate-400 text-xs font-bold flex-col gap-1">
                    <Image className="w-8 h-8" /><span>URL inválida</span>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <a href={url} target="_blank" rel="noreferrer"
                      className="p-2 bg-white rounded-sm text-slate-800 hover:bg-yellow-400 transition">
                      <Eye className="w-4 h-4" />
                    </a>
                    <button onClick={()=>setFoto(i,'')}
                      className="p-2 bg-white rounded-sm text-red-500 hover:bg-red-500 hover:text-white transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-400" style={{height:'160px'}}>
                  <Image className="w-8 h-8 opacity-40" />
                  <p className="text-[10px] font-bold">Sem foto</p>
                </div>
              )}

              <div className="p-3">
                <input value={url} onChange={e=>setFoto(i,e.target.value)}
                  placeholder="https://... (URL pública da imagem)"
                  className={inputCls} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 3 — EMBALAGENS ──────────────────────────────────────────────────────

function TabEmbalagens({ prod, onChange }) {
  const embs = prod.embalagens || [];
  function addEmb() { onChange('embalagens', [...embs, { id: Date.now(), ean:'', apresentacao:'1x1 (Unitário)', fator:1, lastro:1, camadas:1, peso_bruto:'' }]); }
  function delEmb(id) { onChange('embalagens', embs.filter(e=>e.id!==id)); }
  function setEmb(id,k,v) { onChange('embalagens', embs.map(e=>e.id===id?{...e,[k]:v}:e)); }
  const palletPcs = e => (e.lastro||1) * (e.camadas||1) * (e.fator||1);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className={labelCls}>Embalagens / Apresentações</p>
        <button onClick={addEmb}
          className="flex items-center gap-1 text-[10px] font-black text-yellow-600 hover:text-yellow-500 border border-yellow-300 dark:border-yellow-700 px-2 py-1 rounded-sm transition">
          <Plus className="w-3 h-3" />Adicionar
        </button>
      </div>

      {embs.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-sm p-10 text-center text-slate-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-bold">Nenhuma embalagem cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {embs.map(e => (
            <div key={e.id} className="border border-slate-200 dark:border-slate-700 rounded-sm p-4">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <Field label="Código EAN-13">
                    <div className="flex gap-1">
                      <Inp value={e.ean} onChange={v=>setEmb(e.id,'ean',v)} placeholder="00000000000000" />
                      <button onClick={()=>setEmb(e.id,'ean',gerarEAN13())} title="Gerar EAN-13"
                        className="px-2 bg-slate-200 dark:bg-slate-700 rounded-sm hover:bg-yellow-300 dark:hover:bg-yellow-600 transition">
                        <Barcode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                  </Field>
                </div>
                <Field label="Apresentação">
                  <Sel value={e.apresentacao} onChange={v=>setEmb(e.id,'apresentacao',v)} options={APRESEN} />
                </Field>
                <Field label="Fator" tip="Qtd de unidades por embalagem">
                  <Inp type="number" value={e.fator} onChange={v=>setEmb(e.id,'fator',+v)} placeholder="1" />
                </Field>
                <Field label="Lastro" tip="Embalagens por camada no pallet">
                  <Inp type="number" value={e.lastro} onChange={v=>setEmb(e.id,'lastro',+v)} placeholder="1" />
                </Field>
                <Field label="Camadas">
                  <Inp type="number" value={e.camadas} onChange={v=>setEmb(e.id,'camadas',+v)} placeholder="1" />
                </Field>
                <div className="col-span-3 flex items-center">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-sm px-3 py-2 text-[10px] font-black text-slate-600 dark:text-slate-300">
                    Pallet total: <span className="text-yellow-600">{palletPcs(e)} pc</span>
                    <span className="text-slate-400 ml-2">({e.lastro}×{e.camadas} cam ×{e.fator} fator)</span>
                  </div>
                </div>
                <Field label="Peso Bruto Emb. (kg)">
                  <Inp type="number" value={e.peso_bruto} onChange={v=>setEmb(e.id,'peso_bruto',v)} placeholder="0.00" />
                </Field>
                <div className="col-span-2 flex justify-end items-end">
                  <button onClick={()=>delEmb(e.id)} className="text-red-400 hover:text-red-600 transition flex items-center gap-1 text-[10px] font-black">
                    <Trash2 className="w-3.5 h-3.5" />Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 4 — ESTOQUE & REGRAS ────────────────────────────────────────────────

const TIPO_ENDERECO = [
  { v:'principal', l:'Principal (picking primário)' },
  { v:'buffer',    l:'Buffer (reposição)' },
  { v:'overflow',  l:'Overflow (excedente)' },
  { v:'expedicao', l:'Expedição' },
  { v:'devolucao', l:'Devolução' },
];

const CURVA_ABC_INFO = {
  A: { cor:'bg-emerald-100 text-emerald-800 border-emerald-400', desc:'Alto giro — reposição frequente, endereço de fácil acesso' },
  B: { cor:'bg-amber-100  text-amber-800  border-amber-400',  desc:'Giro médio — reposição moderada' },
  C: { cor:'bg-slate-100  text-slate-700  border-slate-400',  desc:'Baixo giro — reposição eventual, pode ficar em posição menos acessível' },
};

function TabEstoqueRegras({ prod, onChange }) {
  const erp   = prod.estoque_erp  != null ? +prod.estoque_erp  : null;
  const real  = prod.estoque_real != null ? +prod.estoque_real : null;
  const wms   = prod.estoque_wms  != null ? +prod.estoque_wms  : null;
  const cmp   = real ?? wms;
  const delta = (erp != null && cmp != null) ? erp - cmp : null;

  const enderecos = Array.isArray(prod.enderecos_estoque) ? prod.enderecos_estoque : [];

  function addEndereco() {
    onChange('enderecos_estoque', [...enderecos, { id: Date.now(), endereco: '', quantidade: 0, tipo: 'principal' }]);
  }
  function delEndereco(id) {
    onChange('enderecos_estoque', enderecos.filter(e => e.id !== id));
  }
  function setEnd(id, key, val) {
    onChange('enderecos_estoque', enderecos.map(e => e.id === id ? { ...e, [key]: val } : e));
  }

  const totalEnd = enderecos.reduce((s, e) => s + (+e.quantidade || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── CURVA ABC ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className={labelCls}>Curva ABC</p>
          <span title="Classifica o produto pelo giro de estoque. Usado para definir estratégia de endereçamento e reposição.">
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['A','B','C']).map(letra => {
            const info = CURVA_ABC_INFO[letra];
            return (
              <button key={letra} onClick={() => onChange('curva_abc', prod.curva_abc === letra ? null : letra)}
                className={cn(
                  'p-3 rounded-sm border-2 text-left transition',
                  prod.curva_abc === letra
                    ? cn(info.cor, 'border-2')
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                )}>
                <p className={cn('text-2xl font-black', prod.curva_abc === letra ? '' : 'text-slate-400')}>{letra}</p>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">{info.desc}</p>
              </button>
            );
          })}
        </div>
        {!prod.curva_abc && (
          <p className="text-[10px] text-slate-400 mt-1">Não classificado. Defina após análise de giro de estoque.</p>
        )}
      </div>

      {/* ── ENDEREÇOS DE ESTOQUE ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className={labelCls}>Endereços no Armazém</p>
            <span title="Ex: R1-PP5-A4 = Rua 1, Porta-Pallet 5, Altura 4. Adicione quantos endereços o produto ocupar.">
              <Info className="w-3 h-3 text-slate-400 cursor-help" />
            </span>
          </div>
          <button onClick={addEndereco}
            className="flex items-center gap-1 text-[10px] font-black text-yellow-600 hover:text-yellow-500 border border-yellow-300 dark:border-yellow-700 px-2 py-1 rounded-sm transition">
            <Plus className="w-3 h-3" />Adicionar Endereço
          </button>
        </div>

        {enderecos.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-sm p-6 text-center text-slate-400">
            <MapPin className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold">Nenhum endereço cadastrado</p>
            <p className="text-[10px] mt-0.5">Clique em "Adicionar Endereço" para mapear a localização no armazém</p>
          </div>
        ) : (
          <div className="space-y-2">
            {enderecos.map((e, i) => (
              <div key={e.id} className={cn(
                'border rounded-sm p-3 grid grid-cols-12 gap-2 items-end',
                e.tipo === 'principal' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
              )}>
                {i === 0 && e.tipo === 'principal' && (
                  <div className="col-span-12 mb-1">
                    <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">★ Endereço de Picking Primário</span>
                  </div>
                )}
                <div className="col-span-4">
                  <p className={cn(labelCls,'mb-1')}>Endereço</p>
                  <input value={e.endereco} onChange={ev => setEnd(e.id, 'endereco', ev.target.value)}
                    placeholder="R1-PP5-A4"
                    className={cn(inputCls, 'font-black tracking-wider')} />
                </div>
                <div className="col-span-2">
                  <p className={cn(labelCls,'mb-1')}>Quantidade</p>
                  <input type="number" value={e.quantidade||''} onChange={ev => setEnd(e.id,'quantidade',+ev.target.value)}
                    placeholder="0" className={cn(inputCls,'text-center font-black')} />
                </div>
                <div className="col-span-4">
                  <p className={cn(labelCls,'mb-1')}>Tipo</p>
                  <Sel value={e.tipo||'principal'} onChange={v => setEnd(e.id,'tipo',v)} options={TIPO_ENDERECO} />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => delEndereco(e.id)} className="text-red-400 hover:text-red-600 transition p-1.5 border border-red-200 rounded-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {enderecos.length > 1 && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-sm px-3 py-2 text-[10px] font-black text-slate-600 dark:text-slate-400">
                Total em endereços: <span className="text-yellow-600">{totalEnd} unidade{totalEnd!==1?'s':''}</span>
                {erp != null && <span className="text-slate-400 ml-2">· ERP registra {erp}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <p className={cn(labelCls,'mb-3')}>Saldos de Estoque</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label:'Estoque ERP (Omie)',field:'estoque_erp',   ro:false, tip:'Saldo sincronizado do Omie ERP' },
            { label:'Estoque WMS',       field:'estoque_wms',   ro:true,  tip:'Calculado pelo sistema (picking/recebimento)' },
            { label:'Estoque Real',      field:'estoque_real',  ro:false, tip:'Saldo físico do último inventário manual' },
            { label:'Estoque Mínimo',    field:'estoque_minimo',ro:false, tip:'Aciona alerta de reposição abaixo deste valor' },
          ].map(c=>(
            <div key={c.field} className="bg-slate-50 dark:bg-slate-800 rounded-sm p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 mb-2">
                <p className={labelCls}>{c.label}</p>
                {c.tip && <span title={c.tip}><Info className="w-3 h-3 text-slate-400 cursor-help" /></span>}
              </div>
              {c.ro
                ? <p className="text-2xl font-black text-slate-700 dark:text-slate-200 text-center">{prod[c.field]??'—'}</p>
                : <input type="number" value={prod[c.field]??''}
                    onChange={e=>onChange(c.field, e.target.value===''?null:+e.target.value)}
                    className={cn(inputCls,'text-lg font-black text-center')} placeholder="—" />
              }
            </div>
          ))}
        </div>

        <div className={cn('mt-3 border-2 rounded-sm p-4 flex items-center gap-4',
          delta==null  ?'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900':
          delta===0    ?'border-green-300 bg-green-50 dark:bg-green-950/20':
          delta>0      ?'border-red-300 bg-red-50 dark:bg-red-950/20':
                        'border-amber-300 bg-amber-50 dark:bg-amber-950/20')}>
          <div className={cn('w-10 h-10 rounded-sm flex items-center justify-center shrink-0',
            delta==null?'bg-slate-200 dark:bg-slate-800':delta===0?'bg-green-600':delta>0?'bg-red-500':'bg-amber-500')}>
            {delta==null?<Minus className="w-4 h-4 text-slate-400"/>:
             delta===0  ?<Check className="w-4 h-4 text-white"/>:
             delta>0    ?<TrendingDown className="w-4 h-4 text-white"/>:
                         <TrendingUp className="w-4 h-4 text-white"/>}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              Delta ERP vs {real!=null?'Real':'WMS'}: {delta!=null?(delta>0?`+${delta}`:delta):'Sem dados suficientes'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {delta==null&&'Preencha o Estoque ERP para calcular a discrepância.'}
              {delta===0&&'✅ Estoque bateu! Sem divergência entre ERP e armazém.'}
              {delta!=null&&delta>0&&`⚠️ Omie diz ter ${delta} unidade(s) a MAIS que o ${real!=null?'inventário real':'WMS'}. Verifique perdas.`}
              {delta!=null&&delta<0&&`⚠️ Omie diz ter ${Math.abs(delta)} unidade(s) a MENOS. Verifique entradas não faturadas.`}
            </p>
          </div>
        </div>

        {prod.estoque_minimo>0 && erp!=null && erp<=prod.estoque_minimo && (
          <div className="mt-2 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 rounded-sm p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs font-black text-red-700">
              Estoque abaixo do mínimo! Atual: {erp} · Mínimo: {prod.estoque_minimo}
            </p>
          </div>
        )}
      </div>

      <div>
        <p className={cn(labelCls,'mb-3')}>Regra de Expedição</p>
        <div className="grid grid-cols-3 gap-2">
          {REGRAS_EXP.map(r=>(
            <button key={r.value} onClick={()=>onChange('regra_expedicao',r.value)}
              className={cn('p-3 rounded-sm border-2 text-left transition',
                prod.regra_expedicao===r.value
                  ?'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  :'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300')}>
              <p className="text-xs font-black text-slate-800 dark:text-white">{r.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 5 — DESCRIÇÃO IA ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function TabDescricaoIA({ prod, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState('');
  const [custom,  setCustom ] = useState('');

  async function generate() {
    setLoading(true); setError('');
    try {
      const compat = (prod.compatibilidade||[]).map(cc=>{
        const m = MARCAS_COMPAT.find(x=>x.abrev===cc);
        return m ? m.nome : cc;
      }).join(', ');
      const res = await fetch(`${API_BASE}/api/generate-description`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          vpType: prod.prefixo_vp||'',
          category: prod.natureza||prod.familia||'',
          attributes: prod.atributos_tecnicos||{},
          selectedCompatibility: compat,
          manualReference: prod.marca||'',
          additionalDetails: custom,
          sku: prod.sku||'',
          descricao: prod.descricao||'',
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      onChange('descricao_detalhada', data.description||data.text||'');
    } catch(e) {
      setError('Falha ao gerar descrição. Verifique a conexão com o servidor AI.');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-start gap-3 bg-slate-900 rounded-sm p-4">
        <Bot className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-white">WMS Assistant — Gerador de Descrição Técnica</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Usa Claude Haiku para redigir ficha técnica completa baseada nos dados do produto.
            Funciona melhor com SKU, natureza, atributos e compatibilidade preenchidos.
          </p>
        </div>
      </div>

      <Field label="Contexto adicional (opcional)">
        <textarea value={custom} onChange={e=>setCustom(e.target.value)} rows={2}
          placeholder="Ex: produto importado da China, substitui modelo XYZ, requer lubrificação a cada 6 meses..."
          className={inputCls} />
      </Field>

      <button onClick={generate} disabled={loading||!prod.sku}
        className={cn('w-full py-3 rounded-sm font-black text-xs flex items-center justify-center gap-2 transition',
          loading||!prod.sku
            ?'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            :'bg-yellow-400 hover:bg-yellow-300 text-slate-900')}>
        {loading?<RefreshCw className="w-4 h-4 animate-spin"/>:<Bot className="w-4 h-4"/>}
        {loading?'Gerando descrição técnica...':'Gerar Descrição com IA'}
      </button>

      {!prod.sku && <p className="text-[10px] text-amber-600 font-bold text-center">Defina o SKU antes de gerar.</p>}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-sm p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700 font-bold">{error}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className={labelCls}>Descrição Técnica Detalhada</p>
          {prod.descricao_detalhada && (
            <button onClick={()=>navigator.clipboard.writeText(prod.descricao_detalhada)}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-yellow-600 font-bold transition">
              <Copy className="w-3 h-3" />Copiar
            </button>
          )}
        </div>
        <textarea value={prod.descricao_detalhada||''} onChange={e=>onChange('descricao_detalhada',e.target.value)}
          rows={12} placeholder="A descrição técnica será gerada pela IA ou preenchida manualmente..."
          className={cn(inputCls,'leading-relaxed')} />
        <p className="text-[10px] text-slate-400 mt-1">
          Pode editar após geração. Esta descrição aparece na Nota Fiscal e no catálogo de vendas.
        </p>
      </div>
    </div>
  );
}

// ─── PRODUTO VAZIO ────────────────────────────────────────────────────────────

function produtoVazio() {
  return {
    sku:'', codigo_antigo:'', codigo_integracao:'', part_number:'',
    descricao:'', descricao_detalhada:'', observacao:'', ncm:'',
    tipo:'Peça', familia:'', marca:'', unidade:'PC',
    prefixo_vp:'', natureza:'', atributos_tecnicos:{},
    compatibilidade:[], cor_material:'',
    fotos:['','','',''],
    peso_liquido:'', peso_bruto:'', altura:'', largura:'', profundidade:'',
    estoque_erp:null, estoque_minimo:0, local_estoque:'', dias_crossdocking:0,
    movimenta_estoque:true, regra_expedicao:'FIFO',
    preco_venda:'', preco_custo:'', ean:'', embalagens:[],
    produto_pai_sku:'', ativo:true,
    curva_abc: null,
    enderecos_estoque: [],
  };
}

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────

const TABS = [
  { label:'Identificação',   Icon: Tag       },
  { label:'Compatibilidade', Icon: Building2 },
  { label:'Fotos',           Icon: Camera    },
  { label:'Embalagens',      Icon: Package   },
  { label:'Estoque & Regras',Icon: ArrowUpDown},
  { label:'Descrição IA',    Icon: Bot       },
];

// ─── QR CODE MODAL ────────────────────────────────────────────────────────────

const QR_BASE_URL = 'https://wmsverticalparts.com.br/cadastros/produtos';

function QRModal({ prod, onClose }) {
  const qrUrl = `${QR_BASE_URL}?sku=${encodeURIComponent(prod.sku)}`;

  function downloadPNG() {
    const canvas = document.getElementById('qr-canvas-dl');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `QR_${prod.sku}.png`;
    a.click();
  }

  function downloadSVG() {
    const svg = document.getElementById('qr-modal-svg');
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${prod.sku}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printLabel() {
    const canvas = document.getElementById('qr-canvas-dl');
    const imgSrc = canvas ? canvas.toDataURL('image/png') : null;
    const win = window.open('', '_blank', 'width=420,height=560');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Etiqueta QR — ${prod.sku}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Courier New',monospace;}
        .card{text-align:center;padding:20px 24px;border:2px solid #1e293b;border-radius:3px;display:inline-block;min-width:220px;}
        .brand{font-size:10px;font-weight:900;letter-spacing:.2em;color:#92400e;margin-bottom:8px;text-transform:uppercase;}
        .qr{display:block;margin:0 auto;width:180px;height:180px;}
        .sku{font-size:13px;font-weight:900;color:#1e293b;margin-top:8px;letter-spacing:.05em;word-break:break-all;}
        .desc{font-size:9px;color:#475569;margin-top:3px;max-width:200px;line-height:1.3;}
        .ant{font-size:9px;color:#b45309;font-weight:700;margin-top:2px;}
        .url{font-size:7px;color:#94a3b8;margin-top:6px;word-break:break-all;}
        @media print{@page{margin:5mm;size:60mm 80mm;}body{min-height:auto;}}
      </style>
    </head><body>
      <div class="card">
        <div class="brand">VerticalParts WMS</div>
        ${imgSrc
          ? `<img src="${imgSrc}" class="qr" alt="QR"/>`
          : `<div style="width:180px;height:180px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;">QR</div>`}
        <div class="sku">${prod.sku}</div>
        ${prod.descricao ? `<div class="desc">${prod.descricao}</div>` : ''}
        ${prod.codigo_antigo ? `<div class="ant">Ant: ${prod.codigo_antigo}</div>` : ''}
        <div class="url">${qrUrl}</div>
      </div>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>`);
    win.document.close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-700 shadow-2xl w-80 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}>

        {/* ── header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">QR Code do Produto</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{prod.sku}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── QR SVG — display ── */}
        <div className="flex justify-center py-5 px-5">
          <div className="p-4 bg-white border-2 border-slate-200 rounded-sm shadow-inner">
            <QRCodeSVG
              id="qr-modal-svg"
              value={qrUrl}
              size={212}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* QR Canvas oculto — PNG download em alta resolução */}
        <div className="hidden" aria-hidden>
          <QRCodeCanvas
            id="qr-canvas-dl"
            value={qrUrl}
            size={512}
            level="H"
            includeMargin
          />
        </div>

        {/* ── info produto ── */}
        <div className="mx-5 mb-4 bg-slate-50 dark:bg-slate-800 rounded-sm p-3">
          {prod.descricao && <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{prod.descricao}</p>}
          {prod.codigo_antigo && (
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">Cód. Antigo: {prod.codigo_antigo}</p>
          )}
          <p className="text-[9px] text-slate-400 mt-1 break-all leading-relaxed">{qrUrl}</p>
        </div>

        {/* ── ações ── */}
        <div className="px-5 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={downloadPNG}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-sm text-[11px] font-black transition">
              <Download className="w-3.5 h-3.5" />PNG · 512px
            </button>
            <button onClick={downloadSVG}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-sm text-[11px] font-black transition">
              <Download className="w-3.5 h-3.5" />SVG · Vetorial
            </button>
          </div>
          <button onClick={printLabel}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 dark:border-slate-600 hover:border-yellow-400 text-slate-700 dark:text-slate-300 rounded-sm text-[11px] font-black transition">
            <Printer className="w-3.5 h-3.5" />Imprimir Etiqueta
          </button>
          <p className="text-[9px] text-slate-400 text-center">
            PNG para impressoras · SVG para site comercial e Adobe Illustrator
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ProductCatalog() {
  const [searchParams] = useSearchParams();
  const savedRef = useRef(null);
  const fileInputRef = useRef(null);

  const [produtos,     setProdutos    ] = useState([]);
  const [loading,      setLoading     ] = useState(true);
  const [selectedId,   setSelectedId  ] = useState(null);
  const [search,       setSearch      ] = useState('');
  const [activeTab,    setActiveTab   ] = useState(0);
  const [saved,        setSaved       ] = useState(false);
  const [isNew,        setIsNew       ] = useState(false);
  const [saving,       setSaving      ] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [showQRModal,  setShowQRModal ] = useState(false);

  // ── fetch ──
  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('produtos').select('*').order('sku');
      if (error) throw error;
      const adapted = (data||[]).map(p => ({
        ...p,
        movimenta_estoque:  p.movimenta_estoque  ?? true,
        regra_expedicao:    p.regra_expedicao    || 'FIFO',
        compatibilidade:    p.compatibilidade    || [],
        atributos_tecnicos: p.atributos_tecnicos || {},
        fotos:              Array.isArray(p.fotos) ? p.fotos : ['','','',''],
        embalagens:         p.embalagens         || [],
        enderecos_estoque:  Array.isArray(p.enderecos_estoque) ? p.enderecos_estoque : [],
        curva_abc:          p.curva_abc          || null,
      }));
      setProdutos(adapted);
      const skuParam = searchParams.get('sku');
      if (skuParam) {
        const found = adapted.find(p=>p.sku===skuParam);
        if (found) setSelectedId(found.id);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ fetchProducts(); }, []);

  // ── selected ──
  const selected = useMemo(()=>
    isNew ? produtos.find(p=>p.id==='__new__') : produtos.find(p=>p.id===selectedId)
  , [produtos, selectedId, isNew]);

  function fieldChange(key, val) {
    setProdutos(prev=>prev.map(p=>
      (isNew ? p.id==='__new__' : p.id===selectedId) ? { ...p, [key]: val } : p
    ));
  }

  // ── new ──
  function handleNew() {
    setProdutos(prev=>[{ ...produtoVazio(), id:'__new__' }, ...prev]);
    setSelectedId(null); setIsNew(true); setActiveTab(0);
  }

  // ── save ──
  async function handleSave() {
    if (!selected) return;
    if (!selected.sku?.trim())       { alert('SKU é obrigatório'); return; }
    if (!selected.descricao?.trim()) { alert('Descrição é obrigatória'); return; }
    setSaving(true);
    try {
      const payload = {
        sku:                selected.sku.trim().toUpperCase(),
        codigo_antigo:      selected.codigo_antigo      || null,
        codigo_integracao:  selected.codigo_integracao  || null,
        part_number:        selected.part_number        || null,
        descricao:          selected.descricao,
        descricao_detalhada:selected.descricao_detalhada|| null,
        ncm:                selected.ncm                || null,
        tipo:               selected.tipo               || null,
        familia:            selected.familia            || null,
        marca:              selected.marca              || null,
        unidade:            selected.unidade            || 'PC',
        prefixo_vp:         selected.prefixo_vp         || null,
        natureza:           selected.natureza           || null,
        atributos_tecnicos: selected.atributos_tecnicos || {},
        compatibilidade:    selected.compatibilidade    || [],
        cor_material:       selected.cor_material       || null,
        fotos:              selected.fotos              || [],
        embalagens:         selected.embalagens         || [],
        produto_pai_sku:    selected.produto_pai_sku    || null,
        curva_abc:          selected.curva_abc          || null,
        enderecos_estoque:  selected.enderecos_estoque  || [],
        peso_liquido:       selected.peso_liquido  ? +selected.peso_liquido  : null,
        peso_bruto:         selected.peso_bruto    ? +selected.peso_bruto    : null,
        altura:             selected.altura        ? +selected.altura        : null,
        largura:            selected.largura       ? +selected.largura       : null,
        profundidade:       selected.profundidade  ? +selected.profundidade  : null,
        estoque_erp:        selected.estoque_erp   != null ? +selected.estoque_erp  : null,
        estoque_minimo:     selected.estoque_minimo ? +selected.estoque_minimo : 0,
        local_estoque:      selected.local_estoque || null,
        dias_crossdocking:  selected.dias_crossdocking ? +selected.dias_crossdocking : 0,
        movimenta_estoque:  selected.movimenta_estoque !== false,
        regra_expedicao:    selected.regra_expedicao || 'FIFO',
        preco_venda:        selected.preco_venda  ? +selected.preco_venda  : null,
        preco_custo:        selected.preco_custo  ? +selected.preco_custo  : null,
        ean:                selected.ean          || null,
        observacao:         selected.observacao   || null,
        ativo:              true,
      };
      const { data, error } = await supabase.from('produtos').upsert(payload, { onConflict:'sku' }).select().single();
      if (error) throw error;
      const saved_product = { ...payload, ...data,
        movimenta_estoque: payload.movimenta_estoque,
        compatibilidade: payload.compatibilidade,
        atributos_tecnicos: payload.atributos_tecnicos,
        fotos: payload.fotos, embalagens: payload.embalagens,
      };
      setProdutos(prev=>[
        saved_product,
        ...prev.filter(p=>p.id!=='__new__' && p.id!==selectedId),
      ].sort((a,b)=>(a.sku||'').localeCompare(b.sku||'')));
      setSelectedId(data.id); setIsNew(false);
      setSaved(true);
      savedRef.current && clearTimeout(savedRef.current);
      savedRef.current = setTimeout(()=>setSaved(false), 2500);
    } catch(e) {
      alert('Erro ao salvar: ' + (e.message||JSON.stringify(e)));
    } finally { setSaving(false); }
  }

  // ── delete ──
  async function handleDelete() {
    if (!selected) return;
    if (!window.confirm(`Excluir "${selected.sku}"? Esta ação não pode ser desfeita.`)) return;
    if (isNew) { setProdutos(prev=>prev.filter(p=>p.id!=='__new__')); setIsNew(false); setSelectedId(null); return; }
    const { error } = await supabase.from('produtos').delete().eq('id', selected.id);
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    setProdutos(prev=>prev.filter(p=>p.id!==selected.id));
    setSelectedId(null);
  }

  // ── import Omie ──
  async function handleImportOmie(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus({ running: true });
    try {
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type:'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
      const dataRows = rows.slice(3);
      let ok=0, errors=[];
      for (const row of dataRows) {
        const r = {};
        Object.entries(OMIE_COL).forEach(([col,key])=>{ r[key]=String(row[+col]||'').trim(); });
        if (!r.codigo) continue;
        const payload = {
          sku:                r.codigo,
          codigo_antigo:      r.codigo,
          codigo_integracao:  r.codigo_integracao||null,
          descricao:          r.descricao||r.codigo,
          ncm:                r.ncm||null,
          ean:                r.ean||null,
          unidade:            r.unidade||'PC',
          familia:            r.familia||null,
          marca:              r.marca||null,
          estoque_minimo:     r.estoque_minimo?+r.estoque_minimo:0,
          estoque_erp:        r.estoque_erp?+r.estoque_erp:null,
          preco_custo:        r.preco_custo?+r.preco_custo:null,
          preco_venda:        r.preco_venda?+r.preco_venda:null,
          local_estoque:      r.local_estoque||null,
          peso_liquido:       r.peso_liquido?+r.peso_liquido:null,
          peso_bruto:         r.peso_bruto?+r.peso_bruto:null,
          altura:             r.altura?+r.altura:null,
          largura:            r.largura?+r.largura:null,
          profundidade:       r.profundidade?+r.profundidade:null,
          dias_crossdocking:  r.dias_crossdocking?+r.dias_crossdocking:0,
          descricao_detalhada:r.descricao_detalhada||null,
          observacao:         r.observacao||null,
          movimenta_estoque:  true, regra_expedicao:'FIFO',
          compatibilidade:[], atributos_tecnicos:{}, fotos:['','','',''], embalagens:[], ativo:true,
        };
        const { error } = await supabase.from('produtos').upsert(payload, { onConflict:'sku' });
        if (error) errors.push(r.codigo); else ok++;
      }
      setImportStatus({ total:ok+errors.length, ok, errors });
      await fetchProducts();
    } catch(err) { setImportStatus({ error: err.message }); }
    e.target.value='';
  }

  // ── QR print ──
  function printQR(prod) {
    if (!prod?.sku) return;
    const qrUrl = `${window.location.origin}/cadastros/produtos?sku=${prod.sku}`;
    const win = window.open('', '_blank', 'width=400,height=520');
    if (!win) return;
    const svgEl = document.getElementById('qr-svg-product');
    const svgSrc = svgEl ? new XMLSerializer().serializeToString(svgEl) : '';
    win.document.write(`<!DOCTYPE html><html><head>
      <title>QR — ${prod.sku}</title>
      <style>
        body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;font-family:monospace;}
        .card{text-align:center;padding:24px;border:2px solid #1e293b;border-radius:4px;display:inline-block;}
        .brand{font-size:11px;font-weight:900;letter-spacing:.15em;color:#78350f;margin-bottom:4px;text-transform:uppercase;}
        .sku{font-size:14px;font-weight:900;color:#1e293b;margin-top:6px;letter-spacing:.05em;}
        .desc{font-size:10px;color:#64748b;margin-top:4px;max-width:200px;word-break:break-word;}
        svg{display:block;margin:0 auto;}
        @media print{body{margin:0;}@page{margin:8mm;}}
      </style>
    </head><body>
      <div class="card">
        <div class="brand">VerticalParts WMS</div>
        ${svgSrc}
        <div class="sku">${prod.sku}</div>
        ${prod.descricao?`<div class="desc">${prod.descricao}</div>`:''}
        ${prod.codigo_antigo?`<div class="desc" style="color:#b45309">Ant: ${prod.codigo_antigo}</div>`:''}
      </div>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>`);
    win.document.close();
  }

  // ── filtered list ──
  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    return produtos.filter(p=>
      !q ||
      p.sku?.toLowerCase().includes(q) ||
      p.descricao?.toLowerCase().includes(q) ||
      p.codigo_antigo?.toLowerCase().includes(q) ||
      p.ncm?.includes(q) ||
      p.familia?.toLowerCase().includes(q)
    );
  }, [produtos, search]);

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <EnterprisePageBase
      title="7.4 Catálogo de Produtos"
      breadcrumbItems={[{ label:'CADASTRAR', path:'/cadastros' }]}
    >
      <div className="flex bg-white dark:bg-slate-950 rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        style={{ height:'calc(100vh - 130px)' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex gap-1">
              <button onClick={handleNew}
                className="flex-1 flex items-center justify-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-sm py-2 text-[11px] font-black transition">
                <Plus className="w-3.5 h-3.5" />Novo Produto
              </button>
              <button onClick={()=>fileInputRef.current?.click()} title="Importar planilha Omie"
                className="p-2 border border-slate-300 dark:border-slate-700 rounded-sm hover:border-yellow-400 transition text-slate-500 dark:text-slate-400">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportOmie} />
              <button onClick={fetchProducts} title="Recarregar lista"
                className="p-2 border border-slate-300 dark:border-slate-700 rounded-sm hover:border-yellow-400 transition text-slate-500 dark:text-slate-400">
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="SKU, descrição, cód. antigo..."
                className={cn(inputCls,'pl-8 text-[11px]')} />
            </div>
          </div>

          {importStatus && !importStatus.running && (
            <div className={cn('mx-2 mt-2 p-2 rounded-sm text-[10px] font-bold border',
              importStatus.error
                ?'bg-red-50 text-red-700 border-red-200'
                :'bg-green-50 text-green-700 border-green-200')}>
              {importStatus.error
                ? `Erro: ${importStatus.error}`
                : `✓ ${importStatus.ok}/${importStatus.total} importados${importStatus.errors?.length?` · ${importStatus.errors.length} erros`:''}`}
              <button onClick={()=>setImportStatus(null)} className="ml-2 text-slate-400 hover:text-slate-600">×</button>
            </div>
          )}

          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">{filtered.length} produto{filtered.length!==1?'s':''}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : filtered.length===0 ? (
              <div className="p-6 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">Nenhum produto encontrado</p>
              </div>
            ) : (
              filtered.map(p => {
                const isSel = isNew ? p.id==='__new__' : p.id===selectedId;
                return (
                  <button key={p.id}
                    onClick={()=>{ setSelectedId(p.id); setIsNew(false); setActiveTab(0); }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition',
                      isSel && 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-l-yellow-400'
                    )}>
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn('text-[11px] font-black truncate',
                        isSel?'text-yellow-700 dark:text-yellow-400':'text-slate-800 dark:text-slate-200')}>
                        {p.sku || <span className="text-slate-400 italic">Novo produto</span>}
                      </p>
                      {p.prefixo_vp && (
                        <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 py-0.5 rounded-sm shrink-0">
                          {p.prefixo_vp}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.descricao}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {p.codigo_antigo && (
                        <p className="text-[9px] text-amber-600 font-bold">Ant: {p.codigo_antigo}</p>
                      )}
                      {p.curva_abc && (
                        <span className={cn('text-[9px] font-black px-1 py-0.5 rounded-sm border ml-auto',
                          p.curva_abc==='A'?'bg-emerald-100 text-emerald-700 border-emerald-300':
                          p.curva_abc==='B'?'bg-amber-100 text-amber-700 border-amber-300':
                                           'bg-slate-100 text-slate-600 border-slate-300')}>
                          {p.curva_abc}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Package className="w-16 h-16 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-black">Selecione um produto</p>
                <p className="text-xs mt-1">ou clique em <span className="text-yellow-600 font-black">Novo Produto</span></p>
              </div>
            </div>
          ) : (
            <>
              {/* header */}
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {selected.sku || <span className="text-slate-400">Novo produto</span>}
                    </p>
                    {selected.prefixo_vp && (
                      <span className="text-[10px] font-black bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-sm border border-yellow-300 dark:border-yellow-700 shrink-0">
                        {selected.prefixo_vp}
                      </span>
                    )}
                    {saved && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-black">
                        <CheckCircle2 className="w-3 h-3" />Salvo
                      </span>
                    )}
                  </div>
                  {selected.descricao && <p className="text-[11px] text-slate-500 truncate mt-0.5">{selected.descricao}</p>}
                  {selected.codigo_antigo && (
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">Cód. Antigo: {selected.codigo_antigo}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* QR Code compacto — clica para abrir modal */}
                  {selected.sku && (
                    <button
                      onClick={()=>setShowQRModal(true)}
                      title="Expandir QR Code — baixar PNG/SVG ou imprimir etiqueta"
                      className="flex flex-col items-center gap-0.5 group p-1 border border-slate-200 dark:border-slate-700 hover:border-yellow-400 rounded-sm transition bg-white dark:bg-slate-900">
                      <QRCodeSVG
                        value={`${QR_BASE_URL}?sku=${encodeURIComponent(selected.sku)}`}
                        size={40}
                        level="M"
                        includeMargin={false}
                      />
                      <span className="flex items-center gap-0.5 text-[9px] font-black text-slate-400 group-hover:text-yellow-600 transition">
                        <QrCode className="w-2.5 h-2.5" />ver
                      </span>
                    </button>
                  )}
                  <button onClick={handleDelete} title="Excluir produto"
                    className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 hover:border-red-300 rounded-sm transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className={cn('flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-black transition',
                      saving?'bg-slate-200 text-slate-400 cursor-not-allowed':'bg-yellow-400 hover:bg-yellow-300 text-slate-900')}>
                    {saving?<RefreshCw className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}
                    {saving?'Salvando...':'Salvar'}
                  </button>
                </div>
              </div>

              {/* tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 overflow-x-auto">
                {TABS.map((t,i)=>{
                  const { Icon } = t;
                  return (
                    <button key={i} onClick={()=>setActiveTab(i)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-black whitespace-nowrap border-b-2 transition',
                        activeTab===i
                          ?'border-yellow-400 text-yellow-700 dark:text-yellow-400 bg-white dark:bg-slate-950'
                          :'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      )}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />{t.label}
                    </button>
                  );
                })}
              </div>

              {/* content */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeTab===0 && <TabIdentificacao  prod={selected} onChange={fieldChange} onGoToIA={()=>setActiveTab(5)} />}
                {activeTab===1 && <TabCompatibilidade prod={selected} onChange={fieldChange} />}
                {activeTab===2 && <TabFotos          prod={selected} onChange={fieldChange} />}
                {activeTab===3 && <TabEmbalagens     prod={selected} onChange={fieldChange} />}
                {activeTab===4 && <TabEstoqueRegras  prod={selected} onChange={fieldChange} />}
                {activeTab===5 && <TabDescricaoIA    prod={selected} onChange={fieldChange} />}
              </div>
            </>
          )}
        </div>
      </div>
      {/* ── QR MODAL ── */}
      {showQRModal && selected?.sku && (
        <QRModal prod={selected} onClose={()=>setShowQRModal(false)} />
      )}
    </EnterprisePageBase>
  );
}
