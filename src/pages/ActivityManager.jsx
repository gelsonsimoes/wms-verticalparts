import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Users,
  Pause,
  Play,
  ClipboardList,
  X,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  BarChart2,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Hash,
  RefreshCw,
  UserCheck,
  UserX,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_CFG = {
  'Pendente':     { color: 'text-slate-600  bg-slate-100  dark:bg-slate-800  dark:text-slate-300',    dot: 'bg-slate-400',                bar: 'bg-slate-300' },
  'Em Execução':  { color: 'text-blue-700   bg-blue-100   dark:bg-blue-900/30  dark:text-blue-400',   dot: 'bg-blue-500 animate-pulse',    bar: 'bg-blue-500' },
  'Pausada':      { color: 'text-amber-700  bg-amber-100  dark:bg-amber-900/30 dark:text-amber-400',  dot: 'bg-amber-400',                 bar: 'bg-amber-400' },
  'Finalizada':   { color: 'text-green-700  bg-green-100  dark:bg-green-900/30 dark:text-green-400',  dot: 'bg-green-500',                 bar: 'bg-green-500' },
};

/** Lista canônica de status — única fonte de verdade para KPIs e filtros. */
const STATUS_LIST = ['Pendente', 'Em Execução', 'Pausada', 'Finalizada'];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {status}
    </span>
  );
}

// ─── MOCK DATA ─────────────────────────────────────────────────────
const INITIAL_ATIVIDADES = [
  { id: 'AT-2241', tipo: 'Separação',       regiao: 'Setor A — Zona Picking', status: 'Em Execução', operadores: ['joao.silva', 'carla.matos'],       progresso: 68, inicio: '22/02 08:10', prevTermino: '22/02 10:30' },
  { id: 'AT-2242', tipo: 'Remanejamento',   regiao: 'Setor B — Pulmão N4',    status: 'Pendente',    operadores: [],                                    progresso: 0,  inicio: null,          prevTermino: null },
  { id: 'AT-2243', tipo: 'Inventário',      regiao: 'Setor C — Área Total',   status: 'Em Execução', operadores: ['pedro.ferreira'],                    progresso: 34, inicio: '22/02 07:00', prevTermino: '22/02 12:00' },
  { id: 'AT-2244', tipo: 'Recebimento',     regiao: 'Doca 3 — Entrada',       status: 'Pausada',     operadores: ['ana.lucia', 'marcos.paulo'],          progresso: 51, inicio: '22/02 09:00', prevTermino: '22/02 11:00' },
  { id: 'AT-2245', tipo: 'Packing',         regiao: 'Estação de Embalagem 2', status: 'Finalizada',  operadores: ['fernanda.reis'],                     progresso: 100,inicio: '22/02 06:30', prevTermino: '22/02 09:00' },
  { id: 'AT-2246', tipo: 'Cross-docking',   regiao: 'Doca 1 — Transferência', status: 'Pendente',    operadores: [],                                    progresso: 0,  inicio: null,          prevTermino: null },
];

const TODOS_OPERADORES = [
  { id: 'joao.silva',     nome: 'João Silva',      foto: 'JS', atividadeAtual: 'AT-2241' },
  { id: 'carla.matos',    nome: 'Carla Matos',     foto: 'CM', atividadeAtual: 'AT-2241' },
  { id: 'pedro.ferreira', nome: 'Pedro Ferreira',  foto: 'PF', atividadeAtual: 'AT-2243' },
  { id: 'ana.lucia',      nome: 'Ana Lúcia',       foto: 'AL', atividadeAtual: 'AT-2244' },
  { id: 'marcos.paulo',   nome: 'Marcos Paulo',    foto: 'MP', atividadeAtual: 'AT-2244' },
  { id: 'fernanda.reis',  nome: 'Fernanda Reis',   foto: 'FR', atividadeAtual: null },
  { id: 'roberto.lins',   nome: 'Roberto Lins',    foto: 'RL', atividadeAtual: null },
  { id: 'silvia.cunha',   nome: 'Sílvia Cunha',    foto: 'SC', atividadeAtual: null },
];

