import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  Download,
  FileText,
  UserCheck,
  PackageX,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte 'DD/MM/YYYY HH:mm' → Date (para comparação correta) */
function _parseDateBR(str) {
  if (!str) return null;
  const [datePart, timePart = '00:00'] = str.split(' ');
  const [d, m, y] = datePart.split('/');
  return new Date(`${y}-${m}-${d}T${timePart}:00`);
}

/** Exporta array de objetos como CSV e dispara download */
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Datas em ISO 8601 para comparação correta; exibição converte depois.
const SECURITY_LOGS = [
  { id: 'LOG-9921', isoDate: '2026-02-22T03:45:12', date: '22/02/2026 03:45',  user: 'DANILO',        level: 'INFO',     opId: 'USER_LOGIN',       description: 'Autenticação bem sucedida via Desktop-WMS',                          details: { ip: '192.168.1.42',     browser: 'Chrome 122', os: 'Windows 11' } },
  { id: 'LOG-9925', isoDate: '2026-02-22T03:20:05', date: '22/02/2026 03:20',  user: 'MATHEUS',       level: 'CRITICAL', opId: 'DB_BACKUP_FAIL',   description: 'Falha durante tentativa de backup automático',                        details: { error: 'Disk Quota Exceeded', mount: '/mnt/storage/backups', retry: 3 } },
  { id: 'LOG-9930', isoDate: '2026-02-22T02:55:40', date: '22/02/2026 02:55',  user: 'THIAGO',        level: 'WARNING',  opId: 'PERM_CHANGED',     description: 'Alteração de nível de acesso para o grupo "Separadores"',            details: { changedBy: 'Admin', affectedGroup: 'Picking', oldLevel: 2, newLevel: 4 } },
  { id: 'LOG-9935', isoDate: '2026-02-22T01:15:22', date: '22/02/2026 01:15',  user: 'SYSTEM_DAEMON', level: 'INFO',     opId: 'API_SYNC_SUCCESS', description: 'Sincronização com ERP Omie finalizada - 45 Pedidos importados',       details: { orders: 45, duration: '12s', provider: 'Omie API v4' } },
];

const PICKING_ERRORS = [
  { id: 1, separator: 'DANILO',  conferee: 'MATHEUS', isoDate: '2026-02-22T00:30', date: '22/02/2026 00:30', order: 'SO-8842', task: 'PICK-552', sku: 'VEPEL-BPI-174FX',  product: 'Barreira de Proteção Infravermelha',  expected: 10, collected: 8,  severity: 'SEVERE' },
  { id: 2, separator: 'THIAGO',  conferee: 'DANILO',  isoDate: '2026-02-21T23:45', date: '21/02/2026 23:45', order: 'SO-8845', task: 'PICK-558', sku: 'VPER-ESS-NY-27MM', product: 'Escova de Segurança (Nylon 27mm)',      expected: 5,  collected: 4,  severity: 'MEDIUM' },
  { id: 3, separator: 'MATHEUS', conferee: 'THIAGO',  isoDate: '2026-02-21T21:10', date: '21/02/2026 21:10', order: 'SO-8850', task: 'PICK-562', sku: 'VPER-PAL-INO-1000',product: 'Pallet de Aço Inox (1000mm)',          expected: 12, collected: 15, severity: 'SEVERE' },
  { id: 4, separator: 'DANILO',  conferee: 'THIAGO',  isoDate: '2026-02-21T18:30', date: '21/02/2026 18:30', order: 'SO-8861', task: 'PICK-570', sku: 'VPER-INC-ESQ',     product: 'InnerCap (Esquerdo) - VERTICALPARTS', expected: 2,  collected: 1,  severity: 'LOW'    },
];

// Separadores e conferentes únicos para os selects (derivados dos dados)
const SEPARADORES  = [...new Set(PICKING_ERRORS.map(e => e.separator))].sort();
const CONFERENTES  = [...new Set(PICKING_ERRORS.map(e => e.conferee))].sort();

