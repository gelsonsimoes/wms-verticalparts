import React from 'react';
import { Search, Filter, Warehouse, Clock, Truck, ShieldCheck, MapPin, CheckSquare, ListTodo, DoorOpen } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const DOCK_STATUS = [
  { id: 1, name: 'Doca 01', status: 'Ocupada', vehicle: 'GHK-9U88', time: '45m' },
  { id: 2, name: 'Doca 02', status: 'Ocupada', vehicle: 'RTY-1B23', time: '12m' },
  { id: 3, name: 'Doca 03', status: 'Livre', vehicle: '-', time: '-' },
  { id: 4, name: 'Doca 04', status: 'Livre', vehicle: '-', time: '-' },
];

const MOCK_MOVEMENTS = [
  { placa: 'GHK-9U88', trans: 'Expresso ABC', mot: 'José Carlos', tipo: 'Entrada', doca: 'Doca 01', hora: '14:20', status: 'No Pátio' },
  { placa: 'RTY-1B23', trans: 'Logística Total', mot: 'Carlos Silva', tipo: 'Saída', doca: 'Doca 02', hora: '15:10', status: 'Carregando' },
  { placa: 'JHG-4T56', trans: 'VerticalParts Frota', mot: 'Antônio', tipo: 'Entrada', doca: 'Aguardando', hora: '15:55', status: 'Triagem' },
  { placa: 'MNO-9I88', trans: 'Sedex Cargas', mot: 'Paulo', tipo: 'Saída', doca: 'Recebto', hora: '10:15', status: 'Liberado' },
];

export default function GateManager() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de Portaria</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de Entradas e Saídas (Pátio e Docas)</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black rounded-[2rem] border border-red-200 text-sm hover:scale-105 transition-transform active:scale-95 shadow-sm">
             <DoorOpen className="w-4 h-4" /> Liberar Saída
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#ffcd00] text-black font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
             <Truck className="w-4 h-4" /> Registrar Entrada
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DOCK_STATUS.map(doca => (
          <div key={doca.id} className={cn("rounded-[2rem] p-5 shadow-sm border", doca.status === 'Ocupada' ? "bg-white border-red-200" : "bg-white border-green-200")}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{doca.name}</h3>
              <div className={cn("w-3 h-3 rounded-full animate-pulse", doca.status === 'Ocupada' ? "bg-red-500" : "bg-green-500")} />
            </div>
            {doca.status === 'Ocupada' ? (
              <div>
                 <p className="text-xl font-black text-slate-900 mt-1">{doca.vehicle}</p>
                 <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Tempo Operação: {doca.time}</p>
              </div>
            ) : (
              <div className="py-2.5">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Livre para operação</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar Placa, Motorista, Transp..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]" />
          </div>
          <select className="px-4 py-3 bg-slate-50 border-none rounded-[2rem] text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#ffcd00]">
             <option>Todos os Turnos</option>
             <option>Manhã</option>
             <option>Tarde</option>
             <option>Noite</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Placa Veículo</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Transportadora</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Motorista</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo Mov.</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Doca/Destino</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Hora</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status Interno</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MOVEMENTS.map((mov, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4 text-sm font-black text-slate-900 border border-transparent group-hover:bg-slate-100 transition-colors rounded-l-[1rem]">
                     <span className="bg-white border-2 border-slate-900 rounded-sm px-2 py-0.5 tracking-widest shadow-sm">{mov.placa}</span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600">{mov.trans}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600 flex items-center gap-2"><CheckSquare className="w-3 h-3 text-green-500" /> {mov.mot}</td>
                  <td className="py-4 px-4">
                     {mov.tipo === 'Entrada' ? (
                       <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-[1rem]">Entrada</span>
                     ) : (
                       <span className="text-red-600 font-black text-[11px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-[1rem]">Saída</span>
                     )}
                  </td>
                  <td className="py-4 px-4 text-sm font-black text-slate-800">{mov.doca}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500">{mov.hora}</td>
                  <td className="py-4 px-4">
                    <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                      mov.status === 'No Pátio' && 'bg-yellow-100 text-yellow-700',
                      mov.status === 'Carregando' && 'bg-blue-100 text-blue-700',
                      mov.status === 'Triagem' && 'bg-orange-100 text-orange-700',
                      mov.status === 'Liberado' && 'bg-green-100 text-green-700',
                    )}>
                      {mov.status}
                    </span>
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
