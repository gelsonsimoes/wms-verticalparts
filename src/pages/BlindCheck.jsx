import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  ScanBarcode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  X,
  Plus,
  Minus,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  User,
  SkipForward,
  Package,
  Hash,
  BarChart3,
  Zap,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── DADOS MOCK ───────────────────────────────────────────────────────
const STATUS_COLOR = {
  'Pendente':        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'Em Conferência':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Divergente':      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Finalizado':      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const STATUS_OPTS = ['Todos', 'Pendente', 'Em Conferência', 'Divergente', 'Finalizado'];

// Itens de uma OR (a Qt esperada está OCULTA para o conferente)
const makeItens = (ordemId) => [
  { id:`${ordemId}-I1`, barcode:'VEPEL-BPI-174FX', descricao:'Barreira de Proteção Infravermelha',    qtEsperada: 4, qtContada: 0 },
  { id:`${ordemId}-I2`, barcode:'VEPEL-BTI-JX02-CCS', descricao:'Botoeira de Inspeção - Mod. JX02',   qtEsperada: 2, qtContada: 0 },
  { id:`${ordemId}-I3`, barcode:'VPER-LUM-LED-VRD-24V', descricao:'Luminária em LED Verde 24V', qtEsperada: 6, qtContada: 0 },
];

const ORDENS_INIT = [
  { id:'OR001', ordemId:'ORD-001', nf:'NF-45123', depositante:'VerticalParts Matriz',    status:'Pendente',       itens: makeItens('OR001') },
  { id:'OR002', ordemId:'ORD-002', nf:'NF-45124', depositante:'Elevadores Atlas Schindler', status:'Em Conferência', itens: makeItens('OR002') },
  { id:'OR003', ordemId:'ORD-003', nf:'NF-45125', depositante:'Thyssenkrupp Elevadores',         status:'Divergente',     itens:[
    { id:'OR003-I1', barcode:'VEPEL-BPI-174FX', descricao:'Barreira de Proteção Infravermelha',  qtEsperada: 3, qtContada: 2 },
    { id:'OR003-I2', barcode:'VPER-PNT-AL-22D-202X145-CT', descricao:'Pente de Alumínio - 22 Dentes',  qtEsperada: 1, qtContada: 1 },
  ]},
  { id:'OR004', ordemId:'ORD-004', nf:'NF-45126', depositante:'Otis Elevadores',    status:'Finalizado',     itens:[
    { id:'OR004-I1', barcode:'VPER-INC-ESQ', descricao:'InnerCap (Esquerdo)', qtEsperada: 8, qtContada: 8 },
  ]},
];

const SUPERVISOR_CREDS = [
  { usuario:'supervisor.jose', senha:'1234' },
  { usuario:'danilo.supervisor', senha:'9999' },
];

// ─── MODAL SUPERVISOR ─────────────────────────────────────────────────
function ModalSupervisor({ onClose, onOk }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [shake, setShake]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      const ok = SUPERVISOR_CREDS.some(c => c.usuario === usuario.trim() && c.senha === senha.trim());
      if (ok) { onOk(); } else {
        setErro('Credenciais inválidas. Acesso negado.');
        setShake(true); setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-slate-900 rounded-[24px] border-2 border-red-400/40 w-full max-w-sm shadow-2xl overflow-hidden', shake && 'animate-bounce')}>
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">Liberar com Divergência</p>
              <p className="text-[10px] text-red-500 font-bold">Autorização de Supervisor obrigatória</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 rounded-2xl px-4 py-3 text-[10px] text-red-700 dark:text-red-400 font-medium">
            Esta ação aceita a <strong>falta ou sobra de peças</strong> em relação à Nota Fiscal. 
            O registro de divergência será mantido no histórico do sistema.
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={usuario} onChange={e => { setUsuario(e.target.value); setErro(''); }}
                placeholder="Usuário supervisor"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl text-sm outline-none transition-all" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={senha} onChange={e => { setSenha(e.target.value); setErro(''); }}
                placeholder="Senha"
                onKeyDown={e => e.key === 'Enter' && handleOk()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl text-sm outline-none transition-all" />
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/30">
              <XCircle className="w-4 h-4 shrink-0" />{erro}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
            <button onClick={handleOk} disabled={!usuario || !senha || loading}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40">
              {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Verificando</> : <><ShieldCheck className="w-3.5 h-3.5" />Autorizar</>}
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400">Dica: supervisor.jose / 1234</p>
        </div>
      </div>
    </div>
  );
}

// ─── BARRA DE PROGRESSO ───────────────────────────────────────────────
function ProgressBar({ itens }) {
  const totalEsp  = itens.reduce((a, i) => a + i.qtEsperada, 0);
  const totalCont = itens.reduce((a, i) => a + i.qtContada, 0);
  const pct       = totalEsp === 0 ? 0 : Math.min(100, Math.round((totalCont / totalEsp) * 100));
  const divergente = totalCont > 0 && itens.some(i => i.qtContada !== i.qtEsperada);

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500',
            pct === 100 && !divergente ? 'bg-green-500' : divergente ? 'bg-red-500' : 'bg-secondary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-[10px] font-black w-8 text-right',
        pct === 100 && !divergente ? 'text-green-600' : divergente ? 'text-red-600' : 'text-secondary'
      )}>{pct}%</span>
    </div>
  );
}