const HISTORICO = {
  'AT-2241': [
    { operador: 'João Silva',     acao: 'Iniciou', hora: '22/02/2026 08:10', obs: 'Item pego do pool de atividades' },
    { operador: 'Carla Matos',   acao: 'Vinculada', hora: '22/02/2026 08:25', obs: 'Alocada pelo supervisor danilo.supervisor' },
    { operador: 'Sistema',       acao: 'Progresso 50%', hora: '22/02/2026 09:15', obs: '42 de 62 ondas concluídas' },
  ],
  'AT-2243': [
    { operador: 'Pedro Ferreira', acao: 'Iniciou', hora: '22/02/2026 07:00', obs: 'Item pego do pool de atividades' },
    { operador: 'Sistema',        acao: 'Progresso 34%', hora: '22/02/2026 08:40', obs: 'Seções A1–A5 inventariadas' },
  ],
  'AT-2244': [
    { operador: 'Ana Lúcia',     acao: 'Iniciou', hora: '22/02/2026 09:00', obs: 'Início do recebimento NF 000.541' },
    { operador: 'Marcos Paulo',  acao: 'Vinculado', hora: '22/02/2026 09:10', obs: 'Reforço alocado pelo supervisor' },
    { operador: 'Sistema',       acao: 'Pausada', hora: '22/02/2026 10:00', obs: 'Aguardando empilhadeira Doca 3' },
  ],
  'AT-2245': [
    { operador: 'Fernanda Reis', acao: 'Iniciou', hora: '22/02/2026 06:30', obs: '' },
    { operador: 'Fernanda Reis', acao: 'Finalizou', hora: '22/02/2026 08:58', obs: '28 pedidos embalados. Tempo: 2h28m.' },
  ],
};

// ─── AVATAR ────────────────────────────────────────────────────────
const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500'];
function Avatar({ initials, size = 'sm', idx = 0 }) {
  const c = COLORS[idx % COLORS.length];
  return (
    <div className={cn('rounded-full flex items-center justify-center font-black text-white shrink-0', c,
      size === 'sm' ? 'w-7 h-7 text-[9px]' : 'w-9 h-9 text-xs'
    )}>{initials}</div>
  );
}

