import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileSignature, Plus, Edit3, Ban, CheckCircle2, Warehouse, Briefcase,
  Filter, ChevronDown, X, Building2, DollarSign, Clock, Layers, Save,
  Trash2, PlusCircle, XCircle, AlertTriangle, RefreshCw, Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Protocolo estável baseado no ID do contrato (não Math.random) ────────────
function stableProtocol(contractId) {
  let h = 0;
  for (let i = 0; i < contractId.length; i++) h = ((h << 5) - h + contractId.charCodeAt(i)) | 0;
  return `TX-${Math.abs(h).toString(16).padStart(4, '0').toUpperCase().slice(0, 4)}`;
}

// ─── Configuração estática ────────────────────────────────────────────────────
const STATUSES = ['Aberto', 'Em Vigência', 'Aguardando Revisão', 'Finalizado', 'Cancelado'];

// Não há tabela de contratos no banco — lista vazia, gerenciada localmente
const INITIAL_CONTRACTS = [];

const WAREHOUSES = [
  { id: 'WH-01', name: 'CD Matriz — Cajamar',            location: 'Cajamar, SP' },
  { id: 'WH-02', name: 'CD Nordeste — Salvador',         location: 'Salvador, BA' },
  { id: 'WH-03', name: 'CD Sul — Curitiba',              location: 'Curitiba, PR' },
  { id: 'WH-04', name: 'Filial Interna — VerticalParts', location: 'São Paulo, SP' },
];

const INITIAL_SERVICES = [
  { id: 'SRV-001', code: 'LOG-01', name: 'Recebimento por Volume',     shift: 'Diurno',  value: 12.50, calcType: 'Unidade' },
  { id: 'SRV-002', code: 'LOG-02', name: 'Armazenagem por Palete/Dia', shift: 'Geral',   value: 3.80,  calcType: 'Diária'  },
  { id: 'SRV-003', code: 'LOG-03', name: 'Expedição Urgente (Zap)',    shift: 'Noturno', value: 25.00, calcType: 'Unidade' },
];

const STATUS_COLORS = {
  'Em Vigência':       'bg-green-100 text-green-700',
  'Aguardando Revisão':'bg-amber-100 text-amber-700',
  'Aberto':            'bg-blue-100 text-blue-700',
  'Cancelado':         'bg-red-100 text-red-700',
  'Finalizado':        'bg-slate-100 text-slate-500',
};

// ─── Toast leve ────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type='ok') => {
    const id = crypto.randomUUID();
    setToast({ id, msg, type });
    setTimeout(() => setToast(t => t?.id === id ? null : t), 4000);
  }, []);
  return { toast, show };
}

