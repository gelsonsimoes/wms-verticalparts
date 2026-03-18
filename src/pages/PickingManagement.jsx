import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import {
  ClipboardList, ArrowLeft, ArrowRight, Clock, CheckCircle2, CalendarDays,
  AlertCircle, Play, Package, MapPin, ScanBarcode, History,
  Check, X, BarChart3, ShoppingCart, RefreshCw,
} from 'lucide-react';

// ─── Utils ────────────────────────────────────────────────────────────────────
const calculateProgress = (orderItems = []) => {
  const totalExp = orderItems.reduce((a, i) => a + i.expected, 0);
  const totalCol = orderItems.reduce((a, i) => a + i.collected, 0);
  return totalExp === 0 ? 0 : Math.round((totalCol / totalExp) * 100);
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Concluído':    return 'bg-green-100 text-green-700 border-green-200';
    case 'Em Separação': return 'bg-amber-100 text-amber-700 border-amber-200';
    default:             return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapItem = (it) => ({
  id:       it.id,
  sku:      it.sku,
  desc:     it.descricao,
  ean:      it.ean,
  location: it.endereco,
  expected: it.quantidade_esperada,
  collected: it.quantidade_coletada,
  pulado:   it.pulado,
});

const mapOrdem = (row) => ({
  id:         row.id,
  numero:     row.numero,
  client:     row.cliente,
  status:     row.status,
  value:      row.valor,
  date:       row.data_referencia,
  items:      (row.ordens_saida_itens || []).length,
  totalQty:   (row.ordens_saida_itens || []).reduce((a, i) => a + i.quantidade_esperada, 0),
  orderItems: (row.ordens_saida_itens || []).map(mapItem),
});

// ─── Dados de semente (mock → Supabase) ───────────────────────────────────────
const SEED_ORDERS = (warehouseId) => [
  {
    warehouse_id: warehouseId, numero: 'SO-8842', cliente: 'VerticalParts Matriz',
    status: 'Pendente', valor: 'R$ 4.500,00', data_referencia: '2026-02-21',
    itens: [
      { sku: 'VEPEL-BPI-174FX',       descricao: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001',   endereco: 'R1_PP2_CL012_N001', quantidade_esperada: 5  },
      { sku: 'VPER-ESS-NY-27MM',      descricao: 'Escova de Segurança (Nylon - Base 27mm)',         ean: '7891149108718', endereco: 'R1_PP2_CL012_N002', quantidade_esperada: 2  },
      { sku: 'VPER-PAL-INO-1000',     descricao: 'Pallet de Aço Inox (1000mm)',                      ean: '789123456003',   endereco: 'R2_PP1_CL005_N001', quantidade_esperada: 5  },
    ],
  },
  {
    warehouse_id: warehouseId, numero: 'SO-8845', cliente: 'VerticalParts Matriz',
    status: 'Em Separação', valor: 'R$ 1.200,00', data_referencia: '2026-02-21',
    itens: [
      { sku: 'VEPEL-BTI-JX02-CCS',    descricao: 'Botoeira de Inspeção - Mod. JX02',                ean: '7890000000001', endereco: 'R1_PP1_CL001_N003', quantidade_esperada: 2, quantidade_coletada: 1 },
      { sku: 'VPER-LUM-LED-VRD-24V',  descricao: 'Luminária em LED Verde 24V',                       ean: '7890000000002', endereco: 'R1_PP1_CL001_N004', quantidade_esperada: 2  },
    ],
  },
  {
    warehouse_id: warehouseId, numero: 'SO-8849', cliente: 'VerticalParts Matriz',
    status: 'Concluído', valor: 'R$ 15.800,00', data_referencia: '2026-02-20',
    itens: [
      { sku: 'VPER-PNT-AL-22D-202X145-CT', descricao: 'Pente de Alumínio - 22 Dentes (202x145mm)', ean: '7890000000003', endereco: 'R2_PP2_CL001_N001', quantidade_esperada: 22, quantidade_coletada: 22 },
    ],
  },
];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function PickingManagement() {
  const { warehouseId } = useApp();
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [view, setView]                       = useState('LIST');
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [filter, setFilter]                   = useState('Todos');
  const [scanValue, setScanValue]             = useState('');
  const [scanError, setScanError]             = useState(null);
  const [lastScannedId, setLastScannedId]     = useState(null);
  const [showHistoryModal, setShowHistoryModal]   = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [saving, setSaving]                   = useState(false);

  const scanInputRef          = useRef(null);
  const lastScannedTimeoutRef = useRef(null);
  const scanErrTimeoutRef     = useRef(null);
  const historyCloseBtnRef    = useRef(null);
  const finalizeCloseBtnRef   = useRef(null);

  // Cleanup timeouts
  useEffect(() => () => {
    if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
    if (scanErrTimeoutRef.current)     clearTimeout(scanErrTimeoutRef.current);
  }, []);

  // Foco no modal de histórico
  useEffect(() => {
    if (!showHistoryModal) return;
    historyCloseBtnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setShowHistoryModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showHistoryModal]);

  // Foco no modal de finalização
  useEffect(() => {
    if (!showFinalizeModal) return;
    finalizeCloseBtnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setShowFinalizeModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showFinalizeModal]);

  // Foco no scanner ao entrar em modo ativo
  useEffect(() => {
    if (view === 'ACTIVE' && scanInputRef.current) scanInputRef.current.focus();
  }, [view, scanError]);

  // ── Fetch + seed ──────────────────────────────────────────────────────────
  const fetchOrdens = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordens_saida')
        .select('*, ordens_saida_itens(*)')
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        // Seed inicial com dados demo
        const seeds = SEED_ORDERS(warehouseId);
        for (const seed of seeds) {
          const { data: ordem, error: oErr } = await supabase
            .from('ordens_saida')
            .insert({
              warehouse_id:    seed.warehouse_id,
              numero:          seed.numero,
              cliente:         seed.cliente,
              status:          seed.status,
              valor:           seed.valor,
              data_referencia: seed.data_referencia,
            })
            .select()
            .single();
          if (oErr) { console.error('[Picking] seed ordem', oErr); continue; }
          const itensToInsert = seed.itens.map(it => ({
            ordem_id:            ordem.id,
            sku:                 it.sku,
            descricao:           it.descricao,
            ean:                 it.ean,
            endereco:            it.endereco,
            quantidade_esperada: it.quantidade_esperada,
            quantidade_coletada: it.quantidade_coletada || 0,
          }));
          await supabase.from('ordens_saida_itens').insert(itensToInsert);
        }
        // Re-fetch após seed
        const { data: seeded } = await supabase
          .from('ordens_saida')
          .select('*, ordens_saida_itens(*)')
          .eq('warehouse_id', warehouseId)
          .order('created_at', { ascending: false });
        setOrders((seeded || []).map(mapOrdem));
      } else {
        setOrders(data.map(mapOrdem));
      }
    } catch (err) {
      console.error('[Picking] fetchOrdens error:', err);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => { fetchOrdens(); }, [fetchOrdens]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel('ordens_saida_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_saida' }, () => {
        if (view === 'LIST') fetchOrdens();
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchOrdens, view]);

  // ── Persistência da ordem ativa no localStorage ───────────────────────────
  useEffect(() => {
    const savedId = localStorage.getItem('vparts_active_picking_id');
    if (savedId && orders.length > 0 && view === 'LIST') {
      const order = orders.find(o => o.id === savedId);
      if (order && order.status !== 'Concluído') {
        setSelectedOrder(order);
        setView('ACTIVE');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStartPicking = async (order) => {
    if (order.status === 'Concluído') return;
    setSelectedOrder(order);
    setView('ACTIVE');
    localStorage.setItem('vparts_active_picking_id', order.id);
    if (order.status === 'Pendente') {
      await supabase.from('ordens_saida').update({ status: 'Em Separação' }).eq('id', order.id);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Em Separação' } : o));
    }
  };

  const handleBackToList = () => {
    setView('LIST');
    setSelectedOrder(null);
    localStorage.removeItem('vparts_active_picking_id');
    fetchOrdens();
  };

  const handleScan = (e) => {
    if (e.key !== 'Enter') return;
    const ean = scanValue.trim();
    if (!ean) return;
    const eanUpper = ean.toUpperCase();

    const itemIndex = selectedOrder.orderItems.findIndex(item =>
      item.ean === ean ||
      item.ean.toUpperCase().includes(eanUpper) ||
      item.sku?.toUpperCase().includes(eanUpper)
    );

    if (itemIndex !== -1) {
      const item = selectedOrder.orderItems[itemIndex];
      if (item.collected < item.expected) {
        const updatedItems = [...selectedOrder.orderItems];
        updatedItems[itemIndex] = { ...item, collected: item.collected + 1 };
        setSelectedOrder({ ...selectedOrder, orderItems: updatedItems });
        setLastScannedId(item.id);
        setScanError(null);
        setScanValue('');
        if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
        lastScannedTimeoutRef.current = setTimeout(() => setLastScannedId(null), 800);
      } else {
        setScanError(`Quantidade máxima já coletada para "${item.desc}"`);
        setScanValue('');
        if (scanErrTimeoutRef.current) clearTimeout(scanErrTimeoutRef.current);
        scanErrTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
      }
    } else {
      setScanError(`Código "${ean}" não pertence a esta ordem.`);
      setScanValue('');
      if (scanErrTimeoutRef.current) clearTimeout(scanErrTimeoutRef.current);
      scanErrTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
    }
  };

  const handleFinalize = () => {
    const allCollected = selectedOrder.orderItems.every(i => i.collected >= i.expected);
    if (!allCollected) { setShowFinalizeModal(true); return; }
    confirmarFinalizacao();
  };

  const confirmarFinalizacao = async () => {
    setSaving(true);
    try {
      // 1. Persiste quantidade_coletada de cada item
      for (const item of selectedOrder.orderItems) {
        await supabase
          .from('ordens_saida_itens')
          .update({ quantidade_coletada: item.collected, pulado: item.pulado || false })
          .eq('id', item.id);
      }
      // 2. Finaliza a ordem
      await supabase.from('ordens_saida').update({ status: 'Concluído' }).eq('id', selectedOrder.id);
      setShowFinalizeModal(false);
      handleBackToList();
    } catch (err) {
      console.error('[Picking] confirmarFinalizacao error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePularItem = (itemId) => {
    const updatedItems = selectedOrder.orderItems.map(i =>
      i.id === itemId ? { ...i, pulado: true } : i
    );
    setSelectedOrder({ ...selectedOrder, orderItems: updatedItems });
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const performancePct = orders.length === 0
    ? 0
    : Math.round((orders.filter(o => o.status === 'Concluído').length / orders.length) * 100);
  const filteredOrders = filter === 'Todos' ? orders : orders.filter(o => o.status === filter);

  // ── actionGroups (muda por view) ──────────────────────────────────────────
  const actionGroups = view === 'ACTIVE' ? [
    [
      { label: 'Voltar', icon: ArrowLeft, onClick: handleBackToList },
    ],
    [
      { label: 'Finalizar Ordem', icon: CheckCircle2, primary: true, onClick: handleFinalize, disabled: saving },
    ],
  ] : [
    [
      { label: 'Histórico', icon: History,   onClick: () => setShowHistoryModal(true) },
      { label: 'Atualizar', icon: RefreshCw, onClick: fetchOrdens, disabled: loading },
    ],
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <EnterprisePageBase
      title="2.10 Separar Pedidos"
      breadcrumbItems={[{ label: 'OPERAR', path: '/operacao' }]}
      actionGroups={actionGroups}
    >
      {/* ── VIEW ATIVA ─────────────────────────────────────────────────── */}
      {view === 'ACTIVE' && selectedOrder && (() => {
        const progress      = calculateProgress(selectedOrder.orderItems);
        const totalExpected = selectedOrder.orderItems.reduce((a, i) => a + i.expected, 0);
        const totalCollected = selectedOrder.orderItems.reduce((a, i) => a + i.collected, 0);

        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-header da ordem ativa */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                  Separação Ativa — <span className="text-yellow-500">{selectedOrder.numero}</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedOrder.client}</p>
              </div>
            </div>

            {/* Cards de Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Data Ordem',       value: selectedOrder.date,          icon: CalendarDays },
                { label: 'Itens Coletados',  value: `${totalCollected} / ${totalExpected}` },
                { label: 'Progresso Geral',  value: `${progress}%` },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-black text-sm flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-yellow-500" />} {value}
                  </p>
                </div>
              ))}
              <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Evolução</p>
                <p className="text-sm font-black mb-2">{progress}%</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Scanner */}
            <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center shrink-0">
                  <ScanBarcode className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <label htmlFor="picking-scan-input" className="sr-only">Bipe ou digite o SKU ou EAN do produto</label>
                  <input
                    id="picking-scan-input"
                    ref={scanInputRef}
                    type="text"
                    value={scanValue}
                    onChange={e => setScanValue(e.target.value)}
                    onKeyDown={handleScan}
                    placeholder="Bipe o SKU ou EAN do produto..."
                    className={`w-full bg-slate-50 border-2 ${scanError ? 'border-red-400' : 'border-slate-200'} rounded-sm py-3 px-4 text-sm font-bold focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all`}
                  />
                </div>
              </div>
              {scanError && (
                <div role="alert" className="mt-3 flex items-center gap-2 text-red-600 text-xs font-black animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" /> {scanError}
                </div>
              )}
            </div>

            {/* Modal Finalização Parcial */}
            {showFinalizeModal && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div role="dialog" aria-modal="true" className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Itens pendentes</p>
                        <p className="text-[10px] text-slate-400">Nem todos os itens foram coletados. Deseja finalizar mesmo assim?</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button ref={finalizeCloseBtnRef} onClick={() => setShowFinalizeModal(false)}
                        className="flex-1 py-2.5 border-2 border-slate-200 rounded-sm text-xs font-black text-slate-500 hover:border-slate-400 transition-all">
                        Cancelar
                      </button>
                      <button onClick={confirmarFinalizacao} disabled={saving}
                        className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-sm text-xs font-black active:scale-95 transition-all shadow-md disabled:opacity-50">
                        {saving ? 'Salvando...' : 'Finalizar mesmo assim'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Itens */}
            <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
                    <th scope="col" className="px-6 py-4">Produto / SKU</th>
                    <th scope="col" className="px-6 py-4">Endereço</th>
                    <th scope="col" className="px-6 py-4 text-center">Esperado</th>
                    <th scope="col" className="px-6 py-4 text-center">Coletado</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedOrder.orderItems.map((item) => {
                    const isDone = item.collected >= item.expected;
                    const isScanning = lastScannedId === item.id;
                    return (
                      <tr key={item.id} className={`${isScanning ? 'bg-green-50 ring-2 ring-green-400 ring-inset' : ''} ${isDone ? 'opacity-60 bg-slate-50/30' : ''} transition-all duration-300`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                              {isDone ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-black text-xs">{item.desc}</p>
                              <p className="text-[9px] font-bold text-slate-400">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/5 rounded-sm border border-black/10">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-black font-mono">{item.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-sm">{item.expected}</td>
                        <td className="px-6 py-4 text-center font-black text-lg text-yellow-500">{item.collected}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-tighter border ${
                              isDone
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : item.pulado
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {isDone ? 'Completo' : item.pulado ? 'Pulado' : 'Pendente'}
                            </span>
                            {!isDone && !item.pulado && (
                              <button onClick={() => handlePularItem(item.id)}
                                className="text-[8px] font-black text-slate-400 hover:text-amber-600 uppercase tracking-wider transition-colors">
                                Pular →
                              </button>
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
        );
      })()}

      {/* ── VIEW LISTA ─────────────────────────────────────────────────── */}
      {view === 'LIST' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Filtros + título */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium">Gestão de Ordens de Venda procedentes do Omie</p>
            <div className="flex p-1 bg-white border border-slate-200 rounded-sm shadow-sm">
              {['Todos', 'Pendente', 'Em Separação', 'Concluído'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-sm transition-all ${filter === s ? 'bg-black text-white shadow-sm' : 'text-slate-400 hover:text-black'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm border-l-4 border-l-black">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total na Fila</p>
              <p className="text-xl font-black">{orders.length}</p>
            </div>
            <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm border-l-4 border-l-amber-400">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Processo</p>
              <p className="text-xl font-black">{orders.filter(o => o.status === 'Em Separação').length}</p>
            </div>
            <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm border-l-4 border-l-green-500">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Concluídas Hoje</p>
              <p className="text-xl font-black">{orders.filter(o => o.status === 'Concluído').length}</p>
            </div>
            <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-sm border-l-4 border-l-yellow-400">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
              <p className="text-xl font-black">{performancePct}%</p>
            </div>
          </div>

          {/* Lista de Ordens */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const progress = calculateProgress(order.orderItems);
                return (
                  <div key={order.id}
                    className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-wrap items-center gap-6 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'Concluído' ? 'bg-green-500' : order.status === 'Em Separação' ? 'bg-amber-400' : 'bg-black'}`} />
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                      <div className="w-12 h-12 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-black text-base">{order.numero}</span>
                          <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-600 uppercase truncate max-w-[200px]">{order.client}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {order.date}
                          </span>
                          <div className="flex-1 max-w-[150px]">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Progresso</p>
                              <p className="text-[8px] font-black text-yellow-500">{progress}%</p>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pr-4 border-l border-slate-100 pl-6">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">SKUs</p>
                        <p className="font-black text-xl">{order.items}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unidades</p>
                        <p className="font-black text-xl">{order.totalQty}</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Valor</p>
                        <p className="font-black text-sm text-slate-600">{order.value}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartPicking(order)}
                      disabled={order.status === 'Concluído'}
                      className={`h-11 px-5 rounded-sm font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all active:scale-95 ${
                        order.status === 'Concluído'
                          ? 'bg-green-100 text-green-700 border border-green-200 cursor-default disabled:opacity-80'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-sm'
                      }`}
                    >
                      {order.status === 'Concluído' ? (
                        <>Concluído <Check className="w-4 h-4" /></>
                      ) : order.status === 'Em Separação' ? (
                        <>Continuar <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Iniciar <Play className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-30 select-none">
              <ShoppingCart className="w-20 h-20 mb-4" />
              <p className="font-black uppercase tracking-widest">Nenhuma ordem encontrada</p>
            </div>
          )}

          {/* Modal Histórico */}
          {showHistoryModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
              <div role="dialog" aria-modal="true"
                className="bg-white w-full max-w-2xl max-h-[70vh] rounded-sm shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-black italic">Histórico de Atividades</h2>
                  <button ref={historyCloseBtnRef} onClick={() => setShowHistoryModal(false)}
                    aria-label="Fechar histórico" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 text-center opacity-50">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-xs font-bold uppercase tracking-widest">Módulo de Business Intelligence em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EnterprisePageBase>
  );
}