// ─── MODAL VINCULAR USUÁRIOS (DUAL LISTBOX) ─────────────────────────
function VincularModal({ atividade, onClose, onSave }) {
  const [esquerda, setEsquerda] = useState(
    TODOS_OPERADORES.filter(o => !atividade.operadores.includes(o.id))
  );
  const [direita, setDireita] = useState(
    TODOS_OPERADORES.filter(o => atividade.operadores.includes(o.id))
  );
  const [selEsq, setSelEsq] = useState([]);
  const [selDir, setSelDir] = useState([]);
  const [loading, setLoading] = useState(false);

  const moverParaDireita = () => {
    const mov = esquerda.filter(o => selEsq.includes(o.id));
    setDireita(d => [...d, ...mov]);
    setEsquerda(e => e.filter(o => !selEsq.includes(o.id)));
    setSelEsq([]);
  };
  const moverParaEsquerda = () => {
    const mov = direita.filter(o => selDir.includes(o.id));
    setEsquerda(e => [...e, ...mov]);
    setDireita(d => d.filter(o => !selDir.includes(o.id)));
    setSelDir([]);
  };

  const toggleSel = (id, side) => {
    if (side === 'esq') setSelEsq(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    else                setSelDir(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => { onSave(atividade.id, direita.map(o => o.id)); onClose(); }, 1200);
  };

  const OperadorItem = ({ op, side, selected }) => {
    const outroAtivo = op.atividadeAtual && op.atividadeAtual !== atividade.id;
    return (
      <div onClick={() => toggleSel(op.id, side)}
        className={cn('flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all select-none border-2',
          selected
            ? 'border-secondary bg-secondary/5 dark:bg-secondary/10'
            : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}>
        <Avatar initials={op.foto} idx={TODOS_OPERADORES.indexOf(op)} size={selected ? 'md' : 'sm'} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{op.nome}</p>
          {outroAtivo && (
            <p className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5 mt-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> Em {op.atividadeAtual}
            </p>
          )}
          {!op.atividadeAtual && (
            <p className="text-[9px] text-green-500 font-bold flex items-center gap-0.5 mt-0.5">
              <UserCheck className="w-2.5 h-2.5" /> Disponível
            </p>
          )}
        </div>
        {selected && <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />}
      </div>
    );
  };

  const firstFieldRef = useRef(null);
  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vincular-title"
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{atividade.id} — {atividade.tipo}</p>
              <h2 id="vincular-title" className="text-base font-black text-white uppercase">Vincular Operadores à Atividade</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7">
          <p className="text-[10px] text-slate-400 font-bold text-center mb-5 uppercase tracking-widest">
            Selecione operadores e use os botões para mover entre as colunas
          </p>
          <div className="flex items-center gap-4 h-72">
            {/* Coluna esquerda — Disponíveis */}
            <div className="flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pool de Operadores ({esquerda.length})</p>
                {selEsq.length > 0 && <span className="text-[9px] font-black text-blue-600">{selEsq.length} selecionado{selEsq.length > 1 ? 's' : ''}</span>}
              </div>
              <div className="flex-1 overflow-y-auto border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-2 space-y-1 bg-slate-50 dark:bg-slate-800/30">
                {esquerda.length === 0 && <p className="text-[10px] text-center text-slate-400 py-8 italic">Todos os operadores já estão na atividade</p>}
                {esquerda.map(op => <OperadorItem key={op.id} op={op} side="esq" selected={selEsq.includes(op.id)} />)}
              </div>
            </div>

            {/* Botões de transferência */}
            <div className="flex flex-col gap-3 shrink-0">
              <button
                ref={firstFieldRef}
                onClick={moverParaDireita}
                disabled={selEsq.length === 0}
                aria-label="Mover selecionados para atividade"
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 disabled:opacity-30 transition-all shadow-md">
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={moverParaEsquerda}
                disabled={selDir.length === 0}
                aria-label="Remover selecionados da atividade"
                className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 active:scale-95 disabled:opacity-30 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Coluna direita — Atribuídos */}
            <div className="flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Atribuídos à Atividade ({direita.length})</p>
                {selDir.length > 0 && <span className="text-[9px] font-black text-slate-500">{selDir.length} selecionado{selDir.length > 1 ? 's' : ''}</span>}
              </div>
              <div className="flex-1 overflow-y-auto border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-2 space-y-1 bg-blue-50/30 dark:bg-blue-900/10">
                {direita.length === 0 && <p className="text-[10px] text-center text-slate-400 py-8 italic">Nenhum operador atribuído ainda</p>}
                {direita.map(op => <OperadorItem key={op.id} op={op} side="dir" selected={selDir.includes(op.id)} />)}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><UserCheck className="w-4 h-4" />Confirmar Alocação ({direita.length})</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PAUSAR / RETOMAR ─────────────────────────────────────────
function PausarRetomarModal({ atividade, acao, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const isPausar = acao === 'pausar';
  const handle = () => { setLoading(true); setTimeout(() => { onConfirm(atividade.id, acao); onClose(); }, 1200); };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pausa-title"
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className={cn('px-7 py-5 flex items-center justify-between', isPausar ? 'bg-amber-600' : 'bg-green-600')}>
          <div className="flex items-center gap-3">
            {isPausar ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{atividade.id}</p>
              <h2 id="pausa-title" className="text-base font-black text-white uppercase">{isPausar ? 'Pausar' : 'Retomar'} Atividade</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1.5">
            {[{ l: 'Atividade', v: atividade.id }, { l: 'Tipo', v: atividade.tipo }, { l: 'Região', v: atividade.regiao }].map(f => (
              <div key={f.l} className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.l}</span><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.v}</span></div>
            ))}
          </div>
          {isPausar && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo da Pausa</label>
              <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: Aguardando empilhadeira; Operador em pausa obrigatória..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:border-amber-400 transition-all resize-none" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handle} disabled={loading}
              className={cn('flex-1 py-3 rounded-2xl text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider', isPausar ? 'bg-amber-600' : 'bg-green-600')}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processando...</> : isPausar ? <><Pause className="w-4 h-4" />Pausar</> : <><Play className="w-4 h-4" />Retomar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GAVETA: HISTÓRICO DE EXECUÇÃO ─────────────────────────────────
function HistoricoDrawer({ atividade, onClose, now }) {
  const hist = HISTORICO[atividade.id] || [];

  // Duração real: diferença entre agora e o horário de início (sem magic number 142)
  const durMin = useMemo(() => {
    if (!atividade.inicio) return 0;
    // Formato dos dados mock: 'DD/MM HH:mm' ex: '22/02 08:10'
    // Parseamos para comparar com o horário atual do sistema
    try {
      const [datePart, timePart] = atividade.inicio.split(' ');
      const [day, month] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      const year = new Date().getFullYear();
      const start = new Date(year, month - 1, day, hours, minutes);
      const diffMs = now - start.getTime();
      // Se a diferença for negativa ou irreal (>48h), retorna 0
      if (diffMs < 0 || diffMs > 172800000) return 0;
      return Math.floor(diffMs / 60000);
    } catch {
      return 0;
    }
  }, [atividade.inicio, now]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-[480px] bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{atividade.id} — {atividade.tipo}</p>
              <h2 className="text-sm font-black text-white uppercase">Histórico de Execução</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Resumo KPIs */}
        <div className="shrink-0 grid grid-cols-3 gap-0 border-b border-slate-100 dark:border-slate-800">
          {[
            { label: 'Progresso',  value: `${atividade.progresso}%`, icon: TrendingUp,  color: 'text-blue-600' },
            { label: 'Operadores', value: atividade.operadores.length, icon: Users, color: 'text-purple-600' },
            { label: 'Duração',    value: atividade.inicio ? `${Math.floor(durMin / 60)}h${durMin % 60}m` : '—', icon: Timer, color: 'text-amber-600' },
          ].map((k, i) => (
            <div key={i} className={cn('p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-0')}>
              <k.icon className={cn('w-4 h-4 mx-auto mb-1', k.color)} />
              <p className={cn('text-xl font-black', k.color)}>{k.value}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Barra de progresso */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progresso Geral</span>
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-300">{atividade.progresso}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-700', STATUS_CFG[atividade.status]?.bar || 'bg-slate-300')}
              style={{ width: `${atividade.progresso}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-slate-400">{atividade.inicio || '—'}</span>
            <span className="text-[8px] text-slate-400">Prev: {atividade.prevTermino || '—'}</span>
          </div>
        </div>

        {/* Operadores vinculados */}
        {atividade.operadores.length > 0 && (
          <div className="shrink-0 px-5 py-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operadores Atuais</p>
            <div className="flex flex-wrap gap-2">
              {atividade.operadores.map((opId, i) => {
                const op = TODOS_OPERADORES.find(o => o.id === opId);
                return op ? (
                  <div key={opId} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Avatar initials={op.foto} idx={i} size="sm" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{op.nome}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Timeline de eventos */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Timeline de Eventos</p>
          {hist.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum evento registrado.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-6">
                {hist.map((ev, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 shadow-sm z-10">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-xs font-black text-slate-800 dark:text-white">{ev.operador}</p>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{ev.acao}</span>
                      </div>
                      {ev.obs && <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">{ev.obs}</p>}
                      <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{ev.hora}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────
export default function ActivityManager() {
  const [atividades, setAtividades]   = useState(INITIAL_ATIVIDADES);
  const [selectedId, setSelectedId]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [filterSearch, setFilterSearch] = useState('');
  const [modal, setModal]             = useState(null);
  const [acao, setAcao]               = useState(null);
  const [now, setNow]                 = useState(() => Date.now()); // força re-render p/ relógio vivo

  // Map O(1) para lookup de operador por id — evita O(n²) no map da tabela
  const operadoresMap = useMemo(
    () => new Map(TODOS_OPERADORES.map(o => [o.id, o])),
    [] // TODOS_OPERADORES é constante de módulo
  );

  // Relógio para atividades em execução
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const selected = atividades.find(a => a.id === selectedId);

  const filtered = atividades.filter(a => {
    if (filterStatus !== 'Todas' && a.status !== filterStatus) return false;
    const q = filterSearch.toLowerCase();
    if (q && !a.id.toLowerCase().includes(q) && !a.tipo.toLowerCase().includes(q) && !a.regiao.toLowerCase().includes(q)) return false;
    return true;
  });

  const handleVincular = (atId, operadoresIds) => {
    setAtividades(prev => prev.map(a => a.id === atId ? { ...a, operadores: operadoresIds } : a));
    setSelectedId(null);
  };

  const handlePausarRetomar = (atId, acao2) => {
    setAtividades(prev => prev.map(a => a.id === atId
      ? { ...a, status: acao2 === 'pausar' ? 'Pausada' : 'Em Execução' }
      : a
    ));
    setSelectedId(null);
  };

  // KPIs derivados dos status canônicos — nunca hardcoded
  const kpis = Object.fromEntries(STATUS_LIST.map(s => [s, atividades.filter(a => a.status === s).length]));

  const canPausar  = selected?.status === 'Em Execução';
  const canRetomar = selected?.status === 'Pausada';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-secondary to-blue-600" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-700 flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 4 — Movimentação Interna e Estoque</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">3.4 Monitorar Atividades</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Painel de Supervisão · Monitoramento e redirecionamento do trabalho físico</p>
            </div>
          </div>

          {/* KPI strips */}
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {Object.entries(kpis).map(([key, count]) => {
              const cfg = STATUS_CFG[key];
              return count > 0 && (
                <button key={key}
                  onClick={() => setFilterStatus(filterStatus === key ? 'Todas' : key)}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all',
                    filterStatus === key ? cfg.color + ' border-current/30 scale-105 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:scale-105'
                  )}>
                  <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                  {count} {key}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button disabled={!selectedId}
          onClick={() => setModal('vincular')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Users className="w-3.5 h-3.5" />Vincular Usuários
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button disabled={!canPausar}
          onClick={() => { setAcao('pausar'); setModal('pausa'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Pause className="w-3.5 h-3.5" />Pausar Atividade
        </button>
        <button disabled={!canRetomar}
          onClick={() => { setAcao('retomar'); setModal('pausa'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <Play className="w-3.5 h-3.5" />Retomar Atividade
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button disabled={!selectedId}
          onClick={() => setModal('historico')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md">
          <BarChart2 className="w-3.5 h-3.5" />Histórico de Execução
        </button>

        <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {selectedId ? `${selectedId} selecionada` : 'Nenhuma atividade selecionada'}
        </span>
      </div>

      {/* ═══════════ FILTROS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="relative flex items-center">
          <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
            placeholder="ID, tipo ou região..."
            className="pr-9 pl-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-52" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" />
        </div>
        <div className="flex gap-1.5">
          {['Todas', ...STATUS_LIST].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all',
                filterStatus === s ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              )}>{s}</button>
          ))}
        </div>
        <button onClick={() => { setFilterStatus('Todas'); setFilterSearch(''); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" /> Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400">{filtered.length} atividade{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ═══════════ GRID PRINCIPAL ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['', 'ID Atividade', 'Tipo de Atividade', 'Região de Armazenagem', 'Progresso', 'Operadores', 'Início', 'Status'].map((h, i) => (
                <th key={i} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma atividade encontrada com os filtros aplicados.</td></tr>
            )}
            {filtered.map(at => {
              const isSel = at.id === selectedId;
              // O(1) via Map — sem find() linear por linha
              const ops = at.operadores.map(id => operadoresMap.get(id)).filter(Boolean);
              return (
                <tr key={at.id}
                  role="row"
                  tabIndex={0}
                  aria-selected={isSel}
                  onClick={() => setSelectedId(at.id === selectedId ? null : at.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(at.id === selectedId ? null : at.id);
                    }
                  }}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all',
                    at.status === 'Pausada' && 'bg-amber-50/30 dark:bg-amber-950/10',
                    at.status === 'Pendente' && at.operadores.length === 0 && 'bg-red-50/20 dark:bg-red-950/10',
                    isSel ? 'border-l-4 border-l-secondary bg-secondary/5 dark:bg-secondary/5' : 'border-l-4 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}>
                  <td className="p-4">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSel ? 'bg-secondary scale-150' : 'bg-transparent')} />
                  </td>
                  <td className="p-4">
                    {/* span com font-mono em vez de code — sem significado semântico aqui */}
                    <span className="text-sm font-black text-blue-600 font-mono">{at.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{at.tipo}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{at.regiao}</span>
                    </div>
                  </td>
                  <td className="p-4 w-32">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{at.progresso}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-20">
                        <div className={cn('h-full rounded-full transition-all duration-500', STATUS_CFG[at.status]?.bar || 'bg-slate-200')}
                          style={{ width: `${at.progresso}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {ops.length === 0 ? (
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><UserX className="w-3.5 h-3.5" />Sem operador</span>
                    ) : (
                      <div className="flex -space-x-2">
                        {ops.slice(0, 3).map((op, i) => (
                          <div key={op.id} title={op.nome} style={{ zIndex: ops.length - i }}>
                            <Avatar initials={op.foto} idx={i} size="sm" />
                          </div>
                        ))}
                        {ops.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-500 border-2 border-white dark:border-slate-800">+{ops.length - 3}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                    {at.inicio || <span className="text-slate-300 dark:text-slate-600 italic">Não iniciada</span>}
                  </td>
                  <td className="p-4"><StatusBadge status={at.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAIS & GAVETA */}
      {modal === 'vincular'  && selected && <VincularModal atividade={selected} onClose={() => setModal(null)} onSave={handleVincular} />}
      {modal === 'pausa'     && selected && <PausarRetomarModal atividade={selected} acao={acao} onClose={() => setModal(null)} onConfirm={handlePausarRetomar} />}
      {modal === 'historico' && selected && <HistoricoDrawer atividade={selected} onClose={() => setModal(null)} now={now} />}
    </div>
  );
}
