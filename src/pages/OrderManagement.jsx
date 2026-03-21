import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  FileText
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Operação', path: null },
    { label: 'Gerenciamento de Pedidos', path: null },
  ];

  const orderGroups = [
    [
      { label: 'Novo Pedido',       primary: true, icon: Plus,         onClick: () => setToast({ message: 'Funcionalidade "Novo Pedido" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Liberar para WMS',              icon: CheckCircle2,   onClick: () => setToast({ message: 'Funcionalidade "Liberar para WMS" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ],
    [
      { label: 'Bloquear Ordem',               icon: AlertCircle,    onClick: () => setToast({ message: 'Funcionalidade "Bloquear Ordem" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Cancelar',                      icon: Clock,           onClick: () => setToast({ message: 'Funcionalidade "Cancelar Ordem" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ],
    [
      { label: 'Imprimir Etiquetas',            icon: Printer,         onClick: () => setToast({ message: 'Funcionalidade "Imprimir Etiquetas" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Exportar XML/CSV',              icon: Download,        onClick: () => setToast({ message: 'Funcionalidade "Exportar XML/CSV" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ]
  ];

  const orderColumns = [
    { header: 'Ordem', accessor: 'id', render: (v) => <span className="font-black text-black">{v}</span> },
    { header: 'Cliente / Destinatário', accessor: 'customer', render: (v) => (
      <div className="flex flex-col">
        <span className="font-bold text-gray-900">{v}</span>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Consumidor Final</span>
      </div>
    )},
    { header: 'Data Pedido', accessor: 'date' },
    { header: 'Itens', accessor: 'itemsCount', render: (v) => <span className="font-bold">{v}</span> },
    { header: 'Total (BRL)', accessor: 'total', render: (v) => <span className="font-mono font-bold">R$ {v}</span> },
    {
      header: 'Status WMS',
      accessor: 'status',
      render: (v) => {
        const styles = {
          'Pendente': 'bg-yellow-100 text-yellow-800',
          'Em Separação': 'bg-blue-100 text-blue-800',
          'Faturado': 'bg-green-100 text-green-800',
          'Bloqueado': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${styles[v] || 'bg-gray-100 text-gray-800'}`}>
            {v}
          </span>
        );
      }
    },
    { header: 'Prioridade', accessor: 'priority', render: (v) => (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${v === 'Alta' || v === 'Urgente' ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`} />
        <span className={`text-[11px] font-bold uppercase ${v === 'Alta' || v === 'Urgente' ? 'text-red-600' : 'text-gray-600'}`}>{v}</span>
      </div>
    )}
  ];

  const orderData = [
    { id: 'SO-2026-001', customer: 'Elevadores Atlas SP', date: '26/02/2026', itemsCount: 12, total: '4.500,00', status: 'Em Separação', priority: 'Alta' },
    { id: 'SO-2026-002', customer: 'Condomínio Solar', date: '26/02/2026', itemsCount: 3, total: '850,00', status: 'Pendente', priority: 'Normal' },
    { id: 'SO-2026-003', customer: 'Manutenção Predial Silva', date: '25/02/2026', itemsCount: 45, total: '12.300,00', status: 'Faturado', priority: 'Alta' },
    { id: 'SO-2026-004', customer: 'Shopping Center Norte', date: '26/02/2026', itemsCount: 8, total: '2.100,00', status: 'Bloqueado', priority: 'Urgente' },
  ];

  return (
    <div className="min-h-screen bg-[var(--vp-bg-alt)] font-sans">

      {/* Toast */}
      {toast && (
        <div role="alert" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${toast.color} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Fechar notificação" className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-[var(--vp-border)]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-[var(--vp-secondary)] p-2 rounded-sm shadow-sm">
            <ShoppingCart className="text-[var(--vp-primary)]" size={20}/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--vp-text)] leading-tight tracking-tight uppercase">2.22 Gerenciamento de Pedidos</h1>
            <p className="text-[10px] font-bold text-[var(--vp-label)] uppercase mt-1 tracking-widest flex items-center gap-2">
              <FileText size={12} aria-hidden="true"/> Controle de Carteira e Liberação de Ordens
            </p>
          </div>
        </div>
      </div>

      <ActionPane title="Operações de Venda" groups={orderGroups} />

      <div className="p-6 space-y-4">
        {/* Visão de Carteira */}
        <FastTab title="Carteira de Pedidos Ativos" defaultOpen={true}>
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              {/* Label sr-only associa o campo sem texto visível */}
              <label htmlFor="search-order" className="sr-only">Buscar pedidos por ordem, cliente ou status</label>
              <input
                id="search-order"
                type="text"
                placeholder="Filtrar por Ordem, Cliente ou Status..."
                className="w-full pr-10 pl-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm focus:border-[var(--vp-primary)] outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true"/>
            </div>
            <button
              className="btn-secondary px-4 flex items-center gap-2"
              aria-label="Abrir filtros avançados de pedidos"
              onClick={() => setToast({ message: 'Filtros avançados — funcionalidade em desenvolvimento.', color: 'bg-amber-500 text-white' })}
            >
              <Filter size={16} aria-hidden="true"/> <span className="text-[10px] font-bold uppercase">Filtros</span>
            </button>
          </div>

          <DataGrid
            columns={orderColumns}
            data={orderData.filter(o =>
              o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
              o.status.toLowerCase().includes(searchTerm.toLowerCase())
            )}
          />
        </FastTab>

        {/* Resumo Financeiro */}
        <FastTab title="Indicadores de Performance da Carteira" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-[var(--vp-secondary)]">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Total em Aberto</label>
              <div className="text-xl font-black text-[var(--vp-text)] mt-1">R$ 19.750,00</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase flex items-center gap-1">
                +5.2% vs ontem
              </div>
            </div>
            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-red-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Atraso de Separação</label>
              <div className="text-xl font-black text-red-600 mt-1">3 Ordens</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Áção imediata requerida</div>
            </div>
            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-green-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Taxa de Liberação</label>
              <div className="text-xl font-black text-green-700 mt-1">92.5%</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Dentro da meta</div>
            </div>
            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-blue-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Tempo Médio (SLA)</label>
              <div className="text-xl font-black text-blue-600 mt-1">1.2 hrs</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Picking p/ Packing</div>
            </div>
          </div>
        </FastTab>
      </div>
    </div>
  );
}
