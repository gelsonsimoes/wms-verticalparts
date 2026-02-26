import React, { useState, useMemo, useRef } from 'react';
import {
  Package,
  MapPin,
  Plus,
  Save,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Filter,
  Calendar,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Warehouse,
  ArrowRightLeft,
  LayoutGrid,
  Lock,
  Hash,
  User,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── ENUMS ────────────────────────────────────────────────────────────
const STATUS_OPTS = ['Todos', 'Pendente', 'Posicionado', 'Finalizado', 'Cancelado'];
const TIPO_LOCAL  = ['Pulmão', 'Picking'];
const TIPO_RECEB  = ['Compra', 'Transferência', 'Devolução', 'Cross-Docking'];
const DEPOSITANTES = ['VerticalParts SP', 'Elevadores ABC Ltda', 'Schindler Partes', 'Kone Brasil'];
const PRODUTOS_LIST = [
  'Motor de Tração 220V', 'Cabo de Aço 10mm', 'Painel Elétrico 800W',
  'Freio Magnético D-200', 'Guia de Corrediça 40mm', 'Porta de Cabine Inox',
  'Contrapeso 500kg', 'Botoeira LED Touch', 'Sensor de Nível',
];

const STATUS_COLOR = {
  Pendente:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Posicionado: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  Finalizado:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelado:   'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
};

// ─── GERADOR DE ENDEREÇO MOCK ─────────────────────────────────────────
const RUAS = ['A','B','C','D','E'];
function gerarEndereco(tipoLocal) {
  const rua   = RUAS[Math.floor(Math.random() * RUAS.length)];
  const col   = String(Math.floor(Math.random() * 10) + 1).padStart(2, '0');
  const nivel = Math.floor(Math.random() * 5) + 1;
  const tipo  = tipoLocal || TIPO_LOCAL[Math.floor(Math.random() * 2)];
  return { endereco: `${rua}-${col}-N${nivel}`, tipoLocal: tipo };
}

function gerarLote(ordemId) {
  const ts = Date.now().toString().slice(-6);
  return `LOT-${ordemId}-${ts}`;
}

// ─── DADOS MOCK ───────────────────────────────────────────────────────
let _idCounter = 100;
function makeRow(override = {}) {
  _idCounter++;
  const produto = PRODUTOS_LIST[Math.floor(Math.random() * PRODUTOS_LIST.length)];
  const depositante = DEPOSITANTES[Math.floor(Math.random() * DEPOSITANTES.length)];
  const tipoReceb = TIPO_RECEB[Math.floor(Math.random() * TIPO_RECEB.length)];
  const ordemId = `ORD-${_idCounter}`;
  return {
    id: String(_idCounter), ordemId,
    depositante, tipoRecebimento: tipoReceb, produto,
    lote: null, enderecoSugerido: null, tipoLocal: null,
    status: 'Pendente', selecionado: false,
    ...override,
  };
}

const ROWS_INIT = [
  makeRow({ id:'r1', ordemId:'ORD-001', depositante:'VerticalParts SP', tipoRecebimento:'Compra', produto:'Motor de Tração 220V', lote:'LOT-001-221001', enderecoSugerido:'B-03-N2', tipoLocal:'Pulmão', status:'Posicionado' }),
  makeRow({ id:'r2', ordemId:'ORD-002', depositante:'Elevadores ABC Ltda', tipoRecebimento:'Devolução', produto:'Freio Magnético D-200', lote:'LOT-002-221002', enderecoSugerido:'C-07-N1', tipoLocal:'Picking', status:'Finalizado' }),
  makeRow({ id:'r3', ordemId:'ORD-003', depositante:'Kone Brasil', tipoRecebimento:'Transferência', produto:'Cabo de Aço 10mm', lote:null, enderecoSugerido:null, tipoLocal:null, status:'Pendente' }),
  makeRow({ id:'r4', ordemId:'ORD-004', depositante:'Schindler Partes', tipoRecebimento:'Compra', produto:'Painel Elétrico 800W', lote:null, enderecoSugerido:null, tipoLocal:null, status:'Pendente' }),
  makeRow({ id:'r5', ordemId:'ORD-005', depositante:'VerticalParts SP', tipoRecebimento:'Cross-Docking', produto:'Porta de Cabine Inox', lote:null, enderecoSugerido:null, tipoLocal:null, status:'Pendente' }),
  makeRow({ id:'r6', ordemId:'ORD-006', depositante:'Kone Brasil', tipoRecebimento:'Compra', produto:'Guia de Corrediça 40mm', lote:'LOT-006-221006', enderecoSugerido:'A-01-N3', tipoLocal:'Pulmão', status:'Cancelado' }),
];

// ─── MODAL ALTERAR ENDEREÇO ───────────────────────────────────────────
function ModalAlterarEndereco({ rows, onClose, onSave }) {
  const [rua,    setRua]    = useState('A');
  const [col,    setCol]    = useState('01');
  const [nivel,  setNivel]  = useState('1');
  const [tipo,   setTipo]   = useState('Pulmão');

  const endPreview = `${rua}-${col}-N${nivel}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-white">Alterar Endereço de Alocação</p>
            <p className="text-[10px] text-slate-400">{rows.length} registro(s) selecionado(s)</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        {/* Registros afetados */}
        <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/20">
          <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5">Ordens afetadas</p>
          <div className="flex flex-wrap gap-1.5">
            {rows.map(r => (
              <span key={r.id} className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg font-black">{r.ordemId}</span>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rua</label>
              <select value={rua} onChange={e => setRua(e.target.value)} className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-black text-center outline-none transition-all">
                {['A','B','C','D','E'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coluna</label>
              <select value={col} onChange={e => setCol(e.target.value)} className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-black text-center outline-none transition-all">
                {Array.from({length:10},(_,i) => String(i+1).padStart(2,'0')).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível</label>
              <select value={nivel} onChange={e => setNivel(e.target.value)} className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-black text-center outline-none transition-all">
                {['1','2','3','4','5'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Local</label>
            <div className="flex gap-2">
              {TIPO_LOCAL.map(t => (
                <button key={t} onClick={() => setTipo(t)}
                  className={cn('flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all',
                    tipo === t ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Warehouse className="w-4 h-4 text-secondary" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Endereço</p>
              <p className="text-lg font-black text-secondary font-mono">{endPreview}</p>
            </div>
            <span className={cn('ml-auto text-[10px] font-black px-3 py-1 rounded-full',
              tipo === 'Pulmão' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>{tipo}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
          <button onClick={() => onSave(endPreview, tipo)}
            className="px-5 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 active:scale-95 transition-all shadow-md flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />Aplicar Endereço
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL AUTORIZAÇÃO SUPERVISOR ─────────────────────────────────────
const SUPERVISOR_CREDS = [
  { usuario: 'supervisor.jose',   senha: '1234' },
  { usuario: 'danilo.supervisor', senha: '9999' },
];

function ModalAutorizacaoSupervisor({ count, onClose, onAutorizado }) {
  const [usuario, setUsuario] = useState('');
  const [senha,   setSenha]   = useState('');
  const [erro,    setErro]    = useState('');
  const [shake,   setShake]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmar = () => {
    setLoading(true);
    setTimeout(() => {
      const ok = SUPERVISOR_CREDS.some(c => c.usuario === usuario.trim() && c.senha === senha.trim());
      if (ok) {
        onAutorizado();
      } else {
        setErro('Credenciais inválidas. Acesso negado.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-green-500/40 w-full max-w-sm shadow-2xl overflow-hidden transition-transform',
        shake ? 'animate-bounce' : ''
      )}>
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-600 via-green-400 to-green-600" />

        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">Autorização de Supervisor</p>
              <p className="text-[10px] text-slate-400">Necessário para confirmar {count} alocação(ões)</p>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800/40 rounded-2xl px-4 py-3 text-[10px] text-green-700 dark:text-green-400 font-medium">
            Esta operação confirma a guarda física da mercadoria no endereço sugerido. A ação <strong>não pode ser desfeita</strong>.
          </div>

          {/* Campos */}
          <div className="space-y-3">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={usuario} onChange={e => { setUsuario(e.target.value); setErro(''); }} placeholder="Usuário supervisor"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 rounded-xl text-sm outline-none transition-all" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={senha} onChange={e => { setSenha(e.target.value); setErro(''); }} placeholder="Senha" onKeyDown={e => e.key === 'Enter' && handleConfirmar()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 rounded-xl text-sm outline-none transition-all" />
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/30">
              <XCircle className="w-4 h-4 shrink-0" />{erro}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
            <button onClick={handleConfirmar} disabled={!usuario || !senha || loading}
              className={cn('flex-1 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5',
                loading ? 'bg-green-400 text-white cursor-wait' : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white disabled:opacity-40'
              )}>
              {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Verificando...</> : <><ShieldCheck className="w-3.5 h-3.5" />Autorizar</>}
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400">Dica: supervisor.jose / 1234</p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function AllocationMap() {
  const [rows, setRows]               = useState(ROWS_INIT);
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [search, setSearch]           = useState('');
  const [gerando, setGerando]         = useState(false);
  const [modal, setModal]             = useState(null); // 'alterar' | 'confirmar'
  const [toastMsg, setToastMsg]       = useState(null);

  const toast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filtrados = useMemo(() =>
    rows.filter(r =>
      (statusFiltro === 'Todos' || r.status === statusFiltro) &&
      (r.ordemId.toLowerCase().includes(search.toLowerCase()) ||
       r.produto.toLowerCase().includes(search.toLowerCase()) ||
       r.depositante.toLowerCase().includes(search.toLowerCase()))
    ), [rows, statusFiltro, search]);

  const selecionados = filtrados.filter(r => r.selecionado);
  const pendentes    = filtrados.filter(r => r.status === 'Pendente');
  const comEndereco  = filtrados.filter(r => r.status === 'Posicionado');

  const toggleSel  = (id) => setRows(rs => rs.map(r => r.id === id ? { ...r, selecionado: !r.selecionado } : r));
  const toggleAll  = () => {
    const allSel = filtrados.every(r => r.selecionado);
    const ids = new Set(filtrados.map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, selecionado: !allSel } : r));
  };

  // ── Gerar Alocação ──────────────────────────────────────────────
  const handleGenerate = () => {
    const targets = pendentes.filter(r => r.status === 'Pendente');
    if (targets.length === 0) { toast('Nenhum registro Pendente para alocar.', 'warn'); return; }
    setGerando(true);
    setTimeout(() => {
      setRows(rs => rs.map(r => {
        if (r.status !== 'Pendente') return r;
        const { endereco, tipoLocal } = gerarEndereco();
        return { ...r, lote: gerarLote(r.ordemId), enderecoSugerido: endereco, tipoLocal, status: 'Posicionado' };
      }));
      setGerando(false);
      toast(`${targets.length} alocação(ões) gerada(s) com sucesso!`);
    }, 1800);
  };

  // ── Alterar Endereço ────────────────────────────────────────────
  const handleAlterar = () => {
    if (selecionados.length === 0) { toast('Selecione ao menos um registro.', 'warn'); return; }
    setModal('alterar');
  };

  const handleSaveEndereco = (endereco, tipoLocal) => {
    const ids = new Set(selecionados.map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, enderecoSugerido: endereco, tipoLocal, status: 'Posicionado' } : r));
    setModal(null);
    toast(`Endereço ${endereco} aplicado em ${selecionados.length} registro(s).`);
  };

  // ── Confirmar Alocação ──────────────────────────────────────────
  const handleConfirmar = () => {
    const elegíveis = selecionados.filter(r => r.status === 'Posicionado');
    if (elegíveis.length === 0) { toast('Selecione registros com status "Posicionado".', 'warn'); return; }
    setModal('confirmar');
  };

  const handleAutorizado = () => {
    const ids = new Set(selecionados.filter(r => r.status === 'Posicionado').map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, status: 'Finalizado', selecionado: false } : r));
    setModal(null);
    toast(`${ids.size} alocação(ões) CONFIRMADA(S)! Guarda registrada.`);
  };

  // ── Excluir Lotes ───────────────────────────────────────────────
  const handleExcluir = () => {
    if (selecionados.length === 0) { toast('Selecione ao menos um registro.', 'warn'); return; }
    setRows(rs => rs.map(r => selecionados.some(s => s.id === r.id)
      ? { ...r, lote: null, enderecoSugerido: null, tipoLocal: null, status: 'Cancelado', selecionado: false }
      : r
    ));
    toast(`${selecionados.length} lote(s) excluído(s).`, 'warn');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* ═══ MODAIS ═══ */}
      {modal === 'alterar' && (
        <ModalAlterarEndereco rows={selecionados} onClose={() => setModal(null)} onSave={handleSaveEndereco} />
      )}
      {modal === 'confirmar' && (
        <ModalAutorizacaoSupervisor
          count={selecionados.filter(r => r.status === 'Posicionado').length}
          onClose={() => setModal(null)}
          onAutorizado={handleAutorizado}
        />
      )}

      {/* ═══ TOAST ═══ */}
      {toastMsg && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300',
          toastMsg.type === 'warn'
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400'
            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
        )}>
          {toastMsg.type === 'warn' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toastMsg.msg}
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg shrink-0">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 3 — Entrada e Recebimento</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerador de Mapa de Alocação e Lotes</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Inteligência de armazenamento · Endereçamento automático Pulmão / Picking</p>
          </div>
          {/* KPIs rápidos */}
          <div className="ml-auto flex gap-3">
            {[
              { label:'Pendentes', val: rows.filter(r=>r.status==='Pendente').length, color:'text-amber-500' },
              { label:'Posicionados', val: rows.filter(r=>r.status==='Posicionado').length, color:'text-blue-500' },
              { label:'Finalizados', val: rows.filter(r=>r.status==='Finalizado').length, color:'text-green-600' },
            ].map(k => (
              <div key={k.label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-2.5 min-w-[72px]">
                <p className={cn('text-xl font-black', k.color)}>{k.val}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BARRA DE FILTROS ═══ */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap gap-3 items-center shrink-0">
        {/* Busca */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ordem, Produto ou Depositante..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all w-56" />
        </div>

        {/* Status */}
        <div className="flex gap-1">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatusFiltro(s)}
              className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all',
                statusFiltro === s
                  ? s === 'Todos' ? 'border-slate-700 bg-slate-800 text-white' : `${STATUS_COLOR[s]?.split(' ')[0]} border-current text-current border-opacity-50`
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
              )}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* ═══ TOOLBAR DE AÇÕES ═══ */}
        <div className="flex items-center gap-2">
          {/* Gerar Alocação */}
          <button onClick={handleGenerate} disabled={gerando || pendentes.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
            {gerando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            {gerando ? 'Gerando...' : 'Gerar Alocação'}
          </button>

          {/* Alterar Endereço */}
          <button onClick={handleAlterar} disabled={selecionados.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 active:scale-95 transition-all shadow-md disabled:opacity-40">
            <ArrowRightLeft className="w-3.5 h-3.5" />Alterar Endereço
          </button>

          {/* Confirmar */}
          <button onClick={handleConfirmar} disabled={selecionados.filter(r => r.status === 'Posicionado').length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
            <ShieldCheck className="w-3.5 h-3.5" />Confirmar Alocação
          </button>

          {/* Excluir */}
          <button onClick={handleExcluir} disabled={selecionados.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" />Excluir Lotes
          </button>
        </div>
      </div>

      {/* ═══ GRID ═══ */}
      <div className="flex-1 overflow-auto p-4">
        {/* Seleção info */}
        {selecionados.length > 0 && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-secondary/10 border-2 border-secondary/30 rounded-xl text-xs font-black text-secondary animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />{selecionados.length} registro(s) selecionado(s)
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                <th className="p-3 w-10">
                  <button onClick={toggleAll}
                    className={cn('w-4.5 h-4.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                      filtrados.length > 0 && filtrados.every(r => r.selecionado)
                        ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600'
                    )}>
                    {filtrados.length > 0 && filtrados.every(r => r.selecionado) && <Check className="w-3 h-3 text-primary" />}
                  </button>
                </th>
                {['Ordem','Depositante','Tipo Receb.','Produto','Lote Gerado','Local Sugerido','Tipo Local','Status'].map(h => (
                  <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(row => (
                <tr key={row.id} onClick={() => toggleSel(row.id)}
                  className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all',
                    row.selecionado ? 'bg-secondary/8 dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  )}>
                  {/* Checkbox */}
                  <td className="p-3">
                    <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                      row.selecionado ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600'
                    )}>
                      {row.selecionado && <Check className="w-3 h-3 text-primary" />}
                    </div>
                  </td>
                  <td className="p-3"><code className="text-xs font-black text-secondary">{row.ordemId}</code></td>
                  <td className="p-3 text-[10px] text-slate-500 font-bold">{row.depositante}</td>
                  <td className="p-3">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg font-bold">{row.tipoRecebimento}</span>
                  </td>
                  <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{row.produto}</td>
                  <td className="p-3">
                    {row.lote
                      ? <code className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{row.lote}</code>
                      : <span className="text-[9px] text-slate-300 italic">—</span>}
                  </td>
                  <td className="p-3">
                    {row.enderecoSugerido
                      ? <div className="flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <code className="text-sm font-black text-secondary">{row.enderecoSugerido}</code>
                        </div>
                      : <span className="text-[9px] text-slate-300 italic">Aguardando...</span>}
                  </td>
                  <td className="p-3">
                    {row.tipoLocal
                      ? <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full',
                          row.tipoLocal === 'Pulmão' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        )}>{row.tipoLocal}</span>
                      : <span className="text-[9px] text-slate-300 italic">—</span>}
                  </td>
                  <td className="p-3">
                    <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', STATUS_COLOR[row.status])}>{row.status}</span>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={9} className="p-10 text-center text-slate-400 text-xs">Nenhum registro para este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda:</p>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <span key={s} className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', c)}>{s}</span>
          ))}
          <p className="text-[9px] text-slate-400 ml-auto font-medium">{filtrados.length} registro(s) exibido(s)</p>
        </div>
      </div>
    </div>
  );
}
