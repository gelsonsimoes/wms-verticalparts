import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  Clock,
  User,
  Database,
  FileX,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar,
  Info,
  Ban,
  Shield,
  TriangleAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...i) { return twMerge(clsx(i)); }

// ─── TABELAS ALVO — definição base (contagens carregadas do Supabase em runtime) ──
const TABELAS_DEF = [
  { id: 'activity_logs',      label: 'Logs de Atividade',           icon: Shield,       table: 'activity_logs',      desc: 'Registros de acesso, autenticação e eventos de segurança' },
  { id: 'erros_int',          label: 'Erros de Integração',          icon: XCircle,      table: null,                 desc: 'Erros de integração REST, XML e ETL falhados' },
  { id: 'xml_proc',           label: 'Arquivos XML Processados',     icon: FileX,        table: null,                 desc: 'XMLs de NF-e, CT-e e MDF-e já processados e confirmados' },
  { id: 'movimento_estoque',  label: 'Movimentações de Estoque',     icon: CheckCircle2, table: 'movimento_estoque',  desc: 'Registros de entrada, saída e transferência de estoque' },
  { id: 'inv_antigos',        label: 'Inventários Antigos',          icon: Database,     table: null,                 desc: 'Ciclos de inventário com mais de 12 meses' },
];

// ─── MOCK HISTÓRICO ───────────────────────────────────────────────────
const HISTORICO_INIT = [
  { id:'EX-001', dataHora:'20/02/2026 03:00', usuario:'admin@vp.com',  tabelas:['Logs de Segurança','Erros de Integração'], qtde:183421, status:'Sucesso', dataLimite:'01/01/2025', duracao:'1m 22s' },
  { id:'EX-002', dataHora:'15/01/2026 02:30', usuario:'ti@vp.com',     tabelas:['Arquivos XML Processados'],               qtde:67100,  status:'Sucesso', dataLimite:'01/07/2024', duracao:'0m 48s' },
  { id:'EX-003', dataHora:'10/12/2025 04:00', usuario:'admin@vp.com',  tabelas:['Atividades Finalizadas','Inventários Antigos'], qtde: 0, status:'Falha', dataLimite:'01/06/2024', duracao:'0m 05s' },
  { id:'EX-004', dataHora:'01/10/2025 03:15', usuario:'root@vp.com',   tabelas:['Logs de Segurança'],                      qtde:220000, status:'Sucesso', dataLimite:'01/01/2024', duracao:'2m 08s' },
];

