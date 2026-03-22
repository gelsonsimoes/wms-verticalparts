import React, { useState, useMemo, useId, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Users,
  Search,
  Plus,
  Save,
  Trash2,
  Info,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

const HelpTip = ({ text, position = 'top' }) => (
  <div className="group relative inline-block ml-1.5 focus:outline-none shrink-0" tabIndex="0">
    <Info className="w-3 h-3 text-slate-400 hover:text-secondary cursor-help transition-colors" />
    <div className={cn(
      "absolute hidden group-hover:block z-[100] w-48 p-2.5 text-[10px] font-bold leading-tight text-white bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 pointer-events-none",
      position === 'top' ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : "top-full left-1/2 -translate-x-1/2 mt-2"
    )}>
      {text}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 border-4",
        position === 'top'
          ? "top-full border-t-slate-900 border-x-transparent border-b-transparent"
          : "bottom-full border-b-slate-900 border-x-transparent border-t-transparent"
      )} />
    </div>
  </div>
);

function Field({ label, children, className }) {
  const id = useId();
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">{label}</label>
      {React.cloneElement(React.Children.only(children), { id })}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const emptyForm = () => ({
  razao_social: '', nome_fantasia: '', cnpj: '', inscricao_estadual: '',
  email: '', telefone: '', website: '', cep: '', logradouro: '', bairro: '',
  cidade: '', uf: '', status: 'Ativo', tipo: 'fornecedor',
});

export default function SupplierCatalog() {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const fetchItems = async () => {
    setLoadingItems(true);
    const { data } = await supabase.from('clientes').select('*').eq('tipo', 'fornecedor').order('razao_social');
    setItems(data || []);
    setLoadingItems(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const showToast = (message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  // Confirm Delete Modal
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = useMemo(() =>
    items.filter(c =>
      (c.razao_social || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.cnpj || '').includes(search)
    ), [items, search]);

  const selected = useMemo(() =>
    items.find(c => c.id === selectedId) || null,
    [items, selectedId]);

  // Sync form when selection changes
  useEffect(() => {
    if (selected) {
      setFormData({
        razao_social:      selected.razao_social      || '',
        nome_fantasia:     selected.nome_fantasia      || '',
        cnpj:              selected.cnpj               || '',
        inscricao_estadual:selected.inscricao_estadual || '',
        email:             selected.email              || '',
        telefone:          selected.telefone           || '',
        website:           selected.website            || '',
        cep:               selected.cep                || '',
        logradouro:        selected.logradouro         || '',
        bairro:            selected.bairro             || '',
        cidade:            selected.cidade             || '',
        uf:                selected.uf                 || '',
        status:            selected.status             || 'Ativo',
        tipo:              'fornecedor',
      });
    }
  }, [selected]);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleNew = () => {
    setIsNew(true);
    setSelectedId(null);
    setFormData(emptyForm());
  };

  const handleSelect = (c) => {
    setIsNew(false);
    setSelectedId(c.id);
  };

  const handleSave = async () => {
    if (!formData.razao_social.trim()) { showToast('Razão Social é obrigatória.', 'error'); return; }
    if (isNew) {
      const { data: inserted, error } = await supabase.from('clientes').insert({ ...formData, tipo: 'fornecedor' }).select().single();
      if (error) { showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      await fetchItems();
      setIsNew(false);
      showToast('Fornecedor cadastrado com sucesso!');
    } else if (selectedId) {
      const { error } = await supabase.from('clientes').update(formData).eq('id', selectedId);
      if (error) { showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      await fetchItems();
      showToast('Alterações salvas com sucesso!');
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setConfirmDelete(true);
  };

  const confirmarDelete = async () => {
    const { error } = await supabase.from('clientes').delete().eq('id', selectedId);
    if (error) { showToast(`Erro ao excluir: ${error.message}`, 'error'); setConfirmDelete(false); return; }
    await fetchItems();
    setSelectedId(null);
    setFormData(emptyForm());
    showToast('Fornecedor excluído.', 'info');
    setConfirmDelete(false);
  };

  const showDetail = isNew || !!selectedId;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

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
              Deseja excluir o fornecedor <strong>"{selected?.razao_social || '—'}"</strong>?
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

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-amber-500 to-secondary" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">7.5 Cadastro e Segurança</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">7.5 Catálogo de Fornecedores</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Peças · Insumos · Materiais · Parceiros de Fornecimento</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative group">
              <button disabled className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl text-xs font-black cursor-not-allowed opacity-60">
                <RefreshCw className="w-4 h-4" />Sincronizar Omie
              </button>
              <HelpTip text="A Integração via API Omie será conectada aqui. No futuro, os fornecedores serão importados automaticamente." position="bottom" />
            </div>
            <button onClick={handleNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-primary rounded-2xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
              <Plus className="w-4 h-4" />Novo Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* MASTER-DETAIL */}
      <div className="flex flex-1 overflow-hidden">

        {/* MASTER */}
        <div className="w-80 shrink-0 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por Razão ou CNPJ..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all" />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isNew && (
              <div className="w-full text-left px-4 py-4 border-b border-slate-100 bg-secondary/10 border-l-4 border-l-secondary flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-secondary text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black font-mono text-secondary">NOVO FORNECEDOR</p>
                  <p className="text-xs font-bold text-slate-600 leading-snug mt-0.5">Preencha o formulário ao lado</p>
                </div>
              </div>
            )}
            {filtered.length === 0 && !isNew && (
              <p className="text-center text-[11px] text-slate-400 py-8 font-medium">Nenhum fornecedor cadastrado.</p>
            )}
            {filtered.map(c => (
              <button key={c.id} onClick={() => handleSelect(c)}
                className={cn('w-full text-left px-4 py-4 border-b border-slate-100 dark:border-slate-800 transition-all flex items-start gap-3',
                  selectedId === c.id && !isNew ? 'bg-secondary/10 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                )}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  selectedId === c.id && !isNew ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[10px] font-black font-mono truncate', selectedId === c.id && !isNew ? 'text-secondary' : 'text-slate-500')}>{c.cnpj || '—'}</p>
                  <p className={cn('text-xs font-bold truncate leading-snug mt-0.5', selectedId === c.id && !isNew ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>{c.nome_fantasia || c.razao_social}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {c.cidade && <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{c.cidade}{c.uf ? ` - ${c.uf}` : ''}</span>}
                    <span className={cn('text-[8px] px-1.5 py-0.5 rounded-md font-bold', c.status !== 'Inativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{c.status || 'Ativo'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DETAIL */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          {showDetail ? (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Toolbar Ações */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {isNew ? 'Novo Fornecedor' : (formData.razao_social || '—')}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold">
                      {isNew ? 'Preencha os dados e clique em Salvar' : `${formData.cnpj || '—'} · ${formData.nome_fantasia || '—'}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <button onClick={handleDelete}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir fornecedor">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-primary rounded-xl text-sm font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
                    <Save className="w-4 h-4" />Salvar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Dados Cadastrais */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />Informações de Registro
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Razão Social">
                      <input value={formData.razao_social} onChange={set('razao_social')} className={inputCls} placeholder="Razão Social completa" />
                    </Field>
                    <Field label="Nome Fantasia">
                      <input value={formData.nome_fantasia} onChange={set('nome_fantasia')} className={inputCls} placeholder="Nome comercial" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={<span className="flex items-center">CNPJ / CPF <HelpTip text="Dado mestre do Omie. Usado para validação de Notas Fiscais." /></span>}>
                        <input value={formData.cnpj} onChange={set('cnpj')} className={inputCls} placeholder="00.000.000/0001-00" />
                      </Field>
                      <Field label="Inscrição Estadual">
                        <input value={formData.inscricao_estadual} onChange={set('inscricao_estadual')} className={inputCls} placeholder="Isento" />
                      </Field>
                    </div>
                    <Field label="Status">
                      <select value={formData.status} onChange={set('status')} className={inputCls}>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Bloqueado">Bloqueado</option>
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Contatos */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4" />Contato & Faturamento
                  </p>
                  <div className="space-y-4">
                    <Field label="E-mail Principal">
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={formData.email} onChange={set('email')} className={inputCls + " pl-10"} placeholder="contato@empresa.com.br" />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Telefone">
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input value={formData.telefone} onChange={set('telefone')} className={inputCls + " pl-10"} placeholder="(11) 99999-9999" />
                        </div>
                      </Field>
                      <Field label="Website">
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input value={formData.website} onChange={set('website')} className={inputCls + " pl-10"} placeholder="www.exemplo.com" />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" />Endereço de Entrega / Obra
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="CEP" className="md:col-span-1">
                      <input value={formData.cep} onChange={set('cep')} placeholder="00000-000" className={inputCls} />
                    </Field>
                    <Field label="Logradouro" className="md:col-span-2">
                      <input value={formData.logradouro} onChange={set('logradouro')} placeholder="Rua, Avenida, etc." className={inputCls} />
                    </Field>
                    <Field label="Bairro">
                      <input value={formData.bairro} onChange={set('bairro')} className={inputCls} />
                    </Field>
                    <Field label="Cidade">
                      <input value={formData.cidade} onChange={set('cidade')} className={inputCls} />
                    </Field>
                    <Field label="UF">
                      <input value={formData.uf} onChange={set('uf')} maxLength={2} className={inputCls} placeholder="SP" />
                    </Field>
                  </div>
                </div>

                {/* Omie placeholder */}
                <div className="col-span-1 md:col-span-2 bg-secondary/5 border-2 border-dashed border-secondary/30 rounded-3xl p-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-secondary mx-auto animate-pulse" />
                  <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Espaço Reservado para Integração Omie</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    A API de Fornecedores (Consultar, Listar e Upsert) será conectada neste módulo.
                    Isso permitirá que os dados de fornecimento venham diretamente do ERP sem necessidade de redigitação.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="text-[10px] bg-secondary/20 text-secondary px-3 py-1 rounded-full font-black uppercase">API de Fornecedores v1</span>
                    <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full font-black uppercase">Em Espera</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-400">Selecione um fornecedor ou clique em Novo Fornecedor</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300" role="status">
          <div className={cn(
            'flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white',
            toast.type === 'success' ? 'bg-green-500 border-green-700' :
            toast.type === 'error'   ? 'bg-red-500 border-red-700' :
            'bg-blue-600 border-blue-800'
          )}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-bold">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
