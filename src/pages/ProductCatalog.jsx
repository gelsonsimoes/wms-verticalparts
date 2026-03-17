import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package, Search, Plus, Save, Trash2, Download,
  ChevronRight, Zap, Settings, Box, Layers, Camera,
  Bot, X, CheckCircle2, AlertCircle, Copy, Check,
  RefreshCw, Tag, FileSpreadsheet, Info,
  TrendingUp, TrendingDown, Minus, Building2,
  Image, Barcode, Wrench,
  MapPin, ArrowUpDown, Hash, Cable, Eye,
  Printer, QrCode, FileDown, Droplets, DoorOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { supabase } from '../services/supabaseClient';
import { logActivity } from '../services/activityLogger';
import { useApp } from '../hooks/useApp';

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

const CORES = [
  { code:'PR',    l:'Preto'                      },
  { code:'BR',    l:'Branco'                     },
  { code:'CZ',    l:'Cinza'                      },
  { code:'GF',    l:'Grafite'                    },
  { code:'AM',    l:'Amarelo'                    },
  { code:'VM',    l:'Vermelho'                   },
  { code:'AZ',    l:'Azul'                       },
  { code:'VD',    l:'Verde'                      },
  { code:'LR',    l:'Laranja'                    },
  { code:'MR',    l:'Marrom'                     },
  { code:'RX',    l:'Roxo'                       },
  { code:'RS',    l:'Rosa'                       },
  { code:'BG',    l:'Bege'                       },
  { code:'CP',    l:'Champanhe'                  },
  { code:'DO',    l:'Dourado'                    },
  { code:'TR',    l:'Transparente'               },
  { code:'VD_AM', l:'Verde-Amarelo (Terra)'      },
];

const MATERIAIS = [
  { code:'IN',  l:'Inox (Aço Inoxidável)'   },
  { code:'AC',  l:'Aço'                     },
  { code:'AL',  l:'Alumínio'                },
  { code:'CR',  l:'Cromado'                 },
  { code:'CU',  l:'Cobre'                   },
  { code:'ZN',  l:'Zinco'                   },
  { code:'BZ',  l:'Bronze'                  },
  { code:'FE',  l:'Ferro Fundido'           },
  { code:'NY',  l:'Nylon'                   },
  { code:'PL',  l:'Plástico ABS'            },
  { code:'NE',  l:'Neoprene'                },
  { code:'BO',  l:'Borracha'                },
  { code:'TE',  l:'Teflon'                  },
  { code:'VI',  l:'Vidro'                   },
  { code:'MA',  l:'Madeira'                 },
];

// ─── TIPO FÍSICO — gatilho para grupos de atributos condicionais ──────────────
const TIPOS_FISICOS = [
  { code:'CIL', label:'Cilíndrico Oco',          desc:'Roldanas, Rolamentos, Buchas, Polias',         icon:'Settings' },
  { code:'MAC', label:'Maciço / Roscado',         desc:'Parafusos, Eixos, Pinos, Chavetas',            icon:'Wrench'   },
  { code:'FLX', label:'Flexível Linear',          desc:'Cabos de Aço, Correntes, Correias, Corrimãos', icon:'Cable'    },
  { code:'ELE', label:'Elétrico / Eletrônico',    desc:'Motores, Sensores, Placas, Inversores',        icon:'Zap'      },
  { code:'FLU', label:'Fluido / Químico',         desc:'Óleos, Graxas, Colas',                         icon:'Droplets' },
  { code:'EST', label:'Estrutural / Chapa',       desc:'Vigas, Tubos, Chapas',                         icon:'Box'      },
  { code:'PRT', label:'Porta de Pavimento/Cabina',desc:'Portas, Operadores de Porta, Travamentos',     icon:'DoorOpen' },
  { code:'OUT', label:'Outro',                    desc:'Não se encaixa nas categorias acima',          icon:'Package'  },
];

