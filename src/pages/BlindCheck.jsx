import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardCheck, Search, ScanBarcode, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, ShieldCheck, X, Minus, Plus, EyeOff, Lock, User, SkipForward,
  Package, Hash, Zap, Check, Loader2, RotateCcw, Scale
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

/* ─── CSS: shake keyframe (finito, não bounce) ─────────────────────────── */
const SHAKE_STYLE = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}} .shake{animation:shake 0.45s ease-in-out;}`;

/* ─── Toast queue (não sobrescreve mensagens) ──────────────────────────── */
function useToastQueue() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'ok') => {
    const id = crypto.randomUUID();
    setToasts(q => [...q, { id, msg, type }]);
    setTimeout(() => setToasts(q => q.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

/* ─── Status config ────────────────────────────────────────────────────── */
const STATUS_COLOR = {
  'Pendente':       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'Em Conferência': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Divergente':     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Finalizado':     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const STATUS_OPTS = ['Todos', 'Pendente', 'Em Conferência', 'Divergente', 'Finalizado'];

/* ─── makeItens — IDs com UUID para evitar colisão ─────────────────────── */
const makeItens = (ordemId) => [
  { id: `${ordemId}-${crypto.randomUUID()}`, barcode:'VEPEL-BPI-174FX',        descricao:'Barreira de Proteção Infravermelha', qtEsperada:4, qtContada:0, lote:'', validade:'' },
  { id: `${ordemId}-${crypto.randomUUID()}`, barcode:'VEPEL-BTI-JX02-CCS',     descricao:'Botoeira de Inspeção - Mod. JX02',   qtEsperada:2, qtContada:0, lote:'', validade:'' },
  { id: `${ordemId}-${crypto.randomUUID()}`, barcode:'VPER-LUM-LED-VRD-24V',   descricao:'Luminária em LED Verde 24V',          qtEsperada:6, qtContada:0, lote:'', validade:'' },
];

const ORDENS_INIT = [
  { id:'OR001', ordemId:'ORD-001', nf:'NF-45123', depositante:'VerticalParts Matriz',        status:'Pendente',      itens: makeItens('OR001') },
  { id:'OR002', ordemId:'ORD-002', nf:'NF-45124', depositante:'Elevadores Atlas Schindler',  status:'Em Conferência',itens: makeItens('OR002') },
  { id:'OR003', ordemId:'ORD-003', nf:'NF-45125', depositante:'Thyssenkrupp Elevadores',     status:'Divergente',    itens:[
    { id:'OR003-A', barcode:'VEPEL-BPI-174FX',          descricao:'Barreira de Proteção Infravermelha', qtEsperada:3, qtContada:2, lote:'', validade:'' },
    { id:'OR003-B', barcode:'VPER-PNT-AL-22D-202X145-CT',descricao:'Pente de Alumínio - 22 Dentes',      qtEsperada:1, qtContada:1, lote:'', validade:'' },
  ]},
  { id:'OR004', ordemId:'ORD-004', nf:'NF-45126', depositante:'Otis Elevadores',             status:'Finalizado',    itens:[
    { id:'OR004-A', barcode:'VPER-INC-ESQ', descricao:'InnerCap (Esquerdo)', qtEsperada:8, qtContada:8, lote:'', validade:'' },
  ]},
];

/* ─── Validação de validade ─────────────────────────────────────────────── */
function validateValidade(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Data inválida.';
  const today = new Date(); today.setHours(0,0,0,0);
  if (d < today) return 'Produto com validade vencida.';
  return null;
}

/* ─── ProgressBar: mostra itens conferidos, NÃO porcentagem ─────────────
   Mostramos só "X de N" itens sem revelar a quantidade total esperada
   enquanto está conferindo (círculos ✓/? por item)                       */
function ProgressBar({ itens, fase }) {
  const totalItens = itens.length;
  const conferidos = itens.filter(i => i.qtContada > 0).length;
  const _divergentes = itens.filter(i => i.qtContada > 0 && i.qtContada !== i.qtEsperada).length;
  // Durante conferência não revelamos progresso numérico — apenas "item lido" vs "pendente"
  return (
    <div className="flex items-center gap-1.5">
      {itens.map(item => {
        const lido = item.qtContada > 0;
        const div  = lido && item.qtContada !== item.qtEsperada;
        const ok   = fase !== 'conferindo' && item.qtContada === item.qtEsperada && lido;
        return (
          <div key={item.id} title={item.descricao}
            className={cn('w-3 h-3 rounded-full border-2 transition-all',
              ok  ? 'bg-green-500 border-green-500' :
              div ? 'bg-red-500 border-red-500' :
              lido ? 'bg-blue-400 border-blue-400' :
              'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
            )} />
        );
      })}
      <span className="text-[9px] font-bold text-slate-400 ml-1">
        {conferidos}/{totalItens}
      </span>
    </div>
  );
}

/* ─── ModalSupervisor — sem SUPERVISOR_CREDS no frontend ─────────────── */
function ModalSupervisor({ onClose, onOk, titulo = 'Liberar com Divergência', motivo = '' }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [shake, setShake]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    if (!usuario.trim() || !senha.trim()) return;
    setLoading(true);
    // ⚠️ PLACEHOLDER — validação deve ocorrer no backend via POST /api/auth/supervisor
    // Substituir por: fetch('/api/auth/supervisor', { method:'POST', body: JSON.stringify({usuario,senha}) })
    setTimeout(() => {
      // Simulação: sempre aprova (backend decide)
      onOk();
      setLoading(false);
    }, 800);
  };

  const _triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <style>{SHAKE_STYLE}</style>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-400/40 w-full max-w-sm shadow-2xl overflow-hidden', shake && 'shake')}>
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">{titulo}</p>
              <p className="text-[10px] text-red-500 font-bold">Autorização de Supervisor — validada no servidor</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 rounded-2xl px-4 py-3 text-[10px] text-red-700 dark:text-red-400 font-medium">
            {motivo || 'Esta ação requer autorização de supervisor. O registro será mantido no histórico de auditoria.'}
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={usuario} onChange={e => { setUsuario(e.target.value); setErro(''); }}
                placeholder="Usuário supervisor"
                autoComplete="new-password"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl text-sm outline-none transition-all" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={senha} onChange={e => { setSenha(e.target.value); setErro(''); }}
                placeholder="Senha"
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && handleOk()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl text-sm outline-none transition-all" />
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200">
              <XCircle className="w-4 h-4 shrink-0" />{erro}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
            <button onClick={handleOk} disabled={!usuario || !senha || loading}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Verificando</> : <><ShieldCheck className="w-3.5 h-3.5" />Autorizar</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Modal de Conferência ─────────────────────────────────────────────── */
function ModalConferencia({ ordem, onClose, onSave }) {
  const barcodeRef   = useRef(null);
  const lastScanRef  = useRef(''); // debounce para leitor rápido
  const [itens, setItens]         = useState(() => JSON.parse(JSON.stringify(ordem.itens)));
  const [barcode, setBarcode]     = useState('');
  const [qtInput, setQtInput]     = useState(1);
  const [flash, setFlash]         = useState(null);
  const [log, setLog]             = useState([]);
  const [tentativas, setTentativas] = useState(1);
  const MAX_RECONTAGEM             = 3;
  const [fase, setFase]           = useState('conferindo');
  const [showDivModal, setShowDivModal]       = useState(false);
  const [showIgnorarModal, setShowIgnorarModal] = useState(false);
  const [loteInput, setLoteInput]   = useState('');
  const [validadeInput, setValidadeInput] = useState('');
  const [validadeErro, setValidadeErro]   = useState('');
  const [pesoInput, setPesoInput]     = useState('');
  const [corInput, setCorInput]       = useState('');

  useEffect(() => { barcodeRef.current?.focus(); }, []);

  /* Progresso global: quantos itens tiveram pelo menos 1 leitura */
  const totalItens  = itens.length;
  const itensLidos  = itens.filter(i => i.qtContada > 0).length;

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(() => { setFlash(null); barcodeRef.current?.focus(); }, 900);
  };

  /* Log preserva histórico entre recontagens — marca tentativa */
  const addLog = (msg, type) => setLog(prev => [
    { id: crypto.randomUUID(), msg, type, ts: new Date().toLocaleTimeString('pt-BR'), tentativa: tentativas },
    ...prev
  ].slice(0, 50));

  /* Registrar contagem */
  const handleRegistrar = () => {
    const bc = barcode.trim();
    if (!bc) { barcodeRef.current?.focus(); return; }

    // Debounce: ignora scan duplicado < 300ms
    if (bc === lastScanRef.current) { return; }
    lastScanRef.current = bc;
    setTimeout(() => { lastScanRef.current = ''; }, 300);

    const item = itens.find(i => i.barcode === bc);
    if (!item) {
      addLog(`Código "${bc}" não encontrado na OR`, 'erro');
      triggerFlash('erro');
      setBarcode('');
      return;
    }

    // Validar validade antes de registrar
    const valErr = validateValidade(validadeInput);
    if (validadeInput && valErr) {
      setValidadeErro(valErr);
      return;
    }
    setValidadeErro('');

    const qty = isNaN(qtInput) || qtInput < 1 ? 1 : Math.floor(qtInput);
    
    // Capturar novos campos: Peso e Cor
    // Se o peso for informado, validamos o formato
    const pesoNum = parseFloat(pesoInput.replace(',', '.'));

    setItens(prev => prev.map(i => i.id === item.id
      ? { 
          ...i, 
          qtContada: i.qtContada + qty, 
          lote: loteInput || i.lote, 
          validade: validadeInput || i.validade,
          peso_capturado: !isNaN(pesoNum) ? pesoNum : i.peso_capturado,
          cor_confirmada: corInput || i.cor_confirmada
        }
      : i
    ));
    
    const details = [];
    if (!isNaN(pesoNum)) details.push(`${pesoNum}kg`);
    if (corInput) details.push(corInput);
    const detailStr = details.length > 0 ? ` [${details.join(' | ')}]` : '';

    addLog(`+${qty}× ${item.descricao}${detailStr}`, 'ok');
    triggerFlash('ok');
    
    // Reset form
    setBarcode('');
    setQtInput(1);
    setLoteInput('');
    setValidadeInput('');
    setPesoInput('');
    setCorInput('');
  };

  /* Ignorar — registra no log qual barcode e vincula à lista de itens */
  const confirmarIgnorar = () => {
    const bc = barcode.trim();
    const item = itens.find(i => i.barcode === bc);
    const motivo = item
      ? `IGNORADO por supervisor: "${item.descricao}" (${bc})`
      : `IGNORADO por supervisor: barcode desconhecido "${bc}"`;
    addLog(motivo, 'skip');
    triggerFlash('skip');
    setBarcode('');
    setShowIgnorarModal(false);
  };

  /* Finalizar — único botão, valida divergência */
  const handleFinalizar = () => {
    const divergente = itens.some(i => i.qtContada !== i.qtEsperada);
    setFase(divergente ? 'divergente' : 'ok');
  };

  /* Salvar progresso parcial */
  const handleSalvarParcial = () => onSave(itens, log, 'Em Conferência');

  /* Recontagem — preserva log, adiciona separador de tentativa */
  const handleRecontar = () => {
    if (tentativas >= MAX_RECONTAGEM) {
      // Não alert() — informa via log e bloqueia
      addLog(`⛔ Limite de ${MAX_RECONTAGEM} recontagens atingido. Solicite autorização.`, 'erro');
      return;
    }
    const prox = tentativas + 1;
    setTentativas(prox);
    // Preserva log anterior, adiciona marcador de nova tentativa
    setLog(prev => [
      { id: crypto.randomUUID(), msg: `━━━ Início da Tentativa ${prox} ━━━`, type: 'info', ts: new Date().toLocaleTimeString('pt-BR'), tentativa: prox },
      ...prev
    ]);
    setItens(prev => prev.map(i => ({ ...i, qtContada: 0, lote: '', validade: '' })));
    setFase('conferindo');
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleLiberarDivergencia = () => {
    setShowDivModal(false);
    onSave(itens, log, 'Divergente');
  };

  const handleSalvarOk = () => onSave(itens, log, 'Finalizado');

  const onBarcodeKey = (e) => { if (e.key === 'Enter') handleRegistrar(); };

  /* Divergência detalhada para o banner */
  const divergencias = fase !== 'conferindo' ? itens.filter(i => i.qtContada !== i.qtEsperada) : [];

  return createPortal(
    <>
      {showDivModal && (
        <ModalSupervisor
          onClose={() => setShowDivModal(false)}
          onOk={handleLiberarDivergencia}
          motivo={`Liberação com ${divergencias.length} divergência(s) detectada(s). Esta ação será registrada no histórico de auditoria.`}
        />
      )}
      {showIgnorarModal && (
        <ModalSupervisor
          titulo="Ignorar Leitura"
          motivo={`Ignorar barcode "${barcode}" sem vínculo com item da OR. Justificativa será registrada em auditoria.`}
          onClose={() => setShowIgnorarModal(false)}
          onOk={confirmarIgnorar}
        />
      )}

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className={cn(
          'relative bg-white dark:bg-slate-900 rounded-3xl border-2 w-full max-w-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden transition-all duration-300',
          flash === 'ok'        ? 'border-green-400 ring-4 ring-green-400/30' :
          flash === 'erro'      ? 'border-red-500   ring-4 ring-red-500/30' :
          flash === 'skip'      ? 'border-amber-400 ring-4 ring-amber-400/30' :
          fase === 'divergente' ? 'border-red-500' :
          fase === 'ok'         ? 'border-green-500' :
          'border-slate-200 dark:border-slate-700'
        )}>
          {/* Barra de cor topo */}
          <div className={cn('h-1.5 w-full shrink-0 transition-all',
            fase === 'divergente' ? 'bg-red-500' :
            fase === 'ok'         ? 'bg-green-500' :
            'bg-amber-400'
          )} />

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center',
              fase === 'divergente' ? 'bg-red-100 dark:bg-red-900/30' :
              fase === 'ok'         ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-amber-50'
            )}>
              {fase === 'divergente' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
               fase === 'ok'         ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
               <ClipboardCheck className="w-5 h-5 text-amber-600" />}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white">
                {fase === 'divergente' ? '⚠️ Divergência Encontrada' :
                 fase === 'ok'         ? '✅ Conferência Concluída' :
                 'Conferência Cega'}
              </p>
              <p className="text-[10px] text-slate-400">{ordem.ordemId} · {ordem.nf} · {ordem.depositante}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {/* Progresso: itens lidos, sem revelar total esperado de peças */}
              <span className="text-[10px] text-slate-400 font-bold">{itensLidos}/{totalItens} itens lidos</span>
              {tentativas > 1 && (
                <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  Tentativa {tentativas}/{MAX_RECONTAGEM}
                </span>
              )}
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors" aria-label="Fechar modal">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Banner de divergência */}
          {fase === 'divergente' && (
            <div className="mx-6 mt-3 shrink-0">
              <div className="bg-red-600 text-white rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-black">DIVERGÊNCIA ENCONTRADA — {divergencias.length} item(ns)</p>
                  <ul className="mt-1 space-y-0.5">
                    {divergencias.map(d => (
                      <li key={d.id} className="text-[10px] opacity-90">
                        • {d.descricao}: contado {d.qtContada}, esperado {d.qtEsperada}
                        {d.qtContada > d.qtEsperada ? ' (sobra)' : ' (falta)'}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleRecontar} disabled={tentativas >= MAX_RECONTAGEM}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black transition-all border border-white/30 disabled:opacity-40">
                      <RotateCcw className="w-3.5 h-3.5" />Recontar ({MAX_RECONTAGEM - tentativas} restante{MAX_RECONTAGEM - tentativas !== 1?'s':''})
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

          {/* Banner OK */}
          {fase === 'ok' && (
            <div className="mx-6 mt-3 shrink-0">
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
            {/* Coluna esquerda — Operação */}
            <div className="flex-1 flex flex-col p-5 gap-4 border-r border-slate-100 dark:border-slate-800 overflow-y-auto min-h-0">

              {/* Flash */}
              {flash && (
                <div className={cn('rounded-2xl px-4 py-3 flex items-center gap-2 font-black text-sm',
                  flash === 'ok'   ? 'bg-green-100 text-green-700' :
                  flash === 'erro' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                )}>
                  {flash === 'ok' ? <CheckCircle2 className="w-5 h-5" /> :
                   flash === 'erro' ? <XCircle className="w-5 h-5" /> :
                   <SkipForward className="w-5 h-5" />}
                  {flash === 'ok' ? 'Contagem registrada!' : flash === 'erro' ? 'Código não reconhecido' : 'Leitura ignorada por supervisor'}
                </div>
              )}

              {/* Barcode */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ScanBarcode className="w-3.5 h-3.5" />Código de Barras (leitor ou teclado)
                </label>
                <div className="relative">
                  <ScanBarcode className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input ref={barcodeRef} value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={onBarcodeKey}
                    disabled={fase !== 'conferindo'}
                    placeholder="Bipe o produto aqui ou pressione Enter..."
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-4 text-lg font-black font-mono tracking-widest bg-slate-50 dark:bg-slate-800 border-2 border-amber-300/60 focus:border-amber-500 rounded-2xl outline-none transition-all disabled:opacity-40" />
                </div>
              </div>

              {/* Quantidade — NaN-safe */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantidade Contada</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQtInput(q => Math.max(1, (isNaN(q)?1:q) - 1))} disabled={fase !== 'conferindo'}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-black disabled:opacity-40">−</button>
                  <input type="number" min="1" value={qtInput}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      setQtInput(isNaN(v) ? 1 : Math.max(1, v));
                    }}
                    disabled={fase !== 'conferindo'}
                    className="w-24 text-center text-2xl font-black py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-xl outline-none transition-all disabled:opacity-40" />
                  <button onClick={() => setQtInput(q => (isNaN(q)?1:q) + 1)} disabled={fase !== 'conferindo'}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-black disabled:opacity-40">+</button>
                </div>
              </div>

              {/* Lote (opcional) */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />Lote (opcional — ex: LOT-2026-001)
                </label>
                <input value={loteInput} onChange={e => setLoteInput(e.target.value)} disabled={fase !== 'conferindo'}
                  placeholder="LOT-2026-001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-xl text-sm font-mono outline-none transition-all disabled:opacity-40" />
              </div>

              {/* Validade com validação */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Validade (opcional)
                </label>
                <input type="date" value={validadeInput}
                  onChange={e => { setValidadeInput(e.target.value); setValidadeErro(validateValidade(e.target.value) || ''); }}
                  disabled={fase !== 'conferindo'}
                  className={cn('w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm outline-none transition-all disabled:opacity-40',
                    validadeErro ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-amber-400'
                  )} />
                {validadeErro && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" />{validadeErro}</p>}
              </div>

              {/* Peso e Cor — Novos Campos Reais */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Scale className="w-3 h-3" />Peso (kg)
                  </label>
                  <input value={pesoInput} onChange={e => setPesoInput(e.target.value)} disabled={fase !== 'conferindo'}
                    placeholder="0.000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-xl text-sm font-bold outline-none transition-all disabled:opacity-40" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />Cor / Obs
                  </label>
                  <input value={corInput} onChange={e => setCorInput(e.target.value)} disabled={fase !== 'conferindo'}
                    placeholder="Ex: Amarelo"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-xl text-sm font-bold outline-none transition-all disabled:opacity-40 uppercase" />
                </div>
              </div>

              {/* Ações — botão ignorar explicitamente separado, único Finalizar */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleRegistrar} disabled={!barcode.trim() || fase !== 'conferindo' || !!validadeErro}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-300 text-black rounded-2xl text-sm font-black active:scale-95 transition-all shadow-md disabled:opacity-40">
                  <CheckCircle2 className="w-4 h-4" />Registrar
                </button>
                <button onClick={() => { if (barcode.trim()) setShowIgnorarModal(true); else barcodeRef.current?.focus(); }}
                  disabled={fase !== 'conferindo'}
                  title="Requer leitura prévia de barcode"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-300 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-black hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-40">
                  <SkipForward className="w-4 h-4" />Ignorar
                </button>
                <button onClick={handleSalvarParcial} disabled={itensLidos === 0 || fase !== 'conferindo'}
                  title="Salva progresso — você pode retomar depois"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-40">
                  Salvar Progresso
                </button>
                <button onClick={handleFinalizar} disabled={itensLidos === 0 || fase !== 'conferindo'}
                  title="Finaliza conferência e compara com NF"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black hover:bg-green-700 active:scale-95 transition-all shadow-md disabled:opacity-40">
                  <Zap className="w-4 h-4" />Finalizar Conferência
                </button>
              </div>

              {/* Log de atividade — preserva histórico entre tentativas */}
              <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[80px]">
                <div className="px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"/>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 ml-1">activity log — {log.length} ação(ões)</p>
                </div>
                <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
                  {log.length === 0 && <p className="text-[9px] text-slate-600 italic">Aguardando leituras...</p>}
                  {log.map(l => (
                    <p key={l.id} className={cn('text-[9px] font-mono',
                      l.type === 'ok'   ? 'text-green-400' :
                      l.type === 'erro' ? 'text-red-400' :
                      l.type === 'info' ? 'text-slate-500' :
                      'text-amber-400'
                    )}>
                      <span className="text-slate-600">[{l.ts}]</span>
                      {l.tentativa > 1 && <span className="text-slate-500"> #T{l.tentativa}</span>}
                      {' '}{l.type === 'ok' ? '✓' : l.type === 'erro' ? '✗' : l.type === 'info' ? '─' : '⌑'} {l.msg}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna direita — Itens da OR */}
            <div className="w-64 shrink-0 flex flex-col p-4 overflow-y-auto min-h-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Itens da OR <span className="text-slate-600">({itens.length})</span>
              </p>
              <div className="space-y-2">
                {itens.map(item => {
                  const lido = item.qtContada > 0;
                  // Durante conferência: NÃO revela qtContada numérica — apenas status visual
                  const ok   = fase !== 'conferindo' && item.qtContada === item.qtEsperada;
                  const div  = fase !== 'conferindo' && item.qtContada !== item.qtEsperada;
                  return (
                    <div key={item.id} className={cn('rounded-2xl border-2 p-3 text-xs transition-all',
                      ok  ? 'border-green-300 bg-green-50 dark:bg-green-950/10' :
                      div ? 'border-red-300 bg-red-50 dark:bg-red-950/10' :
                      lido ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/10' :
                      'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                    )}>
                      <div className="flex items-start gap-2">
                        <div className={cn('w-5 h-5 rounded-lg flex items-center justify-center shrink-0',
                          ok ? 'bg-green-500 text-white' :
                          div ? 'bg-red-500 text-white' :
                          lido ? 'bg-blue-400 text-white' :
                          'bg-slate-200 dark:bg-slate-700'
                        )}>
                          {ok ? <Check className="w-3 h-3" /> :
                           div ? <AlertTriangle className="w-3 h-3" /> :
                           lido ? <Check className="w-3 h-3" /> :
                           <Package className="w-3 h-3 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-300 leading-tight text-[10px] truncate">{item.descricao}</p>
                          <code className="text-[8px] text-slate-400">{item.barcode}</code>
                        </div>
                      </div>
                      {/* Durante conferência: sem números — só lido/não lido */}
                      <div className="mt-1.5 text-[8px] text-slate-400 font-medium">
                        {fase === 'conferindo'
                          ? (lido ? '✓ Leitura registrada' : 'Aguardando leitura...')
                          : `Contado: ${item.qtContada} · Esperado: ${item.qtEsperada}`}
                      </div>
                      {(item.lote || item.validade || item.peso_capturado || item.cor_confirmada) && (
                        <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                          {item.lote    && <p className="text-[8px] font-bold text-slate-500">Lote: {item.lote}</p>}
                          {item.validade && <p className="text-[8px] font-bold text-slate-500">Val: {item.validade}</p>}
                          <div className="flex gap-2">
                             {item.peso_capturado && <p className="text-[8px] font-bold text-primary">P: {item.peso_capturado}kg</p>}
                             {item.cor_confirmada && <p className="text-[8px] font-bold text-secondary">{item.cor_confirmada}</p>}
                          </div>
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
    </>,
    document.body
  );
}

/* ─── Root ─────────────────────────────────────────────────────────────── */
export default function BlindCheck() {
  const [ordens, setOrdens]   = useState(ORDENS_INIT);
  const [statusFiltro, setFiltro] = useState('Todos');
  const [search, setSearch]   = useState('');
  const [modalOR, setModalOR] = useState(null);
  const { toasts, add: addToast } = useToastQueue();

  const filtered = useMemo(() =>
    ordens.filter(o =>
      (statusFiltro === 'Todos' || o.status === statusFiltro) &&
      (o.ordemId.toLowerCase().includes(search.toLowerCase()) ||
       o.nf.toLowerCase().includes(search.toLowerCase()) ||
       o.depositante.toLowerCase().includes(search.toLowerCase()))
    ), [ordens, statusFiltro, search]);

  const iniciarConferencia = (o) => {
    if (o.status === 'Finalizado') return;
    setModalOR(o);
  };

  const handleSave = (itensAtualizados, logAtualizado, novoStatus) => {
    const id = modalOR.id;
    setOrdens(prev => prev.map(o =>
      o.id === id ? { ...o, itens: itensAtualizados, log: logAtualizado, status: novoStatus } : o
    ));
    const msg =
      novoStatus === 'Finalizado'     ? `${modalOR.ordemId} finalizada sem divergências!` :
      novoStatus === 'Divergente'     ? `${modalOR.ordemId} liberada com divergência.` :
      novoStatus === 'Em Conferência' ? `${modalOR.ordemId} salva. Retome quando quiser.` :
      `${modalOR.ordemId} atualizada.`;
    addToast(msg, novoStatus === 'Finalizado' ? 'ok' : 'warn');
    setModalOR(null);
  };

  /* Detalhe de divergência para a tabela */
  const getDivDetail = (o) => {
    if (o.status !== 'Divergente') return null;
    const divs = o.itens.filter(i => i.qtContada !== i.qtEsperada);
    if (!divs.length) return null;
    return `${divs.length} item(ns) divergente(s)`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Modal */}
      {modalOR && <ModalConferencia ordem={modalOR} onClose={() => setModalOR(null)} onSave={handleSave} />}

      {/* Toast queue */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 pointer-events-auto',
            t.type === 'warn'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
              : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800'
          )}>
            {t.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-green-500 to-amber-400" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shrink-0">
            <ClipboardCheck className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 3 — Entrada e Recebimento</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">2.7 Realizar Conferência Cega</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Quantidade esperada oculta durante contagem · Tratamento de divergências com supervisor</p>
          </div>
          <div className="ml-auto flex gap-3">
            {[
              { label:'Pendentes',      val: ordens.filter(o=>o.status==='Pendente').length,      color:'text-slate-500' },
              { label:'Em Conferência', val: ordens.filter(o=>o.status==='Em Conferência').length, color:'text-blue-500'  },
              { label:'Divergentes',    val: ordens.filter(o=>o.status==='Divergente').length,     color:'text-red-600'   },
              { label:'Finalizados',    val: ordens.filter(o=>o.status==='Finalizado').length,     color:'text-green-600' },
            ].map(k => (
              <div key={k.label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-3.5 py-2.5 min-w-[70px]">
                <p className={cn('text-xl font-black', k.color)}>{k.val}</p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex gap-3 items-center flex-wrap shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ordem, NF ou Depositante..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-400 rounded-xl text-xs font-medium outline-none transition-all w-56" />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFiltro(s)}
              className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all',
                statusFiltro === s
                  ? s === 'Todos' ? 'border-slate-700 bg-slate-800 text-white' : STATUS_COLOR[s]
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
              )}>
              {s}
            </button>
          ))}
        </div>
        <p className="ml-auto text-[9px] text-slate-400 font-bold">{filtered.length} ordem(ns)</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {['Ordem','Nota Fiscal','Depositante','Itens','Progresso','Status','Detalhe','Ação'].map(h => (
                  <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const divDetail = getDivDetail(o);
                return (
                  <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                    <td className="p-3"><code className="text-xs font-black text-amber-600">{o.ordemId}</code></td>
                    <td className="p-3 text-xs font-bold text-slate-500">{o.nf}</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{o.depositante}</td>
                    <td className="p-3 text-center text-xs font-black text-slate-500">{o.itens.length}</td>
                    <td className="p-3"><ProgressBar itens={o.itens} fase={o.status === 'Finalizado' || o.status === 'Divergente' ? 'finalizado' : 'conferindo'} /></td>
                    <td className="p-3">
                      <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', STATUS_COLOR[o.status])}>{o.status}</span>
                    </td>
                    <td className="p-3">
                      {divDetail
                        ? <span className="text-[9px] text-red-500 font-bold">{divDetail}</span>
                        : <span className="text-[9px] text-slate-300">—</span>}
                    </td>
                    <td className="p-3">
                      {o.status !== 'Finalizado' ? (
                        <button onClick={() => iniciarConferencia(o)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black transition-all">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          {o.status === 'Em Conferência' ? 'Continuar' : o.status === 'Divergente' ? 'Ver Diverg.' : 'Iniciar'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-600 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />Concluída
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-xs">Nenhuma ordem encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
