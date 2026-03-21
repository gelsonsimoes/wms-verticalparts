import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { Search, Filter, Wrench, CheckCircle2, Calendar, AlertCircle, X, Plus, Edit2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Toast Component ───────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300" role="status">
      <div className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl text-white",
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error'   ? 'bg-red-600' :
        'bg-blue-600'
      )}>
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />}
        <p className="text-sm font-bold">{toast.message}</p>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────
function ConfirmModal({ open, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-sm w-full space-y-4">
        <p className="text-sm font-bold text-slate-800">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-[1.5rem] border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-[1.5rem] bg-[#ffcd00] text-black font-black text-sm hover:scale-105 transition-transform">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'Aberta':       'bg-blue-100 text-blue-700',
    'Em Andamento': 'bg-yellow-100 text-yellow-700',
    'Concluída':    'bg-green-100 text-green-700',
    'Cancelada':    'bg-red-100 text-red-700',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", map[status] || 'bg-slate-100 text-slate-600')}>
      {status}
    </span>
  );
}

const SEED_OS = [
  { numero: 'OS-2026-001', tipo: 'Inspeção',             equipamento: 'Escada Rolante - Shopping ABC',          tecnico_id: 'Danilo',  status: 'Concluída',    prioridade: 'Normal', data_abertura: '2026-02-25', data_previsao: '2026-02-26', descricao: 'Inspeção de rotina.' },
  { numero: 'OS-2026-002', tipo: 'Manutenção Preventiva', equipamento: 'Esteira de Picking (WMS)',               tecnico_id: 'Matheus', status: 'Em Andamento', prioridade: 'Alta',   data_abertura: '2026-02-26', data_previsao: '2026-02-27', descricao: 'Lubrificação e ajuste de correia.' },
  { numero: 'OS-2026-003', tipo: 'Instalação',            equipamento: 'Barreira Infravermelha VEPEL-BPI-174FX', tecnico_id: 'Thiago', status: 'Aberta',       prioridade: 'Normal', data_abertura: '2026-02-26', data_previsao: '2026-02-28', descricao: 'Instalar barreira na doca 2.' },
];

export default function ServiceOrder() {
  const { warehouseId } = useApp();
  const [activeTab, setActiveTab]   = useState('list');
  const [osList, setOsList]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterHint, setShowFilterHint] = useState(false);
  const osId = useId();

  // Toast
  const [toast, setToast]       = useState(null);
  const toastRef = useRef(null);
  const showToast = (message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  // Confirm modal
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const askConfirm = (message, fn) => setConfirm({ open: true, message, onConfirm: fn });
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null });

  // Form state
  const [form, setForm] = useState({ tipo: 'Instalação', tecnico_id: 'Danilo', equipamento: '', descricao: '', prioridade: 'Normal' });

  // Edit state
  const [editingId, setEditingId]   = useState(null);
  const [editStatus, setEditStatus] = useState('');

  // ─── Load from Supabase ─────────────────────────────────────────
  const loadOS = async () => {
    if (!warehouseId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false });
    if (error) { showToast('Erro ao carregar OS: ' + error.message, 'error'); setLoading(false); return; }

    if (data.length === 0) {
      // Seed demo records
      const seeds = SEED_OS.map(s => ({ ...s, warehouse_id: warehouseId, cliente: 'VerticalParts' }));
      const { data: inserted, error: seedErr } = await supabase.from('ordens_servico').insert(seeds).select();
      if (seedErr) { showToast('Erro ao inserir OS demo: ' + seedErr.message, 'error'); }
      else setOsList(inserted || []);
    } else {
      setOsList(data);
    }
    setLoading(false);
  };

  useEffect(() => { loadOS(); }, [warehouseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Submit nova OS ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipamento.trim()) { showToast('Informe o equipamento.', 'error'); return; }
    const today = new Date().toISOString().split('T')[0];
    const prazo = new Date(); prazo.setDate(prazo.getDate() + 2);
    const nextNum = `OS-${new Date().getFullYear()}-${String(osList.length + 1).padStart(3, '0')}`;

    const payload = {
      warehouse_id:  warehouseId,
      numero:        nextNum,
      tipo:          form.tipo,
      equipamento:   form.equipamento,
      tecnico_id:    form.tecnico_id,
      status:        'Aberta',
      prioridade:    form.prioridade,
      descricao:     form.descricao,
      data_abertura: today,
      data_previsao: prazo.toISOString().split('T')[0],
      cliente:       'VerticalParts',
    };
    const { data, error } = await supabase.from('ordens_servico').insert([payload]).select().single();
    if (error) { showToast('Erro ao criar OS: ' + error.message, 'error'); return; }
    setOsList(prev => [data, ...prev]);
    setForm({ tipo: 'Instalação', tecnico_id: 'Danilo', equipamento: '', descricao: '', prioridade: 'Normal' });
    showToast('Ordem de Serviço aberta com sucesso!');
    setActiveTab('list');
  };

  // ─── Update status ────────────────────────────────────────────
  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('ordens_servico').update({ status: newStatus }).eq('id', id);
    if (error) { showToast('Erro ao atualizar status: ' + error.message, 'error'); return; }
    setOsList(prev => prev.map(os => os.id === id ? { ...os, status: newStatus } : os));
    setEditingId(null);
    showToast('Status atualizado!');
  };

  // ─── Delete OS ────────────────────────────────────────────────
  const handleDelete = (id) => {
    askConfirm('Deseja cancelar esta Ordem de Serviço?', async () => {
      closeConfirm();
      const { error } = await supabase.from('ordens_servico').update({ status: 'Cancelada' }).eq('id', id);
      if (error) { showToast('Erro: ' + error.message, 'error'); return; }
      setOsList(prev => prev.map(os => os.id === id ? { ...os, status: 'Cancelada' } : os));
      showToast('OS cancelada.');
    });
  };

  // ─── Filtered list ────────────────────────────────────────────
  const filteredOS = useMemo(() =>
    osList.filter(os =>
      (os.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (os.equipamento || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [osList, searchTerm]);

  const formatDate = (d) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">2.19 Ordem de Serviço</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Inspeção, Manutenção e Instalação</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={cn("px-4 py-2 font-bold text-sm transition-all rounded-[2rem]", activeTab === 'list' ? "bg-[#ffcd00] text-black" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
          >
            Lista de OS
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={cn("px-4 py-2 font-bold text-sm transition-all rounded-[2rem]", activeTab === 'new' ? "bg-[#ffcd00] text-black" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
          >
            <Plus className="w-3 h-3 inline mr-1" aria-hidden="true" />Nova Abertura
          </button>
        </div>
      </div>

      {/* LIST TAB */}
      {activeTab === 'list' ? (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[500px]">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor={`${osId}-search`} className="sr-only">Buscar OS ou equipamento</label>
              <input
                id={`${osId}-search`}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar OS ou Equipamento..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterHint(v => !v)}
                aria-expanded={showFilterHint}
                aria-controls="os-filter-hint"
                className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                <Filter className="w-4 h-4" aria-hidden="true" /> Tipo / Resp / Status
              </button>
              {showFilterHint && (
                <div id="os-filter-hint" role="status" className="absolute right-0 mt-2 z-10 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-lg text-xs font-bold text-slate-500 whitespace-nowrap">
                  Filtros avançados em desenvolvimento
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-slate-400">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Número OS</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Equipamento</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Resp Técnico</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data / Prazo</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOS.length > 0 ? filteredOS.map(os => (
                    <tr key={os.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-sm font-black text-slate-900">
                        <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" aria-hidden="true" /> {os.numero}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-500">{os.tipo}</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-800">{os.equipamento}</td>
                      <td className="py-4 px-4 text-sm font-black text-slate-600">{os.tecnico_id}</td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-500">
                        <div>Abert: <span className="text-slate-900">{formatDate(os.data_abertura)}</span></div>
                        <div>Prazo: <span className="text-slate-900">{formatDate(os.data_previsao)}</span></div>
                      </td>
                      <td className="py-4 px-4">
                        {editingId === os.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value)}
                              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                            >
                              {['Aberta','Em Andamento','Concluída','Cancelada'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={() => handleUpdateStatus(os.id, editStatus)} className="p-1 text-green-600 hover:text-green-700" aria-label="Salvar status">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Cancelar edição">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <StatusBadge status={os.status} />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(os.id); setEditStatus(os.status); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            aria-label={`Editar status da OS ${os.numero}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          {os.status !== 'Cancelada' && (
                            <button
                              onClick={() => handleDelete(os.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              aria-label={`Cancelar OS ${os.numero}`}
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="py-12 text-center text-sm font-bold text-slate-400">Nenhuma OS encontrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* NEW OS FORM */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-lg">Abertura de O.S.</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preencha os dados do chamado</p>
            </div>
            <Calendar className="w-8 h-8 text-slate-300" aria-hidden="true" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="os-tipo" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo da O.S.</label>
                <select
                  id="os-tipo"
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none"
                >
                  <option>Instalação</option>
                  <option>Manutenção Preventiva</option>
                  <option>Manutenção Corretiva</option>
                  <option>Inspeção</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="os-responsavel" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsável</label>
                <select
                  id="os-responsavel"
                  value={form.tecnico_id}
                  onChange={e => setForm(f => ({ ...f, tecnico_id: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none"
                >
                  <option>Danilo</option>
                  <option>Matheus</option>
                  <option>Thiago</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="os-prioridade" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prioridade</label>
                <select
                  id="os-prioridade"
                  value={form.prioridade}
                  onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none"
                >
                  <option>Baixa</option>
                  <option>Normal</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="os-equipamento" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipamento / SKU / Local</label>
              <input
                id="os-equipamento"
                type="text"
                required
                value={form.equipamento}
                onChange={e => setForm(f => ({ ...f, equipamento: e.target.value }))}
                placeholder="Ex: Esteira de Picking, VPER-ESS-NY..."
                className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="os-descricao" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição do Serviço</label>
              <textarea
                id="os-descricao"
                rows={4}
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva os sintomas, falhas ou ações requeridas..."
                className="w-full bg-slate-50 border-none rounded-[1.5rem] p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 bg-white text-slate-500 font-bold rounded-[2rem] text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button type="submit" className="px-6 py-3 flex items-center gap-2 bg-[#ffcd00] text-black font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Abrir Chamado O.S.
              </button>
            </div>
          </div>
        </form>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onCancel={closeConfirm}
        onConfirm={confirm.onConfirm}
      />
    </div>
  );
}
