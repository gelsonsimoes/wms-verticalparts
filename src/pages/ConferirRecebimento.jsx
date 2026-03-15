import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  PackageSearch, CheckCircle2, AlertTriangle, Printer,
  AlertCircle, X, Lock, ShieldAlert, RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Utilidades ──────────────────────────────────────────────────────────────
function safeInt(v, fallback = 0) {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

// ─── Toast queue ─────────────────────────────────────────────────────────────
function useToastQueue() {
  const [queue, setQueue] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = crypto.randomUUID();
    setQueue(q => [...q, { id, msg, type }]);
    setTimeout(() => setQueue(q => q.filter(t => t.id !== id)), 4500);
  }, []);
  return { queue, push };
}

// ─── Mock NF-es (em produção: fetch('/api/nfe?status=aguardando')) ────────────
const MOCK_NFE = [
  { id: 'NF-78901', desc: 'VerticalParts Matriz (OR-55920)', items: [
    { id: crypto.randomUUID(), ean: 'VPER-PNT-AL-22D-202X145-CT', produto: 'Pente de Alumínio - 22 Dentes (202x145mm)', qtdNF: 10 },
    { id: crypto.randomUUID(), ean: 'VEPEL-BTI-JX02-CCS',         produto: 'Botoeira de Inspeção - Mod. JX02',          qtdNF: 5  },
    { id: crypto.randomUUID(), ean: 'VPER-LUM-LED-VRD-24V',       produto: 'Luminária em LED Verde 24V',                qtdNF: 12 },
  ]},
  { id: 'NF-78845', desc: 'VerticalParts Matriz (OR-55921)', items: [
    { id: crypto.randomUUID(), ean: 'VPER-ESS-NY-27MM', produto: 'Escova de Segurança Nylon 27mm', qtdNF: 20 },
  ]},
];

function buildItemState(items) {
  return items.map(i => ({
    ...i, qtdConferida: 0, lote: '-', validade: '-', status: 'Pendente', avaria: null,
  }));
}

// ─── Modal de supervisor (sem credenciais hardcoded) ─────────────────────────
// Em produção: POST /api/auth/supervisor com { usuario, senha }
const MAX_ATTEMPTS = 3;

