import React, { useState, useMemo, useEffect, useId, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Warehouse, 
  Plus, 
  Save, 
  Trash2, 
  FileText, 
  LayoutGrid,
  MapPin,
  Truck,
  Layers,
  Settings2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

export default function Warehouses() {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useApp();
  
  // State for Selection and Form
  const fieldId = useId();
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    codigoInterno: '',
    nome: '',
    entidade: '',
    tipo: 'Distribuição',
    ativo: true
  });

  // Toast System
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = (wh) => {
    setSelectedWarehouse(wh);
    setFormData({
      id: wh.id || '',
      codigoInterno: wh.codigoInterno || '',
      nome: wh.nome || wh.name || '',
      entidade: wh.entidade || '',
      tipo: wh.tipo || 'Distribuição',
      ativo: wh.ativo !== false
    });
  };

  const handleNew = () => {
    setSelectedWarehouse({ id: 'NOVO' });
    setFormData({
      id: 'AUTO',
      codigoInterno: 'VPARMZ',
      nome: 'CD CENTRAL GUARULHOS',
      entidade: 'VerticalParts Matriz',
      tipo: 'Distribuição',
      ativo: true
    });
  };

  const handleSave = () => {
    if (selectedWarehouse?.id === 'NOVO') {
      addWarehouse(formData);
    } else {
      updateWarehouse(formData.id, formData);
    }
    showToast('Registro salvo com sucesso!', 'success');
  };

  const handleDelete = () => {
    if (!selectedWarehouse || selectedWarehouse.id === 'NOVO' || selectedWarehouse.id === 'AUTO') {
      showToast('Selecione um armazém para excluir.', 'error');
      return;
    }
    if (window.confirm(`Deseja realmente excluir o armazém ${formData.nome}?`)) {
      deleteWarehouse(selectedWarehouse.id);
      setSelectedWarehouse(null);
      setFormData({
        id: '',
        codigoInterno: '',
        nome: '',
        entidade: '',
        tipo: 'Distribuição',
        ativo: true
      });
      showToast('Armazém excluído com sucesso!', 'info');
    }
  };

  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Cadastrar' },
    { label: '7.2 Armazéns' }
  ];

  const actionGroups = [
    [
      { label: 'Novo', primary: true, icon: <Plus className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleNew },
      { label: 'Salvar', icon: <Save className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleSave }
    ],
    [
      { label: 'Excluir', icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleDelete, disabled: !selectedWarehouse || selectedWarehouse.id === 'NOVO' }
    ],
    [
      { label: 'Configurar Layout', icon: <Settings2 className="w-3.5 h-3.5" aria-hidden="true" /> },
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" /> }
    ]
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Código', accessor: 'codigoInterno' },
    { header: 'Descrição do Armazém', accessor: 'nome' },
    { header: 'Site / Localidade', accessor: 'entidade' },
    { 
      header: 'Status', 
      accessor: 'ativo',
      render: (val) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${val !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val !== false ? 'ATIVO' : 'INATIVO'}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-100">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-yellow-500 p-2 rounded-sm shadow-lg shadow-yellow-500/20">
            <Warehouse className="w-5 h-5 text-black" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
            7.2 Cadastro de Armazéns
          </h1>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* MASTER: DataGrid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Listagem de Armazéns</h2>
          </div>
          <DataGrid 
            columns={columns} 
            data={warehouses} 
            onRowClick={handleSelect}
          />
        </section>

        {/* DETAIL: FastTabs */}
        {(selectedWarehouse || formData.nome !== '') && (
          <section className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>
            
            <FastTab title="Configuração do Armazém" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-cod`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Código do Armazém</label>
                  <input 
                    id={`${fieldId}-cod`}
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.codigoInterno} 
                    onChange={(e) => setFormData({...formData, codigoInterno: e.target.value.toUpperCase()})}
                    placeholder="Ex: CD01"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-nome`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descrição Completa</label>
                  <input 
                    id={`${fieldId}-nome`}
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.nome} 
                    onChange={(e) => setFormData({...formData, nome: e.target.value.toUpperCase()})}
                    placeholder="Ex: CENTRO DE DISTRIBUIÇÃO PRINCIPAL"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-tipo`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo de Armazém</label>
                  <select 
                    id={`${fieldId}-tipo`}
                    className="w-full h-[38px] bg-white border border-gray-200 rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Distribuição">CD - Distribuição</option>
                    <option value="Produção">Almox. de Produção</option>
                    <option value="Transbordo">Cross-Docking</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-site`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Site / Localidade Vinculada</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                    <input 
                      id={`${fieldId}-site`}
                      type="text" 
                      className="pl-10 w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                      value={formData.entidade} 
                      onChange={(e) => setFormData({...formData, entidade: e.target.value})}
                      placeholder="Ex: VerticalParts Matriz"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status Operacional</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id={`${fieldId}-ativo`}
                      checked={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <label htmlFor={`${fieldId}-ativo`} className="mb-0 cursor-pointer text-sm font-bold text-gray-700 italic">Armazém Ativo</label>
                  </div>
                </div>
              </div>
            </FastTab>

            <FastTab title="Capacidades e Componentes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <Truck className="w-8 h-8 text-gray-300" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Docas</p>
                    <p className="text-xl font-bold text-gray-700">02 Ativas</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <Layers className="w-8 h-8 text-gray-300" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Endereços</p>
                    <p className="text-xl font-bold text-gray-700">1.240 Totais</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <LayoutGrid className="w-8 h-8 text-gray-300" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Ocupação</p>
                    <p className="text-xl font-bold text-yellow-600">78%</p>
                  </div>
                </div>
              </div>
            </FastTab>
          </section>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300"
          role="status"
        >
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4
            ${toast.type === 'success' ? 'bg-green-500 border-green-700' : 
              toast.type === 'error'   ? 'bg-red-500 border-red-700' : 
              'bg-blue-600 border-blue-800'}
            text-white
          `}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notificação</p>
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
