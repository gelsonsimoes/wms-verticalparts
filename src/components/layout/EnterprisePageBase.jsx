import React from 'react';
import Breadcrumbs from '../ui/Breadcrumbs';
import ActionPane from '../ui/ActionPane';
import FastTab from '../ui/FastTab';
import DataGrid from '../ui/DataGrid';
import { Database, LayoutGrid, FileText, Settings2 } from 'lucide-react';

const MOCK_COLUMNS = [
  { header: 'ID', accessor: 'id' },
  { header: 'SKU', accessor: 'sku' },
  { header: 'Descrição', accessor: 'desc' },
  { header: 'Qtd', accessor: 'qty' },
  { header: 'Status', accessor: 'status' }
];

const MOCK_DATA = [
  { id: '1001', sku: 'VPER-PNT-AL-22D-202X145-CT', desc: 'Pente de Alumínio - 22 Dentes (202x145mm)', qty: 12, status: 'Ativo' },
  { id: '1002', sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', qty: 45, status: 'Pendente' },
  { id: '1003', sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', qty: 8, status: 'Ativo' },
  { id: '1004', sku: 'VPER-INC-ESQ', desc: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', qty: 22, status: 'Inativo' },
  { id: '1005', sku: 'VPER-LUM-LED-VRD-24V', desc: 'Luminária em LED Verde 24V', qty: 15, status: 'Ativo' }
];

export default function EnterprisePageBase({ title, breadcrumbItems = [] }) {
  const breadcrumbs = [
    { label: 'WMS', path: '/' },
    ...breadcrumbItems,
    { label: title, active: true }
  ];

  const actionGroups = [
    [
      { label: 'Novo', primary: true, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
      { label: 'Duplicar', icon: <FileText className="w-3.5 h-3.5" /> }
    ],
    [
      { label: 'Salvar', icon: <Settings2 className="w-3.5 h-3.5" /> },
      { label: 'Salvar e Fechar' }
    ],
    [
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" /> },
      { label: 'Exportar PDF' }
    ]
  ];

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <div className="px-4 py-2 border-b border-[var(--vp-border)] bg-[#F8F9FA]">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="px-4 py-1 border-b border-[var(--vp-border)] bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-black rounded-sm">
                <LayoutGrid className="w-4 h-4 text-[var(--vp-primary)]" />
             </div>
             <h1 className="text-sm font-black text-black uppercase tracking-tight">{title}</h1>
          </div>
        </div>
        <ActionPane groups={actionGroups} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <FastTab title="Informações Gerais" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest leading-none">ID Registro</label>
                <input disabled value="VP-AUTO-001" className="w-full bg-[#F3F4F6] border border-[var(--vp-border)] rounded-sm px-3 py-2 text-xs font-black text-black" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest leading-none">Depositante</label>
                <input value="VerticalParts Matriz" className="w-full bg-white border border-[var(--vp-border)] rounded-sm px-3 py-2 text-xs font-bold text-black focus:border-[var(--vp-primary)] outline-none" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest leading-none">Tipo Operação</label>
                <select className="w-full bg-white border border-[var(--vp-border)] rounded-sm px-3 py-2 text-xs font-bold text-black outline-none">
                   <option>Entrada Normal</option>
                   <option>Devolução</option>
                   <option>Transferência</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest leading-none">Data Referência</label>
                <input type="date" value="2026-02-26" className="w-full bg-white border border-[var(--vp-border)] rounded-sm px-3 py-2 text-xs font-bold text-black outline-none" />
             </div>
          </div>
        </FastTab>

        <FastTab title="Linhas de Dados (SKUs Reais)" defaultOpen={true}>
          <div className="p-0 border-t border-[var(--vp-border)]">
             <DataGrid columns={MOCK_COLUMNS} data={MOCK_DATA} />
          </div>
        </FastTab>

        <FastTab title="Configurações Avançadas" defaultOpen={false}>
          <div className="p-6 text-center text-gray-400">
             <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest">Parâmetros Adicionais do Módulo</p>
          </div>
        </FastTab>
      </div>

      <div className="px-4 py-2 border-t border-[var(--vp-border)] bg-[#F8F9FA] flex justify-between items-center">
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VerticalParts WMS Enterprise v2.5</span>
         <div className="flex gap-4">
            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Conectado ao Gateway
            </span>
         </div>
      </div>
    </div>
  );
}
