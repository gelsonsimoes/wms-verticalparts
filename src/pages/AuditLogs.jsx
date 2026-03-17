import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  User,
  Clock,
  FileJson,
  X,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  Users,
  Truck,
  Route,
  Layers,
  Building2,
  Warehouse,
  MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function exportCSV(filename, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]).filter(k => k !== 'details');
  const header = keys.join(';');
  const body = rows.map(r =>
    keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  const blob = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Config visual ────────────────────────────────────────────────────────────
const LEVEL_CFG = {
  CRITICAL: { badge: 'bg-red-100 text-red-700 border border-red-200',      label: 'CRÍTICO',  dot: 'bg-red-500',    statusText: 'text-red-400',   statusLabel: 'Crítico — requer atenção' },
  WARNING:  { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'AVISO',    dot: 'bg-amber-500',  statusText: 'text-amber-400', statusLabel: 'Aviso registrado' },
  INFO:     { badge: 'bg-blue-100 text-blue-700 border border-blue-200',    label: 'INFO',     dot: 'bg-green-500',  statusText: 'text-green-400', statusLabel: 'Registrado com sucesso' },
};

const ACTION_COLOR = {
  CRIOU:         'text-green-600 bg-green-50 border-green-200',
  ATUALIZOU:     'text-blue-600 bg-blue-50 border-blue-200',
  EXCLUIU:       'text-red-600 bg-red-50 border-red-200',
  BLOQUEOU:      'text-orange-600 bg-orange-50 border-orange-200',
  DESBLOQUEOU:   'text-teal-600 bg-teal-50 border-teal-200',
  DIVIDIU:       'text-purple-600 bg-purple-50 border-purple-200',
  IMPORTOU:      'text-indigo-600 bg-indigo-50 border-indigo-200',
  LOGIN:         'text-slate-600 bg-slate-50 border-slate-200',
};

const ENTITY_ICON = {
  produto:   Package,
  cliente:   Users,
  empresa:   Building2,
  armazém:   Warehouse,
  veículo:   Truck,
  rota:      Route,
  área:      MapPin,
  setor:     Layers,
  lote:      Layers,
};

const ENTITIES = ['produto', 'cliente', 'empresa', 'armazém', 'veículo', 'rota', 'área', 'setor', 'lote'];
const ACTIONS  = ['CRIOU', 'ATUALIZOU', 'EXCLUIU', 'BLOQUEOU', 'DESBLOQUEOU', 'DIVIDIU', 'IMPORTOU'];
const LEVELS   = ['INFO', 'WARNING', 'CRITICAL'];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AuditLogs() {
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedLog,   setSelectedLog]   = useState(null);

  // Filtros
  const [search,        setSearch]        = useState('');
  const [filterEntity,  setFilterEntity]  = useState('');
  const [filterAction,  setFilterAction]  = useState('');
  const [filterLevel,   setFilterLevel]   = useState('');
  const [filterUser,    setFilterUser]    = useState('');
  const [dateStart,     setDateStart]     = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateEnd,       setDateEnd]       = useState(() => new Date().toISOString().slice(0, 10));
  const [showFilters,   setShowFilters]   = useState(false);

  const channelRef = useRef(null);

  // ─── Carregar logs do Supabase ─────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', dateStart + 'T00:00:00')
      .lte('created_at', dateEnd + 'T23:59:59')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) { console.error('[AuditLogs] fetch:', error.message); setLoading(false); return; }
    setLogs(data || []);
    setLoading(false);
  }, [dateStart, dateEnd]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ─── Realtime: novos logs entram automaticamente ───────────────────────────
  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel('audit_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  // ─── Filtros locais (sobre o que já foi carregado) ─────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter(log => {
      if (filterEntity && log.entity !== filterEntity) return false;
      if (filterAction && log.action !== filterAction) return false;
      if (filterLevel  && log.level  !== filterLevel)  return false;
      if (filterUser   && !(log.user_name || '').toLowerCase().includes(filterUser.toLowerCase())) return false;
      if (q && !(log.description || '').toLowerCase().includes(q) &&
               !(log.entity_name || '').toLowerCase().includes(q) &&
               !(log.user_name   || '').toLowerCase().includes(q) &&
               !(log.op_id       || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, search, filterEntity, filterAction, filterLevel, filterUser]);

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const kpiTotal    = filtered.length;
  const kpiWarnings = filtered.filter(l => l.level === 'WARNING' || l.level === 'CRITICAL').length;
  const kpiExcluiu  = filtered.filter(l => l.action === 'EXCLUIU').length;
  const kpiCriou    = filtered.filter(l => l.action === 'CRIOU').length;

  const hasFilter = !!(filterEntity || filterAction || filterLevel || filterUser);

  const clearFilters = () => { setFilterEntity(''); setFilterAction(''); setFilterLevel(''); setFilterUser(''); setSearch(''); };

  const handleExportCSV = () => {
    const rows = filtered.map(l => ({
      data: fmtDate(l.created_at),
      usuario: l.user_name,
      acao: l.action,
      entidade: l.entity,
      nome: l.entity_name || '',
      descricao: l.description,
      nivel: l.level,
      op_id: l.op_id || '',
    }));
    exportCSV(`auditoria_${dateStart}_${dateEnd}.csv`, rows);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ══ CABEÇALHO ════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400" /> 8.4 Centro de Auditoria & Logs
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">
            Rastreabilidade total das operações do VerticalParts WMS — dados em tempo real
          </p>
        </div>

        {/* KPIs */}
        <div className="flex gap-2">
          {[
            { label: 'Eventos', val: kpiTotal,    color: 'bg-slate-100 text-slate-700' },
            { label: 'Criados', val: kpiCriou,    color: 'bg-green-100 text-green-700' },
            { label: 'Excluídos', val: kpiExcluiu, color: 'bg-red-100 text-red-700' },
            { label: 'Alertas',  val: kpiWarnings, color: 'bg-amber-100 text-amber-700' },
          ].map(k => (
            <div key={k.label} className={cn('px-3 py-2 rounded-xl text-center min-w-[64px]', k.color)}>
              <p className="text-lg font-black leading-none">{k.val}</p>
              <p className="text-[8px] font-black uppercase tracking-wider leading-none mt-0.5 opacity-70">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TOOLBAR ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-3 shadow-sm">

        {/* Período */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs font-bold outline-none focus:border-yellow-400 transition-all" />
          <span className="text-xs text-slate-400 font-bold">até</span>
          <input type="date" value={dateEnd} min={dateStart} onChange={e => setDateEnd(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs font-bold outline-none focus:border-yellow-400 transition-all" />
          <button onClick={fetchLogs}
            className="p-1.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg transition-all active:scale-95"
            title="Recarregar logs no período">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por descrição, usuário, entidade..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pr-9 pl-4 text-xs font-bold outline-none focus:border-yellow-400 transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Filtros avançados */}
        <button onClick={() => setShowFilters(p => !p)}
          className={cn('px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all border',
            showFilters || hasFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50')}>
          <Filter className="w-3.5 h-3.5" /> Filtros {hasFilter && '●'}
        </button>

        {hasFilter && (
          <button onClick={clearFilters} className="px-2 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all">
            <X className="w-3 h-3" /> Limpar
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? 'evento' : 'eventos'}
          </span>
          <button onClick={handleExportCSV}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* ══ FILTROS AVANÇADOS ═════════════════════════════════════════════════ */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-2 md:grid-cols-4 gap-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
          {[
            { label: 'Entidade', val: filterEntity, set: setFilterEntity, opts: ENTITIES },
            { label: 'Ação',     val: filterAction, set: setFilterAction, opts: ACTIONS  },
            { label: 'Nível',    val: filterLevel,  set: setFilterLevel,  opts: LEVELS   },
          ].map(f => (
            <div key={f.label} className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{f.label}</label>
              <select value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:border-yellow-400 transition-all appearance-none">
                <option value="">Todos</option>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Usuário</label>
            <input value={filterUser} onChange={e => setFilterUser(e.target.value)}
              placeholder="Nome do operador..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:border-yellow-400 transition-all" />
          </div>
        </div>
      )}

      {/* ══ GRID PRINCIPAL ═══════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3.5">Data e Hora</th>
                <th className="px-5 py-3.5">Operador</th>
                <th className="px-5 py-3.5 text-center">Ação</th>
                <th className="px-5 py-3.5">Entidade / Registro</th>
                <th className="px-5 py-3.5">Descrição</th>
                <th className="px-5 py-3.5 text-center">Nível</th>
                <th className="px-5 py-3.5 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">Carregando logs...</p>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">
                      {logs.length === 0
                        ? 'Nenhuma atividade registrada ainda. Faça uma operação (criar, editar, excluir) para ver os logs aqui.'
                        : 'Nenhum evento encontrado para os filtros aplicados.'}
                    </p>
                  </td>
                </tr>
              )}
              {!loading && filtered.map(log => {
                const lvl = LEVEL_CFG[log.level] || LEVEL_CFG.INFO;
                const actionColor = ACTION_COLOR[log.action] || 'text-slate-600 bg-slate-50 border-slate-200';
                const EntityIcon = ENTITY_ICON[log.entity] || ShieldCheck;
                return (
                  <tr key={log.id}
                    className={cn(
                      'hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-all',
                      log.level === 'CRITICAL' && 'bg-red-50/30 dark:bg-red-950/10',
                      log.level === 'WARNING'  && 'bg-amber-50/20 dark:bg-amber-950/10',
                    )}>

                    {/* Data */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
                        <Clock className="w-3 h-3 shrink-0" />
                        {fmtDate(log.created_at)}
                      </div>
                    </td>

                    {/* Operador */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="font-black text-xs text-slate-700 dark:text-slate-200 uppercase whitespace-nowrap">
                          {log.user_name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Ação */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border whitespace-nowrap', actionColor)}>
                        {log.action}
                      </span>
                    </td>

                    {/* Entidade */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <EntityIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.entity}</p>
                          {log.entity_name && (
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">{log.entity_name}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[260px] truncate">
                        {log.description}
                      </p>
                    </td>

                    {/* Nível */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('px-2.5 py-1 text-[8px] font-black uppercase rounded-lg', lvl.badge)}>
                        {lvl.label}
                      </span>
                    </td>

                    {/* JSON */}
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setSelectedLog(log)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-yellow-100 hover:text-yellow-700 transition-all active:scale-95"
                        title="Ver objeto completo">
                        <FileJson className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-700 text-[9px] text-slate-400 font-bold flex items-center justify-between">
          <span>{filtered.length} de {logs.length} evento(s) — período: {dateStart} → {dateEnd}</span>
          <span className="flex items-center gap-1 text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Realtime ativo
          </span>
        </div>
      </div>

      {/* ══ MODAL: JSON DETALHADO ════════════════════════════════════════════ */}
      {selectedLog && (
        <div role="dialog" aria-modal="true" aria-label="Detalhes do evento"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">

            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-400 rounded-2xl shadow-lg">
                  <FileJson className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Objeto do Evento</h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5">
                    {selectedLog.action} · {selectedLog.entity} · {fmtDate(selectedLog.created_at)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-emerald-400 bg-black/30 p-6 rounded-2xl border border-white/5 text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="p-5 border-t border-white/10 bg-white/[0.02] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white/40 font-bold text-xs">
                  <User className="w-4 h-4" /> {selectedLog.user_name} · {fmtDate(selectedLog.created_at)}
                </div>
                {(() => {
                  const lvl = LEVEL_CFG[selectedLog.level] || LEVEL_CFG.INFO;
                  return (
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', lvl.dot)} />
                      <span className={cn('text-[8px] font-black uppercase', lvl.statusText)}>{lvl.statusLabel}</span>
                    </div>
                  );
                })()}
              </div>
              <button onClick={() => setSelectedLog(null)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
