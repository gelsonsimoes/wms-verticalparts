import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  CheckCircle2, 
  Save, 
  Plus, 
  Trash2, 
  Printer,
  ChevronRight,
  Package,
  MapPin,
  Calendar
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';

export default function LoadDetails() {
  const [loadData] = useState({
    id: 'USMF-000001',
    status: 'Waved',
    type: 'Outbound',
    order: '000748',
    created: '26/02/2026 10:00 AM',
    carrier: 'Vertical Logistics',
    weight: '450.00 kg',
    destination: 'LOG-DIST-VELOZ',
    origin: 'WH-MAIN-SP',
    driver: 'Danilo Silva',
    plate: 'VTP-2026'
  });

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Planejamento', path: '/planejamento/expedir-cargas' },
    { label: 'Detalhes de Carga', path: null },
  ];

  const actions = [
    [
      { label: 'Novo', primary: true, icon: <Plus size={14}/>, onClick: () => {} },
      { label: 'Salvar', icon: <Save size={14}/>, onClick: () => {} },
      { label: 'Excluir', icon: <Trash2 size={14}/>, onClick: () => {} }
    ],
    [
      { label: 'Imprimir Picking', icon: <Printer size={14}/>, onClick: () => {} },
      { label: 'Confirmar Embarque', icon: <CheckCircle2 size={14}/>, onClick: () => {} }
    ]
  ];

  const columns = [
    { header: 'Linha', accessor: 'id' },
    { header: 'Item', accessor: 'sku', render: (v) => <span className="font-bold text-black">{v}</span> },
    { header: 'Descrição Técnica', accessor: 'name' },
    { header: 'Qtd', accessor: 'qty', render: (v) => <span className="font-bold">{v}</span> },
    { header: 'Unid', accessor: 'unit' },
    { header: 'Status', accessor: 'status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
        v === 'Coletado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {v}
      </span>
    )}
  ];

  const data = [
    { id: '1', sku: 'VEPEL-BPI-174FX', name: 'Barreira de Proteção Infravermelha (174 Feixes)', qty: 5, unit: 'UN', status: 'Coletado' },
    { id: '2', sku: 'VPER-ESS-NY-27MM', name: 'Escova de Segurança (Nylon - Base 27mm)', qty: 12, unit: 'UN', status: 'Coletado' },
    { id: '3', sku: 'VPER-PAL-INO-1000', name: 'Pallet de Aço Inox (1000mm)', qty: 2, unit: 'UN', status: 'Pendente' }
  ];

  return (
    <div className="min-h-screen bg-[var(--vp-bg-alt)] font-sans">
      {/* Header Corporativo */}
      <div className="bg-white px-6 py-4 border-b border-[var(--vp-border)]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-[var(--vp-secondary)] p-2 rounded-sm shadow-sm">
            <Truck className="text-[var(--vp-primary)]" size={20}/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--vp-text-data)] leading-tight tracking-tight">
              {loadData.id} : {loadData.type}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-bold text-[var(--vp-text-label)] uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Criado em: {loadData.created}
              </span>
              <span className="text-[10px] font-bold text-[var(--vp-primary)] bg-black px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Status: {loadData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Pane Reutilizável */}
      <ActionPane title="Gerenciamento de Carga" groups={actions} />

      <div className="p-6 space-y-4">
        {/* FastTab: Dados Mestre (4 Colunas) */}
        <FastTab title="Informações Gerais da Carga" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-2">
                <Package size={12}/> Identificação
              </h3>
              <div className="form-group"><label>ID da Carga</label><input value={loadData.id} readOnly className="bg-[var(--vp-bg-alt)] font-bold"/></div>
              <div className="form-group"><label>Número Pedido</label><input value={loadData.order} readOnly className="bg-[var(--vp-bg-alt)]"/></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-2">
                <MapPin size={12}/> Logística
              </h3>
              <div className="form-group"><label>Origem (Site)</label><input value={loadData.origin} readOnly className="bg-[var(--vp-bg-alt)]"/></div>
              <div className="form-group"><label>Destino Final</label><input value={loadData.destination} readOnly className="bg-[var(--vp-bg-alt)]"/></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-2">
                <Truck size={12}/> Transporte
              </h3>
              <div className="form-group"><label>Transportadora</label><input value={loadData.carrier} readOnly className="bg-[var(--vp-bg-alt)]"/></div>
              <div className="form-group">
                <label>Motorista / Placa</label>
                <div className="flex gap-2">
                  <input value={loadData.driver} readOnly className="flex-1 bg-[var(--vp-bg-alt)]"/>
                  <input value={loadData.plate} readOnly className="w-24 bg-[var(--vp-bg-alt)] text-center font-mono font-bold"/>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-2">
                <CheckCircle2 size={12}/> Pesos e Medidas
              </h3>
              <div className="form-group"><label>Peso Bruto Total</label><input value={loadData.weight} readOnly className="bg-[var(--vp-bg-alt)] text-right font-black text-[var(--vp-secondary)]"/></div>
              <div className="form-group"><label>Total de Itens</label><input value={data.length} readOnly className="bg-[var(--vp-bg-alt)] text-right"/></div>
            </div>
          </div>
        </FastTab>

        {/* FastTab: Itens da Carga */}
        <FastTab title="Linhas de Carga (Itens do Pedido)" defaultOpen={true}>
          <div className="mb-3 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="btn-secondary px-3 py-1 text-[10px] font-bold uppercase">Adicionar Item</button>
              <button className="btn-secondary px-3 py-1 text-[10px] font-bold uppercase text-red-600 border-red-100">Remover</button>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Itens: {data.length}</span>
          </div>
          <DataGrid columns={columns} data={data} />
        </FastTab>
      </div>
    </div>
  );
}