function ModalSupervisor({ divergencia, onApprove, onCancel }) {
  const [usuario, setUsuario] = useState('');
  const [senha,   setSenha]   = useState('');
  const [erro,    setErro]    = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [loading, setLoading] = useState(false);
  const bloqueado = tentativas >= MAX_ATTEMPTS;

  const handleSubmit = async () => {
    if (bloqueado) return;
    if (!usuario.trim() || !senha.trim()) { setErro('Preencha usuário e senha.'); return; }
    setLoading(true); setErro('');
    try {
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: substituir pela chamada real
      // const res = await fetch('/api/auth/supervisor', {
      //   method: 'POST', body: JSON.stringify({ usuario, senha }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // if (!res.ok) throw new Error('Credenciais inválidas.');
      // const { token, nome } = await res.json();
      await new Promise(r => setTimeout(r, 600)); // simulação de rede
      // Placeholder: aceita qualquer preenchimento (demonstração)
      if (!usuario.trim() || senha.length < 1) throw new Error('Credenciais inválidas.');
      onApprove(usuario.trim());
    } catch (_e) {
      const t = tentativas + 1;
      setTentativas(t);
      setErro(t >= MAX_ATTEMPTS
        ? `Limite de ${MAX_ATTEMPTS} tentativas atingido. Contate o administrador.`
        : `Credenciais inválidas. Tentativa ${t}/${MAX_ATTEMPTS}.`
      );
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border-2 border-red-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm">Aprovação de Supervisor</p>
            <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Divergência detectada</p>
          </div>
        </div>
        {divergencia && (
          <p className="text-xs text-slate-500 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 font-medium">
            {divergencia}
          </p>
        )}
        <div className="space-y-3 mb-4">
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)}
            placeholder="Login do supervisor" disabled={bloqueado || loading}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-400 disabled:opacity-50" />
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !bloqueado && handleSubmit()}
            placeholder="Senha" disabled={bloqueado || loading}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-400 disabled:opacity-50" />
        </div>
        {erro && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-red-700">{erro}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={bloqueado || loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Validando…' : 'Autorizar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de finalização ─────────────────────────────────────────────────────
function ModalFinalizar({ nfe, items, onConfirm, onCancel }) {
  const pendentes   = items.filter(i => i.status === 'Pendente');
  const divergentes = items.filter(i => i.status === 'Divergente');
  const ok          = pendentes.length === 0 && divergentes.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border-2 border-slate-200">
        <div className="flex items-center gap-3 mb-5">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', ok ? 'bg-green-100' : 'bg-amber-100')}>
            {ok ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-amber-600" />}
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm">
              {ok ? 'Conferência perfeita' : 'Finalizar com ressalvas?'}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NF: {nfe}</p>
          </div>
        </div>

        {!ok && (
          <div className="space-y-2 mb-5">
            {pendentes.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                ⚠️ {pendentes.length} item(ns) não conferido(s)
              </div>
            )}
            {divergentes.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                🔴 {divergentes.length} item(ns) com divergência — requer aprovação do supervisor
              </div>
            )}
            <p className="text-xs text-slate-500">
              A OR será movida para "Aguardando Alocação". Divergências geram ocorrência para revisão.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className={cn('flex-1 py-3 text-white rounded-xl text-sm font-black active:scale-95 transition-all',
              ok ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
            )}>
            {ok ? 'Finalizar' : 'Finalizar com Ressalvas'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConferirRecebimento() {
  const [nfe,       setNfe]       = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [recId]                   = useState(() => `REC-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`);
  const [items,     setItems]     = useState([]);

  const [scanned, setScanned] = useState('');
  const [qty,     setQty]     = useState('');
  const [lote,    setLote]    = useState('');
  const [validade, setValidade] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageType, setDamageType] = useState('');

  const [errorMsg,      setErrorMsg]      = useState('');
  const [lastConfirmed, setLastConfirmed] = useState(null);

  const [pendingItemIndex, setPendingItemIndex] = useState(null);
  const [pendingQty,       setPendingQty]       = useState(0);
  const [showSupervisor,   setShowSupervisor]   = useState(false);
  const [showFinalizar,    setShowFinalizar]     = useState(false);
  const [divergencia,      setDivergencia]       = useState('');

  const { queue: toasts, push: pushToast } = useToastQueue();
  const inputRef = useRef(null);

  const nfeOptions = useMemo(() => MOCK_NFE, []);

  // Progresso baseado em unidades, não em itens
  const { totalUnidades, conferidas } = useMemo(() => ({
    totalUnidades: items.reduce((s, i) => s + i.qtdNF, 0),
    conferidas:    items.reduce((s, i) => s + Math.min(i.qtdConferida, i.qtdNF), 0),
  }), [items]);
  const pct = totalUnidades > 0 ? Math.round((conferidas / totalUnidades) * 100) : 0;
  const divergentes = items.filter(i => i.status === 'Divergente');

  useEffect(() => {
    if (isStarted && inputRef.current) inputRef.current.focus();
  }, [isStarted]);

  const handleStart = () => {
    if (!nfe) return;
    const nfeObj = nfeOptions.find(n => n.id === nfe);
    setItems(buildItemState(nfeObj?.items ?? []));
    setIsStarted(true);
  };

  const resetPanel = () => {
    setScanned(''); setQty(''); setLote(''); setValidade('');
    setIsDamaged(false); setDamageType('');
    setErrorMsg(''); setLastConfirmed(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const performUpdate = useCallback((index, newQty) => {
    setItems(prev => {
      const arr = [...prev];
      const item = arr[index];
      const total = item.qtdConferida + newQty;
      arr[index] = {
        ...item,
        qtdConferida: total,
        lote:    lote    || item.lote,
        validade: validade || item.validade,
        status: total === item.qtdNF ? 'Concluído' : total > item.qtdNF ? 'Divergente' : 'Pendente',
        avaria: isDamaged ? (damageType || 'Avaria não especificada') : item.avaria,
      };
      setLastConfirmed({ sku: item.ean, produto: item.produto, qty: newQty, status: arr[index].status });
      setTimeout(() => setLastConfirmed(null), 5000);
      return arr;
    });
    resetPanel();
  }, [lote, validade, isDamaged, damageType]);

  const handleConfirmItem = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!scanned.trim()) { setErrorMsg('Bipe ou digite o código EAN completo do produto.'); return; }

    const qtyVal = safeInt(qty.trim(), -1);
    if (qtyVal <= 0) { setErrorMsg('Quantidade inválida — informe um número inteiro maior que zero.'); return; }

    // Validação de validade: se preenchida, não pode ser passada
    if (validade && validade < todayISO()) {
      setErrorMsg('Validade inválida — produto já vencido na data de entrada.'); return;
    }

    // Busca EXATA por EAN (não parcial — evita falso positivo)
    const idx = items.findIndex(i => i.ean === scanned.trim() || i.id === scanned.trim());
    if (idx === -1) {
      setErrorMsg(`Produto "${scanned}" não encontrado nesta NF-e. Verifique o código completo.`); return;
    }

    const item = items[idx];
    const total = item.qtdConferida + qtyVal;

    if (total !== item.qtdNF) {
      // Divergência → exige supervisor
      setPendingItemIndex(idx);
      setPendingQty(qtyVal);
      setDivergencia(`${item.produto}: esperado ${item.qtdNF}, acumulado será ${total} (${total > item.qtdNF ? '+' : ''}${total - item.qtdNF})`);
      setShowSupervisor(true);
    } else {
      performUpdate(idx, qtyVal);
    }
  };

  const handleSupervisorApprove = (supervisorLogin) => {
    setShowSupervisor(false);
    if (pendingItemIndex !== null) {
      performUpdate(pendingItemIndex, pendingQty);
      pushToast(`Divergência autorizada por ${supervisorLogin}`, 'ok');
    }
    setPendingItemIndex(null); setPendingQty(0);
  };

  const handlePrint = () => window.print();

  const handleFinalizarClick = () => {
    if (!isStarted) return;
    setShowFinalizar(true);
  };

  const handleFinalizarConfirm = () => {
    setShowFinalizar(false);
    pushToast(`Conferência ${nfe} finalizada. OR movida para Aguardando Alocação.`, 'ok');
    setIsStarted(false);
    setNfe(''); setItems([]);
    resetPanel();
  };

  return (
    <div className="space-y-6 pb-24">
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}.shake{animation:shake 0.4s ease}`}</style>

      {/* Toasts */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 border-2',
            t.type === 'erro' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
          )}>
            {t.type === 'erro' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight border-l-4 border-amber-400 pl-4">2.5 Conferir Recebimento</h1>
          <p className="text-sm text-slate-500">Conferência física via leitor de código de barras</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ID Operação</span>
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-white">{recId}</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={nfe} onChange={e => setNfe(e.target.value)} disabled={isStarted}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-400/30 transition-all disabled:opacity-50 min-w-[240px]">
              <option value="">Selecione a NF-e…</option>
              {nfeOptions.map(n => <option key={n.id} value={n.id}>{n.id} — {n.desc}</option>)}
            </select>
            <button onClick={handleStart} disabled={isStarted || !nfe}
              className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg bg-amber-400 text-slate-900 hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale">
              Iniciar
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso por unidades */}
      {isStarted && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-xs font-bold">
              <span className="text-slate-500">Unidades: <strong className="text-slate-800 dark:text-white">{conferidas}/{totalUnidades}</strong></span>
              <span className="text-slate-500">Itens concluídos: <strong className="text-slate-800 dark:text-white">{items.filter(i => i.status === 'Concluído').length}/{items.length}</strong></span>
              {divergentes.length > 0 && <span className="text-red-600 font-black">⚠️ {divergentes.length} divergente(s)</span>}
            </div>
            <span className="text-sm font-black text-amber-500">{pct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', divergentes.length > 0 ? 'bg-red-500' : 'bg-amber-400')}
              style={{ width: pct + '%' }} />
          </div>
        </div>
      )}

      {/* Painel de operação */}
      <div className={cn('bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm transition-all duration-300',
        !isStarted && 'opacity-50 pointer-events-none grayscale')}>
        <div className="space-y-4">
          {/* EAN */}
          <div className="relative">
            <PackageSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input ref={inputRef} value={scanned} onChange={e => setScanned(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmItem(e)}
              placeholder="Bipe o EAN completo do produto…" autoComplete="new-password"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-2xl pl-14 pr-6 py-5 text-2xl font-black outline-none transition-all placeholder:text-slate-300" />
          </div>

          {errorMsg && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}
            </div>
          )}

          {lastConfirmed && (
            <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-green-700">✅ {lastConfirmed.qty}x {lastConfirmed.sku}</p>
                <p className="text-[10px] text-green-600">{lastConfirmed.produto}</p>
              </div>
              <span className={cn('ml-auto text-[10px] font-black px-2 py-1 rounded-full',
                lastConfirmed.status === 'Concluído' ? 'bg-green-200 text-green-800' :
                lastConfirmed.status === 'Divergente' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              )}>{lastConfirmed.status}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quantidade</label>
              <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmItem(e)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-amber-400 transition-all" />
            </div>
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lote</label>
              <input value={lote} onChange={e => setLote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-amber-400 transition-all" />
            </div>
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Validade</label>
              <input type="date" value={validade} min={todayISO()} onChange={e => setValidade(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-amber-400 transition-all" />
            </div>
            <div className="lg:col-span-3 flex items-center justify-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <span className={cn('text-xs font-bold uppercase', isDamaged ? 'text-red-500' : 'text-slate-400')}>Avaria?</span>
                <div onClick={() => setIsDamaged(v => !v)}
                  className={cn('w-12 h-6 rounded-full relative transition-all', isDamaged ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700')}>
                  <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all', isDamaged ? 'translate-x-7' : 'translate-x-1')} />
                </div>
              </label>
            </div>
            {isDamaged && (
              <div className="lg:col-span-12">
                <select value={damageType} onChange={e => setDamageType(e.target.value)}
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-700 outline-none">
                  <option value="">Tipo de avaria…</option>
                  <option>Embalagem Danificada</option>
                  <option>Produto Quebrado</option>
                  <option>Produto Molhado</option>
                  <option>Validade Vencida</option>
                </select>
              </div>
            )}
            <div className="lg:col-span-12 flex gap-3">
              <button onClick={handleConfirmItem}
                className="flex-1 bg-amber-400 text-slate-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2 active:scale-95">
                <CheckCircle2 className="w-5 h-5" /> Confirmar Conferência
              </button>
              <button onClick={handlePrint} title="Imprimir conferência"
                className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 p-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de itens */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Itens da Nota Fiscal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">NF-e (un.)</th>
                <th className="px-6 py-4 text-center">Bipado</th>
                <th className="px-6 py-4 text-center">Dif.</th>
                <th className="px-6 py-4">Lote / Validade</th>
                <th className="px-6 py-4 text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400 font-medium">
                  Inicie uma conferência selecionando a NF-e.
                </td></tr>
              )}
              {items.map(item => {
                const dif = item.qtdConferida - item.qtdNF;
                const isDivergent = item.status === 'Divergente';
                return (
                  <tr key={item.id} className={cn('group transition-colors', isDivergent && 'bg-red-50 dark:bg-red-950/10')}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.produto}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono">{item.ean}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{item.qtdNF}</td>
                    <td className="px-6 py-4 text-center text-sm font-black text-slate-900 dark:text-white">{item.qtdConferida}</td>
                    <td className={cn('px-6 py-4 text-center text-xs font-black',
                      dif === 0 ? 'text-slate-300' : dif > 0 ? 'text-amber-500' : 'text-red-500')}>
                      {dif > 0 ? `+${dif}` : dif}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{item.lote} / {item.validade}</td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex flex-col items-end gap-1">
                        {isDivergent && (
                          <span className="text-[9px] font-black text-red-600 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Divergente — aprovação registrada
                          </span>
                        )}
                        <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                          item.status === 'Concluído'  ? 'bg-green-100 border-green-200 text-green-700' :
                          item.status === 'Divergente' ? 'bg-red-100 border-red-200 text-red-700' :
                          'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400'
                        )}>{item.status}</span>
                        {item.avaria && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-100 border border-orange-200 text-orange-600">
                            ⚠️ {item.avaria}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-8 flex justify-end z-40">
        <button disabled={!isStarted} onClick={handleFinalizarClick}
          className="bg-amber-400 text-slate-900 px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-500 transition-all disabled:opacity-50 disabled:grayscale active:scale-95">
          Finalizar Carga
        </button>
      </div>

      {/* Modais */}
      {showSupervisor && (
        <ModalSupervisor
          divergencia={divergencia}
          onApprove={handleSupervisorApprove}
          onCancel={() => { setShowSupervisor(false); setPendingItemIndex(null); setPendingQty(0); }} />
      )}
      {showFinalizar && (
        <ModalFinalizar nfe={nfe} items={items} onConfirm={handleFinalizarConfirm} onCancel={() => setShowFinalizar(false)} />
      )}
    </div>
  );
}
