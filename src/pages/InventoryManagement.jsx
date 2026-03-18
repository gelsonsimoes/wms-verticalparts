import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Activity,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Box,
  X,
} from 'lucide-react';

// Constantes de modo de visualização (evitam magic strings)
const VIEWS = Object.freeze({ MASTER: 'master', MONITOR: 'monitor' });
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';
import { useLocation } from 'react-router-dom';
import { appRoutes } from '../routes';

export default function InventoryManagement() {
  const [view,                setView]                = useState(VIEWS.MASTER);
  const [searchTerm,          setSearchTerm]          = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const location = useLocation();

  const currentRoute = appRoutes.find(r => r.path === location.pathname);
  const pageTitle = currentRoute?.meta ? `${currentRoute.meta.codigo} ${currentRoute.meta.titulo}` : 'Gerenciamento de Estoque';

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Estoque', path: location.pathname },
    { label: currentRoute?.meta?.titulo || 'Gerenciamento', path: null },
  ];

  const actions = [
    [
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: modal de criação de inventário
      { label: 'Novo Inventário',     primary: true, icon: Plus,      onClick: () => console.warn('Novo Inventário: INTEGRAÇÃO NECESSÁRIA') },
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/inventory/balance-adjustment
      { label: 'Ajuste de Saldo',    icon: Edit2,    onClick: () => console.warn('Ajuste de Saldo: INTEGRAÇÃO NECESSÁRIA') },
    ],
    [
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/inventory/transfer
      { label: 'Transferência',       icon: RefreshCw, onClick: () => console.warn('Transferência: INTEGRAÇÃO NECESSÁRIA') },
      { label: 'Monitorar Real-Time', icon: Activity,  onClick: () => setView(VIEWS.MONITOR) },
    ],
    [
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: GET /api/inventory/reports
      { label: 'Relatórios',          icon: BarChart3, onClick: () => console.warn('Relatórios: INTEGRAÇÃO NECESSÁRIA') },
    ],
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

  if (view === VIEWS.MONITOR) {
    return (
      <div className="p-6 bg-[var(--vp-bg-alt)] min-h-screen font-sans">
        <button
          onClick={() => setView(VIEWS.MASTER)}
          aria-label="Voltar para Gestão de Estoque"
          className="flex items-center gap-2 text-xs font-black text-[var(--vp-text-label)] hover:text-[var(--vp-primary)] mb-6 uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true"/> Voltar para {pageTitle}
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
          <h1 className="text-2xl font-black text-[var(--vp-text-data)] leading-tight tracking-tight uppercase">{pageTitle}</h1>
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
              {/* label sr-only: visível apenas para leitores de tela */}
              <label htmlFor="search-inventory" className="sr-only">Buscar produto por SKU, Localização ou Descrição</label>
              <input
                id="search-inventory"
                type="text"
                placeholder="Buscar por SKU, Localização ou Descrição..."
                className="w-full pr-10 pl-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm focus:border-[var(--vp-primary)] outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true"/>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-panel"
              className="btn-secondary p-2 flex items-center gap-2"
            >
              <Filter size={16} aria-hidden="true"/>
              <span className="text-[10px] font-bold uppercase">Filtros Avançados</span>
            </button>
          </div>

          {/* Painel de filtros avançados — expansível */}
          {showAdvancedFilters && (
            <div
              id="advanced-filters-panel"
              role="region"
              aria-label="Filtros avançados"
              className="mb-4 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-sm text-xs font-bold text-yellow-700 animate-in fade-in duration-200"
            >
              {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: filtros por status, localização, data */}
              Filtros avançados serão implementados após integração com a API de inventário.
              <button onClick={() => setShowAdvancedFilters(false)} className="ml-auto text-yellow-600 hover:text-yellow-800" aria-label="Fechar filtros avançados">
                <X size={14} aria-hidden="true"/>
              </button>
            </div>
          )}

          {/* Filtro por SKU, Nome e Localização */}
          <DataGrid
            columns={stockColumns}
            data={stockData.filter(i => {
              const q = searchTerm.toLowerCase();
              return (
                i.sku.toUpperCase().includes(searchTerm.toUpperCase()) ||
                i.name.toLowerCase().includes(q) ||
                (i.location ?? '').toLowerCase().includes(q)
              );
            })}
          />
        </FastTab>
      </div>
    </div>
  );
}
