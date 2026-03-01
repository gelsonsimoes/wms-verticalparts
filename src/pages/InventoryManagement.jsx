import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Edit2, 
  Activity,
  ArrowLeft,
  Package,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Box
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';

export default function InventoryManagement() {
  const [view, setView] = useState('master'); // 'master' or 'monitor'
  const [searchTerm, setSearchTerm] = useState('');

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Estoque', path: '/estoque/gestao-inventario' },
    { label: 'Gerenciamento', path: null },
  ];

  const actions = [
    [
      { label: 'Novo Inventário', primary: true, icon: <Plus size={14}/>, onClick: () => {} },
      { label: 'Ajuste de Saldo', icon: <Edit2 size={14}/>, onClick: () => {} }
    ],
    [
      { label: 'Transferência', icon: <RefreshCw size={14}/>, onClick: () => {} },
      { label: 'Monitorar Real-Time', icon: <Activity size={14}/>, onClick: () => setView('monitor') }
    ],
    [
      { label: 'Relatórios', icon: <BarChart3 size={14}/>, onClick: () => {} }
    ]
  ];

  const stockColumns = [
    { header: 'SKU', accessor: 'sku', render: (v) => <span className="font-bold text-black">{v}</span> },
    { header: 'Descrição do Produto', accessor: 'name' },
    { header: 'Localização', accessor: 'location', render: (v) => <span className="font-mono text-[var(--vp-text-label)]">{v}</span> },
    { header: 'Qtd Total', accessor: 'qty', render: (v) => <span className="font-bold">{v}</span> },
    { header: 'Disponível', accessor: 'available', render: (v) => <span className="font-bold text-green-700">{v}</span> },
    { header: 'Unidade', accessor: 'unit' },
    { header: 'Última Atu.', accessor: 'updated', render: (v) => <span className="text-[11px] text-gray-500">{v}</span> }
  ];

  const stockData = [
    { sku: 'VPER-PNT-AL-22D-202X145-CT', name: 'Pente de Alumínio - 22 Dentes (202x145mm)', location: 'R1_PP1_CL001_N001', qty: 250, available: 200, unit: 'UN', updated: '26/02/2026 14:30' },
    { sku: 'VPER-ESS-NY-27MM', name: 'Escova de Segurança (Nylon - Base 27mm)', location: 'R2_PP3_CL005_N002', qty: 120, available: 90, unit: 'UN', updated: '26/02/2026 10:15' },
    { sku: 'VPER-PAL-INO-1000', name: 'Pallet de Aço Inox (1000mm)', location: 'R3_PP1_CL001_N001', qty: 500, available: 400, unit: 'UN', updated: '25/02/2026 16:45' },
    { sku: 'VPER-INC-ESQ', name: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', location: 'R1_PP1_CL001_N004', qty: 180, available: 120, unit: 'UN', updated: '26/02/2026 09:20' }
  ];

  if (view === 'monitor') {
    return (
      <div className="p-6 bg-[var(--vp-bg-alt)] min-h-screen font-sans">
        <button onClick={() => setView('master')} className="flex items-center gap-2 text-xs font-black text-[var(--vp-text-label)] hover:text-[var(--vp-primary)] mb-6 uppercase tracking-widest transition-colors">
          <ArrowLeft size={16}/> Voltar para Gestão de Estoque
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[var(--vp-text-data)] flex items-center gap-3 tracking-tight">
            <Activity className="text-[var(--vp-primary)]" size={28}/> MONITORAMENTO EM TEMPO REAL
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">Acompanhamento de movimentações e críticas de inventário</p>
        </div>
        <DataGrid columns={stockColumns} data={stockData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--vp-bg-alt)] font-sans">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-[var(--vp-border)]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-[var(--vp-secondary)] p-2 rounded-sm shadow-sm">
            <Box className="text-[var(--vp-primary)]" size={20}/>
          </div>
          <h1 className="text-2xl font-black text-[var(--vp-text-data)] leading-tight tracking-tight uppercase">Gerenciamento de Estoque</h1>
        </div>
      </div>

      <ActionPane title="Operações de Inventário" groups={actions} />

      <div className="p-6 space-y-4">
        {/* FastTab: KPIs Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-[var(--vp-primary)]">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Ocupação Total</label>
            <div className="text-2xl font-black text-[var(--vp-text-data)]">78.4%</div>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1 uppercase">
              <TrendingUp size={10}/> Estável
            </div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-red-600">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Divergências</label>
            <div className="text-2xl font-black text-red-600">03 SKUs</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Requer auditoria</div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-green-600">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Acuracidade</label>
            <div className="text-2xl font-black text-green-700">99.1%</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Meta: 99.5%</div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-blue-600">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Giro Médio</label>
            <div className="text-2xl font-black text-blue-600">4.5x</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Mensal</div>
          </div>
        </div>

        <FastTab title="Visão Geral do Estoque Disponível" defaultOpen={true}>
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input 
                type="text" 
                placeholder="Buscar por SKU, Localização ou Descrição..." 
                className="w-full pl-10 pr-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm focus:border-[var(--vp-primary)] outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary p-2 flex items-center gap-2">
              <Filter size={16}/> <span className="text-[10px] font-bold uppercase">Filtros Avançados</span>
            </button>
          </div>
          <DataGrid 
            columns={stockColumns} 
            data={stockData.filter(i => 
              i.sku.includes(searchTerm.toUpperCase()) || 
              i.name.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
          />
        </FastTab>
      </div>
    </div>
  );
}
