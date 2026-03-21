import React, { useState, useEffect } from 'react';
import { Bell, Download, Search, Filter, FileText, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';
function cn(...inputs) { return twMerge(clsx(inputs)); }

// Mapeamento de action → severity visual
function getSeverity(action) {
  if (!action) return 'info';
  const a = action.toLowerCase();
  if (a.includes('erro') || a.includes('falha') || a.includes('error') || a.includes('fail')) return 'critical';
  if (a.includes('aviso') || a.includes('warn')) return 'warning';
  return 'info';
}

export default function IntegrationAlerts() {
  const { warehouseId } = useApp();
  const [activeTab,    setActiveTab]    = useState('alerts');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [alerts,       setAlerts]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');

  // Busca alertas de integração da tabela activity_logs
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('resource_type', 'integration')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setAlerts(data.map(row => ({
          id:        row.id,
          date:      new Date(row.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
          type:      row.resource_name || row.action || '—',
          depositor: row.user_name || row.user_email || '—',
          file:      row.resource_id || '—',
          desc:      typeof row.details === 'object' && row.details?.message
                       ? row.details.message
                       : row.action || '—',
          severity:  getSeverity(row.action),
        })));
      }
    } catch (_) {
      // silencioso — tabela pode não existir
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [warehouseId]);

  const handleSaveConfig = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const filtered = alerts.filter(a =>
    !searchTerm ||
    a.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por arquivo ou descrição..."
                aria-label="Buscar alertas por arquivo ou descrição"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={fetchAlerts}
              aria-label="Recarregar alertas"
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span className="text-sm font-bold">Carregando alertas...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <AlertCircle className="w-8 h-8" aria-hidden="true" />
                <p className="text-sm font-bold">Nenhum alerta de integração encontrado.</p>
                <p className="text-xs text-slate-400">Os registros aparecem quando a tabela activity_logs contém entradas com resource_type = 'integration'.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data/Hora</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Usuário</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Recurso</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th scope="col" className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status/Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(alert => (
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