const ATTR_GROUPS = {
  CIL: {
    label: 'Geometria Cilíndrica Oca',
    fields: [
      { key:'de_mm',     label:'Diâmetro Externo — DE', unit:'mm', type:'number' },
      { key:'di_mm',     label:'Diâmetro Interno — DI', unit:'mm', type:'number' },
      { key:'largura_mm',label:'Largura / Altura Total', unit:'mm', type:'number' },
      { key:'vedacao',   label:'Vedação / Rolamento Interno', type:'select',
        opts:['2RS','ZZ','Aberto','Nylon','Bronze','Poliuretano'] },
    ],
    skuFn: (a) => [
      a.de_mm && a.di_mm ? `DE${a.de_mm}xDI${a.di_mm}` : '',
      a.largura_mm ? `L${a.largura_mm}` : '',
    ].filter(Boolean).join('x'),
  },
  MAC: {
    label: 'Maciço / Roscado',
    fields: [
      { key:'rosca', label:'Rosca / Diâmetro Nominal', type:'select',
        opts:['M3','M4','M5','M6','M8','M10','M12','M14','M16','M20','M24','M30',
              '1/4"','5/16"','3/8"','1/2"','5/8"','3/4"','1"'] },
      { key:'comprimento_mm', label:'Comprimento Total', unit:'mm', type:'number' },
      { key:'passo', label:'Passo da Rosca', type:'select',
        opts:['0.5','0.7','0.75','1.0','1.25','1.5','1.75','2.0','2.5','3.0','Auto Métrico'] },
      { key:'classe', label:'Classe de Resistência', type:'select',
        opts:['4.6','4.8','6.8','8.8','10.9','12.9','Inox A2','Inox A4','Bronze'] },
      { key:'cabeca', label:'Tipo de Cabeça', type:'select',
        opts:['Sextavada','Allen (Soquete)','Phillips','Torx','Flangeada','Redonda','Cega','Chata'] },
    ],
    skuFn: (a) => [a.rosca, a.comprimento_mm ? `L${a.comprimento_mm}` : '', a.classe].filter(Boolean).join('-'),
  },
  FLX: {
    label: 'Elemento Flexível Linear',
    fields: [
      { key:'bitola_mm',    label:'Bitola / Diâmetro', unit:'mm', type:'number' },
      { key:'construcao',   label:'Construção / Especificação', type:'text',
        placeholder:'Ex: 6x19+AF, Perfil 1699, Passo 101.25mm' },
      { key:'comprimento_m',label:'Comprimento (bobina/rolo)', unit:'m', type:'number' },
      { key:'carga_kn',     label:'Carga de Ruptura', unit:'kN', type:'number' },
      { key:'nucleo',       label:'Material do Núcleo', type:'select',
        opts:['Fibra Natural (AN)','Fibra Sintética (AS)','Aço (AA)','Tecido','N/A'] },
    ],
    skuFn: (a) => [
      a.bitola_mm ? `${a.bitola_mm}MM` : '',
      a.comprimento_m ? `${a.comprimento_m}M` : '',
    ].filter(Boolean).join('x'),
  },
  ELE: {
    label: 'Elétrico / Eletrônico',
    fields: [
      { key:'tensao',       label:'Tensão Nominal', type:'select',
        opts:['5V','12V','24V DC','48V DC','110V AC','127V AC','220V AC','380V AC','440V AC','480V AC','Bivolt 110/220V'] },
      { key:'corrente_tipo',label:'Tipo de Corrente', type:'select', opts:['AC (Alternada)','DC (Contínua)','AC/DC'] },
      { key:'frequencia',   label:'Frequência', type:'select', opts:['50Hz','60Hz','50/60Hz','DC (não aplicável)'] },
      { key:'potencia',     label:'Potência', type:'text', placeholder:'Ex: 1.5kW, 2CV, 750W' },
      { key:'corrente_a',   label:'Corrente Nominal', unit:'A', type:'number' },
      { key:'ip',           label:'Grau de Proteção IP', type:'select',
        opts:['IP20','IP21','IP40','IP44','IP54','IP55','IP65','IP66','IP67','IP68'] },
      { key:'protocolo',    label:'Protocolo / Sinal', type:'select',
        opts:['Digital On/Off','Analógico 4-20mA','0-10V','Modbus RTU','Modbus TCP/IP','CANopen','Profibus DP','Ethernet/IP','N/A'] },
    ],
    skuFn: (a) => [
      a.tensao?.split(' ')[0],
      a.corrente_tipo?.split(' ')[0],
      a.potencia,
    ].filter(Boolean).join('-'),
  },
  FLU: {
    label: 'Fluido / Químico',
    fields: [
      { key:'volume',      label:'Volume / Embalagem', type:'select',
        opts:['100ml','200ml','500ml','1L','5L','18L','20L','50L','200L'] },
      { key:'viscosidade', label:'Viscosidade ISO', type:'select',
        opts:['ISO VG 10','ISO VG 22','ISO VG 32','ISO VG 46','ISO VG 68','ISO VG 100','ISO VG 150','ISO VG 220','NLGI 1','NLGI 2','NLGI 3','Grau Alimentício'] },
      { key:'base',        label:'Base Química', type:'select',
        opts:['Mineral','Semissintético','Sintético PAO','Éster Sintético','Vegetal','Silicone'] },
      { key:'aplicacao',   label:'Aplicação Principal', type:'select',
        opts:['Hidráulico','Lubrificação Geral','Corrente / Transmissão','Rolamento','Redutor','Vulcanização','Limpeza / Desengraxante','Anticorrosivo'] },
    ],
    skuFn: (a) => [
      a.viscosidade?.replace('ISO VG ','VG'),
      a.volume?.replace(' ',''),
    ].filter(Boolean).join('-'),
  },
  EST: {
    label: 'Estrutural / Chapa',
    fields: [
      { key:'espessura_mm',  label:'Espessura', unit:'mm', type:'number' },
      { key:'largura_mm',    label:'Largura', unit:'mm', type:'number' },
      { key:'comprimento_m', label:'Comprimento Padrão', unit:'m', type:'number' },
      { key:'perfil',        label:'Tipo de Perfil', type:'select',
        opts:['Chapa Lisa','Chapa Xadrez','Tubo Quadrado','Tubo Redondo','Viga I','Viga U (Perfil U)','Cantoneira L','Cantoneira Z','Barra Chata'] },
      { key:'norma_aco',     label:'Norma / Grau do Aço', type:'select',
        opts:['SAE 1010','SAE 1020','SAE 1045','SAE 4140','A36','ASTM A572 Gr50','Inox 304','Inox 316','Galvanizado','Zincado'] },
    ],
    skuFn: (a) => [
      a.perfil?.substring(0,4).toUpperCase().replace(/[\s/()]/g,''),
      a.espessura_mm ? `E${a.espessura_mm}` : '',
      a.largura_mm ? `L${a.largura_mm}` : '',
    ].filter(Boolean).join('-'),
  },
  PRT: {
    label: 'Porta de Pavimento / Cabina',
    fields: [
      { key:'tipo_porta', label:'Tipo de Porta', type:'select',
        opts:['Pavimento (PP)','Cabina (PC)','Pantográfica (PG)','Telescópica 2 Folhas (T2)','Telescópica 4 Folhas (T4)'] },
      { key:'abertura',   label:'Sentido de Abertura', type:'select',
        opts:['Esquerda (AE)','Direita (AD)','Central 2 Folhas (AC)','Central 4 Folhas (A4)'] },
      { key:'altura_mm',      label:'Altura do Vão', unit:'mm', type:'number' },
      { key:'largura_mm',     label:'Largura do Vão', unit:'mm', type:'number' },
      { key:'profundidade_mm',label:'Profundidade / Soleira', unit:'mm', type:'number' },
      { key:'folhas',     label:'Nº de Folhas', type:'select', opts:['1','2','4','6'] },
    ],
    skuFn: (a) => {
      const tipo = (a.tipo_porta || '').match(/\((\w+)\)/)?.[1] || '';
      const aber = (a.abertura   || '').match(/\((\w+)\)/)?.[1] || '';
      const dims = [a.altura_mm, a.largura_mm, a.profundidade_mm].filter(Boolean).join('X');
      return [tipo, aber, dims].filter(Boolean).join('-');
    },
  },
  OUT: {
    label: 'Outro / Livre',
    fields: [
      { key:'spec_livre', label:'Especificação Livre', type:'text',
        placeholder:'Descreva dimensões e especificações relevantes para o SKU' },
    ],
    skuFn: (a) => a.spec_livre || '',
  },
};

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

