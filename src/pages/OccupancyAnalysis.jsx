import React, { useMemo } from 'react';
import { Layers, Database, Box, Info } from 'lucide-react';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { useApp } from '../hooks/useApp';
import { useInventory } from '../hooks/useInventory';

/**
 * Análise de Ocupação (Indicadores)
 * Rota 8.2
 */
export default function OccupancyAnalysis() {
    const { warehouseId } = useApp();
    const { rows, loading, stats } = useInventory(warehouseId);

    // Agrupamento por Rua/Setor para o mapa visual
    const groupedData = useMemo(() => {
        const groups = {};
        rows.forEach(r => {
            const key = r.rua || 'ÁREA GERAL';
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        });
        return groups;
    }, [rows]);

    return (
        <EnterprisePageBase 
            title="Mapa de Ocupação e Densidade"
            breadcrumbItems={[{ label: 'Indicadores', path: '/indicadores' }, { label: 'Ocupação' }]}
        >
            <main className="space-y-8 animate-in fade-in duration-500">
                {/* Dash Rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/3 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Layers className="text-blue-500" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Taxa de Ocupação</span>
                        </div>
                        <p className="text-4xl font-black text-white">{loading ? '...' : `${((stats.ocupados / stats.totalEnderecos) * 100).toFixed(1)}%`}</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Database className="text-[var(--vp-primary)]" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Endereços Ativos</span>
                        </div>
                        <p className="text-4xl font-black text-white">{loading ? '...' : stats.totalEnderecos}</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Box className="text-green-500" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Posições Ocupadas</span>
                        </div>
                        <p className="text-4xl font-black text-white">{loading ? '...' : stats.ocupados}</p>
                    </div>
                </div>

                {/* Grid de Ocupação */}
                <div className="space-y-10">
                    {Object.entries(groupedData).map(([name, items]) => (
                        <section key={name} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Setor / Rua {name}</h3>
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px] font-black text-white/20 uppercase">{items.length} POSIÇÕES</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                                {items.map(r => (
                                    <div 
                                        key={r.endereco_id}
                                        title={`${r.endereco} | ${r.sku || 'Disponível'}`}
                                        className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all hover:scale-110 cursor-help ${
                                            r.sku 
                                                ? (r.nivel_estoque === 'Crítico' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-green-500/20 border-green-500/30 text-green-500')
                                                : 'bg-white/5 border-white/10 opacity-40'
                                        }`}
                                    >
                                        <span className="text-[7px] font-black font-mono">{r.endereco.slice(-2)}</span>
                                        {r.sku && <Box size={10} className="mt-1" />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Info */}
                <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex gap-4">
                    <Info className="text-blue-400 shrink-0" size={20} />
                    <p className="text-xs text-blue-200/50 leading-relaxed">
                        Este mapa reflete a ocupação em tempo real do armazém. Posições em <span className="text-red-400 font-bold uppercase">Vermelho</span> indicam estoque crítico em relação ao mínimo configurado. Posições em <span className="text-green-400 font-bold uppercase">Verde</span> indicam estoque normal. Blocos translúcidos indicam endereços vazios.
                    </p>
                </div>
            </main>
        </EnterprisePageBase>
    );
}
