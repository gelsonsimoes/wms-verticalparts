import React from 'react';
import { Search, Filter, Eye, Download, XOctagon, CheckCircle2, AlertTriangle, FileText, Database } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const MOCK_NFE = [
  { num: '45892', serie: '1', emitente: 'VerticalParts Matriz', dest: 'Cliente Elevadores ABC', valor: 'R$ 15.420,00', data: '26/02/2026', status: 'Autorizada' },
  { num: '45893', serie: '1', emitente: 'VerticalParts Matriz', dest: 'Condomínio Residencial Topz', valor: 'R$ 3.150,00', data: '26/02/2026', status: 'Pendente' },
  { num: '45894', serie: '1', emitente: 'VerticalParts Matriz', dest: 'Manutenção Expressa Ltda', valor: 'R$ 8.900,00', data: '26/02/2026', status: 'Cancelada' },
  { num: '45895', serie: '1', emitente: 'VerticalParts Filial SP', dest: 'Shopping Center XYZ', valor: 'R$ 42.100,50', data: '26/02/2026', status: 'Autorizada' },
  { num: '45896', serie: '1', emitente: 'VerticalParts Matriz', dest: 'Técnico Danilo', valor: 'R$ 850,00', data: '26/02/2026', status: 'Denegada' }
];

export default function NFeControl() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de NF-e</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Autorização e Controle SEFAZ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-full"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total do Dia</p>
            <h3 className="text-xl font-black text-slate-900">145</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Autorizadas</p>
            <h3 className="text-xl font-black text-slate-900">128</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <h3 className="text-xl font-black text-slate-900">12</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><XOctagon className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Com Erro / Denegadas</p>
            <h3 className="text-xl font-black text-slate-900">05</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por Número, Emitente, Destinatário..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">NF-e / Série</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Emitente</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Destinatário</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor Total</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Emissão</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status SEFAZ</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_NFE.map((nfe, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4 text-sm font-black text-slate-900">{nfe.num} <span className="text-slate-400 font-bold ml-1">/{nfe.serie}</span></td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600">{nfe.emitente}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600 truncate max-w-[150px]">{nfe.dest}</td>
                  <td className="py-4 px-4 text-sm font-black text-slate-900">{nfe.valor}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500">{nfe.data}</td>
                  <td className="py-4 px-4">
                    {nfe.status === 'Autorizada' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">{nfe.status}</span>}
                    {nfe.status === 'Pendente' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">{nfe.status}</span>}
                    {nfe.status === 'Cancelada' && <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{nfe.status}</span>}
                    {nfe.status === 'Denegada' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest">{nfe.status}</span>}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Visualizar XML"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors" title="Download DANFE"><Download className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Cancelar NF"><XOctagon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