function buildSKU({ prefixo, nome_sku, tipo_fisico, atributos, compat, cor, material }) {
  const parts = [prefixo];
  if (nome_sku) parts.push(nome_sku.toUpperCase());
  if (tipo_fisico && ATTR_GROUPS[tipo_fisico]) {
    const seg = ATTR_GROUPS[tipo_fisico].skuFn(atributos || {});
    if (seg) parts.push(seg);
  }
  if (compat) parts.push(compat);
  if (cor) parts.push(cor);
  if (material) parts.push(material);
  return parts.filter(Boolean).join('-');
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

  const prefixo     = prod.prefixo_vp || '';
  const nome_sku    = at.nome_sku    || '';
  const tipo_fisico = at.tipo_fisico || '';
  const compat      = (prod.compatibilidade||[])[0] || '';
  const cor         = at.cor        || '';
  const material    = at.material   || '';

  const generatedSKU = buildSKU({ prefixo, nome_sku, tipo_fisico, atributos: at, compat, cor, material });

  function setAtrib(key, val) {
    onChange('atributos_tecnicos', { ...at, [key]: val });
  }
  function setTipoFisico(code) {
    // limpa os campos dinâmicos antigos mas mantém cor/material/tipo_fisico
    const { cor: c, material: m } = at;
    onChange('atributos_tecnicos', { tipo_fisico: code, ...(c ? { cor: c } : {}), ...(m ? { material: m } : {}) });
  }
  function setPrefixo(code) {
    onChange('prefixo_vp', code);
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

  const group = tipo_fisico ? ATTR_GROUPS[tipo_fisico] : null;
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

            {/* PASSO 1 — PREFIXO VP */}
            <div>
              <p className={cn(labelCls,'mb-1.5')}>Passo 1 — Prefixo VP *</p>
              <select
                value={prefixo}
                onChange={e => setPrefixo(e.target.value)}
                className={cn(inputCls, 'text-[11px]')}
              >
                <option value="">— Selecione o prefixo —</option>
                {prefixGroups.map(group => (
                  <optgroup key={group} label={group}>
                    {VP_PREFIXES.filter(p => p.group === group).map(p => (
                      <option key={p.code} value={p.code}>{p.code} — {p.desc}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {prefixo && (
                <p className="text-[10px] text-slate-500 mt-1">
                  <span className="font-black text-yellow-600">{prefixo}</span> — {VP_PREFIXES.find(p=>p.code===prefixo)?.desc}
                </p>
              )}
            </div>

            {/* PASSO 2 — TIPO FÍSICO */}
            {prefixo && (
              <div>
                <p className={cn(labelCls,'mb-1.5')}>Passo 2 — Tipo Físico *</p>
                <select
                  value={tipo_fisico}
                  onChange={e => setTipoFisico(e.target.value)}
                  className={cn(inputCls, 'text-[11px]')}
                >
                  <option value="">— Selecione o tipo físico —</option>
                  {TIPOS_FISICOS.map(t => (
                    <option key={t.code} value={t.code}>{t.label} — {t.desc}</option>
                  ))}
                </select>
              </div>
            )}

            {/* PASSO 3 — NOME DO PRODUTO p/ SKU */}
            {prefixo && (
              <div>
                <p className={cn(labelCls,'mb-1.5')}>Passo 3 — Nome do Produto <span className="text-yellow-600">(aparece no SKU)</span></p>
                <input
                  type="text"
                  value={nome_sku}
                  onChange={e => setAtrib('nome_sku', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8))}
                  placeholder="Ex: ROLD, PP, PARA, CABO, MOTOR..."
                  maxLength={8}
                  className={cn(inputCls,'font-black tracking-widest uppercase')}
                />
                <p className="text-[10px] text-slate-400 mt-1">Abreviação curta do produto · máx. 8 caracteres · somente letras e números</p>
              </div>
            )}

            {/* PASSO 4 — DESCRIÇÃO RESUMIDA */}
            {prefixo && (
              <div>
                <p className={cn(labelCls,'mb-1.5')}>Passo 4 — Descrição Resumida <span className="text-slate-400">(nome técnico completo)</span></p>
                <input
                  type="text"
                  value={prod.descricao||''}
                  onChange={e => onChange('descricao', e.target.value)}
                  placeholder="Nome técnico do produto — Ex: Roldana de Desvio Nylon, Parafuso Allen M12..."
                  className={inputCls}
                />
              </div>
            )}

            {/* CAMPOS DINÂMICOS */}
            {group && (
              <div>
                <p className={cn(labelCls,'mb-2')}>Passo 5 — {group.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  {group.fields.map(f => (
                    <Field key={f.key} label={f.label + (f.unit ? ` (${f.unit})` : '')}>
                      {f.type === 'select' ? (
                        <select value={at[f.key]||''} onChange={e=>setAtrib(f.key, e.target.value)} className={inputCls}>
                          <option value="">— selecione —</option>
                          {(f.opts||[]).map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type === 'number' ? 'number' : 'text'}
                          value={at[f.key]||''}
                          onChange={e=>setAtrib(f.key, e.target.value)}
                          placeholder={f.placeholder||''}
                          className={inputCls}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {/* COMPATIBILIDADE */}
            {prefixo && (
              <div>
                <p className={cn(labelCls,'mb-1.5')}>Passo 6 — Compatibilidade</p>
                <Field label="Compatibilidade — código SKU" tip="Primeira seleção define o CC no SKU. Para múltiplas marcas use a aba Compatibilidade.">
                  <Sel value={compat} onChange={v=>onChange('compatibilidade', v?[v]:[])}
                    options={MARCAS_COMPAT.map(m=>({v:m.abrev, l:`${m.nome}  →  ${m.abrev}`}))} />
                </Field>
              </div>
            )}

            {/* COR + MATERIAL */}
            {prefixo && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cor">
                  <select value={cor} onChange={e=>setAtrib('cor', e.target.value)} className={inputCls}>
                    <option value="">— sem cor —</option>
                    {CORES.map(c=><option key={c.code} value={c.code}>{c.l} ({c.code})</option>)}
                  </select>
                </Field>
                <Field label="Material">
                  <select value={material} onChange={e=>setAtrib('material', e.target.value)} className={inputCls}>
                    <option value="">— sem material —</option>
                    {MATERIAIS.map(m=><option key={m.code} value={m.code}>{m.l} ({m.code})</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* SKU GERADO */}
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
            <Inp value={prod.sku||''} onChange={v=>onChange('sku',v)} placeholder="Ex: VPEL-DE50xDI20-L15-CCO-IN-AC" />
            {!showBuilder && (
              <button onClick={()=>setShowBuilder(true)} title="Abrir gerador de SKU"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-400 transition">
                <Hash className="w-4 h-4" />
              </button>
            )}
          </div>
        </Field>

        <Field label="NCM" tip="Nomenclatura Comum do Mercosul — obrigatório para NF-e">
          <Inp value={prod.ncm||''} onChange={v=>onChange('ncm',v)} placeholder="0000.00.00" />
        </Field>

        <Field label="Código Antigo (Legado / Omie)" tip="Código anterior do produto. Aparece na lista lateral para todos os usuários.">
          <Inp value={prod.codigo_antigo||''} onChange={v=>onChange('codigo_antigo',v)} placeholder="Ex: VPER-0042, VPKIT-1699a" />
        </Field>

        <Field label="Part Number (Importação)" tip="Código do fabricante original — válido para importações">
          <Inp value={prod.part_number||''} onChange={v=>onChange('part_number',v)} placeholder="Ex: BST-PP-AE-2100" />
        </Field>

        <Field label="Código Integração Omie" tip="ID numérico gerado pelo Omie ERP">
          <Inp value={prod.codigo_integracao||''} onChange={v=>onChange('codigo_integracao',v)} placeholder="00000000000042" />
        </Field>

        <Field label="Tipo">
          <Sel value={prod.tipo||''} onChange={v=>onChange('tipo',v)} options={TIPOS} />
        </Field>

        <Field label="Família">
          <Sel value={prod.familia||''} onChange={v=>onChange('familia',v)} options={FAMILIAS} />
        </Field>

        <Field label="Marca / Fabricante Original">
          <Inp value={prod.marca||''} onChange={v=>onChange('marca',v)} placeholder="Ex: Draka EHC, Semperit, BST" />
        </Field>

        <Field label="Unidade de Medida" required>
          <Sel value={prod.unidade||''} onChange={v=>onChange('unidade',v)} options={UNIDADES} />
        </Field>

        <Field label="Barcode EAN">
          <div className="flex gap-1">
            <Inp value={prod.ean||''} onChange={v=>onChange('ean',v)} placeholder="00000000000000" />
            <button onClick={()=>onChange('ean', gerarEAN13())} title="Gerar EAN-13"
              className="px-2 bg-slate-200 dark:bg-slate-700 rounded-sm hover:bg-yellow-300 dark:hover:bg-yellow-600 transition">
              <Barcode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </Field>

        <Field label="Local de Estoque Preferencial">
          <Inp value={prod.local_estoque||''} onChange={v=>onChange('local_estoque',v)} placeholder="Ex: A-01-01" />
        </Field>
      </div>

      {/* ── DIMENSÕES & PESO ── */}
      <div>
        <p className={cn(labelCls,'mb-3')}>Dimensões Físicas & Peso</p>
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

      {/* ── LOGÍSTICA ── */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Dias Cross-docking">
          <Inp type="number" value={prod.dias_crossdocking||''} onChange={v=>onChange('dias_crossdocking',v)} placeholder="0" />
        </Field>

        <Field label="Produto Pai — SKU (BOM)" tip="Se este produto é componente de outro, informe o SKU pai">
          <Inp value={prod.produto_pai_sku||''} onChange={v=>onChange('produto_pai_sku',v)} placeholder="Ex: VPEL-CONJUNTO-001" />
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

// ─── TAB 3 — FOTOS ───────────────────────────────────────────────────────────

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

// ─── TAB 4 — EMBALAGENS ──────────────────────────────────────────────────────

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

// ─── TAB 5 — ESTOQUE & REGRAS ────────────────────────────────────────────────

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

// ─── TAB 2 — DESCRIÇÃO IA ────────────────────────────────────────────────────

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
          tipoFisico: prod.tipo_fisico||'',
          tipoFisicoLabel: prod.tipo_fisico ? (ATTR_GROUPS[prod.tipo_fisico]?.label||'') : '',
          attributes: prod.atributos_tecnicos||{},
          selectedCompatibility: compat,
          manualReference: prod.marca||'',
          additionalDetails: custom,
          sku: prod.sku||'',
          descricao: prod.descricao||'',
          ncm: prod.ncm||'',
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

// ─── TAB 6 — PRODUTOS (tabela completa com filtros) ──────────────────────────

function TabProdutos({ produtos, onSelect }) {
  const [busca,      setBusca     ] = useState('');
  const [filtFamilia,setFiltFamilia] = useState('');
  const [filtTipo,   setFiltTipo  ] = useState('');
  const [filtAtivo,  setFiltAtivo ] = useState('');

  const base = useMemo(() => produtos.filter(p => p.id !== '__new__'), [produtos]);

  const familias = useMemo(() => [...new Set(base.map(p=>p.familia).filter(Boolean))].sort(), [base]);
  const tipos    = useMemo(() => [...new Set(base.map(p=>p.tipo).filter(Boolean))].sort(),    [base]);

  const filtrados = useMemo(() => {
    return base.filter(p => {
      const q = busca.toLowerCase();
      if (busca && !(
        (p.sku||'').toLowerCase().includes(q) ||
        (p.descricao||'').toLowerCase().includes(q) ||
        (p.familia||'').toLowerCase().includes(q) ||
        (p.tipo||'').toLowerCase().includes(q) ||
        (p.marca||'').toLowerCase().includes(q) ||
        (p.ncm||'').toLowerCase().includes(q) ||
        (p.codigo_antigo||'').toLowerCase().includes(q) ||
        (p.part_number||'').toLowerCase().includes(q)
      )) return false;
      if (filtFamilia && p.familia !== filtFamilia) return false;
      if (filtTipo    && p.tipo    !== filtTipo)    return false;
      if (filtAtivo === 'sim' && p.ativo === false) return false;
      if (filtAtivo === 'nao' && p.ativo !== false) return false;
      return true;
    });
  }, [base, busca, filtFamilia, filtTipo, filtAtivo]);

  const selCls = cn(inputCls, 'text-[11px] py-1.5');

  return (
    <div className="animate-in fade-in duration-300 space-y-2">

      {/* ── FILTROS ── */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={busca} onChange={e=>setBusca(e.target.value)}
            placeholder="Buscar por SKU, descrição, marca, NCM, cód. antigo..."
            className={cn(inputCls,'pr-8 text-[11px] py-1.5')} />
        </div>
        <select value={filtFamilia} onChange={e=>setFiltFamilia(e.target.value)} className={selCls}>
          <option value="">— Todas as Famílias —</option>
          {familias.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        <div className="flex gap-2">
          <select value={filtTipo} onChange={e=>setFiltTipo(e.target.value)} className={selCls}>
            <option value="">— Todos os Tipos —</option>
            {tipos.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtAtivo} onChange={e=>setFiltAtivo(e.target.value)} className={cn(selCls,'w-28 shrink-0')}>
            <option value="">Todos</option>
            <option value="sim">Ativo</option>
            <option value="nao">Inativo</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500">{filtrados.length} de {base.length} produto(s)</span>
        {(busca||filtFamilia||filtTipo||filtAtivo) &&
          <button onClick={()=>{setBusca('');setFiltFamilia('');setFiltTipo('');setFiltAtivo('');}}
            className="text-[10px] font-black text-yellow-600 hover:text-yellow-500 transition">
            ✕ Limpar filtros
          </button>}
      </div>

      {/* ── TABELA COMPLETA ── */}
      <div className="overflow-auto rounded-sm border border-slate-200 dark:border-slate-700"
        style={{maxHeight:'calc(100vh - 310px)'}}>
        <table className="text-[11px] border-collapse" style={{minWidth:'2400px'}}>
          <thead className="sticky top-0 bg-slate-900 text-white z-10">
            <tr>
              {[
                'SKU','Descrição','Família','Tipo','Tipo Físico',
                'NCM','Unid.','Marca / Fabricante',
                'Part Number','Cód. Integração Omie',
                'Barcode EAN','Local de Estoque',
                'Altura (cm)','Largura (cm)','Prof. (cm)',
                'Peso Líq. (kg)','Peso Bruto (kg)',
                'Cross-dock (dias)','Produto Pai SKU',
                'Ativo','Cód. Antigo (Legado / Omie)',
              ].map(h => (
                <th key={h} className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-widest whitespace-nowrap border-r border-slate-700 last:border-0 sticky top-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => {
              const at = p.atributos_tecnicos || {};
              const tipoFisicoLabel = at.tipo_fisico
                ? (TIPOS_FISICOS.find(t=>t.code===at.tipo_fisico)?.label || at.tipo_fisico)
                : '—';
              const rowCls = cn(
                'cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors',
                i%2===0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900',
                'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              );
              const td  = 'px-3 py-1.5 text-slate-600 dark:text-slate-300 whitespace-nowrap';
              const tdb = 'px-3 py-1.5 font-black text-slate-800 dark:text-white whitespace-nowrap';
              const tdn = 'px-3 py-1.5 text-slate-400 dark:text-slate-500 whitespace-nowrap text-center';
              const val = (v) => v ?? '—';
              return (
                <tr key={p.id} onClick={()=>onSelect(p.id)} className={rowCls}>
                  <td className={tdb}>{p.sku}</td>
                  <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300 max-w-[280px] truncate">{p.descricao||'—'}</td>
                  <td className={td}>{p.familia||'—'}</td>
                  <td className={td}>{p.tipo||'—'}</td>
                  <td className={td}>{tipoFisicoLabel}</td>
                  <td className={td}>{p.ncm||'—'}</td>
                  <td className={cn(tdn,'font-bold text-slate-700')}>{p.unidade||'—'}</td>
                  <td className={td}>{p.marca||'—'}</td>
                  <td className={td}>{p.part_number||'—'}</td>
                  <td className={td}>{p.codigo_integracao||'—'}</td>
                  <td className={td}>{p.ean||'—'}</td>
                  <td className={td}>{p.local_estoque||p.enderecos_estoque?.[0]||'—'}</td>
                  <td className={tdn}>{val(p.altura)}</td>
                  <td className={tdn}>{val(p.largura)}</td>
                  <td className={tdn}>{val(p.profundidade)}</td>
                  <td className={tdn}>{val(p.peso_liquido)}</td>
                  <td className={tdn}>{val(p.peso_bruto)}</td>
                  <td className={tdn}>{val(p.dias_crossdocking)}</td>
                  <td className={td}>{p.produto_pai_sku||'—'}</td>
                  <td className="px-3 py-1.5 text-center">
                    <span className={cn('px-1.5 py-0.5 rounded-sm text-[9px] font-black',
                      p.ativo!==false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                      {p.ativo!==false ? 'SIM' : 'NÃO'}
                    </span>
                  </td>
                  <td className={cn(td,'text-slate-500 italic')}>{p.codigo_antigo||'—'}</td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={21} className="px-3 py-10 text-center text-slate-400 text-xs font-bold">
                {base.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto corresponde aos filtros.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 font-bold text-center">
        Clique em qualquer linha para abrir o produto no formulário de cadastro
      </p>
    </div>
  );
}

// ─── PRODUTO VAZIO ────────────────────────────────────────────────────────────

function produtoVazio() {
  return {
    sku:'', codigo_antigo:'', codigo_integracao:'', part_number:'',
    descricao:'', descricao_detalhada:'', observacao:'', ncm:'',
    tipo:'Peça', familia:'', marca:'', unidade:'PC',
    prefixo_vp:'', natureza:'', tipo_fisico:'', atributos_tecnicos:{},
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
  { label:'Identificação / SKU', Icon: Tag        },
  { label:'Compatibilidade',     Icon: Building2  },
  { label:'Descrição IA',        Icon: Bot        },
  { label:'Fotos',               Icon: Camera     },
  { label:'Embalagens',          Icon: Package    },
  { label:'Estoque & Regras',    Icon: ArrowUpDown},
  { label:'Produtos',            Icon: Layers     },
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
  const { currentUser } = useApp();
  const _logUser = () => currentUser?.nome || currentUser?.usuario || 'OPERADOR';

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
      const adapted = (data||[]).map(p => {
        const at = p.atributos_tecnicos || {};
        // Migra tipo_fisico do campo raiz para dentro de atributos_tecnicos se necessário
        const tipoFisicoFinal = at.tipo_fisico || p.tipo_fisico || '';
        return {
          ...p,
          movimenta_estoque:  p.movimenta_estoque  ?? true,
          regra_expedicao:    p.regra_expedicao    || 'FIFO',
          compatibilidade:    p.compatibilidade    || [],
          atributos_tecnicos: tipoFisicoFinal ? { ...at, tipo_fisico: tipoFisicoFinal } : at,
          fotos:              Array.isArray(p.fotos) ? p.fotos : ['','','',''],
          embalagens:         p.embalagens         || [],
          enderecos_estoque:  Array.isArray(p.enderecos_estoque) ? p.enderecos_estoque : [],
          curva_abc:          p.curva_abc          || null,
          tipo_fisico:        tipoFisicoFinal,
        };
      });
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

  // ── save ── (retorna true/false para uso em handleSaveAndClose)
  async function handleSave() {
    if (!selected) return false;
    if (!selected.sku?.trim())       { alert('SKU é obrigatório'); return false; }
    if (!selected.descricao?.trim()) { alert('Descrição é obrigatória'); return false; }
    setSaving(true);
    try {
      // Para novos produtos: gera UUID no frontend (garante id não-nulo mesmo sem default no banco)
      const newId = isNew ? crypto.randomUUID() : undefined;
      const payload = {
        ...(newId ? { id: newId } : {}),
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
        tipo_fisico:        (selected.atributos_tecnicos?.tipo_fisico) || selected.tipo_fisico || null,
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
      logActivity({
        userName: _logUser(),
        action: isNew ? 'CRIOU' : 'ATUALIZOU',
        entity: 'produto',
        entityId: payload.sku,
        entityName: payload.sku,
        description: `Produto "${payload.sku} — ${payload.descricao}" ${isNew ? 'cadastrado' : 'atualizado'}.`,
        details: { descricao: payload.descricao, tipo: payload.tipo, familia: payload.familia },
      });
      return true;
    } catch(e) {
      alert('Erro ao salvar: ' + (e.message||JSON.stringify(e)));
      return false;
    } finally { setSaving(false); }
  }

  // ── save and close ──
  async function handleSaveAndClose() {
    const ok = await handleSave();
    if (ok) { setSelectedId(null); setIsNew(false); setActiveTab(0); }
  }

  // ── duplicate ──
  function handleDuplicate() {
    if (!selected || isNew) return;
    const copy = {
      ...selected,
      id: '__new__',
      sku: selected.sku + '-COPIA',
      descricao: (selected.descricao || '') + ' (Cópia)',
      codigo_antigo: '',
      codigo_integracao: '',
      enderecos_estoque: [],
      curva_abc: null,
      estoque_erp: null,
    };
    setProdutos(prev => [copy, ...prev.filter(p => p.id !== '__new__')]);
    setIsNew(true); setSelectedId(null); setActiveTab(0);
  }

  // ── relatórios — exporta lista filtrada como XLSX ──
  function handleRelatorios() {
    const rows = filtered.map(p => ({
      SKU:                  p.sku || '',
      'Código Antigo':      p.codigo_antigo || '',
      Descrição:            p.descricao || '',
      'Part Number':        p.part_number || '',
      NCM:                  p.ncm || '',
      Tipo:                 p.tipo || '',
      Família:              p.familia || '',
      Marca:                p.marca || '',
      Unidade:              p.unidade || '',
      'Prefixo VP':         p.prefixo_vp || '',
      Natureza:             p.natureza || '',
      'Curva ABC':          p.curva_abc || '',
      'Estoque ERP':        p.estoque_erp ?? '',
      'Estoque Mín.':       p.estoque_minimo ?? '',
      'Preço Custo (R$)':   p.preco_custo ?? '',
      'Preço Venda (R$)':   p.preco_venda ?? '',
      EAN:                  p.ean || '',
      'Peso Líq. (kg)':     p.peso_liquido ?? '',
      'Peso Bruto (kg)':    p.peso_bruto ?? '',
      'Altura (cm)':        p.altura ?? '',
      'Largura (cm)':       p.largura ?? '',
      'Prof. (cm)':         p.profundidade ?? '',
      Compatibilidade:      (p.compatibilidade || []).join(', '),
      Ativo:                p.ativo ? 'Sim' : 'Não',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    XLSX.writeFile(wb, `catalogo_produtos_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // ── exportar ficha técnica como PDF (janela de impressão) ──
  function handleExportarFicha() {
    if (!selected || isNew) return;
    const compat = (selected.compatibilidade || [])
      .map(cc => { const m = MARCAS_COMPAT.find(x => x.abrev === cc); return m ? `${m.nome} (${cc})` : cc; })
      .join(' · ') || 'Multimarcas';
    const attrs = selected.atributos_tecnicos || {};
    const attrRows = Object.entries(attrs)
      .filter(([,v]) => v)
      .map(([k,v]) => `<tr><td class="lbl">${k.replace(/_/g,' ').toUpperCase()}</td><td class="val">${v}</td></tr>`)
      .join('');
    const dims = [
      selected.altura       ? `Altura: ${selected.altura}cm`       : '',
      selected.largura      ? `Largura: ${selected.largura}cm`      : '',
      selected.profundidade ? `Prof.: ${selected.profundidade}cm`   : '',
      selected.peso_liquido ? `Peso Líq.: ${selected.peso_liquido}kg` : '',
      selected.peso_bruto   ? `Peso Bruto: ${selected.peso_bruto}kg`  : '',
    ].filter(Boolean).join('  ·  ');
    const win = window.open('', '_blank', 'width=860,height=1100');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Ficha Técnica — ${selected.sku}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;font-size:12px;}
        .hdr{background:#1e293b;color:#fff;padding:18px 28px;display:flex;justify-content:space-between;align-items:flex-start;}
        .brand{font-size:10px;font-weight:900;letter-spacing:.2em;color:#fbbf24;margin-bottom:4px;text-transform:uppercase;}
        .sku{font-size:22px;font-weight:900;letter-spacing:.04em;}
        .desc{font-size:12px;color:#94a3b8;margin-top:3px;}
        .badge{font-size:11px;font-weight:900;color:#fbbf24;background:rgba(251,191,36,.15);padding:4px 10px;border:1px solid rgba(251,191,36,.3);border-radius:2px;display:inline-block;}
        .sec{padding:12px 28px;border-bottom:1px solid #e2e8f0;}
        .sec-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.15em;color:#64748b;margin-bottom:8px;}
        table{width:100%;border-collapse:collapse;}
        .lbl{font-weight:700;padding:4px 10px;background:#f8fafc;border:1px solid #e2e8f0;width:30%;font-size:10px;text-transform:uppercase;letter-spacing:.05em;}
        .val{padding:4px 10px;border:1px solid #e2e8f0;font-size:11px;}
        .id-row td{padding:3px 10px 3px 0;font-size:11px;width:auto;}
        .id-row strong{font-weight:700;}
        .desc-box{font-size:11px;line-height:1.75;color:#334155;white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:2px;}
        .ftr{padding:8px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;}
        .ftr span{font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;}
        @media print{@page{margin:10mm;size:A4;}}
      </style>
    </head><body>
      <div class="hdr">
        <div>
          <div class="brand">VerticalParts WMS — Ficha Técnica</div>
          <div class="sku">${selected.sku}</div>
          <div class="desc">${selected.descricao || ''}</div>
        </div>
        <div style="text-align:right">
          ${selected.curva_abc ? `<div class="badge">CURVA ${selected.curva_abc}</div>` : ''}
          ${selected.prefixo_vp ? `<div style="font-size:11px;color:#94a3b8;margin-top:6px">${selected.prefixo_vp}</div>` : ''}
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">Identificação</div>
        <table><tr class="id-row">
          ${selected.codigo_antigo ? `<td><strong>Cód. Antigo:</strong> ${selected.codigo_antigo}</td>` : ''}
          ${selected.part_number   ? `<td><strong>Part Number:</strong> ${selected.part_number}</td>`   : ''}
          ${selected.ncm           ? `<td><strong>NCM:</strong> ${selected.ncm}</td>`                   : ''}
          ${selected.ean           ? `<td><strong>EAN:</strong> ${selected.ean}</td>`                   : ''}
          ${selected.unidade       ? `<td><strong>Unid.:</strong> ${selected.unidade}</td>`             : ''}
          ${selected.marca         ? `<td><strong>Marca:</strong> ${selected.marca}</td>`               : ''}
        </tr></table>
      </div>
      ${attrRows ? `<div class="sec"><div class="sec-title">Atributos Técnicos</div><table>${attrRows}</table></div>` : ''}
      ${dims ? `<div class="sec"><div class="sec-title">Dimensões & Peso</div><p style="font-size:11px">${dims}</p></div>` : ''}
      <div class="sec">
        <div class="sec-title">Compatibilidade com Marcas</div>
        <p style="font-size:11px;line-height:1.6">${compat}</p>
      </div>
      ${selected.descricao_detalhada ? `<div class="sec"><div class="sec-title">Descrição Técnica Detalhada</div><div class="desc-box">${selected.descricao_detalhada}</div></div>` : ''}
      ${selected.observacao ? `<div class="sec"><div class="sec-title">Observações</div><p style="font-size:11px">${selected.observacao}</p></div>` : ''}
      <div class="ftr">
        <span>VerticalParts WMS · Ficha gerada em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</span>
        <span>${selected.sku}</span>
      </div>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>`);
    win.document.close();
  }

  // ── delete ──
  async function handleDelete() {
    if (!selected) return;
    if (!window.confirm(`Excluir "${selected.sku}"? Esta ação não pode ser desfeita.`)) return;
    if (isNew) { setProdutos(prev=>prev.filter(p=>p.id!=='__new__')); setIsNew(false); setSelectedId(null); return; }
    const skuDeleted = selected.sku;
    const descDeleted = selected.descricao;
    const { error } = await supabase.from('produtos').delete().eq('id', selected.id);
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    logActivity({
      userName: _logUser(),
      action: 'EXCLUIU',
      entity: 'produto',
      entityId: skuDeleted,
      entityName: skuDeleted,
      description: `Produto "${skuDeleted} — ${descDeleted}" excluído permanentemente.`,
      level: 'WARNING',
    });
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

  // ─── ACTION GROUPS — barra superior ─────────────────────────────────────────

  const productActionGroups = [
    [
      { label: 'Novo',      primary: true, icon: <Plus className="w-3.5 h-3.5"/>,
        onClick: handleNew },
      { label: 'Duplicar',  icon: <Copy className="w-3.5 h-3.5"/>,
        onClick: handleDuplicate,
        disabled: !selected || isNew,
        tooltip: selected && !isNew ? 'Duplicar produto selecionado' : 'Selecione um produto para duplicar' },
    ],
    [
      { label: 'Salvar',          icon: <Save className="w-3.5 h-3.5"/>,
        onClick: handleSave,
        disabled: saving || !selected,
        tooltip: 'Salvar produto atual (Ctrl+S)' },
      { label: 'Salvar e Fechar', icon: <CheckCircle2 className="w-3.5 h-3.5"/>,
        onClick: handleSaveAndClose,
        disabled: saving || !selected,
        tooltip: 'Salvar e voltar para a lista' },
    ],
    [
      { label: 'Relatórios',  icon: <FileSpreadsheet className="w-3.5 h-3.5"/>,
        onClick: handleRelatorios,
        tooltip: `Exportar ${filtered.length} produto(s) filtrado(s) como planilha XLSX` },
      { label: 'Exportar PDF', icon: <FileDown className="w-3.5 h-3.5"/>,
        onClick: handleExportarFicha,
        disabled: !selected || isNew,
        tooltip: 'Imprimir ficha técnica completa do produto selecionado' },
    ],
  ];

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <EnterprisePageBase
      title="7.5 Cadastro de Produtos"
      breadcrumbItems={[{ label:'CADASTRAR', path:'/cadastros' }]}
      actionGroups={productActionGroups}
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
                {activeTab===0 && <TabIdentificacao   prod={selected} onChange={fieldChange} onGoToIA={()=>setActiveTab(2)} />}
                {activeTab===1 && <TabCompatibilidade prod={selected} onChange={fieldChange} />}
                {activeTab===2 && <TabDescricaoIA     prod={selected} onChange={fieldChange} />}
                {activeTab===3 && <TabFotos           prod={selected} onChange={fieldChange} />}
                {activeTab===4 && <TabEmbalagens      prod={selected} onChange={fieldChange} />}
                {activeTab===5 && <TabEstoqueRegras   prod={selected} onChange={fieldChange} />}
                {activeTab===6 && <TabProdutos produtos={produtos} onSelect={(id) => { setSelectedId(id); setIsNew(false); setActiveTab(0); }} />}
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
