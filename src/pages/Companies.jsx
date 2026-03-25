import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import {
  Building2, Plus, Save, Trash2, FileText,
  Clock, MapPin, CreditCard, LayoutGrid, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Validação de CNPJ (algoritmo oficial dos dígitos verificadores) ──────
function validarCNPJ(cnpj) {
  const nums = cnpj.replace(/\D/g, '');
  if (nums.length !== 14) return false;
  if (/^(\d)\1+$/.test(nums)) return false; // todos dígitos iguais
  const calc = (arr, len) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(arr[len - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? '0' : String(11 - r);
  };
  return nums[12] === calc(nums, 12) && nums[13] === calc(nums, 13);
}

// Aplica máscara visual: 00.000.000/0000-00
function mascaraCNPJ(v) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// ─── Toast leve (sem lib, sem alert) ──────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => {
    const id = crypto.randomUUID();
    setToast({ id, msg, type });
    setTimeout(() => setToast(t => t?.id === id ? null : t), 4000);
  }, []);
  return { toast, show };
}

// Estado inicial do formulário VAZIO (sem endereço hardcoded)
const FORM_VAZIO = { id: '', name: '', cnpj: '', address: '', currency: 'BRL', timezone: 'GMT-3', status: 'Ativo' };

// Validação completa do formulário
function validateForm(fd) {
  const erros = {};
  if (!fd.name.trim()) erros.name = 'Nome da entidade é obrigatório.';
  if (!fd.cnpj.trim()) {
    erros.cnpj = 'CNPJ é obrigatório.';
  } else if (!validarCNPJ(fd.cnpj)) {
    erros.cnpj = 'CNPJ inválido (dígitos verificadores falhos).';
  }
  if (!fd.address.trim()) erros.address = 'Endereço é obrigatório.';
  return erros; // {} = sem erros
}

