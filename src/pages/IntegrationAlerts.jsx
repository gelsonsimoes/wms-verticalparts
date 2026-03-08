import React, { useState } from 'react';
import { Bell, Download, Search, Filter, FileText, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const MOCK_ALERTS = [
  { id: 'AL-001', date: '26/02/2026 08:15', type: 'XML NF-e',    depositor: 'VerticalParts Matriz', file: 'NFE_14529_VP.xml',  desc: 'Falha na validação de schema: campo vUnCom ausente.',         severity: 'critical' },
  { id: 'AL-002', date: '26/02/2026 09:30', type: 'TXT Pedido',  depositor: 'VerticalParts Matriz', file: 'PED_9982_OUT.txt', desc: 'SKU VPER-ESS-NY-27MM não encontrado no cadastro do WMS.',     severity: 'warning'  },
  { id: 'AL-003', date: '26/02/2026 10:05', type: 'CT-e',        depositor: 'VerticalParts Matriz', file: 'CTE_881_VP.xml',   desc: 'Nova versão do layout da SEFAZ detectada.',                   severity: 'info'     },
  { id: 'AL-004', date: '26/02/2026 11:20', type: 'TXT Pedido',  depositor: 'VerticalParts Matriz', file: 'PED_9983_OUT.txt', desc: 'Quantidade solicitada maior que o estoque físico.',            severity: 'warning'  },
];

export default function IntegrationAlerts() {
  const [activeTab,     setActiveTab]     = useState('alerts');
  const [saveFeedback,  setSaveFeedback]  = useState(false);

  const handleSaveConfig = () => {
    // ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/alerts/config
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alertas de Integração</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Monitoramento de XML e TXT</p>
        </div>
        <div className="flex gap-2" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
            className={cn(
              'px-4 py-2 font-bold text-sm transition-all rounded-[2rem]',
              activeTab === 'alerts'
                ? 'bg-primary text-secondary'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            Últimos Alertas
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'config'}
            onClick={() => setActiveTab('config')}
            className={cn(
              'px-4 py-2 font-bold text-sm transition-all rounded-[2rem]',
              activeTab === 'config'
                ? 'bg-primary text-secondary'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            Configurar Alertas
          </button>
        </div>
      </div>

      {activeTab === 'alerts' ? (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: filtro por arquivo/descrição */}
              <input
                type="text"
                placeholder="Buscar por arquivo ou descrição..."
                aria-label="Buscar alertas por arquivo ou descrição"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button
              aria-label="Filtrar alertas"
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              <Filter className="w-4 h-4" aria-hidden="true" /> Filtrar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data/Hora</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Depositante</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Arquivo</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Descrição do Erro</th>
                  <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status/Ação</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ALERTS.map(alert => (
                  <tr key={alert.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" /> {alert.date}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">{alert.type}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">{alert.depositor}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" /> {alert.file}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600 max-w-xs truncate" title={alert.desc}>{alert.desc}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {alert.severity === 'critical' && <span className="px-3 py-1 bg-red-100    text-red-700    rounded-full text-[10px] font-black uppercase tracking-widest">Crítico</span>}
                        {alert.severity === 'warning'  && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">Aviso</span>}
                        {alert.severity === 'info'     && <span className="px-3 py-1 bg-blue-100   text-blue-700   rounded-full text-[10px] font-black uppercase tracking-widest">Info</span>}
                        {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: GET /api/alerts/${alert.id}/download */}
                        <button
                          aria-label={`Baixar arquivo ${alert.file}`}
                          title="Baixar Arquivo"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-yellow-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Download className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-slate-600" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Notificações por E-mail</h3>
              <p className="text-xs font-bold text-slate-500">Defina quem recebe alertas de integração</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-critical" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                E-mail para Erros Críticos (XML Rejeitado)
              </label>
              <input
                id="email-critical"
                type="email"
                defaultValue="danilo@verticalparts.com"
                className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email-warnings" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                E-mail para Avisos Gerais (Layouts, Cadastro)
              </label>
              <input
                id="email-warnings"
                type="email"
                defaultValue="ti@verticalparts.com"
                className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleSaveConfig}
                className="px-6 py-3 bg-primary text-secondary font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20"
              >
                Salvar Configurações
              </button>
              {saveFeedback && (
                <span className="text-[10px] font-bold text-green-600 animate-in fade-in duration-300">
                  ✓ Configurações salvas localmente.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
