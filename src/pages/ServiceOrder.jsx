import React, { useState } from 'react';
import { Search, Plus, Filter, Wrench, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ordens de Serviço</h1>
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
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar OS ou Equipamento..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]" />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
              <Filter className="w-4 h-4" /> Tipo / Resp / Status
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Número OS</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Equipamento</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Resp Técnico</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data / Prazo</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_OS.map((os, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-black text-slate-900"><div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" /> {os.num}</div></td>
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
                      {os.status === 'Concluída' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Concluída</span>}
                      {os.status === 'Cancelada' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest">Cancelada</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
             <div>
                <h3 className="font-black text-slate-900 text-lg">Abertura de O.S.</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preencha os dados do chamado</p>
             </div>
             <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo da O.S.</label>
                  <select className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none">
                     <option>Instalação</option>
                     <option>Manutenção Preventiva</option>
                     <option>Manutenção Corretiva</option>
                     <option>Inspeção</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsável</label>
                  <select className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none">
                     <option value="danilo">Danilo</option>
                     <option value="matheus">Matheus</option>
                     <option value="thiago">Thiago</option>
                  </select>
                </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipamento / SKU / Local</label>
              <input type="text" placeholder="Ex: Esteira de Picking, VPER-ESS-NY..." className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00]" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição do Serviço</label>
              <textarea rows={4} placeholder="Descreva os sintomas, falhas ou ações requeridas..." className="w-full bg-slate-50 border-none rounded-[1.5rem] p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] resize-none" />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 bg-white text-slate-500 font-bold rounded-[2rem] text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               >
                Cancelar
              </button>
              <button className="px-6 py-3 flex items-center gap-2 bg-[#ffcd00] text-black font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
                <CheckCircle2 className="w-4 h-4" /> Abrir Chamado O.S.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
