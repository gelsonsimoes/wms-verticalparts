import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Plus, 
  Save, 
  Trash2, 
  FileText, 
  LayoutGrid,
  Shield,
  Building2,
  Key,
  Printer
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

export default function UsersPage() {
  const { users, usersCrud, userGroups } = useApp();
  
  // State for Selection and Form
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    usuario: '',
    nomeUsuario: '',
    nivel: 'Operador',
    departamento: '',
    entidade: 'VerticalParts Matriz',
    cargo: '',
    status: 'Ativo'
  });

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id || '',
      usuario: user.usuario || '',
      nomeUsuario: user.nomeUsuario || '',
      nivel: user.nivel || 'Operador',
      departamento: user.departamento || '',
      entidade: user.entidade || 'VerticalParts Matriz',
      cargo: user.cargo || '',
      status: user.status || 'Ativo'
    });
  };

  const handleNew = () => {
    setSelectedUser({ id: 'NOVO' });
    setFormData({
      id: 'AUTO',
      usuario: '',
      nomeUsuario: '',
      nivel: 'Operador',
      departamento: '',
      entidade: 'VerticalParts Matriz',
      cargo: '',
      status: 'Ativo'
    });
  };

  const handleSave = () => {
    if (selectedUser?.id === 'NOVO') {
      usersCrud.add(formData);
    } else {
      usersCrud.update(formData.id, formData);
    }
    alert('Registro salvo com sucesso!');
  };

  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Configurar' },
    { label: '9.2 Segurança e Usuários' }
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
      { label: 'Imprimir Crachá', icon: <Printer className="w-3.5 h-3.5" /> },
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" /> }
    ]
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Login', accessor: 'usuario' },
    { header: 'Nome Completo', accessor: 'nomeUsuario' },
    { header: 'Cargo / Função', accessor: 'cargo' },
    { 
      header: 'Nível de Acesso', 
      accessor: 'nivel',
      render: (val) => (
        <span className={`badge-tech ${val === 'Administrador' ? 'badge-error' : 'badge-info'}`}>
          {val.toUpperCase()}
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
            <User className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
            9.2 Gestão de Usuários e Segurança
          </h1>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* MASTER: DataGrid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Listagem de Colaboradores</h2>
          </div>
          <DataGrid 
            columns={columns} 
            data={users} 
            onRowClick={handleSelect}
          />
        </section>

        {/* DETAIL: FastTabs */}
        {(selectedUser || formData.usuario !== '') && (
          <section className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>
            
            <FastTab title="Informações do Usuário" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
                <div className="space-y-1">
                  <label>Login (Username)</label>
                  <input 
                    type="text" 
                    value={formData.usuario} 
                    onChange={(e) => setFormData({...formData, usuario: e.target.value.toLowerCase()})}
                    placeholder="ex: danilo.supervisor"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label>Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.nomeUsuario} 
                    onChange={(e) => setFormData({...formData, nomeUsuario: e.target.value})}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="space-y-1">
                  <label>Função / Cargo</label>
                  <input 
                    type="text" 
                    value={formData.cargo} 
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    placeholder="Supervisor, Operador, etc."
                  />
                </div>

                <div className="space-y-1">
                  <label>Nível de Acesso</label>
                  <select 
                    className="w-full h-[38px]"
                    value={formData.nivel}
                    onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Operador">Operador</option>
                    <option value="Consulta">Consulta</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Departamento</label>
                  <input 
                    type="text" 
                    value={formData.departamento} 
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label>Entidade Vinculada</label>
                  <input 
                    type="text" 
                    value={formData.entidade} 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </FastTab>

            <FastTab title="Permissões e Vínculos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h3 className="text-[11px] font-black uppercase text-gray-600">Grupos de Segurança</h3>
                  </div>
                  <div className="space-y-2">
                    {userGroups.map(group => (
                       <label key={group.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-sm cursor-pointer hover:border-yellow-500 transition-colors">
                          <input type="checkbox" className="w-4 h-4 accent-yellow-500" />
                          <span className="text-[11px] font-bold text-gray-700">{group.grupo}</span>
                       </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    <h3 className="text-[11px] font-black uppercase text-gray-600">Filiais / Depositantes</h3>
                  </div>
                  <div className="p-4 border border-dashed border-gray-300 rounded-sm text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black">VerticalParts Matriz (Padrão)</p>
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
