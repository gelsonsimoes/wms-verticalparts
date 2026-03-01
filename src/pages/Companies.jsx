import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Save, 
  Trash2, 
  FileText, 
  Globe, 
  Clock, 
  MapPin, 
  CreditCard,
  LayoutGrid
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

export default function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useApp();
  
  // State for Selection and Form
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    cnpj: '',
    address: '',
    currency: 'BRL',
    timezone: 'GMT-3',
    status: 'Ativo'
  });

  const handleSelect = (company) => {
    setSelectedCompany(company);
    setFormData({
      id: company.id || '',
      name: company.name || '',
      cnpj: company.cnpj || '',
      address: company.address || 'Rua Armandina Braga de Almeida, 383, Guarulhos-SP, 07141-003',
      currency: company.currency || 'BRL',
      timezone: company.timezone || 'GMT-3',
      status: company.status || 'Ativo'
    });
  };

  const handleNew = () => {
    setSelectedCompany({ id: 'NOVO' });
    setFormData({
      id: 'AUTO',
      name: '',
      cnpj: '',
      address: 'Rua Armandina Braga de Almeida, 383, Guarulhos-SP, 07141-003',
      currency: 'BRL',
      timezone: 'GMT-3',
      status: 'Ativo'
    });
  };

  const handleSave = () => {
    if (selectedCompany?.id === 'NOVO') {
      addCompany(formData);
    } else {
      updateCompany(formData.id, formData);
    }
    // Em um cenário real, aqui viria o feedback de sucesso
    alert('Registro salvo com sucesso!');
  };

  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Cadastrar' },
    { label: '6.1 Empresas' }
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
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" /> }
    ]
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome da Entidade', accessor: 'name' },
    { header: 'CNPJ / Tax ID', accessor: 'cnpj' },
    { header: 'Moeda', accessor: 'currency' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`badge-tech ${val === 'Ativo' ? 'badge-success' : 'badge-error'}`}>
          {val}
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
            <Building2 className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
            6.1 Cadastro de Empresas
          </h1>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* MASTER: DataGrid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Listagem de Entidades</h2>
          </div>
          <DataGrid 
            columns={columns} 
            data={companies} 
            onRowClick={handleSelect}
          />
        </section>

        {/* DETAIL: FastTabs */}
        {(selectedCompany || formData.name !== '') && (
          <section className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>
            
            <FastTab title="Informações Gerais" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                <div className="space-y-1">
                  <label>ID da Empresa</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    disabled 
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label>Nome da Entidade</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: VerticalParts Matriz"
                  />
                </div>
                <div className="space-y-1">
                  <label>CNPJ / Tax ID</label>
                  <input 
                    type="text" 
                    value={formData.cnpj} 
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label>Endereço Principal</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      className="pl-10"
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Logradouro, Número, Bairro, Cidade - UF"
                    />
                  </div>
                </div>
              </div>
            </FastTab>

            <FastTab title="Preferências Regionais e Financeiras">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="space-y-1">
                  <label>Moeda Padrão</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      className="w-full pl-10 h-[38px]"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="BRL">BRL - Real Brasileiro</option>
                      <option value="USD">USD - Dólar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label>Fuso Horário (Timezone)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      className="w-full pl-10 h-[38px]"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="GMT-3">GMT-3 Brasilia / São Paulo</option>
                      <option value="GMT-4">GMT-4 Manaus</option>
                      <option value="GMT-0">GMT+0 Londres / UTC</option>
                    </select>
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
