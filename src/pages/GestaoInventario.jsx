import React, { useState, useMemo } from 'react';
import { 
    Search, RefreshCw, MapPin, Package, AlertTriangle, 
    Check, X, Minus, Plus, ClipboardList, Lock, Unlock 
} from 'lucide-react';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { useApp } from '../hooks/useApp';
import { useInventory } from '../hooks/useInventory';

/**
 * Gestão de Inventário (Operacional)
 * Foco: Contagens, Ajustes e Bloqueios
 */
export default function GestaoInventario() {
    const { warehouseId, currentUser } = useApp();
    const { rows, loading, stats, adjusting, refetch, ajustarEstoque } = useInventory(warehouseId);

    const [search, setSearch] = useState('');
    const [modalRow, setModalRow] = useState(null);
    const [novaQtd, setNovaQtd] = useState('0');
    const [motivo, setMotivo] = useState('');

    const filtrados = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter(r => 
            (r.endereco ?? '').toLowerCase().includes(q) || 
            (r.sku ?? '').toLowerCase().includes(q) ||
            (r.produto ?? '').toLowerCase().includes(q)
        );
    }, [rows, search]);

    const handleAjuste = async () => {
        if (!modalRow) return;
        const res = await ajustarEstoque({
            produtoId: modalRow.produto_id,
            enderecoId: modalRow.endereco_id,
            sku: modalRow.sku,
            descricao: modalRow.produto,
            novaQuantidade: Number(novaQtd),
            quantidadeAtual: modalRow.quantidade,
            operadorId: currentUser?.id,
            motivo: motivo || 'CONTAGEM OPERACIONAL'
        });
        if (res.success) {
            setModalRow(null);
            setMotivo('');
        }
    };

    return (
        <EnterprisePageBase 
            title="Gestão Operacional de Inventário" 
            breadcrumbItems={[{ label: 'Estoque', path: '/estoque' }, { label: 'Gestão' }]}
        >
            <main className="space-y-6 animate-in fade-in duration-500">
                {/* Header/Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/3 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Divergências</p>
                        <p className="text-2xl font-black text-red-500 mt-1">{stats.criticos}</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ocupação</p>
                        <p className="text-2xl font-black text-white mt-1">{((stats.ocupados / stats.totalEnderecos) * 100).toFixed(1)}%</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="FILTRAR POR ENDEREÇO OU SKU..."
                            className="w-full h-12 pl-12 bg-black/40 border border-white/10 rounded-xl text-xs text-white uppercase font-bold outline-none focus:border-[var(--vp-primary)]"
                        />
                    </div>
                    <button onClick={refetch} className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white flex items-center gap-2 hover:bg-white/10 transition-all">
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={14} /> SINCRONIZAR
                    </button>
                </div>

                {/* Tabela Operacional */}
                <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-4 whitespace-nowrap">Endereço</th>
                                <th className="p-4">SKU / Conteúdo</th>
                                <th className="p-4">Saldo</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtrados.map(r => (
                                <tr key={r.endereco_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-mono text-xs font-black text-white">{r.endereco}</td>
                                    <td className="p-4">
                                        <div className="text-[10px] font-black text-[var(--vp-primary)]">{r.sku || 'LIVRE'}</div>
                                        <div className="text-[9px] text-white/30 truncate max-w-[200px] uppercase">{r.produto}</div>
                                    </td>
                                    <td className="p-4 font-black text-white text-lg">{r.quantidade ?? 0}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => { setModalRow(r); setNovaQtd(String(r.quantidade ?? 0)); }}
                                                className="p-2.5 bg-white/5 hover:bg-[var(--vp-primary)] hover:text-black rounded-lg border border-white/10 transition-all shadow-lg shadow-black/20"
                                            >
                                                <ClipboardList size={16} />
                                            </button>
                                            <button className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-lg border border-white/10 transition-all">
                                                <Lock size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Contagem (Simples) */}
                {modalRow && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Lançar Contagem</h3>
                                <button onClick={() => setModalRow(null)} className="text-white/20 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Endereço: <span className="text-white">{modalRow.endereco}</span></p>
                                    <div className="flex items-center justify-center gap-6 mt-6">
                                        <button onClick={() => setNovaQtd(v => String(Math.max(0, Number(v) - 1)))} className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white"><Minus /></button>
                                        <input 
                                            type="number" 
                                            value={novaQtd} 
                                            onChange={e => setNovaQtd(e.target.value)}
                                            className="w-24 text-center text-4xl font-black bg-transparent text-white outline-none border-b border-white/10 focus:border-[var(--vp-primary)]"
                                        />
                                        <button onClick={() => setNovaQtd(v => String(Number(v) + 1))} className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white"><Plus /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Observação do Ajuste</label>
                                    <input 
                                        value={motivo} 
                                        onChange={e => setMotivo(e.target.value)}
                                        placeholder="EX: DIVERGÊNCIA CONTAGEM CÍCLICA"
                                        className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[var(--vp-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-white/3 flex gap-3">
                                <button onClick={() => setModalRow(null)} className="flex-1 h-12 text-[10px] font-black text-white/30 uppercase tracking-widest">Cancelar</button>
                                <button 
                                    onClick={handleAjuste}
                                    disabled={adjusting}
                                    className="flex-1 h-12 bg-[var(--vp-primary)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    {adjusting ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />} Confirmar Saldo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </EnterprisePageBase>
    );
}
