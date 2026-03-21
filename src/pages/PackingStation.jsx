import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import {
  Package, Scan, CheckCircle2, Printer, QrCode, Box,
  ArrowRight, ShieldCheck, Zap, AlertCircle, X, RefreshCw,
} from 'lucide-react';

export default function PackingStation() {
  const { warehouseId } = useApp();
  const [step,          setStep]          = useState(1); // 1: Select, 2: Check, 3: Done
  const [activeOrder,   setActiveOrder]   = useState(null);
  const [scanInput,     setScanInput]     = useState('');
  const [scanError,     setScanError]     = useState(null);
  const [loadError,     setLoadError]     = useState(null);
  const [lastScannedId, setLastScannedId] = useState(null);
  const [showLabel,     setShowLabel]     = useState(false);
  const [loading,       setLoading]       = useState(false);

  const scanRef               = useRef(null);
  const errorTimeoutRef       = useRef(null);
  const lastScannedTimeoutRef = useRef(null);
  const modalCloseBtnRef      = useRef(null);

  // Cleanup timeouts
  useEffect(() => () => {
    if (errorTimeoutRef.current)       clearTimeout(errorTimeoutRef.current);
    if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
  }, []);

  // Foco no scan após cada bipe
  useEffect(() => {
    if (step === 2 && lastScannedId === null) scanRef.current?.focus();
  }, [step, lastScannedId]);

  // Fecha modal de etiqueta com Escape + foca botão fechar
  useEffect(() => {
    if (!showLabel) return;
    modalCloseBtnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setShowLabel(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showLabel]);

  // ── Carregar NF do Supabase (notas_saida + itens_tarefa finalizados) ────────
  const handleLoadOrder = useCallback(async (value) => {
    const input = value.trim().toUpperCase();
    if (!input) return;
    setLoading(true);
    setLoadError(null);

    try {
      // Busca nota de saída aguardando expedição
      const { data: nota, error: notaErr } = await supabase
        .from('notas_saida')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .ilike('nf', `%${input}%`)
        .limit(1)
        .single();

      if (notaErr || !nota) {
        setLoadError(`NF "${input}" não encontrada ou não está aguardando expedição. Verifique o número.`);
        return;
      }

      // Busca itens_tarefa finalizados vinculados a tarefas deste warehouse que mencionam a NF
      const { data: itensTarefa } = await supabase
        .from('itens_tarefa')
        .select('*, tarefas!inner(detalhes, status)')
        .eq('status', 'finalizado')
        .filter('tarefas.detalhes->>warehouse_id', 'eq', warehouseId)
        .limit(50);

      const orderWithCheck = {
        id:     nota.id,
        numero: nota.nf,
        client: nota.cliente,
        status: nota.situacao,
        checkItems: (itensTarefa || []).map(i => ({
          id:        i.id,
          sku:       i.sku,
          desc:      i.descricao || i.sku,
          ean:       i.sku,
          expected:  i.quantidade_esperada ?? 1,
          conferido: 0,
        })),
      };
      setActiveOrder(orderWithCheck);
      setScanInput('');
      setScanError(null);
      setStep(2);
    } catch (err) {
      console.error('[PackingStation] loadOrder error:', err);
      setLoadError('Erro ao buscar NF. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  // ── Bipe Double Check ─────────────────────────────────────────────────────
  const handlePackingScan = (e) => {
    if (e.key !== 'Enter') return;
    const ean = scanInput.trim().toUpperCase();
    if (!ean || !activeOrder) return;

    const idx = activeOrder.checkItems.findIndex(i =>
      i.ean?.toUpperCase() === ean ||
      i.sku?.toUpperCase().includes(ean)
    );

    if (idx === -1) {
      setScanError(`Código "${ean}" não pertence a este pedido.`);
      setScanInput('');
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
      return;
    }

    const item = activeOrder.checkItems[idx];
    if (item.conferido >= item.expected) {
      setScanError(`Quantidade máxima já conferida para "${item.desc}".`);
      setScanInput('');
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
      return;
    }

    const updated = [...activeOrder.checkItems];
    updated[idx] = { ...item, conferido: item.conferido + 1 };
    setActiveOrder(prev => ({ ...prev, checkItems: updated }));
    setLastScannedId(item.id);
    setScanInput('');
    if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
    lastScannedTimeoutRef.current = setTimeout(() => setLastScannedId(null), 800);
  };

  const totalConferido = activeOrder?.checkItems.reduce((a, i) => a + i.conferido, 0) ?? 0;
  const totalEsperado  = activeOrder?.checkItems.reduce((a, i) => a + i.expected,  0) ?? 0;
  const allDone        = totalEsperado > 0 && totalConferido >= totalEsperado;

  const handleNextOrder = () => {
    setStep(1);
    setActiveOrder(null);
    setScanInput('');
    setScanError(null);
    setLoadError(null);
    setLastScannedId(null);
    setShowLabel(false);
  };

  const handleFecharVolume = () => {
    if (!allDone) return; // botão desabilitado, mas guard extra
    setShowLabel(true);
    setStep(3);
  };

  // ── actionGroups dinâmico por step ────────────────────────────────────────
  const actionGroups = step === 1 ? [] : step === 2 ? [
    [{ label: 'Cancelar', icon: X, onClick: handleNextOrder }],
  ] : [
    [{ label: 'Novo Volume', icon: Package, primary: true, onClick: handleNextOrder }],
  ];

  return (
    <EnterprisePageBase
      title="2.11 Embalar Pedidos"
      breadcrumbItems={[{ label: 'OPERAR', path: '/operacao' }]}
      actionGroups={actionGroups}
    >
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Sub-header da estação */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Double Check de itens e fechamento de volumes</p>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Estação</span>
              <span className="text-sm font-bold">PACK-01 (Norte)</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── STEP 1 — Selecionar Ordem ─────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-sm border border-slate-200 p-12 text-center space-y-6 shadow-sm border-b-4 border-b-black">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-sm bg-black/5 flex items-center justify-center">
                <Package className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-xl font-black tracking-tight">Pronto para iniciar novo volume?</h2>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">
                Bipe a etiqueta de picking ou digite o número do pedido para iniciar a conferência.
              </p>
            </div>

            <div className="max-w-md mx-auto relative">
              <Scan className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black/30 animate-pulse" />
              <label htmlFor="order-search" className="sr-only">Buscar pedido por código SO</label>
              <input
                id="order-search"
                type="text"
                placeholder="Digite o número da NF (ex: NF-001)..."
                value={scanInput}
                onChange={e => { setScanInput(e.target.value); setLoadError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleLoadOrder(scanInput)}
                disabled={loading}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-sm py-4 px-14 text-lg font-black tracking-widest focus:ring-2 focus:ring-black/20 transition-all text-center outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleLoadOrder(scanInput)}
                disabled={loading}
                aria-label="Carregar pedido"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-sm hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

            {loadError && (
              <div role="alert" className="flex items-center justify-center gap-2 text-red-600 text-sm font-black">
                <AlertCircle className="w-4 h-4" /> {loadError}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Double Check ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-black uppercase">
                      {activeOrder?.numero} — Conferência
                    </h2>
                    <p className="text-xs text-slate-400 font-bold">Cliente: {activeOrder?.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black leading-none">
                      {totalConferido}<span className="text-slate-300 mx-1">/</span>{totalEsperado}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Conferidos</p>
                  </div>
                </div>

                {/* Campo de bipe */}
                <div className={`flex items-center gap-3 p-4 bg-slate-50 rounded-sm border-2 ${scanError ? 'border-red-300' : 'border-slate-200 focus-within:border-black'} transition-all mb-4`}>
                  <Scan className="w-5 h-5 text-black/40 shrink-0 animate-pulse" />
                  <label htmlFor="scan-double-check" className="sr-only">Bipe o produto para conferência</label>
                  <input
                    id="scan-double-check"
                    ref={scanRef}
                    autoFocus
                    type="text"
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={handlePackingScan}
                    placeholder="Bipe o produto para conferir..."
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                  />
                </div>
                {scanError && (
                  <p role="alert" className="text-xs font-black text-red-600 flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-3.5 h-3.5" /> {scanError}
                  </p>
                )}

                {/* Lista de itens */}
                <div className="space-y-3">
                  {(activeOrder?.checkItems ?? []).map(item => {
                    const isDone  = item.conferido >= item.expected;
                    const isFlash = lastScannedId === item.id;
                    return (
                      <div key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-sm border transition-all
                          ${isFlash ? 'bg-green-50 border-green-200' : isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center border shadow-sm
                          ${isDone ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                          {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.desc}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black px-2 py-1 rounded-sm ${isDone ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {isDone ? 'COMPLETO' : `FALTAM ${item.expected - item.conferido}`}
                          </span>
                          <span className="text-sm font-black tabular-nums">
                            {item.conferido}<span className="text-slate-300 mx-0.5">/</span>{item.expected}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-black p-8 rounded-sm text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
                  <h3 className="text-xl font-black leading-tight mb-2">Double Check Ativado</h3>
                  <p className="text-xs opacity-80 leading-relaxed font-bold">
                    O sistema não permite o fechamento do volume se houver divergências com o pedido original.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Box className="w-32 h-32" />
                </div>
              </div>

              {/* Progresso visual */}
              {!allDone && (
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                    {totalEsperado - totalConferido} item{totalEsperado - totalConferido !== 1 ? 's' : ''} pendente{totalEsperado - totalConferido !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">
                    Confira todos os itens para fechar o volume
                  </p>
                </div>
              )}

              <button
                onClick={handleFecharVolume}
                disabled={!allDone}
                className={`w-full font-black py-5 rounded-sm shadow-sm transition-all flex flex-col items-center gap-1
                  ${allDone
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
              >
                <div className="flex items-center gap-2">
                  FECHAR VOLUME <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] opacity-80 uppercase tracking-widest font-black">Gerar Etiqueta de Embarque</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Confirmação ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-sm border border-slate-200 p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto border-4 border-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Volume Fechado!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Pedido {activeOrder?.numero} sincronizado com status &apos;Pronto para Embarque&apos; no Omie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <button onClick={() => setShowLabel(true)}
                className="flex-1 py-4 bg-slate-900 text-white rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                <Printer className="w-5 h-5" /> REIMPRIMIR
              </button>
              <button onClick={handleNextOrder}
                className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-black rounded-sm font-bold flex items-center justify-center gap-2 transition-colors">
                PRÓXIMO PEDIDO <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Modal Etiqueta ────────────────────────────────────────────── */}
        {showLabel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <button
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-default"
              onClick={() => setShowLabel(false)}
              aria-label="Fechar etiqueta"
            />
            <div role="dialog" aria-modal="true" aria-label="Etiqueta de embarque"
              className="bg-white p-10 rounded-sm shadow-2xl relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
              <button
                ref={modalCloseBtnRef}
                onClick={() => setShowLabel(false)}
                aria-label="Fechar etiqueta"
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-[6px] border-black p-6 space-y-6 text-black font-sans uppercase">
                <div className="flex justify-between items-center border-b-4 border-black pb-4">
                  <div className="font-black italic text-3xl">V-PARTS</div>
                  <div className="text-right">
                    <p className="text-xs font-black">Transporte</p>
                    <p className="text-lg font-black leading-none">JADLOG</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black mb-1">Destinatário</p>
                    <p className="text-xs font-bold leading-tight">
                      {activeOrder?.client}<br />
                      Av. das Américas, 2000<br />Rio de Janeiro - RJ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black mb-1">Pedido ERP</p>
                    <p className="text-2xl font-black">{activeOrder?.numero}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-6 border-y-4 border-black border-dashed">
                  <QrCode className="w-40 h-40" aria-label="QR Code da etiqueta de embarque" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-20 bg-black flex items-center justify-center text-white text-3xl font-black tracking-[0.6em]">
                    VOLUME 01/04
                  </div>
                  <p className="text-[10px] font-black mt-2 tracking-widest">VerticalParts WMS — High Accuracy Logistics</p>
                </div>
              </div>

              <button onClick={() => setShowLabel(false)}
                className="mt-8 w-full bg-slate-900 text-white font-bold py-5 rounded-sm hover:bg-black transition-colors shadow-lg">
                ENVIAR PARA IMPRESSORA (ZPL)
              </button>
            </div>
          </div>
        )}
      </div>
    </EnterprisePageBase>
  );
}
