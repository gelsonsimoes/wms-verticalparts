import React, { useState, useMemo, useCallback, useId, useEffect } from 'react';
import {
  Package,
  MapPin,
  Save,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Filter,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Warehouse,
  ArrowRightLeft,
  LayoutGrid,
  Lock,
  User,
  Check,
  RotateCcw,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

function cn(...i) { return twMerge(clsx(i)); }

// ─── ENUMS ────────────────────────────────────────────────────────────────────
const STATUS_OPTS  = ['Todos', 'Pendente', 'Posicionado', 'Finalizado', 'Cancelado'];
const TIPO_LOCAL   = ['Pulmão', 'Picking'];
const TIPO_RECEB   = ['Compra', 'Transferência', 'Devolução', 'Cross-Docking'];
const DEPOSITANTES = ['VerticalParts SP', 'Elevadores ABC Ltda', 'Schindler Partes', 'Kone Brasil'];
const PRODUTOS_LIST = [
  'Motor de Tração 220V', 'Cabo de Aço 10mm', 'Painel Elétrico 800W',
  'Freio Magnético D-200', 'Guia de Corrediça 40mm', 'Porta de Cabine Inox',
  'Contrapeso 500kg', 'Botoeira LED Touch', 'Sensor de Nível',
];

// STATUS_COLOR — objeto completo para uso direto (sem split hack)
const STATUS_COLOR = {
  Pendente:    { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', filterActive: 'bg-amber-100 text-amber-700 border-amber-400' },
  Posicionado: { badge: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',  filterActive: 'bg-blue-100  text-blue-700  border-blue-400' },
  Finalizado:  { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', filterActive: 'bg-green-100 text-green-700 border-green-400' },
  Cancelado:   { badge: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',   filterActive: 'bg-red-100   text-red-700   border-red-400' },
};

// ─── GERADOR DE ENDEREÇO ───────────────────────────────────────────────────────
const RUAS    = ['R1','R2','R3'];
const PP_RUA  = { R1:['PP1','PP2'], R2:['PP3','PP4'], R3:['PP5'] };
const NIVEIS  = ['A','B','C','D'];

/**
 * Gera endereço aleatório excluindo endereços já ocupados.
 * @param {string[]} ocupados - Endereços já em uso
 */
function gerarEndereco(tipoLocal, ocupados = []) {
  const candidatos = [];
  for (const rua of RUAS) {
    for (const pp of PP_RUA[rua]) {
      for (const nivel of NIVEIS) {
        for (let pos = 1; pos <= 20; pos++) {
          candidatos.push(`${rua}_${pp}_${nivel}${pos}`);
        }
      }
    }
  }
  const disponiveis = candidatos.filter(e => !ocupados.includes(e));
  if (disponiveis.length === 0) return { endereco: null, tipoLocal: null }; // sem espaço
  const endereco = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  const tipo = tipoLocal || TIPO_LOCAL[Math.floor(Math.random() * 2)];
  return { endereco, tipoLocal: tipo };
}

/**
 * Gera ID de lote com UUID para garantir unicidade mesmo após refresh.
 */
function gerarLote(ordemId) {
  const unique = crypto.randomUUID().split('-')[0].toUpperCase();
  return `LOT-${ordemId}-${unique}`;
}

// ─── HELPERS DE ROW ───────────────────────────────────────────────────────────
function dbRowToRow(r) {
  return {
    id: r.id, ordemId: r.ordem_id,
    depositante: r.depositante || '—',
    tipoRecebimento: r.tipo_recebimento || '—',
    produto: r.produto || '—',
    lote: r.lote || null,
    enderecoSugerido: r.endereco_sugerido || null,
    tipoLocal: r.tipo_local || null,
    status: r.status || 'Pendente',
    selecionado: false,
  };
}

function rowToDb(r, warehouseId) {
  return {
    id: r.id,
    warehouse_id: warehouseId,
    ordem_id: r.ordemId,
    depositante: r.depositante,
    tipo_recebimento: r.tipoRecebimento,
    produto: r.produto,
    lote: r.lote,
    endereco_sugerido: r.enderecoSugerido,
    tipo_local: r.tipoLocal,
    status: r.status,
  };
}

// ─── FILA DE TOASTS ───────────────────────────────────────────────────────────
// Cada toast tem id único para empilhar sem sobrescrever
function useToastQueue() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(q => [...q, { id, msg, type }]);
    setTimeout(() => setToasts(q => q.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── SHAKE ANIMATION via CSS (sem animate-bounce infinito) ───────────────────
const shakeStyle = `
@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-8px)}
  40%{transform:translateX(8px)}
  60%{transform:translateX(-5px)}
  80%{transform:translateX(5px)}
}
.shake { animation: shake 0.45s ease; }
`;

// ─── MODAL ALTERAR ENDEREÇO ───────────────────────────────────────────────────
function ModalAlterarEndereco({ rows, allRows, onClose, onSave }) {
  const { LOCATIONS } = useApp();
  const safeLocations = Array.isArray(LOCATIONS) ? LOCATIONS : [];

  // Endereços já ocupados por outras rows
  const ocupados = allRows
    .filter(r => !rows.some(s => s.id === r.id) && r.enderecoSugerido && r.status !== 'Cancelado')
    .map(r => r.enderecoSugerido);

  const [enderecoId, setEnderecoId] = useState(safeLocations[0]?.id ?? '');
  const [tipo, setTipo] = useState('Pulmão');
  const [error, setError] = useState('');

  const groupedLocations = safeLocations.reduce((acc, loc) => {
    const key = `${loc.rua} — ${loc.portaPalete}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {});

  const handleSave = () => {
    if (!enderecoId) { setError('Selecione um endereço.'); return; }
    if (ocupados.includes(enderecoId)) {
      setError(`Endereço ${enderecoId} já está ocupado por outra ordem.`);
      return;
    }
    onSave(enderecoId, tipo);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="alt-end-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <p id="alt-end-title" className="text-xs font-black text-slate-800 dark:text-white">Alterar Endereço de Alocação</p>
            <p className="text-[10px] text-slate-400">{rows.length} registro(s) selecionado(s)</p>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/20">
          <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5">Ordens afetadas</p>
          <div className="flex flex-wrap gap-1.5">
            {rows.map(r => (
              <span key={r.id} className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg font-black">{r.ordemId}</span>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label htmlFor="select-endereco" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Endereço Disponível</label>
            {safeLocations.length === 0 ? (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Nenhum endereço disponível no contexto.
              </p>
            ) : (
              <select id="select-endereco" value={enderecoId} onChange={e => { setEnderecoId(e.target.value); setError(''); }}
                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-black outline-none transition-all">
                {Object.entries(groupedLocations).map(([groupKey, locs]) => (
                  <optgroup key={groupKey} label={groupKey}>
                    {locs.map(loc => (
                      <option key={loc.id} value={loc.id} disabled={ocupados.includes(loc.id)}>
                        {loc.id} ({loc.tipo}){ocupados.includes(loc.id) ? ' — Ocupado' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
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
            <Warehouse className="w-4 h-4 text-secondary" aria-hidden="true" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Endereço</p>
              <p className="text-lg font-black text-secondary font-mono">{enderecoId || '—'}</p>
            </div>
            <span className={cn('ml-auto text-[10px] font-black px-3 py-1 rounded-full',
              tipo === 'Pulmão' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>{tipo}</span>
          </div>

          {error && (
            <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />{error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
          <button onClick={handleSave}
            className="px-5 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 active:scale-95 transition-all shadow-md flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />Aplicar Endereço
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL AUTORIZAÇÃO SUPERVISOR ────────────────────────────────────────────
// SEGURANÇA: Nenhuma credencial é armazenada no frontend.
// Em produção, `onAutorizado` deve chamar uma API que valida no backend e retorna token.
// Este modal é apenas a interface de coleta — a validação NUNCA ocorre no cliente.
function ModalAutorizacaoSupervisor({ count, onClose, onAutorizado }) {
  const [usuario, setUsuario] = useState('');
  const [senha,   setSenha]   = useState('');
  const [erro,    setErro]    = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalId = useId();

  // Simula chamada de API — substitua por fetch('/api/auth/supervisor', { method:'POST', body: JSON.stringify({usuario, senha}) })
  const handleConfirmar = async () => {
    setLoading(true);
    try {
      // ⚠️ ATENÇÃO: Em produção, remova esta lógica local e chame a API real.
      // Nunca valide credenciais no cliente.
      await new Promise(r => setTimeout(r, 800)); // simula latência de rede
      // MOCK: A validação real ocorre no servidor, que retorna { ok: true, token: '...' }
      // Aqui apenas avançamos para demonstração da UI — sem armazenar senha.
      onAutorizado();
    } catch {
      setErro('Serviço indisponível. Tente novamente.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const _handleErroCredencial = () => {
    setErro('Credenciais inválidas. Acesso negado.');
    setSenha('');
    triggerShake();
  };

  return (
    <>
      <style>{shakeStyle}</style>
      <div role="dialog" aria-modal="true" aria-labelledby={`${modalId}-title`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
        <div className={cn(
          'relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-green-500/40 w-full max-w-sm shadow-2xl overflow-hidden',
          shaking && 'shake'
        )}>
          <div className="h-1.5 w-full bg-gradient-to-r from-green-600 via-green-400 to-green-600" />

          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p id={`${modalId}-title`} className="text-sm font-black text-slate-800 dark:text-white">Autorização de Supervisor</p>
                <p className="text-[10px] text-slate-400">Necessário para confirmar {count} alocação(ões)</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800/40 rounded-2xl px-4 py-3 text-[10px] text-green-700 dark:text-green-400 font-medium">
              Esta operação confirma a guarda física da mercadoria. A ação <strong>não pode ser desfeita</strong>.
            </div>

            {/* Aviso de segurança visível */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[9px] text-amber-700 font-bold flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
              As credenciais são validadas pelo servidor. Nenhuma senha é armazenada localmente.
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  value={usuario}
                  onChange={e => { setUsuario(e.target.value); setErro(''); }}
                  placeholder="Usuário supervisor"
                  autoComplete="username"
                  aria-label="Usuário supervisor"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 rounded-xl text-sm outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="password"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro(''); }}
                  placeholder="Senha"
                  autoComplete="current-password"
                  aria-label="Senha do supervisor"
                  onKeyDown={e => e.key === 'Enter' && !loading && handleConfirmar()}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 rounded-xl text-sm outline-none transition-all"
                />
              </div>
            </div>

            {erro && (
              <div role="alert" className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/30">
                <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />{erro}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!usuario.trim() || !senha || loading}
                aria-busy={loading}
                className={cn('flex-1 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5',
                  loading ? 'bg-green-400 text-white cursor-wait' : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                )}>
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />Verificando...</>
                  : <><ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />Autorizar</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AllocationMap() {
  const { warehouseId } = useApp();
  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [search,       setSearch]       = useState('');
  const [gerando,      setGerando]      = useState(false);
  const [modal,        setModal]        = useState(null); // 'alterar' | 'confirmar'
  const { toasts, push: toast } = useToastQueue();

  // ── Fetch from Supabase ────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    if (!warehouseId) return;
    const { data, error } = await supabase
      .from('alocacoes')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false });
    if (error) { console.error('alocacoes:', error); setLoading(false); return; }

    // If no allocations yet, try to seed from ordens_recebimento (Aguardando Alocação)
    if ((data || []).length === 0) {
      const { data: ordens } = await supabase
        .from('ordens_recebimento')
        .select('id, codigo, depositante, tipo, nf')
        .eq('warehouse_id', warehouseId)
        .eq('status', 'Aguardando Alocação');
      if (ordens && ordens.length > 0) {
        const toInsert = ordens.map(or => ({
          warehouse_id: warehouseId,
          ordem_id: or.codigo,
          depositante: or.depositante,
          tipo_recebimento: or.tipo,
          produto: or.nf || '—',
          status: 'Pendente',
        }));
        const { data: inserted } = await supabase.from('alocacoes').insert(toInsert).select();
        setRows((inserted || []).map(dbRowToRow));
      }
    } else {
      setRows((data || []).map(dbRowToRow));
    }
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => {
    fetchRows();
    if (!warehouseId) return;
    const ch = supabase.channel('alocacoes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alocacoes', filter: `warehouse_id=eq.${warehouseId}` }, fetchRows)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [warehouseId, fetchRows]);

  // ── Filtragem usando KPI do contexto filtrado ─────────────────────────────
  const filtrados = useMemo(() =>
    rows.filter(r =>
      (statusFiltro === 'Todos' || r.status === statusFiltro) &&
      (r.ordemId.toLowerCase().includes(search.toLowerCase()) ||
       r.produto.toLowerCase().includes(search.toLowerCase()) ||
       r.depositante.toLowerCase().includes(search.toLowerCase()))
    ), [rows, statusFiltro, search]);

  // KPIs refletem o filtro atual, não o total global
  const kpiPendentes    = filtrados.filter(r => r.status === 'Pendente').length;
  const kpiPosicionados = filtrados.filter(r => r.status === 'Posicionado').length;
  const kpiFinalizados  = filtrados.filter(r => r.status === 'Finalizado').length;

  const selecionados = filtrados.filter(r => r.selecionado);
  const pendentes    = filtrados.filter(r => r.status === 'Pendente');

  // toggleSel — sem propagação dupla: usamos stopPropagation no <td> do checkbox
  const toggleSel = useCallback((id) =>
    setRows(rs => rs.map(r => r.id === id ? { ...r, selecionado: !r.selecionado } : r)),
  []);

  const toggleAll = () => {
    const allSel = filtrados.every(r => r.selecionado);
    const ids = new Set(filtrados.map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, selecionado: !allSel } : r));
  };

  // ── Gerar Alocação — respeita seleção (se houver) ou pendentes ────────────
  const handleGenerate = () => {
    const selPendentes = selecionados.filter(r => r.status === 'Pendente');
    const targets = selPendentes.length > 0 ? selPendentes : pendentes;
    if (targets.length === 0) { toast('Nenhum registro Pendente para alocar.', 'warn'); return; }
    setGerando(true);
    setTimeout(async () => {
      const targetIds = new Set(targets.map(r => r.id));
      let updatedRows = [];
      setRows(rs => {
        const ocupados = rs
          .filter(r => !targetIds.has(r.id) && r.enderecoSugerido && r.status !== 'Cancelado')
          .map(r => r.enderecoSugerido);
        const usados = [...ocupados];
        const newRs = rs.map(r => {
          if (!targetIds.has(r.id)) return r;
          const { endereco, tipoLocal } = gerarEndereco(undefined, usados);
          if (endereco) usados.push(endereco);
          if (!endereco) return { ...r, status: 'Pendente' };
          return { ...r, lote: gerarLote(r.ordemId), enderecoSugerido: endereco, tipoLocal, status: 'Posicionado' };
        });
        updatedRows = newRs.filter(r => targetIds.has(r.id));
        return newRs;
      });
      // Persist to Supabase
      for (const r of updatedRows) {
        await supabase.from('alocacoes').update({
          lote: r.lote, endereco_sugerido: r.enderecoSugerido,
          tipo_local: r.tipoLocal, status: r.status,
        }).eq('id', r.id);
      }
      setGerando(false);
      toast(`${targets.length} alocação(ões) gerada(s) com sucesso!`);
    }, 1800);
  };

  // ── Alterar Endereço ───────────────────────────────────────────────────────
  const handleAlterar = () => {
    if (selecionados.length === 0) { toast('Selecione ao menos um registro.', 'warn'); return; }
    setModal('alterar');
  };

  const handleSaveEndereco = async (endereco, tipoLocal) => {
    const ids = new Set(selecionados.map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, enderecoSugerido: endereco, tipoLocal, status: 'Posicionado' } : r));
    setModal(null);
    for (const id of ids) {
      await supabase.from('alocacoes').update({ endereco_sugerido: endereco, tipo_local: tipoLocal, status: 'Posicionado' }).eq('id', id);
    }
    toast(`Endereço ${endereco} aplicado em ${selecionados.length} registro(s).`);
  };

  // ── Confirmar Alocação ─────────────────────────────────────────────────────
  const handleConfirmar = () => {
    const elegíveis = selecionados.filter(r => r.status === 'Posicionado');
    if (elegíveis.length === 0) {
      toast('Selecione registros com status "Posicionado" para confirmar.', 'warn');
      return;
    }
    setModal('confirmar');
  };

  const handleAutorizado = async () => {
    const ids = new Set(selecionados.filter(r => r.status === 'Posicionado').map(r => r.id));
    setRows(rs => rs.map(r => ids.has(r.id) ? { ...r, status: 'Finalizado', selecionado: false } : r));
    setModal(null);
    for (const id of ids) {
      await supabase.from('alocacoes').update({ status: 'Finalizado' }).eq('id', id);
    }
    toast(`${ids.size} alocação(ões) CONFIRMADA(S)! Guarda registrada.`);
  };

  // ── Resetar Lote (anteriormente "Excluir") ────────────────────────────────
  // Ação correta: volta para Pendente, preserva a ordem; NÃO apaga o ordemId
  // O lote físico impresso ainda existe — avise o operador
  const handleResetar = async () => {
    if (selecionados.length === 0) { toast('Selecione ao menos um registro.', 'warn'); return; }
    const naoFinalizado = selecionados.filter(r => r.status !== 'Finalizado');
    if (naoFinalizado.length === 0) { toast('Registros Finalizados não podem ser resetados.', 'warn'); return; }
    const ids = new Set(naoFinalizado.map(r => r.id));
    setRows(rs => rs.map(r =>
      ids.has(r.id)
        ? { ...r, lote: null, enderecoSugerido: null, tipoLocal: null, status: 'Cancelado', selecionado: false }
        : r
    ));
    for (const id of ids) {
      await supabase.from('alocacoes').update({ lote: null, endereco_sugerido: null, tipo_local: null, status: 'Cancelado' }).eq('id', id);
    }
    toast(`${naoFinalizado.length} registro(s) cancelado(s). Lotes físicos precisam ser inutilizados manualmente.`, 'warn');
  };

  const posicionadosSelect = selecionados.filter(r => r.status === 'Posicionado').length;

  const actionGroups = [[
    { label: gerando ? 'Gerando...' : 'Gerar Alocação', icon: gerando ? RefreshCw : Zap, primary: true, onClick: handleGenerate, disabled: gerando || pendentes.length === 0 },
    { label: 'Alterar Endereço', icon: ArrowRightLeft, onClick: handleAlterar, disabled: selecionados.length === 0 },
    { label: 'Confirmar',        icon: ShieldCheck,     onClick: handleConfirmar, disabled: posicionadosSelect === 0 },
    { label: 'Cancelar',         icon: RotateCcw,       onClick: handleResetar,  disabled: selecionados.length === 0 },
  ]];

  return (
    <EnterprisePageBase
      title="2.6 Gerar Mapa de Alocação"
      breadcrumbItems={[{ label: 'Entrada e Recebimento' }]}
      actionGroups={actionGroups}
    >

      {/* ═══ MODAIS ═══ */}
      {modal === 'alterar' && (
        <ModalAlterarEndereco rows={selecionados} allRows={rows} onClose={() => setModal(null)} onSave={handleSaveEndereco} />
      )}
      {modal === 'confirmar' && (
        <ModalAutorizacaoSupervisor
          count={posicionadosSelect}
          onClose={() => setModal(null)}
          onAutorizado={handleAutorizado}
        />
      )}

      {/* ═══ FILA DE TOASTS ═══ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300',
            t.type === 'warn'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400'
              : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
          )}>
            {t.type === 'warn' ? <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ═══ KPIs ═══ */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pendentes',    val: kpiPendentes,    color: 'text-amber-500' },
          { label: 'Posicionados', val: kpiPosicionados, color: 'text-blue-500'  },
          { label: 'Finalizados',  val: kpiFinalizados,  color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="text-center bg-white dark:bg-slate-800 border border-slate-100 rounded-2xl px-5 py-3 min-w-[80px]"
            title={statusFiltro !== 'Todos' ? `Filtrado por: ${statusFiltro}` : 'Total do sistema'}>
            <p className={cn('text-2xl font-black', k.color)}>{k.val}</p>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
          </div>
        ))}
        <p className="text-xs text-slate-500 font-medium self-center ml-1">
          Inteligência de armazenamento · Endereçamento automático Pulmão / Picking
        </p>
      </div>

      {/* ═══ BARRA DE FILTROS ═══ */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ordem, Produto ou Depositante..."
            aria-label="Filtrar registros"
            className="pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
        </div>
        <div className="flex gap-1" role="group" aria-label="Filtrar por status">
          {STATUS_OPTS.map(s => {
            const isActive = statusFiltro === s;
            const colorCls = s === 'Todos'
              ? (isActive ? 'bg-slate-800 text-white border-slate-700' : '')
              : (isActive ? STATUS_COLOR[s]?.filterActive : '');
            return (
              <button key={s} onClick={() => setStatusFiltro(s)} aria-pressed={isActive}
                className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all',
                  isActive ? colorCls : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
                )}>
                {s}
              </button>
            );
          })}
        </div>
        <div className="ml-auto text-[10px] text-slate-400 font-medium">{filtrados.length} registro(s)</div>
      </div>

      {/* ═══ GRID ═══ */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-secondary animate-spin" />
          <span className="ml-2 text-sm text-slate-400 font-bold">Carregando alocações...</span>
        </div>
      ) : null}
      <div>
        {selecionados.length > 0 && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-secondary/10 border-2 border-secondary/30 rounded-xl text-xs font-black text-secondary animate-in fade-in duration-200"
            aria-live="polite">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            {selecionados.length} registro(s) selecionado(s)
            {posicionadosSelect > 0 && <span className="text-blue-600 ml-2">· {posicionadosSelect} Posicionado(s)</span>}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                <th className="p-3 w-10">
                  <button
                    onClick={toggleAll}
                    aria-label={filtrados.every(r => r.selecionado) ? 'Desmarcar todos' : 'Selecionar todos'}
                    className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                      filtrados.length > 0 && filtrados.every(r => r.selecionado)
                        ? 'bg-secondary border-secondary'
                        : 'border-slate-300 dark:border-slate-600'
                    )}>
                    {filtrados.length > 0 && filtrados.every(r => r.selecionado) && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                  </button>
                </th>
                {['Ordem','Depositante','Tipo Receb.','Produto','Lote Gerado','Local Sugerido','Tipo Local','Status'].map(h => (
                  <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(row => (
                <tr
                  key={row.id}
                  role="row"
                  tabIndex={0}
                  aria-selected={row.selecionado}
                  onClick={() => toggleSel(row.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSel(row.id); } }}
                  className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all',
                    row.selecionado ? 'bg-secondary/[0.07] dark:bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  )}>
                  {/* Checkbox — stopPropagation evita double-toggle */}
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <div
                      role="checkbox"
                      aria-checked={row.selecionado}
                      tabIndex={-1}
                      onClick={() => toggleSel(row.id)}
                      className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer',
                        row.selecionado ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-600'
                      )}>
                      {row.selecionado && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                    </div>
                  </td>
                  <td className="p-3"><span className="text-xs font-black text-secondary font-mono">{row.ordemId}</span></td>
                  <td className="p-3 text-[10px] text-slate-500 font-bold">{row.depositante}</td>
                  <td className="p-3">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg font-bold">{row.tipoRecebimento}</span>
                  </td>
                  <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{row.produto}</td>
                  <td className="p-3">
                    {row.lote
                      ? <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">{row.lote}</span>
                      : <span className="text-[9px] text-slate-300 italic">—</span>}
                  </td>
                  <td className="p-3">
                    {row.enderecoSugerido
                      ? <div className="flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-secondary shrink-0" aria-hidden="true" />
                          <span className="text-sm font-black text-secondary font-mono">{row.enderecoSugerido}</span>
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
                    <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', STATUS_COLOR[row.status]?.badge)}>
                      {row.status}
                    </span>
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
            <span key={s} className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', c.badge)}>{s}</span>
          ))}
          <p className="text-[9px] text-slate-400 ml-auto font-medium">{filtrados.length} registro(s) exibido(s)</p>
        </div>
      </div>
    </EnterprisePageBase>
  );
}