// ─── MODAL OPERACIONAL (Conferência) ─────────────────────────────────
function ModalConferencia({ ordem, onClose, onSave }) {
  const barcodeRef = useRef(null);
  const [itens, setItens]           = useState(JSON.parse(JSON.stringify(ordem.itens)));
  const [barcode, setBarcode]       = useState('');
  const [qtInput, setQtInput]       = useState(1);
  const [flash, setFlash]           = useState(null); // 'ok' | 'erro' | 'skip'
  const [log, setLog]               = useState([]);
  const [showDivModal, setShowDivModal] = useState(false);
  const [fase, setFase]             = useState('conferindo'); // 'conferindo' | 'divergente' | 'ok'

  // Foco automático no campo de barcode quando abre
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  const totalEsp  = itens.reduce((a, i) => a + i.qtEsperada, 0);
  const totalCont = itens.reduce((a, i) => a + i.qtContada, 0);
  const pct       = totalEsp === 0 ? 0 : Math.min(100, Math.round((totalCont / totalEsp) * 100));

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(() => { setFlash(null); barcodeRef.current?.focus(); }, 900);
  };

  const addLog = (msg, type) => setLog(prev => [{ id: Date.now(), msg, type, ts: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 30));

  // ── Registrar Contagem ──────────────────────────────────────────
  const handleRegistrar = () => {
    const bc = barcode.trim();
    if (!bc) { barcodeRef.current?.focus(); return; }
    const item = itens.find(i => i.barcode === bc);
    if (!item) {
      addLog(`Código ${bc} não encontrado na OR`, 'erro');
      triggerFlash('erro');
      setBarcode('');
      return;
    }
    setItens(prev => prev.map(i =>
      i.id === item.id ? { ...i, qtContada: i.qtContada + qtInput } : i
    ));
    addLog(`+${qtInput}x ${item.descricao} (bc: ${bc})`, 'ok');
    triggerFlash('ok');
    setBarcode('');
    setQtInput(1);
  };

  // ── Ignorar Contagem ────────────────────────────────────────────
  const handleIgnorar = () => {
    addLog(`Leitura ignorada (bc: "${barcode}" ou erro)`, 'skip');
    triggerFlash('skip');
    setBarcode('');
    setQtInput(1);
  };

  // ── Finalizar Conferência ───────────────────────────────────────
  const handleFinalizar = () => {
    const divergente = itens.some(i => i.qtContada !== i.qtEsperada);
    if (divergente) { setFase('divergente'); }
    else            { setFase('ok'); }
  };

  // ── Recontagem ──────────────────────────────────────────────────
  const handleRecontar = () => {
    setItens(prev => prev.map(i => ({ ...i, qtContada: 0 })));
    setLog([]);
    setFase('conferindo');
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  // ── Liberar com Divergência (após supervisor) ───────────────────
  const handleLiberarDivergencia = () => {
    setShowDivModal(false);
    onSave(itens, 'Divergente');
  };

  // ── Salvar OK ───────────────────────────────────────────────────
  const handleSalvarOk = () => onSave(itens, 'Finalizado');

  // Enter no campo de barcode → registrar
  const onBarcodeKey = (e) => { if (e.key === 'Enter') handleRegistrar(); };

  return (
    <>
      {showDivModal && <ModalSupervisor onClose={() => setShowDivModal(false)} onOk={handleLiberarDivergencia} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* PANEL */}
        <div className={cn(
          'relative bg-white dark:bg-slate-900 rounded-[28px] border-2 w-full max-w-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden transition-all duration-300',
          flash === 'ok'   ? 'border-green-400 ring-4 ring-green-400/30' :
          flash === 'erro' ? 'border-red-500   ring-4 ring-red-500/30'   :
          flash === 'skip' ? 'border-amber-400 ring-4 ring-amber-400/30' :
          fase === 'divergente' ? 'border-red-500' :
          fase === 'ok'         ? 'border-green-500' :
          'border-slate-200 dark:border-slate-700'
        )}>
          {/* Barra superior de cor */}
          <div className={cn('h-1.5 w-full shrink-0 transition-all',
            fase === 'divergente' ? 'bg-red-500' :
            fase === 'ok'         ? 'bg-green-500' :
            'bg-gradient-to-r from-secondary via-amber-500 to-secondary'
          )} />

          {/* HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
              fase === 'divergente' ? 'bg-red-100 dark:bg-red-900/30' :
              fase === 'ok'         ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-secondary/10'
            )}>
              {fase === 'divergente' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
               fase === 'ok'         ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
               <ClipboardCheck className="w-5 h-5 text-secondary" />}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white">
                {fase === 'divergente' ? '⚠️ Divergência Encontrada' :
                 fase === 'ok'         ? '✅ Conferência Concluída' :
                 'Conferência Cega'}
              </p>
              <p className="text-[10px] text-slate-400">{ordem.ordemId} · {ordem.nf} · {ordem.depositante}</p>
            </div>
            {/* Progresso header */}
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <p className={cn('text-lg font-black', pct === 100 ? 'text-green-600' : 'text-secondary')}>{pct}%</p>
                <p className="text-[8px] text-slate-400 font-bold">{totalCont}/{totalEsp} itens</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* BARRA PROGRESSO GLOBAL */}
          <div className="px-6 py-2 shrink-0">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-500',
                fase === 'ok' ? 'bg-green-500' : fase === 'divergente' ? 'bg-red-500' : 'bg-secondary'
              )} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* DIVERGÊNCIA — bannner vermelho */}
          {fase === 'divergente' && (
            <div className="mx-6 mb-3 shrink-0 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-red-600 text-white rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-black">DIVERGÊNCIA ENCONTRADA</p>
                  <p className="text-[10px] opacity-90 mt-0.5">A quantidade contada não corresponde à Nota Fiscal. Escolha uma ação:</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleRecontar}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black transition-all border border-white/30">
                      <RefreshCw className="w-3.5 h-3.5" />Habilitar Recontagem
                    </button>
                    <button onClick={() => setShowDivModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-700 rounded-xl text-xs font-black hover:bg-red-50 transition-all shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5" />Liberar com Divergência
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OK — banner verde */}
          {fase === 'ok' && (
            <div className="mx-6 mb-3 shrink-0 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-green-600 text-white rounded-2xl px-5 py-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-black">CONFERÊNCIA SEM DIVERGÊNCIA!</p>
                  <p className="text-[10px] opacity-90">Todos os itens conferem com a Nota Fiscal.</p>
                </div>
                <button onClick={handleSalvarOk}
                  className="flex items-center gap-1.5 px-5 py-2 bg-white text-green-700 rounded-xl text-xs font-black hover:bg-green-50 transition-all shadow-md whitespace-nowrap">
                  <Check className="w-3.5 h-3.5" />Finalizar e Salvar
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex gap-0 min-h-0">
            {/* COLUNA ESQUERDA — Operação */}
            <div className="flex-1 flex flex-col p-5 gap-4 border-r border-slate-100 dark:border-slate-800 overflow-y-auto min-h-0">

              {/* Flash feedback */}
              {flash && (
                <div className={cn('rounded-2xl px-4 py-3 flex items-center gap-2 font-black text-sm animate-in fade-in duration-150',
                  flash === 'ok'   ? 'bg-green-100 text-green-700 dark:bg-green-950/30' :
                  flash === 'erro' ? 'bg-red-100 text-red-700 dark:bg-red-950/30' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                )}>
                  {flash === 'ok'   ? <CheckCircle2 className="w-5 h-5" /> :
                   flash === 'erro' ? <XCircle className="w-5 h-5" /> :
                   <SkipForward className="w-5 h-5" />}
                  {flash === 'ok' ? 'Contagem registrada!' : flash === 'erro' ? 'Código não reconhecido' : 'Leitura ignorada'}
                </div>
              )}

              {/* INPUT BARCODE — destaque principal */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ScanBarcode className="w-3.5 h-3.5" />Código de Barras do Produto (leitor ou teclado)
                </label>
                <div className="relative">
                  <ScanBarcode className="w-5 h-5 text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    ref={barcodeRef}
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={onBarcodeKey}
                    disabled={fase !== 'conferindo'}
                    placeholder="Bipe o produto aqui ou pressione Enter..."
                    className="w-full pl-12 pr-4 py-4 text-lg font-black font-mono tracking-widest bg-slate-50 dark:bg-slate-800 border-2 border-secondary/40 focus:border-secondary rounded-2xl outline-none transition-all disabled:opacity-40"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* QUANTIDADE */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantidade Contada</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQtInput(q => Math.max(1, q - 1))} disabled={fase !== 'conferindo'}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg font-black disabled:opacity-40">−</button>
                  <input type="number" min="1" value={qtInput} onChange={e => setQtInput(Math.max(1, +e.target.value))} disabled={fase !== 'conferindo'}
                    className="w-24 text-center text-2xl font-black py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl outline-none transition-all disabled:opacity-40" />
                  <button onClick={() => setQtInput(q => q + 1)} disabled={fase !== 'conferindo'}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg font-black disabled:opacity-40">+</button>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleRegistrar} disabled={!barcode.trim() || fase !== 'conferindo'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-primary rounded-2xl text-sm font-black hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-40">
                  <CheckCircle2 className="w-4 h-4" />Registrar Contagem
                </button>
                <button onClick={handleIgnorar} disabled={fase !== 'conferindo'}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-2xl text-sm font-black hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-40">
                  <SkipForward className="w-4 h-4" />Ignorar
                </button>
                <button onClick={handleFinalizar} disabled={totalCont === 0 || fase !== 'conferindo'}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-2xl text-sm font-black hover:bg-green-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
                  <Zap className="w-4 h-4" />Finalizar
                </button>
              </div>

              {/* LOG de atividade */}
              <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[80px]">
                <div className="px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5">
                  <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/><div className="w-2.5 h-2.5 rounded-full bg-green-500"/></div>
                  <p className="text-[9px] font-bold text-slate-500 ml-1">activity log</p>
                </div>
                <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
                  {log.length === 0 && <p className="text-[9px] text-slate-600 italic">Aguardando leituras...</p>}
                  {log.map(l => (
                    <p key={l.id} className={cn('text-[9px] font-mono',
                      l.type === 'ok' ? 'text-green-400' : l.type === 'erro' ? 'text-red-400' : 'text-amber-400'
                    )}>
                      <span className="text-slate-600">[{l.ts}]</span> {l.type === 'ok' ? '✓' : l.type === 'erro' ? '✗' : '⌑'} {l.msg}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA — Itens da OR */}
            <div className="w-64 shrink-0 flex flex-col p-4 overflow-y-auto min-h-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Itens da OR <span className="text-slate-600">({itens.length})</span>
              </p>
              <div className="space-y-2">
                {itens.map(item => {
                  const ok  = item.qtContada >= item.qtEsperada;
                  const div = item.qtContada > 0 && item.qtContada !== item.qtEsperada;
                  return (
                    <div key={item.id} className={cn('rounded-2xl border-2 p-3 text-xs transition-all',
                      ok  ? 'border-green-300 bg-green-50 dark:bg-green-950/10 dark:border-green-800/50' :
                      div ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-800/50' :
                            'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                    )}>
                      <div className="flex items-start gap-2">
                        <div className={cn('w-5 h-5 rounded-lg flex items-center justify-center shrink-0',
                          ok ? 'bg-green-500 text-white' : div ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                        )}>
                          {ok ? <Check className="w-3 h-3" /> : div ? <AlertTriangle className="w-3 h-3" /> : <Package className="w-3 h-3 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-300 leading-tight text-[10px] truncate">{item.descricao}</p>
                          <code className="text-[8px] text-slate-400">{item.barcode}</code>
                        </div>
                      </div>
                      {/* Quantidade — OCULTA no modo conferindo (conferência cega!) */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-bold">Contado:</span>
                        <span className={cn('text-sm font-black',
                          ok ? 'text-green-600' : div ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                        )}>{item.qtContada}</span>
                      </div>
                      {/* Esperado — só visível após finalizar */}
                      {fase !== 'conferindo' && (
                        <div className="mt-1 flex items-center justify-between animate-in fade-in duration-300">
                          <span className="text-[9px] text-slate-400 flex items-center gap-1"><EyeOff className="w-2.5 h-2.5" />Esperado NF:</span>
                          <span className="text-sm font-black text-slate-600 dark:text-slate-400">{item.qtEsperada}</span>
                        </div>
                      )}
                      {fase === 'conferindo' && (
                        <div className="mt-1 flex items-center gap-1 text-[8px] text-slate-400 italic">
                          <EyeOff className="w-2.5 h-2.5" />Qt. esperada oculta (conf. cega)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function BlindCheck() {
  const [ordens, setOrdens]       = useState(ORDENS_INIT);
  const [statusFiltro, setFiltro] = useState('Todos');
  const [search, setSearch]       = useState('');
  const [modalOR, setModalOR]     = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() =>
    ordens.filter(o =>
      (statusFiltro === 'Todos' || o.status === statusFiltro) &&
      (o.ordemId.toLowerCase().includes(search.toLowerCase()) ||
       o.nf.toLowerCase().includes(search.toLowerCase()) ||
       o.depositante.toLowerCase().includes(search.toLowerCase()))
    ), [ordens, statusFiltro, search]);

  const iniciarConferencia = (o) => {
    if (o.status === 'Finalizado') return;
    setOrdens(prev => prev.map(x => x.id === o.id ? { ...x, status: 'Em Conferência' } : x));
    setModalOR(o);
  };

  const handleSave = (itensAtualizados, novoStatus) => {
    setOrdens(prev => prev.map(o =>
      o.id === modalOR.id ? { ...o, itens: itensAtualizados, status: novoStatus } : o
    ));
    setModalOR(null);
    showToast(
      novoStatus === 'Finalizado' ? `${modalOR.ordemId} finalizada sem divergências!` : `${modalOR.ordemId} liberada com divergência.`,
      novoStatus === 'Finalizado' ? 'ok' : 'warn'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* MODAIS */}
      {modalOR && <ModalConferencia ordem={modalOR} onClose={() => setModalOR(null)} onSave={handleSave} />}

      {/* TOAST */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300',
          toast.type === 'warn'
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800'
        )}>
          {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-green-500 to-secondary" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-lg shrink-0">
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 3 — Entrada e Recebimento</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Conferência Cega e Alocação</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Quantidade esperada oculta · Contagem peça a peça · Tratamento de divergências</p>
          </div>
          {/* KPIs */}
          <div className="ml-auto flex gap-3">
            {[
              { label:'Pendentes',       val: ordens.filter(o=>o.status==='Pendente').length,       color:'text-slate-500'   },
              { label:'Em Conferência',  val: ordens.filter(o=>o.status==='Em Conferência').length,  color:'text-blue-500'    },
              { label:'Divergentes',     val: ordens.filter(o=>o.status==='Divergente').length,      color:'text-red-600'     },
              { label:'Finalizados',     val: ordens.filter(o=>o.status==='Finalizado').length,      color:'text-green-600'   },
            ].map(k => (
              <div key={k.label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-3.5 py-2.5 min-w-[70px]">
                <p className={cn('text-xl font-black', k.color)}>{k.val}</p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex gap-3 items-center flex-wrap shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ordem, NF ou Depositante..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all w-56" />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFiltro(s)}
              className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all',
                statusFiltro === s
                  ? s === 'Todos' ? 'border-slate-700 bg-slate-800 text-white' : (STATUS_COLOR[s] || 'bg-slate-800 text-white border-slate-700')
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
              )}>
              {s}
            </button>
          ))}
        </div>
        <p className="ml-auto text-[9px] text-slate-400 font-bold">{filtered.length} ordem(ns)</p>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {['Ordem de Recebimento','Nota Fiscal','Depositante','Itens','Progresso','Status','Ação'].map(h => (
                  <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                  <td className="p-3"><code className="text-xs font-black text-secondary">{o.ordemId}</code></td>
                  <td className="p-3 text-xs font-bold text-slate-500">{o.nf}</td>
                  <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{o.depositante}</td>
                  <td className="p-3 text-center text-xs font-black text-slate-500">{o.itens.length}</td>
                  <td className="p-3">
                    <ProgressBar itens={o.itens} />
                  </td>
                  <td className="p-3">
                    <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', STATUS_COLOR[o.status])}>{o.status}</span>
                  </td>
                  <td className="p-3">
                    {o.status !== 'Finalizado' ? (
                      <button onClick={() => iniciarConferencia(o)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl text-[10px] font-black transition-all">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        {o.status === 'Em Conferência' ? 'Continuar' : o.status === 'Divergente' ? 'Ver Divergência' : 'Iniciar'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-green-600 font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />Concluída
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs">Nenhuma ordem encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