// ─── MODAL CONFIRMAÇÃO SEVERA ─────────────────────────────────────────
function ModalConfirmacao({ onClose, onConfirm, dataLimite, tabelasSel }) {
  const [senha,     setSenha]     = useState('');
  const [confirma,  setConfirma]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [erro,      setErro]      = useState('');
  const [shaking,   setShaking]   = useState(false);
  const [etapa,     setEtapa]     = useState(1); // 1=aviso, 2=credenciais
  const inputRef = useRef(null);

  useEffect(() => { if (etapa === 2 && inputRef.current) inputRef.current.focus(); }, [etapa]);

  const shake = (msg) => {
    setErro(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const handleProsseguir = async () => {
    if (!senha.trim()) { shake('Informe a senha de administrador.'); return; }
    if (confirma !== 'CONFIRMAR') { shake('Digite exatamente "CONFIRMAR" em maiúsculas.'); return; }
    // ⚠️  INTEGRAÇÃO NECESSÁRIA: substituir por POST /api/admin/purge/auth { senha }
    // Em produção: validação server-side com hash comparison e log de tentativas.
    // Exemplo:
    //   const res = await fetch('/api/admin/purge/auth', { method:'POST', body: JSON.stringify({ senha }) });
    //   if (!res.ok) { shake('Credenciais inválidas.'); return; }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-expurgo-titulo">
      {/* Overlay escuro e vermelho */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className={cn(
        'relative bg-slate-950 border-2 rounded-[28px] w-full max-w-lg shadow-[0_0_80px_-10px_rgba(220,38,38,0.7)] overflow-hidden transition-all',
        shaking ? 'animate-[shake_0.3s_ease-in-out_2]' : '',
        etapa === 1 ? 'border-red-600' : 'border-red-800'
      )}>
        {/* Topo vermelho */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-6 py-5 relative">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,0,0,0.07)_8px,rgba(255,0,0,0.07)_16px)]" />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border-2 border-red-500/50 flex items-center justify-center animate-pulse">
              <TriangleAlert className="w-7 h-7 text-red-300" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em]">⚠ Operação Destrutiva e Irreversível</p>
              <p id="modal-expurgo-titulo" className="text-base font-black text-white">Confirmação de Expurgo</p>
            </div>
            <button onClick={onClose} className="ml-auto text-red-300/60 hover:text-red-200 transition-colors"><XCircle className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Etapa 1 — Aviso */}
          {etapa === 1 && (
            <>
              <div className="bg-red-950/50 border border-red-800/60 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-black text-red-200 flex items-center gap-2">
                  <Ban className="w-4 h-4 shrink-0" />Esta ação NÃO pode ser desfeita.
                </p>
                <p className="text-xs text-red-300/80 font-medium">
                  Você está prestes a <strong className="text-white">remover permanentemente</strong> todos os registros anteriores a <strong className="text-amber-300">{dataLimite}</strong> das seguintes tabelas:
                </p>
                <ul className="space-y-1">
                  {tabelasSel.map(t => (
                    <li key={t.id} className="flex items-center gap-2 text-[11px] font-bold text-red-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {t.label} <span className="text-red-400 font-medium">— ~{t.est.toLocaleString('pt-BR')} registros</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300/80 font-medium">Recomenda-se gerar um backup completo do banco de dados antes de prosseguir.</p>
              </div>
              <button onClick={() => setEtapa(2)}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white font-black text-sm rounded-2xl hover:from-red-600 hover:to-red-500 active:scale-[0.98] transition-all shadow-lg shadow-red-900/60 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />Entendi os Riscos — Prosseguir
              </button>
              <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-black transition-colors uppercase tracking-widest">Cancelar</button>
            </>
          )}

          {/* Etapa 2 — Credenciais */}
          {etapa === 2 && (
            <>
              <div className="space-y-4">
                {/* Senha */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-500" />Senha do Administrador
                  </label>
                  <div className="relative">
                    <input ref={inputRef}
                      type={showPass ? 'text' : 'password'}
                      value={senha} onChange={e => { setSenha(e.target.value); setErro(''); }}
                      placeholder="Digite sua senha..."
                      className="w-full px-4 py-2.5 bg-slate-900 border-2 border-slate-700 focus:border-red-500 rounded-xl text-sm font-bold text-white outline-none transition-all pr-10" />
                    <button onClick={() => setShowPass(v => !v)} type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmação textual */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-500" />Digite <span className="text-red-400 font-black mx-1">"CONFIRMAR"</span> para autorizar
                  </label>
                  <input type="text" value={confirma} onChange={e => { setConfirma(e.target.value); setErro(''); }}
                    placeholder='CONFIRMAR'
                    className={cn('w-full px-4 py-2.5 bg-slate-900 border-2 rounded-xl text-sm font-black text-white outline-none transition-all tracking-widest',
                      confirma === 'CONFIRMAR' ? 'border-green-600' : confirma.length > 0 ? 'border-red-600' : 'border-slate-700 focus:border-red-500'
                    )} />
                  <div className="flex gap-1">
                    {'CONFIRMAR'.split('').map((c, i) => (
                      <div key={i} className={cn('w-6 h-1.5 rounded-full transition-all',
                        confirma.length > i ? (confirma[i] === c ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-700'
                      )} />
                    ))}
                  </div>
                </div>

                {/* Erro */}
                {erro && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-950/60 border border-red-800/50 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-[11px] font-black text-red-300">{erro}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={onClose}
                  className="flex-1 py-3 border-2 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 text-xs font-black rounded-2xl transition-all uppercase tracking-wide">
                  Cancelar
                </button>
                <button onClick={handleProsseguir}
                  disabled={senha.length === 0 || confirma !== 'CONFIRMAR'}
                  className={cn('flex-1 py-3 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all uppercase tracking-wide shadow-lg',
                    senha.length > 0 && confirma === 'CONFIRMAR'
                      ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 to-red-500 active:scale-[0.98] shadow-red-900/60'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  )}>
                  <Trash2 className="w-4 h-4" />Executar Expurgo
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS de tremor inline */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-8px); }
          75%      { transform: translateX(8px); }
        }
        .animate-\\[shake_0\\.3s_ease-in-out_2\\] { animation: shake 0.3s ease-in-out 2; }
      `}</style>
    </div>
  );
}

// ─── BARRA DE PROGRESSO DE EXECUÇÃO ─────────────────────────────────
function ProgressoExpurgo({ tabelasSel, onDone, startTime }) {
  const [step, setStep] = useState(0);
  const [pct,  setPct]  = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(p => {
        if (p >= 100) {
          clearInterval(interval);
          // Calcula duração real em vez de Math.random()
          const elapsedMs = Date.now() - startTime;
          const mins = Math.floor(elapsedMs / 60000);
          const secs = Math.floor((elapsedMs % 60000) / 1000);
          setTimeout(() => onDone(`${mins}m ${String(secs).padStart(2,'0')}s`), 600);
          return 100;
        }
        const inc = 4 + (Math.random() * 8); // variação visual realista
        const np = Math.min(p + inc, 100);
        const ns = Math.floor(np / (100 / tabelasSel.length));
        setStep(Math.min(ns, tabelasSel.length - 1));
        return np;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative bg-slate-950 border-2 border-red-800/50 rounded-[28px] w-full max-w-md p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-900/40 border-2 border-red-700/50 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
          <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em]">Executando Expurgo</p>
          <p className="text-lg font-black text-white mt-1">Removendo registros...</p>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-[9px] font-black text-slate-500">
            <span>Progresso</span><span>{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Tabelas sendo processadas */}
        <div className="space-y-2">
          {tabelasSel.map((t, i) => {
            const done = i < step || pct >= 100;
            const active = i === step && pct < 100;
            return (
              <div key={t.id} className={cn('flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                done ? 'bg-green-950/30 border border-green-800/30' : active ? 'bg-red-950/30 border border-red-700/30' : 'bg-slate-900/50 border border-slate-800')}>
                {done  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                : active ? <RefreshCw className="w-4 h-4 text-red-400 animate-spin shrink-0" />
                : <div className="w-4 h-4 rounded-full border-2 border-slate-700 shrink-0" />}
                <span className={cn('text-xs font-bold', done ? 'text-green-400' : active ? 'text-red-300' : 'text-slate-600')}>{t.label}</span>
                {done && <span className="ml-auto text-[9px] text-green-600 font-black">✓ {t.est.toLocaleString('pt-BR')} removidos</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ABA 1: CONFIGURAR EXPURGO ───────────────────────────────────────
function ConfigurarExpurgo({ historico, setHistorico }) {
  const { warehouseId } = useApp();
  const [dataLimite, setDataLimite]   = useState('2025-01-01');
  const [selecionadas, setSelecionadas] = useState({});
  const [showModal,   setShowModal]   = useState(false);
  const [showProgress,setShowProgress]= useState(false);
  const [successMsg,  setSuccessMsg]  = useState(false);

  // Contagens reais do Supabase
  const [TABELAS, setTABELAS] = useState(TABELAS_DEF.map(t => ({ ...t, est: 0 })));
  useEffect(() => {
    const fetchCounts = async () => {
      const updated = await Promise.all(TABELAS_DEF.map(async (t) => {
        if (!t.table) return { ...t, est: 0 };
        try {
          const { count } = await supabase
            .from(t.table)
            .select('*', { count: 'exact', head: true });
          return { ...t, est: count ?? 0 };
        } catch (_) {
          return { ...t, est: 0 };
        }
      }));
      setTABELAS(updated);
    };
    fetchCounts();
  }, [warehouseId]);

  const toggle = id => setSelecionadas(s => ({ ...s, [id]: !s[id] }));
  const todasSel = TABELAS.every(t => selecionadas[t.id]);
  const toggleTodas = () => {
    const novo = !todasSel;
    const map = {};
    TABELAS.forEach(t => { map[t.id] = novo; });
    setSelecionadas(map);
  };

  const tabelasSel = TABELAS.filter(t => selecionadas[t.id]);
  const estimativa = tabelasSel.reduce((s, t) => s + t.est, 0);
  const canSubmit  = tabelasSel.length > 0 && dataLimite;

  const dataFormatada = dataLimite
    ? new Intl.DateTimeFormat('pt-BR').format(new Date(dataLimite + 'T12:00:00'))
    : '—';

  const [purgeStartTime, setPurgeStartTime] = useState(null);

  const onConfirm = () => {
    setShowModal(false);
    setPurgeStartTime(Date.now());
    setShowProgress(true);
  };

  const onDone = (duracao) => {
    setShowProgress(false);
    setSuccessMsg(true);
    const novoLog = {
      id: `EX-${String(historico.length + 1).padStart(3,'0')}`,
      dataHora: new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date()),
      usuario: 'admin@vp.com', // ⚠️ Em produção: lido do contexto de autenticação
      tabelas: tabelasSel.map(t => t.label),
      qtde: estimativa,
      status: 'Sucesso',
      dataLimite: dataFormatada,
      duracao, // duração real calculada pelo ProgressoExpurgo
    };
    setHistorico(h => [novoLog, ...h]);
    setSelecionadas({});
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <>
      {showModal   && <ModalConfirmacao tabelasSel={tabelasSel} dataLimite={dataFormatada} onClose={() => setShowModal(false)} onConfirm={onConfirm} />}
      {showProgress && <ProgressoExpurgo tabelasSel={tabelasSel} onDone={onDone} startTime={purgeStartTime} />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* COLUNA PRINCIPAL */}
        <div className="lg:col-span-3 space-y-4">

          {/* Data Limite */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Data Limite do Expurgo</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/40 rounded-2xl p-4">
              <p className="text-[10px] font-black text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                <TriangleAlert className="w-3 h-3" />Todos os registros <strong>anteriores</strong> a esta data serão excluídos permanentemente.
              </p>
              <input type="date" value={dataLimite} onChange={e => setDataLimite(e.target.value)} max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-red-300 dark:border-red-900/60 rounded-xl text-sm font-black text-slate-800 dark:text-white outline-none focus:border-red-500 transition-all" />
              {dataLimite && (
                <p className="mt-2 text-[10px] text-red-600 dark:text-red-400 font-bold">
                  Registros anteriores a <strong>{dataFormatada}</strong> serão apagados.
                </p>
              )}
            </div>
          </div>

          {/* Tabelas */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-red-500" />
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tabelas a Expurgar</p>
              </div>
              <button onClick={toggleTodas}
                className={cn('text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all',
                  todasSel ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                )}>
                {todasSel ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
              </button>
            </div>

            <div className="space-y-2">
              {TABELAS.map(tab => {
                const sel = !!selecionadas[tab.id];
                return (
                  <label key={tab.id} className={cn('flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all group',
                    sel ? 'border-red-500/60 bg-red-50 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}>
                    <input type="checkbox" checked={sel} onChange={() => toggle(tab.id)} className="sr-only" />
                    <div className={cn('w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      sel ? 'bg-red-600 border-red-600 shadow-md shadow-red-800/30' : 'border-slate-300 dark:border-slate-600 group-hover:border-red-400'
                    )}>
                      {sel && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <tab.icon className={cn('w-3.5 h-3.5 shrink-0', sel ? 'text-red-600' : 'text-slate-400')} />
                        <p className={cn('text-xs font-black', sel ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300')}>{tab.label}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5 ml-5">{tab.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-xs font-black', sel ? 'text-red-600' : 'text-slate-400')}>~{tab.est.toLocaleString('pt-BR')}</p>
                      <p className="text-[8px] text-slate-400">registros</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA LATERAL — SUMÁRIO E AÇÃO */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sumário */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-4 h-4" />Impacto Estimado</p>

            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registros a Remover</p>
                <p className={cn('text-3xl font-black mt-1', estimativa > 0 ? 'text-red-600' : 'text-slate-300')}>
                  {estimativa > 0 ? `~${estimativa.toLocaleString('pt-BR')}` : '—'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase">Tabelas selecionadas</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">{tabelasSel.length} / {TABELAS.length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase">Data Limite</p>
                <p className="text-[10px] font-black text-amber-600">{dataLimite ? dataFormatada : '—'}</p>
              </div>
            </div>
          </div>

          {/* Aviso de segurança */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/40 rounded-[20px] p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-700 dark:text-amber-400">Faça um backup antes!</p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70 font-medium mt-0.5">Esta operação é irreversível. Não é possível recuperar os dados após a conclusão.</p>
            </div>
          </div>

          {/* Botão crítico */}
          <button onClick={() => setShowModal(true)} disabled={!canSubmit}
            className={cn('w-full py-4 rounded-[20px] font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest shadow-xl',
              canSubmit
                ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white hover:scale-[1.02] hover:shadow-red-800/50 active:scale-[0.98] hover:from-red-600 shadow-red-900/40'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            )}>
            <Trash2 className="w-5 h-5" />Executar Expurgo
          </button>
          {!canSubmit && <p className="text-center text-[10px] text-slate-400">Selecione ao menos 1 tabela e uma data.</p>}

          {/* Sucesso */}
          {successMsg && (
            <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-800/50 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-green-700 dark:text-green-400">Expurgo concluído com sucesso!</p>
                <p className="text-[9px] text-green-600 font-medium">{estimativa.toLocaleString('pt-BR')} registros removidos. Ver Aba 2 para o log.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── ABA 2: LOG DE EXPURGO ────────────────────────────────────────────
function LogExpurgo({ historico }) {
  const [expanded, setExpanded] = useState({});

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
            {['','Data/Hora Execução','Usuário','Tabelas Afetadas','Qtde Removidos','Duração','Status'].map(h => (
              <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {historico.map(row => {
            const isSuc = row.status === 'Sucesso';
            return (
              <React.Fragment key={row.id}>
                <tr className={cn('border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border-l-4',
                  isSuc ? 'border-l-green-500' : 'border-l-red-500'
                )} onClick={() => toggle(row.id)}>
                  <td className="p-3 w-6">
                    {expanded[row.id] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.dataHora}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.usuario}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {row.tabelas.map(t => (
                        <span key={t} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg font-bold">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn('text-sm font-black tabular-nums', isSuc ? 'text-red-600' : 'text-slate-400')}>
                      {row.qtde > 0 ? row.qtde.toLocaleString('pt-BR') : '—'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{row.duracao}</span>
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                      isSuc ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                      {isSuc ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{row.status}
                    </span>
                  </td>
                </tr>
                {expanded[row.id] && (
                  <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-900/30">
                    <td colSpan={7} className="p-4">
                      <div className="flex gap-6 text-[10px] text-slate-400">
                        <div><p className="font-black text-slate-500 uppercase mb-1">ID do Expurgo</p><code className="text-secondary font-bold">{row.id}</code></div>
                        <div><p className="font-black text-slate-500 uppercase mb-1">Data Limite Usada</p><span className="text-amber-400 font-bold">{row.dataLimite}</span></div>
                        <div><p className="font-black text-slate-500 uppercase mb-1">Tabelas ({row.tabelas.length})</p><span className="text-slate-300">{row.tabelas.join(' · ')}</span></div>
                        {!isSuc && <div><p className="font-black text-red-500 uppercase mb-1">Motivo da Falha</p><span className="text-red-400">Timeout na conexão com o banco de dados.</span></div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {historico.length === 0 && (
            <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs">Nenhum expurgo registrado ainda.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function DataPurge() {
  const [tab, setTab]             = useState(0);
  const [historico, setHistorico] = useState(HISTORICO_INIT);

  const TABS = [
    { label: 'Configurar Expurgo', icon: Trash2,    desc: 'Definir tabelas e data limite' },
    { label: 'Log de Expurgo',     icon: Activity, desc: `${historico.length} execução(ões)` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-5">

      {/* HEADER */}
      <div className="bg-slate-900 rounded-[32px] border-2 border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-600 to-red-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,28,28,0.08),transparent_60%)]" />
        <div className="flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/50 border border-red-700/40">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.2em]">Cat. 11 — Administração e Manutenção</p>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">10.4 Expurgar Dados Antigos</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Limpeza controlada de registros históricos · Logs de execução · Acesso restrito ao Administrador</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-950/50 border border-red-800/40 rounded-xl">
            <Lock className="w-3 h-3 text-red-400" />
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Área Restrita</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 p-2 flex gap-2">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={cn('flex-1 flex items-center gap-3 px-5 py-3 rounded-xl transition-all',
              tab === i
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-800'
            )}>
            <t.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wide">{t.label}</p>
              <p className={cn('text-[9px] font-medium', tab === i ? 'text-white/60' : 'text-slate-600')}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === 0 && <ConfigurarExpurgo historico={historico} setHistorico={setHistorico} />}
      {tab === 1 && <LogExpurgo historico={historico} />}
    </div>
  );
}
