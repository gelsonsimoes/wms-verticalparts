import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, Truck, CheckSquare, DoorOpen, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const DOCK_STATUS = [
  { id: 1, name: 'Doca 01', status: 'Ocupada', vehicle: 'GHK-9U88', time: '45m' },
  { id: 2, name: 'Doca 02', status: 'Ocupada', vehicle: 'RTY-1B23', time: '12m' },
  { id: 3, name: 'Doca 03', status: 'Livre',   vehicle: '-',        time: '-'   },
  { id: 4, name: 'Doca 04', status: 'Livre',   vehicle: '-',        time: '-'   },
];

// IDs estáveis adicionados: key={mov.id} evita re-renders incorretos por reordenação
const MOCK_MOVEMENTS = [
  { id: 'MOV-001', placa: 'GHK-9U88', trans: 'Expresso ABC',       mot: 'José Carlos', tipo: 'Entrada', doca: 'Doca 01',    hora: '14:20', status: 'No Pátio'   },
  { id: 'MOV-002', placa: 'RTY-1B23', trans: 'Logística Total',     mot: 'Carlos Silva', tipo: 'Saída',   doca: 'Doca 02',    hora: '15:10', status: 'Carregando' },
  { id: 'MOV-003', placa: 'JHG-4T56', trans: 'VerticalParts Frota', mot: 'Antônio',      tipo: 'Entrada', doca: 'Aguardando', hora: '15:55', status: 'Triagem'    },
  { id: 'MOV-004', placa: 'MNO-9I88', trans: 'Sedex Cargas',        mot: 'Paulo',        tipo: 'Saída',   doca: 'Recebto',    hora: '10:15', status: 'Liberado'   },
];

// Lógica de turno por hora — reutilizada no filtro
function getTurno(hora) {
  const h = parseInt(hora.split(':')[0], 10);
  if (h >= 6  && h < 14) return 'Manhã';
  if (h >= 14 && h < 22) return 'Tarde';
  return 'Noite';
}

export default function GateManager() {
  const [search,      setSearch]      = useState('');
  const [turno,       setTurno]       = useState('Todos os Turnos');

  // Filtro funcional: busca por placa, motorista ou transportadora + turno
  const filteredMovements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_MOVEMENTS.filter(mov => {
      const matchSearch = !q ||
        mov.placa.toLowerCase().includes(q) ||
        mov.mot.toLowerCase().includes(q)   ||
        mov.trans.toLowerCase().includes(q);
      const matchTurno = turno === 'Todos os Turnos' || getTurno(mov.hora) === turno;
      return matchSearch && matchTurno;
    });
  }, [search, turno]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de Portaria</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de Entradas e Saídas (Pátio e Docas)</p>
        </div>
        <div className="flex gap-2">
          {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/gate/release-exit */}
          <button
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black rounded-[2rem] border border-red-200 text-sm hover:scale-105 transition-transform active:scale-95 shadow-sm"
          >
            <DoorOpen className="w-4 h-4" aria-hidden="true" /> Liberar Saída
          </button>
          {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/gate/register-entry */}
          {/* bg-primary = #FFD700 (definido no @theme do index.css) */}
          <button
            className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20"
          >
            <Truck className="w-4 h-4" aria-hidden="true" /> Registrar Entrada
          </button>
        </div>
      </div>

      {/* Cards de Status das Docas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DOCK_STATUS.map(doca => (
          <div
            key={doca.id}
            className={cn(
              'rounded-[2rem] p-5 shadow-sm border',
              doca.status === 'Ocupada' ? 'bg-white border-red-200' : 'bg-white border-green-200'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{doca.name}</h3>
              {/* aria-label: indicador colorido é a única forma visual de comunicar status */}
              <div
                className={cn('w-3 h-3 rounded-full animate-pulse', doca.status === 'Ocupada' ? 'bg-red-500' : 'bg-green-500')}
                aria-label={doca.status === 'Ocupada' ? 'Doca ocupada' : 'Doca livre'}
              />
            </div>
            {doca.status === 'Ocupada' ? (
              <div>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono tracking-wider">{doca.vehicle}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" /> Tempo Operação: {doca.time}
                </p>
              </div>
            ) : (
              <div className="py-2.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Livre para operação</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Painel de Movimentos */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">

        {/* Barra de filtros — agora funcionais */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar Placa, Motorista, Transp..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={turno}
            onChange={e => setTurno(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-none rounded-[2rem] text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Todos os Turnos</option>
            <option>Manhã</option>
            <option>Tarde</option>
            <option>Noite</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" aria-hidden="true" /> Filtros
          </button>
        </div>

        {/* Estado vazio */}
        {filteredMovements.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Nenhum movimento para "{search || turno}"
            </p>
          </div>
        )}

        {/* Tabela */}
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
              {filteredMovements.map(mov => (
                // key usa ID estável — evita re-renders incorretos por reordenação
                <tr key={mov.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4 text-sm font-black text-slate-900">
                    <span className="bg-white border-2 border-slate-900 rounded-sm px-2 py-0.5 tracking-widest shadow-sm font-mono">
                      {mov.placa}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600">{mov.trans}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600 flex items-center gap-2">
                    <CheckSquare className="w-3 h-3 text-green-500" aria-hidden="true" /> {mov.mot}
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'font-black text-[11px] uppercase tracking-widest px-2 py-1 rounded-[1rem]',
                      mov.tipo === 'Entrada' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                    )}>
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-black text-slate-800">{mov.doca}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500 font-mono">{mov.hora}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full',
                      mov.status === 'No Pátio'   && 'bg-yellow-100 text-yellow-700',
                      mov.status === 'Carregando' && 'bg-blue-100 text-blue-700',
                      mov.status === 'Triagem'    && 'bg-orange-100 text-orange-700',
                      mov.status === 'Liberado'   && 'bg-green-100 text-green-700',
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