// ─── Modal de Cadastrar / Alterar contrato ─────────────────────────────────
function ContractFormModal({ initial, onClose, onSave }) {
  const isNew = !initial;
  const [form, setForm] = useState(initial ?? {
    id: '', description: '', payer: '', status: 'Aberto', startDate: '', endDate: '',
    warehouseIds: [], services: [],
  });
  const [erros, setErros] = useState({});

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Descrição obrigatória.';
    if (!form.payer.trim())       e.payer       = 'Pagador obrigatório.';
    if (!form.startDate)          e.startDate   = 'Data de início obrigatória.';
    if (!form.endDate)            e.endDate     = 'Data de término obrigatória.';
    if (form.startDate && form.endDate && form.endDate <= form.startDate)
      e.endDate = 'Término deve ser posterior ao início.';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErros(e); return; }
    const saved = isNew ? { ...form, id: `CTR-${Date.now()}`, warehouseIds: [], services: [] } : form;
    onSave(saved);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSignature className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black text-white uppercase">{isNew ? 'Cadastrar Contrato' : 'Alterar Contrato'}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-4">
          {[
            { label: 'ID do Contrato', key: 'id', readOnly: !isNew, placeholder: isNew ? 'Gerado automaticamente' : '' },
          ].map(f => isNew ? null : (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
              <input value={form[f.key]} disabled
                className="w-full px-4 py-2 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-mono text-slate-400 cursor-not-allowed opacity-60 outline-none" />
            </div>
          ))}
          {[
            { label:'Descrição / Objeto *', key:'description', placeholder:'Ex: Logística de Entrada' },
            { label:'Pagador / Tomador *',  key:'payer',       placeholder:'Ex: Empresa SA' },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
              <input value={form[f.key]} placeholder={f.placeholder}
                onChange={e => { setForm(p => ({...p,[f.key]:e.target.value})); setErros(v=>({...v,[f.key]:undefined})); }}
                className={cn('w-full px-4 py-2 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                  erros[f.key] ? 'border-red-400' : 'border-slate-200 focus:border-amber-400')} />
              {erros[f.key] && <p className="text-[10px] text-red-500 font-bold">{erros[f.key]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[['startDate','Início *'],['endDate','Término *']].map(([key,label]) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <input type="date" value={form[key]}
                  onChange={e => { setForm(p => ({...p,[key]:e.target.value})); setErros(v=>({...v,[key]:undefined})); }}
                  className={cn('w-full px-4 py-2 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                    erros[key] ? 'border-red-400' : 'border-slate-200 focus:border-amber-400')} />
                {erros[key] && <p className="text-[10px] text-red-500 font-bold">{erros[key]}</p>}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
              className="w-full px-4 py-2 border-2 border-slate-200 focus:border-amber-400 rounded-xl text-sm font-bold outline-none transition-all appearance-none">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-slate-800 text-white rounded-2xl text-sm font-black hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />{isNew ? 'Cadastrar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de armazéns ─────────────────────────────────────────────────────
function WarehouseModal({ contract, onClose, onSave }) {
  const [selected, setSelected] = useState(contract.warehouseIds ?? []);
  const toggle = id => setSelected(p => p.includes(id) ? p.filter(w => w !== id) : [...p, id]);
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-800 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase">Associação de Armazéns</h2>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{contract.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 flex-1 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WAREHOUSES.map(wh => {
              const isSelected = selected.includes(wh.id);
              return (
                <label key={wh.id} className={cn('p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all',
                  isSelected ? 'bg-amber-50 border-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300')}>
                  <div className="flex items-center gap-4">
                    <div className={cn('p-2.5 rounded-xl transition-all', isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400')}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-800 dark:text-white">{wh.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{wh.location}</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={isSelected} onChange={() => toggle(wh.id)}
                    aria-label={`Selecionar ${wh.name}`}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer" />
                </label>
              );
            })}
          </div>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={() => onSave(selected)}
            className="flex-[2] py-3 bg-slate-800 text-white rounded-2xl text-sm font-black hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Confirmar Vínculo ({selected.length} armazén(s))
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de serviços ─────────────────────────────────────────────────────
function ServicesModal({ contract, allServices, onClose, onSave }) {
  const [services, setServices]     = useState(allServices);
  const [showForm, setShowForm]     = useState(false);
  const [editSrv,  setEditSrv]      = useState(null);
  const [newForm,  setNewForm]      = useState({ code:'', name:'', shift:'Diurno', value:'', calcType:'Unidade' });
  const [erros,    setErros]        = useState({});

  const validateSrv = () => {
    const e = {};
    if (!newForm.code.trim())  e.code  = 'Código obrigatório.';
    if (!newForm.name.trim())  e.name  = 'Nome obrigatório.';
    if (!newForm.value || isNaN(parseFloat(newForm.value))) e.value = 'Valor inválido.';
    return e;
  };

  const saveSrv = () => {
    const e = validateSrv();
    if (Object.keys(e).length) { setErros(e); return; }
    const srv = { id: editSrv?.id ?? `SRV-${Date.now()}`, code: newForm.code, name: newForm.name, shift: newForm.shift, value: parseFloat(newForm.value), calcType: newForm.calcType };
    setServices(p => editSrv ? p.map(s => s.id === editSrv.id ? srv : s) : [...p, srv]);
    setShowForm(false); setEditSrv(null); setNewForm({ code:'', name:'', shift:'Diurno', value:'', calcType:'Unidade' }); setErros({});
  };

  const deleteSrv = id => setServices(p => p.filter(s => s.id !== id));

  const startEdit = (srv) => {
    setEditSrv(srv);
    setNewForm({ code: srv.code, name: srv.name, shift: srv.shift, value: String(srv.value), calcType: srv.calcType });
    setShowForm(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 px-7 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-black text-white uppercase">Tabela de Serviços &amp; Preços</h2>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{contract.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-7 flex-1 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{services.length} serviço(s) cadastrado(s)</p>
            <button onClick={() => { setShowForm(true); setEditSrv(null); setNewForm({ code:'', name:'', shift:'Diurno', value:'', calcType:'Unidade' }); }}
              className="flex items-center gap-2 bg-amber-400 text-slate-900 font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-md hover:bg-amber-500 active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4" /> Novo Serviço
            </button>
          </div>

          {showForm && (
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border-2 border-amber-400 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{editSrv ? 'Editar Serviço' : 'Novo Serviço'}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[['code','Código'],['name','Descrição']].map(([k,l]) => (
                  <div key={k} className={k==='name' ? 'md:col-span-2 space-y-1' : 'space-y-1'}>
                    <label className="text-[10px] font-black text-slate-400 uppercase">{l} *</label>
                    <input value={newForm[k]} onChange={e => { setNewForm(p=>({...p,[k]:e.target.value})); setErros(v=>({...v,[k]:undefined})); }}
                      className={cn('w-full px-3 py-2 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                        erros[k] ? 'border-red-400' : 'border-slate-200 focus:border-amber-400')} />
                    {erros[k] && <p className="text-[10px] text-red-500 font-bold">{erros[k]}</p>}
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Turno</label>
                  <select value={newForm.shift} onChange={e => setNewForm(p=>({...p,shift:e.target.value}))}
                    className="w-full px-3 py-2 border-2 border-slate-200 focus:border-amber-400 rounded-xl text-sm font-bold outline-none appearance-none">
                    {['Diurno','Noturno','Geral'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Tipo Cálculo</label>
                  <select value={newForm.calcType} onChange={e => setNewForm(p=>({...p,calcType:e.target.value}))}
                    className="w-full px-3 py-2 border-2 border-slate-200 focus:border-amber-400 rounded-xl text-sm font-bold outline-none appearance-none">
                    {['Unidade','Diária','Percentual'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Valor Unitário (R$) *</label>
                  <input type="number" min="0" step="0.01" value={newForm.value} onChange={e => { setNewForm(p=>({...p,value:e.target.value})); setErros(v=>({...v,value:undefined})); }}
                    className={cn('w-full px-3 py-2 border-2 rounded-xl text-sm font-bold outline-none transition-all',
                      erros.value ? 'border-red-400' : 'border-slate-200 focus:border-amber-400')} />
                  {erros.value && <p className="text-[10px] text-red-500 font-bold">{erros.value}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditSrv(null); setErros({}); }}
                  className="px-5 py-2 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                <button onClick={saveSrv}
                  className="px-5 py-2 bg-amber-400 text-slate-900 rounded-xl text-sm font-black hover:bg-amber-500 active:scale-95 transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" />{editSrv ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-5 py-4">Código</th><th className="px-5 py-4">Serviço</th>
                  <th className="px-5 py-4">Turno</th><th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-4 text-center">Valor Unit.</th><th className="px-5 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {services.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-medium text-xs">Nenhum serviço cadastrado.</td></tr>
                )}
                {services.map(srv => (
                  <tr key={srv.id} className="hover:bg-white dark:hover:bg-slate-800 transition-all group">
                    <td className="px-5 py-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-black">#{srv.code}</span></td>
                    <td className="px-5 py-4">{srv.name}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2"><Clock className="w-3 h-3 text-amber-500" />{srv.shift}</div></td>
                    <td className="px-5 py-4"><span className="text-[9px] text-slate-400 uppercase">{srv.calcType}</span></td>
                    <td className="px-5 py-4 text-center font-black text-emerald-600">
                      R$ {srv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(srv)} title="Editar serviço"
                          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all active:scale-95">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteSrv(srv.id)} title="Excluir serviço"
                          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all active:scale-95">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Alterações afetam novos cálculos de bilhetagem pro-rata.
          </p>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={() => onSave(services)}
            className="flex-[2] py-3 bg-slate-800 text-white rounded-2xl text-sm font-black hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> Concluir Revisão Técnica
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal cancelar/finalizar ─────────────────────────────────────────────
function CancelModal({ contract, onClose, onConfirm }) {
  const [action, setAction] = useState('Cancelado');
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border-2 border-red-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm">Encerrar Contrato</p>
            <p className="text-[10px] text-red-600 font-bold">{contract.id}</p>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {['Cancelado','Finalizado'].map(v => (
            <label key={v} className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
              action===v ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300')}>
              <input type="radio" name="action" value={v} checked={action===v} onChange={() => setAction(v)} className="accent-red-600" />
              <div>
                <p className="font-black text-xs text-slate-800 dark:text-white">{v}</p>
                <p className="text-[10px] text-slate-400">{v==='Cancelado' ? 'Contrato anulado antes da vigência.' : 'Contrato cumprido normalmente.'}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50">Cancelar</button>
          <button onClick={() => onConfirm(action)} className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 active:scale-95 transition-all">
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Componente principal ─────────────────────────────────────────────────
export default function ContractManager() {
  const { warehouseId } = useApp();
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [services,  setServices]  = useState(INITIAL_SERVICES);
  const [viewStatus, setViewStatus] = useState('Todos');
  const [selectedId, setSelectedId] = useState(null);

  const [showNewModal,       setShowNewModal]       = useState(false);
  const [showEditModal,      setShowEditModal]       = useState(false);
  const [showWarehouseModal, setShowWarehouseModal]  = useState(false);
  const [showServicesModal,  setShowServicesModal]   = useState(false);
  const [showCancelModal,    setShowCancelModal]     = useState(false);

  const { toast, show: showToast } = useToast();
  const selectedContract = contracts.find(c => c.id === selectedId);

  const filtered = useMemo(() =>
    contracts.filter(c => viewStatus === 'Todos' || c.status === viewStatus),
  [contracts, viewStatus]);

  const canEdit   = selectedContract?.status === 'Aguardando Revisão';
  const canCancel = selectedId && !['Cancelado','Finalizado'].includes(selectedContract?.status);

  const saveNew      = (c)     => { setContracts(p => [c, ...p]); setSelectedId(c.id); setShowNewModal(false); showToast('Contrato cadastrado!'); };
  const saveEdit     = (c)     => { setContracts(p => p.map(x => x.id === c.id ? c : x)); setShowEditModal(false); showToast('Contrato atualizado!'); };
  const saveWH       = (ids)   => { setContracts(p => p.map(c => c.id === selectedId ? {...c, warehouseIds: ids} : c)); setShowWarehouseModal(false); showToast('Armazéns vinculados!'); };
  const saveServices = (srvs)  => { setServices(srvs); setShowServicesModal(false); showToast('Tabela de serviços atualizada!'); };
  const confirmCancel= (status)=> { setContracts(p => p.map(c => c.id === selectedId ? {...c, status} : c)); setShowCancelModal(false); showToast(`Contrato ${status.toLowerCase()}.`); };

  return (
    <div className="space-y-6 pb-20">

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2',
          toast.type==='erro' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200')}>
          <CheckCircle2 className="w-4 h-4" />{toast.msg}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-amber-400" /> 6.2 Gerenciador de Contratos
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Gestão de bilhetagem logística e vigência contratual</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-700 active:scale-95 transition-all">
          <Plus className="w-4 h-4 text-amber-400" /> Cadastrar Contrato
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Filtrar por Status</label>
            <div className="relative">
              <select value={viewStatus} onChange={e => setViewStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-black text-white outline-none focus:border-amber-400 transition-all appearance-none cursor-pointer">
                <option className="bg-slate-800">Todos</option>
                {STATUSES.map(s => <option key={s} className="bg-slate-800">{s}</option>)}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60 pointer-events-none" />
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-wrap items-end justify-end gap-3">
            <div className="relative group/btn">
              <button disabled={!selectedId || !canEdit} onClick={() => setShowEditModal(true)}
                className={cn('flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                  !selectedId || !canEdit ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' : 'bg-amber-400 text-slate-900 shadow-lg hover:scale-105 active:scale-95')}>
                <Edit3 className="w-4 h-4" /> Alterar Contrato
              </button>
              {selectedId && !canEdit && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
                  Apenas contratos "Aguardando Revisão" podem ser alterados
                </div>
              )}
            </div>
            <button disabled={!selectedId} onClick={() => setShowWarehouseModal(true)}
              className={cn('flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                !selectedId ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 active:scale-95')}>
              <Warehouse className="w-4 h-4" /> Definir Armazém
            </button>
            <button disabled={!selectedId} onClick={() => setShowServicesModal(true)}
              className={cn('flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                !selectedId ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 active:scale-95')}>
              <Briefcase className="w-4 h-4" /> Gestão de Serviços
            </button>
            <button disabled={!canCancel} onClick={() => setShowCancelModal(true)}
              className={cn('flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                !canCancel ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' : 'bg-red-600 text-white shadow-lg hover:bg-red-700 active:scale-95')}>
              <Ban className="w-4 h-4" /> Cancelar / Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-5">Número</th>
                <th className="px-6 py-5">Descrição / Pagador</th>
                <th className="px-6 py-5 text-center">Protocolo</th>
                <th className="px-6 py-5">Situação</th>
                <th className="px-6 py-5">Início / Término</th>
                <th className="px-6 py-5 text-center">Armazéns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Info className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum contrato cadastrado</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Clique em "Cadastrar Contrato" para adicionar o primeiro contrato ao sistema.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(item => (
                <tr key={item.id} onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={cn('hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer',
                    selectedId === item.id ? 'bg-amber-50/50 border-l-4 border-amber-400' : 'border-l-4 border-transparent')}>
                  <td className="px-6 py-5 font-black text-slate-800 dark:text-white">{item.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold">{item.description}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />{item.payer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full font-mono text-[10px] text-slate-400">
                      #{stableProtocol(item.id)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn('px-2.5 py-1 text-[9px] font-black uppercase rounded-lg inline-block min-w-[110px] text-center', STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-400')}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-slate-500 text-[11px]">
                    {item.startDate} → {item.endDate}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn('text-[10px] font-black', item.warehouseIds.length > 0 ? 'text-amber-600' : 'text-slate-300')}>
                      {item.warehouseIds.length > 0 ? `${item.warehouseIds.length} armazém(ns)` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal       && <ContractFormModal onClose={() => setShowNewModal(false)} onSave={saveNew} />}
      {showEditModal      && selectedContract && <ContractFormModal initial={selectedContract} onClose={() => setShowEditModal(false)} onSave={saveEdit} />}
      {showWarehouseModal && selectedContract && <WarehouseModal contract={selectedContract} onClose={() => setShowWarehouseModal(false)} onSave={saveWH} />}
      {showServicesModal  && selectedContract && <ServicesModal contract={selectedContract} allServices={services} onClose={() => setShowServicesModal(false)} onSave={saveServices} />}
      {showCancelModal    && selectedContract && <CancelModal contract={selectedContract} onClose={() => setShowCancelModal(false)} onConfirm={confirmCancel} />}
    </div>
  );
}
