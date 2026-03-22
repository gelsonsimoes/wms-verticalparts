// 4.6 Conferência de Saída — Ciclo Expedição Omie
// Mostra pedidos separados pelo Mobile aguardando conferência física
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    CheckCircle2, Clock, Truck, ShoppingCart, Box, X, RefreshCw,
    List, Search, Printer, AlertCircle, MapPin, PackageCheck, Weight,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp }   from '../hooks/useApp';

// ── STATUS MAP ───────────────────────────────────────────────────────────────
const STATUS_STYLE = {
    separado:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    conferido:  'bg-green-500/10  text-green-400  border-green-500/20',
    despachado: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
};
const STATUS_LABEL = {
    separado:   'Aguard. Conferência',
    conferido:  'Conferido',
    despachado: 'Despachado',
};

// ── SKELETON ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-white/5 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
                <td key={i} className="p-6">
                    <div className="h-3 bg-white/5 rounded-full w-24" />
                </td>
            ))}
        </tr>
    );
}

// ── GERADOR DE ETIQUETA PDF (zero dependências) ───────────────────────────────
function gerarEtiquetaVolume(pedido, itens) {
    const agora = new Date().toLocaleString('pt-BR');
    const itensRows = itens.map(i => `
        <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;font-weight:bold;">${i.sku ?? '—'}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;">${i.descricao ?? i.sku ?? '—'}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:center;">${i.quantidade_separada ?? 0}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#6b7280;">${i.endereco_reservado ?? '—'}</td>
        </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Etiqueta de Volume — ${pedido.numero_pedido}</title>
  <style>
    @page { size: A4; margin: 18mm 20mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111; background: #fff; margin: 0; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #111; padding-bottom:16px; margin-bottom:20px; }
    .logo { font-size:22px; font-weight:900; letter-spacing:-1px; text-transform:uppercase; }
    .logo span { color:#d97706; }
    .pedido-num { font-size:32px; font-weight:900; font-family:monospace; letter-spacing:2px; }
    .badge { display:inline-block; background:#d97706; color:#fff; font-size:9px; font-weight:900; letter-spacing:2px; text-transform:uppercase; padding:4px 10px; border-radius:4px; margin-bottom:8px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
    .info-box { border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
    .info-label { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:4px; }
    .info-value { font-size:14px; font-weight:700; }
    table { width:100%; border-collapse:collapse; }
    thead th { background:#111; color:#fff; padding:8px; text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:1px; }
    .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:9px; color:#9ca3af; display:flex; justify-content:space-between; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Vertical<span>Parts</span> WMS</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px;">Sistema de Gerenciamento de Armazém</div>
  </div>
  <div style="text-align:right;">
    <div class="badge">Etiqueta de Volume</div>
    <div class="pedido-num">${pedido.numero_pedido}</div>
  </div>
</div>
<div class="info-grid">
  <div class="info-box">
    <div class="info-label">Cliente</div>
    <div class="info-value">${pedido.cliente_nome ?? '—'}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Volumes / Peso Separado</div>
    <div class="info-value">${pedido.volumes ?? 1} vol · ${pedido.peso_total_separado != null ? Number(pedido.peso_total_separado).toLocaleString('pt-BR') + ' kg' : 'N/D'}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Veículo / Placa</div>
    <div class="info-value" style="font-family:monospace;">${pedido.veiculo_placa ?? '—'}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Data de Separação</div>
    <div class="info-value">${pedido.atualizado_em ? new Date(pedido.atualizado_em).toLocaleString('pt-BR') : '—'}</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>SKU</th>
      <th>Descrição</th>
      <th style="text-align:center;">Qtd</th>
      <th>Endereço Reservado</th>
    </tr>
  </thead>
  <tbody>${itensRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#9ca3af;">Sem itens registrados</td></tr>'}</tbody>
</table>
<div class="footer">
  <span>Emitido em: ${agora} — WMS VerticalParts v4.3.23</span>
  <span>Pedido Omie: ${pedido.numero_omie ?? pedido.numero_pedido}</span>
</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=720,menubar=yes,toolbar=yes');
    if (!win) {
        alert('Pop-up bloqueado. Libere pop-ups para este site e tente novamente.');
        return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 650);
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function OutboundMonitoring() {
    const { user }   = useApp();

    const [pedidos,       setPedidos]       = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState('');
    const [filtroStatus,  setFiltroStatus]  = useState('separado');
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [activePedido,  setActivePedido]  = useState(null);
    const [drawerItens,   setDrawerItens]   = useState([]);
    const [loadingItens,  setLoadingItens]  = useState(false);
    const [conferindo,    setConferindo]    = useState(null); // id do pedido em conferência

    const [toast,  setToast]  = useState(null);
    const toastRef = useRef(null);

    const showToast = (msg, type = 'success') => {
        if (toastRef.current) clearTimeout(toastRef.current);
        setToast({ msg, type });
        toastRef.current = setTimeout(() => setToast(null), 4500);
    };

    // ── Busca pedidos ─────────────────────────────────────────────────────────
    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        try {
            let q = supabase
                .from('pedidos_venda_omie')
                .select('*, itens_pedido_omie(id)')
                .order('atualizado_em', { ascending: false });

            if (filtroStatus === 'todos') {
                q = q.in('status', ['separado', 'conferido', 'despachado']);
            } else {
                q = q.eq('status', filtroStatus);
            }

            const { data, error } = await q;
            if (error) throw error;
            setPedidos(data ?? []);
        } catch (e) {
            console.error('[OutboundMonitoring]', e);
        } finally {
            setLoading(false);
        }
    }, [filtroStatus]);

    useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

    // Realtime updates
    useEffect(() => {
        const ch = supabase
            .channel('outbound_omie_conf')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_venda_omie' }, fetchPedidos)
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [fetchPedidos]);

    // ── Abrir drawer ──────────────────────────────────────────────────────────
    const openDrawer = async (pedido) => {
        setActivePedido(pedido);
        setDrawerOpen(true);
        setDrawerItens([]);
        setLoadingItens(true);
        const { data } = await supabase
            .from('itens_pedido_omie')
            .select('*')
            .eq('pedido_id', pedido.id)
            .order('endereco_reservado', { ascending: true });
        setDrawerItens(data ?? []);
        setLoadingItens(false);
    };

    // ── Conferir pedido ───────────────────────────────────────────────────────
    const conferirPedido = async (pedido) => {
        if (conferindo) return;
        setConferindo(pedido.id);
        try {
            const { error } = await supabase
                .from('pedidos_venda_omie')
                .update({
                    status:       'conferido',
                    conferido_por: user?.email ?? user?.nome ?? 'Operador Web',
                    conferido_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString(),
                })
                .eq('id', pedido.id);
            if (error) throw error;
            showToast(`✓ Pedido ${pedido.numero_pedido} conferido com sucesso!`);
            fetchPedidos();
            if (activePedido?.id === pedido.id) {
                setActivePedido(prev => ({ ...prev, status: 'conferido' }));
            }
        } catch (e) {
            showToast('Erro ao conferir pedido: ' + e.message, 'error');
        } finally {
            setConferindo(null);
        }
    };

    // ── Emitir etiqueta de volume ─────────────────────────────────────────────
    const emitirEtiqueta = async (pedido) => {
        let itens = drawerItens.length > 0 ? drawerItens : null;
        if (!itens) {
            const { data } = await supabase
                .from('itens_pedido_omie')
                .select('*')
                .eq('pedido_id', pedido.id)
                .order('endereco_reservado', { ascending: true });
            itens = data ?? [];
        }
        gerarEtiquetaVolume(pedido, itens);
    };

    // ── Filtro de busca local ─────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return pedidos;
        return pedidos.filter(p =>
            (p.numero_pedido ?? '').toLowerCase().includes(q) ||
            (p.cliente_nome  ?? '').toLowerCase().includes(q) ||
            (p.numero_omie   ?? '').toLowerCase().includes(q) ||
            (p.veiculo_placa ?? '').toLowerCase().includes(q)
        );
    }, [pedidos, search]);

    const totalSeparado  = pedidos.filter(p => p.status === 'separado').length;
    const totalConferido = pedidos.filter(p => p.status === 'conferido').length;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <main className="space-y-6 p-4 md:p-6 animate-fade-up">

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-full shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                    {toast.type === 'error'
                        ? <AlertCircle className="w-4 h-4 shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 shrink-0" />
                    }
                    {toast.msg}
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl border border-white/10 shadow-lg">
                        <PackageCheck className="w-5 h-5 text-[var(--vp-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase flex items-center gap-2">
                            Conferência de <span className="text-[var(--vp-primary)] italic">Saída</span>
                            <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-full text-white/40 font-mono tracking-widest border border-white/10">OMIE</span>
                        </h1>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">
                            Ciclo de Expedição — Pedidos Separados pelo Mobile Aguardando Conferência
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400">{totalSeparado} AGUARDANDO</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-black text-green-400">{totalConferido} CONFERIDOS</span>
                    </div>
                    <button
                        onClick={fetchPedidos}
                        disabled={loading}
                        className="flex items-center gap-2 text-[10px] font-black text-white px-5 py-2.5 vp-glass rounded-xl border-white/10 hover:border-[var(--vp-primary)] transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-[var(--vp-primary)] ${loading ? 'animate-spin' : ''}`} />
                        ATUALIZAR
                    </button>
                </div>
            </header>

            {/* ── FILTROS ── */}
            <div className="vp-glass rounded-2xl p-4 flex flex-wrap gap-4 items-center border-white/5">
                <div className="relative flex-1 min-w-[260px]">
                    <Search className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="BUSCAR PEDIDO, CLIENTE OU PLACA..."
                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 focus:border-[var(--vp-primary)] rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
                    />
                </div>
                <div className="flex items-center gap-1 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                    {[
                        { key: 'separado',  label: 'Para Conferir' },
                        { key: 'conferido', label: 'Conferidos'    },
                        { key: 'todos',     label: 'Todos'         },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFiltroStatus(key)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                                filtroStatus === key
                                    ? 'bg-[var(--vp-primary)] text-black'
                                    : 'text-white/20 hover:text-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TABELA ── */}
            <div className="vp-glass rounded-3xl overflow-hidden border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/3 border-b border-white/5">
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Pedido / Omie</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Status</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Cliente / Placa</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Peso / Volumes</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && pedidos.length === 0
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                : filtered.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center">
                                            <Box className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                {filtroStatus === 'separado'
                                                    ? 'Nenhum pedido aguardando conferência'
                                                    : 'Nenhum pedido encontrado para o filtro selecionado'
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                )
                                : filtered.map(pedido => {
                                    const stClass = STATUS_STYLE[pedido.status] ?? 'bg-white/5 text-white/30 border-white/10';
                                    const stLabel = STATUS_LABEL[pedido.status] ?? pedido.status;
                                    const totalItens = pedido.itens_pedido_omie?.length ?? 0;
                                    return (
                                        <tr key={pedido.id} className="vp-table-row group">
                                            <td className="p-5">
                                                <div className="text-base font-black text-white tracking-tighter group-hover:text-[var(--vp-primary)] transition-colors font-mono">
                                                    {pedido.numero_pedido}
                                                </div>
                                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">
                                                    {totalItens} SKU(s) · Omie: {pedido.numero_omie ?? '—'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`vp-badge flex items-center gap-2 border w-fit px-3 py-1.5 ${stClass}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        pedido.status === 'conferido'
                                                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                            : 'bg-amber-400 animate-pulse'
                                                    }`} />
                                                    {stLabel}
                                                </span>
                                            </td>
                                            <td className="p-5 max-w-[200px]">
                                                <div className="text-xs font-black text-white truncate uppercase tracking-tight">
                                                    {pedido.cliente_nome ?? '—'}
                                                </div>
                                                {pedido.veiculo_placa && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Truck className="w-3 h-3 text-white/20" />
                                                        <span className="text-[9px] text-white/30 font-black font-mono uppercase tracking-widest">
                                                            {pedido.veiculo_placa}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="text-xs font-black text-white/70 flex items-center gap-1.5">
                                                    <Weight className="w-3 h-3 text-white/20" />
                                                    {pedido.peso_total_separado != null
                                                        ? `${Number(pedido.peso_total_separado).toLocaleString('pt-BR')} kg`
                                                        : <span className="text-white/20">—</span>
                                                    }
                                                </div>
                                                <div className="text-[9px] text-white/20 font-bold mt-0.5 pl-4.5">
                                                    {pedido.volumes ?? 1} vol.
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Botão Conferir — só para status separado */}
                                                    {pedido.status === 'separado' && (
                                                        <button
                                                            onClick={() => conferirPedido(pedido)}
                                                            disabled={conferindo === pedido.id}
                                                            className="px-3 py-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/20 rounded-xl transition-all active:scale-90 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            {conferindo === pedido.id
                                                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                : <CheckCircle2 className="w-3.5 h-3.5" />
                                                            }
                                                            Conferir
                                                        </button>
                                                    )}
                                                    {/* Botão Detalhes */}
                                                    <button
                                                        onClick={() => openDrawer(pedido)}
                                                        className="p-2.5 bg-white/5 hover:bg-[var(--vp-primary)] hover:text-black text-white/40 border border-white/5 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <List className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── GAVETA LATERAL ── */}
            {drawerOpen && activePedido && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDrawerOpen(false)} />
                    <aside className="w-full max-w-lg bg-[#0A0A0A] border-l border-white/10 relative z-[110] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500">

                        {/* Header gaveta */}
                        <div className="p-8 bg-black border-b border-white/5 relative">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
                                aria-label="Fechar"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-5 mt-4">
                                <div className="p-4 bg-[var(--vp-primary)]/10 rounded-2xl border border-[var(--vp-primary)]/20">
                                    <ShoppingCart className="w-8 h-8 text-[var(--vp-primary)]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter">
                                        Pedido <span className="text-[var(--vp-primary)] font-mono">{activePedido.numero_pedido}</span>
                                    </h2>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">
                                        {activePedido.cliente_nome ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de itens */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {loadingItens
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                                ))
                                : drawerItens.length === 0
                                ? (
                                    <div className="text-center py-20">
                                        <Box className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                            Nenhum item encontrado
                                        </p>
                                    </div>
                                )
                                : drawerItens.map(item => {
                                    const pct = item.quantidade_pedida > 0
                                        ? Math.min(100, ((item.quantidade_separada ?? 0) / item.quantidade_pedida) * 100)
                                        : 0;
                                    return (
                                        <div key={item.id} className="p-5 vp-glass rounded-2xl border-white/5 hover:border-[var(--vp-primary)]/20 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="min-w-0">
                                                    <p className="font-black text-sm text-white truncate group-hover:text-[var(--vp-primary)] transition-colors uppercase tracking-tight">
                                                        {item.descricao ?? item.sku}
                                                    </p>
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5 font-mono">
                                                        SKU: {item.sku}
                                                    </p>
                                                    {item.endereco_reservado && (
                                                        <div className="flex items-center gap-1 mt-1.5">
                                                            <MapPin className="w-3 h-3 text-[var(--vp-primary)]/60 shrink-0" />
                                                            <span className="text-[10px] font-black text-[var(--vp-primary)]/80 font-mono uppercase">
                                                                {item.endereco_reservado}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0 ml-3">
                                                    <p className="text-xl font-black text-white leading-none">{item.quantidade_separada ?? 0}</p>
                                                    <p className="text-[9px] font-black text-white/20 uppercase mt-1">de {item.quantidade_pedida}</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--vp-primary)] transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Footer gaveta */}
                        <div className="p-6 border-t border-white/5 bg-black/40 space-y-3">
                            {/* Métricas rápidas */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                    <p className={`text-xs font-black ${activePedido.status === 'conferido' ? 'text-green-400' : 'text-amber-400'}`}>
                                        {STATUS_LABEL[activePedido.status] ?? activePedido.status}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Peso</p>
                                    <p className="text-xs font-black text-white">
                                        {activePedido.peso_total_separado != null
                                            ? `${Number(activePedido.peso_total_separado).toLocaleString('pt-BR')} kg`
                                            : '—'
                                        }
                                    </p>
                                </div>
                                <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Volumes</p>
                                    <p className="text-xs font-black text-white">{activePedido.volumes ?? 1}</p>
                                </div>
                            </div>

                            {/* Emitir Etiqueta */}
                            <button
                                onClick={() => emitirEtiqueta(activePedido)}
                                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4 text-[var(--vp-primary)]" />
                                Emitir Etiqueta de Volume
                            </button>

                            {/* Conferir (somente se ainda separado) */}
                            {activePedido.status === 'separado' && (
                                <button
                                    onClick={() => conferirPedido(activePedido)}
                                    disabled={conferindo === activePedido.id}
                                    className="w-full py-4 bg-[var(--vp-primary)] hover:bg-amber-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {conferindo === activePedido.id
                                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                                        : <CheckCircle2 className="w-4 h-4" />
                                    }
                                    Confirmar Conferência
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
