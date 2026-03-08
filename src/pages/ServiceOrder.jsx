import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { Search, Filter, Wrench, CheckCircle2, Calendar, AlertCircle, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const MOCK_OS = [
  { num: 'OS-2026-001', type: 'Inspeção', equip: 'Escada Rolante - Shopping ABC', resp: 'Danilo', status: 'Concluída', data: '25/02/2026', prazo: '26/02/2026' },
  { num: 'OS-2026-002', type: 'Manutenção', equip: 'Esteira de Picking (WMS)', resp: 'Matheus', status: 'Em Andamento', data: '26/02/2026', prazo: '27/02/2026' },
  { num: 'OS-2026-003', type: 'Instalação', equip: 'Barreira Infravermelha VEPEL-BPI-174FX', resp: 'Thiago', status: 'Aberta', data: '26/02/2026', prazo: '28/02/2026' },
  { num: 'OS-2026-004', type: 'Manutenção', equip: 'Botoeira de Inspeção VEPEL-BTI', resp: 'Thiago', status: 'Aberta', data: '26/02/2026', prazo: '01/03/2026' },
  { num: 'OS-2026-005', type: 'Inspeção', equip: 'Paleteiras Elétricas Doca 3', resp: 'Danilo', status: 'Cancelada', data: '20/02/2026', prazo: '22/02/2026' }
];

export default function ServiceOrder() {
  const [activeTab, setActiveTab] = useState('list');
  const [osList, setOsList] = useState(MOCK_OS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterHint, setShowFilterHint] = useState(false);
  const osId = useId();

  // Toast System
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); }, []);

  // ─── Form state ───────────────────────────────────────────────
  const [form, setForm] = useState({ tipo: 'Instalação', responsavel: 'danilo', equipamento: '', descricao: '' });

  // ─── OS filtradas ─────────────────────────────────────────────
  const filteredOS = useMemo(() =>
    osList.filter(os =>
      os.num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.equip.toLowerCase().includes(searchTerm.toLowerCase())
    ), [osList, searchTerm]);

  // ─── Submit formulário ───────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.equipamento.trim()) {
      showToast('Informe o equipamento.', 'error');
      return;
    }
    const nextNum = `OS-2026-${String(osList.length + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('pt-BR');
    const prazoDate = new Date(); prazoDate.setDate(prazoDate.getDate() + 2);
    const novaOS = {
      num: nextNum,
      type: form.tipo,
      equip: form.equipamento,
      resp: form.responsavel.charAt(0).toUpperCase() + form.responsavel.slice(1),
      status: 'Aberta',
      data: today,
      prazo: prazoDate.toLocaleDateString('pt-BR'),
    };
    setOsList(prev => [novaOS, ...prev]);
    setForm({ tipo: 'Instalação', responsavel: 'danilo', equipamento: '', descricao: '' });
    showToast('Ordem de Serviço aberta com sucesso!', 'success');
    setActiveTab('list');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
            Nova Abertura
          </button>
        </div>
      </div>

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
                  Filtros avançados em desenvolvimento 🚧
                </div>
              )}
            </div>
          </div>

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
                </tr>
              </thead>
              <tbody>
                {filteredOS.length > 0 ? filteredOS.map(os => (
                  <tr key={os.num} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-black text-slate-900"><div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" aria-hidden="true" /> {os.num}</div></td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">{os.type}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{os.equip}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-600">{os.resp}</td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500">
                      <div>Abert: <span className="text-slate-900">{os.data}</span></div>
                      <div>Prazo: <span className="text-slate-900">{os.prazo}</span></div>
                    </td>
                    <td className="py-4 px-4">
                      {os.status === 'Aberta' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Aberta</span>}
                      {os.status === 'Em Andamento' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">Em Andamento</span>}
                      {os.status === 'Concluda' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Concluída</span>}
                      {os.status === 'Concluída' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Concluída</span>}
                      {os.status === 'Cancelada' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest">Cancelada</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-12 text-center text-sm font-bold text-slate-400">Nenhuma OS encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                    value={form.responsavel}
                    onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none"
                  >
                     <option value="danilo">Danilo</option>
                     <option value="matheus">Matheus</option>
                     <option value="thiago">Thiago</option>
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
                onClick={() => { setActiveTab('list'); }}
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
      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300"
          role="status"
        >
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white",
            toast.type === 'success' ? 'bg-green-500 border-green-700' : 
            toast.type === 'error'   ? 'bg-red-500 border-red-700' : 
            'bg-blue-600 border-blue-800'
          )}>
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
