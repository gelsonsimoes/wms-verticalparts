import React, { useState, useMemo, useId } from 'react';
import {
  Users,
  Search,
  Plus,
  Save,
  Trash2,
  ChevronRight,
  Info,
  MapPin,
  Mail,
  Phone,
  Globe,
  Link,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── COMPONENTE DE AJUDA (TOOLTIP) ────────────────────────────
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

// ─── INPUT HELPER ─────────────────────────────────────────────────────
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

export default function CustomerCatalog() {
  const [customers] = useState([
    { id: 1, razao_social: 'VerticalParts Manutenção LTDA', nome_fantasia: 'VP Manutenção', cnpj: '12.345.678/0001-99', email: 'contato@vp.com.br', telefone: '(11) 98888-7777', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { id: 2, razao_social: 'Condomínio Edifício Horizon', nome_fantasia: 'Ed. Horizon', cnpj: '98.765.432/0001-00', email: 'adm@horizon.com.br', telefone: '(11) 3333-2222', cidade: 'Barueri', uf: 'SP', status: 'Ativo' },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const selected = useMemo(() => customers.find(c => c.id === selectedId), [customers, selectedId]);

  const filtered = useMemo(() =>
    customers.filter(c =>
      c.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search)
    ), [customers, search]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">
      
      {/* ══ HEADER ══ */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-amber-500 to-secondary" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">7.3 Cadastro e Segurança</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">7.3 Catálogo de Clientes & Parceiros</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Destinos de Peças · Condomínios · Técnicos · Fornecedores</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            
            {/* 🔗 MENSÃO À API DO OMIE */}
            <div className="relative group">
              <button disabled className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl text-xs font-black cursor-not-allowed opacity-60">
                <RefreshCw className="w-4 h-4" />Sincronizar Omie
              </button>
              <HelpTip text="A Integração via API Omie será conectada aqui. No futuro, os clientes serão importados automaticamente." position="bottom" />
            </div>

            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-primary rounded-2xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
              <Plus className="w-4 h-4" />Novo Cliente
            </button>
          </div>
        </div>
      </div>

      {/* ══ LAYOUT MASTER-DETAIL ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* MASTER — Lista lateral */}
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
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={cn('w-full text-left px-4 py-4 border-b border-slate-100 dark:border-slate-800 transition-all flex items-start gap-3',
                  selectedId === c.id ? 'bg-secondary/10 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                )}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  selectedId === c.id ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[10px] font-black font-mono truncate', selectedId === c.id ? 'text-secondary' : 'text-slate-500')}>{c.cnpj}</p>
                  <p className={cn('text-xs font-bold truncate leading-snug mt-0.5', selectedId === c.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>{c.nome_fantasia || c.razao_social}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{c.cidade} - {c.uf}</span>
                    <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">{c.status}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DETAIL */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          {selected ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Toolbar Ações */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selected.razao_social}</h2>
                    <p className="text-xs text-slate-500 font-bold">{selected.cnpj} · <span className="text-secondary">{selected.nome_fantasia}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-primary rounded-xl text-sm font-black hover:brightness-105 active:scale-95 transition-all shadow-md">
                    <Save className="w-4 h-4" />{saved ? 'Salvo!' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ── Dados Cadastrais ── */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />Informações de Registro
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Razão Social">
                      <input defaultValue={selected.razao_social} className={inputCls} />
                    </Field>
                    <Field label="Nome Fantasia">
                      <input defaultValue={selected.nome_fantasia} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={<span className="flex items-center">CNPJ / CPF <HelpTip text="Dado mestre do Omie. Usado para validação de Notas Fiscais." /></span>}>
                        <input defaultValue={selected.cnpj} className={inputCls} />
                      </Field>
                      <Field label="Inscrição Estadual">
                        <input placeholder="Isento" className={inputCls} />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* ── Contatos ── */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4" />Contato & Faturamento
                  </p>
                  <div className="space-y-4">
                    <Field label="E-mail Principal">
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input defaultValue={selected.email} className={inputCls + " pl-10"} />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Telefone">
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input defaultValue={selected.telefone} className={inputCls + " pl-10"} />
                        </div>
                      </Field>
                      <Field label="Website">
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input placeholder="www.exemplo.com" className={inputCls + " pl-10"} />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* ── Endereço ── */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" />Endereço de Entrega / Obra
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="CEP" className="md:col-span-1">
                      <input placeholder="00000-000" className={inputCls} />
                    </Field>
                    <Field label="Logradouro" className="md:col-span-2">
                      <input placeholder="Rua, Avenida, etc." className={inputCls} />
                    </Field>
                    <Field label="Bairro">
                      <input className={inputCls} />
                    </Field>
                    <Field label="Cidade">
                      <input defaultValue={selected.cidade} className={inputCls} />
                    </Field>
                    <Field label="UF">
                      <input defaultValue={selected.uf} className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* 🔗 BANNER DA API (Placeholder) */}
                <div className="col-span-1 md:col-span-2 bg-secondary/5 border-2 border-dashed border-secondary/30 rounded-3xl p-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-secondary mx-auto animate-pulse" />
                  <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Espaço Reservado para Integração Omie</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    A API de Clientes (Consultar, Listar e Upsert) será conectada neste módulo. 
                    Isso permitirá que os dados de faturamento e obra venham diretamente do ERP sem necessidade de redigitação.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="text-[10px] bg-secondary/20 text-secondary px-3 py-1 rounded-full font-black uppercase">API de Clientes v1</span>
                    <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full font-black uppercase">Em Espera</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-400">Selecione um cliente para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
