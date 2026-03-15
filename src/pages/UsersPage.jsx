import React, { useState, useId, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../services/supabaseClient';
import { 
  User, 
  Plus, 
  Save, 
  Trash2, 
  FileText, 
  LayoutGrid,
  Shield,
  Building2,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Key,
  History,
  UserCheck,
  UserMinus,
  RefreshCcw,
  Lock
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

export default function UsersPage() {
  const { users, usersCrud, userGroups } = useApp();
  
  // State for Selection and Form
  const fieldId = useId();
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    usuario: '',
    nomeUsuario: '',
    email: '',
    nivel: 'Operador',
    departamento: '',
    entidade: 'VerticalParts Matriz',
    cargo: '',
    status: 'Ativo',
    hasTransactions: false // Flag simulate if user has history
  });

  // Toast System
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id || '',
      usuario: user.usuario || '',
      nomeUsuario: user.nomeUsuario || '',
      email: user.email || '',
      nivel: user.nivel || 'Operador',
      departamento: user.departamento || '',
      entidade: user.entidade || 'VerticalParts Matriz',
      cargo: user.cargo || '',
      status: user.status || 'Ativo',
      hasTransactions: user.hasTransactions || false
    });
  };

  const handleSendInvite = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      showToast('E-mail válido é obrigatório para enviar convite.', 'error');
      return;
    }
    if (!formData.usuario) {
      showToast('Defina o Login (username) antes de enviar o convite.', 'error');
      return;
    }

    try {
      const res = await fetch('/api_ia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'invite',
          email:       formData.email,
          employee_id: formData.usuario,
          name:        formData.nomeUsuario,
          role:        formData.nivel,
          branch:      formData.entidade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao enviar convite.');
      showToast(`Convite enviado para ${formData.email}! Login: ${formData.usuario}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      showToast('E-mail é obrigatório para resetar a senha.', 'error');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(`Link de redefinição enviado para ${formData.email}`, 'info');
    }
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
    showToast('Registro salvo com sucesso!', 'success');
  };

  const handleDelete = () => {
    if (!selectedUser || selectedUser.id === 'NOVO' || selectedUser.id === 'AUTO') {
      showToast('Selecione um usuário para excluir.', 'error');
      return;
    }

    // Lógica de Boas Práticas: Se tiver transação, apenas inativa
    if (formData.hasTransactions) {
      if (window.confirm(`Este usuário possui histórico de movimentação e não pode ser excluído por questões de auditoria. Deseja INATIVAR o acesso de ${selectedUser.usuario}?`)) {
        const updatedData = { ...formData, status: 'Inativo' };
        usersCrud.update(formData.id, updatedData);
        setFormData(updatedData);
        showToast('Usuário inativado para preservar histórico.', 'info');
      }
      return;
    }

    if (window.confirm(`Deseja realmente excluir o usuário ${selectedUser.usuario}? (Esta ação é irreversível e só permitida para contas sem transações)`)) {
      usersCrud.remove(selectedUser.id);
      setSelectedUser(null);
      setFormData({
        id: '',
        usuario: '',
        nomeUsuario: '',
        email: '',
        nivel: 'Operador',
        departamento: '',
        entidade: 'VerticalParts Matriz',
        cargo: '',
        status: 'Ativo',
        hasTransactions: false
      });
      showToast('Usuário excluído com sucesso!', 'info');
    }
  };

  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Configurar' },
    { label: '11.1 Segurança e Usuários' }
  ];

  const actionGroups = [
    [
      { label: 'Novo', primary: true, icon: <Plus className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleNew },
      { label: 'Salvar', icon: <Save className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleSave }
    ],
    [
      { label: 'Excluir', icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />, onClick: handleDelete, disabled: !selectedUser || selectedUser.id === 'NOVO' }
    ],
    [
      { label: 'Imprimir Crachá', icon: <Printer className="w-3.5 h-3.5" aria-hidden="true" /> },
      { label: 'Relatórios', icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" /> }
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
      render: (val) => {
        const isAdm = val === 'Administrador';
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isAdm ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {val}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => {
        const isActive = val === 'Ativo';
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {val}
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-100">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-yellow-500 p-2 rounded-sm shadow-lg shadow-yellow-500/20">
            <User className="w-5 h-5 text-black" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
            11.1 Gestão de Usuários e Segurança
          </h1>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* MASTER: DataGrid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" aria-hidden="true" />
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
              <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>
            
            <FastTab title="Informações do Usuário" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-usuario`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login (Username)</label>
                  <input 
                    id={`${fieldId}-usuario`}
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.usuario} 
                    onChange={(e) => setFormData({...formData, usuario: e.target.value.toLowerCase()})}
                    placeholder="ex: danilo.supervisor"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-nome`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</label>
                  <input 
                    id={`${fieldId}-nome`}
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.nomeUsuario} 
                    onChange={(e) => setFormData({...formData, nomeUsuario: e.target.value})}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-cargo`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Função / Cargo</label>
                  <select 
                    id={`${fieldId}-cargo`}
                    className="w-full h-[38px] bg-white border border-gray-200 rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all font-bold"
                    value={formData.cargo} 
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  >
                    <option value="">Selecione um cargo</option>
                    <option value="Supervisor de Operações">Supervisor de Operações</option>
                    <option value="Operador de Armazém">Operador de Armazém</option>
                    <option value="Almoxarife">Almoxarife</option>
                    <option value="Estratégias e Processos">Estratégias e Processos</option>
                    <option value="Operador de Expedição">Operador de Expedição</option>
                    <option value="Analista Fiscal">Analista Fiscal</option>
                    <option value="Analista de Inventário">Analista de Inventário</option>
                    <option value="Operador de Recebimento">Operador de Recebimento</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-email`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-yellow-500" />
                    E-mail Corporativo (Login APP/WEB)
                  </label>
                  <input 
                    id={`${fieldId}-email`}
                    type="email" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all font-bold"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                    placeholder="ex: colaborador@verticalparts.com.br"
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Este e-mail será usado para o primeiro acesso e recuperação.</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-status`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status da Conta</label>
                  <select 
                    id={`${fieldId}-status`}
                    className={`w-full h-[38px] border rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all font-black uppercase cursor-pointer ${formData.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Ativo">🟢 Ativo</option>
                    <option value="Inativo">🔴 Inativo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Padrão de Segurança</label>
                  <div className="flex items-center gap-2 h-[38px] px-3 bg-gray-50 border border-gray-100 rounded-sm">
                    {formData.hasTransactions ? (
                      <>
                        <History className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 uppercase">Histórico Protegido</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] font-black text-green-600 uppercase">Conta Limpa</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-nivel`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nível de Acesso</label>
                  <select 
                    id={`${fieldId}-nivel`}
                    className="w-full h-[38px] bg-white border border-gray-200 rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all"
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
                  <label htmlFor={`${fieldId}-depto`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Departamento</label>
                  <input 
                    id={`${fieldId}-depto`}
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.departamento} 
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-entidade`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entidade Vinculada</label>
                  <input 
                    id={`${fieldId}-entidade`}
                    type="text" 
                    value={formData.entidade} 
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 px-3 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </FastTab>

            <FastTab title="Acesso e Segurança">
              <div className="p-6 bg-slate-900 rounded-sm border border-slate-800 relative overflow-hidden group">
                {/* Background Decorativo */}
                <Shield className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 group-hover:text-yellow-500/10 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Key className="w-5 h-5 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Gestão de Acesso Supabase</h3>
                    </div>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-md">
                      O controle de autenticação é processado via <span className="text-yellow-500">Supabase Auth</span>. 
                      Ao enviar o convite, o usuário receberá um link para definir sua senha pessoal.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleSendInvite}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar Convite por E-mail
                    </button>
                    
                    <button 
                      onClick={handleResetPassword}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500 font-black text-xs uppercase tracking-widest rounded-sm transition-all active:scale-95"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Resetar Senha (E-mail)
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase leading-none mb-1">SSO Ativo</p>
                      <p className="text-[9px] text-gray-500 font-bold">Web & App Mobile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase leading-none mb-1">Criptografia</p>
                      <p className="text-[9px] text-gray-500 font-bold">SHA-256 Hashes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <History className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase leading-none mb-1">Log de Acesso</p>
                      <p className="text-[9px] text-gray-500 font-bold">Auditoria Ativada</p>
                    </div>
                  </div>
                </div>
              </div>
            </FastTab>

            <FastTab title="Permissões e Vínculos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-blue-500" aria-hidden="true" />
                    <h3 className="text-[11px] font-black uppercase text-gray-600">Grupos de Segurança</h3>
                  </div>
                  <div className="space-y-2">
                    {userGroups.map(group => (
                       <label key={group.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-sm cursor-pointer hover:border-yellow-500 transition-colors group">
                          <input type="checkbox" className="w-4 h-4 accent-yellow-500" />
                          <span className="text-[11px] font-bold text-gray-700 group-hover:text-yellow-600 transition-colors">{group.grupo}</span>
                       </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-orange-500" aria-hidden="true" />
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
