import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Upload,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  FileText,
  Play,
  Ban,
  RefreshCw,
  Calendar,
  BadgeCheck,
  Scissors,
  Info,
  Check,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── ENUMS ────────────────────────────────────────────────────────────
const STATUS_OPTS = ['Todos', 'Pendente', 'Executando', 'Cancelada', 'Finalizada'];
const ESTADO_PECA = ['Bom', 'Avariado', 'Desmembrado/Truncado'];
const TIPO_DEVOLUCAO = [
  'Insucesso de Entrega',
  'Garantia',
  'Devolução Comercial',
];
const SETORES_DESTINO = ['TRIAGEM-A','TRIAGEM-B','AVARIAS','DESMEM','QUARENTENA','GARANTIA'];

const STATUS_COLOR = {
  Pendente:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Executando: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  Cancelada:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
  Finalizada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const ESTADO_ICON = {
  'Bom':                 { icon: BadgeCheck, color: 'text-green-600' },
  'Avariado':            { icon: AlertTriangle, color: 'text-red-500' },
  'Desmembrado/Truncado':{ icon: Scissors, color: 'text-purple-500' },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────
const makeItens = (prefix) => [
  {
    id: `${prefix}-I1`,
    codigoProd: 'MOT-TP-0220',
    descricao:  'Motor de Tração 220V Monofásico',
    qtDevolvida: 2,
    estadoPeca:  'Bom',
    setorDestino: 'TRIAGEM-A',
  },
  {
    id: `${prefix}-I2`,
    codigoProd: 'FRE-MEG-D200',
    descricao:  'Freio Magnético Tipo D 200N',
    qtDevolvida: 1,
    estadoPeca:  'Avariado',
    setorDestino: 'AVARIAS',
  },
];

const DEVOLUCOES_INIT = [
  {
    id: 'DEV-001',
    idInsucesso: 'INS-2026-001',
    dataSolicitacao: '2026-02-20',
    ordemCliente: 'OC-45012',
    nfOriginal: 'NF-45123',
    tipoDevolucao: 'Insucesso de Entrega',
    depositante: 'VerticalParts SP',
    status: 'Pendente',
    itens: makeItens('DEV-001'),
    expanded: false,
    selecionado: false,
  },
  {
    id: 'DEV-002',
    idInsucesso: 'INS-2026-002',
    dataSolicitacao: '2026-02-21',
    ordemCliente: 'OC-45088',
    nfOriginal: 'NF-45124',
    tipoDevolucao: 'Garantia',
    depositante: 'Elevadores ABC Ltda',
    status: 'Executando',
    itens: [
      { id:'DEV-002-I1', codigoProd:'CAB-EC-10MM', descricao:'Cabo de Aço 10mm Elevador', qtDevolvida:3, estadoPeca:'Bom', setorDestino:'TRIAGEM-B' },
    ],
    expanded: false,
    selecionado: false,
  },
  {
    id: 'DEV-003',
    idInsucesso: 'INS-2026-003',
    dataSolicitacao: '2026-02-18',
    ordemCliente: 'OC-44990',
    nfOriginal: 'NF-45099',
    tipoDevolucao: 'Devolução Comercial',
    depositante: 'Kone Brasil',
    status: 'Finalizada',
    itens: [
      { id:'DEV-003-I1', codigoProd:'PAI-ELT-800', descricao:'Painel Elétrico 800W Completo', qtDevolvida:1, estadoPeca:'Desmembrado/Truncado', setorDestino:'DESMEM' },
    ],
    expanded: false,
    selecionado: false,
  },
  {
    id: 'DEV-004',
    idInsucesso: 'INS-2026-004',
    dataSolicitacao: '2026-02-22',
    ordemCliente: 'OC-45120',
    nfOriginal: 'NF-45201',
    tipoDevolucao: 'Insucesso de Entrega',
    depositante: 'Schindler Partes',
    status: 'Pendente',
    itens: makeItens('DEV-004'),
    expanded: false,
    selecionado: false,
  },
  {
    id: 'DEV-005',
    idInsucesso: 'INS-2026-005',
    dataSolicitacao: '2026-02-19',
    ordemCliente: 'OC-45033',
    nfOriginal: 'NF-45140',
    tipoDevolucao: 'Insucesso de Entrega',
    depositante: 'VerticalParts SP',
    status: 'Cancelada',
    itens: [],
    expanded: false,
    selecionado: false,
  },
];

// ─── TOAST ───────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  return (
    <div
      role="alert"
      className={cn(
        'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300 cursor-pointer',
        type === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400' :
        type === 'erro' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400' :
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
      )} onClick={onClose}>
      {type === 'ok' ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> :
       type === 'erro' ? <XCircle className="w-4 h-4" aria-hidden="true" /> :
       <AlertTriangle className="w-4 h-4" aria-hidden="true" />}
      {msg}
    </div>
  );
}