export default function Companies() {
  // Desestruturação segura — fallback para fns vazias se contexto não tiver
  const {
    companies = [],
    addCompany    = () => {},
    updateCompany = () => {},
    deleteCompany = () => {},
  } = useApp();

  const [selectedCompany, setSelectedCompany] = useState(null); // fonte de verdade: empresa selecionada
  const [isNew,           setIsNew]           = useState(false);
  const [formData,        setFormData]         = useState(FORM_VAZIO);
  const [erros,           setErros]            = useState({});
  const [dirty,           setDirty]            = useState(false);  // detecta alterações não salvas
  const [confirmDelete,   setConfirmDelete]    = useState(false);
  const [confirmDiscard,  setConfirmDiscard]   = useState(null);  // null | 'select' | 'new'
  const [pendingAction,   setPendingAction]    = useState(null);  // holds pending callback
  const { toast, show: showToast } = useToast();

  // Sincroniza formData quando selectedCompany muda externamente (ex: dado atualizado no contexto)
  useEffect(() => {
    if (!selectedCompany) return;
    if (isNew) return; // não sobrescreve formulário novo
    setFormData({
      id:       selectedCompany.id       ?? '',
      name:     selectedCompany.name     ?? '',
      cnpj:     selectedCompany.cnpj     ?? '',
      address:  selectedCompany.address  ?? '',
      currency: selectedCompany.currency ?? 'BRL',
      timezone: selectedCompany.timezone ?? 'GMT-3',
      status:   selectedCompany.status   ?? 'Ativo',
    });
    setErros({});
    setDirty(false);
  }, [selectedCompany, isNew]);

  const handleSelect = (company) => {
    if (dirty) {
      setPendingAction(() => () => {
        setIsNew(false);
        setSelectedCompany(company);
        setErros({});
        setDirty(false);
      });
      setConfirmDiscard('select');
      return;
    }
    setIsNew(false);
    setSelectedCompany(company);
    setErros({});
    setDirty(false);
  };

  const handleNew = () => {
    if (dirty) {
      setPendingAction(() => () => {
        setIsNew(true);
        setSelectedCompany({ id: '__new__' });
        setFormData(FORM_VAZIO);
        setErros({});
        setDirty(false);
      });
      setConfirmDiscard('new');
      return;
    }
    setIsNew(true);
    setSelectedCompany({ id: '__new__' }); // marcador — sem ID real ainda
    setFormData(FORM_VAZIO); // endereço vazio, não hardcoded
    setErros({});
    setDirty(false);
  };

  const confirmDiscardAction = () => {
    if (pendingAction) pendingAction();
    setPendingAction(null);
    setConfirmDiscard(null);
  };

  const cancelDiscardAction = () => {
    setPendingAction(null);
    setConfirmDiscard(null);
  };

  const handleChange = (field, value) => {
    setFormData(fd => ({ ...fd, [field]: value }));
    setErros(e => ({ ...e, [field]: undefined })); // limpa erro do campo editado
    setDirty(true);
  };

  const handleCNPJChange = (raw) => {
    handleChange('cnpj', mascaraCNPJ(raw));
  };

  // ── Salvar via AppContext (persistência gerenciada internamente com log) ──
  const handleSave = () => {
    const errosVal = validateForm(formData);
    if (Object.keys(errosVal).length > 0) {
      setErros(errosVal);
      showToast('Corrija os campos destacados antes de salvar.', 'erro');
      return;
    }
    if (isNew) {
      const { id: _, ...dadosSemId } = formData;
      addCompany(dadosSemId);
      showToast('Empresa cadastrada com sucesso!', 'ok');
    } else {
      updateCompany(formData.id, formData);
      showToast('Registro atualizado com sucesso!', 'ok');
    }
    setDirty(false);
    setErros({});
  };

  const handleDelete = () => {
    if (!selectedCompany || isNew) return;
    setConfirmDelete(true);
  };

  // ── Excluir via AppContext ─────────────────────────────────────────────
  const confirmarDelete = () => {
    deleteCompany(selectedCompany.id);
    showToast(`Empresa "${formData.name}" excluída.`, 'ok');
    setSelectedCompany(null);
    setIsNew(false);
    setFormData(FORM_VAZIO);
    setDirty(false);
    setConfirmDelete(false);
  };

  // Breadcrumbs refletem estado real
  const breadcrumbItems = [
    { label: 'WMS' },
    { label: 'Cadastrar' },
    { label: isNew ? '7.1 Empresas — Novo' : selectedCompany ? `7.1 Empresas — ${formData.name || 'Editar'}` : '7.1 Empresas' },
  ];

  const actionGroups = [
    [
      { label: 'Novo',   primary: true, icon: Plus,   onClick: handleNew },
      { label: 'Salvar', icon: Save,                  onClick: handleSave,   disabled: !selectedCompany },
    ],
    [
      {
        label: 'Excluir',
        icon: Trash2,
        onClick: handleDelete,
        disabled: !selectedCompany || isNew,
        title: !selectedCompany || isNew ? 'Selecione uma empresa para excluir' : 'Excluir empresa selecionada',
      },
    ],
    [
      // Relatórios: placeholder informativo enquanto não implementado
      { label: 'Relatórios', icon: FileText, disabled: true, title: 'Disponível em breve' },
    ],
  ];

  const columns = [
    { header: 'ID',             accessor: 'id' },
    { header: 'Nome da Entidade', accessor: 'name' },
    { header: 'CNPJ / Tax ID', accessor: 'cnpj' },
    { header: 'Moeda',         accessor: 'currency' },
    {
      header: 'Status', accessor: 'status',
      render: (val) => (
        <span className={cn(
          'inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full',
          val === 'Ativo'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {val === 'Ativo' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {val}
        </span>
      ),
    },
  ];

  const showDetail = selectedCompany !== null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2',
          toast.type === 'erro'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-green-50 text-green-700 border-green-200'
        )}>
          {toast.type === 'erro' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white">Confirmar Exclusão</p>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Deseja excluir a empresa <strong>"{formData.name}"</strong>? Todos os dados associados serão removidos.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:border-slate-400 transition-all">
                Cancelar
              </button>
              <button onClick={confirmarDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 active:scale-95 transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de descarte de alterações */}
      {confirmDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white">Alterações não salvas</p>
                <p className="text-xs text-slate-500">Deseja descartar as alterações?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelDiscardAction}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:border-slate-400 transition-all">
                Cancelar
              </button>
              <button onClick={confirmDiscardAction}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-black hover:bg-amber-600 active:scale-95 transition-all">
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-yellow-400 p-2 rounded-sm">
            <Building2 className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-800 dark:text-white">
            7.1 Cadastro de Empresas
          </h1>
          {dirty && (
            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Não salvo
            </span>
          )}
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* Master */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Listagem de Entidades</h2>
            <span className="text-[9px] text-slate-400 font-bold ml-auto">{companies.length} empresa(s)</span>
          </div>
          <DataGrid columns={columns} data={companies} onRowClick={handleSelect} />
        </section>

        {/* Detail — fonte de verdade é selectedCompany */}
        {showDetail && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
                {isNew ? 'Novo Registro' : 'Detalhes do Registro'}
              </h2>
            </div>

            <FastTab title="Informações Gerais" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                {/* ID — gerado pelo backend, somente leitura real */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    ID da Empresa
                  </label>
                  <input type="text"
                    value={isNew ? '(gerado automaticamente)' : formData.id}
                    disabled
                    aria-label="ID gerado automaticamente"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-400 cursor-not-allowed opacity-60 outline-none" />
                </div>

                {/* Nome */}
                <div className="space-y-1">
                  <label htmlFor="co-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Nome da Entidade <span className="text-red-500">*</span>
                  </label>
                  <input id="co-name" type="text" value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Ex: VerticalParts Matriz"
                    className={cn('w-full px-3 py-2 bg-white dark:bg-slate-900 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                      erros.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400'
                    )} />
                  {erros.name && <p className="text-[10px] text-red-500 font-bold">{erros.name}</p>}
                </div>

                {/* CNPJ com máscara e validação */}
                <div className="space-y-1">
                  <label htmlFor="co-cnpj" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    CNPJ / Tax ID <span className="text-red-500">*</span>
                  </label>
                  <input id="co-cnpj" type="text" value={formData.cnpj}
                    onChange={e => handleCNPJChange(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className={cn('w-full px-3 py-2 bg-white dark:bg-slate-900 border-2 rounded-xl text-sm font-mono font-bold outline-none transition-all',
                      erros.cnpj ? 'border-red-400 focus:border-red-500' :
                      (formData.cnpj && validarCNPJ(formData.cnpj)) ? 'border-green-400' :
                      'border-slate-200 dark:border-slate-700 focus:border-yellow-400'
                    )} />
                  {erros.cnpj && <p className="text-[10px] text-red-500 font-bold">{erros.cnpj}</p>}
                  {!erros.cnpj && formData.cnpj && validarCNPJ(formData.cnpj) && (
                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />CNPJ válido
                    </p>
                  )}
                </div>

                {/* Endereço — sem valor default hardcoded */}
                <div className="md:col-span-3 space-y-1">
                  <label htmlFor="co-address" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Endereço Principal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="co-address" type="text" value={formData.address}
                      onChange={e => handleChange('address', e.target.value)}
                      placeholder="Logradouro, Número, Bairro, Cidade — UF, CEP"
                      className={cn('w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                        erros.address ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-yellow-400'
                      )} />
                  </div>
                  {erros.address && <p className="text-[10px] text-red-500 font-bold">{erros.address}</p>}
                </div>
              </div>
            </FastTab>

            <FastTab title="Preferências Regionais e Financeiras">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                {/* Moeda */}
                <div className="space-y-1">
                  <label htmlFor="co-currency" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Moeda Padrão
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select id="co-currency" value={formData.currency}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="w-full pl-10 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-yellow-400 rounded-xl text-sm font-bold outline-none transition-all appearance-none">
                      <option value="BRL">BRL — Real Brasileiro</option>
                      <option value="USD">USD — Dólar Americano</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </div>
                </div>

                {/* Timezone */}
                <div className="space-y-1">
                  <label htmlFor="co-timezone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Fuso Horário
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select id="co-timezone" value={formData.timezone}
                      onChange={e => handleChange('timezone', e.target.value)}
                      className="w-full pl-10 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-yellow-400 rounded-xl text-sm font-bold outline-none transition-all appearance-none">
                      <option value="GMT-3">GMT-3 — Brasília / São Paulo</option>
                      <option value="GMT-4">GMT-4 — Manaus</option>
                      <option value="GMT-0">GMT+0 — Londres / UTC</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label htmlFor="co-status" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Status
                  </label>
                  <select id="co-status" value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-yellow-400 rounded-xl text-sm font-bold outline-none transition-all appearance-none">
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </FastTab>
          </section>
        )}
      </div>
    </div>
  );
}
