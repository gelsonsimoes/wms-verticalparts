import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, XOctagon, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

// ─── DADOS MOCK ───────────────────────────────────────────────────────────────
const MOCK_NFE = [
  { num: '45892', serie: '1', emitente: 'VerticalParts Matriz',    dest: 'Cliente Elevadores ABC',      valor: 'R$ 15.420,00', data: '26/02/2026', status: 'Autorizada' },
  { num: '45893', serie: '1', emitente: 'VerticalParts Matriz',    dest: 'Condomínio Residencial Topz', valor: 'R$  3.150,00', data: '26/02/2026', status: 'Pendente' },
  { num: '45894', serie: '1', emitente: 'VerticalParts Matriz',    dest: 'Manutenção Expressa Ltda',    valor: 'R$  8.900,00', data: '26/02/2026', status: 'Cancelada' },
  { num: '45895', serie: '1', emitente: 'VerticalParts Filial SP', dest: 'Shopping Center XYZ',         valor: 'R$ 42.100,50', data: '26/02/2026', status: 'Autorizada' },
  { num: '45896', serie: '1', emitente: 'VerticalParts Matriz',    dest: 'Técnico Operador',              valor: 'R$    850,00', data: '26/02/2026', status: 'Denegada' },
];

// Mapeamento de status para classes de badge
const STATUS_BADGE = {
  'Autorizada': 'bg-green-100 text-green-700',
  'Pendente':   'bg-yellow-100 text-yellow-700',
  'Cancelada':  'bg-slate-200 text-slate-600',
  'Denegada':   'bg-red-100 text-red-700',
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NFeControl() {
  const [searchTerm, setSearchTerm] = useState('');

  // KPIs calculados dinamicamente a partir do mock
  const total      = MOCK_NFE.length;
  const autorizadas = MOCK_NFE.filter(n => n.status === 'Autorizada').length;
  const pendentes   = MOCK_NFE.filter(n => n.status === 'Pendente').length;
  const erros       = MOCK_NFE.filter(n => n.status === 'Denegada' || n.status === 'Cancelada').length;

  // Filtro funcional
  const filteredNFE = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return MOCK_NFE;
    return MOCK_NFE.filter(nfe =>
      nfe.num.includes(q) ||
      nfe.emitente.toLowerCase().includes(q) ||
      nfe.dest.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">5.1 Gerenciar NF-e</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Autorização e Controle SEFAZ</p>
        </div>
      </div>

      {/* KPI Cards — calculados dinamicamente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-full" aria-hidden="true"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total do Dia</p>
            <h2 className="text-xl font-black text-slate-900">{total}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full" aria-hidden="true"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Autorizadas</p>
            <h2 className="text-xl font-black text-slate-900">{autorizadas}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full" aria-hidden="true"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <h2 className="text-xl font-black text-slate-900">{pendentes}</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full" aria-hidden="true"><XOctagon className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Com Erro / Denegadas</p>
            <h2 className="text-xl font-black text-slate-900">{String(erros).padStart(2, '0')}</h2>
          </div>
        </div>
      </div>

      {/* Painel da tabela */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">

        {/* Barra de busca e filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="search-nfe" className="sr-only">Buscar NF-e por número, emitente ou destinatário</label>
            <input
              id="search-nfe"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por Número, Emitente, Destinatário..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button
            onClick={() => alert('Filtros avançados — funcionalidade em desenvolvimento.')}
            aria-label="Abrir filtros avançados de NF-e"
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            <Filter className="w-4 h-4" aria-hidden="true" /> Filtros
          </button>
        </div>

        {/* Feedback quando busca não retorna resultados */}
        {filteredNFE.length === 0 && (
          <p className="text-center text-sm text-slate-400 font-medium py-10">
            Nenhuma NF-e encontrada para "<strong>{searchTerm}</strong>".
          </p>
        )}

        {/* Tabela */}
        {filteredNFE.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">NF-e / Série</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Emitente</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Destinatário</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor Total</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Emissão</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status SEFAZ</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredNFE.map(nfe => (
                  // Chave única baseada em número + série, não em índice
                  <tr key={`${nfe.num}-${nfe.serie}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-black text-slate-900">
                      {nfe.num} <span className="text-slate-400 font-bold ml-1">/{nfe.serie}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">{nfe.emitente}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600 truncate max-w-[150px]">{nfe.dest}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-900 tabular-nums">{nfe.valor}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">{nfe.data}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[nfe.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {nfe.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {/* Em mobile ficam sempre visíveis; em telas maiores aparecem no hover */}
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label={`Visualizar XML da NF-e ${nfe.num}`}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Download do DANFE da NF-e ${nfe.num}`}
                          className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                        >
                          <Download className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Cancelar NF-e ${nfe.num}`}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <XOctagon className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