// ─── MODAL CONFIRMAÇÃO CANCELAR ───────────────────────────────────────
function ModalCancelar({ count, onClose, onConfirm }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cancelar-title"
        className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-red-300 dark:border-red-800/50 w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center" aria-hidden="true">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p id="modal-cancelar-title" className="text-sm font-black text-slate-800 dark:text-white">Cancelar Devolução</p>
              <p className="text-[10px] text-slate-400">{count} registro(s) selecionado(s)</p>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 rounded-2xl px-4 py-3 text-[10px] text-red-700 dark:text-red-400 font-medium">
            Esta ação cancelará as devoluções selecionadas. As peças permanecerão na doca até nova instrução do supervisor.
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Voltar</button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5">
              <Ban className="w-3.5 h-3.5" aria-hidden="true" />Confirmar Cancelamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL ROW ───────────────────────────────────────────────────────
function DetailGrid({ devId, itens, onChangeItem, isLocked }) {
  return (
    <tr>
      <td colSpan={9} className="p-0">
        <div className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-b-2 border-secondary/30 animate-in slide-in-from-top-1 duration-200">
          {/* Sub-header */}
          <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-200 dark:border-slate-700">
            <Package className="w-3.5 h-3.5 text-secondary" />
            <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{itens.length} item(ns) — Selecione o estado e confirme o setor de destino</p>
          </div>

          {itens.length === 0 ? (
            <p className="px-6 py-4 text-xs text-slate-400 italic">Nenhum item registrado nesta devolução.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {['Cód. Produto','Descrição','Qt. Devolvida','Estado da Peça','Setor Destino Temporário'].map(h => (
                    <th key={h} scope="col" className="px-4 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const EI = ESTADO_ICON[item.estadoPeca] || ESTADO_ICON['Bom'];
                  return (
                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all">
                      <td className="px-4 py-2.5">
                        <code className="text-[10px] font-black text-secondary">{item.codigoProd}</code>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{item.descricao}</td>
                      <td className="px-4 py-2.5 text-center font-black text-slate-700 dark:text-slate-300">{item.qtDevolvida}</td>

                      {/* Estado da Peça — dropdown */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <EI.icon className={cn('w-3.5 h-3.5 shrink-0', EI.color)} />
                          <select
                            value={item.estadoPeca}
                            disabled={isLocked}
                            onChange={e => onChangeItem(devId, item.id, 'estadoPeca', e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-lg px-2 py-1 text-[10px] font-bold outline-none transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {ESTADO_PECA.map(e => <option key={e}>{e}</option>)}
                          </select>
                        </div>
                      </td>

                      {/* Setor Destino */}
                      <td className="px-4 py-2.5">
                        <select
                          value={item.setorDestino}
                          disabled={isLocked}
                          onChange={e => onChangeItem(devId, item.id, 'setorDestino', e.target.value)}
                          className="appearance-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-lg px-2 py-1 text-[10px] font-bold outline-none transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {SETORES_DESTINO.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

function ModalNovaDevolucao({ onClose, onSalvar, totalExistente }) {
  const [form, setForm] = useState({
    ordemCliente: '',
    nfOriginal: '',
    depositante: '',
    tipoDevolucao: 'Insucesso de Entrega',
    responsavel: 'Danilo',
    dataSolicitacao: new Date().toISOString().slice(0,10),
  });
  const [erros, setErros] = useState({});
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErros(er=>({...er,[k]:undefined})); };
  const num = String(totalExistente + 1).padStart(4,'0');
  const idGerado = `INS-2026-${num}`;

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

  const salvar = () => {
    const novosErros = {};
    if (!form.ordemCliente.trim()) novosErros.ordemCliente = 'Obrigatório';
    if (!form.nfOriginal.trim())   novosErros.nfOriginal   = 'Obrigatório';
    if (!form.depositante.trim())  novosErros.depositante  = 'Obrigatório';
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }
    onSalvar({
      id: 'DEV-' + Date.now(),
      idInsucesso: idGerado,
      dataSolicitacao: form.dataSolicitacao,
      ordemCliente: form.ordemCliente.toUpperCase(),
      nfOriginal: form.nfOriginal.toUpperCase(),
      depositante: form.depositante,
      tipoDevolucao: form.tipoDevolucao,
      responsavel: form.responsavel,
      status: 'Pendente',
      itens: [],
      expanded: false,
      selecionado: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-nova-title"
        className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600"/>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center" aria-hidden="true">
              <RotateCcw className="w-5 h-5 text-amber-600"/>
            </div>
            <div>
              <p id="modal-nova-title" className="text-sm font-black">Nova Devolução</p>
              <p className="text-[10px] text-slate-400">ID gerado: <strong className="text-secondary">{idGerado}</strong></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'Ordem de Cliente', k:'ordemCliente', placeholder:'OC-00000'},
              {label:'NF Original',      k:'nfOriginal',   placeholder:'NF-00000'},
              {label:'Depositante',      k:'depositante',  placeholder:'Nome da empresa', full:true},
            ].map(({label,k,placeholder,full})=>(
              <div key={k} className={full?"col-span-2 space-y-1":"space-y-1"}>
                <label htmlFor={`nova-${k}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <input
                  id={`nova-${k}`}
                  ref={k === 'ordemCliente' ? firstInputRef : null}
                  value={form[k]}
                  onChange={e=>set(k,e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={!!erros[k]}
                  className={cn(
                    "w-full border-2 rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all dark:bg-slate-800",
                    erros[k] ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-secondary'
                  )}
                />
                {erros[k] && <p className="text-[9px] text-red-500 font-bold">{erros[k]}</p>}
              </div>
            ))}
            <div className="space-y-1">
              <label htmlFor="nova-tipoDevolucao" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
              <select
                id="nova-tipoDevolucao"
                value={form.tipoDevolucao}
                onChange={e=>set('tipoDevolucao',e.target.value)}
                className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800"
              >
                {TIPO_DEVOLUCAO.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="nova-responsavel" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</label>
              <select
                id="nova-responsavel"
                value={form.responsavel}
                onChange={e=>set('responsavel',e.target.value)}
                className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800"
              >
                {['Danilo','Matheus','Thiago'].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="nova-dataSolicitacao" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Solicitação</label>
              <input
                id="nova-dataSolicitacao"
                type="date"
                value={form.dataSolicitacao}
                onChange={e=>set('dataSolicitacao',e.target.value)}
                className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl px-3 py-2 text-xs font-bold outline-none dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500">Cancelar</button>
            <button onClick={salvar} className="flex-1 py-2.5 bg-secondary text-primary rounded-xl text-xs font-black hover:bg-secondary/90 active:scale-95 transition-all">
              Criar Devolução
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function ReturnDelivery() {
  const [devs,       setDevs]       = useState(DEVOLUCOES_INIT);
  const [filtro,     setFiltro]     = useState('Todos');
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null); // 'cancelar'
  const [toast,      setToast]      = useState(null);
  const [importing,  setImporting]  = useState(false);
  const fileRef = useRef(null);

  const toastTimeoutRef  = useRef(null);
  const execTimeoutRef   = useRef(null);
  const importTimeoutRef = useRef(null);

  // Cleanup global de todos os timeouts ao desmontar
  useEffect(() => () => {
    clearTimeout(toastTimeoutRef.current);
    clearTimeout(execTimeoutRef.current);
    clearTimeout(importTimeoutRef.current);
  }, []);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() =>
    devs.filter(d =>
      (filtro === 'Todos' || d.status === filtro) &&
      (d.idInsucesso.toLowerCase().includes(search.toLowerCase()) ||
       d.ordemCliente.toLowerCase().includes(search.toLowerCase()) ||
       d.nfOriginal.toLowerCase().includes(search.toLowerCase()) ||
       d.depositante.toLowerCase().includes(search.toLowerCase()))
    ), [devs, filtro, search]);

  const selecionados = useMemo(() => devs.filter(d => d.selecionado), [devs]);

  // ── Seleção ─────────────────────────────────────────────────────
  const toggleSel = (id) => setDevs(ds => ds.map(d => d.id === id ? { ...d, selecionado: !d.selecionado } : d));
  const toggleAll = () => {
    const ids = new Set(filtered.map(d => d.id));
    const allSel = filtered.every(d => d.selecionado);
    setDevs(ds => ds.map(d => ids.has(d.id) ? { ...d, selecionado: !allSel } : d));
  };

  // ── Expandir / Recolher ─────────────────────────────────────────
  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setDevs(ds => ds.map(d => d.id === id ? { ...d, expanded: !d.expanded } : d));
  };

  // ── Alterar item no detail ──────────────────────────────────────
  const changeItem = (devId, itemId, field, value) => {
    setDevs(ds => ds.map(d =>
      d.id !== devId ? d : {
        ...d,
        itens: d.itens.map(i => i.id === itemId ? { ...i, [field]: value } : i),
      }
    ));
  };

  // ── Importar CRN ────────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name; // captura antes do timeout (evita referência ao evento sintético)
    setImporting(true);
    clearTimeout(importTimeoutRef.current);
    importTimeoutRef.current = setTimeout(() => {
      // Usa setDevs funcional para ler o length atualizado e evitar colisão de IDs
      setDevs(ds => {
        const novo = {
          id: 'DEV-' + Date.now(),
          idInsucesso: 'INS-2026-' + String(ds.length + 1).padStart(4, '0'),
          dataSolicitacao: new Date().toISOString().slice(0, 10),
          ordemCliente: 'OC-' + Math.floor(46000 + Math.random() * 1000),
          nfOriginal: 'NF-' + Math.floor(46000 + Math.random() * 1000),
          depositante: 'Importado via CRN',
          status: 'Pendente',
          itens: [
            { id: 'IMP-I1-' + Date.now(), codigoProd: 'IMP-001', descricao: fileName.replace(/\.[^/.]+$/, '') + ' — Item importado', qtDevolvida: 1, estadoPeca: 'Bom', setorDestino: 'TRIAGEM-A' },
          ],
          expanded: true,
          selecionado: false,
        };
        return [novo, ...ds];
      });
      setImporting(false);
      showToast(`Arquivo "${fileName}" importado. 1 devolução criada.`);
    }, 1400);
    // Reset o input após disparar (fora do timeout para não depender do evento)
    e.target.value = '';
  };

  // ── Executar Devolução ──────────────────────────────────────────
  const handleExecutar = () => {
    const elegíveis = selecionados.filter(d => d.status === 'Pendente');
    if (elegíveis.length === 0) {
      showToast('Selecione registros com status "Pendente".', 'warn');
      return;
    }
    const ids = new Set(elegíveis.map(d => d.id));
    setDevs(ds => ds.map(d => {
      if (!ids.has(d.id)) return d;
      return { ...d, status: 'Executando', selecionado: false };
    }));
    showToast(`Execução iniciada para ${elegíveis.length} devolução(ões). Tarefas de remanejamento geradas!`);

    // Simula finalização após 3s — só altera se ainda estiver 'Executando'
    clearTimeout(execTimeoutRef.current);
    execTimeoutRef.current = setTimeout(() => {
      setDevs(ds => ds.map(d =>
        ids.has(d.id) && d.status === 'Executando'
          ? { ...d, status: 'Finalizada' }
          : d
      ));
      showToast(`${elegíveis.length} devolução(ões) finalizada(s) e mercadoria recolhida ao estoque!`);
    }, 3000);
  };

  // ── Cancelar Devolução ──────────────────────────────────────────
  const handleCancelar = () => {
    const elegíveis = selecionados.filter(d => ['Pendente', 'Executando'].includes(d.status));
    if (elegíveis.length === 0) {
      showToast('Selecione registros Pendentes ou Executando.', 'warn');
      return;
    }
    setModal('cancelar');
  };

  const confirmCancelar = () => {
    // Opera apenas nos elegíveis (Pendente/Executando) para não sobrescrever outros status
    const elegiveis = selecionados.filter(d => ['Pendente', 'Executando'].includes(d.status));
    const ids = new Set(elegiveis.map(d => d.id));
    setDevs(ds => ds.map(d => ids.has(d.id) ? { ...d, status: 'Cancelada', selecionado: false } : d));
    setModal(null);
    showToast(`${elegiveis.length} devolução(ões) cancelada(s).`, 'warn');
  };

  // ── KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => [
    { label:'Pendentes',   val: devs.filter(d=>d.status==='Pendente').length,   color:'text-amber-500' },
    { label:'Executando',  val: devs.filter(d=>d.status==='Executando').length,  color:'text-blue-500'  },
    { label:'Finalizadas', val: devs.filter(d=>d.status==='Finalizada').length,  color:'text-green-600' },
    { label:'Canceladas',  val: devs.filter(d=>d.status==='Cancelada').length,   color:'text-red-600'   },
  ], [devs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* ═══ MODAIS ═══ */}
      {modal === 'cancelar' && (
        <ModalCancelar count={selecionados.length} onClose={() => setModal(null)} onConfirm={confirmCancelar} />
      )}

      {modal === 'nova' && (
        <ModalNovaDevolucao
          onClose={() => setModal(null)}
          onSalvar={(nova) => {
            setDevs(ds => [nova, ...ds]);
            setModal(null);
            showToast('Nova devolução criada com sucesso!');
          }}
          totalExistente={devs.length}
        />
      )}

      {/* ═══ TOAST ═══ */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ═══ INPUT FILE oculto ═══ */}
      <input ref={fileRef} type="file" accept=".crn,.txt,.csv,.xml" className="hidden" onChange={handleImport} />

      {/* ═══ HEADER ═══ */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shrink-0">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 3 — Entrada e Recebimento</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">2.2 Processar Devoluções — Devolução ou Insucesso de Entrega</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Triagem de peças devolvidas · Remanejamento para estoque definitivo · 
              <span className="text-amber-500 font-black"> Garantia: </span>
              peças com defeito de fabricação ou falha dentro do prazo de garantia do fornecedor — encaminhadas para setor GARANTIA aguardando laudo técnico e reposição
            </p>
          </div>

          {/* KPIs */}
          <div className="ml-auto flex gap-3 flex-wrap">
            {kpis.map(k => (
              <div key={k.label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-2.5 min-w-[72px]">
                <p className={cn('text-xl font-black', k.color)}>{k.val}</p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap gap-3 items-center shrink-0">

        {/* Busca */}
        <div className="relative">
          <label htmlFor="rd-search" className="sr-only">Buscar devolução</label>
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="rd-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ID, OC, NF ou Depositante..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all w-56"
          />
        </div>

        {/* Filtro Status */}
        <div className="flex gap-1">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFiltro(s)}
              className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all whitespace-nowrap',
                filtro === s
                  ? s === 'Todos'
                    ? 'border-slate-700 bg-slate-800 text-white'
                    : STATUS_COLOR[s] + ' border-current'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
              )}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setModal('nova')}
          title="Cria manualmente uma nova solicitação de devolução ou insucesso de entrega"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] text-[#FFD700] border-2 border-[#FFD700]/30 rounded-xl text-xs font-black hover:bg-[#FFD700] hover:text-black active:scale-95 transition-all">
          <Plus className="w-3.5 h-3.5"/>Nova Devolução
        </button>

        {/* Importar CRN */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          title="Importa arquivo de retorno do transportador (.crn, .csv, .xml, .txt) e cria uma devolução automaticamente"
          className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-secondary hover:text-secondary rounded-xl text-xs font-black transition-all disabled:opacity-40">
          {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {importing ? 'Importando...' : 'Importar Arquivo de Devolução (CRN)'}
        </button>

        {/* Executar */}
        <button
          onClick={handleExecutar}
          disabled={selecionados.filter(d=>d.status==='Pendente').length === 0}
          title="Inicia o remanejamento das peças para os setores de triagem. Apenas devoluções Pendentes são processadas"
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
          <Play className="w-3.5 h-3.5" />Executar Devolução
        </button>

        {/* Cancelar */}
        <button
          onClick={handleCancelar}
          disabled={selecionados.filter(d=>['Pendente','Executando'].includes(d.status)).length === 0}
          title="Cancela as devoluções selecionadas (Pendentes ou Executando). As peças permanecem na doca até nova instrução do supervisor"
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
          <Ban className="w-3.5 h-3.5" />Cancelar Devolução
        </button>
      </div>

      {/* ═══ GRID MASTER ═══ */}
      <div className="flex-1 overflow-auto p-4">
        {/* Seleção info */}
        {selecionados.length > 0 && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-secondary/10 border-2 border-secondary/30 rounded-xl text-xs font-black text-secondary animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />{selecionados.length} devolução(ões) selecionada(s)
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {/* Checkbox all */}
                <th scope="col" className="p-3 w-10">
                  <button
                    role="checkbox"
                    aria-checked={filtered.length > 0 && filtered.every(d => d.selecionado)}
                    aria-label="Selecionar todas as devoluções visíveis"
                    onClick={toggleAll}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll(); } }}
                    className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all focus:ring-2 focus:ring-secondary focus:outline-none',
                      filtered.length > 0 && filtered.every(d => d.selecionado)
                        ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600 hover:border-secondary'
                    )}>
                    {filtered.length > 0 && filtered.every(d => d.selecionado) && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                  </button>
                </th>
                {/* Expand */}
                <th scope="col" className="p-3 w-8" />
                {['ID Insucesso','Data Solicitação','Ordem de Cliente','NF Original','Tipo','Depositante','Status'].map(h => (
                  <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const isLocked = d.status === 'Finalizada' || d.status === 'Cancelada';
                return (
                  <React.Fragment key={d.id}>
                    <tr
                      onClick={() => toggleSel(d.id)}
                      className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all',
                        d.selecionado ? 'bg-secondary/8 dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      )}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <button
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={d.selecionado}
                          aria-label={`Selecionar devolução ${d.idInsucesso}`}
                          onClick={(e) => { e.stopPropagation(); toggleSel(d.id); }}
                          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); toggleSel(d.id); } }}
                          className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all focus:ring-2 focus:ring-secondary focus:outline-none',
                            d.selecionado ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600 hover:border-secondary'
                          )}
                        >
                          {d.selecionado && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                        </button>
                      </td>

                      {/* Expand button */}
                      <td className="p-3" onClick={e => toggleExpand(d.id, e)}>
                        <button
                          aria-label={d.expanded ? `Recolher itens de ${d.idInsucesso}` : `Expandir itens de ${d.idInsucesso}`}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-all"
                        >
                          {d.expanded
                            ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                            : <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
                        </button>
                      </td>

                      <td className="p-3"><code className="text-xs font-black text-secondary">{d.idInsucesso}</code></td>
                      <td className="p-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          {d.dataSolicitacao.split('-').reverse().join('/')}
                        </div>
                      </td>
                      <td className="p-3"><code className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{d.ordemCliente}</code></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.nfOriginal}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{d.tipoDevolucao}</span>
                      </td>
                      <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{d.depositante}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', STATUS_COLOR[d.status])}>{d.status}</span>
                          {d.status === 'Executando' && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                          <span className="text-[9px] text-slate-400 font-medium ml-1">{d.itens.length} iten(s)</span>
                        </div>
                      </td>
                    </tr>

                    {/* DETAIL EXPANDIDO */}
                    {d.expanded && (
                      <DetailGrid
                        devId={d.id}
                        itens={d.itens}
                        onChangeItem={changeItem}
                        isLocked={isLocked}
                      />
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center">
                    <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-bold">Nenhuma devolução encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status:</p>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <span key={s} className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', c)}>{s}</span>
          ))}
          <div className="ml-auto flex items-center gap-3 text-[9px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" />Clique na seta para ver itens</span>
            <span>{filtered.length} registro(s)</span>
          </div>
        </div>

        {/* Info box triagem */}
        <div className="mt-3 flex items-start gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/10 border-2 border-amber-200 dark:border-amber-800/30 rounded-2xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
            <strong>Fluxo de Devolução:</strong> Ao clicar em <strong>"Executar Devolução"</strong>, o sistema gera automaticamente tarefas de remanejamento para os operadores retirarem as peças da doca de devolução e alocá-las nos setores de triagem definidos. Peças com estado <strong>Avariado</strong> ou <strong>Desmembrado</strong> são encaminhadas para setores específicos (AVARIAS / DESMEM) antes do retorno ao estoque definitivo.
          </p>
        </div>
      </div>
    </div>
  );
}