// ─── Config de nível de log ────────────────────────────────────────────────────
const LEVEL_CFG = {
  CRITICAL: { badge: 'bg-red-100 text-red-700 border border-red-200',    label: 'CRÍTICO',  statusDot: 'bg-red-500',    statusText: 'text-red-400',    statusLabel: 'Crítico — requer atenção' },
  WARNING:  { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'AVISO',  statusDot: 'bg-amber-500',  statusText: 'text-amber-400',  statusLabel: 'Aviso registrado' },
  INFO:     { badge: 'bg-blue-100 text-blue-700 border border-blue-200',   label: 'INFO',    statusDot: 'bg-green-500',  statusText: 'text-green-400',  statusLabel: 'Registrado com sucesso' },
};

const SEVERITY_CFG = {
  SEVERE: { badge: 'bg-red-600 text-white border-red-600',                 label: 'GRAVE'  },
  MEDIUM: { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'MÉDIO'  },
  LOW:    { badge: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'LEVE'   },
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AuditLogs() {
  const [activeTab,         setActiveTab]         = useState('SECURITY');

  // ── Estado filtros de Segurança ───────────────────────────────────────────
  const [secSearch,         setSecSearch]         = useState('');
  const [secDateStart,      setSecDateStart]      = useState('2026-02-21');
  const [secDateEnd,        setSecDateEnd]        = useState('2026-02-22');
  const [showPeriodModal,   setShowPeriodModal]   = useState(false);
  // tempDateRange armazena o rascunho antes de aplicar
  const [tempStart,         setTempStart]         = useState('2026-02-21');
  const [tempEnd,           setTempEnd]           = useState('2026-02-22');

  // ── Estado filtros de Separação ───────────────────────────────────────────
  const [showParamsModal,   setShowParamsModal]   = useState(false);
  const [pickParams,        setPickParams]        = useState({ separator: '', conferee: '', order: '', dateStart: '', dateEnd: '', severity: '' });
  const [tempPickParams,    setTempPickParams]    = useState({ separator: '', conferee: '', order: '', dateStart: '', dateEnd: '', severity: '' });

  // ── Modal de detalhes ─────────────────────────────────────────────────────
  const [selectedLog,       setSelectedLog]       = useState(null);

  // ─── Filtros Logs de Segurança ────────────────────────────────────────────
  const secLogs = useMemo(() => {
    const q = secSearch.trim().toLowerCase();
    const startDate = secDateStart ? new Date(secDateStart + 'T00:00:00') : null;
    const endDate   = secDateEnd   ? new Date(secDateEnd   + 'T23:59:59') : null;

    return SECURITY_LOGS.filter(log => {
      const logDate = new Date(log.isoDate);
      if (startDate && logDate < startDate) return false;
      if (endDate   && logDate > endDate)   return false;
      if (q && !log.user.toLowerCase().includes(q) &&
               !log.description.toLowerCase().includes(q) &&
               !log.opId.toLowerCase().includes(q) &&
               !log.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [secSearch, secDateStart, secDateEnd]);

  // ─── Filtros Erros de Separação ───────────────────────────────────────────
  const pickErrors = useMemo(() => {
    const { separator, conferee, order, dateStart, dateEnd, severity } = pickParams;
    const startDate = dateStart ? new Date(dateStart + 'T00:00:00') : null;
    const endDate   = dateEnd   ? new Date(dateEnd   + 'T23:59:59') : null;

    return PICKING_ERRORS.filter(err => {
      const errDate = new Date(err.isoDate);
      if (separator && err.separator !== separator) return false;
      if (conferee  && err.conferee  !== conferee)  return false;
      if (severity  && err.severity  !== severity)  return false;
      if (order  && !err.order.toLowerCase().includes(order.toLowerCase())) return false;
      if (startDate && errDate < startDate) return false;
      if (endDate   && errDate > endDate)   return false;
      return true;
    });
  }, [pickParams]);

  // ─── KPIs derivados dos dados FILTRADOS ───────────────────────────────────
  const totalDivergencias = pickErrors.length;
  // Índice = erros / total de operações mock (500 = base simulada declarada)
  const TOTAL_OPERACOES_MOCK = 500;
  const indiceErro = ((totalDivergencias / TOTAL_OPERACOES_MOCK) * 100).toFixed(1);

  // ─── Export CSV Segurança ─────────────────────────────────────────────────
  const exportSecCSV = () => {
    const rows = secLogs.map(l => ({
      id: l.id, data: l.date, usuario: l.user, nivel: l.level, operacao: l.opId, descricao: l.description,
    }));
    exportCSV(`audit_seguranca_${secDateStart}_${secDateEnd}.csv`, rows);
  };

  // ─── Export CSV Separação ─────────────────────────────────────────────────
  const exportPickCSV = () => {
    const rows = pickErrors.map(e => ({
      id: e.id, data: e.date, separador: e.separator, conferente: e.conferee,
      pedido: e.order, tarefa: e.task, sku: e.sku, produto: e.product,
      esperado: e.expected, coletado: e.collected, gravidade: e.severity,
    }));
    exportCSV(`audit_separacao.csv`, rows);
  };

  // ─── Aplicar filtro de período (Security) ─────────────────────────────────
  const applyPeriod = () => {
    setSecDateStart(tempStart);
    setSecDateEnd(tempEnd);
    setShowPeriodModal(false);
  };

  const openPeriodModal = () => {
    setTempStart(secDateStart);
    setTempEnd(secDateEnd);
    setShowPeriodModal(true);
  };

  // ─── Aplicar / Limpar filtros de Picking ──────────────────────────────────
  const applyPickParams = () => {
    setPickParams({ ...tempPickParams });
    setShowParamsModal(false);
  };

  const clearPickParams = () => {
    const empty = { separator: '', conferee: '', order: '', dateStart: '', dateEnd: '', severity: '' };
    setTempPickParams(empty);
  };

  const hasActivePickFilter = Object.values(pickParams).some(Boolean);

  // ─── Modal detail ─────────────────────────────────────────────────────────
  const handleViewDetails = (log) => setSelectedLog(log);

  return (
    <div className="space-y-6">
      {/* ══ CABEÇALHO ════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400" aria-hidden="true" /> 8.4 Centro de Auditoria & Logs
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Rastreabilidade total das operações do VerticalParts WMS</p>
        </div>

        {/* Abas */}
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm" role="tablist">
          {[
            { id: 'SECURITY', label: 'Log de Segurança',  Icon: ShieldCheck },
            { id: 'PICKING',  label: 'Erros de Separação', Icon: AlertTriangle },
          ].map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn('px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2',
                activeTab === id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'
              )}>
              <Icon className="w-4 h-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ ABA 1: LOG DE SEGURANÇA ══════════════════════════════════════════ */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Período — mostra datas ativas */}
              <button onClick={openPeriodModal}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                {secDateStart} → {secDateEnd}
              </button>

              {/* Export CSV funcional */}
              <button onClick={exportSecCSV}
                title={`Exportar ${secLogs.length} log(s) como CSV`}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Download className="w-4 h-4" aria-hidden="true" /> Exportar CSV
              </button>
            </div>

            {/* Busca controlada */}
            <div className="relative">
              <input
                type="text"
                value={secSearch}
                onChange={e => setSecSearch(e.target.value)}
                placeholder="Pesquisar por usuário, operação ou descrição..."
                aria-label="Buscar logs de segurança"
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-300 w-72 transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              {secSearch && (
                <button onClick={() => setSecSearch('')} aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" role="grid">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Data e Hora</th>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4 text-center">Nível</th>
                    <th className="px-6 py-4">ID Operação</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">JSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {secLogs.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Nenhum log encontrado para os filtros aplicados.
                    </td></tr>
                  )}
                  {secLogs.map(log => {
                    const lvl = LEVEL_CFG[log.level] || LEVEL_CFG.INFO;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500">
                            <Clock className="w-3 h-3" aria-hidden="true" /> {log.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            </div>
                            <span className="font-black text-xs text-slate-700 dark:text-slate-200 uppercase">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn('px-2.5 py-1 text-[8px] font-black uppercase rounded-lg', lvl.badge)}>
                            {lvl.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[10px] text-slate-400 tracking-tighter font-mono">#{log.opId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[280px]">{log.description}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleViewDetails(log)}
                            aria-label={`Ver detalhes de ${log.id}`}
                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-yellow-100 hover:text-yellow-700 transition-all active:scale-95">
                            <FileJson className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-700 text-[9px] text-slate-400 font-bold">
              {secLogs.length} de {SECURITY_LOGS.length} log(s) exibido(s)
            </div>
          </div>
        </div>
      )}

      {/* ══ ABA 2: ERROS DE SEPARAÇÃO ════════════════════════════════════════ */}
      {activeTab === 'PICKING' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => { setTempPickParams({ ...pickParams }); setShowParamsModal(true); }}
                className={cn('px-4 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm',
                  hasActivePickFilter ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                )}>
                <Filter className="w-4 h-4" aria-hidden="true" />
                Parâmetros de Filtro {hasActivePickFilter && '●'}
              </button>

              {hasActivePickFilter && (
                <button onClick={() => setPickParams({ separator: '', conferee: '', order: '', dateStart: '', dateEnd: '', severity: '' })}
                  className="px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpar filtros
                </button>
              )}

              {/* Export CSV Picking funcional */}
              <button onClick={exportPickCSV}
                title={`Exportar ${pickErrors.length} erro(s) como CSV`}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Download className="w-4 h-4" aria-hidden="true" /> Exportar Analítico
              </button>
            </div>

            {/* KPIs derivados dos dados filtrados */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-center px-4 border-r border-slate-100 dark:border-slate-700">
                <p className="text-[8px] font-black text-slate-400 uppercase">Divergências</p>
                <p className="text-sm font-black text-red-600">{totalDivergencias}</p>
              </div>
              <div className="text-center px-4 border-r border-slate-100 dark:border-slate-700">
                <p className="text-[8px] font-black text-slate-400 uppercase">Índice Erro</p>
                <p className="text-sm font-black text-slate-700 dark:text-white">{indiceErro}%</p>
                <p className="text-[7px] text-slate-300">base: {TOTAL_OPERACOES_MOCK} ops</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[8px] font-black text-slate-400 uppercase">Graves</p>
                <p className="text-sm font-black text-red-600">{pickErrors.filter(e => e.severity === 'SEVERE').length}</p>
              </div>
            </div>
          </div>

          {/* Grid Erros */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" role="grid">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Separador / Conferente</th>
                    <th className="px-6 py-4">Data Operação</th>
                    <th className="px-6 py-4">Pedido / Tarefa</th>
                    <th className="px-6 py-4">Cod. / Produto</th>
                    <th className="px-6 py-4 text-center">Esp. / Col.</th>
                    <th className="px-6 py-4 text-right">Gravidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {pickErrors.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Nenhum erro para os filtros aplicados.
                    </td></tr>
                  )}
                  {pickErrors.map(err => {
                    const sev = SEVERITY_CFG[err.severity] || SEVERITY_CFG.LOW;
                    const isOver = err.collected > err.expected;
                    return (
                      <tr key={err.id} className={cn('hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all',
                        err.severity === 'SEVERE' && 'bg-red-50/30 dark:bg-red-950/10')}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="font-black text-xs uppercase text-slate-700 dark:text-slate-200">{err.separator}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Conf: {err.conferee}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500">{err.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-xs text-blue-600">{err.order}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{err.task}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={cn('font-black text-xs', err.severity === 'SEVERE' ? 'text-red-600' : 'text-slate-700 dark:text-slate-200')}>{err.product}</span>
                            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{err.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{err.expected} UN esperado</span>
                            <span className={cn('text-[11px] font-black px-2 py-0.5 rounded',
                              isOver ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700')}>
                              {err.collected} UN coletado {isOver ? '▲' : '▼'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn('px-2 py-1 text-[8px] font-black uppercase rounded-lg', sev.badge)}>
                            {sev.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-700 text-[9px] text-slate-400 font-bold">
              {pickErrors.length} de {PICKING_ERRORS.length} erro(s) exibido(s)
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: PERÍODO ═══════════════════════════════════════════════════ */}
      {showPeriodModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="period-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 id="period-title" className="text-xl font-black text-slate-800 dark:text-white">Selecionar Período</h3>
              <button onClick={() => setShowPeriodModal(false)} aria-label="Fechar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="sec-date-start" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data Inicial</label>
                <input id="sec-date-start" type="date" value={tempStart} onChange={e => setTempStart(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-400 transition-all" />
              </div>
              <div className="space-y-1">
                <label htmlFor="sec-date-end" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data Final</label>
                <input id="sec-date-end" type="date" value={tempEnd} onChange={e => setTempEnd(e.target.value)}
                  min={tempStart}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-400 transition-all" />
              </div>
            </div>
            <button onClick={applyPeriod}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" aria-hidden="true" /> Aplicar Filtro
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL: PARÂMETROS ANALÍTICOS ════════════════════════════════════ */}
      {showParamsModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="params-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400" />
            <div className="flex items-center justify-between mb-6">
              <h3 id="params-title" className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Filter className="w-5 h-5" aria-hidden="true" /> Parâmetros Analíticos
              </h3>
              <button onClick={() => setShowParamsModal(false)} aria-label="Fechar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-8">
              {/* Pedido de Venda */}
              <div className="space-y-1">
                <label htmlFor="pick-order" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pedido de Venda</label>
                <input id="pick-order" type="text" placeholder="SO-0000..."
                  value={tempPickParams.order}
                  onChange={e => setTempPickParams(p => ({ ...p, order: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none focus:ring-1 focus:ring-yellow-300 transition-all" />
              </div>

              {/* Gravidade */}
              <div className="space-y-1">
                <label htmlFor="pick-severity" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Gravidade</label>
                <select id="pick-severity" value={tempPickParams.severity}
                  onChange={e => setTempPickParams(p => ({ ...p, severity: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all appearance-none">
                  <option value="">Todas</option>
                  <option value="SEVERE">GRAVE</option>
                  <option value="MEDIUM">MÉDIO</option>
                  <option value="LOW">LEVE</option>
                </select>
              </div>

              {/* Separador */}
              <div className="space-y-1">
                <label htmlFor="pick-sep" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Separador</label>
                <select id="pick-sep" value={tempPickParams.separator}
                  onChange={e => setTempPickParams(p => ({ ...p, separator: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all appearance-none">
                  <option value="">Todos</option>
                  {SEPARADORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Conferente */}
              <div className="space-y-1">
                <label htmlFor="pick-conf" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conferente</label>
                <select id="pick-conf" value={tempPickParams.conferee}
                  onChange={e => setTempPickParams(p => ({ ...p, conferee: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all appearance-none">
                  <option value="">Todos</option>
                  {CONFERENTES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Data Início */}
              <div className="space-y-1">
                <label htmlFor="pick-date-start" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data Início</label>
                <input id="pick-date-start" type="date" value={tempPickParams.dateStart}
                  onChange={e => setTempPickParams(p => ({ ...p, dateStart: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all" />
              </div>

              {/* Data Fim */}
              <div className="space-y-1">
                <label htmlFor="pick-date-end" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data Fim</label>
                <input id="pick-date-end" type="date" value={tempPickParams.dateEnd}
                  min={tempPickParams.dateStart}
                  onChange={e => setTempPickParams(p => ({ ...p, dateEnd: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-4">
              {/* Limpar — realmente limpa o formulário */}
              <button onClick={clearPickParams}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">
                Limpar
              </button>
              <button onClick={applyPickParams}
                className="flex-[2] py-4 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-md">
                Visualizar Relatório Analítico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: DETALHES JSON ═════════════════════════════════════════════ */}
      {selectedLog && (
        <div role="dialog" aria-modal="true" aria-labelledby="detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">

            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-400 rounded-2xl shadow-lg">
                  <FileJson className="w-5 h-5 text-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="detail-title" className="text-lg font-black text-white">Objeto da Transação</h3>
                  {/* Log ID — sem fingir que é hash criptográfico */}
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5">Log ID: {selectedLog.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} aria-label="Fechar detalhes"
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <pre className="text-emerald-400 bg-black/30 p-6 rounded-2xl border border-white/5 text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/[0.02] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white/40 font-bold text-xs">
                  <Clock className="w-4 h-4" aria-hidden="true" /> {selectedLog.user} · {selectedLog.date}
                </div>
                {/* Status real baseado no nível do log — não hardcoded "Verificado" */}
                {selectedLog.level && (() => {
                  const lvl = LEVEL_CFG[selectedLog.level] || LEVEL_CFG.INFO;
                  return (
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', lvl.statusDot)} aria-hidden="true" />
                      <span className={cn('text-[8px] font-black uppercase', lvl.statusText)}>{lvl.statusLabel}</span>
                    </div>
                  );
                })()}
              </div>
              <button onClick={() => setSelectedLog(null)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all">
                Fechar Objeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
