import React, { useState, useMemo } from 'react';
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
  Settings2
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

export default function Warehouses() {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useApp();
  
  // State for Selection and Form
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    codigoInterno: '',
    nome: '',
    entidade: '',
    tipo: 'Distribuição',
    ativo: true
  });

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
    alert('Registro salvo com sucesso!');
  };

  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Cadastrar' },
    { label: '6.2 Armazéns' }
  ];

  const actionGroups = [
    [
      { label: 'Novo', primary: true, icon: <Plus className="w-3.5 h-3.5" />, onClick: handleNew },
      { label: 'Salvar', icon: <Save className="w-3.5 h-3.5" />, onClick: handleSave }
    ],
    [
      { label: 'Excluir', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: () => alert('Funcionalidade de exclusão') }
    ],
    [
      { label: 'Configurar Layout', icon: <Settings2 className="w-3.5 h-3.5" /> },
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" /> }
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
        <span className={`badge-tech ${val !== false ? 'badge-success' : 'badge-error'}`}>
          {val !== false ? 'ATÍVO' : 'INATIVO'}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-100">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-yellow-500 p-2 rounded-sm">
            <Warehouse className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
            6.2 Cadastro de Armazéns
          </h1>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* MASTER: DataGrid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
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
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>
            
            <FastTab title="Configuração do Armazém" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
                <div className="space-y-1">
                  <label>Código do Armazém</label>
                  <input 
                    type="text" 
                    value={formData.codigoInterno} 
                    onChange={(e) => setFormData({...formData, codigoInterno: e.target.value.toUpperCase()})}
                    placeholder="Ex: CD01"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label>Descrição Completa</label>
                  <input 
                    type="text" 
                    value={formData.nome || formData.name} 
                    onChange={(e) => setFormData({...formData, nome: e.target.value.toUpperCase()})}
                    placeholder="Ex: CENTRO DE DISTRIBUIÇÃO PRINCIPAL"
                  />
                </div>
                <div className="space-y-1">
                  <label>Tipo de Armazém</label>
                  <select 
                    className="w-full h-[38px]"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Distribuição">CD - Distribuição</option>
                    <option value="Produção">Almox. de Produção</option>
                    <option value="Transbordo">Cross-Docking</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-1">
                  <label>Site / Localidade Vinculada</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      className="pl-10"
                      value={formData.entidade} 
                      onChange={(e) => setFormData({...formData, entidade: e.target.value})}
                      placeholder="Ex: VerticalParts Matriz"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label>Status Operacional</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <label htmlFor="ativo" className="mb-0 cursor-pointer">Armazém Ativo</label>
                  </div>
                </div>
              </div>
            </FastTab>

            <FastTab title="Capacidades e Componentes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <Truck className="w-8 h-8 text-gray-300" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Docas</p>
                    <p className="text-xl font-bold text-gray-700">02 Ativas</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <Layers className="w-8 h-8 text-gray-300" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Endereços</p>
                    <p className="text-xl font-bold text-gray-700">1.240 Totais</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 flex items-center gap-4">
                  <LayoutGrid className="w-8 h-8 text-gray-300" />
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
    </div>
  );
}
